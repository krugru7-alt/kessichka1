"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";
import {
  CAPSULES,
  getCapsuleById,
} from "../lib/capsuleCatalog";
import { unlockCapsule } from "../lib/unlockCapsule";

export default function CapsuleSystem() {
  const pathname = usePathname();

  const [unlocked, setUnlocked] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [revealing, setRevealing] = useState(null);
  const [revealMode, setRevealMode] = useState("new");
  const [loading, setLoading] = useState(true);

  const unlockedRef = useRef(new Set());
  const revealQueueRef = useRef([]);
  const tapRef = useRef({});

  const unlockedSet = useMemo(
    () => new Set(unlocked),
    [unlocked]
  );

  useEffect(() => {
    unlockedRef.current = unlockedSet;
  }, [unlockedSet]);

  /* =====================================================
     ЗАГРУЗКА ПРОГРЕССА
  ===================================================== */

  useEffect(() => {
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadProgress() {
      try {
        const response = await fetch("/api/capsules", {
          cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok || !active) {
          return;
        }

        const ids = Array.isArray(data.unlocked)
          ? data.unlocked.map((item) => item.id)
          : [];

        setUnlocked(ids);
      } catch (error) {
        console.warn("CAPSULES LOAD:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, [pathname]);

  /* =====================================================
     НОВАЯ КАПСУЛА ИЗ ЛЮБОЙ ЧАСТИ ПРОЕКТА
  ===================================================== */

  useEffect(() => {
    function handleUnlocked(event) {
      const id = event?.detail?.id;
      const capsule = getCapsuleById(id);

      if (!capsule) return;

      setUnlocked((current) =>
        current.includes(id)
          ? current
          : [...current, id]
      );

      revealQueueRef.current.push(capsule);

      setRevealing((current) => {
        if (current) return current;

        const next = revealQueueRef.current.shift() || null;

        if (next) {
          setRevealMode("new");
        }

        return next;
      });
    }

    window.addEventListener(
      "our-world-capsule-unlocked",
      handleUnlocked
    );

    return () => {
      window.removeEventListener(
        "our-world-capsule-unlocked",
        handleUnlocked
      );
    };
  }, []);

  /* =====================================================
     ГЛОБАЛЬНЫЕ ПАСХАЛКИ

     Благодаря этому не надо лезть в каждую страницу.
     Система слушает клики по уже существующим элементам.
  ===================================================== */

  useEffect(() => {
    if (pathname === "/login") return;

    function countTap(key, target, capsuleId) {
      if (unlockedRef.current.has(capsuleId)) {
        return;
      }

      const next = (tapRef.current[key] || 0) + 1;
      tapRef.current[key] = next;

      if (next >= target) {
        tapRef.current[key] = 0;
        unlockCapsule(capsuleId);
      }
    }

    function handleDocumentClick(event) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(".brand-heart")) {
        countTap("brand-heart", 7, "site-heart");
      }

      if (target.closest(".theme-toggle")) {
        countTap("theme-toggle", 7, "site-light");
      }

      if (target.closest(".home-signature")) {
        countTap("home-signature", 5, "home-signature");
      }

      if (target.closest(".chancery-big-stamp")) {
        countTap("chancery-stamp", 5, "chancery-stamp");
      }

      if (target.closest(".mini-messages-head > span")) {
        countTap("mini-heart", 5, "mini-heart");
      }

      const homeLink = target.closest('a[href="/home"]');

      if (homeLink && pathname === "/home") {
        countTap("home-nav", 5, "home-nav");
      }
    }

    document.addEventListener(
      "click",
      handleDocumentClick,
      true
    );

    return () => {
      document.removeEventListener(
        "click",
        handleDocumentClick,
        true
      );
    };
  }, [pathname]);

  function closeReveal() {
    const next = revealQueueRef.current.shift() || null;

    if (next) {
      setRevealMode("new");
      setRevealing(next);
      return;
    }

    setRevealing(null);
  }

  function openCollectedCapsule(capsule) {
    setRevealMode("collection");
    setRevealing(capsule);
    setDrawerOpen(false);
  }

  if (pathname === "/login") {
    return null;
  }

  return (
    <>
      {/* ===============================================
          МАЛЕНЬКАЯ КНОПКА КОЛЛЕКЦИИ
      =============================================== */}

      <button
        type="button"
        className="capsule-dock"
        onClick={() => setDrawerOpen(true)}
        aria-label="Открыть капсулы"
      >
        <span>◉</span>

        <b>
          {loading ? "…" : `${unlocked.length}/${CAPSULES.length}`}
        </b>
      </button>

      {/* ===============================================
          КОЛЛЕКЦИЯ
      =============================================== */}

      {drawerOpen && (
        <div
          className="capsule-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        >
          <section
            className="capsule-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="capsule-drawer-head">
              <div>
                <small>НАШ МИРОК</small>
                <h2>Закрытые капсулки</h2>
                <p>
                  Они открываются сами, когда ты находишь странности по сайту.
                  Специально искать вообще не обязательно. Но я же знаю, что ты будешь.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </header>

            <div className="capsule-progress-line">
              <span
                style={{
                  width: `${(unlocked.length / CAPSULES.length) * 100}%`,
                }}
              />
            </div>

            <div className="capsule-grid">
              {CAPSULES.map((capsule) => {
                const isUnlocked = unlockedSet.has(capsule.id);

                return (
                  <button
                    key={capsule.id}
                    type="button"
                    className={`capsule-card ${
                      isUnlocked ? "is-unlocked" : "is-locked"
                    }`}
                    disabled={!isUnlocked}
                    onClick={() =>
                      isUnlocked && openCollectedCapsule(capsule)
                    }
                  >
                    <span className="capsule-card-number">
                      {String(capsule.number).padStart(2, "0")}
                    </span>

                    <span className="capsule-card-shell">
                      <i />
                      <b>{isUnlocked ? capsule.icon : "?"}</b>
                    </span>

                    <strong>
                      {isUnlocked ? capsule.title : "закрыто"}
                    </strong>

                    <small>
                      {isUnlocked ? "открыть снова" : capsule.hint}
                    </small>
                  </button>
                );
              })}
            </div>

            <p className="capsule-drawer-bottom">
              {unlocked.length === CAPSULES.length
                ? "ну всё. ты реально нашла их все."
                : "где-то ещё что-то подозрительно кликабельное…"}
            </p>
          </section>
        </div>
      )}

      {/* ===============================================
          ПОЛНОЭКРАННОЕ ОТКРЫТИЕ КАПСУЛЫ
      =============================================== */}

      {revealing && (
        <div className="capsule-reveal-overlay">
          <div className="capsule-reveal-particles" aria-hidden="true">
            {Array.from({ length: 22 }).map((_, index) => (
              <i
                key={index}
                style={{ "--capsule-i": index }}
              >
                ✦
              </i>
            ))}
          </div>

          <section className="capsule-reveal-card">
            <div
              className={`capsule-opening ${
                revealMode === "new" ? "is-new" : "is-open"
              }`}
              aria-hidden="true"
            >
              <span className="capsule-half capsule-half-top" />
              <span className="capsule-half capsule-half-bottom" />
              <i className="capsule-core">{revealing.icon}</i>
            </div>

            <small>
              {revealMode === "new"
                ? `КАПСУЛА ${String(revealing.number).padStart(2, "0")} ОТКРЫТА`
                : `КАПСУЛА ${String(revealing.number).padStart(2, "0")}`}
            </small>

            <h2>{revealing.title}</h2>
            <p>{revealing.text}</p>

            <button
              type="button"
              onClick={closeReveal}
            >
              {revealMode === "new"
                ? "положить в коллекцию"
                : "закрыть"}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
