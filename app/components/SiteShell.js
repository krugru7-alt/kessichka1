"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import BottomNav from "./BottomNav";
import DrakoshaBuddy from "./DrakoshaBuddy";



function getWeatherClass(
  code
) {

  const value =
    Number(
      code
    );


  if (
    value === 0
  ) {
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
    (
      value >= 51 &&
      value <= 67
    ) ||
    (
      value >= 80 &&
      value <= 82
    )
  ) {
    return "weather-rain";
  }


  if (
    (
      value >= 71 &&
      value <= 77
    ) ||
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



function getMinskTimeClass() {

  const hour =
    Number(
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
      ).format(
        new Date()
      )
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



export default function SiteShell({
  children,
}) {

  const pathname =
    usePathname();


  const router =
    useRouter();


  const isLoginPage =
    pathname ===
    "/login";


  const [
    viewer,
    setViewer,
  ] = useState(
    null
  );


  const [
    authReady,
    setAuthReady,
  ] = useState(
    isLoginPage
  );


  const [
    theme,
    setTheme,
  ] = useState(
    "light"
  );


  const [
    ready,
    setReady,
  ] = useState(
    false
  );


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
     АВТОРИЗАЦИЯ
  ===================================================== */

  useEffect(() => {

    if (
      isLoginPage
    ) {

      setAuthReady(
        true
      );


      return;

    }


    let active =
      true;


    async function loadViewer() {

      try {

        const response =
          await fetch(
            "/api/auth/me",
            {

              cache:
                "no-store",

            }
          );


        if (
          !response.ok
        ) {

          if (active) {

            setViewer(
              null
            );


            setAuthReady(
              false
            );


            router.replace(
              "/login"
            );

          }


          return;

        }


        const data =
          await response.json();


        if (!active) {
          return;
        }


        setViewer(
          {

            user:
              data.user,

            role:
              data.role,

          }
        );


        setAuthReady(
          true
        );


      } catch {

        if (active) {

          router.replace(
            "/login"
          );

        }

      }
    }


    loadViewer();


    return () => {

      active =
        false;

    };

  }, [
    isLoginPage,
    pathname,
    router,
  ]);
  /* =====================================================
   ПРИВЯЗЫВАЕМ PUSH К КЭССИЧКЕ / ОБСИДИКУ
===================================================== */

useEffect(() => {

  if (
    !viewer?.user ||
    !(
      "serviceWorker" in
      navigator
    )
  ) {
    return;
  }


  let active =
    true;


  async function registerPushOwner() {

    try {

      const registration =
        await navigator
          .serviceWorker
          .ready;


      const subscription =
        await registration
          .pushManager
          ?.getSubscription();


      if (
        !subscription ||
        !active
      ) {
        return;
      }


      await fetch(
        "/api/push/register",
        {

          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              subscription.toJSON()
            ),

        }
      );


    } catch (error) {

      console.error(
        "Push owner:",
        error
      );

    }
  }


  /*
    Сразу проверяем существующую
    подписку.
  */

  registerPushOwner();


  /*
    Если человек только сейчас
    включил Push, подхватим подписку
    автоматически.
  */

  const timer =
    window.setInterval(
      registerPushOwner,
      20000
    );


  return () => {

    active =
      false;


    window.clearInterval(
      timer
    );

  };

}, [
  viewer?.user,
]);




  /* =====================================================
     ТЕМА + SERVICE WORKER
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

        setTheme(
          saved
        );

      }

    } catch {}


    setReady(
      true
    );


    if (
      "serviceWorker" in
      navigator
    ) {

      navigator
        .serviceWorker
        .register(
          "/sw.js"
        )
        .catch(
          () => {}
        );

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


    return () => {

      window.clearInterval(
        timer
      );

    };

  }, []);



  /* =====================================================
     ПОГОДА
  ===================================================== */

  useEffect(() => {

    let active =
      true;


    async function loadWeather() {

      try {

        const response =
          await fetch(
            "/api/weather",
            {

              cache:
                "no-store",

            }
          );


        if (
          !response.ok
        ) {

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

      active =
        false;


      window.clearInterval(
        timer
      );

    };

  }, []);



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

        } catch {}


        return next;

      }
    );
  }



  /* =====================================================
     СМЕНИТЬ ПОЛЬЗОВАТЕЛЯ
  ===================================================== */

  async function changeViewer() {

    try {

      await fetch(
        "/api/auth/logout",
        {

          method:
            "POST",

        }
      );

    } catch {}


    router.replace(
      "/login"
    );


    router.refresh();
  }



  /* =====================================================
     ЭКРАН ВХОДА ИДЁТ БЕЗ ОБЫЧНОЙ ОБОЛОЧКИ
  ===================================================== */

  if (
    isLoginPage
  ) {

    return children;

  }



  /* =====================================================
     ПОКА ПРОВЕРЯЕМ COOKIE
  ===================================================== */

  if (
    !authReady
  ) {

    return (

      <div className="world-auth-loading">

        <span>
          ♥
        </span>

      </div>

    );
  }



  const dark =
    theme ===
    "dark";


  const viewerName =
    viewer?.user ===
    "kessi"
      ? "Кэссичка"
      : "Обсидик";


  return (

    <div
      className={`
        site-shell
        weather-theme-v3
        theme-${theme}
        ${weatherClass}
        ${timeClass}
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

        <div className="sun-layer" />
        <div className="cloud-layer" />
        <div className="rain-layer" />
        <div className="fog-layer" />
        <div className="snow-layer" />
        <div className="storm-layer" />

      </div>



      <header className="topbar">


        <Link
          className="topbar-brand"
          href="/"
        >

          <span className="brand-heart">
            ♥
          </span>


          <span>

            <b>
              Наш мирок
            </b>


            <small>
              наш маленький уголок в интернете
            </small>

          </span>

        </Link>



        <div className="world-topbar-actions">


          {
            viewer?.role ===
              "admin" &&
            (

              <Link
                href="/admin"
                className="world-admin-link"
              >
                ⚙ Управление
              </Link>

            )
          }


          <button
            type="button"
            className="theme-toggle"
            onClick={
              toggleTheme
            }
            aria-pressed={
              dark
            }
            title={
              dark
                ? "Включить светлую тему"
                : "Включить тёмную тему"
            }
          >

            <span className="theme-toggle-icon">
              {
                dark
                  ? "🌙"
                  : "☀️"
              }
            </span>


            <span
              className={
                `theme-toggle-switch ${
                  dark
                    ? "dark"
                    : ""
                }`
              }
            >
              <i />
            </span>

          </button>



          <button
            type="button"
            className="world-viewer-chip"
            onClick={
              changeViewer
            }
            title="Сменить пользователя"
          >

            <b>
              {viewerName}
            </b>

            <small>
              сменить
            </small>

          </button>


        </div>


      </header>



      <main className="site-content">
        {children}
      </main>


      <DrakoshaBuddy />


      <BottomNav />


    </div>
  );
}
