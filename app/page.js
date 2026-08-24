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

// ==========================================
// VAPID PUBLIC KEY
// ==========================================

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

// ==========================================
// ВРЕМЯ СУТОК
// ==========================================

function getTimeOfDay() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );

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

// ==========================================
// ПОГОДА
// ==========================================

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

  const [drakoshaWalking, setDrakoshaWalking] =
    useState(false);

  const [drakoshaFrame, setDrakoshaFrame] =
    useState(1);

  const [drakoshaDirection, setDrakoshaDirection] =
    useState("left");

  const [drakoshaPosition, setDrakoshaPosition] =
    useState(16);

  // ==========================================
  // PUSH УВЕДОМЛЕНИЯ
  // ==========================================

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
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            subscription
          ),
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

  // ==========================================
  // ОБНОВЛЯЕМ ВРЕМЯ КАЖДУЮ МИНУТУ
  // ==========================================

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // ПОГОДА
  // ==========================================

  useEffect(() => {
    fetch("/api/weather")
      .then((response) => response.json())
      .then((data) => setWeather(data))
      .catch(() =>
        setWeather({ error: true })
      );
  }, []);

  // ==========================================
  // SERVICE WORKER
  // ==========================================

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log(
            "Kessichka Service Worker зарегистрирован ❤️"
          );
        })
        .catch((error) => {
          console.error(
            "Ошибка регистрации Service Worker:",
            error
          );
        });
    }
  }, []);

  // ==========================================
  // ЖИВОЙ ДРАКОША
  // ==========================================

  useEffect(() => {
    let waitTimer;
    let walkTimer;

    function startWaiting() {
      const delay =
        Math.floor(Math.random() * 20000) +
        20000;

      waitTimer = setTimeout(() => {
        setDrakoshaWalking(true);

        let currentPosition =
          drakoshaDirection === "left"
            ? 16
            : 0;

        let currentFrame = 1;

        walkTimer = setInterval(() => {
          currentFrame =
            currentFrame >= 8
              ? 1
              : currentFrame + 1;

          setDrakoshaFrame(currentFrame);

          if (drakoshaDirection === "left") {
            currentPosition -= 1;
          } else {
            currentPosition += 1;
          }

          setDrakoshaPosition(
            currentPosition
          );

          const finishedLeft =
            drakoshaDirection === "left" &&
            currentPosition <= 0;

          const finishedRight =
            drakoshaDirection === "right" &&
            currentPosition >= 16;

          if (
            finishedLeft ||
            finishedRight
          ) {
            clearInterval(walkTimer);

            setDrakoshaWalking(false);
            setDrakoshaFrame(1);

            setDrakoshaDirection(
              drakoshaDirection === "left"
                ? "right"
                : "left"
            );
          }
        }, 180);
      }, delay);
    }

    startWaiting();

    return () => {
      clearTimeout(waitTimer);
      clearInterval(walkTimer);
    };
  }, [drakoshaDirection]);

  // ==========================================
  // ВРЕМЯ И РАСПИСАНИЕ
  // ==========================================

  const timeOfDay = getTimeOfDay();

  const currentSchedule =
    getCurrentScheduleItem();

  const currentDay = getCurrentDay();

  const minskTime =
    new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Europe/Minsk",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).format(now);

  // ==========================================
  // СООБЩЕНИЕ ДНЯ
  // ==========================================

  const today = new Date();

  const message =
    dailyMessages[
      Math.floor(
        (
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ) -
          new Date(2026, 0, 1)
        ) /
          86400000
      ) % dailyMessages.length
    ];

  // ==========================================
  // РЕНДЕР
  // ==========================================

  return (
    <main
      className={`kessichka-page ${timeOfDay}`}
    >
      <section className="kessichka-card">

        <div className="kessichka-sun">
          {timeOfDay === "morning" && "🌅"}
          {timeOfDay === "day" && "☀️"}
          {timeOfDay === "evening" && "🌆"}
          {timeOfDay === "night" && "🌙"}
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

        {/* РАСПИСАНИЕ */}

        {currentSchedule && (
          <div className="daily-message">

            <div
              style={{
                fontSize: "12px",
                opacity: 0.5,
                marginBottom: "8px",
              }}
            >
              Сейчас по Минску: {minskTime}
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

        {/* СООБЩЕНИЕ ДНЯ */}

        <div className="daily-message">

          <div className="daily-message-label">
            Маленькое сообщение для тебя
          </div>

          <p>
            {message}
          </p>

        </div>

        {/* ПОГОДА */}

        <div className="weather-card">

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
              Смотрю, что там у тебя за окном...
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
                  {Math.round(weather.min)}
                  ° до{" "}
                  {Math.round(weather.max)}
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

        {/* =====================================
            ДРАКОША
        ===================================== */}

        <div
          className={`drakosha-floating ${
            drakoshaWalking
              ? "walking"
              : "idle"
          }`}
          style={{
            "--drakosha-position":
              drakoshaPosition,
          }}
        >
          <div className="drakosha-bubble">
            Тыкни 👀
          </div>

          <img
            src={
              drakoshaWalking
                ? `/drakosha/${
                    drakoshaDirection
                  }_${drakoshaFrame}.png`
                : "/drakosha.png"
            }
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

        {/* PUSH */}

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

        <p className="signature">
          Обсидик ❤️
        </p>

      </section>

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
