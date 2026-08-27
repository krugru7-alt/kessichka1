import { neon } from "@neondatabase/serverless";
import { getSession } from "../../lib/auth";
import {
  CAPSULE_IDS,
  FINAL_CAPSULE_ID,
} from "../../lib/capsuleCatalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL не найден");
  }

  return neon(databaseUrl);
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS world_capsule_progress (
      id BIGSERIAL PRIMARY KEY,
      user_name TEXT NOT NULL,
      capsule_id TEXT NOT NULL,
      unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_name, capsule_id)
    )
  `;
}

async function getUnlocked(sql, userName) {
  const rows = await sql`
    SELECT capsule_id, unlocked_at
    FROM world_capsule_progress
    WHERE user_name = ${userName}
    ORDER BY unlocked_at ASC
  `;

  return rows.map((row) => ({
    id: row.capsule_id,
    unlockedAt: row.unlocked_at,
  }));
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return Response.json(
        { ok: false, error: "Нужно войти в Наш мирок" },
        { status: 401 }
      );
    }

    const sql = getSql();
    await ensureTable(sql);

    const unlocked = await getUnlocked(sql, session.user);

    return Response.json({
      ok: true,
      user: session.user,
      unlocked,
    });
  } catch (error) {
    console.error("GET /api/capsules:", error);

    return Response.json(
      {
        ok: false,
        error: error?.message || "Не удалось загрузить капсулы",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return Response.json(
        { ok: false, error: "Нужно войти в Наш мирок" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const capsuleId = String(body?.id || "").trim();

    if (!CAPSULE_IDS.includes(capsuleId)) {
      return Response.json(
        { ok: false, error: "Неизвестная капсула" },
        { status: 400 }
      );
    }

    if (capsuleId === FINAL_CAPSULE_ID) {
      return Response.json(
        { ok: false, error: "Эта капсула открывается сама" },
        { status: 400 }
      );
    }

    const sql = getSql();
    await ensureTable(sql);

    const inserted = await sql`
      INSERT INTO world_capsule_progress (
        user_name,
        capsule_id,
        unlocked_at
      )
      VALUES (
        ${session.user},
        ${capsuleId},
        NOW()
      )
      ON CONFLICT (user_name, capsule_id)
      DO NOTHING
      RETURNING capsule_id
    `;

    const newlyUnlocked = inserted.length > 0
      ? [capsuleId]
      : [];

    const beforeFinal = await getUnlocked(sql, session.user);
    const nonFinalCount = beforeFinal.filter(
      (item) => item.id !== FINAL_CAPSULE_ID
    ).length;

    if (nonFinalCount >= CAPSULE_IDS.length - 1) {
      const finalInserted = await sql`
        INSERT INTO world_capsule_progress (
          user_name,
          capsule_id,
          unlocked_at
        )
        VALUES (
          ${session.user},
          ${FINAL_CAPSULE_ID},
          NOW()
        )
        ON CONFLICT (user_name, capsule_id)
        DO NOTHING
        RETURNING capsule_id
      `;

      if (finalInserted.length > 0) {
        newlyUnlocked.push(FINAL_CAPSULE_ID);
      }
    }

    const unlocked = await getUnlocked(sql, session.user);

    return Response.json({
      ok: true,
      newlyUnlocked,
      unlocked,
    });
  } catch (error) {
    console.error("POST /api/capsules:", error);

    return Response.json(
      {
        ok: false,
        error: error?.message || "Не удалось открыть капсулу",
      },
      { status: 500 }
    );
  }
}
