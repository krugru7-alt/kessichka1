import { neon } from "@neondatabase/serverless";
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIME_ZONE = "Europe/Minsk";

/*
  0 = воскресенье
  1 = понедельник
  2 = вторник
  ...
  6 = суббота

  Здесь потом будем менять время и тексты.
*/
const SCHEDULE = {
  1: [
    {
      id: "monday-morning",
      time: "06:45",
      title: "Доброе утро ❤️",
      body:
        "Доброе утро, Любовь моя. Пусть этот понедельник будет легким 😌",
    },
    {
      id: "monday-lunch",
      time: "12:10",
      title: "ОБЕД 🌷",
      body:
        "Приятного аппетита маленькая ❤️",
    },
    {
      id: "monday-reminder",
      time: "16:30",
      title: "Я просто напоминаю ❤️",
      body: "Тьмок",
    },
    {
      id: "monday-night",
      time: "00:00",
      title: "Сладких снов 💤",
      body:
        "Сладких снов, Любовь моя. ❤️",
    },
  ],

  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  0: [],
};

function getMinskNow() {
  const formatter = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }
  );

  const parts =
    formatter.formatToParts(new Date());

  const get = (type) =>
    parts.find(
      (part) => part.type === type
    )?.value;

  const weekdays = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),

    weekday:
      weekdays[get("weekday")],

    hour:
      Number(get("hour")),

    minute:
      Number(get("minute")),
  };
}

function timeToMinutes(time) {
  const [hour, minute] =
    time
      .split(":")
      .map(Number);

  return hour * 60 + minute;
}

async function sendPush(
  sql,
  notification,
  isTest = false
) {
  /*
    Только подписки Кэссички.
    obsid уведомление не получает.
  */
  const subscriptions =
    await sql`
      SELECT
        endpoint,
        p256dh,
        auth
      FROM world_push_subscriptions
      WHERE user_name = 'kessi'
    `;

  if (subscriptions.length === 0) {
    return {
      sent: 0,
      subscriptions: 0,
    };
  }

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint:
            sub.endpoint,

          keys: {
            p256dh:
              sub.p256dh,

            auth:
              sub.auth,
          },
        },

        JSON.stringify({
          title:
            notification.title,

          body:
            notification.body,

          url:
            "/",

          tag:
            isTest
              ? `test-${Date.now()}`
              : notification.id,
        }),

        {
          TTL: 3600,
        }
      );

      sent++;
    } catch (error) {
      console.error(
        "Push error:",
        error?.statusCode,
        error?.message
      );

      /*
        Браузер удалил подписку
        или она больше не существует.
      */
      if (
        error?.statusCode === 404 ||
        error?.statusCode === 410
      ) {
        await sql`
          DELETE FROM world_push_subscriptions
          WHERE endpoint = ${sub.endpoint}
        `;
      }
    }
  }

  return {
    sent,
    subscriptions:
      subscriptions.length,
  };
}

export async function GET(request) {
  try {
    /*
      GitHub Actions знает этот секрет.
      Посторонний человек endpoint
      вызвать не сможет.
    */
    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      !process.env
        .PUSH_TRIGGER_SECRET ||
      authorization !==
        `Bearer ${process.env.PUSH_TRIGGER_SECRET}`
    ) {
      return Response.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const databaseUrl =
      process.env.DATABASE_URL;

    const publicKey =
      process.env
        .NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const privateKey =
      process.env
        .VAPID_PRIVATE_KEY;

    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL отсутствует"
      );
    }

    if (
      !publicKey ||
      !privateKey
    ) {
      throw new Error(
        "VAPID ключи отсутствуют"
      );
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ||
        "mailto:push@example.com",

      publicKey,
      privateKey
    );

    const sql =
      neon(databaseUrl);

    /*
      Таблица подписок уже существует,
      но оставляем страховку.
    */
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

    /*
      Здесь запоминаем уже отправленные
      сообщения, чтобы каждые пять минут
      одно и то же не прилетало снова.
    */
    await sql`
      CREATE TABLE IF NOT EXISTS scheduled_push_log (
        id BIGSERIAL PRIMARY KEY,
        notification_key TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    const url =
      new URL(request.url);

    /*
      Если workflow запускаем руками,
      отправляем тест.
    */
    if (
      url.searchParams.get("test") ===
      "1"
    ) {
      const result =
        await sendPush(
          sql,
          {
            id: "test",
            title:
              "Тестовое уведомление ❤️",

            body:
              "Если ты это видишь - всё работает.",
          },
          true
        );

      return Response.json({
        ok: true,
        test: true,
        ...result,
      });
    }

    const now =
      getMinskNow();

    const currentMinutes =
      now.hour * 60 +
      now.minute;

    const dateKey =
      `${now.year}-${now.month}-${now.day}`;

    const today =
      SCHEDULE[now.weekday] || [];

    /*
      GitHub запускается каждые 5 минут,
      но иногда может слегка задержаться.

      Поэтому окно 20 минут.
      Повторов всё равно не будет
      благодаря scheduled_push_log.
    */
    const due =
      today.filter((item) => {
        const target =
          timeToMinutes(
            item.time
          );

        return (
          currentMinutes >= target &&
          currentMinutes <
            target + 20
        );
      });

    if (due.length === 0) {
      return Response.json({
        ok: true,
        sent: 0,
        message:
          "Сейчас уведомлений нет",
        minsk:
          `${String(now.hour).padStart(
            2,
            "0"
          )}:${String(
            now.minute
          ).padStart(2, "0")}`,
      });
    }

    let totalSent = 0;

    for (
      const notification of due
    ) {
      const notificationKey =
        `${dateKey}-${notification.id}`;

      const existing =
        await sql`
          SELECT id
          FROM scheduled_push_log
          WHERE notification_key =
            ${notificationKey}
          LIMIT 1
        `;

      if (existing.length > 0) {
        continue;
      }

      const result =
        await sendPush(
          sql,
          notification
        );

      totalSent +=
        result.sent;

      /*
        Записываем только после
        успешной отправки хотя бы
        на одно устройство Кэссички.
      */
      if (result.sent > 0) {
        await sql`
          INSERT INTO scheduled_push_log (
            notification_key
          )
          VALUES (
            ${notificationKey}
          )
          ON CONFLICT (
            notification_key
          )
          DO NOTHING
        `;
      }
    }

    return Response.json({
      ok: true,
      sent: totalSent,
      timeZone: TIME_ZONE,
    });
  } catch (error) {
    console.error(
      "Scheduled push:",
      error
    );

    return Response.json(
      {
        ok: false,

        error:
          error?.message ||
          "Push error",
      },
      {
        status: 500,
      }
    );
  }
}
