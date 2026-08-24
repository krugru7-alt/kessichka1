"use client";

import { useEffect, useRef, useState } from "react";
import "./globals.css";

import {
  getCurrentScheduleItem,
  getCurrentDay,
  dayNames,
} from "./schedule";

const dailyMessages = [
  "У тебя сегодня всё получится. А если нет - ничего страшного, я всё равно рядом. ❤️",
  "Сегодня просто напоминание я скучаю 😌",
  "Пусть сегодня у тебя будет хотя бы один момент, когда ты поймаешь себя на мысли: «А ведь день неплохой». 🌷",
  "Ты уже проснулась - значит, день официально начался. Теперь осталось сделать его немного приятнее. ☀️",
  "Просто не забывай, что кое-кто далеко очень хочет видеть тебя счастливой. ❤️",
  "Маленькое утреннее напоминание: ты прекрасна. Всё, я сказал. 😌",
  "Пусть сегодня всё складывается чуть легче, чем ты ожидаешь. А если день будет вредничать - будем вредничать вместе с ним. ❤️",
];

const dragonPhrases = [
  "Сижу. Наблюдаю. Осуждаю 👀",
  "Я вообще-то занят поиском буськи 🐉",
  "Проверка связи: тьмок работает? 💋",
  "Дракоша сообщает: пора немного отдохнуть.",
  "Ушёл искать вкусняшку. Скоро буду.",
  "Сегодня я официально ничего не делаю 😌",
  "Обсидик просил за тобой присматривать 👀",
];

const redButtonPhrases = [
  "Я же написал: НЕ НАЖИМАТЬ.",
  "Кэссичка.",
  "Ты серьёзно? 👀",
  "Ещё раз — и я вызываю Дракошу.",
  "🐉 Дракоша уже в пути.",
  "Последнее предупреждение.",
  "Ладно. Теперь это твоя кнопка.",
  "Ты победила кнопку. Наверное.",
  "💋 ШТРАФНОЙ ТЬМОК!",
  "Всё. Кнопка увольняется.",
];

function urlBase64ToUint8Array(base64String) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const outputArray =
    new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] =
      rawData.charCodeAt(i);
  }

  return outputArray;
}

function getMinskHour() {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );
}

