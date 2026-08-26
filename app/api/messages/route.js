import { neon } from "@neondatabase/serverless";

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


const ALLOWED_SENDERS = [
  "obsid",
  "kessi",
];


function normalizeMessage(row) {
  return {
    id:
      Number(row.id),

    sender:
      row.sender,

    message:
      row.message,

    createdAt:
      row.created_at,
  };
}


/* =====================================================
   ПОЛУЧИТЬ ПОСЛЕДНИЕ ПОСЛАНИЯ
===================================================== */

export async function GET() {
  try {
    const sql =
      getSql();


    const rows =
      await sql`
        SELECT
          id,
          sender,
          message,
          created_at

        FROM kessi_messages

        ORDER BY
          created_at DESC

        LIMIT 8
      `;


    /*
      В базе получаем от новых к старым,
      а на экране показываем по порядку.
    */

    const messages =
      rows
        .map(
          normalizeMessage
        )
        .reverse();


    return Response.json(
      {
        ok: true,
        messages,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );

  } catch (error) {
    console.error(
      "Ошибка получения посланий:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          "Не удалось получить послания",
      },
      {
        status: 500,
      }
    );
  }
}


/* =====================================================
   ОСТАВИТЬ ПОСЛАНИЕ
===================================================== */

export async function POST(
  request
) {
  try {
    const sql =
      getSql();


    const body =
      await request.json();


    const sender =
      String(
        body?.sender || ""
      ).trim();


    const message =
      String(
        body?.message || ""
      )
        .trim()
        .slice(
          0,
          180
        );


    if (
      !ALLOWED_SENDERS.includes(
        sender
      )
    ) {
      return Response.json(
        {
          ok: false,

          error:
            "Некорректный отправитель",
        },
        {
          status: 400,
        }
      );
    }


    if (!message) {
      return Response.json(
        {
          ok: false,

          error:
            "Послание пустое",
        },
        {
          status: 400,
        }
      );
    }


    const rows =
      await sql`
        INSERT INTO kessi_messages (
          sender,
          message,
          created_at
        )

        VALUES (
          ${sender},
          ${message},
          NOW()
        )

        RETURNING
          id,
          sender,
          message,
          created_at
      `;


    return Response.json({
      ok: true,

      message:
        normalizeMessage(
          rows[0]
        ),
    });

  } catch (error) {
    console.error(
      "Ошибка сохранения послания:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          "Не удалось оставить послание",
      },
      {
        status: 500,
      }
    );
  }
}
