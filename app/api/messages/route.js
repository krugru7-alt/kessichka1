import { neon } from "@neondatabase/serverless";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";


/* =====================================================
   NEON
===================================================== */

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
   ПОСЛЕДНИЕ ПОСЛАНИЯ
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
          drawing_image,
          created_at

        FROM kessi_messages

        ORDER BY
          created_at DESC

        LIMIT 12
      `;


    /*
      Получаем новые первыми,
      на экране разворачиваем
      в нормальный порядок.
    */

    const messages =
      rows
        .map(
          normalizeMessage
        )
        .reverse();


    return Response.json(
      {

        ok:
          true,


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
   ТЕКСТ ИЛИ РИСУНОК
===================================================== */

export async function POST(
  request
) {

  try {

    const sql =
      getSql();


    const body =
      await request.json();



    /* ===============================================
       ОТПРАВИТЕЛЬ
    =============================================== */

    const sender =
      String(
        body?.sender ||
        ""
      ).trim();


    if (
      !ALLOWED_SENDERS.includes(
        sender
      )
    ) {

      return Response.json(
        {

          ok:
            false,


          error:
            "Некорректный отправитель",

        },
        {

          status:
            400,

        }
      );

    }



    /* ===============================================
       ТЕКСТ
    =============================================== */

    const message =
      String(
        body?.message ||
        ""
      )
        .trim()
        .slice(
          0,
          180
        );



    /* ===============================================
       РИСУНОК
    =============================================== */

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


    /*
      Ограничение, чтобы случайно
      не отправить огромную картинку.
    */

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



    /* ===============================================
       ДОЛЖЕН БЫТЬ ХОТЯ БЫ ТЕКСТ ИЛИ РИСУНОК
    =============================================== */

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



    /* ===============================================
       СОХРАНЯЕМ
    =============================================== */

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
      "Ошибка сохранения послания:",
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
