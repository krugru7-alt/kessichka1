import { sql } from "@vercel/postgres";

export async function POST(request) {
  try {
    const subscription = await request.json();

    if (!subscription?.endpoint) {
      return Response.json(
        {
          error: "Некорректная Push-подписка",
        },
        {
          status: 400,
        }
      );
    }

    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE NOT NULL,
        subscription JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO push_subscriptions
        (endpoint, subscription)
      VALUES
        (${subscription.endpoint}, ${JSON.stringify(subscription)})
      ON CONFLICT (endpoint)
      DO UPDATE SET
        subscription = EXCLUDED.subscription,
        updated_at = NOW()
    `;

    return Response.json({
      success: true,
      message: "Push-подписка сохранена ❤️",
    });
  } catch (error) {
    console.error("Subscribe error:", error);

    return Response.json(
      {
        error: "Не удалось сохранить подписку",
      },
      {
        status: 500,
      }
    );
  }
}
