"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const OVERLAY_SELECTOR =
  ".capsule-reveal-overlay, .hidden-kiss-overlay, .world-anomaly-overlay";

const REVEALS = {
  plane: {
    eyebrow: "ЭТО ОТКУДА ВООБЩЕ",
    icon: "➤",
    title: "Бумажный самолётик",
    text:
      "Я этого сюда не клал.",
  },
  fake: {
    eyebrow: "НУ И ЧТО ТЫ ОЖИДАЛА",
    icon: "?",
    title: "Нет. Тут ничего нет.",
    text:
      "Довольно смешные проверки зая.",
  },
  envelope: {
    eyebrow: "ЭТО УЖЕ НЕ ПОИСК",
    icon: "✉",
    title: "Это уже обыск.",
    text:
      "Ты дошла до момента, когда даже случайный конверт у палатки не имеет права спокойно лежать. тьмок ♡",
  },
  star: {
    eyebrow: "СТОП. ТЫ УСПЕЛА?",
    icon: "✦",
    title: "Ты серьёзно поймала падающую звезду?",
    text:
      "Она была здесь буквально несколько секунд.",
  },
  almost: {
    eyebrow: "...",
    icon: "◌",
    title: "Ты почти всё здесь нашла.",
    text:
      "Я начинаю подозревать",
  },
  dragon: {
    eyebrow: "ДРАКОША ВСЁ ВИДИТ",
    icon: "🐉",
    title: "Ты же не думаешь, что он не заметил?",
    text:
      "Дракоша уже ведёт наблюдение за наблюдающей.",
  },
};

const FAKE_STEPS = [
  "Нет. Реально ничего.",
  "Я серьёзно.",
  "Зачем второй раз?",
  "Любовь моя...",
  "Там всё ещё ничего нет.",
  "Куда...?",
];

function getMinskHour() {
  try {
    return Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Minsk",
        hour: "numeric",
        hourCycle: "h23",
      }).format(new Date())
    );
  } catch {
    return new Date().getHours();
  }
}

function storageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function sessionRoll(key, probability) {
  try {
    const existing = window.sessionStorage.getItem(key);

    if (existing === "1") return true;
    if (existing === "0") return false;

    const result = Math.random() < probability;

    window.sessionStorage.setItem(
      key,
      result ? "1" : "0"
    );

    return result;
  } catch {
    return Math.random() < probability;
  }
}

