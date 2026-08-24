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
  "Не забывай: есть человек, которому очень важно, как прошёл твой день. ❤️",
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
  "маленькое место для тебя ❤️",
  "маленький хороший день",
  "дракоша был здесь",
  "для памяти",
  "одна буська в интернете",
  "тихий момент",
];

const roomDeskNotes = [
  "Я тут оставил тебе место, где можно просто побыть. Никаких дел. ❤️",
  "Если день оказался громким — посиди здесь минутку. Я рядом. ❤️",
  "Напоминание со стола: поесть, выдохнуть и не требовать от себя невозможного.",
  "Эта записка ничего не просит. Просто тьмок и немного тепла. 💋",
  "Сегодня разрешается быть сонной буськой и всё равно быть прекрасной.",
  "Сюда можно возвращаться даже просто на минуту. Я всё равно рад, что ты зашла.",
];

const roomObjects = [
  "🎧",
  "🧸",
  "☕",
  "📎",
  "🎀",
  "🪩",
];

const ticketPrizes = [
  "🎟️ Билет на вкусняшку без чувства вины",
  "🎟️ Билет на 20 минут полного ничегонеделания",
  "🎟️ Билет на один дополнительный тьмок 💋",
  "🎟️ Билет на любимую песню погромче",
  "🎟️ Билет на уютный вечер",
  "🎟️ Билет на маленькую радость сегодня",
];

const drawerFinds = [
  "🍬 конфета. Кто её сюда положил — неизвестно.",
  "💌 крошечная записка: «ты буська».",
  "🧦 подозрительный носок Дракоши.",
  "🎀 ленточка. Просто красивая.",
  "💗 запасное сердечко. На всякий случай.",
  "🪙 монетка удачи. Сегодня твоя.",
];

