"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import WeatherMini from "./components/WeatherMini";

import {
  getCurrentScheduleItem,
  getCurrentDay,
  dayNames,
} from "./schedule";


const messages = [
  "Просто напоминаю: ты очень важная буська. ❤️",
  "Сегодня не обязательно успеть всё. Правда.",
  "Если день вредничает — вредничай в ответ совсем чуть-чуть.",
  "Пусть сегодня найдётся хотя бы один момент, который тебя порадует.",
  "Где-то далеко один Обсидик очень хочет, чтобы у тебя всё было хорошо.",
  "Поесть, попить воды и иногда отдыхать — официальный план.",
  "Тьмок без причины 💋",
];


/* =====================================================
   МИНСКОЕ ВРЕМЯ
===================================================== */

function getMinskHour(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "Europe/Minsk",
        hour: "numeric",
        hourCycle: "h23",
      }
    ).format(date)
  );
}


/* =====================================================
   ПРИВЕТСТВИЕ
===================================================== */

function getGreeting(hour) {
  if (
    hour >= 6 &&
    hour < 12
  ) {
    return [
      "Доброе утро, бус ❤️",
      "🌅",
    ];
  }

  if (
    hour >= 12 &&
    hour < 18
  ) {
    return [
      "Хорошего дня, бус ❤️",
      "☀️",
    ];
  }

  if (
    hour >= 18 &&
    hour < 22
  ) {
    return [
      "Добрый вечер, бус ❤️",
      "🌆",
    ];
  }

  return [
    "Спокойной ночи, бус ❤️",
    "🌙",
  ];
}


/* =====================================================
   ГЛАВНАЯ
===================================================== */

export default function HomePage() {
  const [now, setNow] =
    useState(new Date());


  useEffect(() => {
    const timer =
      setInterval(
        () => {
          setNow(
            new Date()
          );
        },
        30000
      );

    return () =>
      clearInterval(
        timer
      );
  }, []);


  const hour =
    getMinskHour(now);

  const [
    greeting,
    icon,
  ] = getGreeting(hour);


  const minskTime =
    new Intl.DateTimeFormat(
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
    ).format(now);


  /* =====================================================
     СООБЩЕНИЕ ДНЯ
  ===================================================== */

  const dateKey =
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
    ).format(now);


  const message =
    useMemo(() => {
      const seed =
        Number(
          dateKey.replace(
            /\D/g,
            ""
          )
        ) || 1;

      return messages[
        seed %
          messages.length
      ];
    }, [dateKey]);


  /* =====================================================
     БЛИЖАЙШЕЕ СОБЫТИЕ
  ===================================================== */

  let schedule = null;
  let day = null;

  try {
    schedule =
      getCurrentScheduleItem();

    day =
      getCurrentDay();
  } catch {
    schedule = null;
    day = null;
  }


  return (
    <div className="page home-page">

      {/* ===============================================
          ПРИВЕТСТВИЕ
      =============================================== */}

      <section className="hero-card">

        <div className="hero-topline">

          <span className="hero-time">
            Минск · {minskTime}
          </span>

          <span className="hero-weather-dot">
            online
          </span>

        </div>


        <div className="hero-icon">
          {icon}
        </div>


        <p className="eyebrow">
          твой маленький уголок
        </p>


        <h1>
          {greeting}
        </h1>


        <p className="hero-text">
          {message}
        </p>

      </section>


      {/* ===============================================
          ПОГОДА
      =============================================== */}

      <WeatherMini />


      {/* ===============================================
          БЛИЖАЙШЕЕ УВЕДОМЛЕНИЕ
      =============================================== */}

      {schedule && (

        <section className="next-note">

          <div>

            <small>
              Следующий привет
            </small>

            <b>
              {dayNames?.[day] || ""}
              {" · "}
              {schedule.time}
            </b>

          </div>


          <span>
            {schedule.title}
          </span>

        </section>

      )}


      {/* ===============================================
          ОТДЕЛЫ
      =============================================== */}

      <section className="home-departments">

        <div className="home-departments-head">

          <div>
            <small>
              ОТДЕЛЫ
            </small>

            <h2>
              Куда заглянем?
            </h2>
          </div>

          <span>
            ↓
          </span>

        </div>


        {/* =============================================
            ВСЁ СЕРЬЁЗНО
        ============================================= */}

        <Link
          href="/chancery"
          className="home-department-card serious-department"
        >

          <div className="department-card-top">

            <span className="department-number">
              ОТДЕЛ №01
            </span>

            <span className="department-status">
              РАБОТАЕТ
            </span>

          </div>


          <div className="department-icon">
            ⚖
          </div>


          <div className="department-copy">

            <small>
              ЭЛЕКТРОННАЯ КАНЦЕЛЯРИЯ
            </small>

            <h3>
              Всё серьёзно
            </h3>

            <p>
              Договорчики, акты,
              заявления и прочие
              бумаги чрезвычайной
              важности.
            </p>

          </div>


          <div className="department-card-bottom">

            <span>
              открыть отдел
            </span>

            <b>
              →
            </b>

          </div>

        </Link>

      </section>


      {/* ===============================================
          ПОДПИСЬ
      =============================================== */}

      <p className="home-signature">
        Обсидик был здесь ❤️
      </p>

    </div>
  );
}
