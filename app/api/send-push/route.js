import webpush from "web-push";
import { neon } from "@neondatabase/serverless";

export async function POST(request) {
  try {
    // Проверяем секретный ключ
    const authHeader = request.headers.get("authorization");
    const secret = process.env.PUSH_SECRET;

    if (!secret) {
      return Response.json(
        {
          error: "PUSH_SECRET не настроен в Vercel",
        },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${secret}`) {
      return Response.json(
        {
          error: "Неверный секретный ключ",
        },
        { status: 401 }
      );
    }

    // Проверяем необходимые переменные
    if (!process.env.DATABASE_URL) {
      return Response.json(
        {
          error: "DATABASE_URL не настроен",
        },
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
      SELECT id, endpoint, subscription
      FROM push_subscriptions
    `;

    if (subscriptions.length === 0) {
      return Response.json(
        {
          error: "В Neon нет Push-подписок",
        },
        { status: 404 }
      );
    }

    const results = [];

    for (const row of subscriptions) {
      try {
        await webpush.sendNotification(
          row.subscription,
          JSON.stringify({
            title: "Кэссичка ❤️",
            body: "Тестовое уведомление от Обсидика 😌",
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
          error: error.message,
        });
      }
    }

    return Response.json({
      success: true,
      message: "Отправка завершена ❤️",
      results,
    });
  } catch (error) {
    console.error("Send push error:", error);

    return Response.json(
      {
        error: error?.message || "Ошибка отправки Push",
      },
      { status: 500 }
    );
  }
}
