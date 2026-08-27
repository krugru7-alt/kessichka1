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
import CapsuleSystem from "./CapsuleSystem";
import HiddenKisses from "./HiddenKisses";
import WorldAnomalies from "./WorldAnomalies";



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

/* =====================================================
   PUSH · VAPID HELPERS
===================================================== */

function urlBase64ToUint8Array(
  base64String
) {

  const padding =
    "=".repeat(
      (
        4 -
        (
          base64String.length %
          4
        )
      ) %
      4
    );


  const base64 =
    (
      base64String +
      padding
    )
      .replace(
        /-/g,
        "+"
      )
      .replace(
        /_/g,
        "/"
      );


  const rawData =
    window.atob(
      base64
    );


  const outputArray =
    new Uint8Array(
      rawData.length
    );


  for (
    let i = 0;
    i < rawData.length;
    i++
  ) {

    outputArray[i] =
      rawData.charCodeAt(
        i
      );

  }


  return outputArray;
}



function arrayBufferToBase64Url(
  buffer
) {

  if (!buffer) {
    return "";
  }


  const bytes =
    new Uint8Array(
      buffer
    );


  let binary =
    "";


  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {

    binary +=
      String.fromCharCode(
        bytes[i]
      );

  }


  return window
    .btoa(
      binary
    )
    .replace(
      /\+/g,
      "-"
    )
    .replace(
      /\//g,
      "_"
    )
    .replace(
      /=+$/g,
      ""
    );
}



function normalizeVapidKey(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .replace(
      /=+$/g,
      ""
    );

}



function subscriptionUsesKey(
  subscription,
  publicKey
) {

  if (!subscription) {
    return false;
  }


  const subscriptionKey =
    subscription
      ?.options
      ?.applicationServerKey;


  /*
    Если браузер не сообщает,
    каким ключом создана подписка,
    безопаснее пересоздать её.
  */

  if (!subscriptionKey) {
    return false;
  }


  const current =
    normalizeVapidKey(
      publicKey
    );


  const existing =
    normalizeVapidKey(
      arrayBufferToBase64Url(
        subscriptionKey
      )
    );


  return (
    current ===
    existing
  );
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
     PUSH
     ПРОВЕРКА VAPID + АВТОМАТИЧЕСКАЯ МИГРАЦИЯ
  ===================================================== */

  useEffect(() => {

    if (
      !viewer?.user
    ) {
      return;
    }


    if (
      !(
        "serviceWorker" in
        navigator
      ) ||
      !(
        "Notification" in
        window
      )
    ) {
      return;
    }


    let active =
      true;


    let lastSyncedEndpoint =
      null;


    async function syncPush() {

      try {

        /*
          Если уведомления ещё
          не разрешены — сами
          разрешение не запрашиваем.
          Это остаётся задачей
          кнопки подключения.
        */

        if (
          Notification.permission !==
          "granted"
        ) {
          return;
        }


        const publicKey =
          process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;


        if (!publicKey) {

          console.error(
            "NEXT_PUBLIC_VAPID_PUBLIC_KEY не найден"
          );


          return;
        }


        const normalizedPublicKey =
          normalizeVapidKey(
            publicKey
          );


        const registration =
          await navigator
            .serviceWorker
            .ready;


        if (
          !registration
            .pushManager
        ) {
          return;
        }


        let subscription =
          await registration
            .pushManager
            .getSubscription();


        /*
          На некоторых браузерах
          applicationServerKey может
          быть недоступен.

          Поэтому дополнительно
          храним public key локально.
        */

        let savedPublicKey =
          "";


        try {

          savedPublicKey =
            normalizeVapidKey(
              localStorage.getItem(
                "our-world-vapid-public-key"
              )
            );

        } catch {
          savedPublicKey = "";
        }


        let shouldRecreate =
          false;


        if (subscription) {

          const subscriptionKey =
            subscription
              ?.options
              ?.applicationServerKey;


          if (
            subscriptionKey
          ) {

            shouldRecreate =
              !subscriptionUsesKey(
                subscription,
                publicKey
              );

          } else if (
            savedPublicKey
          ) {

            shouldRecreate =
              savedPublicKey !==
              normalizedPublicKey;

          } else {

            /*
              Это первый запуск новой
              логики, а определить ключ
              существующей подписки
              браузер не дал.

              Один раз пересоздаём её,
              после чего запоминаем
              текущий public key.
            */

            shouldRecreate =
              true;

          }

        }


        /* =================================================
           СТАРАЯ ПОДПИСКА
           ПЕРЕСОЗДАЁМ ПРИ СМЕНЕ VAPID
        ================================================= */

        if (
          subscription &&
          shouldRecreate
        ) {

          console.log(
            "Найден старый VAPID. Пересоздаю Push…"
          );


          try {

            await subscription
              .unsubscribe();

          } catch (
            unsubscribeError
          ) {

            console.warn(
              "Старая Push-подписка уже недоступна:",
              unsubscribeError
            );

          }


          subscription =
            null;


          lastSyncedEndpoint =
            null;

        }


        if (
          !active
        ) {
          return;
        }


        /* =================================================
           СОЗДАЁМ НОВУЮ ПОДПИСКУ
        ================================================= */

        if (
          !subscription
        ) {

          subscription =
            await registration
              .pushManager
              .subscribe({

                userVisibleOnly:
                  true,

                applicationServerKey:
                  urlBase64ToUint8Array(
                    publicKey
                  ),

              });


          console.log(
            "Новая Push-подписка создана"
          );

        }


        if (
          !subscription ||
          !active
        ) {
          return;
        }


        /*
          Один и тот же endpoint
          повторно каждые 20 секунд
          не отправляем.
        */

        if (
          subscription.endpoint ===
          lastSyncedEndpoint
        ) {
          return;
        }


        /* =================================================
           СТАРАЯ СИСТЕМА PUSH
        ================================================= */

        const legacyResponse =
          await fetch(
            "/api/subscribe",
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json",

              },

              body:
                JSON.stringify(
                  subscription
                ),

            }
          );


        if (
          !legacyResponse.ok
        ) {

          const data =
            await legacyResponse
              .json()
              .catch(
                () => null
              );


          throw new Error(
            data?.error ||
            "Не удалось сохранить Push-подписку"
          );

        }


        /* =================================================
           ПРИВЯЗЫВАЕМ К КЭССИЧКЕ / ОБСИДИКУ
        ================================================= */

        const ownerResponse =
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


        if (
          !ownerResponse.ok
        ) {

          const data =
            await ownerResponse
              .json()
              .catch(
                () => null
              );


          throw new Error(
            data?.error ||
            "Не удалось привязать Push к пользователю"
          );

        }


        /*
          Public key не секретный.
          Он нужен только для того,
          чтобы при следующей смене
          VAPID понять, что подписка
          устарела.
        */

        try {

          localStorage.setItem(
            "our-world-vapid-public-key",
            publicKey
          );

        } catch {
          // ничего страшного
        }


        lastSyncedEndpoint =
          subscription.endpoint;


        console.log(
          "Push синхронизирован:",
          viewer.user
        );


      } catch (error) {

        console.error(
          "Push sync:",
          error
        );

      }

    }


    /*
      Проверяем сразу после входа.
    */

    syncPush();


    /*
      И периодически проверяем.
      Если Push включили уже после
      загрузки страницы, новая
      подписка тоже подхватится.
    */

    const timer =
      window.setInterval(
        syncPush,
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
              наш маленький уголок
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


      <CapsuleSystem />

      <HiddenKisses />

      <WorldAnomalies />


      <DrakoshaBuddy />


      <BottomNav />


    </div>
  );
}
