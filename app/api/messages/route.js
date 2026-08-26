import { neon } from "@neondatabase/serverless";

import {
  getSession,
} from "../../lib/auth";


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



/* =====================================================
   ТАБЛИЦА
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


  await sql`
    ALTER TABLE kessi_messages
    ADD COLUMN IF NOT EXISTS drawing_image TEXT
  `;
}



/* =====================================================
   ФОРМАТ
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
      row.drawing_image || null,

    createdAt:
      row.created_at,

  };
}



/* =====================================================
   НЕТ СЕССИИ
===================================================== */

function unauthorized() {

  return Response.json(
    {

      ok:
        false,

      error:
        "Нужно войти в Наш мирок",

    },
    {

      status:
        401,

      headers: {

        "Cache-Control":
          "no-store",

      },

    }
  );
}



/* =====================================================
   GET
===================================================== */

export async function GET() {

  try {

    const session =
      await getSession();


    if (!session) {

      return unauthorized();

    }


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

        ok:
          true,

        viewer:
          session.user,

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

        ok:
          false,

        error:
          "Не удалось получить послания",

      },
      {

        status:
          500,

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

    const session =
      await getSession();


    if (!session) {

      return unauthorized();

    }


    const sql =
      getSql();


    await ensureTable(
      sql
    );


    const body =
      await request.json();


    /*
      ВАЖНО:

      sender больше вообще
      не принимаем от браузера.

      Автор определяется
      исключительно cookie.
    */

    const sender =
      session.user;


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
        body?.drawingImage || ""
      ).trim();


    if (
      drawingImage &&
      !drawingImage.startsWith(
        "data:image/"
      )
    ) {

      return Response.json(
        {

          ok:
            false,

          error:
            "Некорректный рисунок",

        },
        {

          status:
            400,

        }
      );

    }


    if (
      drawingImage.length >
      700000
    ) {

      return Response.json(
        {

          ok:
            false,

          error:
            "Рисунок слишком большой",

        },
        {

          status:
            400,

        }
      );

    }


    if (
      !message &&
      !drawingImage
    ) {

      return Response.json(
        {

          ok:
            false,

          error:
            "Послание пустое",

        },
        {

          status:
            400,

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

      ok:
        true,

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

        ok:
          false,

        error:
          "Не удалось оставить послание",

      },
      {

        status:
          500,

      }
    );

  }
}



/* =====================================================
   DELETE
   ТОЛЬКО СВОЁ ПОСЛАНИЕ
===================================================== */

export async function DELETE(
  request
) {

  try {

    const session =
      await getSession();


    if (!session) {

      return unauthorized();

    }


    const sql =
      getSql();


    await ensureTable(
      sql
    );


    const body =
      await request.json();


    const id =
      Number(
        body?.id
      );


    if (
      !Number.isInteger(
        id
      ) ||
      id <= 0
    ) {

      return Response.json(
        {

          ok:
            false,

          error:
            "Некорректное послание",

        },
        {

          status:
            400,

        }
      );

    }


    /*
      Даже если через консоль
      подставить чужой ID,
      удалить его нельзя.

      sender берётся из cookie.
    */

    const rows =
      await sql`
        DELETE FROM kessi_messages

        WHERE
          id = ${id}
          AND sender = ${session.user}

        RETURNING id
      `;


    if (
      rows.length === 0
    ) {

      return Response.json(
        {

          ok:
            false,

          error:
            "Можно удалить только своё послание",

        },
        {

          status:
            403,

        }
      );

    }


    return Response.json({

      ok:
        true,

      deletedId:
        id,

    });


  } catch (error) {

    console.error(
      "DELETE /api/messages:",
      error
    );


    return Response.json(
      {

        ok:
          false,

        error:
          "Не удалось удалить послание",

      },
      {

        status:
          500,

      }
    );

  }
}
