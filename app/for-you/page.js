"use client";

import { useEffect, useMemo, useState } from "react";
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
    text: "Нажми куда-нибудь. Может быть, сайт хотя бы развлечёт.",
    action: "дай что-нибудь",
  },
  {
    id: "sleepy",
    icon: "☾",
    label: "не спится",
    title: "Ну конечно.",
    text: "Ладно. Сделаем здесь немного тише, чем снаружи.",
    action: "ночной режим",
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

const BORED_THINGS = [
  "поймай маленькую точку",
  "переверни телефон и посмотри, что будет",
  "закрой глаза на 5 секунд. да, это весь квест.",
  "найди на экране самую маленькую деталь",
  "ткни сюда ещё раз. вдруг во второй раз лучше",
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
  const [ready, setReady] = useState(false);
  const [moodId, setMoodId] = useState(null);
  const [reaction, setReaction] = useState("");
  const [quiet, setQuiet] = useState(false);
  const [annoyedClean, setAnnoyedClean] = useState(false);
  const [sadLight, setSadLight] = useState(false);
  const [boredThing, setBoredThing] = useState("");
  const [nightMode, setNightMode] = useState(false);
  const [goodSaved, setGoodSaved] = useState(false);

  const dateKey = useMemo(() => getMinskDateKey(), []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        `kessi-mood-${dateKey}`
      );

      if (saved && MOODS.some((mood) => mood.id === saved)) {
        setMoodId(saved);
      }
    } catch {}

    setReady(true);
  }, [dateKey]);

  const mood =
    MOODS.find((item) => item.id === moodId) || null;

  function chooseMood(id) {
    setMoodId(id);
    setReaction("");
    setQuiet(false);
    setAnnoyedClean(false);
    setSadLight(false);
    setBoredThing("");
    setNightMode(false);
    setGoodSaved(false);

    try {
      localStorage.setItem(
        `kessi-mood-${dateKey}`,
        id
      );
    } catch {}
  }

  function changeMood() {
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

    showReaction.timer = window.setTimeout(() => {
      setReaction("");
    }, ms);
  }

  function moodAction() {
    if (!mood) return;

    if (mood.id === "okay") {
      showReaction("тогда просто оставим всё спокойно.");
    }

    if (mood.id === "tired") {
      setQuiet(true);
      showReaction("готово. ничего лишнего.");
    }

    if (mood.id === "annoyed") {
      setAnnoyedClean(true);
      showReaction("убрал. так лучше?");
    }

    if (mood.id === "sad") {
      setSadLight(true);
      showReaction("пусть пока просто горит.");
    }

    if (mood.id === "bored") {
      const next =
        BORED_THINGS[
          Math.floor(Math.random() * BORED_THINGS.length)
        ];

      setBoredThing(next);
      showReaction("держи.");
    }

    if (mood.id === "sleepy") {
      setNightMode(true);
      showReaction("теперь чуть тише.");
    }

    if (mood.id === "good") {
      setGoodSaved(true);

      try {
        localStorage.setItem(
          `kessi-good-${dateKey}`,
          "1"
        );
      } catch {}

      showReaction("сохранил.");
    }
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
              Можно выбрать первое, что подходит.
              Здесь нет правильного ответа.
            </p>
          </div>

          <div className="mood-grid">
            {MOODS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mood-choice mood-choice-${item.id}`}
                onClick={() => chooseMood(item.id)}
              >
                <span>{item.icon}</span>
                <b>{item.label}</b>
              </button>
            ))}
          </div>

          <div className="mood-picker-note">
            настроение сохранится только на сегодня
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
      }`}
    >
      <section className="mood-world">
        <div className="mood-background" aria-hidden="true">
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

        {!annoyedClean && (
          <section className="mood-action-zone">
            <button
              type="button"
              className="mood-main-action"
              onClick={moodAction}
            >
              {mood.action}
            </button>

            {mood.id === "bored" && boredThing && (
              <div className="bored-result">
                {boredThing}
              </div>
            )}

            {mood.id === "sad" && sadLight && (
              <button
                type="button"
                className="sad-little-light"
                onClick={() =>
                  showReaction("я всё ещё здесь.")
                }
                aria-label="Огонёк"
              >
                <span />
              </button>
            )}

            {mood.id === "good" && goodSaved && (
              <div className="good-saved-mark">
                <span>✦</span>
                <small>
                  этот момент остался здесь
                </small>
              </div>
            )}
          </section>
        )}

        {annoyedClean && (
          <section className="annoyed-empty">
            <p>всё. больше ничего.</p>

            <button
              type="button"
              onClick={() => setAnnoyedClean(false)}
            >
              ладно, верни
            </button>
          </section>
        )}

        {!annoyedClean && schedule && (
          <section className="mood-next-hello">
            <div>
              <small>следующий привет</small>
              <b>
                {dayNames?.[day] || ""} · {schedule.time}
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

        {nightMode && (
          <div className="night-particles" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
      </section>
    </main>
  );
}
