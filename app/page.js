"use client";

import { useEffect, useState } from "react";
import "./globals.css";

const dailyMessages = [
  "У тебя сегодня всё получится. А если нет - ничего страшного, я всё равно рядом. ❤️",

  "Сегодня просто напоминание: я скучаю  😌",

  "Пусть сегодня у тебя будет хотя бы один момент, когда ты поймаешь себя на мысли: «А ведь день неплохой». 🌷",

  "Ты уже проснулась - значит, день официально начался. Теперь осталось сделать его немного приятнее. ☀️",

  "Сегодня никаких больших требований. Просто не забывай что кое-кто далеко очень хочет видеть тебя счастливой. ❤️",

  "Маленькое утреннее напоминание: ты прекрасна. Всё, я сказал. 😌",

  "Пусть сегодня всё складывается чуть легче, чем ты ожидаешь. А если день будет вредничать - будем вредничать вместе с ним. ❤️",
];

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

  const today = new Date();
  const message =
    dailyMessages[
      Math.floor(
        (new Date(today.getFullYear(), today.getMonth(), today.getDate()) -
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

  return (
    <main className="kessichka-page">
      <section className="kessichka-card">

        <div className="kessichka-sun">☀️</div>

        <p className="kessichka-label">
          Для Кэссички
        </p>

        <h1 className="kessichka-title">
          Доброе утро, Любовь моя ❤️
        </h1>

        <p className="kessichka-text">
          Я далеко, и не могу пока лично следить за тобой
          но могу хотя бы иногда напоминать о простых вещах и заботиться о бусе:
          поешь, не мёрзни, отдыхай и иногда улыбайся.
        </p>

        <div className="daily-message">
          <div className="daily-message-label">
            Маленькое сообщение для тебя
          </div>

          <p>{message}</p>
        </div>

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
              Не смог посмотреть погоду, но ты всё равно оденься по погоде 😌
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
                Ощущается как {Math.round(weather.feelsLike)}°
              </p>

              <p className="weather-text">
                Сегодня от {Math.round(weather.min)}° до{" "}
                {Math.round(weather.max)}°C
              </p>

              <p className="weather-text">
                Вероятность дождя: {weather.rainChance}%
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
