import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";


/* =====================================================
   ПРЕОБРАЗУЕМ СТРОКУ ИЗ БАЗЫ
===================================================== */

function normalizeRow(row) {
  return {
    documentId: row.document_id,

    image: row.signature_image,

    signedAt: row.signed_at,

    x: Number(row.x),

    y: Number(row.y),

    width: Number(row.width),

    updatedAt: row.updated_at,
  };
}


/* =====================================================
   GET
   ПОЛУЧИТЬ ВСЕ ПОДПИСИ
===================================================== */

export async function GET() {
  try {
    const result = await sql`
      SELECT
        document_id,
        signature_image,
        signed_at,
        x,
        y,
        width,
        updated_at
      FROM chancery_signatures
      ORDER BY updated_at DESC
    `;

    return Response.json(
      {
        ok: true,

        signatures:
          result.rows.map(
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

export async function POST(request) {
  try {
    const body =
      await request.json();

    const documentId =
      String(
        body?.documentId || ""
      ).trim();

    const image =
      String(
        body?.image || ""
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


    const x =
      Number.isFinite(
        Number(body.x)
      )
        ? Number(body.x)
        : 50;


    const y =
      Number.isFinite(
        Number(body.y)
      )
        ? Number(body.y)
        : 86;


    const width =
      Number.isFinite(
        Number(body.width)
      )
        ? Number(body.width)
        : 27;


    const signedAt =
      body.signedAt
        ? new Date(
            body.signedAt
          )
        : new Date();


    if (
      Number.isNaN(
        signedAt.getTime()
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


    const result = await sql`
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

      ON CONFLICT (document_id)

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


    return Response.json({
      ok: true,

      signature:
        normalizeRow(
          result.rows[0]
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