export default function WorldAnomalies() {
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [capsuleCount, setCapsuleCount] = useState(0);
  const [reveal, setReveal] = useState(null);
  const [toast, setToast] = useState("");

  const [planeVisible, setPlaneVisible] = useState(false);
  const [fakeVisible, setFakeVisible] = useState(false);
  const [envelopeVisible, setEnvelopeVisible] = useState(false);
  const [fallingStarVisible, setFallingStarVisible] = useState(false);

  const [fakeTaps, setFakeTaps] = useState(0);
  const [dragonTaps, setDragonTaps] = useState(0);
  const [dragonWhisper, setDragonWhisper] = useState(null);

  const [fakePosition, setFakePosition] = useState({
    top: "63%",
    left: "8%",
  });

  const toastTimerRef = useRef(null);
  const dragonTimerRef = useRef(null);
  const starTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);

  async function loadProgress() {
    if (pathname === "/login") return;

    try {
      const response = await fetch("/api/capsules", {
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        return;
      }

      setUser(data.user || null);
      setCapsuleCount(
        Array.isArray(data.unlocked)
          ? data.unlocked.length
          : 0
      );
    } catch (error) {
      console.warn("WORLD ANOMALIES:", error);
    }
  }

  /* =====================================================
     ПРОГРЕСС КАПСУЛ
  ===================================================== */

  useEffect(() => {
    loadProgress();
  }, [pathname]);

  useEffect(() => {
    function refreshAfterCapsule() {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = window.setTimeout(
        loadProgress,
        650
      );
    }

    window.addEventListener(
      "our-world-capsule-unlocked",
      refreshAfterCapsule
    );

    return () => {
      window.removeEventListener(
        "our-world-capsule-unlocked",
        refreshAfterCapsule
      );

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [pathname]);

  /* =====================================================
     РЕДКИЕ ОБЪЕКТЫ ПО МЕРЕ ПРОГРЕССА
  ===================================================== */

  useEffect(() => {
    if (!user || pathname === "/login") {
      setPlaneVisible(false);
      setFakeVisible(false);
      setEnvelopeVisible(false);
      setFallingStarVisible(false);
      return;
    }

    const pageKey = pathname.replace(/\//g, "-") || "root";

    setPlaneVisible(
      capsuleCount >= 3 &&
        sessionRoll(
          `world-anomaly:${user}:plane:${pageKey}`,
          0.28
        )
    );

    setFakeVisible(
      capsuleCount >= 7 &&
        sessionRoll(
          `world-anomaly:${user}:fake:${pageKey}`,
          0.24
        )
    );

    setEnvelopeVisible(
      capsuleCount >= 9 &&
        pathname === "/home" &&
        sessionRoll(
          `world-anomaly:${user}:envelope:${pageKey}`,
          0.38
        )
    );

    const hour = getMinskHour();
    const isNight = hour >= 22 || hour < 5;

    const shouldShowStar =
      capsuleCount >= 3 &&
      pathname === "/home" &&
      isNight &&
      sessionRoll(
        `world-anomaly:${user}:falling-star:${pageKey}`,
        0.02
      );

    setFallingStarVisible(shouldShowStar);

    if (shouldShowStar) {
      if (starTimerRef.current) {
        window.clearTimeout(starTimerRef.current);
      }

      starTimerRef.current = window.setTimeout(() => {
        setFallingStarVisible(false);
      }, 6200);
    }

    setFakePosition({
      top: `${26 + Math.floor(Math.random() * 46)}%`,
      left: `${5 + Math.floor(Math.random() * 82)}%`,
    });
  }, [user, capsuleCount, pathname]);

  /* =====================================================
     ПОСЛЕ 10 КАПСУЛ НЕКОТОРЫЕ ВЕЩИ ВЕДУТ СЕБЯ СТРАННО
  ===================================================== */

  useEffect(() => {
    const root = document.documentElement;

    if (capsuleCount >= 10) {
      root.classList.add("world-anomaly-stage-10");
    } else {
      root.classList.remove("world-anomaly-stage-10");
    }

    return () => {
      root.classList.remove("world-anomaly-stage-10");
    };
  }, [capsuleCount]);

  /* =====================================================
     ПОСЛЕ 10 КАПСУЛ — ОДНОРАЗОВОЕ «ПОЧТИ ВСЁ»
  ===================================================== */

  useEffect(() => {
    if (!user || capsuleCount < 10 || pathname === "/login") {
      return;
    }

    const key = `world-anomaly-almost-seen:${user}`;

    if (storageGet(key) === "1") {
      return;
    }

    let cancelled = false;
    let timer = null;

    function tryShow() {
      if (cancelled) return;

      if (document.querySelector(OVERLAY_SELECTOR)) {
        timer = window.setTimeout(tryShow, 2200);
        return;
      }

      storageSet(key, "1");
      setReveal(REVEALS.almost);
    }

    timer = window.setTimeout(tryShow, 7200);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [user, capsuleCount, pathname]);

  /* =====================================================
     ДРАКОША ПОСЛЕ 5 КАПСУЛ ПОНИМАЕТ, ЧТО ЕГО ПРОВЕРЯЮТ
  ===================================================== */

  useEffect(() => {
    if (capsuleCount < 5 || pathname === "/login") return;

    function handleDragonClick(event) {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const dragon = target.closest(".drakosha-floating");
      if (!dragon) return;

      const next = dragonTaps + 1;
      setDragonTaps(next);

      if (next < 4) return;

      setDragonTaps(0);

      const rect = dragon.getBoundingClientRect();

      setDragonWhisper({
        left: Math.max(
          85,
          Math.min(
            window.innerWidth - 85,
            rect.left + rect.width / 2
          )
        ),
        bottom: Math.max(
          88,
          window.innerHeight - rect.top + 7
        ),
      });

      if (dragonTimerRef.current) {
        window.clearTimeout(dragonTimerRef.current);
      }

      dragonTimerRef.current = window.setTimeout(() => {
        setDragonWhisper(null);
      }, 3600);
    }

    document.addEventListener("click", handleDragonClick, true);

    return () => {
      document.removeEventListener(
        "click",
        handleDragonClick,
        true
      );
    };
  }, [capsuleCount, dragonTaps, pathname]);

  /* =====================================================
     ТЕСТОВЫЙ EVENT ДЛЯ ТЕБЯ

     В консоли:
     window.dispatchEvent(new CustomEvent("our-world-anomaly-test", {
       detail: { type: "star" }
     }))
  ===================================================== */

  useEffect(() => {
    function handleTest(event) {
      const type = event?.detail?.type;

      if (type === "plane") {
        setPlaneVisible(true);
        return;
      }

      if (type === "fake") {
        setFakeVisible(true);
        return;
      }

      if (type === "envelope") {
        setEnvelopeVisible(true);
        return;
      }

      if (type === "star") {
        setFallingStarVisible(true);
        return;
      }

      if (REVEALS[type]) {
        setReveal(REVEALS[type]);
      }
    }

    window.addEventListener(
      "our-world-anomaly-test",
      handleTest
    );

    return () => {
      window.removeEventListener(
        "our-world-anomaly-test",
        handleTest
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      if (dragonTimerRef.current) {
        window.clearTimeout(dragonTimerRef.current);
      }

      if (starTimerRef.current) {
        window.clearTimeout(starTimerRef.current);
      }
    };
  }, []);

  function showToast(message) {
    setToast(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 1900);
  }

  function openReveal(type) {
    if (!REVEALS[type]) return;
    setReveal(REVEALS[type]);
  }

  function tapFake() {
    const next = fakeTaps + 1;

    if (next >= 7) {
      setFakeTaps(0);
      setFakeVisible(false);
      openReveal("fake");
      return;
    }

    setFakeTaps(next);
    showToast(FAKE_STEPS[next - 1] || "Нет.");
  }

  if (pathname === "/login") {
    return null;
  }

  return (
    <>
      {/* БУМАЖНЫЙ САМОЛЁТИК · 3+ КАПСУЛЫ */}
      {planeVisible && (
        <button
          type="button"
          className="world-anomaly-plane"
          onClick={() => {
            setPlaneVisible(false);
            openReveal("plane");
          }}
          aria-label="Бумажный самолётик"
        >
          ➤
        </button>
      )}

      {/* ЛОЖНАЯ ПАСХАЛКА · 7+ КАПСУЛ */}
      {fakeVisible && (
        <button
          type="button"
          className="world-anomaly-fake"
          style={fakePosition}
          onClick={tapFake}
          aria-label="Что это"
        >
          ?
        </button>
      )}

      {/* КОНВЕРТ У ЛАГЕРЯ · 9+ КАПСУЛ */}
      {envelopeVisible && pathname === "/home" && (
        <button
          type="button"
          className="world-anomaly-envelope"
          onClick={() => {
            setEnvelopeVisible(false);
            openReveal("envelope");
          }}
          aria-label="Конверт"
        >
          <span />
          <i>♡</i>
        </button>
      )}

      {/* РЕДКАЯ ПАДАЮЩАЯ ЗВЕЗДА */}
      {fallingStarVisible && pathname === "/home" && (
        <button
          type="button"
          className="world-anomaly-falling-star"
          onClick={() => {
            setFallingStarVisible(false);
            openReveal("star");
          }}
          aria-label="Падающая звезда"
        >
          <span>✦</span>
        </button>
      )}

      {/* ДРАКОША ЗНАЕТ */}
      {dragonWhisper && (
        <button
          type="button"
          className="world-anomaly-dragon-whisper"
          style={{
            left: `${dragonWhisper.left}px`,
            bottom: `${dragonWhisper.bottom}px`,
          }}
          onClick={() => {
            setDragonWhisper(null);
            openReveal("dragon");
          }}
        >
          ты же не думаешь,
          <br />
          что я не заметил? 👀
        </button>
      )}

      {/* МАЛЕНЬКАЯ РЕПЛИКА АНТИПАСХАЛКИ */}
      {toast && (
        <div className="world-anomaly-toast">
          {toast}
        </div>
      )}

      {/* ПОЛНОЭКРАННОЕ РЕДКОЕ СОБЫТИЕ */}
      {reveal && (
        <div
          className="world-anomaly-overlay"
          onClick={() => setReveal(null)}
        >
          <div
            className="world-anomaly-particles"
            aria-hidden="true"
          >
            {Array.from({ length: 20 }).map((_, index) => (
              <i
                key={index}
                style={{ "--world-i": index }}
              >
                {reveal.icon === "✦" ? "✦" : "·"}
              </i>
            ))}
          </div>

          <section
            className="world-anomaly-card"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="world-anomaly-icon">
              {reveal.icon}
            </span>

            <small>{reveal.eyebrow}</small>
            <h2>{reveal.title}</h2>
            <p>{reveal.text}</p>

            <button
              type="button"
              onClick={() => setReveal(null)}
            >
              ладно
            </button>
          </section>
        </div>
      )}
    </>
  );
}
