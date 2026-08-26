"use client";

import {
  useEffect,
  useState,
} from "react";

import BottomNav from "./BottomNav";
import DrakoshaBuddy from "./DrakoshaBuddy";


/* =====================================================
   ПОГОДА
===================================================== */

function getWeatherClass(code) {
  const value = Number(code);

  // ясно
  if (value === 0) {
    return "weather-clear";
  }

  // облачно
  if (
    value === 1 ||
    value === 2 ||
    value === 3
  ) {
    return "weather-cloudy";
  }

  // туман
  if (
    value === 45 ||
    value === 48
  ) {
    return "weather-fog";
  }

  // дождь / морось / ливень
  if (
    (value >= 51 &&
      value <= 67) ||
    (value >= 80 &&
      value <= 82)
  ) {
    return "weather-rain";
  }

  // снег
  if (
    (value >= 71 &&
      value <= 77) ||
    value === 85 ||
    value === 86
  ) {
    return "weather-snow";
  }

  // гроза
  if (
    value >= 95 &&
    value <= 99
  ) {
    return "weather-storm";
  }

  return "weather-cloudy";
}


/* =====================================================
   ВРЕМЯ ПО МИНСКУ

   Оно теперь НЕ определяет основной цвет.
   Только слегка меняет оттенок погоды.
===================================================== */

function getMinskTimeClass() {
  const hour = Number(
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Europe/Minsk",

        hour:
          "numeric",

        hourCycle:
          "h23",
      }
    ).format(new Date())
  );

  if (
    hour >= 5 &&
    hour < 12
  ) {
    return "time-morning";
  }

  if (
    hour >= 12 &&
    hour < 18
  ) {
    return "time-day";
  }

  if (
    hour >= 18 &&
    hour < 22
  ) {
    return "time-evening";
  }

  return "time-night";
}


/* =====================================================
   SITE SHELL
===================================================== */

export default function SiteShell({
  children,
}) {
  const [
    lightOn,
    setLightOn,
  ] = useState(false);

  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    weatherClass,
    setWeatherClass,
  ] = useState(
    "weather-cloudy"
  );

  const [
    timeClass,
    setTimeClass,
  ] = useState(
    "time-day"
  );


  /* =====================================================
     НАСТРОЙКИ + SERVICE WORKER
  ===================================================== */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "kessi-light"
        ) === "1";

      setLightOn(saved);
    } catch {
      // не критично
    }

    setReady(true);

    if (
      "serviceWorker" in
      navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {});
    }
  }, []);


  /* =====================================================
     ВРЕМЯ МИНСКА
  ===================================================== */

  useEffect(() => {
    function updateTime() {
      setTimeClass(
        getMinskTimeClass()
      );
    }

    updateTime();

    const timer =
      window.setInterval(
        updateTime,
        60000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, []);


  /* =====================================================
     РЕАЛЬНАЯ ПОГОДА

     Обновляем каждые 10 минут.
  ===================================================== */

  useEffect(() => {
    let active = true;

    async function loadWeather() {
      try {
        const response =
          await fetch(
            "/api/weather",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "weather error"
          );
        }

        const data =
          await response.json();

        if (!active) {
          return;
        }

        setWeatherClass(
          getWeatherClass(
            data.weatherCode
          )
        );
      } catch {
        if (!active) {
          return;
        }

        setWeatherClass(
          "weather-cloudy"
        );
      }
    }

    loadWeather();

    const timer =
      window.setInterval(
        loadWeather,
        10 * 60 * 1000
      );

    return () => {
      active = false;

      window.clearInterval(
        timer
      );
    };
  }, []);


  /* =====================================================
     ДОПОЛНИТЕЛЬНЫЙ ТЁПЛЫЙ СВЕТ
  ===================================================== */

  function toggleLight() {
    setLightOn(
      (current) => {
        const next =
          !current;

        try {
          localStorage.setItem(
            "kessi-light",
            next ? "1" : "0"
          );
        } catch {
          // не критично
        }

        return next;
      }
    );
  }


  return (
    <div
      className={`
        site-shell
        weather-theme-v2
        ${weatherClass}
        ${timeClass}
        ${
          lightOn
            ? "light-on"
            : ""
        }
        ${
          ready
            ? "ready"
            : ""
        }
      `}
    >

      {/* ===============================================
          ПОГОДНЫЙ ФОН
      =============================================== */}

      <div
        className="site-ambient"
        aria-hidden="true"
      />


      <div
        className="weather-effects"
        aria-hidden="true"
      >

        <div className="sun-layer" />

        <div className="cloud-layer" />

        <div className="rain-layer" />

        <div className="fog-layer" />

        <div className="snow-layer" />

        <div className="storm-layer" />

      </div>


      <div
        className="site-light-wash"
        aria-hidden="true"
      />


      {/* ===============================================
          ВЕРХ
      =============================================== */}

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
              маленький уголок
              в интернете
            </small>

          </span>

        </a>


        <button
          className={`global-light ${
            lightOn
              ? "on"
              : ""
          }`}
          type="button"
          onClick={toggleLight}
          aria-pressed={lightOn}
          title={
            lightOn
              ? "Убрать тёплый свет"
              : "Добавить тёплый свет"
          }
        >

          <span>
            {lightOn
              ? "💡"
              : "☀️"}
          </span>

          <i />

        </button>

      </header>


      {/* ===============================================
          СТРАНИЦА
      =============================================== */}

      <main className="site-content">
        {children}
      </main>


      <DrakoshaBuddy />

      <BottomNav />

    </div>
  );
}
