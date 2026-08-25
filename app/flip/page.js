"use client";

import { useEffect, useRef, useState } from "react";

const TITLE = "Побалуйся";

const EXTRA_PIECES = [
  {
    id: "card-1",
    kind: "card",
    text: "можешь двигать",
    sub: "да, прямо это",
    homeX: 24,
    homeY: 44,
    w: 128,
    h: 72,
  },
  {
    id: "card-2",
    kind: "card",
    text: "не всё обязано",
    sub: "стоять ровно",
    homeX: 71,
    homeY: 58,
    w: 132,
    h: 72,
  },
  {
    id: "line",
    kind: "line",
    text: "────────",
    homeX: 50,
    homeY: 72,
    w: 120,
    h: 28,
  },
  {
    id: "tiny",
    kind: "tiny",
    text: "·",
    homeX: 82,
    homeY: 31,
    w: 42,
    h: 42,
    stubborn: true,
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function PobaluysyaPage() {
  const stageRef = useRef(null);
  const worldRef = useRef(null);
  const pieceElsRef = useRef(new Map());
  const piecesRef = useRef([]);
  const frameRef = useRef(null);
  const activeDragRef = useRef(null);
  const pointersRef = useRef(new Map());
  const pinchStartRef = useRef(null);
  const bgDragRef = useRef(null);
  const inactivityRef = useRef(null);
  const motionCooldownRef = useRef(0);

  const [message, setMessage] = useState("");
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongPos, setWrongPos] = useState({ x: 50, y: 84 });
  const [worldScale, setWorldScale] = useState(1);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  function say(text, ms = 1800) {
    setMessage(text);
    window.clearTimeout(say.timer);
    say.timer = window.setTimeout(() => setMessage(""), ms);
  }

  function scheduleRepair(delay = 6500) {
    window.clearTimeout(inactivityRef.current);

    inactivityRef.current = window.setTimeout(() => {
      setIsRepairing(true);

      for (const piece of piecesRef.current) {
        piece.dragging = false;

        const lag = piece.stubborn ? 1150 : 0;

        window.setTimeout(() => {
          piece.repairing = true;
        }, lag);
      }

      setWorldScale(1);
      setWrongPos({ x: 50, y: 84 });

      window.setTimeout(() => {
        setIsRepairing(false);

        if (hasPlayed) {
          say("ну всё. почти как было.", 2100);
        }
      }, 2400);
    }, delay);
  }

  function touchActivity() {
    setHasPlayed(true);
    setIsRepairing(false);

    for (const piece of piecesRef.current) {
      piece.repairing = false;
    }

    scheduleRepair();
  }

  function buildPieces() {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const titleWidth = Math.min(rect.width * 0.72, 380);
    const startX = rect.width * 0.5 - titleWidth * 0.5;
    const letterGap = titleWidth / Math.max(1, TITLE.length - 1);

    const titlePieces = [...TITLE].map((letter, index) => {
      const x = startX + letterGap * index;
      const y = rect.height * 0.24;

      return {
        id: `letter-${index}`,
        kind: "letter",
        text: letter,
        homeX: x,
        homeY: y,
        x,
        y,
        vx: 0,
        vy: 0,
        angle: 0,
        va: 0,
        w: 50,
        h: 62,
        dragging: false,
        repairing: false,
      };
    });

    const extras = EXTRA_PIECES.map((item) => {
      const x = rect.width * (item.homeX / 100);
      const y = rect.height * (item.homeY / 100);

      return {
        ...item,
        homeX: x,
        homeY: y,
        x,
        y,
        vx: 0,
        vy: 0,
        angle: 0,
        va: 0,
        dragging: false,
        repairing: false,
      };
    });

    piecesRef.current = [...titlePieces, ...extras];
    syncPieces();
  }

  function syncPieces() {
    for (const piece of piecesRef.current) {
      const el = pieceElsRef.current.get(piece.id);
      if (!el) continue;

      el.style.transform =
        `translate3d(${piece.x}px, ${piece.y}px, 0) ` +
        `translate(-50%, -50%) rotate(${piece.angle}rad)`;
    }
  }

  useEffect(() => {
    buildPieces();

    const onResize = () => buildPieces();
    window.addEventListener("resize", onResize);

    let last = performance.now();

    function tick(now) {
      const stage = stageRef.current;

      if (stage) {
        const rect = stage.getBoundingClientRect();
        const dt = Math.min(2, (now - last) / 16.67);
        last = now;

        for (const piece of piecesRef.current) {
          if (!piece.dragging) {
            if (piece.repairing) {
              piece.vx += (piece.homeX - piece.x) * 0.038 * dt;
              piece.vy += (piece.homeY - piece.y) * 0.038 * dt;
              piece.va += (0 - piece.angle) * 0.030 * dt;
            }

            piece.x += piece.vx * dt;
            piece.y += piece.vy * dt;
            piece.angle += piece.va * dt;

            piece.vx *= Math.pow(piece.repairing ? 0.84 : 0.982, dt);
            piece.vy *= Math.pow(piece.repairing ? 0.84 : 0.982, dt);
            piece.va *= Math.pow(piece.repairing ? 0.80 : 0.975, dt);

            const halfW = (piece.w || 46) * 0.5;
            const halfH = (piece.h || 46) * 0.5;

            if (piece.x < halfW) {
              piece.x = halfW;
              piece.vx = Math.abs(piece.vx) * 0.58;
              piece.va += 0.02;
            }

            if (piece.x > rect.width - halfW) {
              piece.x = rect.width - halfW;
              piece.vx = -Math.abs(piece.vx) * 0.58;
              piece.va -= 0.02;
            }

            if (piece.y < halfH) {
              piece.y = halfH;
              piece.vy = Math.abs(piece.vy) * 0.58;
            }

            if (piece.y > rect.height - halfH) {
              piece.y = rect.height - halfH;
              piece.vy = -Math.abs(piece.vy) * 0.54;
            }

            if (
              piece.repairing &&
              Math.hypot(piece.homeX - piece.x, piece.homeY - piece.y) < 2 &&
              Math.abs(piece.vx) < 0.1 &&
              Math.abs(piece.vy) < 0.1
            ) {
              piece.x = piece.homeX;
              piece.y = piece.homeY;
              piece.angle = 0;
              piece.vx = 0;
              piece.vy = 0;
              piece.va = 0;
              piece.repairing = false;
            }
          }

          const el = pieceElsRef.current.get(piece.id);

          if (el) {
            el.style.transform =
              `translate3d(${piece.x}px, ${piece.y}px, 0) ` +
              `translate(-50%, -50%) rotate(${piece.angle}rad)`;
          }
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(inactivityRef.current);
      window.clearTimeout(say.timer);
    };
  }, []);

  useEffect(() => {
    const motionNeedsPermission =
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function";

    setPermissionNeeded(motionNeedsPermission);

    if (!motionNeedsPermission) {
      attachMotion();
      setPermissionGranted(true);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);

  function scatter(strength = 8) {
    touchActivity();

    for (const piece of piecesRef.current) {
      piece.repairing = false;
      piece.vx += (Math.random() - 0.5) * strength;
      piece.vy += (Math.random() - 0.5) * strength;
      piece.va += (Math.random() - 0.5) * 0.16;
    }

    say(
      Math.random() > 0.5
        ? "эй. это вообще-то интерфейс."
        : "ладно, собирай теперь."
    );

    try {
      navigator.vibrate?.(18);
    } catch {}
  }

  function handleMotion(event) {
    const a = event.acceleration;
    if (!a) return;

    const power =
      Math.abs(a.x || 0) +
      Math.abs(a.y || 0) +
      Math.abs(a.z || 0);

    const now = Date.now();

    if (power > 18 && now - motionCooldownRef.current > 1300) {
      motionCooldownRef.current = now;
      scatter(11);
    }
  }

  function attachMotion() {
    window.removeEventListener("devicemotion", handleMotion);
    window.addEventListener("devicemotion", handleMotion, {
      passive: true,
    });
  }

  async function enableMotion() {
    try {
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        const result = await DeviceMotionEvent.requestPermission();

        if (result !== "granted") {
          say("ладно. без тряски так без тряски.");
          return;
        }
      }

      attachMotion();
      setPermissionGranted(true);
      setPermissionNeeded(false);
      say("теперь можешь потрясти");
    } catch {
      say("что-то не дало включить движение");
    }
  }

  function registerPieceRef(id, el) {
    if (el) {
      pieceElsRef.current.set(id, el);
    } else {
      pieceElsRef.current.delete(id);
    }
  }

  function pieceDown(event, id) {
    event.stopPropagation();

    const piece = piecesRef.current.find((item) => item.id === id);
    const stage = stageRef.current;

    if (!piece || !stage) return;

    touchActivity();

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}

    const rect = stage.getBoundingClientRect();

    activeDragRef.current = {
      id,
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left - piece.x,
      offsetY: event.clientY - rect.top - piece.y,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: performance.now(),
    };

    piece.dragging = true;
    piece.repairing = false;
    piece.vx = 0;
    piece.vy = 0;

    event.currentTarget.classList.add("is-grabbed");
  }

  function pieceMove(event, id) {
    const drag = activeDragRef.current;
    const stage = stageRef.current;

    if (!drag || drag.id !== id || !stage) return;

    const piece = piecesRef.current.find((item) => item.id === id);
    if (!piece) return;

    const rect = stage.getBoundingClientRect();
    const now = performance.now();
    const elapsed = Math.max(8, now - drag.lastT);

    const nextX = event.clientX - rect.left - drag.offsetX;
    const nextY = event.clientY - rect.top - drag.offsetY;

    piece.vx = ((event.clientX - drag.lastX) / elapsed) * 16.67;
    piece.vy = ((event.clientY - drag.lastY) / elapsed) * 16.67;

    piece.x = clamp(nextX, 20, rect.width - 20);
    piece.y = clamp(nextY, 20, rect.height - 20);

    piece.angle += (event.movementX || 0) * 0.002;

    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastT = now;
  }

  function pieceUp(event, id) {
    const drag = activeDragRef.current;
    if (!drag || drag.id !== id) return;

    const piece = piecesRef.current.find((item) => item.id === id);

    if (piece) {
      piece.dragging = false;
      piece.va += piece.vx * 0.008;
    }

    event.currentTarget.classList.remove("is-grabbed");
    activeDragRef.current = null;

    scheduleRepair();
  }

  function stagePointerDown(event) {
    if (event.target !== stageRef.current && event.target !== worldRef.current) {
      return;
    }

    touchActivity();

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}

    if (pointersRef.current.size === 1) {
      bgDragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      };
    }

    if (pointersRef.current.size === 2) {
      const values = [...pointersRef.current.values()];
      pinchStartRef.current = {
        distance: Math.hypot(
          values[1].x - values[0].x,
          values[1].y - values[0].y
        ),
        scale: worldScale,
      };
    }
  }

  function stagePointerMove(event) {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const stage = stageRef.current;

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const values = [...pointersRef.current.values()];
      const distance = Math.hypot(
        values[1].x - values[0].x,
        values[1].y - values[0].y
      );

      const ratio =
        distance / Math.max(1, pinchStartRef.current.distance);

      setWorldScale(
        clamp(pinchStartRef.current.scale * ratio, 0.82, 1.18)
      );

      return;
    }

    if (
      stage &&
      bgDragRef.current &&
      bgDragRef.current.pointerId === event.pointerId
    ) {
      const dx = event.clientX - bgDragRef.current.startX;
      const dy = event.clientY - bgDragRef.current.startY;

      stage.style.setProperty("--bg-x", `${clamp(dx * 0.08, -18, 18)}px`);
      stage.style.setProperty("--bg-y", `${clamp(dy * 0.08, -18, 18)}px`);
    }
  }

  function stagePointerUp(event) {
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    if (
      bgDragRef.current &&
      bgDragRef.current.pointerId === event.pointerId
    ) {
      bgDragRef.current = null;

      if (stageRef.current) {
        stageRef.current.style.setProperty("--bg-x", "0px");
        stageRef.current.style.setProperty("--bg-y", "0px");
      }
    }

    scheduleRepair();
  }

  function wrongButton() {
    touchActivity();

    const next = wrongCount + 1;
    setWrongCount(next);

    if (next === 1) {
      say("я бы не нажимал ещё раз");
    } else if (next === 2) {
      setWrongPos({
        x: 25 + Math.random() * 50,
        y: 72 + Math.random() * 12,
      });
      say("ну зачем");
    } else if (next === 3) {
      setWrongPos({
        x: 18 + Math.random() * 64,
        y: 68 + Math.random() * 16,
      });
      say("теперь поймай");
    } else {
      setWrongCount(0);
      setWrongPos({ x: 50, y: 84 });

      if (stageRef.current) {
        stageRef.current.classList.remove("screen-pop");
        void stageRef.current.offsetWidth;
        stageRef.current.classList.add("screen-pop");

        window.setTimeout(() => {
          stageRef.current?.classList.remove("screen-pop");
        }, 700);
      }

      say("настойчивая.", 2100);
      scatter(5);
    }
  }

  const renderPieces = [
    ...[...TITLE].map((letter, index) => ({
      id: `letter-${index}`,
      kind: "letter",
      text: letter,
    })),
    ...EXTRA_PIECES,
  ];

  return (
    <main className="pobaluysya-page">
      <section
        ref={stageRef}
        className={`pobaluysya-stage ${
          isRepairing ? "is-repairing" : ""
        }`}
        onPointerDown={stagePointerDown}
        onPointerMove={stagePointerMove}
        onPointerUp={stagePointerUp}
        onPointerCancel={stagePointerUp}
      >
        <div
          ref={worldRef}
          className="pobaluysya-world"
          style={{
            transform: `scale(${worldScale})`,
          }}
        >
          <div className="play-grid" aria-hidden="true" />
          <div className="play-glow glow-a" aria-hidden="true" />
          <div className="play-glow glow-b" aria-hidden="true" />

          <div className="play-top-copy">
            <small>ДЛЯ КЭССИЧКИ</small>
            <span>
              {isRepairing ? "сам чинится…" : "трогать можно"}
            </span>
          </div>

          {renderPieces.map((piece) => (
            <div
              key={piece.id}
              ref={(el) => registerPieceRef(piece.id, el)}
              className={`play-piece play-${piece.kind} ${
                piece.stubborn ? "is-stubborn" : ""
              }`}
              onPointerDown={(event) =>
                pieceDown(event, piece.id)
              }
              onPointerMove={(event) =>
                pieceMove(event, piece.id)
              }
              onPointerUp={(event) =>
                pieceUp(event, piece.id)
              }
              onPointerCancel={(event) =>
                pieceUp(event, piece.id)
              }
            >
              {piece.kind === "card" ? (
                <>
                  <b>{piece.text}</b>
                  <small>{piece.sub}</small>
                </>
              ) : (
                piece.text
              )}
            </div>
          ))}

          <button
            type="button"
            className={`wrong-button wrong-${wrongCount}`}
            style={{
              left: `${wrongPos.x}%`,
              top: `${wrongPos.y}%`,
            }}
            onClick={(event) => {
              event.stopPropagation();
              wrongButton();
            }}
          >
            {wrongCount < 3 ? "не нажимай" : "·"}
          </button>

          <button
            type="button"
            className="scatter-button"
            onClick={(event) => {
              event.stopPropagation();
              scatter(9);
            }}
          >
            перемешать
          </button>

          {permissionNeeded && !permissionGranted && (
            <button
              type="button"
              className="motion-play-button"
              onClick={(event) => {
                event.stopPropagation();
                enableMotion();
              }}
            >
              <span>↝</span>
              <div>
                <b>включить встряску</b>
                <small>чтобы сайт реагировал на телефон</small>
              </div>
            </button>
          )}

          {message && (
            <div className="play-message">
              {message}
            </div>
          )}

          <div className="play-hint">
            хватай · кидай · тяни двумя пальцами
          </div>
        </div>
      </section>
    </main>
  );
}
