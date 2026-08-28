"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import WeatherMini from "./components/WeatherMini";
import MiniMessages from "./components/MiniMessages";

const messages = [
  "Просто напоминаю: ты очень важная буська. ❤️",
  "Сегодня просто тьмок",
  "Если день вредничает - вредничай в ответ совсем чуть-чуть.",
  "Пусть сегодня найдётся хотя бы один момент, который тебя порадует.",
  "Где-то далеко один Обсидик очень хочет, чтобы у тебя всё было хорошо.",
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
  if (hour >= 6 && hour < 12) return ["Доброе утро, бус ❤️", "🌅", "morning"];
  if (hour >= 12 && hour < 18) return ["Хорошего дня, бус ❤️", "☀️", "day"];
  if (hour >= 18 && hour < 22) return ["Добрый вечер, бус ❤️", "🌆", "evening"];
  return ["Спокойной ночи, бус ❤️", "🌙", "night"];
}

export default function HomePage() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const hour = getMinskHour(now);
  const [greeting, icon, phase] = getGreeting(hour);

  const minskTime = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Minsk",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);

  const minskDate = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Minsk",
    weekday: "long",
    day: "numeric",
    month: "long",
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

  return (
    <div className={`world-v4-home world-v4-${phase}`}>
      <section className="world-v4-dashboard">
        <div className="world-v4-main-column">
          <section className="world-v4-hero">
            <div className="world-v4-hero-sky" aria-hidden="true">
              <span className="world-v4-mountain mountain-a" />
              <span className="world-v4-mountain mountain-b" />
              <span className="world-v4-tree-line" />
              <span className="world-v4-lake" />
              <span className="world-v4-camp-glow" />
              <span className="world-v4-tent" />
              <span className="world-v4-fire"><i /><b /><em /></span>
            </div>

            <div className="world-v4-hero-top">
              <span className="world-v4-live"><i /> online</span>
              <span>{minskTime} · {minskDate}</span>
            </div>

            <div className="world-v4-hero-copy">
              <div className="world-v4-greeting-icon">{icon}</div>
              <p className="eyebrow">маленький уголок</p>
              <h1>{greeting}</h1>
              <p>{message}</p>
            </div>

            <div className="world-v4-hero-links">
              <Link href="/home" className="world-v4-scene-link">
                <span>⌂</span>
                <div>
                  <small>можно просто побыть</small>
                  <b>Домой</b>
                </div>
                <i>→</i>
              </Link>

              <a href="#mini-screen" className="world-v4-scene-link">
                <span>✉</span>
                <div>
                  <small>послания друг другу</small>
                  <b>Мини-экранчик</b>
                </div>
                <i>↓</i>
              </a>
            </div>
          </section>

          <div className="world-v4-main-grid">
            <Link href="/home" className="world-v4-place-card world-v4-place-home">
              <span className="world-v4-place-icon">△</span>
              <div>
                <small>никуда не спешим</small>
                <h2>Домой</h2>
                <p>Завайбиться</p>
              </div>
              <i>→</i>
            </Link>

            <Link href="/chancery" className="world-v4-place-card world-v4-place-chancery">
              <span className="world-v4-place-icon">▤</span>
              <div>
                <small>отдел №01</small>
                <h2>Всё серьёзно</h2>
                <p>Договорчики, акты, заявления и прочие бумаги чрезвычайной важности.</p>
              </div>
              <i>→</i>
            </Link>
          </div>
        </div>

        <aside className="world-v4-side-column">
          <div className="world-v4-weather-wrap">
            <WeatherMini />
          </div>

          <section className="world-v4-note-card">
            <small>Маленькое сообщение для тебя</small>
            <p>{message}</p>
            <span>♡</span>
          </section>

          <section className="world-v4-quiet-card">
            <div>
              <small>Наш мирок</small>
              <b>всё важное уже здесь</b>
              <p>А остальное можно не торопить.</p>
            </div>
            <span>⌁</span>
          </section>
        </aside>
      </section>

      <section id="mini-screen" className="world-v4-messages-section">
        <div className="world-v4-section-title">
          <div>
            <small>мини-экранчик</small>
            <h2>Послания друг другу</h2>
          </div>
          <span>✉</span>
        </div>

        <MiniMessages />
      </section>

      <p className="home-signature world-v4-signature">Обсидик был здесь ❤️</p>
    </div>
  );
}
