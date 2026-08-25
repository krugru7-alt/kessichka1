"use client";

import { useEffect, useMemo, useState } from "react";

const dailyNotes = [
  "Сегодня официально разрешается никуда не спешить.",
  "Если ты устала — значит, норка работает по назначению.",
  "Какао, плед и отсутствие лишних решений. Нормальный план.",
  "Здесь не надо быть продуктивной. Здесь надо быть буськой.",
  "Если случайно уснёшь — никто не удивится.",
  "Пять минут полежать всё ещё считаются пятью минутами. Наверное.",
  "Маленькое напоминание: иногда лучший план — завернуться в плед.",
];

const nestThings = [
  { id: "pillow", icon: "☁️", label: "подушка" },
  { id: "blanket", icon: "🧣", label: "плед" },
  { id: "cocoa", icon: "🍫", label: "какао" },
  { id: "socks", icon: "🧦", label: "носочки" },
  { id: "plush", icon: "🧸", label: "плюшка" },
];

const ferretLevels = [
  "человек",
  "сонная буська",
  "хорёк",
  "свернулась клубком",
  "недоступна",
];

export default function RoomPage() {
  const [nest, setNest] = useState([]);
  const [cocoa, setCocoa] = useState(0);
  const [wrapped, setWrapped] = useState(false);
  const [sleepMode, setSleepMode] = useState(false);
  const [sleepText, setSleepText] = useState("связь стабильна");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedNest = JSON.parse(localStorage.getItem("kessi-burrow-nest") || "[]");
      const savedCocoa = Number(localStorage.getItem("kessi-burrow-cocoa") || "0");

      setNest(Array.isArray(savedNest) ? savedNest : []);
      setCocoa(Math.max(0, Math.min(3, savedCocoa)));
      setWrapped(localStorage.getItem("kessi-burrow-wrapped") === "1");
    } catch {}

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("kessi-burrow-nest", JSON.stringify(nest));
    localStorage.setItem("kessi-burrow-cocoa", String(cocoa));
    localStorage.setItem("kessi-burrow-wrapped", wrapped ? "1" : "0");
  }, [nest, cocoa, wrapped, loaded]);

  const note = useMemo(() => {
    const key = Number(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Minsk",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()).replace(/\D/g, "")
    );

    return dailyNotes[key % dailyNotes.length];
  }, []);

  const ferretPoints =
    nest.length +
    (wrapped ? 1 : 0) +
    (cocoa > 0 ? 1 : 0) +
    (sleepMode ? 2 : 0);

  const levelIndex = Math.min(
    ferretLevels.length - 1,
    Math.floor(ferretPoints / 2)
  );

  const ferretLevel = ferretLevels[levelIndex];
  const ferretProgress = Math.min(100, ferretPoints * 12.5);

  function toggleNestItem(id) {
    setNest((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function pourCocoa() {
    setCocoa((current) => (current >= 3 ? 0 : current + 1));

    if (!nest.includes("cocoa")) {
      setNest((current) => [...current, "cocoa"]);
    }
  }

  function wrapUp() {
    setWrapped((current) => !current);

    if (!nest.includes("blanket")) {
      setNest((current) => [...current, "blanket"]);
    }
  }

  function fiveMinutes() {
    setSleepMode(true);
    setSleepText("«я просто полежу 5 минут»");

    window.setTimeout(() => {
      setSleepText("связь с Кэссичкой подозрительно тихая…");
    }, 3500);

    window.setTimeout(() => {
      setSleepText("режим хорька подтверждён 💤");
    }, 7000);
  }

  function wakeUp() {
    setSleepMode(false);
    setSleepText("связь восстановлена");
  }

  const cocoaLabel =
    cocoa === 0
      ? "какао закончилось"
      : cocoa === 1
      ? "немного какао"
      : cocoa === 2
      ? "нормально какао"
      : "идеально какао";

  return (
    <div className={`page burrow-page ${wrapped ? "is-wrapped" : ""} ${sleepMode ? "is-sleeping" : ""}`}>
      <section className="burrow-title">
        <p className="eyebrow">режим энергосбережения разрешён</p>
        <h1>Норка Кэссички</h1>
        <p>Место для какао, пледа и тех самых «я на пять минут».</p>
      </section>

      <section className="burrow-world">
        <div className="burrow-stars" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </div>

        <div className="burrow-status">
          <div>
            <small>СТАТУС НОРКИ</small>
            <b>{sleepText}</b>
          </div>
          <span className={sleepMode ? "sleep-dot asleep" : "sleep-dot"} />
        </div>

        <div className="ferret-zone">
          <div className="ferret-moon" />

          <div className="sleepy-ferret" aria-label="Сонный хорёк">
            <span className="ferret-body" />
            <span className="ferret-head">
              <i className="ferret-ear ear-left" />
              <i className="ferret-ear ear-right" />
              <i className="ferret-eye eye-left" />
              <i className="ferret-eye eye-right" />
              <i className="ferret-nose" />
            </span>
            <span className="ferret-tail" />
          </div>

          <div className="ferret-level">
            <small>УРОВЕНЬ ХОРЬКА</small>
            <b>{ferretLevel}</b>
            <div className="ferret-progress">
              <span style={{ width: `${ferretProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="burrow-bed">
          <div className="bed-headboard" />
          <div className="bed-pillow pillow-one" />
          <div className="bed-pillow pillow-two" />
          <div className="bed-blanket" />
          <div className="bed-shadow" />

          <div className="nest-result">
            {nest.length === 0 ? (
              <span>гнездо пока пустовато</span>
            ) : (
              nest.map((id) => {
                const thing = nestThings.find((item) => item.id === id);
                return <span key={id}>{thing?.icon}</span>;
              })
            )}
          </div>
        </div>

        <div className="cocoa-corner">
          <button
            className={`cocoa-mug cocoa-${cocoa}`}
            type="button"
            onClick={pourCocoa}
            aria-label="Налить какао"
          >
            <span className="steam steam-one" />
            <span className="steam steam-two" />
            <span className="mug-body">
              <i className="cocoa-surface" />
              <b>♥</b>
            </span>
            <span className="mug-handle" />
          </button>

          <div>
            <small>КАКАО</small>
            <b>{cocoaLabel}</b>
            <span>тыкни на кружку</span>
          </div>
        </div>

        <div className="nest-builder">
          <div className="nest-builder-title">
            <small>СОБРАТЬ ГНЕЗДО</small>
            <b>{nest.length}/5</b>
          </div>

          <div className="nest-items">
            {nestThings.map((thing) => {
              const active = nest.includes(thing.id);

              return (
                <button
                  key={thing.id}
                  type="button"
                  className={active ? "active" : ""}
                  onClick={() => toggleNestItem(thing.id)}
                >
                  <span>{thing.icon}</span>
                  <small>{thing.label}</small>
                </button>
              );
            })}
          </div>

          {nest.length === 5 && (
            <div className="nest-complete">
              Гнездо Кэссички собрано. Теперь можно официально отрубаться. 💤
            </div>
          )}
        </div>

        <div className="sleep-actions">
          <button
            className={wrapped ? "soft-action active" : "soft-action"}
            type="button"
            onClick={wrapUp}
          >
            <span>🫧</span>
            <div>
              <small>ПЛЕД</small>
              <b>{wrapped ? "уже укутана" : "укутаться"}</b>
            </div>
          </button>

          {!sleepMode ? (
            <button className="soft-action nap-action" type="button" onClick={fiveMinutes}>
              <span>💤</span>
              <div>
                <small>КЛАССИКА</small>
                <b>я щас на 5 минут</b>
              </div>
            </button>
          ) : (
            <button className="soft-action wake-action" type="button" onClick={wakeUp}>
              <span>👀</span>
              <div>
                <small>ЕСЛИ ВДРУГ</small>
                <b>я проснулась</b>
              </div>
            </button>
          )}
        </div>

        <div className="pillow-note">
          <span className="note-pin" />
          <small>записка возле подушки</small>
          <p>{note}</p>
        </div>

        <div className="burrow-footer-line">
          <span>тишина</span><i />
          <span>какао</span><i />
          <span>плед</span><i />
          <span>хорёк</span>
        </div>
      </section>
    </div>
  );
}
