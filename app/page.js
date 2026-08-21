"use client";

import { useEffect, useState } from "react";
import "./globals.css";

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
  const hour = new Date().getHours();

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

function getWeatherType(code) {
  if (code === 0) {
    return "clear";
  }

  if ([1, 2, 3].includes(code)) {
    return "cloudy";
  }

  if ([45, 48].includes(code)) {
    return "fog";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "drizzle";
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "rain";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "snow";
  }

  if ([95, 96, 99].includes(code)) {
    return "storm";
  }

  return "cloudy";
}

function weatherText(code) {
  if (code === 0) return "Ясно всё гуд ☀️";

  if ([1, 2, 3].includes(code)) {
    return "Облачно вайбик 🌤️";
  }

  if ([45, 48].includes(code)) {
    return "Туман сайлентхилл 🌫️";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "Морось фе 🌦️";
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return "Дождь +вайб 🌧️";
  }

  if ([71, 73, 75, 77].includes(code)) {
    return "Снег вайбик ❄️";
  }

  if ([80, 81, 82].includes(code)) {
    return "Ливень любимое 🌧️";
  }

  if ([85, 86].includes(code)) {
    return "Снегопад ❄️";
  }

  if ([95, 96, 99].includes(code)) {
    return "Гроза ⛈️";
  }

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

function WeatherEffects({ type, time }) {
  if (type === "rain" || type === "drizzle") {
    return (
      <div className="weather-effect rain-effect">
        {Array.from({ length: 45 }).map((_, index) => (
          <span
            key={index}
            className="rain-drop"
            style={{
              left: `${(index * 23) % 100}%`,
              animationDelay: `${(index * 0.13) % 2}s`,
              animationDuration: `${0.55 + (index % 5) * 0.12}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "snow") {
    return (
      <div className="weather-effect snow-effect">
        {Array.from({ length: 35 }).map((_, index) => (
          <span
            key={index}
            className="snow-flake"
            style={{
              left: `${(index * 31) % 100}%`,
              animationDelay: `${(index * 0.23) % 5}s`,
              animationDuration: `${4 + (index % 5)}s`,
              fontSize: `${8 + (index % 5) * 3}px`,
            }}
          >
            ❄
          </span>
        ))}
      </div>
    );
  }

  if (type === "fog") {
    return (
      <div className="weather-effect fog-effect">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (type === "storm") {
    return (
      <div className="weather-effect storm-effect">
        <span />
      </div>
    );
  }

  if (time === "night") {
    return (
      <div className="weather-effect stars-effect">
        {Array.from({ length: 35 }).map((_, index) => (
          <span
            key={index}
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 19) % 75}%`,
              animationDelay: `${(index * 0.21) % 3}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "clear") {
    return (
      <div className="weather-effect sun-effect">
        <span />
      </div>
    );
  }

  return null;
}

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [weatherType, setWeatherType] = useState("cloudy");

  const timeOfDay = getTimeOfDay();

  const today = new Date();

  const message =
    dailyMessages[
      Math.floor(
        (
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ).getTime() -
          new Date(2026, 0, 1).getTime()
        ) / 86400000
      ) % dailyMessages.length
    ];

  useEffect(() => {
    fetch("/api/weather?time=" + Date.now(), {
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Weather request failed");
        }

        return response.json();
      })
      .then((data) => {
        setWeather(data);

        if (!data.error) {
          setWeatherType(
            getWeatherType(data.weatherCode)
          );
        }
      })
      .catch(() => {
        setWeather({ error: true });
        setWeatherType("cloudy");
      });
  }, []);

  const pageClass =
    `${timeOfDay}-${weatherType}`;

  return (
    <main
      className={`kessichka-page ${timeOfDay} ${weatherType} ${pageClass}`}
    >
      <WeatherEffects
        type={weatherType}
        time={timeOfDay}
      />

      <section className="kessichka-card">

        <div className="kessichka-sun">
          {weatherType === "clear" && "☀️"}
          {weatherType === "cloudy" && "☁️"}
          {weatherType === "fog" && "🌫️"}
          {weatherType === "drizzle" && "🌦️"}
          {weatherType === "rain" && "🌧️"}
          {weatherType === "snow" && "❄️"}
          {weatherType === "storm" && "⛈️"}
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
          но могу хотя бы иногда напоминать о простых вещах
          и заботиться о бусе: поешь, не мёрзни, отдыхай
          и иногда улыбайся.
        </p>

        <div className="daily-message">
          <div className="daily-message-label">
            Маленькое сообщение для тебя
          </div>

          <p>{message}</p>
        </div>

        <div className="weather-card">

          <div className="weather-icon">
            {weatherType === "clear" && "☀️"}
            {weatherType === "cloudy" && "☁️"}
            {weatherType === "fog" && "🌫️"}
            {weatherType === "drizzle" && "🌦️"}
            {weatherType === "rain" && "🌧️"}
            {weatherType === "snow" && "❄️"}
            {weatherType === "storm" && "⛈️"}
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
                {" "}
                до{" "}
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
