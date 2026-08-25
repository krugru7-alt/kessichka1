"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WeatherMini from "./components/WeatherMini";
import {
  getCurrentScheduleItem,
  getCurrentDay,
  dayNames,
} from "./schedule";

const messages = [
  "Просто напоминаю: ты очень важная буська. ❤️",
  "Сегодня не обязательно успеть всё. Правда.",
  "Если день вредничает — вредничай в ответ совсем чуть-чуть.",
  "Пусть сегодня найдётся хотя бы один момент, который тебя порадует.",
  "Где-то далеко один Обсидик очень хочет, чтобы у тебя всё было хорошо.",
  "Поесть, попить воды и иногда отдыхать — официальный план.",
  "Тьмок без причины 💋",
];

function getMinskHour(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date)
  );
}

function getGreeting(hour) {
  if (hour >= 6 && hour < 12) return ["Доброе утро, бус ❤️", "🌅"];
  if (hour >= 12 && hour < 18) return ["Хорошего дня, бус ❤️", "☀️"];
  if (hour >= 18 && hour < 22) return ["Добрый вечер, бус ❤️", "🌆"];
  return ["Спокойной ночи, бус ❤️", "🌙"];
}

export default function HomePage() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const hour = getMinskHour(now);
  const [greeting, icon] = getGreeting(hour);

  const minskTime = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Minsk",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);

  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const message = useMemo(() => {
    const seed = Number(dateKey.replace(/\D/g, "")) || 1;
    return messages[seed % messages.length];
  }, [dateKey]);

  let schedule = null;
  let day = null;

  try {
    schedule = getCurrentScheduleItem();
    day = getCurrentDay();
  } catch {}

  return (
    <div className="page home-page">
      <section className="hero-card">
        <div className="hero-topline">
          <span className="hero-time">Минск · {minskTime}</span>
          <span className="hero-weather-dot">online</span>
        </div>

        <div className="hero-icon">{icon}</div>
        <p className="eyebrow">твой маленький уголок</p>
        <h1>{greeting}</h1>
        <p className="hero-text">{message}</p>
      </section>

      <WeatherMini />

      {schedule && (
        <section className="next-note">
          <div>
            <small>Следующий привет</small>
            <b>
              {dayNames?.[day] || ""} · {schedule.time}
            </b>
          </div>
          <span>{schedule.title}</span>
        </section>
      )}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <small>выбирай</small>
            <h2>Куда заглянем?</h2>
          </div>
          <span>↘</span>
        </div>

        <div className="portal-grid">
          <Link className="portal-card dragon-card" href="/dragon">
            <span className="portal-icon">🐉</span>
            <div>
              <small>кто-то опять что-то делает</small>
              <b>Дракоша</b>
              <p>Домик, дневник и очень важные драконьи дела.</p>
            </div>
            <i>→</i>
          </Link>

          <Link className="portal-card room-card" href="/room">
            <span className="portal-icon">⌑</span>
            <div>
              <small>можно просто побыть</small>
              <b>Мой уголок</b>
              <p>Лампа, записки, вещи и несколько странностей.</p>
            </div>
            <i>→</i>
          </Link>

          <Link className="portal-card love-card" href="/for-you">
            <span className="portal-icon">♥</span>
            <div>
              <small>оставлено специально</small>
              <b>Для тебя</b>
              <p>Конверты, маленькие послания и уведомления.</p>
            </div>
            <i>→</i>
          </Link>
        </div>
      </section>

      <p className="home-signature">Обсидик был здесь ❤️</p>
    </div>
  );
}

================================================================================
ФАЙЛ: 04_SiteShell.txt
================================================================================

"use client";

import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import DrakoshaBuddy from "./DrakoshaBuddy";