const dragonStashFinds = [
  "🐉 Дракоша спрятал здесь три тьмока и никому не признаётся.",
  "🍪 Найдена половина печеньки. Вторая половина уже подозрительно исчезла.",
  "🎮 Очень важная драконья штука. Назначение засекречено.",
  "💎 Камушек, который Дракоша объявил сокровищем.",
  "📎 Скрепка. Почему она в тайнике — вопросов больше, чем ответов.",
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
  // ИНТЕРАКТИВНАЯ КОМНАТА
  // ==============================

  const [windowFogged, setWindowFogged] = useState(false);
  const [noteFlipped, setNoteFlipped] = useState(false);
  const [activePolaroid, setActivePolaroid] = useState(null);
  const [nookMessage, setNookMessage] = useState(
    "Тыкни на лежанку, игрушку или миску 👀"
  );
  const [lampOn, setLampOn] = useState(false);
  const [garlandMode, setGarlandMode] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerFind, setDrawerFind] = useState("пока закрыто");
  const [mysteryBoxCount, setMysteryBoxCount] = useState(0);
  const [mysteryBoxText, setMysteryBoxText] = useState("НЕ ТРОГАТЬ 👀");
  const [mysteryBoxOpen, setMysteryBoxOpen] = useState(false);
  const [ticketText, setTicketText] = useState("дёрни рычаг");
  const [ticketPulling, setTicketPulling] = useState(false);
  const [stashOpen, setStashOpen] = useState(false);
  const [stashText, setStashText] = useState("тайник закрыт");
  const [doorCount, setDoorCount] = useState(0);
  const [doorText, setDoorText] = useState("куда собралась? 👀");
  const [doorOpen, setDoorOpen] = useState(false);

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

  // ==============================
  // ИНТЕРАКТИВЫ КОМНАТЫ
  // ==============================

  const garlandSets = [
    ["поешь", "выдохни", "тьмок ❤️", "не мёрзни"],
    ["ты умничка", "не спеши", "я рядом", "улыбнись 😌"],
    ["бус", "отдохни", "❤️", "всё получится"],
  ];

  function changeGarland() {
    setGarlandMode((current) =>
      current >= garlandSets.length - 1 ? 0 : current + 1
    );
  }

  function touchNook(type) {
    const messages = {
      bed: "Дракоша улёгся. Просил не шуметь... хотя сам храпит 💤",
      toy: "Игрушка найдена. Дракоша делает вид, что она ему вообще не нужна 🧸",
      bowl: "Миска проверена. Дракоша требует вкусняшку и профсоюз 🥣",
      dragon: "Дракоша пойман за бездельем. Срочно выдан тьмок 🐉❤️",
    };

    setNookMessage(messages[type]);

    if (type === "dragon") {
      setDrakoshaAction("hop");
      setTimeout(() => setDrakoshaAction("idle"), 900);
    }
  }

  function openDrawer() {
    const find = drawerFinds[Math.floor(Math.random() * drawerFinds.length)];
    setDrawerFind(find);
    setDrawerOpen((current) => !current);
  }

  function touchMysteryBox() {
    const next = mysteryBoxCount + 1;
    setMysteryBoxCount(next);
    setMysteryBoxOpen(true);

    const reactions = [
      "Я же написал не трогать.",
      "Коробка делает вид, что ничего не произошло.",
      "Изнутри кто-то сказал: «эй».",
      "🐉 Дракоша: ЭТО МОЁ.",
      "💗 Ладно. Внутри было сердечко. Забирай.",
    ];

    setMysteryBoxText(
      reactions[Math.min(next - 1, reactions.length - 1)]
    );

    setTimeout(() => {
      setMysteryBoxOpen(false);
    }, 1800);
  }

  function pullTicket() {
    if (ticketPulling) return;

    setTicketPulling(true);
    setTicketText("дёрни рычаг");

    setTimeout(() => {
      setTicketText(
        ticketPrizes[Math.floor(Math.random() * ticketPrizes.length)]
      );
    }, 650);

    setTimeout(() => {
      setTicketPulling(false);
    }, 1500);
  }

  function openStash() {
    setStashOpen((current) => !current);

    if (!stashOpen) {
      setTimeout(() => {
        setStashText(
          dragonStashFinds[
            Math.floor(Math.random() * dragonStashFinds.length)
          ]
        );
      }, 450);
    }
  }

  function touchDoor() {
    const next = doorCount + 1;
    setDoorCount(next);
    setDoorOpen((current) => !current);

    const messages = [
      "Куда собралась? 👀",
      "Ну ладно... но ненадолго.",
      "Дракоша сказал закрыть дверь, тепло уходит 🐉",
      "Возвращайся потом ❤️",
    ];

    setDoorText(
      messages[Math.min(next - 1, messages.length - 1)]
    );
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

  const deskNote =
    roomDeskNotes[
      (worldSeed + 4) % roomDeskNotes.length
    ];

  const roomObject =
    roomObjects[
      (worldSeed + 2) % roomObjects.length
    ];

  const wallMessage =
    wallMessages[
      (worldSeed + 1) % wallMessages.length
    ];

  const polaroidCaption =
    polaroidCaptions[
      (worldSeed + 3) % polaroidCaptions.length
    ];

  const secondPolaroidCaption =
    polaroidCaptions[
      (worldSeed + 5) % polaroidCaptions.length
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
           КОМНАТА КЭССИЧКИ
        ========================= */

        .world-page {
          display: block !important;
          overflow-x: hidden !important;
          overflow-y: visible !important;
          padding-bottom: 130px !important;
        }

        .world-page > .kessichka-card {
          margin-left: auto;
          margin-right: auto;
        }

        .kessichka-room {
          position: relative;
          width: min(100%, 980px);
          min-height: 1460px;
          margin: 55px auto 0;
          padding: 42px 22px 90px;
          overflow: hidden;
          isolation: isolate;
        }

        .room-ambient {
          position: absolute;
          inset: 0;
          z-index: -3;
          pointer-events: none;
          background:
            radial-gradient(circle at 83% 14%, rgba(255,184,215,.10), transparent 25%),
            radial-gradient(circle at 13% 48%, rgba(131,110,255,.09), transparent 24%),
            radial-gradient(circle at 72% 86%, rgba(255,102,159,.07), transparent 26%);
        }

        .room-heading {
          width: min(80%, 520px);
          margin: 0 auto 55px;
          text-align: center;
        }

        .room-heading-small {
          margin: 0 0 7px;
          color: rgba(255,255,255,.35);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .room-heading-main {
          margin: 0;
          color: rgba(255,255,255,.9);
          font-size: clamp(25px, 6vw, 40px);
          line-height: 1.2;
        }

        /* ГИРЛЯНДА ИДЁТ ЧЕРЕЗ ВСЮ КОМНАТУ */
        .room-garland {
          position: relative;
          width: 92%;
          height: 78px;
          margin: 0 auto 15px;
          border-top: 1px solid rgba(255,180,210,.30);
          border-radius: 50%;
          transform: rotate(-1.5deg);
        }

        .garland-word {
          position: absolute;
          top: -11px;
          padding: 4px 8px;
          border-radius: 10px;
          background: rgba(20,11,18,.9);
          color: rgba(255,215,230,.82);
          font-size: 10px;
          box-shadow: 0 0 18px rgba(255,100,160,.12);
        }
        .garland-word:nth-child(1){left:5%; transform:rotate(-7deg)}
        .garland-word:nth-child(2){left:27%; top:4px; transform:rotate(4deg)}
        .garland-word:nth-child(3){left:53%; top:10px; transform:rotate(-3deg)}
        .garland-word:nth-child(4){right:5%; transform:rotate(6deg)}

        /* ОКНО — СПРАВА */
        .room-window {
          position: relative;
          width: min(58%, 390px);
          min-height: 310px;
          margin: 10px 1% 0 auto;
          overflow: hidden;
          border: 9px solid rgba(255,255,255,.08);
          border-radius: 25px 25px 9px 9px;
          background: linear-gradient(180deg, rgba(65,59,91,.95), rgba(20,17,31,.96));
          box-shadow: 0 28px 80px rgba(0,0,0,.35), inset 0 0 50px rgba(255,255,255,.03);
          transform: rotate(1.2deg);
        }

        .room-window::before,
        .room-window::after {
          content: "";
          position: absolute;
          z-index: 2;
          background: rgba(255,255,255,.09);
        }
        .room-window::before { left: 50%; top: 0; bottom: 0; width: 5px; transform: translateX(-50%); }
        .room-window::after { left: 0; right: 0; top: 49%; height: 5px; }

        .window-sky {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 75% 22%, rgba(255,213,232,.22), transparent 12%),
            linear-gradient(180deg, rgba(80,64,112,.68), rgba(31,25,49,.93));
        }
        .world-page.day .window-sky, .world-page.morning .window-sky {
          background: linear-gradient(180deg, rgba(240,151,184,.38), rgba(74,64,105,.78));
        }
        .world-page.night .window-sky {
          background:
            radial-gradient(circle at 76% 18%, rgba(249,235,255,.78) 0 13px, transparent 14px),
            linear-gradient(180deg, #17162c, #30223e 68%, #15131e);
        }

        .window-stars {
          position: absolute;
          inset: 0;
          opacity: .65;
          background-image:
            radial-gradient(circle at 20% 20%, white 0 1px, transparent 2px),
            radial-gradient(circle at 65% 32%, white 0 1px, transparent 2px),
            radial-gradient(circle at 37% 73%, white 0 1px, transparent 2px),
            radial-gradient(circle at 84% 64%, white 0 1px, transparent 2px);
        }
        .world-page.day .window-stars, .world-page.morning .window-stars { opacity: .1; }

        .window-weather-info {
          position: absolute;
          left: 18px;
          bottom: 17px;
          z-index: 5;
          max-width: 70%;
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(9,8,15,.48);
          backdrop-filter: blur(10px);
          color: rgba(255,255,255,.88);
        }
        .window-weather-city { margin:0 0 3px; font-size:11px; letter-spacing:2px; text-transform:uppercase; opacity:.55; }
        .window-weather-main { margin:0; font-size:15px; font-weight:800; }
        .window-weather-temp { margin:5px 0 0; font-size:12px; opacity:.65; }

        .window-rain { position:absolute; inset:0; opacity:.45; background: repeating-linear-gradient(105deg, transparent 0 18px, rgba(215,225,255,.25) 19px 20px, transparent 21px 38px); }
        .window-snow { position:absolute; inset:0; color:white; font-size:18px; opacity:.65; letter-spacing:30px; line-height:62px; padding:8px; }

        /* СТОЛИК / ЗАПИСКА — СЛЕВА */
        .room-desk {
          position: relative;
          width: min(64%, 430px);
          margin: -80px auto 0 1%;
          padding: 65px 18px 21px;
          transform: rotate(-1.7deg);
        }
        .desk-surface {
          position:absolute; left:-8%; right:-4%; bottom:0; height:38px;
          border-radius: 15px 12px 28px 18px;
          background: linear-gradient(180deg, rgba(111,65,76,.46), rgba(54,32,43,.70));
          box-shadow: 0 18px 40px rgba(0,0,0,.24);
        }
        .desk-note {
          position: relative;
          z-index:2;
          width: 82%;
          padding: 21px 18px 20px;
          border-radius: 5px 16px 11px 8px;
          background: #ead9df;
          color: #38282f;
          box-shadow: 0 16px 32px rgba(0,0,0,.22);
          font-family: "Segoe Print", "Comic Sans MS", cursive;
          font-size: 13px;
          line-height: 1.65;
          transform: rotate(-3deg);
        }
        .desk-note::before { content:"📎"; position:absolute; top:-17px; right:18px; font-size:22px; }
        .desk-object { position:absolute; right:5%; bottom:25px; z-index:3; font-size:38px; transform:rotate(8deg); filter:drop-shadow(0 10px 14px rgba(0,0,0,.25)); }

        /* POLAROID-СТЕНА */
        .photo-wall {
          position: relative;
          width: 95%;
          min-height: 345px;
          margin: 85px auto 0;
          border-radius: 36px;
          background: repeating-linear-gradient(0deg, rgba(255,255,255,.015) 0 31px, rgba(255,255,255,.035) 31px 32px);
          border:1px solid rgba(255,255,255,.06);
          box-shadow: inset 0 0 90px rgba(0,0,0,.12);
        }
        .photo-wall-title { position:absolute; left:50%; top:25px; transform:translateX(-50%); color:rgba(255,255,255,.28); font-size:10px; letter-spacing:4px; text-transform:uppercase; white-space:nowrap; }
        .room-polaroid {
          position:absolute; width:195px; padding:10px 10px 16px; background:#f0e9eb; color:#31272c; box-shadow:0 20px 45px rgba(0,0,0,.30);
        }
        .room-polaroid.one { left:8%; top:72px; transform:rotate(-7deg); }
        .room-polaroid.two { right:8%; top:95px; transform:rotate(6deg); }
        .room-polaroid-photo { height:145px; display:flex; align-items:center; justify-content:center; background:linear-gradient(145deg,#776a91,#2d2638 62%,#15131a); font-size:53px; }
        .room-polaroid.two .room-polaroid-photo { background:radial-gradient(circle at 50% 40%, rgba(255,150,190,.4), transparent 28%), linear-gradient(145deg,#421c2e,#15131a); }
        .room-polaroid-caption { margin:10px 2px 0; text-align:center; font:12px "Segoe Print",cursive; }
        .wall-mini-note { position:absolute; left:43%; bottom:40px; padding:10px 12px; background:#d9d3ef; color:#342d3d; font:11px "Segoe Print",cursive; transform:rotate(3deg); box-shadow:0 10px 25px rgba(0,0,0,.2); }

        /* УГОЛОК ДРАКОШИ — ВНИЗУ СПРАВА */
        .dragon-nook {
          position: relative;
          width: min(72%, 460px);
          min-height: 300px;
          margin: 92px 1% 0 auto;
          overflow:hidden;
          border-radius: 46px 18px 35px 18px;
          background: linear-gradient(145deg, rgba(103,87,180,.12), rgba(255,255,255,.025));
          border:1px solid rgba(255,255,255,.07);
          box-shadow:0 28px 75px rgba(0,0,0,.23);
        }
        .nook-title { position:absolute; top:22px; left:25px; margin:0; color:rgba(255,255,255,.42); font-size:10px; letter-spacing:3px; text-transform:uppercase; }
        .nook-bed { position:absolute; left:30px; bottom:30px; width:200px; height:72px; border-radius:50%; background:radial-gradient(ellipse, rgba(185,149,230,.38), rgba(82,64,111,.35) 65%, transparent 67%); filter:drop-shadow(0 14px 20px rgba(0,0,0,.2)); }
        .nook-dragon { position:absolute; left:66px; bottom:43px; width:130px; filter:drop-shadow(0 13px 18px rgba(60,45,100,.35)); }
        .nook-bowl { position:absolute; right:44px; bottom:42px; font-size:35px; }
        .nook-toy { position:absolute; right:95px; bottom:37px; font-size:23px; transform:rotate(-10deg); }
        .nook-diary { position:absolute; right:25px; top:70px; width:43%; margin:0; color:rgba(255,255,255,.72); font-size:12px; line-height:1.65; }

        /* ИНТЕРАКТИВНЫЕ ШТУКИ КОМНАТЫ */
        .room-discovery-zone { width:min(94%,860px); margin:90px auto 0; display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }
        .room-discovery { position:relative; min-height:190px; padding:22px; border:1px solid rgba(255,255,255,.08); border-radius:28px; background:rgba(255,255,255,.035); box-shadow:0 22px 60px rgba(0,0,0,.14); overflow:hidden; }
        .room-discovery:nth-child(even){ transform:translateY(32px) rotate(.7deg); }
        .room-discovery:nth-child(odd){ transform:rotate(-.6deg); }
        .discovery-kicker{margin:0 0 8px;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;opacity:.38}
        .discovery-title{margin:0 0 12px;font-size:18px;font-weight:800}
        .discovery-text{min-height:42px;margin:0 0 15px;font-size:12px;line-height:1.6;opacity:.66}
        .discovery-object{display:block;margin:8px auto 12px;font-size:52px;filter:drop-shadow(0 10px 18px rgba(0,0,0,.22));transition:transform .2s ease}
        .room-discovery:active .discovery-object{transform:scale(.92) rotate(-3deg)}
        .discovery-button{border:0;border-radius:14px;padding:10px 14px;background:rgba(255,255,255,.09);color:#fff;font-weight:750;font-size:11px;cursor:pointer}
        /* ЯЩИК — реально выезжает */
        .drawer-visual{position:relative;width:118px;height:76px;margin:8px auto 14px;perspective:500px}
        .drawer-cabinet{position:absolute;inset:0;border-radius:12px;background:linear-gradient(145deg,#5d4052,#332634);box-shadow:inset 0 0 0 5px rgba(0,0,0,.13),0 14px 28px rgba(0,0,0,.23)}
        .drawer-front{position:absolute;left:12px;right:12px;top:22px;height:38px;border-radius:7px;background:linear-gradient(145deg,#8a6175,#654758);box-shadow:0 8px 18px rgba(0,0,0,.22);transition:transform .55s cubic-bezier(.2,.8,.2,1);transform-style:preserve-3d}
        .drawer-front::after{content:"•";position:absolute;left:50%;top:6px;transform:translateX(-50%);color:#e8bdcd;font-size:17px}
        .drawer-visual.open .drawer-front{transform:translateY(30px) translateZ(28px)}
        .drawer-find-pop{position:absolute;left:50%;top:15px;transform:translate(-50%,10px) scale(.4);opacity:0;font-size:28px;transition:all .45s ease .25s}
        .drawer-visual.open .drawer-find-pop{transform:translate(-50%,-12px) scale(1);opacity:1}
        .drawer-open{animation:drawerText .45s ease}
        @keyframes drawerText{0%{transform:translateY(10px);opacity:.2}100%{transform:translateY(0);opacity:1}}

        /* КОРОБКА — крышка откидывается */
        .mystery-box-visual{position:relative;width:110px;height:82px;margin:5px auto 14px;perspective:500px}
        .box-body{position:absolute;left:12px;right:12px;bottom:0;height:54px;border-radius:6px 6px 12px 12px;background:linear-gradient(145deg,#9b6f48,#6b4b31);box-shadow:0 12px 24px rgba(0,0,0,.22)}
        .box-lid{position:absolute;left:5px;right:5px;top:10px;height:24px;border-radius:7px;background:linear-gradient(145deg,#b48559,#795536);transform-origin:left bottom;transition:transform .5s cubic-bezier(.2,.8,.2,1);box-shadow:0 6px 12px rgba(0,0,0,.18)}
        .mystery-box-visual.open .box-lid{transform:rotateZ(-17deg) rotateY(-36deg) translateY(-8px)}
        .box-surprise{position:absolute;left:50%;top:30px;opacity:0;transform:translate(-50%,8px) scale(.3);font-size:31px;transition:all .45s ease .25s}
        .mystery-box-visual.open .box-surprise{opacity:1;transform:translate(-50%,-15px) scale(1.1)}

        /* БИЛЕТНЫЙ АППАРАТ — рычаг и выдача */
        .ticket-machine{position:relative;width:125px;height:128px;margin:4px auto 10px}
        .machine-body{position:absolute;left:16px;right:16px;top:13px;height:92px;border-radius:18px;background:linear-gradient(145deg,#7b667e,#403444);box-shadow:inset 0 0 0 5px rgba(255,255,255,.035),0 15px 30px rgba(0,0,0,.24)}
        .machine-slot{position:absolute;left:38px;right:38px;bottom:26px;height:7px;border-radius:5px;background:#19131b;box-shadow:inset 0 2px 5px rgba(0,0,0,.5)}
        .machine-lever{position:absolute;right:3px;top:28px;width:8px;height:51px;border-radius:8px;background:#c7a0ad;transform-origin:50% 8px;transition:transform .28s ease}
        .machine-lever::after{content:"";position:absolute;left:50%;bottom:-10px;width:18px;height:18px;border-radius:50%;background:#e7b7c6;transform:translateX(-50%);box-shadow:0 5px 12px rgba(0,0,0,.25)}
        .ticket-machine.pulling .machine-lever{animation:leverPull .65s ease}
        @keyframes leverPull{0%{transform:rotate(0)}45%{transform:rotate(42deg)}100%{transform:rotate(0)}}
        .ticket-paper{position:relative;margin:0 auto;padding:11px 12px;width:88%;border-radius:8px;background:#f3e6d5;color:#493b38;font-size:11px;font-weight:700;transform:translateY(-28px) rotate(-1deg);opacity:0;box-shadow:0 8px 18px rgba(0,0,0,.18)}
        .ticket-paper.ticket-out{animation:ticketOut .65s cubic-bezier(.2,.8,.2,1) forwards}
        @keyframes ticketOut{0%{opacity:0;transform:translateY(-42px) scaleY(.35) rotate(-1deg)}35%{opacity:1}100%{opacity:1;transform:translateY(0) scaleY(1) rotate(-1deg)}}

        /* ТАЙНИК — люк открывается */
        .stash-visual{position:relative;width:112px;height:88px;margin:5px auto 13px;perspective:500px}
        .stash-hole{position:absolute;left:15px;right:15px;bottom:5px;height:45px;border-radius:50%;background:radial-gradient(ellipse,#08070a 0 48%,#2f2630 50% 70%,transparent 72%);filter:drop-shadow(0 10px 15px rgba(0,0,0,.35))}
        .stash-hatch{position:absolute;left:18px;right:18px;bottom:21px;height:39px;border-radius:50%;background:linear-gradient(145deg,#574450,#352b36);transform-origin:left center;transition:transform .55s cubic-bezier(.2,.8,.2,1);box-shadow:0 6px 15px rgba(0,0,0,.25)}
        .stash-visual.open .stash-hatch{transform:rotateY(-72deg) translateX(-4px)}
        .stash-treasure{position:absolute;left:50%;bottom:25px;opacity:0;transform:translate(-50%,8px) scale(.4);font-size:31px;transition:all .45s ease .28s}
        .stash-visual.open .stash-treasure{opacity:1;transform:translate(-50%,-12px) scale(1)}

        /* ДВЕРЬ — реально открывается */
        .room-door-zone{width:min(72%,520px);margin:100px auto 20px;text-align:center;perspective:900px}
        .door-frame{position:relative;width:160px;height:220px;margin:0 auto 16px;border-radius:78px 78px 14px 14px;background:linear-gradient(145deg,#241a24,#120f14);box-shadow:0 25px 55px rgba(0,0,0,.3),inset 0 0 0 7px rgba(255,255,255,.025);overflow:visible}
        .room-door{position:absolute;inset:7px;border-radius:70px 70px 10px 10px;background:linear-gradient(145deg,rgba(112,73,96,.94),rgba(53,35,54,.98));border:2px solid rgba(255,255,255,.08);box-shadow:inset 0 0 0 8px rgba(0,0,0,.12);cursor:pointer;transform-origin:left center;transition:transform .7s cubic-bezier(.2,.75,.2,1),box-shadow .7s ease;transform-style:preserve-3d}
        .room-door.open{transform:rotateY(-67deg);box-shadow:18px 15px 35px rgba(0,0,0,.38)}
        .room-door::after{content:"•";position:absolute;right:20px;top:100px;color:#f2c3a5;font-size:24px;text-shadow:0 0 10px rgba(255,200,160,.4)}
        .door-behind{position:absolute;inset:18px 14px 12px;border-radius:58px 58px 8px 8px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 38%,rgba(255,120,175,.16),transparent 35%),linear-gradient(180deg,#160f17,#08070a);color:#ffd7e5;font-size:31px;opacity:.8}
        .door-sign{position:absolute;left:50%;top:42px;transform:translateX(-50%) rotate(-3deg);width:82px;padding:7px 5px;background:#ead8c9;color:#5a4448;font-size:9px;font-weight:800;border-radius:4px;box-shadow:0 5px 12px rgba(0,0,0,.2)}
        .door-message{margin:0;font-size:12px;opacity:.6;transition:transform .3s ease,opacity .3s ease}
        .room-door-zone:active .door-message{transform:translateY(2px);opacity:.9}
        @media(max-width:650px){.room-discovery-zone{grid-template-columns:1fr;gap:18px}.room-discovery:nth-child(even),.room-discovery:nth-child(odd){transform:none}.room-discovery{min-height:165px}.room-door-zone{margin-top:70px}}

        /* НОЧНИК И ФИНАЛ */
        .room-lamp-zone {
          position:relative; width:min(76%,500px); min-height:250px; margin:90px auto 0; text-align:center;
        }
        .lamp-glow { position:absolute; left:50%; bottom:18px; width:260px; height:190px; border-radius:50%; background:radial-gradient(ellipse, rgba(255,182,202,.18), transparent 68%); transform:translateX(-50%); opacity:.35; }
        .world-page.night .lamp-glow, .world-page.evening .lamp-glow { opacity:.9; filter:blur(3px); }
        .room-lamp { position:relative; z-index:2; display:block; margin:0 auto 18px; font-size:64px; filter:drop-shadow(0 0 24px rgba(255,180,210,.3)); }
        .room-goodbye { position:relative; z-index:2; margin:0; color:rgba(255,255,255,.85); font-size:clamp(20px,5vw,29px); font-weight:700; line-height:1.45; }
        .room-goodbye-small { position:relative; z-index:2; margin:10px 0 0; color:rgba(255,255,255,.38); font-size:11px; }

        /* =========================
           ИНТЕРАКТИВЫ КОМНАТЫ
        ========================= */

        .room-clickable { cursor:pointer; -webkit-tap-highlight-color:transparent; }

        .room-garland { cursor:pointer; transition:filter .25s ease, transform .25s ease; }
        .room-garland:active { filter:brightness(1.35); transform:rotate(-1.5deg) scale(.985); }

        .room-window { cursor:pointer; transition:transform .3s ease, box-shadow .3s ease; }
        .room-window:active { transform:rotate(1.2deg) scale(.985); }
        .window-fog {
          position:absolute; inset:0; z-index:4; display:flex; align-items:center; justify-content:center;
          padding:25px; background:rgba(225,220,235,.24); backdrop-filter:blur(7px);
          color:rgba(255,255,255,.88); font:15px "Segoe Print",cursive; text-align:center;
          transition:opacity .35s ease;
        }
        .window-hint { position:absolute; right:10px; top:10px; z-index:6; padding:5px 8px; border-radius:10px; background:rgba(10,8,15,.38); color:rgba(255,255,255,.48); font-size:9px; }

        .desk-note { cursor:pointer; transform-style:preserve-3d; transition:transform .5s ease, background .3s ease; }
        .desk-note.flipped { transform:rotate(-3deg) rotateY(180deg); background:#ded7ef; }
        .desk-note-inner { transition:opacity .2s ease; }
        .desk-note.flipped .desk-note-inner { transform:rotateY(180deg); }
        .desk-note-hint { display:block; margin-top:9px; font-family:Arial,sans-serif; font-size:9px; opacity:.42; }

        .room-polaroid { cursor:pointer; transition:transform .3s ease, z-index .1s, box-shadow .3s ease; }
        .room-polaroid.one.active { z-index:12; transform:rotate(-2deg) scale(1.16); box-shadow:0 28px 70px rgba(0,0,0,.42); }
        .room-polaroid.two.active { z-index:12; transform:rotate(2deg) scale(1.16); box-shadow:0 28px 70px rgba(0,0,0,.42); }
        .polaroid-secret { margin:7px 2px 0; font:10px "Segoe Print",cursive; opacity:.65; text-align:center; }

        .nook-bed,.nook-bowl,.nook-toy,.nook-dragon { cursor:pointer; -webkit-tap-highlight-color:transparent; }
        .nook-bowl,.nook-toy,.nook-dragon { transition:transform .2s ease; }
        .nook-bowl:active,.nook-toy:active { transform:scale(.82) rotate(-8deg); }
        .nook-dragon:active { transform:scale(.94); }
        .nook-reaction { position:absolute; left:24px; right:24px; bottom:8px; margin:0; color:rgba(255,210,230,.66); font-size:10px; text-align:center; }

        .thread-heart { cursor:pointer; user-select:none; transition:transform .2s ease, filter .2s ease; }
        .thread-heart.pulse { animation:roomHeartPulse .85s ease; }
        @keyframes roomHeartPulse {
          0%,100% { transform:translate(-50%,-50%) scale(1); }
          35% { transform:translate(-50%,-50%) scale(1.8); filter:drop-shadow(0 0 18px rgba(255,90,150,.9)); }
          65% { transform:translate(-50%,-50%) scale(.9); }
        }

        .room-lamp-zone { cursor:pointer; transition:background .45s ease, box-shadow .45s ease; border-radius:45px; padding-top:15px; }
        .room-lamp-zone.lamp-on {
          background:radial-gradient(ellipse at 50% 45%, rgba(255,181,105,.12), transparent 68%);
          box-shadow:0 20px 90px rgba(255,145,90,.08);
        }
        .room-lamp-zone.lamp-on .lamp-glow { opacity:1 !important; background:radial-gradient(ellipse, rgba(255,196,120,.34), transparent 68%); }
        .room-lamp-zone.lamp-on .room-lamp { filter:drop-shadow(0 0 36px rgba(255,194,105,.8)); }
        .lamp-hint { position:relative; z-index:2; margin:7px 0 0; color:rgba(255,255,255,.28); font-size:9px; }

        @media (max-width:650px) {
          .world-page { padding-left:12px !important; padding-right:12px !important; }
          .kessichka-room { min-height:1510px; margin-top:38px; padding-left:2px; padding-right:2px; }
          .room-heading { margin-bottom:42px; }
          .room-window { width:71%; min-height:270px; margin-right:-4px; }
          .room-desk { width:74%; margin-top:-48px; margin-left:-5px; }
          .desk-note { width:91%; }
          .photo-wall { width:100%; min-height:330px; }
          .room-polaroid { width:145px; }
          .room-polaroid-photo { height:108px; font-size:42px; }
          .room-polaroid.one { left:4%; }
          .room-polaroid.two { right:4%; top:115px; }
          .wall-mini-note { left:37%; bottom:30px; }
          .dragon-nook { width:82%; min-height:290px; margin-right:-5px; }
          .nook-dragon { width:112px; left:46px; }
          .nook-bed { width:165px; left:22px; }
          .nook-diary { width:44%; right:15px; }
          .room-thread { width:97%; }
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
          КОМНАТА КЭССИЧКИ
          Свободная композиция, не лента
      ========================= */}

      <section className="kessichka-room">
        <div className="room-ambient" />

        <header className="room-heading">
          <p className="room-heading-small">
            ещё одно маленькое место
          </p>
          <h2 className="room-heading-main">
            Комната Кэссички
          </h2>
        </header>

        <div
          className="room-garland room-clickable"
          onClick={changeGarland}
          title="Тыкни на гирлянду"
        >
          {garlandSets[garlandMode].map((word, index) => (
            <span className="garland-word" key={`${word}-${index}`}>
              {word}
            </span>
          ))}
        </div>

        {/* ОКНО В МИНСК */}
        <section
          className="room-window room-clickable"
          onClick={() => setWindowFogged((current) => !current)}
        >
          <div className="window-sky" />
          <div className="window-stars" />

          {weather && !weather.error &&
            [51,53,55,56,57,61,63,65,66,67,80,81,82].includes(weather.weatherCode) && (
              <div className="window-rain" />
            )}

          {weather && !weather.error &&
            [71,73,75,77,85,86].includes(weather.weatherCode) && (
              <div className="window-snow">❄ ❄ ❄ ❄ ❄ ❄</div>
            )}

          <div className="window-hint">тыкни по стеклу</div>

          {windowFogged && (
            <div className="window-fog">
              снаружи Минск, а здесь можно немного выдохнуть ❤️
            </div>
          )}

          <div className="window-weather-info">
            <p className="window-weather-city">Минск • сейчас</p>
            <p className="window-weather-main">
              {weather && !weather.error
                ? weatherText(weather.weatherCode)
                : "Смотрю в окно..."}
            </p>
            {weather && !weather.error && (
              <p className="window-weather-temp">
                {Math.round(weather.temperature)}° • ощущается как {Math.round(weather.feelsLike)}°
              </p>
            )}
          </div>
        </section>

        {/* СТОЛИК */}
        <section className="room-desk">
          <div className="desk-surface" />
          <div
            className={`desk-note ${noteFlipped ? "flipped" : ""}`}
            onClick={() => setNoteFlipped((current) => !current)}
          >
            <div className="desk-note-inner">
              {noteFlipped
                ? "P.S. если ты дочитала обратную сторону — тебе положен дополнительный тьмок 💋"
                : deskNote}
              <div style={{ marginTop: "10px", opacity: 0.55 }}>— Обсидик</div>
              <span className="desk-note-hint">тыкни — у записки есть обратная сторона</span>
            </div>
          </div>
          <div className="desk-object" aria-hidden="true">
            {roomObject}
          </div>
        </section>

        {/* СТЕНА С ПОЛАРОИДАМИ */}
        <section className="photo-wall">
          <div className="photo-wall-title">стена маленьких моментов</div>

          <article
            className={`room-polaroid one ${activePolaroid === 1 ? "active" : ""}`}
            onClick={() => setActivePolaroid(activePolaroid === 1 ? null : 1)}
          >
            <div className="room-polaroid-photo">🐉</div>
            <p className="room-polaroid-caption">{polaroidCaption}</p>
            {activePolaroid === 1 && (
              <p className="polaroid-secret">он утверждает, что позировал именно так специально 👀</p>
            )}
          </article>

          <article
            className={`room-polaroid two ${activePolaroid === 2 ? "active" : ""}`}
            onClick={() => setActivePolaroid(activePolaroid === 2 ? null : 2)}
          >
            <div className="room-polaroid-photo">❤️</div>
            <p className="room-polaroid-caption">{secondPolaroidCaption}</p>
            {activePolaroid === 2 && (
              <p className="polaroid-secret">маленькая штука на память: ты здесь очень важная ❤️</p>
            )}
          </article>

          <div className="wall-mini-note">
            {wallMessage}
          </div>
        </section>

        {/* УГОЛОК ДРАКОШИ */}
        <section className="dragon-nook">
          <p className="nook-title">уголок дракоши</p>
          <div className="nook-bed" onClick={() => touchNook("bed")} />
          <img
            src="/drakosha.png"
            alt="Дракоша отдыхает"
            className="nook-dragon"
            onClick={() => touchNook("dragon")}
          />
          <div className="nook-bowl" onClick={() => touchNook("bowl")}>🥣</div>
          <div className="nook-toy" onClick={() => touchNook("toy")}>🧸</div>
          <p className="nook-diary">
            <strong style={{ color: "rgba(255,255,255,.9)" }}>Сегодня в дневнике:</strong>
            <br />
            {dragonDiary}
            <br />
            <span style={{ opacity: .5 }}>— {prettyMinskDate}</span>
          </p>
          <p className="nook-reaction">{nookMessage}</p>
        </section>

        {/* ИНТЕРАКТИВНЫЕ НАХОДКИ */}
        <section className="room-discovery-zone">
          <article className="room-discovery" onClick={openDrawer}>
            <p className="discovery-kicker">стол • ящик №1</p>
            <h3 className="discovery-title">Ящик стола</h3>

            <div className={`drawer-visual ${drawerOpen ? "open" : ""}`}>
              <div className="drawer-cabinet" />
              <div className="drawer-front" />
              <div className="drawer-find-pop">💌</div>
            </div>

            <p className={`discovery-text ${drawerOpen ? "drawer-open" : ""}`}>
              {drawerOpen
                ? drawerFind
                : "Внутри что-то лежит. Каждый раз может попасться другое."}
            </p>

            <button className="discovery-button" type="button">
              {drawerOpen ? "задвинуть ящик" : "выдвинуть ящик"}
            </button>
          </article>

          <article className="room-discovery" onClick={touchMysteryBox}>
            <p className="discovery-kicker">под столом • подозрительно</p>
            <h3 className="discovery-title">Коробка «не трогать»</h3>

            <div className={`mystery-box-visual ${mysteryBoxOpen ? "open" : ""}`}>
              <div className="box-body" />
              <div className="box-lid" />
              <div className="box-surprise">
                {mysteryBoxCount >= 5 ? "💗" : mysteryBoxCount === 4 ? "🐉" : "✨"}
              </div>
            </div>

            <p className="discovery-text">{mysteryBoxText}</p>
            <button className="discovery-button" type="button">
              всё равно потрогать
            </button>
          </article>

          <article className="room-discovery">
            <p className="discovery-kicker">аппарат • один билетик</p>
            <h3 className="discovery-title">Билетик на сегодня</h3>

            <div className={`ticket-machine ${ticketPulling ? "pulling" : ""}`}>
              <div className="machine-body" />
              <div className="machine-slot" />
              <div className="machine-lever" />
            </div>

            <p className="discovery-text">
              Потяни рычаг — аппарат решит, что тебе сегодня официально положено.
            </p>

            <button
              className="discovery-button"
              type="button"
              onClick={pullTicket}
              disabled={ticketPulling}
            >
              {ticketPulling ? "аппарат думает..." : "дёрнуть рычаг"}
            </button>

            {ticketText !== "дёрни рычаг" && (
              <div className="ticket-paper ticket-out">
                {ticketText}
              </div>
            )}
          </article>

          <article className="room-discovery" onClick={openStash}>
            <p className="discovery-kicker">за уголком Дракоши • секретно</p>
            <h3 className="discovery-title">Тайник Дракоши</h3>

            <div className={`stash-visual ${stashOpen ? "open" : ""}`}>
              <div className="stash-hole" />
              <div className="stash-hatch" />
              <div className="stash-treasure">🐉✨</div>
            </div>

            <p className="discovery-text">
              {stashOpen
                ? stashText
                : "Он утверждает, что никакого тайника здесь нет. Очень убедительно."}
            </p>

            <button className="discovery-button" type="button">
              {stashOpen ? "закрыть тайник" : "открыть тайник"}
            </button>
          </article>
        </section>

        {/* ДВЕРЬ КОМНАТЫ */}
        <section className="room-door-zone">
          <div className="door-frame">
            <div className="door-behind">{doorOpen ? "❤️" : "✦"}</div>
            <div
              className={`room-door ${doorOpen ? "open" : ""}`}
              onClick={touchDoor}
            >
              <div className="door-sign">КОМНАТА КЭССИЧКИ</div>
            </div>
          </div>
          <p className="door-message">{doorText}</p>
        </section>

        {/* НОЧНИК */}
        <footer
          className={`room-lamp-zone ${lampOn ? "lamp-on" : ""}`}
          onClick={() => setLampOn((current) => !current)}
        >
          <div className="lamp-glow" />
          <span className="room-lamp">{lampOn ? "💡" : "🌑"}</span>
          <p className="room-goodbye">
            Возвращайся сюда иногда. Здесь тебя всегда ждут.
          </p>
          <p className="room-goodbye-small">
            {lampOn ? "теперь тут немного теплее ✨" : "береги себя, бус ❤️"}
          </p>
          <p className="lamp-hint">тыкни на ночник</p>
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
