"use client";

import { useEffect, useState } from "react";
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


const warmNotes = [
  "Не забывай: где-то далеко есть человек, которому очень важно, как прошёл твой день. ❤️",
  "Сегодня ничего не обязано быть идеально. Главное — береги себя.",
  "Если день шумный, вот тебе маленький тихий уголок. 🌷",
  "Записка без повода: ты очень-очень ценная буська.",
  "В случае сложного дня разрешается завернуться в плед и временно отменить взрослую жизнь.",
  "Если ты сейчас улыбаешься — эта записка сработала 😌",
  "Оставляю здесь немного тепла. Вдруг пригодится позже.",
  "Даже если забежала сюда на минуту — тьмок тебе всё равно положен. 💋",
];

const dragonDiaryEntries = [
  "День прошёл продуктивно: охранял сайт, смотрел в стену, съел воображаемую печеньку.",
  "Сегодня нашёл подозрительный носок. Ведётся расследование.",
  "Пытался управлять погодой в Минске. Пока получается только выглядеть уверенно.",
  "Охранял буську. Никого подозрительного, кроме Обсидика, не обнаружено.",
  "Спал 14 часов. Очень устал после такого насыщенного дня.",
  "Проверил запасы тьмоков. Требуется срочное пополнение.",
  "Сегодня ничего не сломал. Прошу занести это достижение в историю.",
];

const littlePermissions = [
  "не отвечать всем сразу",
  "сделать паузу без объяснений",
  "съесть что-нибудь вкусное",
  "отложить несрочное на завтра",
  "посмеяться с какой-нибудь фигни",
  "побыть в тишине",
  "выбрать себя хотя бы на час",
];

const tinyInternetNews = [
  "Дракоша замечен рядом с прогнозом погоды. Делает вид, что это не он.",
  "В Минске снова обнаружена одна буська. Состояние: прекрасное.",
  "Обсидик скучает. Эксперты сообщают: ничего нового.",
  "На сайте зафиксирован повышенный уровень уюта.",
  "Неизвестный оставил здесь ❤️. Подозреваемых двое.",
  "Дракоша запросил отпуск. Заявление отклонено.",
  "Система сообщает: вероятность тьмока сегодня — 100%.",
  "Срочная новость: можно не успеть всё и всё равно быть молодцом.",
];

const flowerStages = ["🌱", "🌱", "🌿", "🌿", "🪴", "🌷", "🌷"];

const wallMessages = [
  "ты здесь ↓",
  "береги себя",
  "не мёрзни",
  "поешь, бус",
  "ты важная ❤️",
  "улыбнись, если можешь",
  "возвращайся потом",
];