export default function SiteShell({ children }) {
  const [lightOn, setLightOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kessi-light") === "1";
    setLightOn(saved);
    setReady(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  function toggleLight() {
    setLightOn((current) => {
      const next = !current;
      localStorage.setItem("kessi-light", next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className={`site-shell ${lightOn ? "light-on" : ""} ${ready ? "ready" : ""}`}>
      <div className="site-ambient" aria-hidden="true" />
      <div className="site-light-wash" aria-hidden="true" />

      <header className="topbar">
        <a className="topbar-brand" href="/">
          <span className="brand-heart">♥</span>
          <span>
            <b>Для Кэссички</b>
            <small>маленький уголок в интернете</small>
          </span>
        </a>

        <button
          className={`global-light ${lightOn ? "on" : ""}`}
          type="button"
          onClick={toggleLight}
          aria-pressed={lightOn}
          title={lightOn ? "Выключить свет" : "Включить свет"}
        >
          <span>{lightOn ? "💡" : "🌙"}</span>
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

================================================================================
ФАЙЛ: 05_BottomNav.txt
================================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "⌂", label: "Главная" },
  { href: "/dragon", icon: "🐉", label: "Дракоша" },
  { href: "/room", icon: "⌑", label: "Уголок" },
  { href: "/for-you", icon: "♥", label: "Для тебя" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Главное меню">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${active ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

================================================================================
ФАЙЛ: 06_DrakoshaBuddy.txt
================================================================================

"use client";

import { useEffect, useState } from "react";

const phrases = [
  "Сижу. Наблюдаю. 👀",
  "Проверка связи: тьмок работает? 💋",
  "Я вообще-то охраняю сайт.",
  "Обсидик просил за тобой присматривать 🐉",
  "Пора хотя бы чуть-чуть отдохнуть.",
  "Ушёл искать вкусняшку. Не нашёл.",
];

export default function DrakoshaBuddy() {
  const [bubble, setBubble] = useState("");
  const [side, setSide] = useState("right");
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    let waitTimer;
    let walkTimer;

    const schedule = () => {
      waitTimer = setTimeout(() => {
        setWalking(true);
        setSide((current) => (current === "right" ? "left" : "right"));

        walkTimer = setTimeout(() => {
          setWalking(false);
          schedule();
        }, 2600);
      }, 18000 + Math.random() * 18000);
    };

    schedule();

    return () => {
      clearTimeout(waitTimer);
      clearTimeout(walkTimer);
    };
  }, []);

  function talk() {
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setBubble(phrase);
    setTimeout(() => setBubble(""), 2800);
  }

  return (
    <div className={`buddy buddy-${side} ${walking ? "walking" : ""}`}>
      {bubble && <div className="buddy-bubble">{bubble}</div>}
      <button className="buddy-button" type="button" onClick={talk}>
        <img src="/drakosha.png" alt="Дракоша" />
      </button>
    </div>
  );
}

================================================================================
ФАЙЛ: 07_WeatherMini.txt
================================================================================

"use client";

import { useEffect, useState } from "react";

function weatherText(code) {
  if (code === 0) return "Ясно";
  if ([1, 2, 3].includes(code)) return "Облачно";
  if ([45, 48].includes(code)) return "Туман";
  if ([51, 53, 55, 56, 57].includes(code)) return "Морось";
  if ([61, 63, 65, 66, 67].includes(code)) return "Дождь";
  if ([71, 73, 75, 77].includes(code)) return "Снег";
  if ([80, 81, 82].includes(code)) return "Ливень";
  if ([85, 86].includes(code)) return "Снегопад";
  if ([95, 96, 99].includes(code)) return "Гроза";
  return "Погода";
}

function weatherEmoji(code) {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "🌤️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌥️";
}

function advice(weather) {
  if (weather.temperature < 0) return "Оденься потеплее 🧣";
  if (weather.temperature < 10) return "На улице прохладно 🧥";
  if (weather.rainChance >= 50) return "Зонтик может пригодиться ☔";
  if (weather.temperature >= 25) return "Сегодня тепло ☀️";
  return "Береги себя и хорошего дня 🌷";
}

export default function WeatherMini() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch("/api/weather")
      .then((response) => response.json())
      .then(setWeather)
      .catch(() => setWeather({ error: true }));
  }, []);

  if (!weather) {
    return (
      <div className="weather-mini loading-card">
        <span className="big-emoji">🌥️</span>
        <div>
          <small>Минск</small>
          <b>Смотрю погоду…</b>
        </div>
      </div>
    );
  }

  if (weather.error) {
    return (
      <div className="weather-mini">
        <span className="big-emoji">🌥️</span>
        <div>
          <small>Минск</small>
          <b>Погода спряталась</b>
          <p>Но ты всё равно по погоде там, ладно?</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-mini">
      <span className="big-emoji">{weatherEmoji(weather.weatherCode)}</span>

      <div className="weather-mini-copy">
        <small>Минск • сейчас</small>
        <b>
          {Math.round(weather.temperature)}° · {weatherText(weather.weatherCode)}
        </b>
        <p>
          Ощущается как {Math.round(weather.feelsLike)}° · дождь {weather.rainChance}%
        </p>
        <em>{advice(weather)}</em>
      </div>
    </div>
  );
}

================================================================================
ФАЙЛ: 08_PushButton.txt
================================================================================

"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function PushButton() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        if (!("serviceWorker" in navigator)) return;
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager?.getSubscription();
        setEnabled(Boolean(subscription));
      } catch {}
    }

    check();
  }, []);

  async function enable() {
    try {
      setLoading(true);

      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        alert("На этом устройстве Push-уведомления недоступны.");
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Разрешение на уведомления не получено.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!publicKey) {
          throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY не найден.");
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Не удалось сохранить Push-подписку.");
      }

      setEnabled(true);
      alert("Уведомления подключены ❤️");
    } catch (error) {
      alert("ОШИБКА PUSH:\n\n" + String(error?.message || error));
    } finally {
      setLoading(false);
    }
  }

  if (enabled) {
    return (
      <div className="push-status">
        <span>🔔</span>
        <div>
          <b>Приветы подключены</b>
          <small>Сайт сможет присылать маленькие напоминания ❤️</small>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="primary-button"
      onClick={enable}
      disabled={loading}
    >
      {loading ? "Подключаю…" : "🔔 Подключить приветы от Обсидика"}
    </button>
  );
}

