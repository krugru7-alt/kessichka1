"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCurrentScheduleItem,
  getCurrentDay,
  dayNames,
} from "../schedule";

const DAILY_THINGS = [
  {
    type: "note",
    mark: "01",
    eyebrow: "оставлено сегодня",
    title: "Ничего срочного.",
    text: "Просто маленькое место в интернете, где от тебя сейчас ничего не требуется.",
    after: "можно закрыть и вернуться потом",
  },
  {
    type: "tiny",
    mark: "02",
    eyebrow: "маленькая штука",
    title: "Тьмок без причины.",
    text: "Причины действительно нет. Так даже лучше.",
    after: "всё, это было всё сообщение",
  },
  {
    type: "pause",
    mark: "03",
    eyebrow: "на пару секунд",
    title: "Не листай.",
    text: "Побудь здесь буквально пять секунд. Сайт никуда не денется.",
    after: "ладно, теперь можно",
  },
  {
    type: "found",
    mark: "04",
    eyebrow: "нашлось",
    title: "Сегодняшняя хорошая мелочь.",
    text: "Она может быть совсем маленькой. Это всё равно считается.",
    after: "если найдёшь — мысленно оставь её здесь",
  },
  {
    type: "secret",
    mark: "05",
    eyebrow: "это вообще-то секрет",
    title: "Я рад, что ты сюда зашла.",
    text: "Даже если всего на несколько секунд.",
    after: "никому не говори, что сайт умеет такое",
  },
  {
    type: "soft",
    mark: "06",
    eyebrow: "без повода",
    title: "Пусть день будет к тебе помягче.",
    text: "Хотя бы в одном месте сегодня.",
    after: "этого достаточно",
  },
  {
    type: "return",
    mark: "07",
    eyebrow: "на случай возвращения",
    title: "О. Снова ты.",
    text: "Хорошо. Значит, это место здесь не зря.",
    after: "можешь ещё немного остаться",
  },
];

const SECONDARY_NOTES = [
  "здесь есть вещи, которые появляются не сразу",
  "не всё на этой странице выглядит как кнопка",
  "некоторые штуки лучше находить случайно",
  "иногда сайт запоминает, что ты уже была здесь",
  "кажется, где-то осталось ещё кое-что",
];

function getMinskParts(date = new Date()) {
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date)
  );

  return {
    dateKey,
    hour,
  };
}

function stringSeed(value) {
  return [...value].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );
}

