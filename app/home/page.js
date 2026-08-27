"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


/* =====================================================
   ОСНОВНЫЕ ЗАПИСКИ

   Эти тексты можешь менять на свои.
===================================================== */

const MAIN_NOTES = [
  {
    title: "оставлю это здесь",
    text:
      "Никакого важного повода. Просто захотелось, чтобы здесь лежало что-нибудь от меня.",
  },

  {
    title: "на случай шумного дня",
    text:
      "Если сегодня вокруг слишком много всего — здесь можно просто немного посидеть. Больше ничего.",
  },

  {
    title: "маленькая записка",
    text:
      "Ты можешь найти её сегодня, через неделю или вообще случайно. Она никуда не торопится.",
  },
];


/* =====================================================
   СКРЫТЫЕ ЗАПИСКИ
===================================================== */

const SECRET_NOTES = {

  dragon: {
    title: "дракоша сдался",
    text:
      "Ладно. Раз уж ты настолько настойчиво его разбудила — держи тьмок ♡",
  },

  mug: {
    title: "на дне кружки",
    text:
      "Тут был спрятан один маленький тьмок. Теперь он твой.",
  },

  plant: {
    title: "служебная записка",
    text:
      "Это растение официально назначено ответственным за то, чтобы ты иногда отдыхала.",
  },

  record: {
    title: "нашла",
    text:
      "Если ты это открыла — у тебя подозрительно хорошая наблюдательность.",
  },

  lamp: {
    title: "ну сколько можно",
    text:
      "Я так и знал, что ты будешь сидеть и щёлкать эту лампу.",
  },

  fairy: {
    title: "эта лампочка странная",
    text:
      "Почему именно эта? Не знаю. Но теперь здесь спрятана записка.",
  },

};


/* =====================================================
   РЕПЛИКИ ДРАКОШИ
===================================================== */

const DRAGON_REPLIES = [
  "zZ",
  "м?",
  "👀",
  "...",
  "я спал",
  "чего тыкаемся",
  "я ничего не делал",
  "дай полежать",
];


/* =====================================================
   МИНСК
===================================================== */

function getMinskInfo(date = new Date()) {

  const time =
    new Intl.DateTimeFormat(
      "ru-RU",
      {
        timeZone: "Europe/Minsk",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    ).format(date);


  const hour =
    Number(
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: "Europe/Minsk",
          hour: "numeric",
          hourCycle: "h23",
        }
      ).format(date)
    );


  return {
    time,
    hour,
  };

}


function getPhase(hour) {

  if (
    hour >= 6 &&
    hour < 12
  ) {
    return "morning";
  }

  if (
    hour >= 12 &&
    hour < 18
  ) {
    return "day";
  }

  if (
    hour >= 18 &&
    hour < 23
  ) {
    return "evening";
  }

  return "night";

}


/* =====================================================
   AUDIO
===================================================== */

function createNoiseBuffer(
  context,
  seconds,
  generator
) {

  const buffer =
    context.createBuffer(
      2,
      context.sampleRate * seconds,
      context.sampleRate
    );


  for (
    let channel = 0;
    channel < 2;
    channel++
  ) {

    const data =
      buffer.getChannelData(
        channel
      );


    let last =
      0;


    for (
      let i = 0;
      i < data.length;
      i++
    ) {

      const result =
        generator({
          i,
          last,
          sampleRate:
            context.sampleRate,
        });


      data[i] =
        result.value;


      last =
        result.last;

    }

  }


  return buffer;

}


/* =====================================================
   СОЗДАНИЕ АТМОСФЕРЫ
===================================================== */

