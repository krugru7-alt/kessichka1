import webpush from "web-push";
import { neon } from "@neondatabase/serverless";

export async function POST(request) {
  try {
    const secret = process.env.PUSH_SECRET;
    const authHeader = request.headers.get("authorization");

    if (!secret) {
      return Response.json(
        { error: "PUSH_SECRET не настроен" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${secret}`) {
      return Response.json(
        { error: "Неверный PUSH_SECRET" },
        { status: 401 }
      );
    }

    const data = await request.json();

    const title =
      data?.title?.trim() || "Внеплановый привет ❤️";

    const body =
      data?.body?.trim() || "бусссс ты те надулась";

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
        { error: "VAPID ключи не настроены" },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(
      "mailto:admin@example.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const sql = neon(process.env.DATABASE_URL);

    const subscriptions = await sql`
      SELECT id, subscription
      FROM push_subscriptions
    `;

    if (subscriptions.length === 0) {
      return Response.json(
        { error: "Нет Push-подписок" },
        { status: 404 }
      );
    }

    let sent = 0;

    const errors = [];

    for (const row of subscriptions) {
      try {
        await webpush.sendNotification(
          row.subscription,
          JSON.stringify({
            title,
            body,

            icon: "/icon-192.png",
            badge: "/icon-192.png",

            url: "/for-you",
          })
        );

        sent++;
      } catch (error) {
        console.error(
          "Push error:",
          row.id,
          error
        );

        errors.push({
          id: row.id,
          statusCode: error?.statusCode,
          message: error?.message,
        });
      }
    }

    return Response.json({
      success: sent > 0,
      sent,
      total: subscriptions.length,
      errors,
    });
  } catch (error) {
    console.error("SEND NOW ERROR:", error);

    return Response.json(
      {
        error:
          error?.message ||
          "Ошибка отправки",
      },
      { status: 500 }
    );
  }
}
