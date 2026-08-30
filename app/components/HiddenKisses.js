"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "kessi-hidden-kisses-v2";

export default function HiddenKisses() {
  const pathname = usePathname();

  const [found, setFound] = useState([]);
  const [message, setMessage] = useState("");
  const [showFinal, setShowFinal] = useState(false);

  const messageTimerRef = useRef(null);
  const finalTimerRef = useRef(null);

  /* =====================================================
     ЗАГРУЖАЕМ НАЙДЕННЫЕ БУСЬКИ
  ===================================================== */

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      if (Array.isArray(saved)) {
        setFound(saved);
      }
    } catch {
      setFound([]);
    }

    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }

      if (finalTimerRef.current) {
        clearTimeout(finalTimerRef.current);
      }
    };
  }, []);

  /* =====================================================
     ПОКАЗАТЬ СООБЩЕНИЕ
  ===================================================== */

  function showMessage(text) {
    setMessage(text);

    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }

    messageTimerRef.current = setTimeout(() => {
      setMessage("");
    }, 3200);
  }

  /* =====================================================
     БУСЬКА НАЙДЕНА
  ===================================================== */

  function findKiss(id) {
    if (found.includes(id)) {
      return;
    }

    const next = [...found, id];

    setFound(next);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch {}

    if (next.length === 1) {
      showMessage(
        "вау ты реально ее нашла 😳 осталось 2 малыш"
      );
    }

    if (next.length === 2) {
      showMessage(
        "я кажется переоценил свои способности прятать 😭 ещё 1"
      );
    }

    if (next.length >= 3) {
      showMessage(
        "ну тут просто жоский тьмок 💋 ты всё нашла!"
      );

      finalTimerRef.current = setTimeout(() => {
        setShowFinal(true);
      }, 1100);
    }
  }

  return (
    <>
      {/* =================================================
          БУСЬКА №1
          ТОЛЬКО ГЛАВНАЯ
      ================================================= */}

      {pathname === "/" && (
        <button
          type="button"
          className={`hidden-kiss hidden-kiss-one ${
            found.includes(1) ? "kiss-found" : ""
          }`}
          onClick={() => findKiss(1)}
          aria-label="Секрет"
        >
          <span />
        </button>
      )}

      {/* =================================================
          БУСЬКА №2
          КАНЦЕЛЯРИЯ
      ================================================= */}

      {pathname.startsWith("/chancery") && (
        <button
          type="button"
          className={`hidden-kiss hidden-kiss-two ${
            found.includes(2) ? "kiss-found" : ""
          }`}
          onClick={() => findKiss(2)}
          aria-label="Секрет"
        >
          <span />
        </button>
      )}

      {/* =================================================
          БУСЬКА №3
          ДОСТУПНА ПО САЙТУ
      ================================================= */}

      <button
        type="button"
        className={`hidden-kiss hidden-kiss-three ${
          found.includes(3) ? "kiss-found" : ""
        }`}
        onClick={() => findKiss(3)}
        aria-label="Секрет"
      >
        <span />
      </button>

      {/* =================================================
          СООБЩЕНИЕ ПОСЛЕ НАХОДКИ
      ================================================= */}

      {message && (
        <div className="hidden-kiss-toast">
          <span className="hidden-kiss-toast-icon">
            💋
          </span>

          <span>{message}</span>
        </div>
      )}

      {/* =================================================
          ФИНАЛ ПОСЛЕ 3/3
      ================================================= */}

      {showFinal && (
        <div className="hidden-kiss-final
