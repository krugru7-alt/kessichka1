"use client";

import { useMemo, useState } from "react";

const diaries = [
  "Сегодня охранял сайт. Один раз уснул на посту. Никому не говори.",
  "Нашёл подозрительный носок. Расследование продолжается.",
  "Пытался управлять погодой в Минске. Пока умею только смотреть уверенно.",
  "Проверил запасы тьмоков. Запасы вызывают вопросы.",
  "Съел воображаемую печеньку. Вкусно. Доказательств нет.",
  "Ничего не сломал. Прошу считать это личным достижением.",
];

const reactions = {
  pet: [
    "Мрр… то есть ррр 🐉",
    "Ещё раз можно.",
    "Ладно, это было приятно.",
  ],

  snack: [
    "ХРУМ.",
    "Это было мне? Уже поздно, я съел.",
    "Спасибо. Теперь я официально добрее на 4%.",
  ],

  ask: [
    "Совет дня: не требуй от себя невозможного.",
    "Я бы поспал. Но ты решай сама.",
    "Обсидик сказал, что ты буська. Я проверил — похоже на правду.",
    "Пей воду. Да, я теперь ещё и врач-дракон.",
  ],
};

function getDragonStatus() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );

  if (hour < 7) {
    return [
      "спит. очень серьёзно.",
      "😴",
    ];
  }

  if (hour < 11) {
    return [
      "только проснулся и недоволен",
      "🥱",
    ];
  }

  if (hour < 18) {
    return [
      "занят очень важными делами",
      "🧐",
    ];
  }

  if (hour < 23) {
    return [
      "дома. делает вид, что работал",
      "🐉",
    ];
  }

  return [
    "готовится спать. не шуметь.",
    "🌙",
  ];
}

export default function DragonPage() {
  const [message, setMessage] =
    useState(
      "Тыкни что-нибудь. Я всё вижу."
    );

  const [taps, setTaps] =
    useState(0);

  const [status, mood] =
    getDragonStatus();

  const diary = useMemo(() => {
    const key = Number(
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Europe/Minsk",

          year:
            "numeric",

          month:
            "2-digit",

          day:
            "2-digit",
        }
      )
        .format(new Date())
        .replace(/\D/g, "")
    );

    return diaries[
      key % diaries.length
    ];
  }, []);

  function react(type) {
    const list =
      reactions[type];

    setMessage(
      list[
        Math.floor(
          Math.random() *
            list.length
        )
      ]
    );

    if (type === "pet") {
      setTaps(
        (current) =>
          current + 1
      );
    }
  }

  return (
    <div className="page">

      <section className="page-intro">

        <p className="eyebrow">
          отдельная важная персона
        </p>

        <h1>
          Дракоша
        </h1>

        <p>
          У него теперь своя
          страница. Он этого не
          заслужил, но уже поздно.
        </p>

      </section>

      <section className="dragon-stage">

        <div className="dragon-status">

          <small>
            сейчас
          </small>

          <b>
            {status}
          </b>

          <span>
            {mood}
          </span>

        </div>

        <button
          className="dragon-main"
          type="button"
          onClick={() =>
            react("pet")
          }
        >

          <div className="dragon-halo" />

          <img
            src="/drakosha.png"
            alt="Дракоша"
          />

        </button>

        <div className="dragon-speech">
          {message}
        </div>

        <div className="dragon-actions">

          <button
            type="button"
            onClick={() =>
              react("pet")
            }
          >

            <span>🤏</span>

            Погладить

          </button>

          <button
            type="button"
            onClick={() =>
              react("snack")
            }
          >

            <span>🍪</span>

            Вкусняшка

          </button>

          <button
            type="button"
            onClick={() =>
              react("ask")
            }
          >

            <span>💭</span>

            Спросить

          </button>

        </div>

      </section>

      <section className="diary-card">

        <div className="diary-tape" />

        <small>
          ДНЕВНИК ДРАКОШИ · СЕГОДНЯ
        </small>

        <p>
          {diary}
        </p>

        <span>
          — Д.
        </span>

      </section>

      {taps >= 7 && (
        <div className="secret-toast">
          🐾 Достижение:
          «загладить дракона до
          состояния кота»
        </div>
      )}

    </div>
  );
}
