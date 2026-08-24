"use client";

import { useEffect, useState } from "react";
import "./globals.css";

import {
  getCurrentScheduleItem,
  getCurrentDay,
  dayNames,
} from "./schedule";

const dailyMessages = [
  "У тебя сегодня всё получится. А если нет - ничего страшного, я всё равно рядом. ❤️",
  "Сегодня просто напоминание я скучаю 😌",
  "Пусть сегодня у тебя будет хотя бы один момент, когда ты поймаешь себя на мысли: «А ведь день неплохой». 🌷",
  "Ты уже проснулась - значит, день официально начался. Теперь осталось сделать его немного приятнее. ☀️",
  "Просто не забывай, что кое-кто далеко очень хочет видеть тебя счастливой. ❤️",
  "Маленькое утреннее напоминание: ты прекрасна. Всё, я сказал. 😌",
  "Пусть сегодня всё складывается чуть легче, чем ты ожидаешь. А если день будет вредничать - будем вредничать вместе с ним. ❤️",
];

const dragonPhrases = [
  "Сижу. Наблюдаю. Осуждаю 👀",
  "Я вообще-то занят поиском буськи 🐉",
  "Проверка связи: тьмок работает? 💋",
  "Дракоша сообщает: пора немного отдохнуть.",
  "Ушёл искать вкусняшку. Скоро буду.",
  "Сегодня я официально ничего не делаю 😌",
  "Обсидик просил за тобой присматривать 👀",
];

const redButtonPhrases = [
  "Я же написал: НЕ НАЖИМАТЬ.",
  "Кэссичка.",
  "Ты серьёзно? 👀",
  "Ещё раз — и я вызываю Дракошу.",
  "🐉 Дракоша уже в пути.",
  "Последнее предупреждение.",
  "Ладно. Теперь это твоя кнопка.",
  "Ты победила кнопку. Наверное.",
  "💋 ШТРАФНОЙ ТЬМОК!",
  "Всё. Кнопка увольняется.",
];

function urlBase64ToUint8Array(base64String) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray =
    new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] =
      rawData.charCodeAt(i);
  }

  return outputArray;
}

function getMinskHour() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );
}

function getTimeOfDay() {
  const hour = getMinskHour();

  if (hour >= 6 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 18) {
    return "day";
  }

  if (hour >= 18 && hour < 22) {
    return "evening";
  }

  return "night";
}

function weatherText(code) {
  if (code === 0) return "Ясно всё гуд ☀️";

  if ([1, 2, 3].includes(code))
    return "Облачно вайбик 🌤️";

  if ([45, 48].includes(code))
    return "Туман сайлентхилл 🌫️";

  if ([51, 53, 55, 56, 57].includes(code))
    return "Морось фе 🌦️";

  if ([61, 63, 65, 66, 67].includes(code))
    return "Дождь +вайб 🌧️";

  if ([71, 73, 75, 77].includes(code))
    return "Снег вайбик ❄️";

  if ([80, 81, 82].includes(code))
    return "Ливень любимое 🌧️";

  if ([85, 86].includes(code))
    return "Снегопад ❄️";

  if ([95, 96, 99].includes(code))
    return "Гроза ⛈️";

  return "Погода сегодня загадочная 🌥️";
}

