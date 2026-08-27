"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


/* =====================================================
   ТВОИ ЗАПИСКИ
===================================================== */

const NOTES = [
  {
    id: 1,

    title:
      "просто оставил тебе",

    text:
      "Если ты сюда заглянула — можешь ничего не делать. Просто посиди немного, потыкай что-нибудь и иди дальше по своим делам. Я просто хотел, чтобы у тебя было такое место.",
  },

  {
    id: 2,

    title:
      "на случай шумного дня",

    text:
      "Если сегодня вокруг слишком много всего — хотя бы здесь ничего от тебя не требуется.",
  },

  {
    id: 3,

    title:
      "маленькая записка",

    text:
      "Никакого важного повода. Просто увидел это место и подумал, что здесь должна лежать записка для тебя.",
  },
];


/* =====================================================
   МИНСК
===================================================== */

function getMinskTime() {
  return new Intl.DateTimeFormat(
    "ru-RU",
    {
      timeZone:
        "Europe/Minsk",

      hour:
        "2-digit",

      minute:
        "2-digit",

      hourCycle:
        "h23",
    }
  ).format(
    new Date()
  );
}


/* =====================================================
   СИНТЕТИЧЕСКИЙ ДОЖДЬ
===================================================== */

function createRainSound() {
  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {
    return null;
  }

  const context =
    new AudioContext();

  const duration =
    4;

  const buffer =
    context.createBuffer(
      2,
      context.sampleRate *
        duration,
      context.sampleRate
    );

  for (
    let channel = 0;
    channel < 2;
    channel++
  ) {
    const data =
      buffer.getChannelData(
        channel
      );

    for (
      let i = 0;
      i < data.length;
      i++
    ) {
      const noise =
        Math.random() * 2 -
        1;

      const fade =
        0.55 +
        Math.random() *
          0.45;

      data[i] =
        noise *
        fade *
        0.32;
    }
  }

  const source =
    context.createBufferSource();

  source.buffer =
    buffer;

  source.loop =
    true;

  const lowPass =
    context.createBiquadFilter();

  lowPass.type =
    "lowpass";

  lowPass.frequency.value =
    3500;

  const highPass =
    context.createBiquadFilter();

  highPass.type =
    "highpass";

  highPass.frequency.value =
    180;

  const gain =
    context.createGain();

  gain.gain.value =
    0.16;

  source.connect(
    lowPass
  );

  lowPass.connect(
    highPass
  );

  highPass.connect(
    gain
  );

  gain.connect(
    context.destination
  );

  source.start();

  return {
    context,
    source,
    gain,
  };
}


/* =====================================================
   PAGE
===================================================== */

