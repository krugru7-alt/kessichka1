import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


/* =====================================================
   ПОДКЛЮЧЕНИЕ К NEON
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


/* =====================================================
   НОРМАЛИЗАЦИЯ ПОДПИСИ
===================================================== */

function normalizeRow(row) {
  return {
    documentId:
      row.document_id,

    image:
      row.signature_image,

    signedAt:
      row.signed_at,

    x:
      Number(
        row.x
      ),

    y:
      Number(
        row.y
      ),

    width:
      Number(
        row.width
      ),

    updatedAt:
      row.updated_at,
  };
}


/* =====================================================
   ЗАПИСЬ СОБЫТИЯ В ЖУРНАЛ
===================================================== */

async function addEvent(
  sql,
  documentId,
  eventType
) {
  await sql`
    INSERT INTO chancery_events (
      document_id,
      event_type,
      created_at
    )

    VALUES (
      ${documentId},
      ${eventType},
      NOW()
    )
  `;
}


/* =====================================================
   GET
   ПОЛУЧИТЬ ВСЕ ПОДПИСИ
===================================================== */

export async function GET() {
  try {
    const sql =
      getSql();


    const rows =
      await sql`
        SELECT
          document_id,
          signature_image,
          signed_at,
          x,
          y,
          width,
          updated_at

        FROM chancery_signatures

        ORDER BY
          updated_at DESC
      `;


    return Response.json(
      {
        ok: true,

        signatures:
          rows.map(
            normalizeRow
          ),
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
      "Ошибка получения подписей:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          "Не удалось получить подписи",
      },
      {
        status: 500,
      }
    );
  }
}


/* =====================================================
   POST
   СОХРАНИТЬ / ОБНОВИТЬ ПОДПИСЬ
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
       DOCUMENT ID
    =============================================== */

    const documentId =
      String(
        body?.documentId ||
        ""
      ).trim();


    if (!documentId) {
      return Response.json(
        {
          ok: false,

          error:
            "documentId не указан",
        },
        {
          status: 400,
        }
      );
    }


    /* ===============================================
       ПОДПИСЬ
    =============================================== */

    const image =
      String(
        body?.image ||
        ""
      ).trim();


    if (
      !image.startsWith(
        "data:image/"
      )
    ) {
      return Response.json(
        {
          ok: false,

          error:
            "Некорректная подпись",
        },
        {
          status: 400,
        }
      );
    }


    /* ===============================================
       КООРДИНАТЫ
    =============================================== */

    const rawX =
      Number(
        body?.x
      );


    const rawY =
      Number(
        body?.y
      );


    const rawWidth =
      Number(
        body?.width
      );


    const x =
      Number.isFinite(
        rawX
      )
        ? Math.max(
            0,
            Math.min(
              100,
              rawX
            )
          )
        : 50;


    const y =
      Number.isFinite(
        rawY
      )
        ? Math.max(
            0,
            Math.min(
              100,
              rawY
            )
          )
        : 86;


    const width =
      Number.isFinite(
        rawWidth
      )
        ? Math.max(
            10,
            Math.min(
              60,
              rawWidth
            )
          )
        : 27;


    /* ===============================================
       ДАТА ПОДПИСИ
    =============================================== */

    let signedAt =
      new Date();


    if (
      body?.signedAt
    ) {
      const parsed =
        new Date(
          body.signedAt
        );


      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
        return Response.json(
          {
            ok: false,

            error:
              "Некорректная дата",
          },
          {
            status: 400,
          }
        );
      }


      signedAt =
        parsed;
    }


    /* ===============================================
       ПРОВЕРЯЕМ:
       ПОДПИСЬ НОВАЯ ИЛИ УЖЕ СУЩЕСТВУЕТ
    =============================================== */

    const existing =
      await sql`
        SELECT
          document_id

        FROM
          chancery_signatures

        WHERE
          document_id =
            ${documentId}

        LIMIT 1
      `;


    const alreadyExists =
      existing.length > 0;


    /* ===============================================
       СОХРАНЯЕМ
    =============================================== */

    const rows =
      await sql`
        INSERT INTO chancery_signatures (
          document_id,
          signature_image,
          signed_at,
          x,
          y,
          width,
          updated_at
        )

        VALUES (
          ${documentId},
          ${image},
          ${signedAt.toISOString()},
          ${x},
          ${y},
          ${width},
          NOW()
        )

        ON CONFLICT (
          document_id
        )

        DO UPDATE SET

          signature_image =
            EXCLUDED.signature_image,

          signed_at =
            EXCLUDED.signed_at,

          x =
            EXCLUDED.x,

          y =
            EXCLUDED.y,

          width =
            EXCLUDED.width,

          updated_at =
            NOW()

        RETURNING
          document_id,
          signature_image,
          signed_at,
          x,
          y,
          width,
          updated_at
      `;


    /* ===============================================
       ЖУРНАЛ

       Если подписи раньше не было:
       SIGNED

       Если уже была:
       UPDATED
    =============================================== */

    await addEvent(
      sql,
      documentId,
      alreadyExists
        ? "UPDATED"
        : "SIGNED"
    );


    return Response.json({
      ok: true,

      event:
        alreadyExists
          ? "UPDATED"
          : "SIGNED",

      signature:
        normalizeRow(
          rows[0]
        ),
    });

  } catch (error) {
    console.error(
      "Ошибка сохранения подписи:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          "Не удалось сохранить подпись",
      },
      {
        status: 500,
      }
    );
  }
}


/* =====================================================
   DELETE
   УДАЛИТЬ ПОДПИСЬ
===================================================== */

export async function DELETE(
  request
) {
  try {
    const sql =
      getSql();


    const body =
      await request.json();


    const documentId =
      String(
        body?.documentId ||
        ""
      ).trim();


    if (!documentId) {
      return Response.json(
        {
          ok: false,

          error:
            "documentId не указан",
        },
        {
          status: 400,
        }
      );
    }


    /* ===============================================
       УДАЛЯЕМ ПОДПИСЬ
    =============================================== */

    const rows =
      await sql`
        DELETE FROM
          chancery_signatures

        WHERE
          document_id =
            ${documentId}

        RETURNING
          document_id
      `;


    const deleted =
      rows.length > 0;


    /* ===============================================
       ЕСЛИ РЕАЛЬНО БЫЛО ЧТО УДАЛЯТЬ —
       ДОБАВЛЯЕМ DELETED В ЖУРНАЛ
    =============================================== */

    if (deleted) {
      await addEvent(
        sql,
        documentId,
        "DELETED"
      );
    }


    return Response.json({
      ok: true,

      deleted,

      documentId,

      event:
        deleted
          ? "DELETED"
          : null,
    });

  } catch (error) {
    console.error(
      "Ошибка удаления подписи:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          "Не удалось удалить подпись",
      },
      {
        status: 500,
      }
    );
  }
}