================================================================================
ФАЙЛ: 09_room_page.txt
================================================================================

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const notes = [
  "Здесь можно ничего не делать. Это буквально разрешено.",
  "Если день шумный — пусть хотя бы этот уголок будет тихим.",
  "Поесть, выдохнуть, не требовать от себя невозможного. План.",
  "Тьмок оставлен на столе. Не потеряй 💋",
  "Сегодня разрешается быть сонной буськой.",
  "Зайти сюда на минуту — уже считается.",
];

const garlands = [
  ["береги", "себя", "бус", "♥"],
  ["поешь", "отдохни", "улыбнись", "♥"],
  ["не", "спеши", "никуда", "✨"],
];

export default function RoomPage() {
  const [lamp, setLamp] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [garland, setGarland] = useState(0);
  const [objectClicks, setObjectClicks] = useState(0);

  const note = useMemo(() => {
    const key = Number(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Minsk",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(new Date())
        .replace(/\D/g, "")
    );

    return notes[key % notes.length];
  }, []);

  function touchObject() {
    setObjectClicks((current) => current + 1);
  }

  return (
    <div className={`page room-page ${lamp ? "room-lamp-on" : ""}`}>
      <section className="page-intro">
        <p className="eyebrow">можно просто побыть</p>
        <h1>Мой уголок</h1>
        <p>Не лента и не набор кнопок. Просто маленькое место с вещами.</p>
      </section>

      <section className="room-scene">
        <div className="room-light" />

        <button
          className={`room-garland ${garland ? "changed" : ""}`}
          type="button"
          onClick={() => setGarland((current) => (current + 1) % garlands.length)}
        >
          <span className="garland-line" />
          {garlands[garland].map((word, index) => (
            <i key={`${word}-${index}`} style={{ "--i": index }}>
              {word}
            </i>
          ))}
        </button>

        <div className="room-wall-copy">
          <small>THIS PLACE BELONGS TO</small>
          <b>одной буське</b>
        </div>

        <button
          className={`real-lamp ${lamp ? "on" : ""}`}
          type="button"
          onClick={() => setLamp((current) => !current)}
          aria-pressed={lamp}
        >
          <span className="lamp-aura" />
          <span className="lamp-shade" />
          <span className="lamp-neck" />
          <span className="lamp-base" />
          <em>{lamp ? "выключить" : "включить свет"}</em>
        </button>

        <div className="room-desk-v2">
          <span className="desk-board" />

          <button
            className={`paper-note ${noteOpen ? "open" : ""}`}
            type="button"
            onClick={() => setNoteOpen((current) => !current)}
          >
            <span className="paper-clip">⌇</span>
            <small>{noteOpen ? "ОБРАТНАЯ СТОРОНА" : "ЗАПИСКА"}</small>
            <p>
              {noteOpen
                ? "P.S. если ты это нашла — дополнительный тьмок уже начислен 💋"
                : note}
            </p>
            <i>{noteOpen ? "перевернуть обратно" : "тыкни — она двусторонняя"}</i>
          </button>

          <button className="room-cup" type="button" onClick={touchObject}>
            ☕
            {objectClicks > 0 && <small>{objectClicks > 2 ? "опять пусто" : "пусто :("}</small>}
          </button>
        </div>

        <div className="polaroid-wall-v2">
          <div className="polaroid p-one">
            <div>🐉</div>
            <span>подозрительный житель</span>
          </div>

          <div className="polaroid p-two">
            <div>♥</div>
            <span>оставлено здесь</span>
          </div>

          <span className="tiny-wall-note">возвращайся иногда</span>
        </div>

        <div className="mystery-area">
          <p>На стене есть одна вещь, которой здесь вроде бы не должно быть.</p>
          <Link
            className="mystery-orb"
            href="/secret"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.setItem("kessi-secret-seen", "1");
              }
            }}
          >
            <span />
            <i>?</i>
          </Link>
          <small>не трогать</small>
        </div>
      </section>
    </div>
  );
}