export default function HomeRoomPage() {
  const [
    now,
    setNow,
  ] = useState(
    getMinskTime()
  );

  const [
    rainOn,
    setRainOn,
  ] = useState(
    false
  );

  const [
    lampOn,
    setLampOn,
  ] = useState(
    true
  );

  const [
    noteOpen,
    setNoteOpen,
  ] = useState(
    false
  );

  const [
    dragonAwake,
    setDragonAwake,
  ] = useState(
    false
  );

  const rainRef =
    useRef(
      null
    );

  /* ===================================================
     ВРЕМЯ
  =================================================== */

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          setNow(
            getMinskTime()
          );
        },
        30000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, []);

  /* ===================================================
     ЗАПИСКА НА ЭТОТ ВИЗИТ
  =================================================== */

  const note =
    useMemo(
      () =>
        NOTES[
          Math.floor(
            Math.random() *
              NOTES.length
          )
        ],
      []
    );

  /* ===================================================
     ДОЖДЬ
  =================================================== */

  async function toggleRain() {
    if (
      rainRef.current
    ) {
      try {
        rainRef.current
          .source
          .stop();
      } catch {}

      try {
        await rainRef.current
          .context
          .close();
      } catch {}

      rainRef.current =
        null;

      setRainOn(
        false
      );

      return;
    }

    try {
      const rain =
        createRainSound();

      if (!rain) {
        alert(
          "Этот браузер не умеет воспроизводить атмосферу."
        );
        return;
      }

      if (
        rain.context.state ===
        "suspended"
      ) {
        await rain.context
          .resume();
      }

      rainRef.current =
        rain;

      setRainOn(
        true
      );
    } catch (error) {
      console.error(
        "RAIN:",
        error
      );
    }
  }

  useEffect(() => {
    return () => {
      if (
        rainRef.current
      ) {
        try {
          rainRef.current
            .source
            .stop();
        } catch {}

        try {
          rainRef.current
            .context
            .close();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="home-room-page">

      <section className="home-room-intro">
        <div>
          <small>
            Минск · {now}
          </small>

          <h1>
            Домой
          </h1>

          <p>
            можешь просто
            побыть здесь
          </p>
        </div>

        <span className="home-room-intro-mark">
          ♡
        </span>
      </section>

      <section
        className={`
          home-room-scene
          ${
            lampOn
              ? "lamp-on"
              : "lamp-off"
          }
          ${
            rainOn
              ? "rain-on"
              : ""
          }
        `}
      >

        {/* ОКНО */}
        <div className="home-room-window">
          <div className="home-room-city">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>

          {
            rainOn &&
            (
              <div className="home-room-rain">
                {
                  Array.from({
                    length:
                      28,
                  }).map(
                    (
                      _,
                      index
                    ) => (
                      <i
                        key={
                          index
                        }
                        style={{
                          left:
                            `${
                              (
                                index *
                                37
                              ) %
                              100
                            }%`,
                          animationDelay:
                            `${
                              (
                                index %
                                9
                              ) *
                              -0.17
                            }s`,
                        }}
                      />
                    )
                  )
                }
              </div>
            )
          }

          <div className="home-room-night-glow" />
        </div>

        {/* ПОЛКА */}
        <div className="home-room-shelf">
          <span className="home-room-book book-one" />
          <span className="home-room-book book-two" />
          <span className="home-room-book book-three" />

          <span className="home-room-plant">
            ☘
          </span>
        </div>

        {/* ЛАМПА */}
        <button
          type="button"
          className="home-room-lamp"
          onClick={() =>
            setLampOn(
              (current) =>
                !current
            )
          }
          aria-label="Переключить свет"
        >
          <span />
          <i />
        </button>

        {/* ЗАПИСКА */}
        <button
          type="button"
          className="home-room-paper"
          onClick={() =>
            setNoteOpen(
              true
            )
          }
        >
          <small>
            оставлено тебе
          </small>

          <b>
            можешь почитать
          </b>

          <span>
            ↗
          </span>
        </button>

        {/* СТОЛ */}
        <div className="home-room-table">
          <button
            type="button"
            className="home-room-mug mug-obsid"
            aria-label="Чашка Обсидика"
          >
            <span />
            <small>
              Обсидик
            </small>
          </button>

          <button
            type="button"
            className="home-room-mug mug-kessi"
            aria-label="Чашка Кэссички"
          >
            <span />
            <small>
              Кэссичка
            </small>
          </button>
        </div>

        {/* ДРАКОША */}
        <button
          type="button"
          className={`
            home-room-dragon
            ${
              dragonAwake
                ? "awake"
                : ""
            }
          `}
          onClick={() =>
            setDragonAwake(
              (current) =>
                !current
            )
          }
          aria-label="Дракоша"
        >
          <img
            src="/drakosha.png"
            alt="Дракоша"
          />

          <span>
            {
              dragonAwake
                ? "👀"
                : "zZ"
            }
          </span>
        </button>

        <div className="home-room-floor-glow" />
      </section>

      <section className="home-room-controls">
        <button
          type="button"
          className={
            lampOn
              ? "active"
              : ""
          }
          onClick={() =>
            setLampOn(
              (current) =>
                !current
            )
          }
        >
          <span>
            ◐
          </span>

          <div>
            <b>
              свет
            </b>

            <small>
              {
                lampOn
                  ? "включён"
                  : "выключен"
              }
            </small>
          </div>
        </button>

        <button
          type="button"
          className={
            rainOn
              ? "active"
              : ""
          }
          onClick={
            toggleRain
          }
        >
          <span>
            ☂
          </span>

          <div>
            <b>
              дождь
            </b>

            <small>
              {
                rainOn
                  ? "шумит"
                  : "включить"
              }
            </small>
          </div>
        </button>
      </section>

      <div className="home-room-quiet-note">
        <span>
          “
        </span>

        <p>
          здесь ничего
          не надо успевать
        </p>
      </div>

      {
        noteOpen &&
        (
          <div
            className="home-note-overlay"
            onClick={() =>
              setNoteOpen(
                false
              )
            }
          >
            <article
              className="home-note-letter"
              onClick={
                (event) =>
                  event.stopPropagation()
              }
            >
              <button
                type="button"
                className="home-note-close"
                onClick={() =>
                  setNoteOpen(
                    false
                  )
                }
              >
                ×
              </button>

              <small>
                от обсидика
              </small>

              <h2>
                {note.title}
              </h2>

              <p>
                {note.text}
              </p>

              <span className="home-note-sign">
                ♡
              </span>
            </article>
          </div>
        )
      }
    </div>
  );
}
