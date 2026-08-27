"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =====================================================
   ГЛАВНЫЕ ЗАПИСКИ
===================================================== */

const MAIN_NOTES = [
  {
    title: "оставлю это здесь",
    text:
      "Никакого важного повода. Просто захотелось оставить тебе что-то в этом месте. Можешь прочитать сейчас, потом или вообще случайно через неделю.",
  },
  {
    title: "если вокруг слишком много всего",
    text:
      "Тут можно ничего не решать и никуда не спешить. Посиди минутку, послушай воду или костёр — и беги дальше по своим делам.",
  },
  {
    title: "ну раз уж пришла",
    text:
      "Располагайся. Палатка стоит, вода рядом, Дракоша вроде никого не съел. В целом всё под контролем.",
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
      "Я специально положил обычный камень. Ты всё равно его проверила. Ладно, раз нашла — держи ♡",
  },

  fire: {
    type: "fire",
    icon: "✦",
    eyebrow: "НУ КОНЕЧНО",
    title:
      "Я, конечно, не эксперт, но обычно в костёр пальцем не тыкают.",
    text:
      "Но ты решила проверить. Секрет твой. Только Дракоше не говори.",
  },

  water: {
    type: "water",
    icon: "≈",
    eyebrow: "ОЗЕРО В ШОКЕ",
    title:
      "Ты сейчас реально решила потыкать озеро?",
    text:
      "Поздравляю. Вода официально потревожена, а ты что-то нашла.",
  },

  mug: {
    type: "mug",
    icon: "☕",
    eyebrow: "ТАК И ЗНАЛ",
    title:
      "Ты даже походную кружку решила проверить.",
    text:
      "Ну раз понатыкала и нашла — один маленький тьмок теперь твой ♡",
  },

  dragon: {
    type: "dragon",
    icon: "🐉",
    eyebrow: "НУ ВСЁ, ПОНАТЫКАЛА",
    title:
      "Дракоша официально проснулся и теперь смотрит на тебя.",
    text:
      "Он недоволен. Но передал, что тьмок всё равно положен ♡",
  },

  tent: {
    type: "tent",
    icon: "△",
    eyebrow: "А ТЫ НАСТОЙЧИВАЯ",
    title:
      "Ты ещё и палатку несколько раз проверила?",
    text:
      "Ладно, заходи уже. Всё равно поняла, что она не просто декорация.",
  },

  backpack: {
    type: "backpack",
    icon: "⌁",
    eyebrow: "ВОТ ЭТО ВОСПИТАНИЕ",
    title:
      "Чужие рюкзаки вообще-то не открывают.",
    text:
      "Но уже поздно. Ты залезла. Теперь секрет твой.",
  },

  star: {
    type: "star",
    icon: "✦",
    eyebrow: "ЧЕГООО",
    title:
      "Из всех звёзд ты умудрилась ткнуть именно в нужную.",
    text:
      "Я был почти уверен, что эту никто не найдёт. Подозрительно.",
  },

  firefly: {
    type: "firefly",
    icon: "·",
    eyebrow: "ПОЙМАЛА",
    title:
      "Ты ещё и по светлячкам тыкаешь?",
    text:
      "Он вообще-то летел по своим делам. Но ладно — нашла так нашла.",
  },
};

const DRAGON_REPLIES = [
  "zZ",
  "м?",
  "👀",
  "...",
  "я спал",
  "чего тыкаемся",
  "я отдыхаю вообще-то",
  "ничего не делал",
];

