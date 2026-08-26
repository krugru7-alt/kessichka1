import { neon } from "@neondatabase/serverless";

import webpush from "web-push";

import {
  getSession,
} from "../../../lib/auth";


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


/* =====================================================
   ТАБЛИЦА PUSH
===================================================== */

async function ensureTable(
  sql
) {

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


/* =====================================================
   POST · ОТПРАВИТЬ PUSH КЭССИЧКЕ
===================================================== */

export async function POST(
  request
) {

  try {

    /* =================================================
       ТОЛЬКО ОБСИДИК
    ================================================= */

    const session =
      await getSession();


    if (
      !session ||
      session.role !==
        "admin"
    ) {

      return Response.json(
        {
          ok: false,
          error:
            "Нет доступа",
        },
        {
          status: 403,
        }
      );

    }


    /* =================================================
       ТЕКСТ УВЕДОМЛЕНИЯ
    ================================================= */

    const body =
      await request.json();


    const message =
      String(
        body?.message || ""
      )
        .trim()
        .slice(
          0,
          220
        );


    if (!message) {

      return Response.json(
        {
          ok: false,
          error:
            "Напиши текст привета",
        },
        {
          status: 400,
        }
      );

    }


    /* =================================================
       VAPID
    ================================================= */

    /*
      Public key.

      Основное имя:
      NEXT_PUBLIC_VAPID_PUBLIC_KEY

      Но оставляем поддержку
      старого VAPID_PUBLIC_KEY,
      если он когда-то так назывался.
    */

    const publicKey =
      String(
        process.env
          .NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        process.env
          .VAPID_PUBLIC_KEY ||
        ""
      ).trim();


    /*
      Private key.

      Никогда не отправляется
      в браузер.
    */

    const privateKey =
      String(
        process.env
          .VAPID_PRIVATE_KEY ||
        ""
      ).trim();


    /*
      Теперь вместо общего
      "ключи не настроены"
      узнаем конкретную проблему.
    */

    const missingKeys =
      [];


    if (!publicKey) {

      missingKeys.push(
        "NEXT_PUBLIC_VAPID_PUBLIC_KEY"
      );

    }


    if (!privateKey) {

      missingKeys.push(
        "VAPID_PRIVATE_KEY"
      );

    }


    if (
      missingKeys.length >
      0
    ) {

      console.error(
        "ADMIN PUSH · отсутствуют ENV:",
        missingKeys,
        "VERCEL_ENV:",
        process.env.VERCEL_ENV ||
        "unknown"
      );


      return Response.json(
        {
          ok: false,

          error:
            "Vercel не видит: " +
            missingKeys.join(
              ", "
            ),

          environment:
            process.env
              .VERCEL_ENV ||
            "unknown",

        },
        {
          status: 500,
        }
      );

    }


    /*
      Дополнительная проверка,
      чтобы случайно не использовать
      пустую/повреждённую строку.
    */

    if (
      publicKey.length <
        20
    ) {

      return Response.json(
        {
          ok: false,

          error:
            "NEXT_PUBLIC_VAPID_PUBLIC_KEY выглядит некорректно",
        },
        {
          status: 500,
        }
      );

    }


    if (
      privateKey.length <
        20
    ) {

      return Response.json(
        {
          ok: false,

          error:
            "VAPID_PRIVATE_KEY выглядит некорректно",
        },
        {
          status: 500,
        }
      );

    }


    /* =================================================
       VAPID SUBJECT
    ================================================= */

    const projectUrl =
      String(
        process.env
          .VERCEL_PROJECT_PRODUCTION_URL ||
        process.env
          .VERCEL_URL ||
        ""
      ).trim();


    const subject =
      String(
        process.env
          .VAPID_SUBJECT ||
        (
          projectUrl
            ? `https://${projectUrl}`
            : "https://example.com"
        )
      ).trim();


    /*
      Настраиваем web-push.
    */

    try {

      webpush.setVapidDetails(
        subject,
        publicKey,
        privateKey
      );

    } catch (error) {

      console.error(
        "setVapidDetails:",
        error
      );


      return Response.json(
        {
          ok: false,

          error:
            "VAPID-ключи найдены, но сама пара ключей некорректна",
        },
        {
          status: 500,
        }
      );

    }


    /* =================================================
       NEON
    ================================================= */

    const sql =
      getSql();


    await ensureTable(
      sql
    );


    /* =================================================
       БЕРЁМ ТОЛЬКО УСТРОЙСТВА КЭССИЧКИ
    ================================================= */

    const subscriptions =
      await sql`
        SELECT
          endpoint,
          p256dh,
          auth

        FROM
          world_push_subscriptions

        WHERE
          user_name = 'kessi'

        ORDER BY
          updated_at DESC
      `;


    if (
      subscriptions.length ===
      0
    ) {

      return Response.json(
        {
          ok: false,

          error:
            "У Кэссички пока нет зарегистрированного устройства",
        },
        {
          status: 404,
        }
      );

    }


    /* =================================================
       PAYLOAD
    ================================================= */

    const payload =
      JSON.stringify({

        title:
          "Наш мирок ♥",

        body:
          message,

        /*
          Оставляем message
          для совместимости
          с текущим sw.js.
        */

        message,

        url:
          "/",

        data: {

          url:
            "/",

        },

      });


    let sent =
      0;


    let failed =
      0;


    /* =================================================
       ОТПРАВЛЯЕМ НА ВСЕ УСТРОЙСТВА КЭССИЧКИ
    ================================================= */

    for (
      const item
      of subscriptions
    ) {

      const subscription = {

        endpoint:
          item.endpoint,

        keys: {

          p256dh:
            item.p256dh,

          auth:
            item.auth,

        },

      };


      try {

        await webpush
          .sendNotification(
            subscription,
            payload
          );


        sent++;


      } catch (error) {

        failed++;


        const statusCode =
          Number(
            error?.statusCode ||
            0
          );


        console.error(
          "Push error:",
          {
            statusCode,

            message:
              error?.message ||
              "unknown",
          }
        );


        /*
          404 / 410 означает,
          что браузерная подписка
          больше не существует.

          Удаляем её из Neon.
        */

        if (
          statusCode ===
            404 ||
          statusCode ===
            410
        ) {

          try {

            await sql`
              DELETE FROM
                world_push_subscriptions

              WHERE
                endpoint =
                  ${item.endpoint}
            `;

          } catch (
            deleteError
          ) {

            console.error(
              "Не удалось удалить старую Push-подписку:",
              deleteError
            );

          }

        }

      }

    }


    /* =================================================
       РЕЗУЛЬТАТ
    ================================================= */

    if (
      sent ===
      0
    ) {

      return Response.json(
        {
          ok: false,

          sent,

          failed,

          total:
            subscriptions.length,

          error:
            "Не удалось доставить уведомление",
        },
        {
          status: 502,
        }
      );

    }


    return Response.json(
      {
        ok: true,

        sent,

        failed,

        total:
          subscriptions.length,
      }
    );


  } catch (error) {

    console.error(
      "ADMIN PUSH:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          error?.message ||
          "Не удалось отправить привет",
      },
      {
        status: 500,
      }
    );

  }

}
