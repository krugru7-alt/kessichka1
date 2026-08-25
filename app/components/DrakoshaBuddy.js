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

        setSide((current) =>
          current === "right" ? "left" : "right"
        );

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
    const phrase =
      phrases[
        Math.floor(Math.random() * phrases.length)
      ];

    setBubble(phrase);

    setTimeout(() => {
      setBubble("");
    }, 2800);
  }

  return (
    <div
      className={`buddy buddy-${side} ${
        walking ? "walking" : ""
      }`}
    >
      {bubble && (
        <div className="buddy-bubble">
          {bubble}
        </div>
      )}

      <button
        className="buddy-button"
        type="button"
        onClick={talk}
      >
        <img
          src="/drakosha.png"
          alt="Дракоша"
        />
      </button>
    </div>
  );
}