================================================================================
ФАЙЛ: 10_dragon_page.txt
================================================================================

"use client";

import { useMemo, useState } from "react";

const diaries = [
  "Сегодня охранял сайт. Один раз уснул на посту. Никому не говори.",
  "Нашёл подозрительный носок. Расследование продолжается.",
  "Пытался управлять погодой в Минске. Пока умею только смотреть уверенно.",
  "Проверил запасы тьмоков. Запасы вызывают вопросы.",
  "Съел воображаемую печеньку. Вкусно. Доказательств нет.",
  "Ничего не сломал. Прошу считать это личным достижением.",
];

const reactions = {
  pet: [
    "Мрр… то есть ррр 🐉",
    "Ещё раз можно.",
    "Ладно, это было приятно.",
  ],
  snack: [
    "ХРУМ.",
    "Это было мне? Уже поздно, я съел.",
    "Спасибо. Теперь я официально добрее на 4%.",
  ],
  ask: [
    "Совет дня: не требуй от себя невозможного.",
    "Я бы поспал. Но ты решай сама.",
    "Обсидик сказал, что ты буська. Я проверил — похоже на правду.",
    "Пей воду. Да, я теперь ещё и врач-дракон.",
  ],
};

function getDragonStatus() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );

  if (hour < 7) return ["спит. очень серьёзно.", "😴"];
  if (hour < 11) return ["только проснулся и недоволен", "🥱"];
  if (hour < 18) return ["занят очень важными делами", "🧐"];
  if (hour < 23) return ["дома. делает вид, что работал", "🐉"];
  return ["готовится спать. не шуметь.", "🌙"];
}

export default function DragonPage() {
  const [message, setMessage] = useState("Тыкни что-нибудь. Я всё вижу.");
  const [taps, setTaps] = useState(0);

  const [status, mood] = getDragonStatus();

  const diary = useMemo(() => {
    const key = Number(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Minsk",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(new Date())
        .replace(/\D/g, "")
    );
    return diaries[key % diaries.length];
  }, []);

  function react(type) {
    const list = reactions[type];
    setMessage(list[Math.floor(Math.random() * list.length)]);

    if (type === "pet") {
      setTaps((current) => current + 1);
    }
  }

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">отдельная важная персона</p>
        <h1>Дракоша</h1>
        <p>У него теперь своя страница. Он этого не заслужил, но уже поздно.</p>
      </section>

      <section className="dragon-stage">
        <div className="dragon-status">
          <small>сейчас</small>
          <b>{status}</b>
          <span>{mood}</span>
        </div>

        <button
          className="dragon-main"
          type="button"
          onClick={() => react("pet")}
          aria-label="Погладить Дракошу"
        >
          <div className="dragon-halo" />
          <img src="/drakosha.png" alt="Дракоша" />
        </button>

        <div className="dragon-speech">{message}</div>

        <div className="dragon-actions">
          <button type="button" onClick={() => react("pet")}>
            <span>🤏</span>
            Погладить
          </button>
          <button type="button" onClick={() => react("snack")}>
            <span>🍪</span>
            Вкусняшка
          </button>
          <button type="button" onClick={() => react("ask")}>
            <span>💭</span>
            Спросить
          </button>
        </div>
      </section>

      <section className="diary-card">
        <div className="diary-tape" />
        <small>ДНЕВНИК ДРАКОШИ · СЕГОДНЯ</small>
        <p>{diary}</p>
        <span>— Д.</span>
      </section>

      {taps >= 7 && (
        <div className="secret-toast">
          🐾 Достижение: «загладить дракона до состояния кота»
        </div>
      )}
    </div>
  );
}

