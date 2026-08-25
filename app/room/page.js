"use client";

import { useEffect, useRef, useState } from "react";

const REACTIONS = {
  hold: "я почувствовал",
  triple: "да, здесь тоже работает",
  circle: "ты всё проверяешь 👀",
  up: "кое-что хорошее всё-таки остаётся",
};

export default function TracesPage() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(null);
  const pointerRef = useRef({
    active: false,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    startTime: 0,
    holdTimer: null,
    points: [],
  });

  const particlesRef = useRef([]);
  const trailsRef = useRef([]);
  const ripplesRef = useRef([]);
  const lastTapRef = useRef({ time: 0, x: 0, y: 0, count: 0 });

  const [reaction, setReaction] = useState("");
  const [reactionPos, setReactionPos] = useState({ x: 50, y: 52 });
  const [discoveries, setDiscoveries] = useState([]);
  const [secretReady, setSecretReady] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const [memoryLights, setMemoryLights] = useState([]);
  const [hintHidden, setHintHidden] = useState(false);
  const [bgShift, setBgShift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const savedDiscoveries = JSON.parse(
        localStorage.getItem("kessi-traces-discoveries") || "[]"
      );
      const savedLights = JSON.parse(
        localStorage.getItem("kessi-traces-lights") || "[]"
      );

      if (Array.isArray(savedDiscoveries)) {
        setDiscoveries(savedDiscoveries);
        setSecretReady(savedDiscoveries.length >= 4);
      }

      if (Array.isArray(savedLights)) {
        setMemoryLights(savedLights.slice(-7));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "kessi-traces-discoveries",
        JSON.stringify(discoveries)
      );
      setSecretReady(discoveries.length >= 4);
    } catch {}
  }, [discoveries]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "kessi-traces-lights",
        JSON.stringify(memoryLights.slice(-7))
      );
    } catch {}
  }, [memoryLights]);

  function unlock(id) {
    setDiscoveries((current) =>
      current.includes(id) ? current : [...current, id]
    );
  }

  function showReaction(text, x, y) {
    setReaction(text);
    setReactionPos({
      x: Math.max(14, Math.min(86, x)),
      y: Math.max(14, Math.min(82, y)),
    });

    window.clearTimeout(showReaction.timer);
    showReaction.timer = window.setTimeout(() => {
      setReaction("");
    }, 2600);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // trails
      trailsRef.current = trailsRef.current.filter((trail) => trail.life > 0);

      for (const trail of trailsRef.current) {
        trail.life -= 0.022;

        const alpha = Math.max(0, trail.life);
        const g = ctx.createRadialGradient(
          trail.x,
          trail.y,
          0,
          trail.x,
          trail.y,
          16
        );

        g.addColorStop(0, `rgba(255,225,214,${0.72 * alpha})`);
        g.addColorStop(0.25, `rgba(255,176,183,${0.34 * alpha})`);
        g.addColorStop(1, "rgba(255,126,160,0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // particles
      particlesRef.current = particlesRef.current.filter(
        (particle) => particle.life > 0
      );

      for (const particle of particlesRef.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.life -= 0.012;

        const alpha = Math.max(0, particle.life);

        ctx.fillStyle = `rgba(255,205,196,${alpha * 0.62})`;
        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // ripples
      ripplesRef.current = ripplesRef.current.filter((ripple) => ripple.life > 0);

      for (const ripple of ripplesRef.current) {
        ripple.radius += 0.75;
        ripple.life -= 0.018;

        ctx.strokeStyle = `rgba(255,185,178,${ripple.life * 0.28})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
          ripple.x,
          ripple.y,
          ripple.radius,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  function addTrail(x, y, velocity = 1) {
    trailsRef.current.push({
      x,
      y,
      life: 1,
    });

    const count = velocity > 12 ? 5 : 2;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * (velocity > 12 ? 2.8 : 1.2),
        vy: (Math.random() - 0.5) * (velocity > 12 ? 2.8 : 1.2),
        life: 0.6 + Math.random() * 0.4,
        size: 0.7 + Math.random() * 1.5,
      });
    }
  }

  function addRipple(x, y) {
    for (let i = 0; i < 4; i++) {
      ripplesRef.current.push({
        x,
        y,
        radius: 5 + i * 8,
        life: 0.9 - i * 0.11,
      });
    }
  }

  function localPoint(event) {
    const rect = wrapRef.current.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      px: ((event.clientX - rect.left) / rect.width) * 100,
      py: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onPointerDown(event) {
    const point = localPoint(event);
    const now = Date.now();

    setHintHidden(true);

    pointerRef.current.active = true;
    pointerRef.current.x = point.x;
    pointerRef.current.y = point.y;
    pointerRef.current.startX = point.x;
    pointerRef.current.startY = point.y;
    pointerRef.current.startTime = now;
    pointerRef.current.points = [{ x: point.x, y: point.y }];

    addTrail(point.x, point.y);
    addRipple(point.x, point.y);

    const tap = lastTapRef.current;
    const close =
      Math.hypot(point.x - tap.x, point.y - tap.y) < 44 &&
      now - tap.time < 480;

    if (close) {
      tap.count += 1;
    } else {
      tap.count = 1;
    }

    tap.time = now;
    tap.x = point.x;
    tap.y = point.y;

    if (tap.count >= 3) {
      showReaction(REACTIONS.triple, point.px, point.py);
      unlock("triple");
      tap.count = 0;
    }

    window.clearTimeout(pointerRef.current.holdTimer);

    pointerRef.current.holdTimer = window.setTimeout(() => {
      if (!pointerRef.current.active) return;

      addRipple(point.x, point.y);
      addRipple(point.x, point.y);

      showReaction(REACTIONS.hold, point.px, point.py);
      unlock("hold");

      setMemoryLights((current) => [
        ...current.slice(-6),
        { x: point.px, y: point.py },
      ]);
    }, 1050);
  }

  function onPointerMove(event) {
    const point = localPoint(event);

    setBgShift({
      x: (point.px - 50) * 0.055,
      y: (point.py - 50) * 0.04,
    });

    if (!pointerRef.current.active) return;

    const previousX = pointerRef.current.x;
    const previousY = pointerRef.current.y;

    const distance = Math.hypot(
      point.x - previousX,
      point.y - previousY
    );

    pointerRef.current.x = point.x;
    pointerRef.current.y = point.y;

    if (distance > 2) {
      const steps = Math.min(8, Math.max(1, Math.floor(distance / 4)));

      for (let i = 1; i <= steps; i++) {
        const t = i / steps;

        addTrail(
          previousX + (point.x - previousX) * t,
          previousY + (point.y - previousY) * t,
          distance
        );
      }
    }

    if (pointerRef.current.points.length < 140) {
      pointerRef.current.points.push({ x: point.x, y: point.y });
    }

    if (
      Math.hypot(
        point.x - pointerRef.current.startX,
        point.y - pointerRef.current.startY
      ) > 14
    ) {
      window.clearTimeout(pointerRef.current.holdTimer);
    }
  }

  function onPointerUp(event) {
    if (!pointerRef.current.active) return;

    const point = localPoint(event);
    const points = pointerRef.current.points;
    const elapsed = Date.now() - pointerRef.current.startTime;

    pointerRef.current.active = false;
    window.clearTimeout(pointerRef.current.holdTimer);

    const dx = point.x - pointerRef.current.startX;
    const dy = point.y - pointerRef.current.startY;

    // swipe from bottom to top
    if (dy < -150 && Math.abs(dx) < 110 && elapsed < 1700) {
      showReaction(REACTIONS.up, point.px, Math.max(24, point.py));
      unlock("up");
    }

    // rough circle detection:
    if (points.length > 28) {
      const first = points[0];
      const last = points[points.length - 1];
      const closeLoop = Math.hypot(first.x - last.x, first.y - last.y) < 52;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (const p of points) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }

      const size = Math.min(maxX - minX, maxY - minY);

      if (closeLoop && size > 75) {
        showReaction(REACTIONS.circle, point.px, point.py);
        unlock("circle");
        addRipple(point.x, point.y);
      }
    }
  }

  function openSecret() {
    if (!secretReady) return;

    setSecretOpen(true);
    unlock("secret");
  }

  return (
    <div className="traces-page">
      <section
        ref={wrapRef}
        className={`traces-surface ${secretOpen ? "secret-open" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(event) => {
          if (pointerRef.current.active) onPointerUp(event);
        }}
        style={{
          "--shift-x": `${bgShift.x}px`,
          "--shift-y": `${bgShift.y}px`,
        }}
      >
        <canvas ref={canvasRef} className="traces-canvas" />

        <div className="traces-bg-layer layer-one" aria-hidden="true" />
        <div className="traces-bg-layer layer-two" aria-hidden="true" />

        {memoryLights.map((light, index) => (
          <span
            key={`${light.x}-${light.y}-${index}`}
            className="memory-light"
            style={{
              left: `${light.x}%`,
              top: `${light.y}%`,
              "--delay": `${index * 0.38}s`,
            }}
          />
        ))}

        <header className="traces-header">
          <div>
            <small>ДЛЯ КЭССИЧКИ</small>
            <h1>Следы</h1>
          </div>

          <span className="traces-counter">
            {discoveries.length > 0 ? `${discoveries.length} найдено` : "тихо"}
          </span>
        </header>

        {!hintHidden && (
          <div className="trace-hint">
            <span className="trace-finger">⌇</span>
            <p>проведи пальцем</p>
          </div>
        )}

        {reaction && (
          <div
            className="trace-reaction"
            style={{
              left: `${reactionPos.x}%`,
              top: `${reactionPos.y}%`,
            }}
          >
            {reaction}
          </div>
        )}

        {secretReady && !secretOpen && (
          <button
            className="trace-secret-dot"
            type="button"
            onClick={openSecret}
            aria-label="Секрет"
          >
            <span />
          </button>
        )}

        {secretOpen && (
          <div className="trace-secret-message">
            <small>ты нашла всё</small>

            <p>
              Я просто хотел оставить здесь место,
              которое отвечает, когда ты к нему прикасаешься.
            </p>

            <button
              type="button"
              onClick={() => setSecretOpen(false)}
            >
              оставить как было
            </button>
          </div>
        )}

        <div className="traces-whisper whisper-one">
          никуда не спеши
        </div>

        <div className="traces-whisper whisper-two">
          здесь что-то остаётся
        </div>
      </section>
    </div>
  );
}
