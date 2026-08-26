import { neon } from "@neondatabase/serverless";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";


function getSql() {
  const databaseUrl =
    process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL не найден"
    );
  }

  return neon(
    databaseUrl
  );
}


const ALLOWED_SENDERS = [
  "obsid",
  "kessi",
];


/* =====================================================
   ПРОВЕРЯЕМ СТРУКТУРУ ТАБЛИЦЫ
===================================================== */

async function ensureTable(
  sql
) {
  await sql`
    CREATE TABLE IF NOT EXISTS kessi_messages (
      id BIGSERIAL PRIMARY KEY,
      sender TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      drawing_image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;


  /*
    Если таблица была создана раньше
    без рисунков — просто добавляем поле.
  */

  await sql`
    ALTER TABLE kessi_messages
    ADD COLUMN IF NOT EXISTS drawing_image TEXT
  `;
}


/* =====================================================
   НОРМАЛИЗАЦИЯ
===================================================== */

function normalizeMessage(
  row
) {
  return {
    id:
      Number(
        row.id
      ),

    sender:
      row.sender,

    message:
      row.message || "",

    drawingImage:
      row.drawing_image ||
      null,

    createdAt:
      row.created_at,
  };
}


/* =====================================================
   GET
===================================================== */

export async function GET() {
  try {
    const sql =
      getSql();


    await ensureTable(
      sql
    );


    const rows =
      await sql`
        SELECT
          id,
          sender,
          message,
          drawing_image,
          created_at

        FROM kessi_messages

        ORDER BY
          created_at DESC

        LIMIT 12
      `;


    return Response.json(
      {
        ok: true,

        messages:
          rows
            .map(
              normalizeMessage
            )
            .reverse(),
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
      "GET /api/messages:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          "Не удалось получить послания",

        details:
          process.env.NODE_ENV ===
          "development"
            ? String(
                error?.message ||
                error
              )
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}


/* =====================================================
   POST
===================================================== */

export async function POST(
  request
) {
  try {
    const sql =
      getSql();


    await ensureTable(
      sql
    );


    const body =
      await request.json();


    const sender =
      String(
        body?.sender || ""
      ).trim();


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


    const message =
      String(
        body?.message || ""
      )
        .trim()
        .slice(
          0,
          180
        );


    const drawingImage =
      String(
        body?.drawingImage ||
        ""
      ).trim();


    if (
      drawingImage &&
      !drawingImage.startsWith(
        "data:image/"
      )
    ) {
      return Response.json(
        {
          ok: false,

          error:
            "Некорректный рисунок",
        },
        {
          status: 400,
        }
      );
    }


    /*
      Не даём отправить слишком
      тяжёлую картинку.
    */

    if (
      drawingImage.length >
      700000
    ) {
      return Response.json(
        {
          ok: false,

          error:
            "Рисунок слишком большой",
        },
        {
          status: 400,
        }
      );
    }


    if (
      !message &&
      !drawingImage
    ) {
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
          drawing_image,
          created_at
        )

        VALUES (
          ${sender},
          ${message},
          ${drawingImage || null},
          NOW()
        )

        RETURNING
          id,
          sender,
          message,
          drawing_image,
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
      "POST /api/messages:",
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