================================================================================
ФАЙЛ: 11_for_you_page.txt
================================================================================

"use client";

import { useState } from "react";
import PushButton from "../components/PushButton";
import {
  getCurrentScheduleItem,
  getCurrentDay,
  dayNames,
} from "../schedule";

const envelopes = [
  {
    id: "hard",
    icon: "☁️",
    title: "На сложный день",
    text: "Не обязательно сегодня быть сильной, продуктивной и вообще всё успевать. Просто береги себя. Я рядом настолько, насколько сейчас могу быть. ❤️",
  },
  {
    id: "bored",
    icon: "🫠",
    title: "Когда скучно",
    text: "Официальное разрешение пять минут заниматься какой-нибудь полной фигнёй. Потом можешь сказать, что это была психологическая разгрузка.",
  },
  {
    id: "random",
    icon: "💌",
    title: "Просто так",
    text: "Никакого повода. Просто тьмок. Всё. 💋",
  },
  {
    id: "miss",
    icon: "🌙",
    title: "Когда скучаешь",
    text: "Расстояние иногда бесит. Но наличие расстояния вообще не отменяет того, насколько ты мне важна. ❤️",
  },
];

export default function ForYouPage() {
  const [open, setOpen] = useState(null);

  let schedule = null;
  let day = null;

  try {
    schedule = getCurrentScheduleItem();
    day = getCurrentDay();
  } catch {}

  return (
    <div className="page">
      <section className="page-intro">
        <p className="eyebrow">оставлено специально</p>
        <h1>Для тебя</h1>
        <p>Не нужно читать всё. Открой то, что подходит именно сейчас.</p>
      </section>

      <section className="envelope-grid">
        {envelopes.map((envelope) => (
          <button
            key={envelope.id}
            type="button"
            className={`envelope ${open === envelope.id ? "open" : ""}`}
            onClick={() =>
              setOpen((current) => (current === envelope.id ? null : envelope.id))
            }
          >
            <span className="envelope-icon">{envelope.icon}</span>
            <div>
              <small>ОТКРЫТЬ</small>
              <b>{envelope.title}</b>
            </div>
            <i>{open === envelope.id ? "×" : "＋"}</i>

            {open === envelope.id && (
              <p className="envelope-letter">{envelope.text}</p>
            )}
          </button>
        ))}
      </section>

      {schedule && (
        <section className="schedule-card-v2">
          <div className="schedule-clock">⏰</div>
          <div>
            <small>БЛИЖАЙШИЙ ПРИВЕТ</small>
            <h2>
              {dayNames?.[day] || ""} · {schedule.time}
            </h2>
            <b>{schedule.title}</b>
            <p>{schedule.text}</p>
          </div>
        </section>
      )}

      <section className="push-card-v2">
        <div>
          <small>НЕ НУЖНО ДЕРЖАТЬ САЙТ ОТКРЫТЫМ</small>
          <h2>Маленькие приветы могут приходить сами</h2>
          <p>
            Если разрешить уведомления, сайт сможет присылать те самые сообщения
            по расписанию.
          </p>
        </div>
        <PushButton />
      </section>
    </div>
  );
}

================================================================================
ФАЙЛ: 12_secret_page.txt
================================================================================

