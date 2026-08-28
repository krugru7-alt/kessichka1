"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { unlockCapsule } from "../lib/unlockCapsule";

/* =====================================================
   ГЛАВНЫЕ ЗАПИСКИ
===================================================== */

const MAIN_NOTES = [
  {
    title: "ну раз уж пришла",
    text:
      "Располагайся. Палатка стоит, вода рядом, костёр вроде не погас, Дракоша никого не съел. В целом всё под контролем у обсидика",
  },
  {
    title: "оставлю это тут",
    text:
      "Никакого важного повода. Просто захотелось оставить тебе что-нибудь в этом месте. Ты прекрасна любовь моя",
  },
  {
    title: "если вокруг слишком много всего",
    text:
      "Здесь ничего не надо решать. Можно включить воду, костёр или дождь, немного  повайбить",
  },
];

/* =====================================================
   ПАСХАЛКИ
===================================================== */

const EASTER_EGGS = {
  stone: {
    type: "stone",
    icon: "●",
    eyebrow: "ПОДОЖДИ-КА...",
    title:
      "Под каким вообще предлогом ты решила тыкать на камень?",
    text:
      "держи ♡, нашла",
  },

  fire: {
    type: "fire",
    icon: "✦",
    eyebrow: "НУ КОНЕЧНО",
    title:
      "Я, конечно, не эксперт, но обычно в костёр пальцем не тыкают.",
    text:
      "Твое, нашла, молодец!",
  },

  water: {
    type: "water",
    icon: "≈",
    eyebrow: "ОЗЕРО В ШОКЕ",
    title:
      "Ты сейчас реально решила потыкать озеро?",
    text:
      "Харам к озерку ладно годится,берем зая",
  },

  mug: {
    type: "mug",
    icon: "☕",
    eyebrow: "ТАК И ЗНАЛ",
    title:
      "Ты даже походную кружку решила проверить.",
    text:
      "тьмок  твой ♡",
  },

  dragon: {
    type: "dragon",
    icon: "🐉",
    eyebrow: "НУ ВСЁ, ПОНАТЫКАЛА",
    title:
      "Дракоша официально проснулся и теперь смотрит на тебя.",
    text:
      "Он недоволен. Но передал, что жоский тьмок всё равно положен ♡",
  },

  tent: {
    type: "tent",
    icon: "△",
    eyebrow: "А ТЫ НАСТОЙЧИВАЯ",
    title:
      "Ты ещё и палатку несколько раз проверила?",
    text:
      "Ладно, заходи уже. Там тепло. я знал, что ты начнёшь тыкать вообще во всё.",
  },

  backpack: {
    type: "backpack",
    icon: "▣",
    eyebrow: "ВОТ ЭТО ВОСПИТАНИЕ",
    title:
      "Чужие рюкзаки вообще-то не трогаю но тебе можно",
    text:
      "Да-да нашла",
  },

  star: {
    type: "star",
    icon: "✦",
    eyebrow: "ЧЕГО",
    title:
      "Из всех звёзд ты умудрилась ткнуть в красивую",
    text:
      "Красота чует красоту, я понял",
  },

  firefly: {
    type: "firefly",
    icon: "✧",
    eyebrow: "ПОЙМАЛА",
    title:
      "Ты ещё и по светлячкам тыкаешь?",
    text:
      "Он вообще-то летел по своим делам.",
  },

  lantern: {
    type: "lantern",
    icon: "◈",
    eyebrow: "ЩЁЛК-ЩЁЛК-ЩЁЛК",
    title:
      "Лапаем все предметы, запишем",
    text:
      "Четыре раза проверить свет...",
  },

  guitar: {
    type: "guitar",
    icon: "♪",
    eyebrow: "РУКИ ПРОЧЬ ОТ ИНСТРУМЕНТА",
    title:
      "Ты ещё и гитару решила потрогать?)",
    text:
      "Играть она всё равно не умеет. Я тоже. ",
  },

  jar: {
    type: "jar",
    icon: "✧",
    eyebrow: "НУ ВСЁ",
    title:
      "Ты добралась даже до светлячков...",
    text:
      "непроверенных предметов здесь не останется.",
  },
};