function createAmbient(type) {

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioContext) {
    return null;
  }


  const context =
    new AudioContext();


  const master =
    context.createGain();


  master.gain.value =
    0.15;


  master.connect(
    context.destination
  );


  const sources =
    [];


  /* ===================================================
     ДОЖДЬ
  =================================================== */

  if (type === "rain") {

    const buffer =
      createNoiseBuffer(
        context,
        6,
        ({
          last,
        }) => {

          const white =
            Math.random() * 2 - 1;


          const next =
            last * 0.87 +
            white * 0.13;


          return {
            value:
              next * 0.8,

            last:
              next,
          };

        }
      );


    const source =
      context.createBufferSource();


    source.buffer =
      buffer;

    source.loop =
      true;


    const low =
      context.createBiquadFilter();


    low.type =
      "lowpass";

    low.frequency.value =
      4200;


    const high =
      context.createBiquadFilter();


    high.type =
      "highpass";

    high.frequency.value =
      160;


    source.connect(
      low
    );

    low.connect(
      high
    );

    high.connect(
      master
    );


    source.start();


    sources.push(
      source
    );

  }


  /* ===================================================
     КАМИН
  =================================================== */

  if (type === "fire") {

    const buffer =
      createNoiseBuffer(
        context,
        7,
        ({
          last,
        }) => {

          const noise =
            Math.random() * 2 - 1;


          let crack =
            noise * 0.1;


          if (
            Math.random() >
            0.992
          ) {

            crack +=
              (
                Math.random() *
                2 -
                1
              ) *
              1.6;

          }


          const next =
            last * 0.68 +
            crack * 0.32;


          return {
            value:
              next,

            last:
              next,
          };

        }
      );


    const source =
      context.createBufferSource();


    source.buffer =
      buffer;

    source.loop =
      true;


    const filter =
      context.createBiquadFilter();


    filter.type =
      "lowpass";

    filter.frequency.value =
      1800;


    const gain =
      context.createGain();


    gain.gain.value =
      0.9;


    source.connect(
      filter
    );

    filter.connect(
      gain
    );

    gain.connect(
      master
    );


    source.start();


    sources.push(
      source
    );

  }


  /* ===================================================
     ТИХАЯ НОЧЬ
  =================================================== */

  if (type === "night") {

    const buffer =
      createNoiseBuffer(
        context,
        8,
        ({
          last,
        }) => {

          const white =
            Math.random() * 2 - 1;


          const next =
            last * 0.965 +
            white * 0.035;


          return {
            value:
              next * 0.5,

            last:
              next,
          };

        }
      );


    const source =
      context.createBufferSource();


    source.buffer =
      buffer;

    source.loop =
      true;


    const filter =
      context.createBiquadFilter();


    filter.type =
      "lowpass";

    filter.frequency.value =
      850;


    const gain =
      context.createGain();


    gain.gain.value =
      0.6;


    source.connect(
      filter
    );

    filter.connect(
      gain
    );

    gain.connect(
      master
    );


    source.start();


    sources.push(
      source
    );

  }


  return {
    context,
    sources,
  };

}


/* =====================================================
   PAGE
===================================================== */