function getWeatherAdvice(weather) {
  if (weather.temperature < 0) {
    return "Сегодня холодно - пожалуйста, оденься потеплее 🧣";
  }

  if (weather.temperature < 10) {
    return "На улице прохладно - надень что-нибудь тёплое 🧥";
  }

  if (weather.rainChance >= 50) {
    return "Берем зонтик але ☔";
  }

  if (weather.temperature >= 25) {
    return "Сегодня тепло всё гуд малыш ☀️";
  }

  return "Погода вроде хорошая. Хорошего тебе дня 🌷";
}

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  const [showKiss, setShowKiss] = useState(false);

  // ==============================
  // ДРАКОША
  // ==============================

  const [drakoshaAction, setDrakoshaAction] =
    useState("idle");

  const [drakoshaBubble, setDrakoshaBubble] =
    useState("Тыкни 👀");

  const [dragonHouseOpen, setDragonHouseOpen] =
    useState(false);

  const [dragonHousePhrase, setDragonHousePhrase] =
    useState(dragonPhrases[0]);

  // ==============================
  // НОЧНОЙ СЕКРЕТ
  // ==============================

  const [nightSecretOpen, setNightSecretOpen] =
    useState(false);

  // ==============================
  // ПАСХАЛКИ
  // ==============================

  const [weatherClicks, setWeatherClicks] =
    useState(0);

  const [signatureClicks, setSignatureClicks] =
    useState(0);

  const [easterEgg, setEasterEgg] =
    useState("");

  // ==============================
  // КРАСНАЯ КНОПКА
  // ==============================

  const [redButtonCount, setRedButtonCount] =
    useState(0);

  const [redButtonText, setRedButtonText] =
    useState("НЕ НАЖИМАТЬ");

  // ==============================
  // PUSH
  // ==============================

  async function enablePushNotifications() {
    try {
      setPushLoading(true);

      if (!("Notification" in window)) {
        alert(
          "Этот браузер не поддерживает уведомления."
        );
        return;
      }

      if (!("serviceWorker" in navigator)) {
        alert(
          "Этот браузер не поддерживает Push-уведомления."
        );
        return;
      }

      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        alert(
          "Разрешение на уведомления не получено."
        );
        return;
      }

      const registration =
        await navigator.serviceWorker.ready;

      if (!registration.pushManager) {
        alert(
          "Push-уведомления недоступны в этом браузере."
        );
        return;
      }

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error(
            "NEXT_PUBLIC_VAPID_PUBLIC_KEY не найден."
          );
        }

        const applicationServerKey =
          urlBase64ToUint8Array(publicKey);

        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
      }

      const response =
        await fetch("/api/subscribe", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(subscription),
        });

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.error ||
            "Не удалось сохранить Push-подписку."
        );
      }

      setPushEnabled(true);

      alert(
        "Уведомления подключены ❤️"
      );
    } catch (error) {
      console.error(
        "Ошибка подключения уведомлений:",
        error
      );

      alert(
        "ОШИБКА PUSH:\n\n" +
          String(
            error?.name ||
              "UnknownError"
          ) +
          "\n\n" +
          String(
            error?.message ||
              error
          )
      );
    } finally {
      setPushLoading(false);
    }
  }

  // ==============================
  // ВРЕМЯ
  // ==============================

  useEffect(() => {
    const timer =
      setInterval(() => {
        setNow(new Date());
      }, 60000);

    return () =>
      clearInterval(timer);
  }, []);

  // ==============================
  // ПОГОДА
  // ==============================

  useEffect(() => {
    fetch("/api/weather")
      .then((response) =>
        response.json()
      )
      .then((data) =>
        setWeather(data)
      )
      .catch(() =>
        setWeather({
          error: true,
        })
      );
  }, []);

  // ==============================
  // SERVICE WORKER
  // ==============================

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.error(
            "Ошибка регистрации Service Worker:",
            error
          );
        });
    }
  }, []);

  // ==============================
  // СЛУЧАЙНЫЕ ДЕЙСТВИЯ ДРАКОШИ
  // ==============================

  useEffect(() => {
    let actionTimer;
    let resetTimer;

    const actions = [
      "hop",
      "wave",
      "sleep",
    ];

    const bubbles = [
      "Тыкни 👀",
      "Я тут 🐉",
      "Бус?",
      "Жду тьмок 💜",
      "Не забудь поесть 👀",
      "Я слежу 😌",
    ];

    function scheduleAction() {
      const delay =
        Math.floor(
          Math.random() * 15000
        ) + 12000;

      actionTimer =
        setTimeout(() => {
          const randomAction =
            actions[
              Math.floor(
                Math.random() *
                  actions.length
              )
            ];

          const randomBubble =
            bubbles[
              Math.floor(
                Math.random() *
                  bubbles.length
              )
            ];

          setDrakoshaAction(
            randomAction
          );

          setDrakoshaBubble(
            randomBubble
          );

          resetTimer =
            setTimeout(() => {
              setDrakoshaAction(
                "idle"
              );

              scheduleAction();
            }, 1800);
        }, delay);
    }

    scheduleAction();

    return () => {
      clearTimeout(actionTimer);
      clearTimeout(resetTimer);
    };
  }, []);

  // ==============================
  // DOMIK
  // ==============================

  function openDragonHouse() {
    const phrase =
      dragonPhrases[
        Math.floor(
          Math.random() *
            dragonPhrases.length
        )
      ];

    setDragonHousePhrase(phrase);
    setDragonHouseOpen(true);
  }

  // ==============================
  // RED BUTTON
  // ==============================

  function pressRedButton() {
    const newCount =
      redButtonCount + 1;

    setRedButtonCount(newCount);

    const index =
      Math.min(
        newCount - 1,
        redButtonPhrases.length - 1
      );

    setRedButtonText(
      redButtonPhrases[index]
    );

    if (newCount === 9) {
      setShowKiss(true);

      setTimeout(() => {
        setShowKiss(false);
      }, 1500);
    }
  }

  // ==============================
  // ПАСХАЛКА ПОГОДЫ
  // ==============================

  function weatherEgg() {
    const clicks =
      weatherClicks + 1;

    setWeatherClicks(clicks);

    if (clicks === 5) {
      setEasterEgg(
        "🌦️ Секрет найден: погода официально находится под контролем Дракоши."
      );

      setWeatherClicks(0);
    }
  }

  // ==============================
  // ПАСХАЛКА ПОДПИСИ
  // ==============================

  function signatureEgg() {
    const clicks =
      signatureClicks + 1;

    setSignatureClicks(clicks);

    if (clicks === 4) {
      setEasterEgg(
        "❤️ Обсидик был здесь. И вообще-то очень скучает."
      );

      setSignatureClicks(0);
    }
  }

  const timeOfDay =
    getTimeOfDay();

  const currentSchedule =
    getCurrentScheduleItem();

  const currentDay =
    getCurrentDay();

  const minskTime =
    new Intl.DateTimeFormat(
      "ru-RU",
      {
        timeZone:
          "Europe/Minsk",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }
    ).format(now);

  const minskHour =
    getMinskHour();

  const isNight =
    minskHour >= 22 ||
    minskHour < 6;

  const today =
    new Date();

  const message =
    dailyMessages[
      Math.floor(
        (
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ) -
          new Date(
            2026,
            0,
            1
          )
        ) /
          86400000
      ) %
        dailyMessages.length
    ];

  return (
    <main
      className={`kessichka-page ${timeOfDay}`}
    >
      <style>
        {`

        /* =========================
           НОВЫЕ ШТУКИ
        ========================= */

        .fun-zone {
          margin-top: 18px;
          display: grid;
          gap: 12px;
        }

        .fun-card {
          padding: 16px;
          border-radius: 20px;

          border:
            1px solid
            rgba(255,255,255,.08);

          background:
            rgba(255,255,255,.045);

          color: white;

          text-align: left;
        }

        .fun-card-title {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 800;
        }

        .fun-card-text {
          margin: 0;
          font-size: 13px;
          opacity: .65;
          line-height: 1.5;
        }

        .fun-button {
          width: 100%;
          margin-top: 11px;

          padding: 11px 14px;

          border: 0;
          border-radius: 14px;

          background:
            rgba(255,255,255,.09);

          color: white;

          font-weight: 700;

          cursor: pointer;
        }

        /* ДОМ ДРАКОШИ */

        .dragon-house-button {
          background:
            linear-gradient(
              135deg,
              rgba(120,100,255,.18),
              rgba(255,100,180,.12)
            );
        }

        /* НОЧНАЯ ЗВЕЗДА */

        .night-secret-button {
          font-size: 25px;

          animation:
            secretStar 2.5s
            ease-in-out infinite;
        }

        @keyframes secretStar {
          0%,100% {
            transform: scale(1);
            opacity: .75;
          }

          50% {
            transform: scale(1.12);
            opacity: 1;
          }
        }

        /* КРАСНАЯ КНОПКА */

        .danger-button {
          background:
            linear-gradient(
              135deg,
              #b60028,
              #5f0016
            );

          box-shadow:
            0 10px 30px
            rgba(255,0,60,.18);

          transition:
            transform .15s ease;
        }

        .danger-button:active {
          transform:
            scale(.95);
        }

        .danger-count {
          margin-top: 8px;

          font-size: 11px;
          opacity: .4;
        }

        /* MODAL */

        .mini-modal {
          position: fixed;
          inset: 0;

          z-index: 50000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 25px;

          background:
            rgba(0,0,0,.72);

          backdrop-filter:
            blur(12px);
        }

        .mini-modal-card {
          width: 100%;
          max-width: 370px;

          padding: 26px 22px;

          border-radius: 28px;

          background:
            linear-gradient(
              145deg,
              #211422,
              #100b12
            );

          border:
            1px solid
            rgba(255,255,255,.1);

          box-shadow:
            0 30px 90px
            rgba(0,0,0,.5);

          text-align: center;
        }

        .modal-dragon {
          width: 150px;
          max-width: 70%;

          filter:
            drop-shadow(
              0 15px 25px
              rgba(100,100,230,.25)
            );
        }

        .modal-title {
          margin:
            10px 0 8px;

          font-size: 22px;
        }

        .modal-text {
          margin: 0;

          font-size: 15px;
          line-height: 1.6;

          opacity: .8;
        }

        .modal-close {
          margin-top: 18px;

          padding: 10px 18px;

          border: 0;
          border-radius: 14px;

          background:
            rgba(255,255,255,.1);

          color: white;

          font-weight: 700;
        }

        /* ПАСХАЛКА */

        .easter-overlay {
          position: fixed;
          left: 50%;
          bottom: 25px;

          z-index: 60000;

          width:
            min(
              calc(100% - 30px),
              420px
            );

          padding: 15px 16px;

          transform:
            translateX(-50%);

          border-radius: 18px;

          background:
            rgba(20,12,22,.94);

          border:
            1px solid
            rgba(255,120,170,.25);

          box-shadow:
            0 20px 50px
            rgba(0,0,0,.45);

          color: white;

          text-align: center;

          font-size: 13px;

          animation:
            eggAppear .3s ease;
        }

        @keyframes eggAppear {
          from {
            opacity: 0;
            transform:
              translateX(-50%)
              translateY(20px);
          }

          to {
            opacity: 1;
            transform:
              translateX(-50%)
              translateY(0);
          }
        }

        `}
      </style>

      <section className="kessichka-card">

        <div className="kessichka-sun">
          {timeOfDay === "morning" &&
            "🌅"}

          {timeOfDay === "day" &&
            "☀️"}

          {timeOfDay === "evening" &&
            "🌆"}

          {timeOfDay === "night" &&
            "🌙"}
        </div>

        <p className="kessichka-label">
          Для Кэссички
        </p>

        <h1 className="kessichka-title">
          {timeOfDay === "morning" &&
            "Доброе утро, Любовь моя ❤️"}

          {timeOfDay === "day" &&
            "Хорошего дня, Любовь моя ❤️"}

          {timeOfDay === "evening" &&
            "Добрый вечер, Любовь моя ❤️"}

          {timeOfDay === "night" &&
            "Спокойной ночи, Любовь моя ❤️"}
        </h1>

        <p className="kessichka-text">
          Я далеко, и не могу пока лично
          следить за тобой, но могу хотя бы
          иногда напоминать о простых вещах
          и заботиться о бусе:
          поешь, не мёрзни, отдыхай
          и иногда улыбайся.
        </p>

        {currentSchedule && (
          <div className="daily-message">

            <div
              style={{
                fontSize: "12px",
                opacity: 0.5,
                marginBottom: "8px",
              }}
            >
              Сейчас по Минску:{" "}
              {minskTime}
            </div>

            <div className="daily-message-label">
              {dayNames[currentDay]} •{" "}
              {currentSchedule.time}
            </div>

            <p
              style={{
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              {currentSchedule.title}
            </p>

            <p>
              {currentSchedule.text}
            </p>

          </div>
        )}

        <div className="daily-message">

          <div className="daily-message-label">
            Маленькое сообщение для тебя
          </div>

          <p>
            {message}
          </p>

        </div>

        <div
          className="weather-card"
          onClick={weatherEgg}
        >

          <div className="weather-icon">
            {weather?.error
              ? "🌥️"
              : "🌤️"}
          </div>

          <h2 className="weather-title">
            Погода в Минске
          </h2>

          {!weather && (
            <p className="weather-text">
              Смотрю, что там у тебя
              за окном...
            </p>
          )}

          {weather?.error && (
            <p className="weather-text">
              Не смог посмотреть погоду,
              но ты всё равно оденься
              по погоде 😌
            </p>
          )}

          {weather &&
            !weather.error && (
              <>
                <p className="weather-text">
                  {weatherText(
                    weather.weatherCode
                  )}
                </p>

                <div className="temperature">
                  {Math.round(
                    weather.temperature
                  )}
                  °
                </div>

                <p className="weather-feels">
                  Ощущается как{" "}
                  {Math.round(
                    weather.feelsLike
                  )}
                  °
                </p>

                <p className="weather-text">
                  Сегодня от{" "}
                  {Math.round(
                    weather.min
                  )}
                  ° до{" "}
                  {Math.round(
                    weather.max
                  )}
                  °C
                </p>

                <p className="weather-text">
                  Вероятность дождя:{" "}
                  {weather.rainChance}%
                </p>

                <div className="weather-advice">
                  {getWeatherAdvice(
                    weather
                  )}
                </div>
              </>
            )}

        </div>

        {/* =========================
            НОВЫЕ ШТУКИ
        ========================= */}

        <div className="fun-zone">

          {/* ДОМ ДРАКОШИ */}

          <div className="fun-card">
            <p className="fun-card-title">
              🏠 Домик Дракоши
            </p>

            <p className="fun-card-text">
              Иногда он дома. Иногда занят
              очень важными драконьими
              делами.
            </p>

            <button
              className="
                fun-button
                dragon-house-button
              "
              onClick={
                openDragonHouse
              }
            >
              Постучать 🐉
            </button>
          </div>

          {/* НОЧНОЙ СЕКРЕТ */}

          {isNight && (
            <div className="fun-card">
              <p className="fun-card-title">
                🌙 Что это там?
              </p>

              <p className="fun-card-text">
                Эта штука появляется только
                ночью по Минску.
              </p>

              <button
                className="
                  fun-button
                  night-secret-button
                "
                onClick={() =>
                  setNightSecretOpen(
                    true
                  )
                }
              >
                ✨
              </button>
            </div>
          )}

          {/* КРАСНАЯ КНОПКА */}

          <div className="fun-card">
            <p className="fun-card-title">
              🔴 Очень важная кнопка
            </p>

            <p className="fun-card-text">
              Инструкция максимально
              простая.
            </p>

            <button
              className="
                fun-button
                danger-button
              "
              onClick={
                pressRedButton
              }
            >
              {redButtonText}
            </button>

            {redButtonCount > 0 && (
              <div className="danger-count">
                Нажато:{" "}
                {redButtonCount}
              </div>
            )}
          </div>

        </div>

        {!pushEnabled && (
          <button
            className="push-button"
            onClick={
              enablePushNotifications
            }
            disabled={pushLoading}
          >
            {pushLoading
              ? "Подключаю уведомления..."
              : "🔔 Получать приветы от Обсидика ❤️"}
          </button>
        )}

        {pushEnabled && (
          <div className="push-enabled">
            🔔 Уведомления подключены ❤️
          </div>
        )}

        <p
          className="signature"
          onClick={
            signatureEgg
          }
        >
          Обсидик ❤️
        </p>

      </section>

      {/* =========================
          ДРАКОША
      ========================= */}

      <div
        className={`drakosha-floating ${drakoshaAction}`}
      >
        <div className="drakosha-bubble">
          {drakoshaBubble}
        </div>

        <img
          src="/drakosha.png"
          alt="Дракоша"
          className="drakosha-image"
          onClick={() => {
            setShowKiss(true);

            setTimeout(() => {
              setShowKiss(false);
            }, 1500);
          }}
        />
      </div>

      {/* =========================
          ДОМИК ДРАКОШИ
      ========================= */}

      {dragonHouseOpen && (
        <div className="mini-modal">

          <div className="mini-modal-card">

            <img
              src="/drakosha.png"
              alt="Дракоша"
              className="modal-dragon"
            />

            <h2 className="modal-title">
              Домик Дракоши 🐉
            </h2>

            <p className="modal-text">
              {dragonHousePhrase}
            </p>

            <button
              className="modal-close"
              onClick={() =>
                setDragonHouseOpen(
                  false
                )
              }
            >
              Закрыть
            </button>

          </div>

        </div>
      )}

      {/* =========================
          НОЧНОЙ СЕКРЕТ
      ========================= */}

      {nightSecretOpen && (
        <div className="mini-modal">

          <div className="mini-modal-card">

            <div
              style={{
                fontSize: "60px",
              }}
            >
              🌙
            </div>

            <h2 className="modal-title">
              Ночной секрет
            </h2>

            <p className="modal-text">
              Если ты это нашла —
              значит уже поздно.
              Отдыхай иногда, бус.
              И сладких снов ❤️
            </p>

            <button
              className="modal-close"
              onClick={() =>
                setNightSecretOpen(
                  false
                )
              }
            >
              Тьмок и спать 💋
            </button>

          </div>

        </div>
      )}

      {/* =========================
          ПАСХАЛКА
      ========================= */}

      {easterEgg && (
        <div
          className="easter-overlay"
          onClick={() =>
            setEasterEgg("")
          }
        >
          {easterEgg}

          <div
            style={{
              marginTop: "5px",
              opacity: 0.4,
              fontSize: "10px",
            }}
          >
            тыкни, чтобы закрыть
          </div>
        </div>
      )}

      {/* =========================
          ТЬМОК
      ========================= */}

      {showKiss && (
        <div className="kiss-overlay">

          <div className="kiss-hearts">
            ❤️ 💗 💕 ❤️ 💗
          </div>

          <div className="kiss-mark">
            💋
          </div>

          <div className="kiss-title">
            ТЬМОК!
          </div>

          <div className="kiss-subtitle">
            словила буську ❤️
          </div>

        </div>
      )}

    </main>
  );
}
