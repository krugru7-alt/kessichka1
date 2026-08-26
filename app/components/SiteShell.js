"use client";

import {
  useEffect,
  useState,
} from "react";

import BottomNav from "./BottomNav";
import DrakoshaBuddy from "./DrakoshaBuddy";


/* =====================================================
   ТИП ПОГОДЫ
===================================================== */

function getWeatherClass(code) {
  const value = Number(code);

  if (value === 0) {
    return "weather-clear";
  }

  if (
    value >= 1 &&
    value <= 3
  ) {
    return "weather-cloudy";
  }

  if (
    value === 45 ||
    value === 48
  ) {
    return "weather-fog";
  }

  if (
    (value >= 51 &&
      value <= 67) ||
    (value >= 80 &&
      value <= 82)
  ) {
    return "weather-rain";
  }

  if (
    (value >= 71 &&
      value <= 77) ||
    value === 85 ||
    value === 86
  ) {
    return "weather-snow";
  }

  if (
    value >= 95 &&
    value <= 99
  ) {
    return "weather-storm";
  }

  return "weather-cloudy";
}


/* =====================================================
   ВРЕМЯ МИНСКА
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
    theme,
    setTheme,
  ] = useState("light");

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
     ЗАГРУЖАЕМ ТЕМУ
  ===================================================== */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "kessi-theme"
        );

      if (
        saved === "dark" ||
        saved === "light"
      ) {
        setTheme(saved);
      }
    } catch {
      // ничего страшного
    }

    setReady(true);


    /* SERVICE WORKER */

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
     ПОГОДА
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
     СВЕТЛАЯ / ТЁМНАЯ ТЕМА
  ===================================================== */

  function toggleTheme() {
    setTheme(
      (current) => {
        const next =
          current === "light"
            ? "dark"
            : "light";

        try {
          localStorage.setItem(
            "kessi-theme",
            next
          );
        } catch {
          // ничего страшного
        }

        return next;
      }
    );
  }


  const dark =
    theme === "dark";


  return (
    <div
      className={`
        site-shell
        weather-theme-v3
        theme-${theme}
        ${weatherClass}
        ${timeClass}
        ${
          ready
            ? "ready"
            : ""
        }
      `}
    >

      {/* ПОГОДНЫЙ ФОН */}

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


      {/* ВЕРХНЯЯ ПАНЕЛЬ */}

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


        {/* ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ */}

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-pressed={dark}
          title={
            dark
              ? "Включить светлую тему"
              : "Включить тёмную тему"
          }
        >

          <span className="theme-toggle-icon">
            {dark
              ? "🌙"
              : "☀️"}
          </span>

          <span
            className={`theme-toggle-switch ${
              dark
                ? "dark"
                : ""
            }`}
          >
            <i />
          </span>

        </button>

      </header>


      {/* КОНТЕНТ */}

      <main className="site-content">
        {children}
      </main>


      <DrakoshaBuddy />

      <BottomNav />

    </div>
  );
}