/* =====================================================
   МИНСК
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

  return { time, hour };
}

function getPhase(hour) {
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 18) return "day";
  if (hour >= 18 && hour < 23) return "evening";
  return "night";
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
      const result = generator({ i, last, sampleRate: context.sampleRate });
      data[i] = result.value;
      last = result.last;
    }
  }

  return buffer;
}

function createAmbient(type) {
  const AudioContext =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) return null;

  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0.14;
  master.connect(context.destination);

  const sources = [];

  if (type === "water") {
    const buffer = createNoiseBuffer(context, 7, ({ last }) => {
      const white = Math.random() * 2 - 1;
      const next = last * 0.94 + white * 0.06;
      return { value: next * 0.72, last: next };
    });

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const low = context.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 1700;

    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 180;

    source.connect(low);
    low.connect(high);
    high.connect(master);
    source.start();
    sources.push(source);
  }

  if (type === "fire") {
    const buffer = createNoiseBuffer(context, 7, ({ last }) => {
      const noise = Math.random() * 2 - 1;
      let crack = noise * 0.08;

      if (Math.random() > 0.992) {
        crack += (Math.random() * 2 - 1) * 1.8;
      }

      const next = last * 0.67 + crack * 0.33;
      return { value: next, last: next };
    });

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1900;

    source.connect(filter);
    filter.connect(master);
    source.start();
    sources.push(source);
  }

  if (type === "night") {
    const buffer = createNoiseBuffer(context, 8, ({ last }) => {
      const white = Math.random() * 2 - 1;
      const next = last * 0.97 + white * 0.03;
      return { value: next * 0.45, last: next };
    });

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 760;

    const gain = context.createGain();
    gain.gain.value = 0.65;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start();
    sources.push(source);
  }

  if (type === "rain") {
    const buffer = createNoiseBuffer(context, 6, ({ last }) => {
      const white = Math.random() * 2 - 1;
      const next = last * 0.86 + white * 0.14;
      return { value: next * 0.78, last: next };
    });

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const low = context.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 4200;

    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 150;

    source.connect(low);
    low.connect(high);
    high.connect(master);
    source.start();
    sources.push(source);
  }

  return { context, sources };
}

/* =====================================================
   PAGE
===================================================== */