const CAPSULE_BY_EGG_TYPE = {
  stone: "camp-stone",
  dragon: "camp-dragon",
  star: "camp-star",
  tent: "camp-tent",
  firefly: "camp-firefly",
};

const DRAGON_REPLIES = [
  "zZ",
  "м?",
  "👀",
  "...",
  "я спал",
  "чего тыкаемся"
  "ничего не делал",
  "ну опять",
];

/* =====================================================
   МИНСК + ПОГОДА
===================================================== */

function getMinskInfo(date = new Date()) {
  const time = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Minsk",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Minsk",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date)
  );

  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return { time, hour, dateKey };
}

function getPhase(hour) {
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 18) return "day";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
}

function weatherLabel(code) {
  if (code === 0) return "ясно";
  if (code >= 1 && code <= 3) return "облачно";
  if (code >= 45 && code <= 48) return "туман";
  if (code >= 51 && code <= 67) return "дождь";
  if (code >= 71 && code <= 77) return "снег";
  if (code >= 80 && code <= 82) return "ливень";
  if (code >= 85 && code <= 86) return "снегопад";
  if (code >= 95) return "гроза";
  return "Минск";
}

function weatherIsRainy(code) {
  return (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    code >= 95
  );
}

/* =====================================================
   АТМОСФЕРНЫЕ ЗВУКИ
===================================================== */

function createNoiseBuffer(context, seconds, generator) {
  const buffer = context.createBuffer(
    2,
    context.sampleRate * seconds,
    context.sampleRate
  );

  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let last = 0;

    for (let i = 0; i < data.length; i++) {
      const result = generator({
        i,
        last,
        sampleRate: context.sampleRate,
      });

      data[i] = result.value;
      last = result.last;
    }
  }

  return buffer;
}

function createAmbient(type, volume = 0.45) {
  const AudioContext =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) return null;

  const context = new AudioContext();
  const master = context.createGain();

  master.gain.value = 0.035 + volume * 0.18;
  master.connect(context.destination);

  const sources = [];

  if (type === "water") {
    const buffer = createNoiseBuffer(context, 8, ({ last }) => {
      const white = Math.random() * 2 - 1;
      const next = last * 0.95 + white * 0.05;

      return {
        value: next * 0.72,
        last: next,
      };
    });

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const low = context.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 1750;

    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 170;

    source.connect(low);
    low.connect(high);
    high.connect(master);
    source.start();
    sources.push(source);
  }

  if (type === "fire") {
    const buffer = createNoiseBuffer(context, 8, ({ last }) => {
      const noise = Math.random() * 2 - 1;
      let crack = noise * 0.08;

      if (Math.random() > 0.992) {
        crack += (Math.random() * 2 - 1) * 1.9;
      }

      const next = last * 0.67 + crack * 0.33;

      return {
        value: next,
        last: next,
      };
    });

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1950;

    source.connect(filter);
    filter.connect(master);
    source.start();
    sources.push(source);
  }

  if (type === "night") {
    const buffer = createNoiseBuffer(context, 9, ({ last }) => {
      const white = Math.random() * 2 - 1;
      const next = last * 0.972 + white * 0.028;

      return {
        value: next * 0.42,
        last: next,
      };
    });

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;

    source.connect(filter);
    filter.connect(master);
    source.start();
    sources.push(source);
  }

  if (type === "rain") {
    const buffer = createNoiseBuffer(context, 7, ({ last }) => {
      const white = Math.random() * 2 - 1;
      const next = last * 0.86 + white * 0.14;

      return {
        value: next * 0.78,
        last: next,
      };
    });

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const low = context.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 4300;

    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 145;

    source.connect(low);
    low.connect(high);
    high.connect(master);
    source.start();
    sources.push(source);
  }

  return {
    context,
    master,
    sources,
  };
}

