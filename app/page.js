"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const HIDDEN_THINGS = [
  {
    id: "hello",
    x: 21,
    y: 28,
    type: "note",
    title: "ну привет",
    text: "раз уж нашла",
  },
  {
    id: "sleepy",
    x: 73,
    y: 35,
    type: "sleepy",
    title: "ᶻ 𝗓 𐰁",
    text: "он вообще-то спал",
  },
  {
    id: "star",
    x: 35,
    y: 61,
    type: "star",
    title: "✦",
    text: "маленькая штука. просто твоя.",
  },
  {
    id: "smile",
    x: 78,
    y: 70,
    type: "smile",
    title: ":)",
    text: "ага. тут тоже что-то есть.",
  },
  {
    id: "door",
    x: 52,
    y: 82,
    type: "door",
    title: "",
    text: "дверь",
  },
];

function distance(aX, aY, bX, bY) {
  return Math.hypot(aX - bX, aY - bY);
}

export default function TherePage() {
  const surfaceRef = useRef(null);
  const holdTimerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  const [pointer, setPointer] = useState({
    x: 50,
    y: 48,
    active: false,
  });

  const [found, setFound] = useState([]);
  const [nearId, setNearId] = useState(null);
  const [reaction, setReaction] = useState("");
  const [doorOpen, setDoorOpen] = useState(false);
  const [firstHint, setFirstHint] = useState(true);

  useEffect(() => {
    try {
      // Удаляем остатки старого раздела "Следы".
      localStorage.removeItem("kessi-traces-discoveries");
      localStorage.removeItem("kessi-traces-lights");

      // Загружаем только находки нового раздела "Там".
      const saved = JSON.parse(
        localStorage.getItem("kessi-there-found") || "[]"
      );

      if (Array.isArray(saved)) {
        setFound(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "kessi-there-found",
        JSON.stringify(found)
      );
    } catch {}
  }, [found]);

  useEffect(() => {
    return () => {
      window.clearTimeout(holdTimerRef.current);
      window.clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const foundCount = found.length;

  const hiddenById = useMemo(
    () =>
      Object.fromEntries(
        HIDDEN_THINGS.map((thing) => [thing.id, thing])
      ),
    []
  );

  function getPoint(event) {
    const rect = surfaceRef.current.getBoundingClientRect();

    return {
      x:
        ((event.clientX - rect.left) / rect.width) *
        100,
      y:
        ((event.clientY - rect.top) / rect.height) *
        100,
    };
  }

  function showReaction(text) {
    setReaction(text);

    window.clearTimeout(fadeTimerRef.current);

    fadeTimerRef.current = window.setTimeout(() => {
      setReaction("");
    }, 2200);
  }

  function unlock(id) {
    setFound((current) => {
      if (current.includes(id)) return current;
      return [...current, id];
    });

    const thing = hiddenById[id];

    if (!thing) return;

    if (id === "hello") {
      showReaction("нашлось");
    } else if (id === "sleepy") {
      showReaction("разбудила");
    } else if (id === "star") {
      showReaction("оставим здесь");
    } else if (id === "smile") {
      showReaction("да, это считается");
    } else if (id === "door") {
      showReaction("это уже интереснее");
    }
  }

  function findNearest(x, y) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (const thing of HIDDEN_THINGS) {
      if (found.includes(thing.id)) continue;

      const d = distance(x, y, thing.x, thing.y);

      if (d < nearestDistance) {
        nearest = thing;
        nearestDistance = d;
      }
    }

    return nearestDistance < 10 ? nearest : null;
  }

  function startHoldCheck(x, y) {
    window.clearTimeout(holdTimerRef.current);

    const nearest = findNearest(x, y);

    setNearId(nearest?.id || null);

    if (!nearest) return;

    holdTimerRef.current = window.setTimeout(() => {
      unlock(nearest.id);
    }, 850);
  }

  function movePointer(event) {
    const point = getPoint(event);

    setPointer({
      x: Math.max(0, Math.min(100, point.x)),
      y: Math.max(0, Math.min(100, point.y)),
      active: true,
    });

    setFirstHint(false);

    startHoldCheck(point.x, point.y);
  }

  function onPointerDown(event) {
    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {}

    movePointer(event);
  }

  function onPointerMove(event) {
    if (event.pointerType !== "mouse") {
      if (event.buttons === 0) return;
    }

    movePointer(event);
  }

  function onPointerUp(event) {
    window.clearTimeout(holdTimerRef.current);
    setNearId(null);

    if (event.pointerType !== "mouse") {
      setPointer((current) => ({
        ...current,
        active: false,
      }));
    }
  }

  function onMouseLeave() {
    window.clearTimeout(holdTimerRef.current);
    setNearId(null);

    setPointer((current) => ({
      ...current,
      active: false,
    }));
  }

  function resetThere() {
    setDoorOpen(false);
    setFound([]);
    showReaction("как будто ничего и не было");
  }

  return (
    <main className="there-page">
      <section
        ref={surfaceRef}
        className={`there-surface ${
          pointer.active ? "is-searching" : ""
        } ${nearId ? "is-near" : ""}`}
        style={{
          "--touch-x": `${pointer.x}%`,
          "--touch-y": `${pointer.y}%`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseLeave={onMouseLeave}
      >
        {/* СЛОЙ ПОД ПОВЕРХНОСТЬЮ */}
        <div
          className="there-underlayer"
          aria-hidden="true"
        >
          <div className="under-glow under-glow-one" />
          <div className="under-glow under-glow-two" />

          {HIDDEN_THINGS.map((thing) => (
            <div
              key={thing.id}
              className={`hidden-thing hidden-${thing.type} ${
                nearId === thing.id ? "is-near" : ""
              }`}
              style={{
                left: `${thing.x}%`,
                top: `${thing.y}%`,
              }}
            >
              {thing.type === "sleepy" && (
                <div className="tiny-sleeper">
                  <span className="tiny-ear ear-left" />
                  <span className="tiny-ear ear-right" />
                  <span className="tiny-face">
                    <i />
                    <i />
                  </span>
                </div>
              )}

              {thing.type === "door" && (
                <div className="tiny-door">
                  <span className="tiny-door-knob" />
                </div>
              )}

              {thing.type !== "sleepy" &&
                thing.type !== "door" && (
                  <strong>{thing.title}</strong>
                )}

              <small>{thing.text}</small>
            </div>
          ))}
        </div>

        {/* МАТОВЫЙ ВЕРХНИЙ СЛОЙ */}
        <div
          className="there-veil"
          aria-hidden="true"
        >
          <div className="veil-grain" />
          <div className="veil-line veil-line-a" />
          <div className="veil-line veil-line-b" />
          <div className="veil-line veil-line-c" />
        </div>

        {/* КУРСОР / СВЕТ */}
        <div
          className="there-touch-light"
          aria-hidden="true"
        />

        {/* ЗАГОЛОВОК */}
        <header className="there-header">
          <div>
            <small>ДЛЯ КЭССИЧКИ</small>
            <h1>Там</h1>
          </div>

          <span className="there-found-counter">
            {foundCount
              ? `${foundCount}/${HIDDEN_THINGS.length}`
              : "ничего не видно"}
          </span>
        </header>

        {/* НАМЁК ПРИ ПЕРВОМ ОТКРЫТИИ */}
        {firstHint && (
          <div className="there-first-hint">
            <span />
            <p>попробуй посмотреть ближе</p>
          </div>
        )}

        {/* УЖЕ НАЙДЕННЫЕ ВЕЩИ */}
        <div className="there-found-layer">
          {found.map((id) => {
            const thing = hiddenById[id];

            if (!thing) return null;

            return (
              <button
                key={id}
                type="button"
                className={`found-thing found-${thing.type}`}
                style={{
                  left: `${thing.x}%`,
                  top: `${thing.y}%`,
                }}
                onClick={(event) => {
                  event.stopPropagation();

                  if (id === "door") {
                    setDoorOpen(true);
                  } else if (id === "sleepy") {
                    showReaction("он снова уснул");
                  } else if (id === "hello") {
                    showReaction("привет ещё раз");
                  } else if (id === "star") {
                    showReaction("всё ещё твоя");
                  } else if (id === "smile") {
                    showReaction(":)");
                  }
                }}
                aria-label={thing.text}
              >
                {thing.type === "sleepy" && (
                  <div className="tiny-sleeper found-sleeper">
                    <span className="tiny-ear ear-left" />
                    <span className="tiny-ear ear-right" />
                    <span className="tiny-face">
                      <i />
                      <i />
                    </span>
                  </div>
                )}

                {thing.type === "door" && (
                  <div className="tiny-door found-door">
                    <span className="tiny-door-knob" />
                  </div>
                )}

                {thing.type !== "sleepy" &&
                  thing.type !== "door" && (
                    <strong>{thing.title}</strong>
                  )}
              </button>
            );
          })}
        </div>

        {reaction && (
          <div className="there-reaction">
            {reaction}
          </div>
        )}

        {/* СЕКРЕТНАЯ ДВЕРЬ */}
        {doorOpen && (
          <div
            className="there-door-scene"
            onPointerDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="there-door-close"
              type="button"
              onClick={() => setDoorOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="door-scene-light" />

            <div className="door-scene-copy">
              <small>ТЫ ВСЁ-ТАКИ НАШЛА ДВЕРЬ</small>

              <p>
                Не всё хорошее обязано лежать
                на самом видном месте.
              </p>

              <span>
                можешь оставить её открытой
                ещё немного
              </span>
            </div>
          </div>
        )}

        {/* СКРЫТАЯ МЕЛОЧЬ ПОСЛЕ ВСЕХ НАХОДОК */}
        {foundCount === HIDDEN_THINGS.length &&
          !doorOpen && (
            <button
              className="there-all-found"
              type="button"
              onClick={() =>
                showReaction(
                  "ладно. теперь ты знаешь, что тут есть."
                )
              }
            >
              <span>·</span>
            </button>
          )}
      </section>

      {foundCount === HIDDEN_THINGS.length && (
        <button
          className="there-reset"
          type="button"
          onClick={resetThere}
        >
          спрятать всё обратно
        </button>
      )}
    </main>
  );
}
