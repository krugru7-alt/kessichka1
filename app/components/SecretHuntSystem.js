"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const PLAYER_KEY = "kessi-secret-player";
const LOCAL_PREFIX = "kessi-secret-hunt-v1";

/*
  route:
  "/"          — только главная
  "/chancery"  — только Канцелярия
  "*"          — на всех страницах

  gesture:
  tap   — несколько быстрых нажатий
  hold  — удержание
  combo — несколько быстрых нажатий,
          затем следующее нажатие удержать
*/

const SECRETS = [
  /* =====================================================
     ГЛАВНАЯ — 5 КАПСУЛ
  ===================================================== */

  {
    id: "capsule-01",
    kind: "capsule",
    route: "/",
    className: "secret-pos-c01",
    gesture: { type: "tap", taps: 4, window: 1800 },
  },
  {
    id: "capsule-02",
    kind: "capsule",
    route: "/",
    className: "secret-pos-c02",
    gesture: { type: "hold", hold: 1700 },
  },
  {
    id: "capsule-03",
    kind: "capsule",
    route: "/",
    className: "secret-pos-c03",
    gesture: { type: "tap", taps: 5, window: 2100 },
  },
  {
    id: "capsule-04",
    kind: "capsule",
    route: "/",
    className: "secret-pos-c04",
    gesture: { type: "hold", hold: 2200 },
  },
  {
    id: "capsule-05",
    kind: "capsule",
    route: "/",
    className: "secret-pos-c05",
    gesture: {
      type: "combo",
      taps: 2,
      hold: 1350,
      window: 1800,
    },
  },

  /* =====================================================
     КАНЦЕЛЯРИЯ — 5 КАПСУЛ
  ===================================================== */

  {
    id: "capsule-06",
    kind: "capsule",
    route: "/chancery",
    className: "secret-pos-c06",
    gesture: { type: "tap", taps: 3, window: 1600 },
  },
  {
    id: "capsule-07",
    kind: "capsule",
    route: "/chancery",
    className: "secret-pos-c07",
    gesture: { type: "hold", hold: 1900 },
  },
  {
    id: "capsule-08",
    kind: "capsule",
    route: "/chancery",
    className: "secret-pos-c08",
    gesture: { type: "tap", taps: 6, window: 2300 },
  },
  {
    id: "capsule-09",
    kind: "capsule",
    route: "/chancery",
    className: "secret-pos-c09",
    gesture: { type: "hold", hold: 1500 },
  },
  {
    id: "capsule-10",
    kind: "capsule",
    route: "/chancery",
    className: "secret-pos-c10",
    gesture: {
      type: "combo",
      taps: 3,
      hold: 1100,
      window: 2100,
    },
  },

  /* =====================================================
     ГЛОБАЛЬНЫЕ — ЕЩЁ 5 КАПСУЛ
  ===================================================== */

  {
    id: "capsule-11",
    kind: "capsule",
    route: "*",
    className: "secret-pos-c11",
    gesture: { type: "tap", taps: 4, window: 1900 },
  },
  {
    id: "capsule-12",
    kind: "capsule",
    route: "*",
    className: "secret-pos-c12",
    gesture: { type: "hold", hold: 2100 },
  },
  {
    id: "capsule-13",
    kind: "capsule",
    route: "*",
    className: "secret-pos-c13",
    gesture: { type: "tap", taps: 5, window: 2200 },
  },
  {
    id: "capsule-14",
    kind: "capsule",
    route: "*",
    className: "secret-pos-c14",
    gesture: {
      type: "combo",
      taps: 2,
      hold: 1700,
      window: 2000,
    },
  },
  {
    id: "capsule-15",
    kind: "capsule",
    route: "*",
    className: "secret-pos-c15",
    gesture: { type: "hold", hold: 2400 },
  },

  /* =====================================================
     3 БУСЬКИ
  ===================================================== */

  {
    id: "kiss-01",
    kind: "kiss",
    route: "/",
    className: "secret-pos-k01",
    gesture: { type: "hold", hold: 2600 },
  },
  {
    id: "kiss-02",
    kind: "kiss",
    route: "/chancery",
    className: "secret-pos-k02",
    gesture: { type: "tap", taps: 7, window: 2800 },
  },
  {
    id: "kiss-03",
    kind: "kiss",
    route: "*",
    className: "secret-pos-k03",
    gesture: {
      type: "combo",
      taps: 3,
      hold: 1900,
      window: 2500,
    },
  },
];

function playerName(player) {
  return player === "obsid" ? "Обсид" : "Кэсси";
}

function getLocalKey(player) {
  return `${LOCAL_PREFIX}-${player}`;
}