function getTimeOfDay() {
  const hour = getMinskHour();

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

  if ([1, 2, 3].includes(code))
    return "Облачно вайбик 🌤️";

  if ([45, 48].includes(code))
    return "Туман сайлентхилл 🌫️";

  if ([51, 53, 55, 56, 57].includes(code))
    return "Морось фе 🌦️";

  if ([61, 63, 65, 66, 67].includes(code))
    return "Дождь +вайб 🌧️";

  if ([71, 73, 75, 77].includes(code))
    return "Снег вайбик ❄️";

  if ([80, 81, 82].includes(code))
    return "Ливень любимое 🌧️";

  if ([85, 86].includes(code))
    return "Снегопад ❄️";

  if ([95, 96, 99].includes(code))
    return "Гроза ⛈️";

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
  const [now, setNow] = useState(new Date());

  const [showKiss, setShowKiss] = useState(false);

  // ==============================
  // ДРАКОША
  // ==============================

  const [drakoshaAction, setDrakoshaAction] =
    useState("idle");

  const [drakoshaBubble, setDrakoshaBubble] =
    useState("Тыкни 👀");

  const [dragonHouseOpen, setDragonHouseOpen] =
    useState(false);

  const [dragonHousePhrase, setDragonHousePhrase] =
    useState(dragonPhrases[0]);

  // ==============================
  // НОЧНОЙ СЕКРЕТ
  // ==============================

  const [nightSecretOpen, setNightSecretOpen] =
    useState(false);

  // ==============================
  // ПАСХАЛКИ
  // ==============================

  const [weatherClicks, setWeatherClicks] =
    useState(0);

  const [signatureClicks, setSignatureClicks] =
    useState(0);

  const [easterEgg, setEasterEgg] =
    useState("");

  // ==============================
  // КРАСНАЯ КНОПКА
  // ==============================

  const [redButtonCount, setRedButtonCount] =
    useState(0);

  const [redButtonText, setRedButtonText] =
    useState("НЕ НАЖИМАТЬ");

  // ==============================
  // ЖИВЫЕ ЭФФЕКТЫ САЙТА
  // ==============================

  const [showPawTrail, setShowPawTrail] =
    useState(false);

  const [flyingHeart, setFlyingHeart] =
    useState(null);

  const [heartCaught, setHeartCaught] =
    useState(false);

  const [sparkles, setSparkles] =
    useState([]);

  const sparkleIdRef = useRef(0);
  const lastSparkleRef = useRef(0);

  // ==============================
  // PUSH
  // ==============================

  async function enablePushNotifications() {
    try {
      setPushLoading(true);

      if (!("Notification" in window)) {
        alert(
          "Этот браузер не поддерживает уведомления."
        );
        return;
      }

      if (!("serviceWorker" in navigator)) {
        alert(
          "Этот браузер не поддерживает Push-уведомления."
        );
        return;
      }

      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        alert(
          "Разрешение на уведомления не получено."
        );
        return;
      }

      const registration =
        await navigator.serviceWorker.ready;

      if (!registration.pushManager) {
        alert(
          "Push-уведомления недоступны в этом браузере."
        );
        return;
      }

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error(
            "NEXT_PUBLIC_VAPID_PUBLIC_KEY не найден."
          );
        }

        const applicationServerKey =
          urlBase64ToUint8Array(publicKey);

        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
      }

      const response =
        await fetch("/api/subscribe", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(subscription),
        });

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.error ||
            "Не удалось сохранить Push-подписку."
        );
      }

      setPushEnabled(true);

      alert(
        "Уведомления подключены ❤️"
      );
    } catch (error) {
      console.error(
        "Ошибка подключения уведомлений:",
        error
      );

      alert(
        "ОШИБКА PUSH:\n\n" +
          String(
            error?.name ||
              "UnknownError"
          ) +
          "\n\n" +
          String(
            error?.message ||
              error
          )
      );
    } finally {
      setPushLoading(false);
    }
  }

  // ==============================
  // ВРЕМЯ
  // ==============================

  useEffect(() => {
    const timer =
      setInterval(() => {
        setNow(new Date());
      }, 60000);

    return () =>
      clearInterval(timer);
  }, []);

  // ==============================
  // ПОГОДА
  // ==============================

  useEffect(() => {
    fetch("/api/weather")
      .then((response) =>
        response.json()
      )
      .then((data) =>
        setWeather(data)
      )
      .catch(() =>
        setWeather({
          error: true,
        })
      );
  }, []);

  // ==============================
  // SERVICE WORKER
  // ==============================

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.error(
            "Ошибка регистрации Service Worker:",
            error
          );
        });
    }
  }, []);

  // ==============================
  // СЛУЧАЙНЫЕ ДЕЙСТВИЯ ДРАКОШИ
  // ==============================

  useEffect(() => {
    let actionTimer;
    let resetTimer;

    const actions = [
      "hop",
      "wave",
      "sleep",
    ];

    const bubbles = [
      "Тыкни 👀",
      "Я тут 🐉",
      "Бус?",
      "Жду тьмок 💜",
      "Не забудь поесть 👀",
      "Я слежу 😌",
    ];

    function scheduleAction() {
      const delay =
        Math.floor(
          Math.random() * 15000
        ) + 12000;

      actionTimer =
        setTimeout(() => {
          const randomAction =
            actions[
              Math.floor(
                Math.random() *
                  actions.length
              )
            ];

          const randomBubble =
            bubbles[
              Math.floor(
                Math.random() *
                  bubbles.length
              )
            ];

          setDrakoshaAction(
            randomAction
          );

          setDrakoshaBubble(
            randomBubble
          );

          resetTimer =
            setTimeout(() => {
              setDrakoshaAction(
                "idle"
              );

              scheduleAction();
            }, 1800);
        }, delay);
    }

    scheduleAction();

    return () => {
      clearTimeout(actionTimer);
      clearTimeout(resetTimer);
    };
  }, []);

  // ==============================
  // СЛЕДЫ ДРАКОШИ
  // ==============================

  useEffect(() => {
    let timer;
    let hideTimer;

    function schedulePaws() {
      const delay =
        Math.floor(Math.random() * 25000) +
        25000;

      timer = setTimeout(() => {
        setShowPawTrail(true);

        hideTimer = setTimeout(() => {
          setShowPawTrail(false);
          schedulePaws();
        }, 6500);
      }, delay);
    }

    schedulePaws();

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  // ==============================
  // ЛЕТАЮЩЕЕ СЕРДЕЧКО
  // ==============================

  useEffect(() => {
    let timer;
    let hideTimer;

    function scheduleHeart() {
      const delay =
        Math.floor(Math.random() * 30000) +
        25000;

      timer = setTimeout(() => {
        setFlyingHeart(
          Math.random() > 0.5
            ? "left-to-right"
            : "right-to-left"
        );

        hideTimer = setTimeout(() => {
          setFlyingHeart(null);
          scheduleHeart();
        }, 8500);
      }, delay);
    }

    scheduleHeart();

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  function catchFlyingHeart() {
    setFlyingHeart(null);
    setHeartCaught(true);

    setTimeout(() => {
      setHeartCaught(false);
    }, 1200);
  }

  // ==============================
  // ИСКОРКИ ОТ ПАЛЬЦА / МЫШКИ
  // ==============================

  function createSparkle(event) {
    const time = Date.now();

    if (time - lastSparkleRef.current < 90) {
      return;
    }

    lastSparkleRef.current = time;
    sparkleIdRef.current += 1;

    const id = sparkleIdRef.current;

    const sparkle = {
      id,
      x: event.clientX,
      y: event.clientY,
      symbol:
        id % 3 === 0
          ? "♡"
          : id % 2 === 0
            ? "✦"
            : "·",
    };

    setSparkles((current) =>
      [...current.slice(-14), sparkle]
    );

    setTimeout(() => {
      setSparkles((current) =>
        current.filter((item) =>
          item.id !== id
        )
      );
    }, 900);
  }

  // ==============================
  // DOMIK
  // ==============================

  function openDragonHouse() {
    const phrase =
      dragonPhrases[
        Math.floor(
          Math.random() *
            dragonPhrases.length
        )
      ];

    setDragonHousePhrase(phrase);
    setDragonHouseOpen(true);
  }

  // ==============================
  // RED BUTTON
  // ==============================

  function pressRedButton() {
    const newCount =
      redButtonCount + 1;

    setRedButtonCount(newCount);

    const index =
      Math.min(
        newCount - 1,
        redButtonPhrases.length - 1
      );

    setRedButtonText(
      redButtonPhrases[index]
    );

    if (newCount === 9) {
      setShowKiss(true);

      setTimeout(() => {
        setShowKiss(false);
      }, 1500);
    }
  }

  // ==============================
  // ПАСХАЛКА ПОГОДЫ
  // ==============================

  function weatherEgg() {
    const clicks =
      weatherClicks + 1;

    setWeatherClicks(clicks);

    if (clicks === 5) {
      setEasterEgg(
        "🌦️ Секрет найден: погода официально находится под контролем Дракоши."
      );

      setWeatherClicks(0);
    }
  }

  // ==============================
  // ПАСХАЛКА ПОДПИСИ
  // ==============================

  function signatureEgg() {
    const clicks =
      signatureClicks + 1;

    setSignatureClicks(clicks);

    if (clicks === 4) {
      setEasterEgg(
        "❤️ Обсидик был здесь. И вообще-то очень скучает."
      );

      setSignatureClicks(0);
    }
  }

  const timeOfDay =
    getTimeOfDay();

  const currentSchedule =
    getCurrentScheduleItem();

  const currentDay =
    getCurrentDay();

  const minskTime =
    new Intl.DateTimeFormat(
      "ru-RU",
      {
        timeZone:
          "Europe/Minsk",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }
    ).format(now);

  const minskHour =
    getMinskHour();

  const isNight =
    minskHour >= 22 ||
    minskHour < 6;

  const today =
    new Date();

  const message =
    dailyMessages[
      Math.floor(
        (
          new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ) -
          new Date(
            2026,
            0,
            1
          )
        ) /
          86400000
      ) %
        dailyMessages.length
    ];

  return (
    <main
      className={`kessichka-page ${timeOfDay}`}
      onPointerMove={createSparkle}
    >
      <style>
        {`

        /* =========================
           НОВЫЕ ШТУКИ
        ========================= */

        .fun-zone {
          margin-top: 18px;
          display: grid;
          gap: 12px;
        }

        .fun-card {
          padding: 16px;
          border-radius: 20px;

          border:
            1px solid
            rgba(255,255,255,.08);

          background:
            rgba(255,255,255,.045);

          color: white;

          text-align: left;
        }

        .fun-card-title {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 800;
        }

        .fun-card-text {
          margin: 0;
          font-size: 13px;
          opacity: .65;
          line-height: 1.5;
        }

        .fun-button {
          width: 100%;
          margin-top: 11px;

          padding: 11px 14px;

          border: 0;
          border-radius: 14px;

          background:
            rgba(255,255,255,.09);

          color: white;

          font-weight: 700;

          cursor: pointer;
        }

        /* ДОМ ДРАКОШИ */

        .dragon-house-button {
          background:
            linear-gradient(
              135deg,
              rgba(120,100,255,.18),
              rgba(255,100,180,.12)
            );
        }

        /* НОЧНАЯ ЗВЕЗДА */

        .night-secret-button {
          font-size: 25px;

          animation:
            secretStar 2.5s
            ease-in-out infinite;
        }

        @keyframes secretStar {
          0%,100% {
            transform: scale(1);
            opacity: .75;
          }

          50% {
            transform: scale(1.12);
            opacity: 1;
          }
        }

        /* КРАСНАЯ КНОПКА */

        .danger-button {
          background:
            linear-gradient(
              135deg,
              #b60028,
              #5f0016
            );

          box-shadow:
            0 10px 30px
            rgba(255,0,60,.18);

          transition:
            transform .15s ease;
        }

        .danger-button:active {
          transform:
            scale(.95);
        }

        .danger-count {
          margin-top: 8px;

          font-size: 11px;
          opacity: .4;
        }

        /* MODAL */

        .mini-modal {
          position: fixed;
          inset: 0;

          z-index: 50000;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 25px;

          background:
            rgba(0,0,0,.72);

          backdrop-filter:
            blur(12px);
        }

        .mini-modal-card {
          width: 100%;
          max-width: 370px;

          padding: 26px 22px;

          border-radius: 28px;

          background:
            linear-gradient(
              145deg,
              #211422,
              #100b12
            );

          border:
            1px solid
            rgba(255,255,255,.1);

          box-shadow:
            0 30px 90px
            rgba(0,0,0,.5);

          text-align: center;
        }

        .modal-dragon {
          width: 150px;
          max-width: 70%;

          filter:
            drop-shadow(
              0 15px 25px
              rgba(100,100,230,.25)
            );
        }

        .modal-title {
          margin:
            10px 0 8px;

          font-size: 22px;
        }

        .modal-text {
          margin: 0;

          font-size: 15px;
          line-height: 1.6;

          opacity: .8;
        }

        .modal-close {
          margin-top: 18px;

          padding: 10px 18px;

          border: 0;
          border-radius: 14px;

          background:
            rgba(255,255,255,.1);

          color: white;

          font-weight: 700;
        }

        /* ПАСХАЛКА */

        .easter-overlay {
          position: fixed;
          left: 50%;
          bottom: 25px;

          z-index: 60000;

          width:
            min(
              calc(100% - 30px),
              420px
            );

          padding: 15px 16px;

          transform:
            translateX(-50%);

          border-radius: 18px;

          background:
            rgba(20,12,22,.94);

          border:
            1px solid
            rgba(255,120,170,.25);

          box-shadow:
            0 20px 50px
            rgba(0,0,0,.45);

          color: white;

          text-align: center;

          font-size: 13px;

          animation:
            eggAppear .3s ease;
        }

        @keyframes eggAppear {
          from {
            opacity: 0;
            transform:
              translateX(-50%)
              translateY(20px);
          }

          to {
            opacity: 1;
            transform:
              translateX(-50%)
              translateY(0);
          }
        }

        /* =========================
           ЖИВЫЕ ЭФФЕКТЫ
        ========================= */

        .ambient-layer {
          position: fixed;
          inset: 0;
          z-index: 30;
          pointer-events: none;
          overflow: hidden;
        }

        .paw-trail {
          position: fixed;
          left: -30px;
          bottom: 118px;
          z-index: 1200;
          width: calc(100vw + 60px);
          height: 90px;
          pointer-events: none;
        }

        .paw-print {
          position: absolute;
          bottom: 0;
          font-size: 22px;
          opacity: 0;
          filter: drop-shadow(0 4px 10px rgba(180,150,255,.25));
          animation: pawAppear 4.8s ease forwards;
        }

        .paw-print:nth-child(1) { left: 3%; animation-delay: 0s; transform: rotate(-18deg); }
        .paw-print:nth-child(2) { left: 13%; bottom: 22px; animation-delay: .28s; transform: rotate(13deg); }
        .paw-print:nth-child(3) { left: 24%; animation-delay: .56s; transform: rotate(-13deg); }
        .paw-print:nth-child(4) { left: 35%; bottom: 20px; animation-delay: .84s; transform: rotate(16deg); }
        .paw-print:nth-child(5) { left: 46%; animation-delay: 1.12s; transform: rotate(-12deg); }
        .paw-print:nth-child(6) { left: 57%; bottom: 22px; animation-delay: 1.4s; transform: rotate(14deg); }
        .paw-print:nth-child(7) { left: 68%; animation-delay: 1.68s; transform: rotate(-14deg); }
        .paw-print:nth-child(8) { left: 79%; bottom: 20px; animation-delay: 1.96s; transform: rotate(16deg); }
        .paw-print:nth-child(9) { left: 89%; animation-delay: 2.24s; transform: rotate(-10deg); }

        .paw-found-heart {
          position: absolute;
          right: 3%;
          bottom: 5px;
          font-size: 25px;
          opacity: 0;
          animation: pawHeart 2s ease 2.8s forwards;
        }

        @keyframes pawAppear {
          0% { opacity: 0; transform: translateY(10px) scale(.6); }
          15% { opacity: .85; }
          58% { opacity: .85; }
          100% { opacity: 0; transform: translateY(-4px) scale(1); }
        }

        @keyframes pawHeart {
          0% { opacity: 0; transform: scale(.4); }
          35% { opacity: 1; transform: scale(1.18); }
          70% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: translateY(-12px) scale(.9); }
        }

        .flying-heart {
          position: fixed;
          top: 36%;
          z-index: 3000;
          border: 0;
          padding: 8px;
          background: transparent;
          font-size: 34px;
          cursor: pointer;
          filter: drop-shadow(0 8px 18px rgba(255,80,145,.45));
          -webkit-tap-highlight-color: transparent;
        }

        .flying-heart.left-to-right {
          left: -70px;
          animation: flyHeartRight 8s linear forwards;
        }

        .flying-heart.right-to-left {
          right: -70px;
          animation: flyHeartLeft 8s linear forwards;
        }

        @keyframes flyHeartRight {
          0% { transform: translateX(0) translateY(0) rotate(-8deg); }
          20% { transform: translateX(22vw) translateY(-45px) rotate(8deg); }
          45% { transform: translateX(48vw) translateY(20px) rotate(-6deg); }
          70% { transform: translateX(74vw) translateY(-35px) rotate(8deg); }
          100% { transform: translateX(calc(100vw + 100px)) translateY(10px) rotate(0); }
        }

        @keyframes flyHeartLeft {
          0% { transform: translateX(0) translateY(0) rotate(8deg); }
          20% { transform: translateX(-22vw) translateY(-45px) rotate(-8deg); }
          45% { transform: translateX(-48vw) translateY(20px) rotate(6deg); }
          70% { transform: translateX(-74vw) translateY(-35px) rotate(-8deg); }
          100% { transform: translateX(calc(-100vw - 100px)) translateY(10px) rotate(0); }
        }

        .heart-caught {
          position: fixed;
          left: 50%;
          top: 50%;
          z-index: 50000;
          pointer-events: none;
          transform: translate(-50%, -50%);
          font-size: 46px;
          animation: caughtHeart 1.2s ease forwards;
        }

        @keyframes caughtHeart {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(.4); }
          35% { opacity: 1; transform: translate(-50%, -50%) scale(1.45); }
          100% { opacity: 0; transform: translate(-50%, -80%) scale(.9); }
        }

        .pointer-sparkle {
          position: fixed;
          z-index: 2500;
          pointer-events: none;
          color: rgba(255,210,235,.95);
          font-size: 16px;
          text-shadow: 0 0 12px rgba(255,110,180,.8);
          animation: sparkleFade .9s ease-out forwards;
        }

        @keyframes sparkleFade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(.4); }
          25% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -90%) scale(1.15) rotate(18deg); }
        }

        .weather-fx {
          position: fixed;
          inset: 0;
          z-index: 25;
          pointer-events: none;
          overflow: hidden;
        }

        .rain-drop {
          position: absolute;
          top: -80px;
          width: 1px;
          height: 34px;
          background: linear-gradient(to bottom, transparent, rgba(190,215,255,.55));
          animation: rainFall 1.25s linear infinite;
        }

        .rain-drop:nth-child(1) { left: 4%; animation-delay: -.2s; }
        .rain-drop:nth-child(2) { left: 12%; animation-delay: -.8s; }
        .rain-drop:nth-child(3) { left: 20%; animation-delay: -.45s; }
        .rain-drop:nth-child(4) { left: 29%; animation-delay: -1.1s; }
        .rain-drop:nth-child(5) { left: 38%; animation-delay: -.65s; }
        .rain-drop:nth-child(6) { left: 47%; animation-delay: -.05s; }
        .rain-drop:nth-child(7) { left: 56%; animation-delay: -.9s; }
        .rain-drop:nth-child(8) { left: 64%; animation-delay: -.35s; }
        .rain-drop:nth-child(9) { left: 73%; animation-delay: -1.15s; }
        .rain-drop:nth-child(10) { left: 81%; animation-delay: -.55s; }
        .rain-drop:nth-child(11) { left: 90%; animation-delay: -.15s; }
        .rain-drop:nth-child(12) { left: 97%; animation-delay: -.75s; }

        @keyframes rainFall {
          to { transform: translate(-28px, calc(100vh + 150px)); opacity: .15; }
        }

        .snow-flake {
          position: absolute;
          top: -40px;
          color: rgba(255,255,255,.72);
          font-size: 15px;
          animation: snowFall 7s linear infinite;
        }

        .snow-flake:nth-child(1) { left: 5%; animation-delay: -1s; }
        .snow-flake:nth-child(2) { left: 14%; animation-delay: -4s; font-size: 10px; }
        .snow-flake:nth-child(3) { left: 23%; animation-delay: -2s; }
        .snow-flake:nth-child(4) { left: 34%; animation-delay: -6s; font-size: 12px; }
        .snow-flake:nth-child(5) { left: 43%; animation-delay: -3s; }
        .snow-flake:nth-child(6) { left: 52%; animation-delay: -.5s; font-size: 9px; }
        .snow-flake:nth-child(7) { left: 61%; animation-delay: -5s; }
        .snow-flake:nth-child(8) { left: 70%; animation-delay: -2.5s; font-size: 11px; }
        .snow-flake:nth-child(9) { left: 79%; animation-delay: -6.5s; }
        .snow-flake:nth-child(10) { left: 88%; animation-delay: -1.5s; font-size: 10px; }
        .snow-flake:nth-child(11) { left: 95%; animation-delay: -4.5s; }

        @keyframes snowFall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: .8; }
          55% { transform: translate(25px, 55vh) rotate(170deg); }
          100% { transform: translate(-15px, calc(100vh + 80px)) rotate(360deg); opacity: .1; }
        }

        .sun-glow-fx {
          position: absolute;
          top: -18%;
          right: -20%;
          width: 70vw;
          height: 70vw;
          max-width: 650px;
          max-height: 650px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,215,135,.11), transparent 68%);
          animation: sunGlowMove 7s ease-in-out infinite;
        }

        @keyframes sunGlowMove {
          0%,100% { transform: scale(.95); opacity: .45; }
          50% { transform: scale(1.08); opacity: .85; }
        }

        .storm-flash {
          position: absolute;
          inset: 0;
          background: rgba(220,225,255,.13);
          opacity: 0;
          animation: stormFlash 8s linear infinite;
        }

        @keyframes stormFlash {
          0%, 74%, 78%, 100% { opacity: 0; }
          75% { opacity: .35; }
          76% { opacity: .03; }
          77% { opacity: .22; }
        }

        @media (max-width: 480px) {
          .paw-trail { bottom: 96px; }
          .paw-print { font-size: 18px; }
          .flying-heart { font-size: 30px; }
        }

        `}
      </style>

      {/* =========================
          ЖИВЫЕ ЭФФЕКТЫ
      ========================= */}

      <div className="ambient-layer">
        {sparkles.map((sparkle) => (
          <span
            key={sparkle.id}
            className="pointer-sparkle"
            style={{
              left: sparkle.x,
              top: sparkle.y,
            }}
          >
            {sparkle.symbol}
          </span>
        ))}
      </div>

      {showPawTrail && (
        <div className="paw-trail">
          {Array.from({ length: 9 }).map((_, index) => (
            <span
              key={index}
              className="paw-print"
            >
              🐾
            </span>
          ))}

          <span className="paw-found-heart">
            ❤️
          </span>
        </div>
      )}

      {flyingHeart && (
        <button
          type="button"
          className={`flying-heart ${flyingHeart}`}
          onClick={catchFlyingHeart}
          aria-label="Поймать сердечко"
        >
          💗
        </button>
      )}

      {heartCaught && (
        <div className="heart-caught">
          💗 ✨ 💗
        </div>
      )}

      {weather && !weather.error && (
        <div className="weather-fx">
          {[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(
            weather.weatherCode
          ) &&
            Array.from({ length: 12 }).map((_, index) => (
              <span
                key={`rain-${index}`}
                className="rain-drop"
              />
            ))}

          {[71, 73, 75, 77, 85, 86].includes(
            weather.weatherCode
          ) &&
            Array.from({ length: 11 }).map((_, index) => (
              <span
                key={`snow-${index}`}
                className="snow-flake"
              >
                ❄
              </span>
            ))}

          {weather.weatherCode === 0 && (
            <div className="sun-glow-fx" />
          )}

          {[95, 96, 99].includes(weather.weatherCode) && (
            <div className="storm-flash" />
          )}
        </div>
      )}

      <section className="kessichka-card">

        <div className="kessichka-sun">
          {timeOfDay === "morning" &&
            "🌅"}

          {timeOfDay === "day" &&
            "☀️"}

          {timeOfDay === "evening" &&
            "🌆"}

          {timeOfDay === "night" &&
            "🌙"}
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
          Я далеко, и не могу пока лично
          следить за тобой, но могу хотя бы
          иногда напоминать о простых вещах
          и заботиться о бусе:
          поешь, не мёрзни, отдыхай
          и иногда улыбайся.
        </p>

        {currentSchedule && (
          <div className="daily-message">

            <div
              style={{
                fontSize: "12px",
                opacity: 0.5,
                marginBottom: "8px",
              }}
            >
              Сейчас по Минску:{" "}
              {minskTime}
            </div>

            <div className="daily-message-label">
              {dayNames[currentDay]} •{" "}
              {currentSchedule.time}
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

        <div className="daily-message">

          <div className="daily-message-label">
            Маленькое сообщение для тебя
          </div>

          <p>
            {message}
          </p>

        </div>

        <div
          className="weather-card"
          onClick={weatherEgg}
        >

          <div className="weather-icon">
            {weather?.error
              ? "🌥️"
              : "🌤️"}
          </div>

          <h2 className="weather-title">
            Погода в Минске
          </h2>

          {!weather && (
            <p className="weather-text">
              Смотрю, что там у тебя
              за окном...
            </p>
          )}

          {weather?.error && (
            <p className="weather-text">
              Не смог посмотреть погоду,
              но ты всё равно оденься
              по погоде 😌
            </p>
          )}

          {weather &&
            !weather.error && (
              <>
                <p className="weather-text">
                  {weatherText(
                    weather.weatherCode
                  )}
                </p>

                <div className="temperature">
                  {Math.round(
                    weather.temperature
                  )}
                  °
                </div>

                <p className="weather-feels">
                  Ощущается как{" "}
                  {Math.round(
                    weather.feelsLike
                  )}
                  °
                </p>

                <p className="weather-text">
                  Сегодня от{" "}
                  {Math.round(
                    weather.min
                  )}
                  ° до{" "}
                  {Math.round(
                    weather.max
                  )}
                  °C
                </p>

                <p className="weather-text">
                  Вероятность дождя:{" "}
                  {weather.rainChance}%
                </p>

                <div className="weather-advice">
                  {getWeatherAdvice(
                    weather
                  )}
                </div>
              </>
            )}

        </div>

        {/* =========================
            НОВЫЕ ШТУКИ
        ========================= */}

        <div className="fun-zone">

          {/* ДОМ ДРАКОШИ */}

          <div className="fun-card">
            <p className="fun-card-title">
              🏠 Домик Дракоши
            </p>

            <p className="fun-card-text">
              Иногда он дома. Иногда занят
              очень важными драконьими
              делами.
            </p>

            <button
              className="
                fun-button
                dragon-house-button
              "
              onClick={
                openDragonHouse
              }
            >
              Постучать 🐉
            </button>
          </div>

          {/* НОЧНОЙ СЕКРЕТ */}

          {isNight && (
            <div className="fun-card">
              <p className="fun-card-title">
                🌙 Что это там?
              </p>

              <p className="fun-card-text">
                Эта штука появляется только
                ночью по Минску.
              </p>

              <button
                className="
                  fun-button
                  night-secret-button
                "
                onClick={() =>
                  setNightSecretOpen(
                    true
                  )
                }
              >
                ✨
              </button>
            </div>
          )}

          {/* КРАСНАЯ КНОПКА */}

          <div className="fun-card">
            <p className="fun-card-title">
              🔴 Очень важная кнопка
            </p>

            <p className="fun-card-text">
              Инструкция максимально
              простая.
            </p>

            <button
              className="
                fun-button
                danger-button
              "
              onClick={
                pressRedButton
              }
            >
              {redButtonText}
            </button>

            {redButtonCount > 0 && (
              <div className="danger-count">
                Нажато:{" "}
                {redButtonCount}
              </div>
            )}
          </div>

        </div>

        {!pushEnabled && (
          <button
            className="push-button"
            onClick={
              enablePushNotifications
            }
            disabled={pushLoading}
          >
            {pushLoading
              ? "Подключаю уведомления..."
              : "🔔 Получать приветы от Обсидика ❤️"}
          </button>
        )}

        {pushEnabled && (
          <div className="push-enabled">
            🔔 Уведомления подключены ❤️
          </div>
        )}

        <p
          className="signature"
          onClick={
            signatureEgg
          }
        >
          Обсидик ❤️
        </p>

      </section>

      {/* =========================
          ДРАКОША
      ========================= */}

      <div
        className={`drakosha-floating ${drakoshaAction}`}
      >
        <div className="drakosha-bubble">
          {drakoshaBubble}
        </div>

        <img
          src="/drakosha.png"
          alt="Дракоша"
          className="drakosha-image"
          onClick={() => {
            setShowKiss(true);

            setTimeout(() => {
              setShowKiss(false);
            }, 1500);
          }}
        />
      </div>

      {/* =========================
          ДОМИК ДРАКОШИ
      ========================= */}

      {dragonHouseOpen && (
        <div className="mini-modal">

          <div className="mini-modal-card">

            <img
              src="/drakosha.png"
              alt="Дракоша"
              className="modal-dragon"
            />

            <h2 className="modal-title">
              Домик Дракоши 🐉
            </h2>

            <p className="modal-text">
              {dragonHousePhrase}
            </p>

            <button
              className="modal-close"
              onClick={() =>
                setDragonHouseOpen(
                  false
                )
              }
            >
              Закрыть
            </button>

          </div>

        </div>
      )}

      {/* =========================
          НОЧНОЙ СЕКРЕТ
      ========================= */}

      {nightSecretOpen && (
        <div className="mini-modal">

          <div className="mini-modal-card">

            <div
              style={{
                fontSize: "60px",
              }}
            >
              🌙
            </div>

            <h2 className="modal-title">
              Ночной секрет
            </h2>

            <p className="modal-text">
              Если ты это нашла —
              значит уже поздно.
              Отдыхай иногда, бус.
              И сладких снов ❤️
            </p>

            <button
              className="modal-close"
              onClick={() =>
                setNightSecretOpen(
                  false
                )
              }
            >
              Тьмок и спать 💋
            </button>

          </div>

        </div>
      )}

      {/* =========================
          ПАСХАЛКА
      ========================= */}

      {easterEgg && (
        <div
          className="easter-overlay"
          onClick={() =>
            setEasterEgg("")
          }
        >
          {easterEgg}

          <div
            style={{
              marginTop: "5px",
              opacity: 0.4,
              fontSize: "10px",
            }}
          >
            тыкни, чтобы закрыть
          </div>
        </div>
      )}

      {/* =========================
          ТЬМОК
      ========================= */}

      {showKiss && (
        <div className="kiss-overlay">

          <div className="kiss-hearts">
            ❤️ 💗 💕 ❤️ 💗
          </div>

          <div className="kiss-mark">
            💋
          </div>

          <div className="kiss-title">
            ТЬМОК!
          </div>

          <div className="kiss-subtitle">
            словила буську ❤️
          </div>

        </div>
      )}

    </main>
  );
}
