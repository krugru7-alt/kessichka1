"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const notes = [
  "Здесь можно ничего не делать. Это буквально разрешено.",
  "Если день шумный — пусть хотя бы этот уголок будет тихим.",
  "Поесть, выдохнуть, не требовать от себя невозможного. План.",
  "Тьмок оставлен на столе. Не потеряй 💋",
  "Сегодня разрешается быть сонной буськой.",
  "Зайти сюда на минуту — уже считается.",
];

const garlands = [
  ["береги", "себя", "бус", "♥"],
  ["поешь", "отдохни", "улыбнись", "♥"],
  ["не", "спеши", "никуда", "✨"],
];

export default function RoomPage() {
  const [lamp, setLamp] =
    useState(false);

  const [noteOpen, setNoteOpen] =
    useState(false);

  const [garland, setGarland] =
    useState(0);

  const [objectClicks, setObjectClicks] =
    useState(0);

  const note = useMemo(() => {
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

    return notes[
      key % notes.length
    ];
  }, []);

  function touchObject() {
    setObjectClicks(
      (current) =>
        current + 1
    );
  }

  return (
    <div
      className={`page room-page ${
        lamp
          ? "room-lamp-on"
          : ""
      }`}
    >

      <section className="page-intro">

        <p className="eyebrow">
          можно просто побыть
        </p>

        <h1>
          Мой уголок
        </h1>

        <p>
          Не лента и не набор кнопок.
          Просто маленькое место с вещами.
        </p>

      </section>

      <section className="room-scene">

        <div className="room-light" />

        {/* =========================
            ГИРЛЯНДА
        ========================= */}

        <button
          className={`room-garland ${
            garland
              ? "changed"
              : ""
          }`}
          type="button"
          onClick={() =>
            setGarland(
              (current) =>
                (current + 1) %
                garlands.length
            )
          }
        >

          <span className="garland-line" />

          {garlands[
            garland
          ].map(
            (
              word,
              index
            ) => (
              <i
                key={`${word}-${index}`}
                style={{
                  "--i":
                    index,
                }}
              >
                {word}
              </i>
            )
          )}

        </button>

        {/* =========================
            НАДПИСЬ НА СТЕНЕ
        ========================= */}

        <div className="room-wall-copy">

          <small>
            THIS PLACE BELONGS TO
          </small>

          <b>
            одной буське
          </b>

        </div>

        {/* =========================
            ЛАМПА
        ========================= */}

        <button
          className={`real-lamp ${
            lamp
              ? "on"
              : ""
          }`}
          type="button"
          onClick={() =>
            setLamp(
              (current) =>
                !current
            )
          }
          aria-pressed={lamp}
        >

          <span className="lamp-aura" />

          <span className="lamp-shade" />

          <span className="lamp-neck" />

          <span className="lamp-base" />

          <em>
            {lamp
              ? "выключить"
              : "включить свет"}
          </em>

        </button>

        {/* =========================
            СТОЛ
        ========================= */}

        <div className="room-desk-v2">

          <span className="desk-board" />

          <button
            className={`paper-note ${
              noteOpen
                ? "open"
                : ""
            }`}
            type="button"
            onClick={() =>
              setNoteOpen(
                (current) =>
                  !current
              )
            }
          >

            <span className="paper-clip">
              ⌇
            </span>

            <small>
              {noteOpen
                ? "ОБРАТНАЯ СТОРОНА"
                : "ЗАПИСКА"}
            </small>

            <p>
              {noteOpen
                ? "P.S. если ты это нашла — дополнительный тьмок уже начислен 💋"
                : note}
            </p>

            <i>
              {noteOpen
                ? "перевернуть обратно"
                : "тыкни — она двусторонняя"}
            </i>

          </button>

          {/* КРУЖКА */}

          <button
            className="room-cup"
            type="button"
            onClick={
              touchObject
            }
          >

            ☕

            {objectClicks >
              0 && (
              <small>

                {objectClicks >
                2
                  ? "опять пусто"
                  : "пусто :("}

              </small>
            )}

          </button>

        </div>

        {/* =========================
            ПОЛАРОИДЫ
        ========================= */}

        <div className="polaroid-wall-v2">

          <div className="polaroid p-one">

            <div>
              🐉
            </div>

            <span>
              подозрительный житель
            </span>

          </div>

          <div className="polaroid p-two">

            <div>
              ♥
            </div>

            <span>
              оставлено здесь
            </span>

          </div>

          <span className="tiny-wall-note">
            возвращайся иногда
          </span>

        </div>

        {/* =========================
            СТРАННЫЙ ОБЪЕКТ
        ========================= */}

        <div className="mystery-area">

          <p>
            На стене есть одна вещь,
            которой здесь вроде бы
            не должно быть.
          </p>

          <Link
            className="mystery-orb"
            href="/secret"
            onClick={() => {
              if (
                typeof window !==
                "undefined"
              ) {
                localStorage.setItem(
                  "kessi-secret-seen",
                  "1"
                );
              }
            }}
          >

            <span />

            <i>
              ?
            </i>

          </Link>

          <small>
            не трогать
          </small>

        </div>

      </section>

    </div>
  );
}
