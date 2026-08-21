"use client";

import { useEffect, useState } from "react";
import "./globals.css";

function weatherText(code) {
  if (code === 0) return "Ясно ☀️";
  if ([1, 2, 3].includes(code)) return "Облачно 🌤️";
  if ([45, 48].includes(code)) return "Туман 🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "Морось 🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "Дождь 🌧️";
  if ([71, 73, 75, 77].includes(code)) return "Снег ❄️";
  if ([80, 81, 82].includes(code)) return "Ливень 🌧️";
  if ([85, 86].includes(code)) return "Снегопад ❄️";
  if ([95, 96, 99].includes(code)) return "Гроза ⛈️";

  return "Погода сегодня решила быть загадочной 🌥️";
}

export default function Home() {
  const [weather, setWeather] = useState(null);

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
          Доброе утро ❤️
        </h1>

        <p className="kessichka-text">
          Пока я далеко,
          Мы будем напоминать тебе о простых вещах и заботиться о бусе:
          поешь, не мёрзни, отдыхай и иногда улыбайся.
        </p>

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
              Не смог посмотреть погоду. Но всё равно оденься по погоде 😌
            </p>
          )}

          {weather && !weather.error && (
            <>
              <p className="weather-text">
                {weatherText(weather.weatherCode)}
              </p>

              <p className="weather-text">
                Сейчас {Math.round(weather.temperature)}°C,
                ощущается как {Math.round(weather.feelsLike)}°C
              </p>

              <p className="weather-text">
                Сегодня от {Math.round(weather.min)}° до{" "}
                {Math.round(weather.max)}°C
              </p>

              <p className="weather-text">
                Вероятность дождя: {weather.rainChance}%
              </p>
            </>
          )}
        </div>

        <p className="signature">
          — Обсидик
        </p>
      </section>
    </main>
  );
}
