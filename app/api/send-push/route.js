import webpush from "web-push";
import { neon } from "@neondatabase/serverless";

function getMessage() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );

  if (hour >= 6 && hour < 12) {
    return {
      title: "Доброе утро, Кэссичка ❤️",
      body: "Просыпайся потихоньку солнышко 🌷",
    };
  }

  if (hour >= 12 && hour < 18) {
    return {
      title: "Привет от Обсидика ❤️",
      body: "Просто напоминаю: ты мой важный человечек. 😌",
    };
  }

  if (hour >= 18 && hour < 22) {
    return {
      title: "Вечерний привет 🌆",
      body: "День почти закончился. Отдыхай, ты сегодня молодец ❤️",
    };
  }

  return {
    title: "Спокойной ночи, Кэссичка 🌙",
    body: "Пора отдыхать. Пусть тебе приснятся хорошие вещи ❤️",
  };
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronHeader = request.headers.get("x-vercel-cron");

    const secret = process.env.PUSH_SECRET;

    if (!secret) {
      return Response.json(
        { error: "PUSH_SECRET не настроен" },
        { status: 500 }
      );
    }

    const isAuthorized =
      authHeader === `Bearer ${secret}` ||
      cronHeader !== null;

    if (!isAuthorized) {
      return Response.json(
        { error: "Неверный секретный ключ" },
        { status: 401 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: "DATABASE_URL не настроен" },
        { status: 500 }
      );
    }

    if (
      !process.env.VAPID_PUBLIC_KEY ||
      !process.env.VAPID_PRIVATE_KEY
    ) {
      return Response.json(
        {
          error:
            "VAPID_PUBLIC_KEY или VAPID_PRIVATE_KEY не настроены",
        },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    webpush.setVapidDetails(
      "mailto:admin@example.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const subscriptions = await sql`
      SELECT id, subscription
      FROM push_subscriptions
    `;

    if (subscriptions.length === 0) {
      return Response.json(
        { error: "В Neon нет Push-подписок" },
        { status: 404 }
      );
    }

    const message = getMessage();
    const results = [];

    for (const row of subscriptions) {
      try {
        await webpush.sendNotification(
          row.subscription,
          JSON.stringify({
            title: message.title,
            body: message.body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          })
        );

        results.push({
          id: row.id,
          success: true,
        });
      } catch (error) {
        console.error(
          `Ошибка отправки подписке ${row.id}:`,
          error
        );

        results.push({
          id: row.id,
          success: false,
          error: error?.message || "Ошибка отправки",
        });
      }
    }

    return Response.json({
      success: true,
      message: "Push отправлен ❤️",
      results,
    });
  } catch (error) {
    console.error("Send push error:", error);

    return Response.json(
      {
        error:
          error?.message || "Ошибка отправки Push",
      },
      { status: 500 }
    );
  }
}