export default function HomeRoomPage() {

  const [
    now,
    setNow,
  ] = useState(
    new Date()
  );


  const [
    lampOn,
    setLampOn,
  ] = useState(
    true
  );


  const [
    activeSound,
    setActiveSound,
  ] = useState(
    null
  );


  const [
    openedNote,
    setOpenedNote,
  ] = useState(
    null
  );


  const [
    dragonText,
    setDragonText,
  ] = useState(
    "zZ"
  );


  const [
    dragonTaps,
    setDragonTaps,
  ] = useState(
    0
  );


  const [
    mugTaps,
    setMugTaps,
  ] = useState(
    0
  );


  const [
    lampTaps,
    setLampTaps,
  ] = useState(
    0
  );


  const [
    heartBurst,
    setHeartBurst,
  ] = useState(
    false
  );


  const ambientRef =
    useRef(
      null
    );


  const dragonTimerRef =
    useRef(
      null
    );


  const minsk =
    getMinskInfo(
      now
    );


  const phase =
    getPhase(
      minsk.hour
    );


  /* ===================================================
     ВРЕМЯ
  =================================================== */

  useEffect(() => {

    const timer =
      window.setInterval(
        () =>
          setNow(
            new Date()
          ),
        30000
      );


    return () =>
      window.clearInterval(
        timer
      );

  }, []);


  /* ===================================================
     ОСНОВНАЯ ЗАПИСКА

     Одна на текущий визит.
  =================================================== */

  const mainNote =
    useMemo(
      () =>
        MAIN_NOTES[
          Math.floor(
            Math.random() *
            MAIN_NOTES.length
          )
        ],
      []
    );


  /* ===================================================
     ОСТАНОВКА ЗВУКА
  =================================================== */

  async function stopAmbient() {

    if (
      !ambientRef.current
    ) {
      return;
    }


    for (
      const source of
      ambientRef.current.sources
    ) {

      try {
        source.stop();
      } catch {}

    }


    try {

      await ambientRef.current
        .context
        .close();

    } catch {}


    ambientRef.current =
      null;


    setActiveSound(
      null
    );

  }


  /* ===================================================
     ВКЛЮЧЕНИЕ АТМОСФЕРЫ
  =================================================== */

  async function toggleAmbient(type) {

    if (
      activeSound === type
    ) {

      await stopAmbient();

      return;

    }


    await stopAmbient();


    try {

      const ambient =
        createAmbient(
          type
        );


      if (!ambient) {
        return;
      }


      if (
        ambient.context.state ===
        "suspended"
      ) {

        await ambient.context
          .resume();

      }


      ambientRef.current =
        ambient;


      setActiveSound(
        type
      );

    } catch (error) {

      console.error(
        "AMBIENT:",
        error
      );

    }

  }


  /* ===================================================
     CLEANUP
  =================================================== */

  useEffect(() => {

    return () => {

      if (
        ambientRef.current
      ) {

        for (
          const source of
          ambientRef.current.sources
        ) {

          try {
            source.stop();
          } catch {}

        }


        try {

          ambientRef.current
            .context
            .close();

        } catch {}

      }


      if (
        dragonTimerRef.current
      ) {

        window.clearTimeout(
          dragonTimerRef.current
        );

      }

    };

  }, []);


  /* ===================================================
     ОТКРЫТЬ ЗАПИСКУ
  =================================================== */

  function openNote(note) {

    setOpenedNote(
      note
    );

  }


  /* ===================================================
     ДРАКОША
  =================================================== */

  function tapDragon() {

    const count =
      dragonTaps + 1;


    setDragonTaps(
      count
    );


    if (
      count >= 5
    ) {

      setDragonTaps(
        0
      );


      setDragonText(
        "ладно..."
      );


      setHeartBurst(
        true
      );


      openNote(
        SECRET_NOTES.dragon
      );


      window.setTimeout(
        () =>
          setHeartBurst(
            false
          ),
        1500
      );

    }

    else {

      setDragonText(
        DRAGON_REPLIES[
          Math.floor(
            Math.random() *
            DRAGON_REPLIES.length
          )
        ]
      );

    }


    if (
      dragonTimerRef.current
    ) {

      window.clearTimeout(
        dragonTimerRef.current
      );

    }


    dragonTimerRef.current =
      window.setTimeout(
        () =>
          setDragonText(
            "zZ"
          ),
        2400
      );

  }


  /* ===================================================
     КРУЖКА
  =================================================== */

  function tapKessiMug() {

    const count =
      mugTaps + 1;


    if (
      count >= 3
    ) {

      setMugTaps(
        0
      );


      openNote(
        SECRET_NOTES.mug
      );

      return;

    }


    setMugTaps(
      count
    );

  }


  /* ===================================================
     ЛАМПА
  =================================================== */

  function tapLamp() {

    setLampOn(
      (current) =>
        !current
    );


    const count =
      lampTaps + 1;


    if (
      count >= 7
    ) {

      setLampTaps(
        0
      );


      openNote(
        SECRET_NOTES.lamp
      );

      return;

    }


    setLampTaps(
      count
    );

  }


  return (

    <div
      className={`
        cozy-home-page
        cozy-home-${phase}
        ${
          lampOn
            ? "lamp-on"
            : "lamp-off"
        }
      `}
    >


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="cozy-home-header">


        <div>

          <small>
            Минск · {minsk.time}
          </small>


          <h1>
            Домой
          </h1>


          <p>
            можешь просто
            немного побыть здесь
          </p>

        </div>


        <span>
          ♡
        </span>


      </section>



      {/* =================================================
          СЦЕНА
      ================================================= */}

      <section className="cozy-home-scene">


        {/* ===============================================
            ГИРЛЯНДА
        =============================================== */}

        <div className="cozy-home-fairy">

          <i />
          <i />
          <i />


          <button
            type="button"
            onClick={() =>
              openNote(
                SECRET_NOTES.fairy
              )
            }
            aria-label="Лампочка"
          />


          <i />
          <i />
          <i />
          <i />

        </div>



        {/* ===============================================
            ПОЛКА
        =============================================== */}

        <div className="cozy-home-shelf">


          <div className="cozy-home-books">
            <i />
            <i />
            <i />
          </div>


          <button
            type="button"
            className="cozy-home-plant"
            onClick={() =>
              openNote(
                SECRET_NOTES.plant
              )
            }
            aria-label="Растение"
          >
            ☘
          </button>


        </div>



        {/* ===============================================
            ПРОИГРЫВАТЕЛЬ
        =============================================== */}

        <button
          type="button"
          className={`
            cozy-home-player
            ${
              activeSound
                ? "playing"
                : ""
            }
          `}
          onClick={() =>
            openNote(
              SECRET_NOTES.record
            )
          }
          aria-label="Проигрыватель"
        >

          <span className="cozy-home-record">

            <i />

          </span>


          <span className="cozy-home-player-arm" />


        </button>



        {/* ===============================================
            ЛАМПА
        =============================================== */}

        <button
          type="button"
          className="cozy-home-lamp"
          onClick={
            tapLamp
          }
          aria-label="Лампа"
        >

          <span className="cozy-home-lamp-light" />

          <span className="cozy-home-lamp-shade" />

          <span className="cozy-home-lamp-neck" />

          <span className="cozy-home-lamp-base" />

        </button>



        {/* ===============================================
            СТОЛ
        =============================================== */}

        <div className="cozy-home-table">


          {/* ЧАШКА ОБСИДИКА */}

          <button
            type="button"
            className="cozy-home-mug cozy-mug-obsid"
            aria-label="Чашка Обсидика"
          >

            <span>
              ♡
            </span>

            <small>
              Обсидик
            </small>

          </button>



          {/* ЧАШКА КЭССИЧКИ */}

          <button
            type="button"
            className="cozy-home-mug cozy-mug-kessi"
            onClick={
              tapKessiMug
            }
            aria-label="Чашка Кэссички"
          >

            <span>
              ♡
            </span>

            <small>
              Кэссичка
            </small>

          </button>



          {/* =============================================
              ГЛАВНАЯ ЗАПИСКА
          ============================================= */}

          <button
            type="button"
            className="cozy-home-note"
            onClick={() =>
              openNote(
                mainNote
              )
            }
          >

            <span className="cozy-home-note-pin">
              ♡
            </span>


            <small>
              оставлено тебе
            </small>


            <b>
              прочитаешь,
              когда захочешь
            </b>


            <em>
              открыть →
            </em>


          </button>


        </div>



        {/* ===============================================
            ДРАКОШИНА ЛЕЖАНКА
        =============================================== */}

        <div className="cozy-home-dragon-bed" />



        {/* ===============================================
            ДРАКОША
        =============================================== */}

        <button
          type="button"
          className="cozy-home-dragon"
          onClick={
            tapDragon
          }
          aria-label="Дракоша"
        >

          <img
            src="/drakosha.png"
            alt="Дракоша"
          />


          <span>
            {dragonText}
          </span>


        </button>



        {/* ===============================================
            СЕРДЕЧКИ
        =============================================== */}

        {
          heartBurst &&
          (

            <div className="cozy-home-hearts">

              <i>♡</i>
              <i>♡</i>
              <i>♡</i>
              <i>♡</i>
              <i>♡</i>

            </div>

          )
        }


      </section>



      {/* =================================================
          АТМОСФЕРА
      ================================================= */}

      <section className="cozy-home-ambient">


        <button
          type="button"
          className={
            activeSound === "rain"
              ? "active"
              : ""
          }
          onClick={() =>
            toggleAmbient(
              "rain"
            )
          }
        >

          <span>
            ≋
          </span>

          <div>
            <b>дождь</b>
            <small>
              {
                activeSound === "rain"
                  ? "шумит"
                  : "включить"
              }
            </small>
          </div>

        </button>



        <button
          type="button"
          className={
            activeSound === "fire"
              ? "active"
              : ""
          }
          onClick={() =>
            toggleAmbient(
              "fire"
            )
          }
        >

          <span>
            ◇
          </span>

          <div>
            <b>камин</b>
            <small>
              {
                activeSound === "fire"
                  ? "трещит"
                  : "включить"
              }
            </small>
          </div>

        </button>



        <button
          type="button"
          className={
            activeSound === "night"
              ? "active"
              : ""
          }
          onClick={() =>
            toggleAmbient(
              "night"
            )
          }
        >

          <span>
            ☾
          </span>

          <div>
            <b>ночь</b>
            <small>
              {
                activeSound === "night"
                  ? "тихо"
                  : "включить"
              }
            </small>
          </div>

        </button>


      </section>



      <p className="cozy-home-bottom">
        здесь ничего не надо успевать
      </p>



      {/* =================================================
          ЗАПИСКА
      ================================================= */}

      {
        openedNote &&
        (

          <div
            className="cozy-note-overlay"
            onClick={() =>
              setOpenedNote(
                null
              )
            }
          >


            <article
              className="cozy-note-paper"
              onClick={
                (event) =>
                  event.stopPropagation()
              }
            >


              <button
                type="button"
                className="cozy-note-close"
                onClick={() =>
                  setOpenedNote(
                    null
                  )
                }
              >
                ×
              </button>


              <span className="cozy-note-label">
                для кэссички
              </span>


              <h2>
                {openedNote.title}
              </h2>


              <p>
                {openedNote.text}
              </p>


              <span className="cozy-note-sign">
                — обсидик
              </span>


              <i className="cozy-note-heart">
                ♡
              </i>


            </article>


          </div>

        )
      }


    </div>

  );

}
