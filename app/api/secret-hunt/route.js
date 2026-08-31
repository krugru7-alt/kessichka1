import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CAPSULE_IDS = Array.from(
  { length: 15 },
  (_, index) =>
    `capsule-${String(index + 1).padStart(
      2,
      "0"
    )}`
);

const KISS_IDS = [
  "kiss-01",
  "kiss-02",
  "kiss-03",
];

const VALID_IDS = new Set([
  ...CAPSULE_IDS,
  ...KISS_IDS,
]);

function normalizePlayer(value) {
  return value === "obsid"
    ? "obsid"
    : "kessi";
}

function getKind(secretId) {
  if (
    secretId.startsWith("capsule-")
  ) {
    return "capsule";
  }

  return "kiss";
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is missing"
    );
  }

  return neon(
    process.env.DATABASE_URL
  );
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS secret_hunt_progress (
      player TEXT NOT NULL,
      secret_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      found_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      PRIMARY KEY (player, secret_id)
    )
  `;
}

async function getProgress(
  sql,
  player
) {
  const rows = await sql`
    SELECT
      secret_id,
      kind,
      found_at
    FROM secret_hunt_progress
    WHERE player = ${player}
    ORDER BY found_at ASC
  `;

  const found = rows.map(
    (row) => row.secret_id
  );

  const capsules =
    rows.filter(
      (row) => row.kind === "capsule"
    ).length;

  const kisses =
    rows.filter(
      (row) => row.kind === "kiss"
    ).length;

  return {
    found,
    counts: {
      capsules,
      kisses,
    },
  };
}

/* =====================================================
   GET
   Получить прогресс игрока
===================================================== */

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const player =
      normalizePlayer(
        searchParams.get("player")
      );

    const sql = getSql();

    await ensureTable(sql);

    const progress =
      await getProgress(
        sql,
        player
      );

    return Response.json({
      success: true,
      player,
      ...progress,
    });
  } catch (error) {
    console.error(
      "SECRET HUNT GET:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Не удалось получить прогресс",
      },
      {
        status: 500,
      }
    );
  }
}

/* =====================================================
   POST
   Зарегистрировать находку
===================================================== */

export async function POST(request) {
  try {
    const body =
      await request.json();

    const player =
      normalizePlayer(
        body?.player
      );

    const secretId =
      String(
        body?.secretId || ""
      );

    if (
      !VALID_IDS.has(secretId)
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Неизвестный секрет",
        },
        {
          status: 400,
        }
      );
    }

    const kind =
      getKind(secretId);

    const sql = getSql();

    await ensureTable(sql);

    await sql`
      INSERT INTO secret_hunt_progress (
        player,
        secret_id,
        kind
      )
      VALUES (
        ${player},
        ${secretId},
        ${kind}
      )

      ON CONFLICT (
        player,
        secret_id
      )
      DO NOTHING
    `;

    const progress =
      await getProgress(
        sql,
        player
      );

    return Response.json({
      success: true,
      player,
      secretId,
      kind,
      ...progress,
    });
  } catch (error) {
    console.error(
      "SECRET HUNT POST:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Не удалось сохранить находку",
      },
      {
        status: 500,
      }
    );
  }
}