function readLocalProgress(player) {
  try {
    const value = JSON.parse(
      localStorage.getItem(getLocalKey(player)) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveLocalProgress(player, ids) {
  try {
    localStorage.setItem(
      getLocalKey(player),
      JSON.stringify(ids)
    );
  } catch {}
}

/* =====================================================
   ОДИН СЕКРЕТНЫЙ HOTSPOT
===================================================== */

function SecretHotspot({
  secret,
  alreadyFound,
  onFound,
}) {
  const tapsRef = useRef(0);
  const tapResetRef = useRef(null);
  const holdTimerRef = useRef(null);
  const comboReadyRef = useRef(false);
  const solvedRef = useRef(false);
  const pointerDownRef = useRef(false);

  function clearHold() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }

  function clearTapReset() {
    if (tapResetRef.current) {
      clearTimeout(tapResetRef.current);
      tapResetRef.current = null;
    }
  }

  function solve() {
    if (alreadyFound || solvedRef.current) return;

    solvedRef.current = true;

    clearHold();
    clearTapReset();

    onFound(secret);
  }

  function resetTapWindow(ms) {
    clearTapReset();

    tapResetRef.current = setTimeout(() => {
      tapsRef.current = 0;
      comboReadyRef.current = false;
    }, ms);
  }

  function pointerDown(event) {
    if (alreadyFound) return;

    pointerDownRef.current = true;

    event.currentTarget.setPointerCapture?.(
      event.pointerId
    );

    const gesture = secret.gesture;

    /* Простое удержание */

    if (gesture.type === "hold") {
      clearHold();

      holdTimerRef.current = setTimeout(() => {
        if (pointerDownRef.current) {
          solve();
        }
      }, gesture.hold);

      return;
    }

    /* Комбинация:
       сначала N коротких нажатий,
       потом удержание */

    if (
      gesture.type === "combo" &&
      comboReadyRef.current
    ) {
      clearHold();

      holdTimerRef.current = setTimeout(() => {
        if (pointerDownRef.current) {
          solve();
        }
      }, gesture.hold);
    }
  }

  function pointerUp(event) {
    if (alreadyFound || solvedRef.current) return;

    pointerDownRef.current = false;
    clearHold();

    event.currentTarget.releasePointerCapture?.(
      event.pointerId
    );

    const gesture = secret.gesture;

    /* Несколько быстрых нажатий */

    if (gesture.type === "tap") {
      tapsRef.current += 1;

      if (tapsRef.current >= gesture.taps) {
        solve();
        return;
      }

      resetTapWindow(gesture.window);
      return;
    }

    /* Комбо */

    if (gesture.type === "combo") {
      if (comboReadyRef.current) {
        /*
          Уже была стадия удержания,
          но пользователь отпустил раньше.
          Сбрасываем комбинацию.
        */
        tapsRef.current = 0;
        comboReadyRef.current = false;
        clearTapReset();
        return;
      }

      tapsRef.current += 1;

      if (tapsRef.current >= gesture.taps) {
        comboReadyRef.current = true;

        clearTapReset();

        tapResetRef.current = setTimeout(() => {
          tapsRef.current = 0;
          comboReadyRef.current = false;
        }, gesture.window);

        return;
      }

      resetTapWindow(gesture.window);
    }
  }

  function pointerCancel() {
    pointerDownRef.current = false;
    clearHold();
  }

  return (
    <button
      type="button"
      className={`secret-hunt-hotspot ${
        secret.className
      } secret-kind-${secret.kind} ${
        alreadyFound ? "secret-already-found" : ""
      }`}
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
      onPointerCancel={pointerCancel}
      onContextMenu={(event) => event.preventDefault()}
      aria-label="Скрытая деталь"
    >
      <span />
    </button>
  );
}

/* =====================================================
   ОСНОВНАЯ СИСТЕМА
===================================================== */

export default function SecretHuntSystem() {
  const pathname = usePathname();

  const [player, setPlayer] = useState("kessi");
  const [ready, setReady] = useState(false);

  const [foundIds, setFoundIds] = useState([]);
  const foundRef = useRef([]);

  const [toast, setToast] = useState(null);
  const [finalType, setFinalType] = useState(null);

  const toastTimerRef = useRef(null);

  useEffect(() => {
    foundRef.current = foundIds;
  }, [foundIds]);

  /* =====================================================
     ОПРЕДЕЛЯЕМ КТО ЗАШЁЛ

     Обычный вход = Кэсси.
     ?who=obsid = Обсид.
     ?who=kessi = Кэсси.

     Выбор сохраняется на устройстве.
  ===================================================== */

  useEffect(() => {
    let detected = "kessi";

    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const fromUrl = params.get("who");

      if (
        fromUrl === "obsid" ||
        fromUrl === "kessi"
      ) {
        detected = fromUrl;

        localStorage.setItem(
          PLAYER_KEY,
          detected
        );
      } else {
        const stored =
          localStorage.getItem(PLAYER_KEY);

        if (
          stored === "obsid" ||
          stored === "kessi"
        ) {
          detected = stored;
        }
      }
    } catch {}

    setPlayer(detected);
  }, []);

  /* =====================================================
     ЗАГРУЖАЕМ ПРОГРЕСС
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      const local =
        readLocalProgress(player);

      setFoundIds(local);
      foundRef.current = local;

      try {
        const response = await fetch(
          `/api/secret-hunt?player=${encodeURIComponent(
            player
          )}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("server unavailable");
        }

        const data = await response.json();

        if (
          !cancelled &&
          Array.isArray(data.found)
        ) {
          const merged = Array.from(
            new Set([
              ...local,
              ...data.found,
            ])
          );

          setFoundIds(merged);
          foundRef.current = merged;
          saveLocalProgress(player, merged);
        }
      } catch {
        /*
          Если Neon недоступен —
          игра всё равно работает локально.
        */
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    setReady(false);
    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [player]);

  /* =====================================================
     ТЕКУЩИЕ СЕКРЕТЫ ДЛЯ СТРАНИЦЫ
  ===================================================== */

  const visibleSecrets = useMemo(() => {
    return SECRETS.filter((secret) => {
      if (secret.route === "*") {
        return true;
      }

      if (secret.route === "/") {
        return pathname === "/";
      }

      return pathname.startsWith(
        secret.route
      );
    });
  }, [pathname]);

  /* =====================================================
     TOAST
  ===================================================== */

  function showToast(data) {
    setToast(data);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3900);
  }

  /* =====================================================
     НАХОДКА
  ===================================================== */

  async function discover(secret) {
    if (
      foundRef.current.includes(secret.id)
    ) {
      return;
    }

    const next = Array.from(
      new Set([
        ...foundRef.current,
        secret.id,
      ])
    );

    foundRef.current = next;
    setFoundIds(next);
    saveLocalProgress(player, next);

    const localCapsules = next.filter(
      (id) => id.startsWith("capsule-")
    ).length;

    const localKisses = next.filter(
      (id) => id.startsWith("kiss-")
    ).length;

    let capsuleCount = localCapsules;
    let kissCount = localKisses;

    try {
      const response = await fetch(
        "/api/secret-hunt",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            player,
            secretId: secret.id,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        capsuleCount =
          data?.counts?.capsules ??
          localCapsules;

        kissCount =
          data?.counts?.kisses ??
          localKisses;
      }
    } catch {}

    /* =================================================
       КАПСУЛА
    ================================================= */

    if (secret.kind === "capsule") {
      showToast({
        icon: "◌",
        title: "капсула найдена",
        text: `${playerName(
          player
        )} · ${capsuleCount}/15`,
      });

      if (capsuleCount >= 15) {
        setTimeout(() => {
          setFinalType("capsules");
        }, 1000);
      }

      return;
    }

    /* =================================================
       БУСЬКА
    ================================================= */

    if (kissCount === 1) {
      showToast({
        icon: "💋",
        title:
          "вау ты реально ее нашла",
        text:
          "осталось 2 малыш",
      });
    }

    if (kissCount === 2) {
      showToast({
        icon: "💋",
        title:
          "я кажется переоценил свои способности прятать",
        text: "ещё 1",
      });
    }

    if (kissCount >= 3) {
      showToast({
        icon: "💋",
        title:
          "ну тут просто жоский тьмок",
        text: "ты всё нашла!",
      });

      setTimeout(() => {
        setFinalType("kisses");
      }, 1200);
    }
  }

  if (!ready) {
    return null;
  }

  return (
    <>
      {/* СЕКРЕТНЫЕ ЗОНЫ */}

      {visibleSecrets.map((secret) => (
        <SecretHotspot
          key={secret.id}
          secret={secret}
          alreadyFound={foundIds.includes(
            secret.id
          )}
          onFound={discover}
        />
      ))}

      {/* НАХОДКА */}

      {toast && (
        <div className="secret-hunt-toast">
          <span className="secret-hunt-toast-icon">
            {toast.icon}
          </span>

          <div>
            <b>{toast.title}</b>
            <small>{toast.text}</small>
          </div>
        </div>
      )}

      {/* ФИНАЛ */}

      {finalType && (
        <div className="secret-hunt-final">
          <button
            type="button"
            className="secret-hunt-final-backdrop"
            onClick={() =>
              setFinalType(null)
            }
            aria-label="Закрыть"
          />

          <div className="secret-hunt-final-card">
            {finalType ===
            "kisses" ? (
              <>
                <small>
                  СЕКРЕТНОЕ ДЕЛО
                </small>

                <div className="secret-hunt-final-symbol">
                  💋
                </div>

                <h2>
                  ну тут просто жоский тьмок
                </h2>

                <p>
                  ты всё нашла!
                </p>

                <div className="secret-hunt-final-counter">
                  3 / 3
                  <span>
                    БУСЬКИ
                  </span>
                </div>
              </>
            ) : (
              <>
                <small>
                  КОЛЛЕКЦИЯ
                  ЗАВЕРШЕНА
                </small>

                <div className="secret-hunt-final-symbol">
                  ◌
                </div>

                <h2>
                  всё.
                  <br />
                  вообще всё.
                </h2>

                <p>
                  ты нашла все спрятанные
                  капсулочки
                </p>

                <div className="secret-hunt-final-counter">
                  15 / 15
                  <span>
                    КАПСУЛ
                  </span>
                </div>
              </>
            )}

            <button
              type="button"
              className="secret-hunt-final-close"
              onClick={() =>
                setFinalType(null)
              }
            >
              закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}
