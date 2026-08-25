"use client";

import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import DrakoshaBuddy from "./DrakoshaBuddy";

export default function SiteShell({ children }) {
  const [lightOn, setLightOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved =
      localStorage.getItem("kessi-light") === "1";

    setLightOn(saved);
    setReady(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {});
    }
  }, []);

  function toggleLight() {
    setLightOn((current) => {
      const next = !current;

      localStorage.setItem(
        "kessi-light",
        next ? "1" : "0"
      );

      return next;
    });
  }

  return (
    <div
      className={`site-shell ${
        lightOn ? "light-on" : ""
      } ${ready ? "ready" : ""}`}
    >
      <div
        className="site-ambient"
        aria-hidden="true"
      />

      <div
        className="site-light-wash"
        aria-hidden="true"
      />

      <header className="topbar">
        <a className="topbar-brand" href="/">
          <span className="brand-heart">
            ♥
          </span>

          <span>
            <b>Для Кэссички</b>
            <small>
              маленький уголок в интернете
            </small>
          </span>
        </a>

        <button
          className={`global-light ${
            lightOn ? "on" : ""
          }`}
          type="button"
          onClick={toggleLight}
          aria-pressed={lightOn}
          title={
            lightOn
              ? "Выключить свет"
              : "Включить свет"
          }
        >
          <span>
            {lightOn ? "💡" : "🌙"}
          </span>

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