export default function ForYouPage() {
  const idleTimerRef = useRef(null);
  const reactionTimerRef = useRef(null);
  const secretTimerRef = useRef(null);
  const longHoldTimerRef = useRef(null);

  const [{ dateKey, hour }] = useState(() =>
    getMinskParts()
  );

  const [ready, setReady] = useState(false);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);

  const [visits, setVisits] = useState(1);
  const [discoveries, setDiscoveries] = useState([]);
  const [reaction, setReaction] = useState("");

  const [edgeSecret, setEdgeSecret] = useState(false);
  const [idleSecret, setIdleSecret] = useState(false);
  const [nightSecret, setNightSecret] = useState(false);
  const [tinyVisitor, setTinyVisitor] = useState(false);

  const [capsuleTapCount, setCapsuleTapCount] =
    useState(0);

  const dailyThing = useMemo(() => {
    const seed = stringSeed(dateKey);

    return DAILY_THINGS[
      seed % DAILY_THINGS.length
    ];
  }, [dateKey]);

  const secondaryNote = useMemo(() => {
    const seed = stringSeed(
      dateKey + "secondary"
    );

    return SECONDARY_NOTES[
      seed % SECONDARY_NOTES.length
    ];
  }, [dateKey]);

  const isNight =
    hour >= 23 || hour < 5;

  useEffect(() => {
    let currentVisits = 1;
    let currentDiscoveries = [];

    try {
      const savedVisits =
        Number(
          localStorage.getItem(
            "kessi-for-you-visits"
          )
        ) || 0;

      currentVisits =
        savedVisits + 1;

      localStorage.setItem(
        "kessi-for-you-visits",
        String(currentVisits)
      );

      const savedDiscoveries =
        JSON.parse(
          localStorage.getItem(
            "kessi-for-you-discoveries"
          ) || "[]"
        );

      if (
        Array.isArray(savedDiscoveries)
      ) {
        currentDiscoveries =
          savedDiscoveries;
      }

      const openedToday =
        localStorage.getItem(
          `kessi-for-you-opened-${dateKey}`
        ) === "1";

      setOpened(openedToday);
    } catch {}

    setVisits(currentVisits);
    setDiscoveries(
      currentDiscoveries
    );
    setReady(true);

    if (
      isNight &&
      currentVisits >= 2 &&
      !currentDiscoveries.includes(
        "night"
      )
    ) {
      secretTimerRef.current =
        window.setTimeout(() => {
          setNightSecret(true);
        }, 6000);
    }

    idleTimerRef.current =
      window.setTimeout(() => {
        if (currentVisits >= 2) {
          setIdleSecret(true);
        }
      }, 11000);

    return () => {
      window.clearTimeout(
        idleTimerRef.current
      );

      window.clearTimeout(
        reactionTimerRef.current
      );

      window.clearTimeout(
        secretTimerRef.current
      );

      window.clearTimeout(
        longHoldTimerRef.current
      );
    };
  }, [dateKey, isNight]);

  function showReaction(
    text,
    ms = 2500
  ) {
    setReaction(text);

    window.clearTimeout(
      reactionTimerRef.current
    );

    reactionTimerRef.current =
      window.setTimeout(() => {
        setReaction("");
      }, ms);
  }

  function unlockDiscovery(id) {
    setDiscoveries((current) => {
      if (current.includes(id)) {
        return current;
      }

      const next = [
        ...current,
        id,
      ];

      try {
        localStorage.setItem(
          "kessi-for-you-discoveries",
          JSON.stringify(next)
        );
      } catch {}

      return next;
    });
  }

  function openCapsule() {
    if (opening) return;

    if (opened) {
      const nextCount =
        capsuleTapCount + 1;

      setCapsuleTapCount(
        nextCount
      );

      if (nextCount === 3) {
        showReaction(
          "она уже открыта :)"
        );
      }

      if (nextCount === 6) {
        unlockDiscovery(
          "persistent"
        );

        showReaction(
          "ладно. за настойчивость — ✦",
          3000
        );
      }

      return;
    }

    setOpening(true);

    window.setTimeout(() => {
      setOpened(true);
      setOpening(false);

      try {
        localStorage.setItem(
          `kessi-for-you-opened-${dateKey}`,
          "1"
        );
      } catch {}

      unlockDiscovery(
        "daily"
      );

      showReaction(
        "нашлось кое-что на сегодня.",
        2300
      );

      window.setTimeout(() => {
        setEdgeSecret(true);
      }, 3200);
    }, 780);
  }

  function startCapsuleHold() {
    window.clearTimeout(
      longHoldTimerRef.current
    );

    longHoldTimerRef.current =
      window.setTimeout(() => {
        if (!opened) {
          showReaction(
            "не обязательно так серьёзно. просто нажми :)"
          );

          return;
        }

        unlockDiscovery("hold");

        setTinyVisitor(true);

        showReaction(
          "о. это место реагирует и на такое.",
          2800
        );

        window.setTimeout(() => {
          setTinyVisitor(false);
        }, 4200);
      }, 1700);
  }

  function stopCapsuleHold() {
    window.clearTimeout(
      longHoldTimerRef.current
    );
  }

  function openEdgeSecret() {
    setEdgeSecret(false);

    unlockDiscovery("edge");

    showReaction(
      secondaryNote,
      3400
    );
  }

  function openIdleSecret() {
    setIdleSecret(false);

    unlockDiscovery("idle");

    showReaction(
      visits >= 4
        ? "ты уже знаешь, что здесь лучше не спешить."
        : "о. ты всё-таки заметила.",
      3300
    );
  }

  function openNightSecret() {
    setNightSecret(false);

    unlockDiscovery("night");

    showReaction(
      "ночью здесь кое-что появляется само.",
      3600
    );
  }

  let schedule = null;
  let day = null;

  try {
    schedule =
      getCurrentScheduleItem();

    day =
      getCurrentDay();
  } catch {}

  if (!ready) {
    return (
      <main className="gift-page gift-loading">
        <span />
      </main>
    );
  }

  return (
    <main
      className={`gift-page ${
        opened
          ? "is-opened"
          : ""
      } ${
        isNight
          ? "is-night"
          : ""
      }`}
    >
      <section className="gift-world">

        <div
          className="gift-ambient"
          aria-hidden="true"
        >
          <span className="gift-glow glow-a" />

          <span className="gift-glow glow-b" />

          <span className="gift-grain" />
        </div>

        <header className="gift-header">

          <div>
            <small>
              ДЛЯ ТЕБЯ
            </small>

            <h1>
              {visits >= 4
                ? "О. Ты опять здесь."
                : "Я кое-что оставил."}
            </h1>
          </div>

          <span className="gift-counter">
            {String(
              discoveries.length
            ).padStart(
              2,
              "0"
            )}

            <i>/ ?</i>
          </span>

        </header>

        <p className="gift-intro">
          {opened
            ? "Сегодняшняя штука уже открыта. Но это не значит, что здесь больше ничего нет."
            : "Она меняется. Иногда совсем чуть-чуть."}
        </p>

        <section className="gift-stage">

          <button
            type="button"
            className={`gift-capsule ${
              opening
                ? "is-opening"
                : ""
            } ${
              opened
                ? "is-open"
                : ""
            }`}
            onClick={
              openCapsule
            }
            onPointerDown={
              startCapsuleHold
            }
            onPointerUp={
              stopCapsuleHold
            }
            onPointerCancel={
              stopCapsuleHold
            }
            onPointerLeave={
              stopCapsuleHold
            }
            aria-label={
              opened
                ? "Открытая капсула"
                : "Открыть"
            }
          >

            <span className="capsule-ring ring-one" />

            <span className="capsule-ring ring-two" />

            <span className="capsule-shell">

              <i className="capsule-shine" />

              <b>
                {opened
                  ? dailyThing.mark
                  : "?"}
              </b>

            </span>

            <span className="capsule-shadow" />

          </button>

          {!opened && (
            <span className="gift-hint">
              нажми
            </span>
          )}

          {opened && (
            <article className="daily-reveal">

              <small>
                {dailyThing.eyebrow}
              </small>

              <h2>
                {dailyThing.title}
              </h2>

              <p>
                {dailyThing.text}
              </p>

              <span>
                {dailyThing.after}
              </span>

            </article>
          )}

          {tinyVisitor && (
            <div
              className="gift-tiny-visitor"
              aria-hidden="true"
            >
              <span>
                ✦
              </span>

              <i />
            </div>
          )}

        </section>

        {opened && (
          <section className="gift-after">

            <div className="gift-after-line" />

            <small>
              возвращаться сюда можно
            </small>

          </section>
        )}

        {schedule && (
          <section className="gift-next">

            <div>
              <small>
                следующий привет
              </small>

              <b>
                {dayNames?.[day] || ""} ·{" "}
                {schedule.time}
              </b>
            </div>

            <span>
              {schedule.title}
            </span>

          </section>
        )}

        {edgeSecret && (
          <button
            type="button"
            className="gift-edge-secret"
            onClick={
              openEdgeSecret
            }
            aria-label="Скрытая записка"
          >
            <span />
          </button>
        )}

        {idleSecret && (
          <button
            type="button"
            className="gift-idle-secret"
            onClick={
              openIdleSecret
            }
            aria-label="Что-то появилось"
          >
            ·
          </button>
        )}

        {nightSecret && (
          <button
            type="button"
            className="gift-night-secret"
            onClick={
              openNightSecret
            }
            aria-label="Ночная штука"
          >
            <span>
              ☾
            </span>
          </button>
        )}

        {reaction && (
          <div className="gift-reaction">
            {reaction}
          </div>
        )}

        <footer className="gift-footer">

          <span>
            {opened
              ? "сегодня найдено"
              : "сегодня ещё закрыто"}
          </span>

          <b>
            {discoveries.length > 0
              ? `${discoveries.length} ${
                  discoveries.length === 1
                    ? "штука"
                    : "штук"
                }`
              : "ничего"}
          </b>

        </footer>

      </section>
    </main>
  );
}