const polaroidCaptions = [
  "somewhere far away ❤️",
  "маленький хороший день",
  "дракоша был здесь",
  "для памяти",
  "одна буська в интернете",
  "тихий момент",
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

  // ==============================
  // МАЛЕНЬКИЙ МИР КЭССИЧКИ
  // Всё ниже меняется само по дате.
  // ==============================

  const minskDateKey =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Minsk",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

  const worldSeed =
    Number(
      minskDateKey.replace(/\D/g, "")
    ) || 1;

  const warmNote =
    warmNotes[
      worldSeed % warmNotes.length
    ];

  const dragonDiary =
    dragonDiaryEntries[
      (worldSeed + 2) %
        dragonDiaryEntries.length
    ];

  const todayPermission =
    littlePermissions[
      (worldSeed + 4) %
        littlePermissions.length
    ];

  const flowerStage =
    flowerStages[
      worldSeed % flowerStages.length
    ];

  const wallMessage =
    wallMessages[
      (worldSeed + 1) %
        wallMessages.length
    ];

  const polaroidCaption =
    polaroidCaptions[
      (worldSeed + 3) %
        polaroidCaptions.length
    ];

  const todaysNews = [
    tinyInternetNews[
      worldSeed %
        tinyInternetNews.length
    ],
    tinyInternetNews[
      (worldSeed + 3) %
        tinyInternetNews.length
    ],
    tinyInternetNews[
      (worldSeed + 5) %
        tinyInternetNews.length
    ],
  ];

  const prettyMinskDate =
    new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Europe/Minsk",
      day: "numeric",
      month: "long",
    }).format(now);

  return (
    <main
      className={`kessichka-page ${timeOfDay} world-page`}
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
           МАЛЕНЬКИЙ МИР КЭССИЧКИ
        ========================= */

        .world-page {
          display: block !important;
          overflow-x: hidden !important;
          overflow-y: visible !important;
          padding-bottom: 150px !important;
        }

        .world-page > .kessichka-card {
          margin-left: auto;
          margin-right: auto;
        }

        .kessichka-world {
          position: relative;
          width: min(100%, 980px);
          min-height: 1250px;
          margin: 54px auto 0;
          padding: 30px 18px 80px;
          isolation: isolate;
        }

        .world-glow {
          position: absolute;
          inset: 0;
          z-index: -2;
          pointer-events: none;
          background:
            radial-gradient(circle at 18% 16%, rgba(255,90,150,.10), transparent 22%),
            radial-gradient(circle at 80% 42%, rgba(135,105,255,.10), transparent 24%),
            radial-gradient(circle at 35% 82%, rgba(255,190,220,.06), transparent 25%);
        }

        .dragon-path {
          position: absolute;
          left: 50%;
          top: 85px;
          bottom: 105px;
          width: 2px;
          z-index: -1;
          opacity: .22;
          background:
            repeating-linear-gradient(
              to bottom,
              rgba(255,180,210,.8) 0 6px,
              transparent 6px 17px
            );
          transform: translateX(-50%) rotate(3deg);
        }

        .world-piece {
          position: relative;
          width: min(78%, 390px);
          border: 1px solid rgba(255,255,255,.09);
          box-shadow: 0 24px 60px rgba(0,0,0,.25);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .sticky-note {
          margin-left: 1%;
          padding: 23px 21px 22px;
          border-radius: 7px 18px 16px 11px;
          background:
            linear-gradient(
              145deg,
              rgba(255,224,234,.16),
              rgba(255,120,160,.07)
            );
          transform: rotate(-2.3deg);
        }

        .sticky-note::before {
          content: "📎";
          position: absolute;
          top: -17px;
          right: 22px;
          font-size: 24px;
          transform: rotate(14deg);
        }

        .world-kicker {
          margin: 0 0 9px;
          color: #ff9ab7;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .world-copy {
          margin: 0;
          color: rgba(255,255,255,.88);
          font-size: 15px;
          line-height: 1.65;
        }

        .flower-corner {
          width: min(62%, 300px);
          margin: 58px 1% 0 auto;
          padding: 18px 20px;
          border-radius: 24px 7px 21px 18px;
          background:
            linear-gradient(
              145deg,
              rgba(125,210,150,.10),
              rgba(255,255,255,.035)
            );
          text-align: right;
          transform: rotate(1.8deg);
        }

        .flower-stage {
          display: block;
          margin-bottom: 8px;
          font-size: 52px;
          line-height: 1;
          filter: drop-shadow(0 12px 22px rgba(100,210,140,.17));
        }

        .flower-small {
          margin: 0;
          color: rgba(255,255,255,.55);
          font-size: 12px;
          line-height: 1.55;
        }

        .diary-piece {
          width: min(76%, 430px);
          margin: 80px auto 0 3%;
          padding: 25px 23px;
          border-radius: 26px 20px 7px 25px;
          background:
            linear-gradient(
              145deg,
              rgba(115,100,230,.13),
              rgba(255,255,255,.035)
            );
          transform: rotate(1deg);
        }

        .diary-heading {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 11px;
          color: #fff;
          font-size: 17px;
          font-weight: 800;
        }

        .diary-meta {
          margin-top: 12px;
          color: rgba(255,190,215,.65);
          font-size: 11px;
        }

        .polaroid-piece {
          width: 230px;
          margin: -52px 3% 0 auto;
          padding: 11px 11px 17px;
          border: 0;
          border-radius: 6px;
          background: rgba(250,245,247,.92);
          box-shadow: 0 25px 60px rgba(0,0,0,.32);
          color: #31262c;
          transform: rotate(5deg);
        }

        .polaroid-photo {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          background:
            radial-gradient(circle at 35% 28%, rgba(255,190,220,.75), transparent 26%),
            linear-gradient(145deg, #776a91, #2d2638 62%, #15131a);
          font-size: 64px;
          box-shadow: inset 0 0 40px rgba(0,0,0,.18);
        }

        .polaroid-caption {
          margin: 11px 4px 0;
          font-family: "Comic Sans MS", "Segoe Print", cursive;
          font-size: 12px;
          text-align: center;
          transform: rotate(-1deg);
        }

        .thread-piece {
          width: 92%;
          margin: 88px auto 0;
          padding: 23px 18px 25px;
          border: 0;
          box-shadow: none;
          background: transparent;
        }

        .thread-labels {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          color: rgba(255,255,255,.78);
          font-size: 12px;
          font-weight: 700;
        }

        .thread-line {
          position: relative;
          height: 1px;
          margin: 19px 10px 15px;
          background:
            linear-gradient(
              90deg,
              rgba(255,90,145,.25),
              rgba(255,150,190,.8),
              rgba(150,120,255,.7),
              rgba(255,90,145,.25)
            );
          box-shadow: 0 0 18px rgba(255,95,155,.18);
        }

        .thread-line::before,
        .thread-line::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #ff8fb0;
          box-shadow: 0 0 15px rgba(255,100,155,.65);
          transform: translateY(-50%);
        }

        .thread-line::before { left: -2px; }
        .thread-line::after { right: -2px; }

        .thread-heart {
          position: absolute;
          left: 50%;
          top: 50%;
          padding: 0 8px;
          background: #120b11;
          transform: translate(-50%, -50%);
          font-size: 18px;
        }

        .thread-note {
          margin: 0;
          color: rgba(255,255,255,.5);
          font-size: 11px;
          text-align: center;
        }

        .permission-piece {
          width: min(69%, 350px);
          margin: 58px 5% 0 auto;
          padding: 22px 20px;
          border-radius: 25px 8px 23px 18px;
          background:
            linear-gradient(
              145deg,
              rgba(255,140,175,.11),
              rgba(255,255,255,.025)
            );
          transform: rotate(-1.5deg);
        }

        .permission-main {
          margin: 4px 0 0;
          color: #fff;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.3;
        }

        .world-wall {
          position: relative;
          width: 94%;
          min-height: 350px;
          margin: 90px auto 0;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 34px;
          background:
            linear-gradient(rgba(255,255,255,.025), rgba(255,255,255,.015)),
            repeating-linear-gradient(
              0deg,
              transparent 0 31px,
              rgba(255,255,255,.018) 31px 32px
            );
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.025),
            0 30px 90px rgba(0,0,0,.2);
        }

        .wall-title {
          position: absolute;
          top: 24px;
          left: 50%;
          color: rgba(255,255,255,.35);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 4px;
          text-transform: uppercase;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        .wall-you {
          position: absolute;
          top: 82px;
          left: 50%;
          color: rgba(255,255,255,.8);
          text-align: center;
          transform: translateX(-50%) rotate(-1deg);
        }

        .wall-you-arrow {
          display: block;
          margin-top: 3px;
          color: #ff88ab;
          font-size: 23px;
        }

        .wall-note-a,
        .wall-note-b {
          position: absolute;
          padding: 13px 14px;
          color: #33242c;
          font-family: "Comic Sans MS", "Segoe Print", cursive;
          font-size: 12px;
          line-height: 1.45;
          box-shadow: 0 12px 28px rgba(0,0,0,.18);
        }

        .wall-note-a {
          left: 7%;
          top: 155px;
          width: 140px;
          background: #f6d8e3;
          transform: rotate(-6deg);
        }

        .wall-note-b {
          right: 7%;
          top: 180px;
          width: 145px;
          background: #ddd7f3;
          transform: rotate(5deg);
        }

        .wall-dragon {
          position: absolute;
          left: 48%;
          bottom: 35px;
          font-size: 40px;
          transform: rotate(-5deg);
          filter: drop-shadow(0 8px 15px rgba(0,0,0,.25));
        }

        .wall-flower {
          position: absolute;
          left: 18%;
          bottom: 27px;
          font-size: 27px;
        }

        .wall-star {
          position: absolute;
          right: 19%;
          bottom: 45px;
          color: #ffdbe6;
          font-size: 20px;
          opacity: .75;
        }

        .internet-piece {
          width: 88%;
          margin: 78px auto 0;
          padding: 8px 0;
          border: 0;
          box-shadow: none;
          background: transparent;
        }

        .internet-title {
          margin: 0 0 24px;
          color: rgba(255,255,255,.5);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 3px;
          text-align: center;
          text-transform: uppercase;
        }

        .news-row {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 13px;
          align-items: start;
          margin-bottom: 17px;
        }

        .news-row:nth-child(odd) {
          margin-left: 10%;
        }

        .news-time {
          color: #ff84a9;
          font-size: 11px;
          font-variant-numeric: tabular-nums;
          opacity: .7;
        }

        .news-copy {
          position: relative;
          margin: 0;
          padding-left: 17px;
          color: rgba(255,255,255,.72);
          font-size: 13px;
          line-height: 1.55;
        }

        .news-copy::before {
          content: "";
          position: absolute;
          left: 0;
          top: 6px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,125,170,.75);
          box-shadow: 0 0 12px rgba(255,100,155,.35);
        }

        .goodbye-piece {
          width: min(80%, 480px);
          margin: 94px auto 0;
          padding: 28px 22px;
          border: 0;
          box-shadow: none;
          background: transparent;
          text-align: center;
        }

        .goodbye-small {
          margin: 0 0 9px;
          color: rgba(255,255,255,.32);
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .goodbye-main {
          margin: 0;
          color: rgba(255,255,255,.86);
          font-size: clamp(20px, 5vw, 30px);
          font-weight: 700;
          line-height: 1.4;
        }

        .goodbye-heart {
          display: block;
          margin-top: 14px;
          font-size: 22px;
          opacity: .75;
        }

        @media (max-width: 650px) {
          .world-page {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .kessichka-world {
            min-height: 1340px;
            margin-top: 40px;
            padding-left: 4px;
            padding-right: 4px;
          }

          .world-piece {
            width: 80%;
          }

          .sticky-note {
            margin-left: 0;
          }

          .flower-corner {
            width: 58%;
            margin-right: 0;
          }

          .diary-piece {
            width: 79%;
            margin-left: 0;
          }

          .polaroid-piece {
            width: 190px;
            margin-top: -20px;
            margin-right: 0;
          }

          .polaroid-photo {
            height: 145px;
            font-size: 52px;
          }

          .thread-piece {
            width: 100%;
          }

          .permission-piece {
            width: 76%;
            margin-right: 0;
          }

          .world-wall {
            width: 100%;
            min-height: 330px;
          }

          .wall-note-a {
            left: 4%;
            width: 126px;
          }

          .wall-note-b {
            right: 4%;
            width: 126px;
          }

          .internet-piece {
            width: 96%;
          }
        }

        `}
      </style>

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
          МАЛЕНЬКИЙ МИР КЭССИЧКИ
          Здесь специально нет одной
          центральной колонки.
      ========================= */}

      <section className="kessichka-world">

        <div className="world-glow" />
        <div className="dragon-path" />

        <article className="world-piece sticky-note">
          <p className="world-kicker">
            записка, оставленная тут
          </p>

          <p className="world-copy">
            {warmNote}
          </p>
        </article>

        <article className="world-piece flower-corner">
          <span className="flower-stage">
            {flowerStage}
          </span>

          <p className="world-kicker">
            маленькая штука растёт сама
          </p>

          <p className="flower-small">
            Сегодня — {prettyMinskDate}.
            Завтра она может выглядеть
            уже немного иначе.
          </p>
        </article>

        <article className="world-piece diary-piece">
          <div className="diary-heading">
            <span>🐉</span>
            <span>Дракошин дневник</span>
          </div>

          <p className="world-copy">
            {dragonDiary}
          </p>

          <div className="diary-meta">
            запись от {prettyMinskDate}
          </div>
        </article>

        <article className="world-piece polaroid-piece">
          <div className="polaroid-photo">
            🐉
          </div>

          <p className="polaroid-caption">
            {polaroidCaption}
          </p>
        </article>

        <article className="world-piece thread-piece">
          <div className="thread-labels">
            <span>Обсидик</span>
            <span>Кэссичка</span>
          </div>

          <div className="thread-line">
            <span className="thread-heart">
              ❤️
            </span>
          </div>

          <p className="thread-note">
            расстояние большое.
            нить всё равно работает.
          </p>
        </article>

        <article className="world-piece permission-piece">
          <p className="world-kicker">
            сегодня официально можно
          </p>

          <p className="permission-main">
            {todayPermission}.
          </p>
        </article>

        <section className="world-wall">
          <div className="wall-title">
            маленькая стена
          </div>

          <div className="wall-you">
            YOU ARE HERE
            <span className="wall-you-arrow">
              ↓
            </span>
            ❤️
          </div>

          <div className="wall-note-a">
            {wallMessage}
          </div>

          <div className="wall-note-b">
            скучаю вообще-то
            <br />
            — Обсидик
          </div>

          <div className="wall-flower">
            🌷
          </div>

          <div className="wall-dragon">
            🐉
          </div>

          <div className="wall-star">
            ✦
          </div>
        </section>

        <section className="world-piece internet-piece">
          <h2 className="internet-title">
            наш маленький интернет
          </h2>

          {todaysNews.map((news, index) => (
            <div
              className="news-row"
              key={`${news}-${index}`}
            >
              <div className="news-time">
                {[
                  "12:41",
                  "15:08",
                  "18:31",
                ][index]}
              </div>

              <p className="news-copy">
                {news}
              </p>
            </div>
          ))}
        </section>

        <footer className="world-piece goodbye-piece">
          <p className="goodbye-small">
            перед тем как уйдёшь
          </p>

          <p className="goodbye-main">
            Иди занимайся своими делами.
            Здесь всё останется на месте.
          </p>

          <span className="goodbye-heart">
            береги себя ❤️
          </span>
        </footer>

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
