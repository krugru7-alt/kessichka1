import { neon } from "@neondatabase/serverless";

import webpush from "web-push";

import {
  getSession,
} from "../../../lib/auth";


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


export async function POST(
  request
) {

  try {

    /* =============================
       ТОЛЬКО ОБСИДИК
    ============================= */

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


    /* =============================
       ТЕКСТ
    ============================= */

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


    /* =============================
       VAPID
    ============================= */

    const publicKey =
      process.env
        .NEXT_PUBLIC_VAPID_PUBLIC_KEY;


    const privateKey =
      process.env
        .VAPID_PRIVATE_KEY;


    if (
      !publicKey ||
      !privateKey
    ) {

      return Response.json(
        {
          ok: false,
          error:
            "VAPID-ключи не настроены",
        },
        {
          status: 500,
        }
      );

    }


    /*
      VAPID разрешает https URL
      проекта как subject.
    */

    const projectUrl =
      process.env
        .VERCEL_PROJECT_PRODUCTION_URL;


    const subject =
      process.env
        .VAPID_SUBJECT ||
      (
        projectUrl
          ? `https://${projectUrl}`
          : "https://example.com"
      );


    webpush.setVapidDetails(
      subject,
      publicKey,
      privateKey
    );


    /* =============================
       БЕРЁМ ТОЛЬКО КЭССИЧКУ
    ============================= */

    const sql =
      getSql();


    await ensureTable(
      sql
    );


    const subscriptions =
      await sql`
        SELECT
          endpoint,
          p256dh,
          auth

        FROM world_push_subscriptions

        WHERE
          user_name = 'kessi'

        ORDER BY
          updated_at DESC
      `;


    if (
      subscriptions.length === 0
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


    /* =============================
       УВЕДОМЛЕНИЕ
    ============================= */

    const payload =
      JSON.stringify({

        title:
          "Наш мирок ♥",

        body:
          message,

        /*
          Для совместимости
          со старым sw.js.
        */

        message,

        url:
          "/",

        data: {
          url: "/",
        },

      });


    let sent =
      0;


    let failed =
      0;


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


        /*
          Подписка умерла —
          удаляем её из Neon.
        */

        if (
          statusCode === 404 ||
          statusCode === 410
        ) {

          await sql`
            DELETE FROM world_push_subscriptions

            WHERE
              endpoint = ${item.endpoint}
          `;

        }


        console.error(
          "Push error:",
          statusCode,
          error?.message
        );

      }
    }


    return Response.json({

      ok:
        sent > 0,

      sent,

      failed,

      total:
        subscriptions.length,

      error:
        sent === 0
          ? "Не удалось доставить уведомление"
          : null,

    });


  } catch (error) {

    console.error(
      "ADMIN PUSH:",
      error
    );


    return Response.json(
      {
        ok: false,

        error:
          "Не удалось отправить привет",
      },
      {
        status: 500,
      }
    );

  }
}