export default function HomeRoomPage() {
  const [now, setNow] = useState(new Date());
  const [activeSound, setActiveSound] = useState(null);
  const [openedNote, setOpenedNote] = useState(null);
  const [easterEgg, setEasterEgg] = useState(null);
  const [dragonText, setDragonText] = useState("zZ");

  const [dragonTaps, setDragonTaps] = useState(0);
  const [mugTaps, setMugTaps] = useState(0);
  const [fireTaps, setFireTaps] = useState(0);
  const [waterTaps, setWaterTaps] = useState(0);
  const [tentTaps, setTentTaps] = useState(0);

  const ambientRef = useRef(null);
  const dragonTimerRef = useRef(null);
  const easterTimerRef = useRef(null);

  const minsk = getMinskInfo(now);
  const phase = getPhase(minsk.hour);

  const mainNote = useMemo(
    () => MAIN_NOTES[Math.floor(Math.random() * MAIN_NOTES.length)],
    []
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function stopAmbient() {
    if (!ambientRef.current) return;

    for (const source of ambientRef.current.sources) {
      try {
        source.stop();
      } catch {}
    }

    try {
      await ambientRef.current.context.close();
    } catch {}

    ambientRef.current = null;
    setActiveSound(null);
  }

  async function toggleAmbient(type) {
    if (activeSound === type) {
      await stopAmbient();
      return;
    }

    await stopAmbient();

    try {
      const ambient = createAmbient(type);
      if (!ambient) return;

      if (ambient.context.state === "suspended") {
        await ambient.context.resume();
      }

      ambientRef.current = ambient;
      setActiveSound(type);
    } catch (error) {
      console.error("AMBIENT:", error);
    }
  }

  function showEasterEgg(data) {
    if (easterTimerRef.current) {
      window.clearTimeout(easterTimerRef.current);
    }

    setEasterEgg(data);

    easterTimerRef.current = window.setTimeout(() => {
      setEasterEgg(null);
    }, 5200);
  }

  function closeEasterEgg() {
    if (easterTimerRef.current) {
      window.clearTimeout(easterTimerRef.current);
      easterTimerRef.current = null;
    }

    setEasterEgg(null);
  }

  function tapDragon() {
    const count = dragonTaps + 1;

    if (count >= 5) {
      setDragonTaps(0);
      setDragonText("ну всё...");
      showEasterEgg(EASTER_EGGS.dragon);
    } else {
      setDragonTaps(count);
      setDragonText(
        DRAGON_REPLIES[
          Math.floor(Math.random() * DRAGON_REPLIES.length)
        ]
      );
    }

    if (dragonTimerRef.current) {
      window.clearTimeout(dragonTimerRef.current);
    }

    dragonTimerRef.current = window.setTimeout(() => {
      setDragonText("zZ");
    }, 2400);
  }

  function tapMug() {
    const count = mugTaps + 1;
    if (count >= 3) {
      setMugTaps(0);
      showEasterEgg(EASTER_EGGS.mug);
      return;
    }
    setMugTaps(count);
  }

  function tapFire() {
    const count = fireTaps + 1;
    if (count >= 4) {
      setFireTaps(0);
      showEasterEgg(EASTER_EGGS.fire);
      return;
    }
    setFireTaps(count);
  }

  function tapWater() {
    const count = waterTaps + 1;
    if (count >= 2) {
      setWaterTaps(0);
      showEasterEgg(EASTER_EGGS.water);
      return;
    }
    setWaterTaps(count);
  }

  function tapTent() {
    const count = tentTaps + 1;
    if (count >= 3) {
      setTentTaps(0);
      showEasterEgg(EASTER_EGGS.tent);
      return;
    }
    setTentTaps(count);
  }

  useEffect(() => {
    return () => {
      if (ambientRef.current) {
        for (const source of ambientRef.current.sources) {
          try {
            source.stop();
          } catch {}
        }

        try {
          ambientRef.current.context.close();
        } catch {}
      }

      if (dragonTimerRef.current) {
        window.clearTimeout(dragonTimerRef.current);
      }

      if (easterTimerRef.current) {
        window.clearTimeout(easterTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`camp-home-page camp-home-${phase}`}>
      <section className="camp-home-header">
        <div>
          <small>Минск · {minsk.time}</small>
          <h1>Домой</h1>
          <p>можешь немного исчезнуть отсюда</p>
        </div>
        <span>✦</span>
      </section>

      <section className="camp-home-scene">
        {/* НЕБО */}
        <div className="camp-home-sky">
          <i className="camp-star s1" />
          <i className="camp-star s2" />
          <i className="camp-star s3" />
          <i className="camp-star s4" />
          <i className="camp-star s5" />
          <i className="camp-star s6" />

          <button
            type="button"
            className="camp-secret-star"
            onClick={() => showEasterEgg(EASTER_EGGS.star)}
            aria-label="Звезда"
          >
            ✦
          </button>

          <span className="camp-home-moon" />
        </div>

        {/* ЛЕС */}
        <div className="camp-home-forest back">
          {Array.from({ length: 10 }).map((_, index) => (
            <i key={`back-${index}`} />
          ))}
        </div>

        <div className="camp-home-forest front">
          {Array.from({ length: 8 }).map((_, index) => (
            <i key={`front-${index}`} />
          ))}
        </div>

        {/* ОЗЕРО */}
        <button
          type="button"
          className="camp-home-lake"
          onClick={tapWater}
          aria-label="Озеро"
        >
          <span className="camp-water-line w1" />
          <span className="camp-water-line w2" />
          <span className="camp-water-line w3" />
          <span className="camp-water-line w4" />
          <span className="camp-moon-reflection" />
        </button>

        <div className="camp-home-shore" />

        {/* ПАЛАТКА */}
        <button
          type="button"
          className="camp-home-tent"
          onClick={tapTent}
          aria-label="Палатка"
        >
          <span className="camp-tent-body" />
          <span className="camp-tent-door" />
          <span className="camp-tent-light" />
        </button>

        {/* РЮКЗАК */}
        <button
          type="button"
          className="camp-home-backpack"
          onClick={() => showEasterEgg(EASTER_EGGS.backpack)}
          aria-label="Рюкзак"
        >
          <span />
        </button>

        {/* КАМЕНЬ */}
        <button
          type="button"
          className="camp-home-stone"
          onClick={() => showEasterEgg(EASTER_EGGS.stone)}
          aria-label="Камень"
        />

        {/* КОСТЁР */}
        <button
          type="button"
          className="camp-home-fire"
          onClick={tapFire}
          aria-label="Костёр"
        >
          <span className="camp-fire-flame flame-one" />
          <span className="camp-fire-flame flame-two" />
          <span className="camp-fire-flame flame-three" />
          <span className="camp-fire-log log-one" />
          <span className="camp-fire-log log-two" />
        </button>

        {/* ДВЕ ПОХОДНЫЕ КРУЖКИ */}
        <div className="camp-home-mugs">
          <button
            type="button"
            className="camp-mug camp-mug-dark"
            aria-label="Походная кружка"
          >
            <span />
          </button>

          <button
            type="button"
            className="camp-mug camp-mug-warm"
            onClick={tapMug}
            aria-label="Походная кружка"
          >
            <span />
          </button>
        </div>

        {/* ВИДИМАЯ ЗАПИСКА */}
        <button
          type="button"
          className="camp-home-note"
          onClick={() => setOpenedNote(mainNote)}
        >
          <small>для тебя</small>
          <b>ну раз уж пришла</b>
          <span>открыть →</span>
        </button>

        {/* ДРАКОША */}
        <button
          type="button"
          className="camp-home-dragon"
          onClick={tapDragon}
          aria-label="Дракоша"
        >
          <img src="/drakosha.png" alt="Дракоша" />
          <span>{dragonText}</span>
        </button>

        {/* СВЕТЛЯЧОК */}
        <button
          type="button"
          className="camp-home-firefly"
          onClick={() => showEasterEgg(EASTER_EGGS.firefly)}
          aria-label="Светлячок"
        />

        {activeSound === "rain" && (
          <div className="camp-home-rain" aria-hidden="true">
            {Array.from({ length: 30 }).map((_, index) => (
              <i
                key={index}
                style={{
                  left: `${(index * 37) % 100}%`,
                  animationDelay: `${(index % 9) * -0.16}s`,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ЗВУКИ */}
      <section className="camp-home-ambient">
        <button
          type="button"
          className={activeSound === "water" ? "active" : ""}
          onClick={() => toggleAmbient("water")}
        >
          <span>≋</span>
          <div>
            <b>вода</b>
            <small>{activeSound === "water" ? "шумит" : "включить"}</small>
          </div>
        </button>

        <button
          type="button"
          className={activeSound === "fire" ? "active" : ""}
          onClick={() => toggleAmbient("fire")}
        >
          <span>✦</span>
          <div>
            <b>костёр</b>
            <small>{activeSound === "fire" ? "трещит" : "включить"}</small>
          </div>
        </button>

        <button
          type="button"
          className={activeSound === "night" ? "active" : ""}
          onClick={() => toggleAmbient("night")}
        >
          <span>☾</span>
          <div>
            <b>ночь</b>
            <small>{activeSound === "night" ? "тихо" : "включить"}</small>
          </div>
        </button>

        <button
          type="button"
          className={activeSound === "rain" ? "active" : ""}
          onClick={() => toggleAmbient("rain")}
        >
          <span>☂</span>
          <div>
            <b>дождь</b>
            <small>{activeSound === "rain" ? "идёт" : "включить"}</small>
          </div>
        </button>
      </section>

      <p className="camp-home-bottom">никуда не спешим</p>

      {/* ОБЫЧНАЯ ЗАПИСКА */}
      {openedNote && (
        <div
          className="camp-note-overlay"
          onClick={() => setOpenedNote(null)}
        >
          <article
            className="camp-note-paper"
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

      {/* FULLSCREEN ПАСХАЛКА */}
      {easterEgg && (
        <div
          className={`camp-easter-overlay camp-easter-${easterEgg.type}`}
          onClick={closeEasterEgg}
        >
          <div className="camp-easter-particles" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <i
                key={index}
                style={{ "--i": index }}
              >
                {easterEgg.type === "fire"
                  ? "✦"
                  : easterEgg.type === "water"
                  ? "·"
                  : easterEgg.type === "dragon"
                  ? "♡"
                  : "✦"}
              </i>
            ))}
          </div>

          <div
            className="camp-easter-content"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="camp-easter-icon">{easterEgg.icon}</span>
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