/* =====================================================
   PAGE
===================================================== */

export default function HomeRoomPage() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [openedNote, setOpenedNote] = useState(null);
  const [easterEgg, setEasterEgg] = useState(null);
  const [dragonText, setDragonText] = useState("zZ");
  const [activeSounds, setActiveSounds] = useState({
    water: false,
    fire: false,
    night: false,
    rain: false,
  });
  const [volume, setVolume] = useState(0.45);
  const [tentOpen, setTentOpen] = useState(false);
  const [dragonSpot, setDragonSpot] = useState("bed");
  const [lakeRipples, setLakeRipples] = useState([]);

  const ambientRef = useRef(new Map());
  const tapRef = useRef({
    dragon: 0,
    mug: 0,
    fire: 0,
    water: 0,
    tent: 0,
    lantern: 0,
    guitar: 0,
  });
  const dragonTimerRef = useRef(null);
  const easterTimerRef = useRef(null);

  const minsk = getMinskInfo(now);
  const phase = getPhase(minsk.hour);

  const mainNote = useMemo(() => {
    const seed =
      Number(minsk.dateKey.replace(/\D/g, "")) +
      minsk.hour;

    return MAIN_NOTES[seed % MAIN_NOTES.length];
  }, [minsk.dateKey, minsk.hour]);

  const realRain = weatherIsRainy(
    Number(weather?.weatherCode)
  );

  const showRain =
    activeSounds.rain ||
    realRain;

  /* ===================================================
     ЧАСЫ
  =================================================== */

  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(new Date()),
      30000
    );

    return () => window.clearInterval(timer);
  }, []);

  /* ===================================================
     ПОГОДА
  =================================================== */

  useEffect(() => {
    let active = true;

    async function loadWeather() {
      try {
        const response = await fetch("/api/weather", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (active) {
          setWeather(data);
        }
      } catch (error) {
        console.warn("HOME WEATHER:", error);
      }
    }

    loadWeather();

    const timer = window.setInterval(
      loadWeather,
      10 * 60 * 1000
    );

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  /* ===================================================
     ГРОМКОСТЬ
  =================================================== */

  useEffect(() => {
    for (const ambient of ambientRef.current.values()) {
      try {
        ambient.master.gain.value =
          0.035 + volume * 0.18;
      } catch {}
    }
  }, [volume]);

  /* ===================================================
     ЗВУКИ — МОЖНО МИКСОВАТЬ
  =================================================== */

  async function stopAmbient(type) {
    const ambient = ambientRef.current.get(type);

    if (!ambient) return;

    for (const source of ambient.sources) {
      try {
        source.stop();
      } catch {}
    }

    try {
      await ambient.context.close();
    } catch {}

    ambientRef.current.delete(type);

    setActiveSounds((current) => ({
      ...current,
      [type]: false,
    }));
  }

  async function toggleAmbient(type) {
    if (ambientRef.current.has(type)) {
      await stopAmbient(type);
      return;
    }

    try {
      const ambient = createAmbient(type, volume);

      if (!ambient) return;

      if (ambient.context.state === "suspended") {
        await ambient.context.resume();
      }

      ambientRef.current.set(type, ambient);

      setActiveSounds((current) => ({
        ...current,
        [type]: true,
      }));
    } catch (error) {
      console.error("AMBIENT:", error);
    }
  }

  /* ===================================================
     FULLSCREEN ПАСХАЛКИ
  =================================================== */

  function showEasterEgg(data) {
    const capsuleId = CAPSULE_BY_EGG_TYPE[data?.type];

    if (capsuleId) {
      unlockCapsule(capsuleId);
    }

    if (easterTimerRef.current) {
      window.clearTimeout(easterTimerRef.current);
    }

    setEasterEgg(data);

    easterTimerRef.current = window.setTimeout(() => {
      setEasterEgg(null);
    }, 6000);
  }

  function closeEasterEgg() {
    if (easterTimerRef.current) {
      window.clearTimeout(easterTimerRef.current);
      easterTimerRef.current = null;
    }

    setEasterEgg(null);
  }

  /* ===================================================
     КЛИКИ ПО ПРЕДМЕТАМ
  =================================================== */

  function tapCounter(key, target, egg) {
    const next =
      (tapRef.current[key] || 0) + 1;

    tapRef.current[key] = next;

    if (next >= target) {
      tapRef.current[key] = 0;
      showEasterEgg(egg);
      return true;
    }

    return false;
  }

  function tapWater(event) {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const id = `${Date.now()}-${Math.random()}`;

    setLakeRipples((current) => [
      ...current.slice(-5),
      { id, x, y },
    ]);

    window.setTimeout(() => {
      setLakeRipples((current) =>
        current.filter((item) => item.id !== id)
      );
    }, 1600);

    tapCounter(
      "water",
      4,
      EASTER_EGGS.water
    );
  }

  function tapTent() {
    setTentOpen((current) => !current);

    tapCounter(
      "tent",
      3,
      EASTER_EGGS.tent
    );
  }

  function tapDragon() {
    const nextTap = (tapRef.current.dragon || 0) + 1;

    if (nextTap === 1) {
      setDragonSpot("awake");
    } else if (nextTap === 2) {
      setDragonSpot("fire");
    } else if (nextTap === 3) {
      setDragonSpot("tent");
    } else if (nextTap === 4) {
      setDragonSpot("bed");
    }

    const found = tapCounter(
      "dragon",
      5,
      EASTER_EGGS.dragon
    );

    if (!found) {
      setDragonText(
        DRAGON_REPLIES[
          Math.floor(
            Math.random() *
              DRAGON_REPLIES.length
          )
        ]
      );
    } else {
      setDragonText("ну всё...");
      setDragonSpot("tent");
    }

    if (dragonTimerRef.current) {
      window.clearTimeout(
        dragonTimerRef.current
      );
    }

    dragonTimerRef.current =
      window.setTimeout(() => {
        setDragonText("zZ");
      }, 2500);
  }

  /* ===================================================
     CLEANUP
  =================================================== */

  useEffect(() => {
    return () => {
      for (const ambient of ambientRef.current.values()) {
        for (const source of ambient.sources) {
          try {
            source.stop();
          } catch {}
        }

        try {
          ambient.context.close();
        } catch {}
      }

      ambientRef.current.clear();

      if (dragonTimerRef.current) {
        window.clearTimeout(
          dragonTimerRef.current
        );
      }

      if (easterTimerRef.current) {
        window.clearTimeout(
          easterTimerRef.current
        );
      }
    };
  }, []);

  function particleFor(type) {
    if (type === "fire") return "✦";
    if (type === "water") return "·";
    if (type === "dragon") return "♡";
    if (type === "firefly" || type === "jar") return "✧";
    if (type === "guitar") return "♪";
    return "✦";
  }

  return (
    <div
      className={`
        camp-home-page
        camp-deluxe
        camp-home-${phase}
        ${activeSounds.fire ? "camp-sound-fire" : ""}
        ${activeSounds.water ? "camp-sound-water" : ""}
        ${activeSounds.night ? "camp-sound-night" : ""}
        ${showRain ? "camp-raining" : ""}
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="camp-home-header camp-deluxe-header">
        <div>
          <small>
            Минск · {minsk.time}

            {weather && (
              <>
                {" · "}
                {Math.round(weather.temperature)}°
                {" · "}
                {weatherLabel(
                  Number(weather.weatherCode)
                )}
              </>
            )}
          </small>

          <h1>Домой</h1>

          <p>
            можешь немного исчезнуть отсюда
          </p>
        </div>

        <span>♡</span>
      </section>

      {/* =================================================
          ЛАГЕРЬ
      ================================================= */}

      <section className="camp-home-scene camp-deluxe-scene">
        {/* ВЕТКИ НА ПЕРЕДНЕМ ПЛАНЕ */}
        <div className="camp-deluxe-branch branch-left" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </div>

        <div className="camp-deluxe-branch branch-right" aria-hidden="true">
          <i /><i /><i /><i />
        </div>

        {/* НЕБО */}
        <div className="camp-home-sky camp-deluxe-sky">
          {Array.from({ length: 22 }).map((_, index) => (
            <i
              key={`star-${index}`}
              className={`camp-deluxe-star star-${index + 1}`}
            />
          ))}

          <button
            type="button"
            className="camp-secret-star camp-deluxe-secret-star"
            onClick={() =>
              showEasterEgg(EASTER_EGGS.star)
            }
            aria-label="Звезда"
          >
            ✦
          </button>

          <span className="camp-home-moon camp-deluxe-moon" />
        </div>

        {/* ГОРЫ */}
        <div className="camp-deluxe-mountains far" aria-hidden="true">
          <i /><i /><i />
        </div>

        <div className="camp-deluxe-mountains near" aria-hidden="true">
          <i /><i /><i /><i />
        </div>

        {/* ЛЕС */}
        <div className="camp-home-forest back">
          {Array.from({ length: 13 }).map((_, index) => (
            <i key={`back-${index}`} />
          ))}
        </div>

        <div className="camp-home-forest front">
          {Array.from({ length: 10 }).map((_, index) => (
            <i key={`front-${index}`} />
          ))}
        </div>

        {/* ОЗЕРО */}
        <button
          type="button"
          className="camp-home-lake camp-deluxe-lake"
          onClick={tapWater}
          aria-label="Озеро"
        >
          <span className="camp-water-line w1" />
          <span className="camp-water-line w2" />
          <span className="camp-water-line w3" />
          <span className="camp-water-line w4" />
          <span className="camp-water-line w5" />
          <span className="camp-water-line w6" />
          <span className="camp-moon-reflection" />
          <span className="camp-deluxe-shimmer shimmer-one" />
          <span className="camp-deluxe-shimmer shimmer-two" />

          {lakeRipples.map((ripple) => (
            <span
              key={ripple.id}
              className="camp-lake-ripple"
              style={{
                left: `${ripple.x}%`,
                top: `${ripple.y}%`,
              }}
            />
          ))}
        </button>

        <div className="camp-home-shore camp-deluxe-shore" />

        {/* ФОНАРЬ */}
        <button
          type="button"
          className="camp-deluxe-lantern"
          onClick={() =>
            tapCounter(
              "lantern",
              4,
              EASTER_EGGS.lantern
            )
          }
          aria-label="Фонарь"
        >
          <span className="lantern-top" />
          <span className="lantern-glass" />
          <span className="lantern-flame" />
          <span className="lantern-base" />
        </button>

        {/* ПАЛАТКА */}
        <button
          type="button"
          className={`camp-home-tent camp-deluxe-tent ${
            tentOpen ? "is-open" : ""
          }`}
          onClick={tapTent}
          aria-label="Палатка"
        >
          <span className="camp-tent-shadow" />
          <span className="camp-tent-body" />
          <span className="camp-tent-side" />
          <span className="camp-tent-door" />
          <span className="camp-tent-light" />

          <span className="camp-tent-inside" aria-hidden="true">
            <i className="camp-tent-pillow" />
            <i className="camp-tent-blanket" />
            <i className="camp-tent-inside-note">ну раз открыла — заходи</i>
          </span>

          <span className="camp-tent-rope rope-left" />
          <span className="camp-tent-rope rope-right" />
          <span className="camp-tent-bulbs">
            <i /><i /><i /><i /><i /><i />
          </span>
        </button>

        {/* ГИТАРА */}
        <button
          type="button"
          className="camp-deluxe-guitar"
          onClick={() =>
            tapCounter(
              "guitar",
              2,
              EASTER_EGGS.guitar
            )
          }
          aria-label="Гитара"
        >
          <span className="guitar-body" />
          <span className="guitar-hole" />
          <span className="guitar-neck" />
          <span className="guitar-head" />
        </button>

        {/* РЮКЗАК */}
        <button
          type="button"
          className="camp-home-backpack camp-deluxe-backpack"
          onClick={() =>
            showEasterEgg(
              EASTER_EGGS.backpack
            )
          }
          aria-label="Рюкзак"
        >
          <span />
          <i />
        </button>

        {/* КАМЕНЬ */}
        <button
          type="button"
          className="camp-home-stone camp-deluxe-stone"
          onClick={() =>
            showEasterEgg(EASTER_EGGS.stone)
          }
          aria-label="Камень"
        />

        {/* КОСТЁР */}
        <button
          type="button"
          className="camp-home-fire camp-deluxe-fire"
          onClick={() =>
            tapCounter(
              "fire",
              4,
              EASTER_EGGS.fire
            )
          }
          aria-label="Костёр"
        >
          <span className="camp-fire-glow" />
          <span className="camp-fire-ring">
            <i /><i /><i /><i /><i /><i /><i /><i />
          </span>
          <span className="camp-fire-flame flame-one" />
          <span className="camp-fire-flame flame-two" />
          <span className="camp-fire-flame flame-three" />
          <span className="camp-fire-log log-one" />
          <span className="camp-fire-log log-two" />
          <span className="camp-fire-sparks">
            <i /><i /><i /><i /><i />
          </span>
        </button>

        {/* ДВЕ ПОХОДНЫЕ КРУЖКИ */}
        <div className="camp-home-mugs camp-deluxe-mugs">
          <button
            type="button"
            className="camp-mug camp-mug-dark"
            aria-label="Походная кружка"
          >
            <span className="camp-mug-mark">⌁</span>
          </button>

          <button
            type="button"
            className="camp-mug camp-mug-warm"
            onClick={() =>
              tapCounter(
                "mug",
                3,
                EASTER_EGGS.mug
              )
            }
            aria-label="Походная кружка"
          >
            <span className="camp-mug-mark">♡</span>
          </button>
        </div>

        {/* ВИДИМАЯ ЗАПИСКА */}
        <button
          type="button"
          className="camp-home-note camp-deluxe-note"
          onClick={() => setOpenedNote(mainNote)}
        >
          <small>для тебя</small>
          <b>ну раз уж пришла</b>
          <span>открыть →</span>
        </button>

        {/* ДРАКОША */}
        <div className="camp-deluxe-dragon-blanket" aria-hidden="true" />

        <button
          type="button"
          className={`camp-home-dragon camp-deluxe-dragon camp-dragon-${dragonSpot}`}
          onClick={tapDragon}
          aria-label="Дракоша"
        >
          <img
            src="/drakosha.png"
            alt="Дракоша"
          />
          <span>{dragonText}</span>
        </button>

        {/* БАНКА СО СВЕТЛЯЧКАМИ */}
        <button
          type="button"
          className="camp-deluxe-jar"
          onClick={() =>
            showEasterEgg(EASTER_EGGS.jar)
          }
          aria-label="светлячки"
        >
          <span className="jar-lid" />
          <span className="jar-body">
            <i /><i /><i /><i /><i />
          </span>
        </button>

        {/* ЛЕТАЮЩИЙ СВЕТЛЯЧОК */}
        <button
          type="button"
          className="camp-home-firefly camp-deluxe-firefly"
          onClick={() =>
            showEasterEgg(
              EASTER_EGGS.firefly
            )
          }
          aria-label="Светлячок"
        />

        {/* ДОЖДЬ */}
        {showRain && (
          <div className="camp-home-rain" aria-hidden="true">
            {Array.from({ length: 38 }).map((_, index) => (
              <i
                key={index}
                style={{
                  left: `${(index * 37) % 100}%`,
                  animationDelay: `${
                    (index % 11) * -0.13
                  }s`,
                  animationDuration: `${
                    1.05 +
                    (index % 5) * 0.16
                  }s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="camp-deluxe-vignette" aria-hidden="true" />
      </section>

      {/* =================================================
          АТМОСФЕРА
      ================================================= */}

      <section className="camp-deluxe-ambient-wrap">
        <div className="camp-deluxe-ambient-head">
          <div>
            <small>АТМОСФЕРА</small>
            <b>включай сколько хочешь</b>
          </div>

          <span>
            звук сам не включится
          </span>
        </div>

        <div className="camp-home-ambient camp-deluxe-ambient">
          <button
            type="button"
            className={activeSounds.water ? "active" : ""}
            onClick={() => toggleAmbient("water")}
          >
            <span>≋</span>
            <div>
              <b>вода</b>
              <small>
                {activeSounds.water ? "шумит" : "включить"}
              </small>
            </div>
          </button>

          <button
            type="button"
            className={activeSounds.fire ? "active" : ""}
            onClick={() => toggleAmbient("fire")}
          >
            <span>✦</span>
            <div>
              <b>костёр</b>
              <small>
                {activeSounds.fire ? "трещит" : "включить"}
              </small>
            </div>
          </button>

          <button
            type="button"
            className={activeSounds.night ? "active" : ""}
            onClick={() => toggleAmbient("night")}
          >
            <span>☾</span>
            <div>
              <b>ночь</b>
              <small>
                {activeSounds.night ? "тихо" : "включить"}
              </small>
            </div>
          </button>

          <button
            type="button"
            className={activeSounds.rain ? "active" : ""}
            onClick={() => toggleAmbient("rain")}
          >
            <span>☂</span>
            <div>
              <b>дождь</b>
              <small>
                {activeSounds.rain ? "идёт" : "включить"}
              </small>
            </div>
          </button>
        </div>

        <label className="camp-deluxe-volume">
          <span>тише</span>

          <input
            type="range"
            min="0.08"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) =>
              setVolume(
                Number(event.target.value)
              )
            }
          />

          <span>громче</span>
        </label>
      </section>

      <p className="camp-home-bottom camp-deluxe-bottom">
        тут ещё много чего спрятано · ищи 
      </p>

      {/* =================================================
          ОБЫЧНАЯ ЗАПИСКА
      ================================================= */}

      {openedNote && (
        <div
          className="camp-note-overlay"
          onClick={() => setOpenedNote(null)}
        >
          <article
            className="camp-note-paper camp-deluxe-note-paper"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="camp-note-close"
              onClick={() => setOpenedNote(null)}
            >
              ×
            </button>

            <small>для кэссички</small>
            <h2>{openedNote.title}</h2>
            <p>{openedNote.text}</p>
            <span>— обсидик</span>
          </article>
        </div>
      )}

      {/* =================================================
          FULLSCREEN ПАСХАЛКА
      ================================================= */}

      {easterEgg && (
        <div
          className={`camp-easter-overlay camp-easter-${easterEgg.type}`}
          onClick={closeEasterEgg}
        >
          <div
            className="camp-easter-particles"
            aria-hidden="true"
          >
            {Array.from({ length: 22 }).map((_, index) => (
              <i
                key={index}
                style={{ "--i": index }}
              >
                {particleFor(easterEgg.type)}
              </i>
            ))}
          </div>

          <div
            className="camp-easter-content"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="camp-easter-icon">
              {easterEgg.icon}
            </span>

            <small>{easterEgg.eyebrow}</small>
            <h2>{easterEgg.title}</h2>
            <p>{easterEgg.text}</p>

            <button
              type="button"
              className="camp-easter-close"
              onClick={closeEasterEgg}
            >
              ладно, поняла
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
