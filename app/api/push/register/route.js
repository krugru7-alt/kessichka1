import { neon } from "@neondatabase/serverless";
import { getSession } from "../../../lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


function getSql() {

  const databaseUrl =
    process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL не найден"
    );
  }

  return neon(databaseUrl);
}


async function ensureTable(sql) {

  await sql`
    CREATE TABLE IF NOT EXISTS world_push_subscriptions (
      id BIGSERIAL PRIMARY KEY,

      user_name TEXT NOT NULL,

      endpoint TEXT NOT NULL UNIQUE,

      p256dh TEXT NOT NULL,

      auth TEXT NOT NULL,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

}



export async function POST(request) {

  try {

    const session =
      await getSession();


    if (!session) {

      return Response.json(
        {
          ok: false,
          error:
            "Нужно войти в Наш мирок",
        },
        {
          status: 401,
        }
      );

    }


    const body =
      await request.json();


    const endpoint =
      String(
        body?.endpoint || ""
      ).trim();


    const p256dh =
      String(
        body?.keys?.p256dh || ""
      ).trim();


    const auth =
      String(
        body?.keys?.auth || ""
      ).trim();


    if (
      !endpoint ||
      !p256dh ||
      !auth
    ) {

      return Response.json(
        {
          ok: false,
          error:
            "Некорректная Push-подписка",
        },
        {
          status: 400,
        }
      );

    }


    const sql =
      getSql();


    await ensureTable(
      sql
    );


    await sql`
      INSERT INTO world_push_subscriptions (
        user_name,
        endpoint,
        p256dh,
        auth,
        created_at,
        updated_at
      )

      VALUES (
        ${session.user},
        ${endpoint},
        ${p256dh},
        ${auth},
        NOW(),
        NOW()
      )

      ON CONFLICT (endpoint)

      DO UPDATE SET

        user_name =
          EXCLUDED.user_name,

        p256dh =
          EXCLUDED.p256dh,

        auth =
          EXCLUDED.auth,

        updated_at =
          NOW()
    `;


    return Response.json({
      ok: true,
      user: session.user,
    });


  } catch (error) {

    console.error(
      "POST /api/push/register:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          error?.message ||
          "Не удалось зарегистрировать устройство",
      },
      {
        status: 500,
      }
    );

  }

}