"use client";

import { useEffect, useRef, useState } from "react";

export default function SecretPage() {
  const [started, setStarted] = useState(false);
  const [permission, setPermission] = useState("idle");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [energy, setEnergy] = useState(0);
  const [message, setMessage] = useState("статус: спит");
  const [opened, setOpened] = useState(false);
  const lastMotion = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!started) return;

    function orientation(event) {
      const x = Math.max(-26, Math.min(26, event.gamma || 0));
      const y = Math.max(-22, Math.min(22, event.beta || 0));
      setTilt({ x, y });

      if (Math.abs(x) + Math.abs(y) > 25) {
        setEnergy((current) => Math.min(100, current + 1));
      }
    }

    function motion(event) {
      const a = event.accelerationIncludingGravity;
      if (!a) return;

      const delta =
        Math.abs((a.x || 0) - lastMotion.current.x) +
        Math.abs((a.y || 0) - lastMotion.current.y) +
        Math.abs((a.z || 0) - lastMotion.current.z);

      lastMotion.current = {
        x: a.x || 0,
        y: a.y || 0,
        z: a.z || 0,
      };

      if (delta > 18) {
        setMessage("эй. полегче 👀");
        setEnergy((current) => Math.min(100, current + 14));
      }
    }

    window.addEventListener("deviceorientation", orientation);
    window.addEventListener("devicemotion", motion);

    return () => {
      window.removeEventListener("deviceorientation", orientation);
      window.removeEventListener("devicemotion", motion);
    };
  }, [started]);

  useEffect(() => {
    if (energy >= 100 && !opened) {
      setOpened(true);
      setMessage("объект проснулся");
      localStorage.setItem("kessi-anomaly-open", "1");
    }
  }, [energy, opened]);

  async function start() {
    try {
      setPermission("asking");

      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const result = await DeviceOrientationEvent.requestPermission();

        if (result !== "granted") {
          setPermission("denied");
          return;
        }
      }

      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        try {
          await DeviceMotionEvent.requestPermission();
        } catch {}
      }

      setPermission("granted");
      setStarted(true);
      setMessage("статус: наблюдает");
    } catch {
      setPermission("denied");
    }
  }

  function pointerMove(event) {
    if (started) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 36;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 28;
    setTilt({ x, y });
  }

  function holdStart() {
    if (!started) return;
    setMessage("не отпускай…");
    setEnergy((current) => Math.min(100, current + 8));
  }

  return (
    <div className="page anomaly-page">
      <section className="anomaly-head">
        <small>НЕИЗВЕСТНЫЙ ОБЪЕКТ · 01</small>
        <h1>???</h1>
        <p>{message}</p>
      </section>

      <section
        className={`artifact-zone ${opened ? "open" : ""}`}
        onPointerMove={pointerMove}
      >
        <div
          className="artifact"
          style={{
            transform: `translate3d(${tilt.x}px, ${tilt.y * 0.45}px, 0) rotateX(${-tilt.y * 0.35}deg) rotateY(${tilt.x * 0.45}deg)`,
          }}
          onPointerDown={holdStart}
        >
          <span className="artifact-ring ring-1" />
          <span className="artifact-ring ring-2" />
          <span className="artifact-core" />
          <span className="artifact-noise" />
        </div>

        <div className="energy-bar">
          <span style={{ width: `${energy}%` }} />
        </div>

        <small className="artifact-hint">
          {started
            ? "он реагирует на твой телефон"
            : "на компьютере он следует за курсором"}
        </small>
      </section>

      {!started && !opened && (
        <button className="artifact-start" type="button" onClick={start}>
          Разбудить объект
        </button>
      )}

      {permission === "denied" && (
        <p className="permission-note">
          Доступ к датчикам не получен. Ничего страшного — объект всё равно
          реагирует на палец/курсор.
        </p>
      )}

      {opened && (
        <section className="artifact-message">
          <small>СЛОЙ 01 ОТКРЫТ</small>
          <h2>Ты реально решила узнать, что здесь?</h2>
          <p>
            Хорошо. Значит, в следующий раз здесь появится кое-что ещё.
          </p>
          <span>♥</span>
        </section>
      )}
    </div>
  );
}
