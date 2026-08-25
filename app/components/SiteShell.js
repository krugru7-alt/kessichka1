"use client";

import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import DrakoshaBuddy from "./DrakoshaBuddy";

function getWeatherClass(code) {
  if (code === 0) {
    return "weather-clear";
  }

  if ([1, 2, 3].includes(code)) {
    return "weather-cloudy";
  }

  if ([45, 48].includes(code)) {
    return "weather-fog";
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
    return "weather-rain";
  }

  if (
    [71, 73, 75, 77, 85, 86].includes(
      code
    )
  ) {
    return "weather-snow";
  }

  if ([95, 96, 99].includes(code)) {
    return "weather-storm";
  }

  return "weather-normal";
}

function getMinskTimeClass() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );

  if (hour >= 6 && hour < 11) {
    return "time-morning";
  }

  if (hour >= 11 && hour < 18) {
    return "time-day";
  }

  if (hour >= 18 && hour < 22) {
    return "time-evening";
  }

  return "time-night";
}

export default function SiteShell({
  children,
}) {
  const [lightOn, setLightOn] =
    useState(false);

  const [ready, setReady] =
    useState(false);

  const [weatherClass, setWeatherClass] =
    useState("weather-normal");

  const [timeClass, setTimeClass] =
    useState("time-night");

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "kessi-light"
      ) === "1";

    setLightOn(saved);
    setTimeClass(
      getMinskTimeClass()
    );

    setReady(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    async function loadWeather() {
      try {
        const response =
          await fetch(
            "/api/weather",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          typeof data?.weatherCode ===
          "number"
        ) {
          setWeatherClass(
            getWeatherClass(
              data.weatherCode
            )
          );
        }
      } catch {
        setWeatherClass(
          "weather-normal"
        );
      }
    }

    loadWeather();

    const weatherTimer =
      setInterval(
        loadWeather,
        10 * 60 * 1000
      );

    return () => {
      clearInterval(weatherTimer);
    };
  }, []);

  useEffect(() => {
    const timeTimer =
      setInterval(() => {
        setTimeClass(
          getMinskTimeClass()
        );
      }, 60 * 1000);

    return () => {
      clearInterval(timeTimer);
    };
  }, []);

  function toggleLight() {
    setLightOn((current) => {
      const next = !current;

      localStorage.setItem(
        "kessi-light",
        next ? "1" : "0"
      );

      return next;
    });
  }

  return (
    <div
      className={`
        site-shell
        ${weatherClass}
        ${timeClass}
        ${lightOn ? "light-on" : ""}
        ${ready ? "ready" : ""}
      `}
    >
      <div
        className="site-ambient"
        aria-hidden="true"
      />

      <div
        className="weather-effects"
        aria-hidden="true"
      >
        <div className="rain-layer" />
        <div className="snow-layer" />
        <div className="fog-layer" />
        <div className="storm-layer" />
        <div className="sun-layer" />
      </div>

      <div
        className="site-light-wash"
        aria-hidden="true"
      />

      <header className="topbar">

        <a
          className="topbar-brand"
          href="/"
        >

          <span className="brand-heart">
            ♥
          </span>

          <span>

            <b>
              Для Кэссички
            </b>

            <small>
              маленький уголок в интернете
            </small>

          </span>

        </a>

        <button
          className={`global-light ${
            lightOn ? "on" : ""
          }`}
          type="button"
          onClick={toggleLight}
          aria-pressed={lightOn}
          title={
            lightOn
              ? "Выключить свет"
              : "Включить свет"
          }
        >

          <span>
            {lightOn
              ? "💡"
              : "🌙"}
          </span>

          <i />

        </button>

      </header>

      <main className="site-content">
        {children}
      </main>

      <DrakoshaBuddy />

      <BottomNav />

    </div>
  );
}
