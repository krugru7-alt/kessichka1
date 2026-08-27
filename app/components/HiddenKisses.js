"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";


const STORAGE_KEY =
  "our-world-hidden-kisses-v1";


const KISSES = {
  online: {
    id: "online",
    eyebrow: "ЭМ...",
    title: "Первый жоский тьмок",
    text:
      "Три раза тыкнуть в одно место?... Ладно.",
  },

  registry: {
    id: "registry",
    eyebrow: "ВОТ ЭТО УЖЕ ПОДОЗРИТЕЛЬНО",
    title: "Второй жоский тьмок",
    text:
      "Я не знаю, что именно ты там искала, но нашла.",
  },

  tent: {
    id: "tent",
    eyebrow: "НУ ВСЁ.",
    title: "Третий жоский тьмок",
    text:
      "Серьезно...?держи буська буську",
  },
};


function readSaved() {
  try {
    const value =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    const parsed =
      value
        ? JSON.parse(value)
        : [];

    return Array.isArray(parsed)
      ? parsed.filter(
          (id) =>
            Object.prototype.hasOwnProperty.call(
              KISSES,
              id
            )
        )
      : [];
  } catch {
    return [];
  }
}


export default function HiddenKisses() {
  const pathname =
    usePathname();

  const [found, setFound] =
    useState([]);

  const [reveal, setReveal] =
    useState(null);

  const foundRef =
    useRef(new Set());

  const tapsRef =
    useRef({});

  const holdTimerRef =
    useRef(null);


  useEffect(() => {
    const saved =
      readSaved();

    setFound(saved);

    foundRef.current =
      new Set(saved);
  }, []);


  function saveFound(next) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next)
      );
    } catch {}
  }


  function revealKiss(id) {
    if (
      !KISSES[id] ||
      foundRef.current.has(id)
    ) {
      return;
    }

    const next = [
      ...foundRef.current,
      id,
    ];

    foundRef.current =
      new Set(next);

    setFound(next);
    saveFound(next);

    const count =
      next.length;

    setReveal({
      ...KISSES[id],
      count,
    });

    window.dispatchEvent(
      new CustomEvent(
        "our-world-hidden-kiss-found",
        {
          detail: {
            id,
            count,
          },
        }
      )
    );
  }


  function countTap(
    key,
    needed,
    kissId
  ) {
    if (
      foundRef.current.has(
        kissId
      )
    ) {
      return;
    }

    const current =
      tapsRef.current[key] || {
        count: 0,
        timer: null,
      };

    if (current.timer) {
      window.clearTimeout(
        current.timer
      );
    }

    current.count += 1;

    current.timer =
      window.setTimeout(
        () => {
          tapsRef.current[key] = {
            count: 0,
            timer: null,
          };
        },
        4500
      );

    tapsRef.current[key] =
      current;

    if (
      current.count >= needed
    ) {
      window.clearTimeout(
        current.timer
      );

      tapsRef.current[key] = {
        count: 0,
        timer: null,
      };

      revealKiss(kissId);
    }
  }


  useEffect(() => {
    function handleClick(event) {
      const target =
        event.target;

      if (
        !(target instanceof Element)
      ) {
        return;
      }

      /* =============================================
         ПОЦЕЛУЙ №1

         Главная.
         Нужно 7 раз за несколько секунд
         нажать именно на маленький "● online".
      ============================================= */

      if (
        pathname === "/" &&
        target.closest(
          ".home-v4-live"
        )
      ) {
        countTap(
          "kiss-online",
          7,
          "online"
        );
      }


      /* =============================================
         ПОЦЕЛУЙ №2

         Канцелярия.
         Нажимать нужно НЕ на печать,
         а на маленькую надпись "ДЕЙСТВУЮТ"
         в третьей карточке статистики.
      ============================================= */

      if (
        pathname === "/chancery" &&
        target.closest(
          ".chancery-stats > div:nth-child(3) small"
        )
      ) {
        countTap(
          "kiss-registry",
          6,
          "registry"
        );
      }
    }


    function clearHold() {
      if (
        holdTimerRef.current
      ) {
        window.clearTimeout(
          holdTimerRef.current
        );

        holdTimerRef.current =
          null;
      }
    }


    function handlePointerDown(
      event
    ) {
      const target =
        event.target;

      if (
        !(target instanceof Element)
      ) {
        return;
      }

      if (
        pathname !== "/home"
      ) {
        return;
      }

      const tinyNote =
        target.closest(
          ".camp-tent-inside-note"
        );

      if (!tinyNote) {
        return;
      }

      const openedTent =
        tinyNote.closest(
          ".camp-deluxe-tent.is-open"
        );

      if (!openedTent) {
        return;
      }

      clearHold();

      /* =============================================
         ПОЦЕЛУЙ №3

         Сначала надо открыть палатку.
         Потом заметить крошечную записку внутри.
         Потом УДЕРЖИВАТЬ её 1.7 секунды.
      ============================================= */

      holdTimerRef.current =
        window.setTimeout(
          () => {
            holdTimerRef.current =
              null;

            revealKiss(
              "tent"
            );
          },
          1700
        );
    }


    document.addEventListener(
      "click",
      handleClick,
      true
    );

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
      true
    );

    document.addEventListener(
      "pointerup",
      clearHold,
      true
    );

    document.addEventListener(
      "pointercancel",
      clearHold,
      true
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        true
      );

      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true
      );

      document.removeEventListener(
        "pointerup",
        clearHold,
        true
      );

      document.removeEventListener(
        "pointercancel",
        clearHold,
        true
      );

      clearHold();
    };
  }, [pathname]);


  if (!reveal) {
    return null;
  }


  const remaining =
    Math.max(
      0,
      3 - reveal.count
    );


  return (
    <div
      className={`hidden-kiss-overlay ${
        reveal.count === 3
          ? "is-final"
          : ""
      }`}
      onClick={() =>
        setReveal(null)
      }
      role="dialog"
      aria-modal="true"
      aria-live="polite"
    >
      <div
        className="hidden-kiss-burst"
        aria-hidden="true"
      >
        {Array.from({
          length:
            reveal.count === 3
              ? 18
              : 10,
        }).map((_, index) => (
          <i
            key={index}
            style={{
              "--kiss-i": index,
            }}
          >
            {index % 3 === 0
              ? "♡"
              : "·"}
          </i>
        ))}
      </div>

      <section
        className="hidden-kiss-card"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className="hidden-kiss-marks"
          aria-hidden="true"
        >
          <span>💋</span>

          {reveal.count === 3 && (
            <>
              <span>💋</span>
              <span>💋</span>
            </>
          )}
        </div>

        <small>
          {reveal.eyebrow}
        </small>

        <h2>
          {reveal.title}
        </h2>

        <p>
          {reveal.text}
        </p>

        <div className="hidden-kiss-progress">
          <b>
            {reveal.count}/3
          </b>

          <span>
            {remaining === 2
              ? "где то ещё два"
              : remaining === 1
              ? "остался ещё один"
              : "ну всё. собрала все три"}
          </span>
        </div>

        {reveal.count === 3 && (
          <strong className="hidden-kiss-final-text">
            тройной тьмок ♡
          </strong>
        )}

        <button
          type="button"
          className="hidden-kiss-close"
          onClick={() =>
            setReveal(null)
          }
        >
          ладно, забираю
        </button>
      </section>
    </div>
  );
}
