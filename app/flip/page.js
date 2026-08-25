"use client";

import { useEffect, useRef, useState } from "react";

const ITEMS = [
  { id: "a", r: 13, symbol: "•", mass: 1.0 },
  { id: "b", r: 18, symbol: "◌", mass: 1.1 },
  { id: "c", r: 14, symbol: "✦", mass: 0.85 },
  { id: "d", r: 11, symbol: "·", mass: 0.75 },
  { id: "e", r: 16, symbol: "⌁", mass: 1.25 },
  { id: "little", r: 12, symbol: "°", mass: 0.72, special: true },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function DontFlipPage() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const objectsRef = useRef([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const gravityRef = useRef({ x: 0, y: 0.72 });
  const targetGravityRef = useRef({ x: 0, y: 0.72 });

  const lastMotionRef = useRef({ x: 0, y: 0, z: 0, t: 0 });
  const lastAlphaRef = useRef(null);
  const rotationAccumRef = useRef(0);
  const lastOrientationSideRef = useRef("normal");

  const upsideTimerRef = useRef(null);
  const sidewaysTimerRef = useRef(null);
  const quietTimerRef = useRef(null);
  const messageTimerRef = useRef(null);
  const returnTimerRef = useRef(null);

  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState(true);
  const [found, setFound] = useState([]);
  const [visits, setVisits] = useState(1);
  const [quietGlow, setQuietGlow] = useState(false);
  const [clinging, setClinging] = useState(false);
  const [specialMissing, setSpecialMissing] = useState(false);
  const [secretFlash, setSecretFlash] = useState(false);

  function unlock(id) {
    setFound((current) => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      try {
        localStorage.setItem(
          "kessi-dontflip-found",
          JSON.stringify(next)
        );
      } catch {}
      return next;
    });
  }

  function say(text, ms = 2300) {
    setMessage(text);
    window.clearTimeout(messageTimerRef.current);
    messageTimerRef.current = window.setTimeout(() => {
      setMessage("");
    }, ms);
  }

  function pulseSecret() {
    setSecretFlash(true);
    window.setTimeout(() => setSecretFlash(false), 900);
  }

  function initObjects(w, h) {
    objectsRef.current = ITEMS.map((item, index) => ({
      ...item,
      x: w * (0.23 + (index % 3) * 0.26) + (Math.random() - 0.5) * 24,
      y: h * (0.30 + Math.floor(index / 3) * 0.22) + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      spin: (Math.random() - 0.5) * 0.015,
      angle: Math.random() * Math.PI * 2,
      sleeping: false,
      hidden: false,
    }));
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("kessi-dontflip-found") || "[]"
      );
      if (Array.isArray(saved)) setFound(saved);

      const oldVisits = Number(
        localStorage.getItem("kessi-dontflip-visits") || "0"
      );
      const nextVisits = oldVisits + 1;
      localStorage.setItem(
        "kessi-dontflip-visits",
        String(nextVisits)
      );
      setVisits(nextVisits);
    } catch {}

    const motionPermission =
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function";

    const orientationPermission =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function";

    setPermissionNeeded(motionPermission || orientationPermission);

    if (!motionPermission && !orientationPermission) {
      setPermissionGranted(true);
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(upsideTimerRef.current);
      window.clearTimeout(sidewaysTimerRef.current);
      window.clearTimeout(quietTimerRef.current);
      window.clearTimeout(messageTimerRef.current);
      window.clearTimeout(returnTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext("2d");

    function resize() {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      sizeRef.current = {
        w: rect.width,
        h: rect.height,
        dpr,
      };

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!objectsRef.current.length) {
        initObjects(rect.width, rect.height);
      } else {
        for (const obj of objectsRef.current) {
          obj.x = clamp(obj.x, obj.r, rect.width - obj.r);
          obj.y = clamp(obj.y, obj.r, rect.height - obj.r);
        }
      }
    }

    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();

    function draw(now) {
      const dt = Math.min(2.2, (now - last) / 16.67);
      last = now;

      const { w, h } = sizeRef.current;

      gravityRef.current.x +=
        (targetGravityRef.current.x - gravityRef.current.x) * 0.08;
      gravityRef.current.y +=
        (targetGravityRef.current.y - gravityRef.current.y) * 0.08;

      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createRadialGradient(
        w * 0.5,
        h * 0.44,
        0,
        w * 0.5,
        h * 0.44,
        Math.max(w, h) * 0.8
      );
      bg.addColorStop(0, "rgba(125,80,91,0.12)");
      bg.addColorStop(0.5, "rgba(48,36,43,0.04)");
      bg.addColorStop(1, "rgba(10,10,12,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const objs = objectsRef.current;

      for (const obj of objs) {
        if (obj.hidden) continue;

        if (clinging && obj.special) {
          const targetX = w * 0.68;
          const targetY = obj.r + 8;
          obj.vx *= 0.80;
          obj.vy *= 0.80;
          obj.x += (targetX - obj.x) * 0.075;
          obj.y += (targetY - obj.y) * 0.075;
        } else if (obj.sleeping) {
          obj.vx *= 0.90;
          obj.vy *= 0.90;
        } else {
          obj.vx += gravityRef.current.x * 0.23 * obj.mass * dt;
          obj.vy += gravityRef.current.y * 0.23 * obj.mass * dt;

          obj.vx *= Math.pow(0.992, dt);
          obj.vy *= Math.pow(0.992, dt);

          obj.x += obj.vx * dt;
          obj.y += obj.vy * dt;
          obj.angle += obj.spin * dt;
        }

        if (!clinging || !obj.special) {
          if (obj.x - obj.r < 0) {
            obj.x = obj.r;
            obj.vx = Math.abs(obj.vx) * 0.62;
          }

          if (obj.x + obj.r > w) {
            obj.x = w - obj.r;
            obj.vx = -Math.abs(obj.vx) * 0.62;
          }

          if (obj.y - obj.r < 0) {
            obj.y = obj.r;
            obj.vy = Math.abs(obj.vy) * 0.62;
          }

          if (obj.y + obj.r > h) {
            obj.y = h - obj.r;
            obj.vy = -Math.abs(obj.vy) * 0.56;
          }
        }
      }

      // простые столкновения
      for (let i = 0; i < objs.length; i++) {
        const a = objs[i];
        if (a.hidden) continue;

        for (let j = i + 1; j < objs.length; j++) {
          const b = objs[j];
          if (b.hidden) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = a.r + b.r + 2;

          if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;

            const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;

            if (rel < 0) {
              const impulse = -rel * 0.62;
              a.vx -= impulse * nx;
              a.vy -= impulse * ny;
              b.vx += impulse * nx;
              b.vy += impulse * ny;
            }
          }
        }
      }

      for (const obj of objs) {
        if (obj.hidden) continue;

        const glow = ctx.createRadialGradient(
          obj.x,
          obj.y,
          1,
          obj.x,
          obj.y,
          obj.r * 2.4
        );

        if (obj.special) {
          glow.addColorStop(0, "rgba(255,224,210,0.34)");
          glow.addColorStop(0.35, "rgba(220,139,151,0.14)");
          glow.addColorStop(1, "rgba(220,139,151,0)");
        } else {
          glow.addColorStop(0, "rgba(255,238,230,0.15)");
          glow.addColorStop(0.38, "rgba(190,124,145,0.07)");
          glow.addColorStop(1, "rgba(190,124,145,0)");
        }

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.r * 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.angle);

        ctx.fillStyle = obj.special
          ? "rgba(238,180,174,0.91)"
          : "rgba(229,218,216,0.76)";

        ctx.beginPath();
        ctx.arc(0, 0, obj.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = obj.special
          ? "rgba(79,48,56,0.82)"
          : "rgba(57,48,52,0.76)";
        ctx.font = `${Math.max(10, obj.r)}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obj.symbol, 0, 0);

        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [clinging]);

  function rotateMotionForScreen(x, y) {
    const angle =
      window.screen?.orientation?.angle ??
      window.orientation ??
      0;

    if (angle === 90) return { x: -y, y: x };
    if (angle === -90 || angle === 270) return { x: y, y: -x };
    if (angle === 180) return { x: -x, y: -y };

    return { x, y };
  }

  function handleMotion(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const rawX = Number(acc.x || 0);
    const rawY = Number(acc.y || 0);
    const rawZ = Number(acc.z || 0);

    const rotated = rotateMotionForScreen(rawX, rawY);

    // Координата Y устройства направлена вверх,
    // а на экране вниз, поэтому знак меняем.
    targetGravityRef.current.x = clamp(-rotated.x / 9.81, -1.3, 1.3);
    targetGravityRef.current.y = clamp(rotated.y / 9.81, -1.3, 1.3);

    const now = performance.now();
    const last = lastMotionRef.current;

    if (last.t) {
      const impulse =
        Math.abs(rawX - last.x) +
        Math.abs(rawY - last.y) +
        Math.abs(rawZ - last.z);

      if (impulse > 13 && now - last.t < 170) {
        triggerShake();
      }
    }

    lastMotionRef.current = {
      x: rawX,
      y: rawY,
      z: rawZ,
      t: now,
    };

    const gx = targetGravityRef.current.x;
    const gy = targetGravityRef.current.y;

    detectPose(gx, gy, rawZ);
  }

  function handleOrientation(event) {
    const alpha = event.alpha;

    if (typeof alpha === "number") {
      if (lastAlphaRef.current !== null) {
        let delta = alpha - lastAlphaRef.current;

        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        if (Math.abs(delta) < 45) {
          rotationAccumRef.current += Math.abs(delta);
        }

        if (rotationAccumRef.current > 315) {
          rotationAccumRef.current = 0;
          unlock("spin360");
          say("ладно, полный круг засчитан");
          pulseSecret();

          for (const obj of objectsRef.current) {
            obj.vx += (Math.random() - 0.5) * 3.4;
            obj.vy += (Math.random() - 0.5) * 3.4;
          }
        }
      }

      lastAlphaRef.current = alpha;
    }
  }

  function detectPose(gx, gy, rawZ) {
    const upside = gy < -0.72;
    const sideways = Math.abs(gx) > 0.78 && Math.abs(gy) < 0.65;
    const nearlyFlat =
      Math.abs(gx) < 0.22 &&
      Math.abs(gy) < 0.22 &&
      Math.abs(rawZ) > 7.2;

    const side = upside ? "upside" : sideways ? "side" : "normal";

    if (
      lastOrientationSideRef.current !== side &&
      ((lastOrientationSideRef.current === "normal" && side === "upside") ||
        (lastOrientationSideRef.current === "upside" && side === "normal"))
    ) {
      const old = lastOrientationSideRef.current;
      lastOrientationSideRef.current = side;

      if (old !== "normal" || side !== "normal") {
        flipCountRef.current = (flipCountRef.current || 0) + 1;
      }
    } else {
      lastOrientationSideRef.current = side;
    }

    if (upside) {
      if (!upsideTimerRef.current) {
        upsideTimerRef.current = window.setTimeout(() => {
          setClinging(true);
          unlock("upside");
          say("ну я старалась", 2600);

          window.setTimeout(() => {
            setClinging(false);
          }, 3200);
        }, 1900);
      }
    } else {
      window.clearTimeout(upsideTimerRef.current);
      upsideTimerRef.current = null;
    }

    if (sideways) {
      if (!sidewaysTimerRef.current) {
        sidewaysTimerRef.current = window.setTimeout(() => {
          const little = objectsRef.current.find((o) => o.special);

          if (little) {
            little.vy -= 3.8;
            little.vx -= Math.sign(gx) * 2.0;
          }

          unlock("sideways");
          say("не выдавай меня");
        }, 4300);
      }
    } else {
      window.clearTimeout(sidewaysTimerRef.current);
      sidewaysTimerRef.current = null;
    }

    if (nearlyFlat) {
      if (!quietTimerRef.current) {
        quietTimerRef.current = window.setTimeout(() => {
          setQuietGlow(true);
          unlock("quiet");

          const little = objectsRef.current.find((o) => o.special);
          if (little) {
            little.sleeping = true;
          }

          say("тихо. он уснул.", 2800);
        }, 7000);
      }
    } else {
      window.clearTimeout(quietTimerRef.current);
      quietTimerRef.current = null;

      if (quietGlow) {
        setQuietGlow(false);
        const little = objectsRef.current.find((o) => o.special);
        if (little) little.sleeping = false;
      }
    }
  }

  const flipCountRef = useRef(0);

  useEffect(() => {
    if (flipCountRef.current >= 5) {
      flipCountRef.current = 0;
      unlock("manyflips");
      say("ты точно решила проверить всё? 👀");
    }
  });

  function triggerShake() {
    const now = Date.now();
    if (triggerShake.last && now - triggerShake.last < 1200) return;
    triggerShake.last = now;

    setHint(false);
    unlock("shake");

    try {
      navigator.vibrate?.(22);
    } catch {}

    for (const obj of objectsRef.current) {
      obj.vx += (Math.random() - 0.5) * 7;
      obj.vy += (Math.random() - 0.5) * 7;
    }

    const little = objectsRef.current.find((o) => o.special);

    if (little) {
      little.hidden = true;
      setSpecialMissing(true);

      say("кажется, кто-то потерялся");

      window.clearTimeout(returnTimerRef.current);
      returnTimerRef.current = window.setTimeout(() => {
        little.hidden = false;

        const { w, h } = sizeRef.current;
        little.x = Math.max(little.r, w * 0.5);
        little.y = little.r + 20;
        little.vx = 0;
        little.vy = 0.3;

        setSpecialMissing(false);
        say("а. вот он.");
      }, 2600);
    }
  }

  function attachListeners() {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);

    window.addEventListener("devicemotion", handleMotion, {
      passive: true,
    });

    window.addEventListener("deviceorientation", handleOrientation, {
      passive: true,
    });

    setPermissionGranted(true);
  }

  useEffect(() => {
    if (permissionGranted && !permissionNeeded) {
      attachListeners();

      return () => {
        window.removeEventListener("devicemotion", handleMotion);
        window.removeEventListener("deviceorientation", handleOrientation);
      };
    }
  }, [permissionGranted, permissionNeeded]);

  async function enableMotion() {
    try {
      let motion = "granted";
      let orientation = "granted";

      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        motion = await DeviceMotionEvent.requestPermission();
      }

      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        orientation = await DeviceOrientationEvent.requestPermission();
      }

      if (motion !== "granted" || orientation !== "granted") {
        say("без доступа телефон не сможет всё уронить");
        return;
      }

      attachListeners();
      setPermissionNeeded(false);
      setHint(false);
      say("только не переворачивай");
    } catch {
      say("не получилось включить движение");
    }
  }

  function handleCanvasTap(event) {
    setHint(false);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const little = objectsRef.current.find(
      (obj) => obj.special && !obj.hidden
    );

    if (
      little &&
      Math.hypot(x - little.x, y - little.y) < little.r + 24
    ) {
      unlock("littleTap");

      if (visits >= 3) {
        say("я тебя уже знаю");
      } else {
        say("не трогай. я занят.");
      }

      little.vx += (Math.random() - 0.5) * 4;
      little.vy -= 2.4;
      return;
    }

    for (const obj of objectsRef.current) {
      const dx = obj.x - x;
      const dy = obj.y - y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < 120) {
        const strength = (120 - dist) / 120;
        obj.vx += (dx / dist) * strength * 3.0;
        obj.vy += (dy / dist) * strength * 3.0;
      }
    }
  }

  return (
    <main className="dontflip-page">
      <section
        ref={stageRef}
        className={`dontflip-stage ${
          quietGlow ? "is-quiet" : ""
        } ${secretFlash ? "secret-flash" : ""}`}
      >
        <canvas
          ref={canvasRef}
          className="dontflip-canvas"
          onPointerDown={handleCanvasTap}
        />

        <header className="dontflip-header">
          <div>
            <small>ДЛЯ КЭССИЧКИ</small>
            <h1>Не переворачивай</h1>
          </div>

          <span className="dontflip-found">
            {found.length ? `${found.length} странностей` : "всё нормально"}
          </span>
        </header>

        {hint && (
          <div className="dontflip-intro">
            <p>не переворачивай телефон</p>
            <small>серьёзно</small>
          </div>
        )}

        {permissionNeeded && !permissionGranted && (
          <button
            className="motion-permission"
            type="button"
            onClick={enableMotion}
          >
            <span>↻</span>
            <b>Разрешить движение</b>
            <small>
              чтобы сайт чувствовал наклоны телефона
            </small>
          </button>
        )}

        {message && (
          <div className="dontflip-message">
            {message}
          </div>
        )}

        {quietGlow && (
          <div className="quiet-sleep">
            <span>ᶻ</span>
            <span>ᶻ</span>
            <span>ᶻ</span>
          </div>
        )}

        {specialMissing && (
          <div className="missing-mark">?</div>
        )}

        {found.includes("upside") && (
          <span className="tiny-memory memory-one">·</span>
        )}

        {found.includes("shake") && (
          <span className="tiny-memory memory-two">·</span>
        )}

        {found.includes("spin360") && (
          <span className="tiny-memory memory-three">·</span>
        )}
      </section>
    </main>
  );
}
