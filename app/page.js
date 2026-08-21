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

  "Сегодня просто напоминание: я скучаю 😌",

  "Пусть сегодня у тебя будет хотя бы один момент, когда ты поймаешь себя на мысли: «А ведь день неплохой». 🌷",

  "Ты уже проснулась - значит, день официально начался. Теперь осталось сделать его немного приятнее. ☀️",

  "Сегодня никаких больших требований. Просто не забывай, что кое-кто далеко очень хочет видеть тебя счастливой. ❤️",

  "Маленькое утреннее напоминание: ты прекрасна. Всё, я сказал. 😌",

  "Пусть сегодня всё складывается чуть легче, чем ты ожидаешь. А если день будет вредничать - будем вредничать вместе с ним. ❤️",
];

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

function weatherText(code) {
  if (code === 0) return "Ясно всё гуд ☀️";
  if ([1, 2, 3].includes(code)) return "Облачно вайбик 🌤️";
  if ([45, 48].includes(code)) return "Туман сайлентхилл 🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "Морось фе 🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "Дождь +вайб 🌧️";
  if ([71, 73, 75, 77].includes(code)) return "Снег вайбик ❄️";
  if ([80, 81, 82].includes(code)) return "Ливень любимое 🌧️";
  if ([85, 86].includes(code)) return "Снегопад ❄️";
  if ([95, 96, 99].includes(code)) return "Гроза ⛈️";

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

async function enablePushNotifications() {
  try {
    setPushLoading(true);

    if (!("Notification" in window)) {
      alert("Этот браузер не поддерживает уведомления.");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      alert("Этот браузер не поддерживает Service Worker.");
      return;
    }

    const permission =
      await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Разрешение на уведомления не получено.");
      return;
    }

  const subscription =
  await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey:
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

const response = await fetch("/api/subscribe", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(subscription),
});

if (!response.ok) {
  throw new Error(
    "Не удалось сохранить Push-подписку"
  );
}

setPushEnabled(true);

alert("Уведомления подключены ❤️");

    alert("Уведомления подключены ❤️");
  } catch (error) {
    console.error(
      "Ошибка подключения уведомлений:",
      error
    );

    alert(
      "Не получилось подключить уведомления 😔"
    );
  } finally {
    setPushLoading(false);
  }
}

  // Обновляем время каждую минуту
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const timeOfDay = getTimeOfDay();

  const currentSchedule = getCurrentScheduleItem();
const currentDay = getCurrentDay();

const minskTime = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Europe/Minsk",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
}).format(new Date());
  
  const today = new Date();

  const message =
    dailyMessages[
      Math.floor(
        (new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ) -
          new Date(2026, 0, 1)) /
          86400000
      ) % dailyMessages.length
    ];

  useEffect(() => {
  fetch("/api/weather")
    .then((response) => response.json())
    .then((data) => setWeather(data))
    .catch(() => setWeather({ error: true }));
}, []);

useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("Kessichka Service Worker зарегистрирован ❤️");
      })
      .catch((error) => {
        console.error(
          "Ошибка регистрации Service Worker:",
          error
        );
      });
  }
}, []);

  return (
    <main className={`kessichka-page ${timeOfDay}`}>
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
          Я далеко, и не могу пока лично следить за тобой,
          но могу хотя бы иногда напоминать о простых вещах и заботиться о бусе:
          поешь, не мёрзни, отдыхай и иногда улыбайся.
        </p>

        {/* =====================================
            РАСПИСАНИЕ
        ===================================== */}

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
      {dayNames[currentDay]} • {currentSchedule.time}
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


        {/* =====================================
            СООБЩЕНИЕ ДНЯ
        ===================================== */}

        <div className="daily-message">

          <div className="daily-message-label">
            Маленькое сообщение для тебя
          </div>

          <p>{message}</p>

        </div>

        {/* =====================================
            ПОГОДА
        ===================================== */}

        <div className="weather-card">

          <div className="weather-icon">
            {weather?.error ? "🌥️" : "🌤️"}
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
              но ты всё равно оденься по погоде 😌
            </p>
          )}

          {weather && !weather.error && (
            <>
              <p className="weather-text">
                {weatherText(weather.weatherCode)}
              </p>

              <div className="temperature">
                {Math.round(weather.temperature)}°
              </div>

              <p className="weather-feels">
                Ощущается как{" "}
                {Math.round(weather.feelsLike)}°
              </p>

              <p className="weather-text">
                Сегодня от{" "}
                {Math.round(weather.min)}°
                {" "}до{" "}
                {Math.round(weather.max)}°C
              </p>

              <p className="weather-text">
                Вероятность дождя:{" "}
                {weather.rainChance}%
              </p>

              <div className="weather-advice">
                {getWeatherAdvice(weather)}
              </div>
            </>
          )}

        </div>

        <p className="signature">
          Обсидик ❤️
        </p>

      </section>
    </main>
  );
}
