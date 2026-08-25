"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCurrentScheduleItem,
  getCurrentDay,
  dayNames,
} from "../schedule";

const MOODS = [
  {
    id: "okay",
    icon: "◌",
    label: "нормально",
    title: "Ну и хорошо.",
    text: "Пусть сегодня всё идёт без лишней суеты.",
    action: "оставить как есть",
  },
  {
    id: "tired",
    icon: "⌁",
    label: "устала",
    title: "Тогда сегодня помедленнее.",
    text: "Ничего страшного, если не хочется быть продуктивной каждую секунду.",
    action: "сделать потише",
  },
  {
    id: "annoyed",
    icon: "×",
    label: "всё бесит",
    title: "Понял. Убираем лишнее.",
    text: "Здесь хотя бы можно немного повредничать без последствий.",
    action: "убрать всё",
  },
  {
    id: "sad",
    icon: "·",
    label: "грустно",
    title: "Я побуду здесь тихо.",
    text: "Не обязательно сейчас что-то объяснять или исправлять.",
    action: "оставить огонёк",
  },
  {
    id: "bored",
    icon: "↝",
    label: "скучно",
    title: "Так. Это уже поправимо.",
    text: "Здесь есть несколько вещей, которые появляются не сразу.",
    action: "пошевелить сайт",
  },
  {
    id: "sleepy",
    icon: "☾",
    label: "не спится",
    title: "Ну конечно.",
    text: "Ладно. Сделаем здесь немного тише, чем снаружи.",
    action: "приглушить всё",
  },
  {
    id: "good",
    icon: "✦",
    label: "хорошо",
    title: "Вот это мне нравится.",
    text: "Тогда ничего не исправляем. Просто сохраним этот момент.",
    action: "зафиксировать",
  },
];

const ANNOYED_BITS = [
  { id: 1, text: "лишнее", x: 18, y: 22 },
  { id: 2, text: "ещё одно дело", x: 68, y: 31 },
  { id: 3, text: "ну конечно", x: 28, y: 62 },
  { id: 4, text: "не сегодня", x: 73, y: 69 },
];

const BORED_LINES = [
  "сайт задумался",
  "ничего полезного не происходит",
  "можно ткнуть ещё раз",
  "кажется, что-то шевельнулось",
  "ладно, вот тебе ✦",
];

function getMinskDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function ForYouPage() {
  const tiredHoldRef = useRef(null);
  const boredTimerRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [moodId, setMoodId] = useState(null);
  const [reaction, setReaction] = useState("");

  const [quiet, setQuiet] = useState(false);

  const [annoyedBits, setAnnoyedBits] = useState(
    ANNOYED_BITS.map((item) => item.id)
  );
  const [annoyedClean, setAnnoyedClean] = useState(false);

  const [sadLights, setSadLights] = useState([]);
  const [sadSecret, setSadSecret] = useState(false);

  const [boredCount, setBoredCount] = useState(0);
  const [boredLine, setBoredLine] = useState("");
  const [boredDot, setBoredDot] = useState(null);

  const [nightMode, setNightMode] = useState(false);
  const [nightTapCount, setNightTapCount] = useState(0);
  const [nightSecret, setNightSecret] = useState(false);

  const [goodSaved, setGoodSaved] = useState(false);
  const [goodSparks, setGoodSparks] = useState([]);

  const dateKey = useMemo(() => getMinskDateKey(), []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        `kessi-mood-${dateKey}`
      );

      if (
        saved &&
        MOODS.some((mood) => mood.id === saved)
      ) {
        setMoodId(saved);
      }

      setGoodSaved(
        localStorage.getItem(
          `kessi-good-${dateKey}`
        ) === "1"
      );
    } catch {}

    setReady(true);

    return () => {
      window.clearTimeout(tiredHoldRef.current);
      window.clearTimeout(boredTimerRef.current);
      window.clearTimeout(showReaction.timer);
    };
  }, [dateKey]);

  const mood =
    MOODS.find((item) => item.id === moodId) || null;

  function resetMoodState() {
    setReaction("");
    setQuiet(false);

    setAnnoyedBits(
      ANNOYED_BITS.map((item) => item.id)
    );
    setAnnoyedClean(false);

    setSadLights([]);
    setSadSecret(false);

    setBoredCount(0);
    setBoredLine("");
    setBoredDot(null);

    setNightMode(false);
    setNightTapCount(0);
    setNightSecret(false);

    setGoodSparks([]);
  }

  function chooseMood(id) {
    resetMoodState();
    setMoodId(id);

    try {
      localStorage.setItem(
        `kessi-mood-${dateKey}`,
        id
      );
    } catch {}
  }

  function changeMood() {
    resetMoodState();
    setMoodId(null);

    try {
      localStorage.removeItem(
        `kessi-mood-${dateKey}`
      );
    } catch {}
  }

  function showReaction(text, ms = 2300) {
    setReaction(text);

    window.clearTimeout(showReaction.timer);

    showReaction.timer =
      window.setTimeout(() => {
        setReaction("");
      }, ms);
  }

  function mainAction() {
    if (!mood) return;

    if (mood.id === "okay") {
      showReaction(
        "тогда просто оставим всё спокойно."
      );
    }

    if (mood.id === "tired") {
      setQuiet(true);
      showReaction("готово. потише.");
    }

    if (mood.id === "annoyed") {
      setAnnoyedClean(true);
      setAnnoyedBits([]);
      showReaction("всё убрал.");
    }

    if (mood.id === "sad") {
      if (sadLights.length === 0) {
        setSadLights([
          { id: Date.now(), x: 50, y: 50 },
        ]);
      }

      showReaction("пусть пока просто горит.");
    }

    if (mood.id === "bored") {
      boredInteract();
    }

    if (mood.id === "sleepy") {
      setNightMode(true);
      showReaction("теперь совсем тихо.");
    }

    if (mood.id === "good") {
      saveGoodMoment();
    }
  }

  /* ===================================================
     УСТАЛА
  =================================================== */

  function startTiredHold() {
    window.clearTimeout(tiredHoldRef.current);

    tiredHoldRef.current =
      window.setTimeout(() => {
        setQuiet(true);

        showReaction(
          "вот так. можно ничего не делать.",
          3000
        );
      }, 1800);
  }

  function stopTiredHold() {
    window.clearTimeout(tiredHoldRef.current);
  }

  /* ===================================================
     ВСЁ БЕСИТ
  =================================================== */

  function removeAnnoyedBit(id) {
    setAnnoyedBits((current) =>
      current.filter((item) => item !== id)
    );

    const left =
      annoyedBits.filter((item) => item !== id)
        .length;

    if (left === 0) {
      showReaction("вот. уже меньше.");
    }
  }

  /* ===================================================
     ГРУСТНО
  =================================================== */

  function addSadLight(event) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    setSadLights((current) => [
      ...current.slice(-7),
      {
        id: Date.now() + Math.random(),
        x,
        y,
      },
    ]);

    if (sadLights.length >= 4 && !sadSecret) {
      setSadSecret(true);

      window.setTimeout(() => {
        showReaction(
          "смотри, уже не так пусто.",
          2800
        );
      }, 400);
    }
  }

  /* ===================================================
     СКУЧНО
  =================================================== */

  function boredInteract() {
    const next = boredCount + 1;
    setBoredCount(next);

    setBoredLine(
      BORED_LINES[
        Math.min(
          BORED_LINES.length - 1,
          next - 1
        )
      ]
    );

    if (next === 3) {
      setBoredDot({
        x: 20 + Math.random() * 60,
        y: 28 + Math.random() * 38,
      });

      showReaction(
        "кажется, что-то появилось."
      );
    }

    if (next >= 5) {
      setBoredCount(0);
      showReaction(
        "ладно. ты победила скуку на секунд десять."
      );
    }

    window.clearTimeout(boredTimerRef.current);

    boredTimerRef.current =
      window.setTimeout(() => {
        if (next < 3) {
          setBoredLine("");
        }
      }, 3500);
  }

  function catchBoredDot() {
    setBoredDot({
      x: 16 + Math.random() * 68,
      y: 24 + Math.random() * 46,
    });

    showReaction("неа.");

    if (boredCount >= 4) {
      setBoredDot(null);
      showReaction("ладно, поймала.");
    }
  }

  /* ===================================================
     НЕ СПИТСЯ
  =================================================== */

  function tapNight() {
    const next = nightTapCount + 1;
    setNightTapCount(next);

    if (next === 3) {
      showReaction("тише.");
    }

    if (next >= 7 && !nightSecret) {
      setNightSecret(true);
      showReaction(
        "семь раз. серьёзно?",
        2600
      );
    }
  }

  /* ===================================================
     ХОРОШО
  =================================================== */

  function saveGoodMoment() {
    setGoodSaved(true);

    try {
      localStorage.setItem(
        `kessi-good-${dateKey}`,
        "1"
      );
    } catch {}

    setGoodSparks([
      { id: 1, x: 27, y: 43 },
      { id: 2, x: 72, y: 36 },
      { id: 3, x: 56, y: 66 },
      { id: 4, x: 38, y: 73 },
    ]);

    showReaction("сохранил.");
  }

  let schedule = null;
  let day = null;

  try {
    schedule = getCurrentScheduleItem();
    day = getCurrentDay();
  } catch {}

  if (!ready) {
    return (
      <main className="mood-page mood-loading">
        <div className="mood-loading-dot" />
      </main>
    );
  }

  if (!mood) {
    return (
      <main className="mood-page mood-picker-page">
        <section className="mood-picker">
          <div className="mood-picker-copy">
            <small>ДЛЯ ТЕБЯ</small>

            <h1>Как ты сегодня?</h1>

            <p>
              Выбери первое, что подходит.
              Дальше сайт сам подстроится.
            </p>
          </div>

          <div className="mood-grid">
            {MOODS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mood-choice mood-choice-${item.id}`}
                onClick={() =>
                  chooseMood(item.id)
                }
              >
                <span>{item.icon}</span>
                <b>{item.label}</b>
              </button>
            ))}
          </div>

          <div className="mood-picker-note">
            выбор сохранится только на сегодня
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className={`mood-page mood-${mood.id} ${
        quiet ? "is-quiet" : ""
      } ${
        annoyedClean ? "is-clean" : ""
      } ${
        nightMode ? "is-night-deep" : ""
      } ${
        sadSecret ? "has-sad-secret" : ""
      }`}
    >
      <section className="mood-world">
        <div
          className="mood-background"
          aria-hidden="true"
        >
          <span className="mood-orb orb-a" />
          <span className="mood-orb orb-b" />
          <span className="mood-orb orb-c" />
        </div>

        <header className="mood-header">
          <div>
            <small>ДЛЯ ТЕБЯ</small>
            <h1>{mood.label}</h1>
          </div>

          <button
            type="button"
            className="change-mood"
            onClick={changeMood}
          >
            настроение изменилось?
          </button>
        </header>

        <section className="mood-main-card">
          <span className="mood-main-icon">
            {mood.icon}
          </span>

          <div>
            <h2>{mood.title}</h2>
            <p>{mood.text}</p>
          </div>
        </section>

        {/* НОРМАЛЬНО */}
        {mood.id === "okay" && (
          <section className="mood-special mood-special-okay">
            <button
              type="button"
              className="mood-main-action"
              onClick={mainAction}
            >
              {mood.action}
            </button>

            <span className="okay-line">
              сегодня без спецэффектов
            </span>
          </section>
        )}

        {/* УСТАЛА */}
        {mood.id === "tired" && (
          <section className="mood-special mood-special-tired">
            <button
              type="button"
              className="tired-hold"
              onPointerDown={startTiredHold}
              onPointerUp={stopTiredHold}
              onPointerCancel={stopTiredHold}
              onPointerLeave={stopTiredHold}
            >
              <span />
              <b>подержи немного</b>
              <small>
                ничего делать не надо
              </small>
            </button>
          </section>
        )}

        {/* ВСЁ БЕСИТ */}
        {mood.id === "annoyed" && (
          <section className="mood-special mood-special-annoyed">
            {!annoyedClean &&
              ANNOYED_BITS.map((bit) =>
                annoyedBits.includes(bit.id) ? (
                  <button
                    key={bit.id}
                    type="button"
                    className="annoyed-bit"
                    style={{
                      left: `${bit.x}%`,
                      top: `${bit.y}%`,
                    }}
                    onClick={() =>
                      removeAnnoyedBit(bit.id)
                    }
                  >
                    {bit.text}
                  </button>
                ) : null
              )}

            {!annoyedClean && (
              <button
                type="button"
                className="mood-main-action annoyed-clear-all"
                onClick={mainAction}
              >
                убрать вообще всё
              </button>
            )}

            {annoyedClean && (
              <div className="annoyed-empty">
                <p>всё. чисто.</p>

                <button
                  type="button"
                  onClick={() => {
                    setAnnoyedClean(false);
                    setAnnoyedBits(
                      ANNOYED_BITS.map(
                        (item) => item.id
                      )
                    );
                  }}
                >
                  ладно, верни
                </button>
              </div>
            )}
          </section>
        )}

        {/* ГРУСТНО */}
        {mood.id === "sad" && (
          <section
            className="mood-special mood-special-sad"
            onPointerDown={addSadLight}
          >
            <span className="sad-hint">
              можно просто потыкать сюда
            </span>

            {sadLights.map((light) => (
              <span
                key={light.id}
                className="sad-created-light"
                style={{
                  left: `${light.x}%`,
                  top: `${light.y}%`,
                }}
              />
            ))}

            {sadSecret && (
              <span className="sad-secret-copy">
                уже не так пусто
              </span>
            )}
          </section>
        )}

        {/* СКУЧНО */}
        {mood.id === "bored" && (
          <section className="mood-special mood-special-bored">
            <button
              type="button"
              className="mood-main-action"
              onClick={boredInteract}
            >
              что-нибудь
            </button>

            {boredLine && (
              <div className="bored-result">
                {boredLine}
              </div>
            )}

            {boredDot && (
              <button
                type="button"
                className="bored-runaway-dot"
                style={{
                  left: `${boredDot.x}%`,
                  top: `${boredDot.y}%`,
                }}
                onClick={catchBoredDot}
                aria-label="Поймать"
              >
                ·
              </button>
            )}
          </section>
        )}

        {/* НЕ СПИТСЯ */}
        {mood.id === "sleepy" && (
          <section
            className="mood-special mood-special-sleepy"
            onPointerDown={tapNight}
          >
            <button
              type="button"
              className="mood-main-action sleepy-button"
              onClick={(event) => {
                event.stopPropagation();
                mainAction();
              }}
            >
              {mood.action}
            </button>

            <div className="night-particles">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            {nightSecret && (
              <div className="night-secret">
                <span>☾</span>
                <small>
                  ладно. ещё немного не спим.
                </small>
              </div>
            )}
          </section>
        )}

        {/* ХОРОШО */}
        {mood.id === "good" && (
          <section className="mood-special mood-special-good">
            <button
              type="button"
              className="mood-main-action"
              onClick={saveGoodMoment}
            >
              {goodSaved
                ? "уже сохранено"
                : mood.action}
            </button>

            {goodSparks.map((spark) => (
              <span
                key={spark.id}
                className="good-spark"
                style={{
                  left: `${spark.x}%`,
                  top: `${spark.y}%`,
                }}
              >
                ✦
              </span>
            ))}

            {goodSaved && (
              <div className="good-saved-mark">
                <span>✦</span>

                <small>
                  этот момент остался здесь
                </small>
              </div>
            )}
          </section>
        )}

        {schedule && !annoyedClean && (
          <section className="mood-next-hello">
            <div>
              <small>следующий привет</small>

              <b>
                {dayNames?.[day] || ""} ·{" "}
                {schedule.time}
              </b>
            </div>

            <span>{schedule.title}</span>
          </section>
        )}

        {reaction && (
          <div className="mood-reaction">
            {reaction}
          </div>
        )}
      </section>
    </main>
  );
}
