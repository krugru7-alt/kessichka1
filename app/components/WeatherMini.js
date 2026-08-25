"use client";

import { useEffect, useState } from "react";

function weatherText(code) {
  if (code === 0) return "Ясно";

  if ([1, 2, 3].includes(code)) {
    return "Облачно";
  }

  if ([45, 48].includes(code)) {
    return "Туман";
  }

  if (
    [51, 53, 55, 56, 57].includes(code)
  ) {
    return "Морось";
  }

  if (
    [61, 63, 65, 66, 67].includes(code)
  ) {
    return "Дождь";
  }

  if (
    [71, 73, 75, 77].includes(code)
  ) {
    return "Снег";
  }

  if ([80, 81, 82].includes(code)) {
    return "Ливень";
  }

  if ([85, 86].includes(code)) {
    return "Снегопад";
  }

  if ([95, 96, 99].includes(code)) {
    return "Гроза";
  }

  return "Погода";
}

function weatherEmoji(code) {
  if (code === 0) {
    return "☀️";
  }

  if ([1, 2, 3].includes(code)) {
    return "🌤️";
  }

  if ([45, 48].includes(code)) {
    return "🌫️";
  }

  if (
    [
      51,
      53,
      55,
      56,
      57,
      61,
      63,
      65,
      66,
      67,
      80,
      81,
      82,
    ].includes(code)
  ) {
    return "🌧️";
  }

  if (
    [71, 73, 75, 77, 85, 86].includes(
      code
    )
  ) {
    return "❄️";
  }

  if ([95, 96, 99].includes(code)) {
    return "⛈️";
  }

  return "🌥️";
}

function getAdvice(weather) {
  if (weather.temperature < 0) {
    return "Оденься потеплее 🧣";
  }

  if (weather.temperature < 10) {
    return "На улице прохладно 🧥";
  }

  if (weather.rainChance >= 50) {
    return "Зонтик может пригодиться ☔";
  }

  if (weather.temperature >= 25) {
    return "Сегодня тепло ☀️";
  }

  return "Береги себя и хорошего дня 🌷";
}

export default function WeatherMini() {
  const [weather, setWeather] =
    useState(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((response) => response.json())
      .then((data) => {
        setWeather(data);
      })
      .catch(() => {
        setWeather({
          error: true,
        });
      });
  }, []);

  if (!weather) {
    return (
      <div className="weather-mini loading-card">

        <span className="big-emoji">
          🌥️
        </span>

        <div>

          <small>
            Минск
          </small>

          <b>
            Смотрю погоду…
          </b>

        </div>

      </div>
    );
  }

  if (weather.error) {
    return (
      <div className="weather-mini">

        <span className="big-emoji">
          🌥️
        </span>

        <div>

          <small>
            Минск
          </small>

          <b>
            Погода спряталась
          </b>

          <p>
            Но ты всё равно по погоде там,
            ладно?
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="weather-mini">

      <span className="big-emoji">

        {weatherEmoji(
          weather.weatherCode
        )}

      </span>

      <div className="weather-mini-copy">

        <small>
          Минск • сейчас
        </small>

        <b>
          {Math.round(
            weather.temperature
          )}
          ° ·{" "}
          {weatherText(
            weather.weatherCode
          )}
        </b>

        <p>
          Ощущается как{" "}
          {Math.round(
            weather.feelsLike
          )}
          ° · дождь{" "}
          {weather.rainChance}%
        </p>

        <em>
          {getAdvice(weather)}
        </em>

      </div>

    </div>
  );
}
