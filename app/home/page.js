"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


/* =====================================================
   МАЛЕНЬКИЕ ФРАЗЫ

   Они ничего не требуют.
===================================================== */

const quietPhrases = [
  "тут тихо",
  "можно просто посидеть",
  "ничего важного здесь не происходит",
  "заглянула? располагайся",
  "никуда не торопимся",
  "можно просто потыкать Дракошу",
  "я оставил тут немного тишины",
  "побудь сколько хочется",
];


/* =====================================================
   СЛУЧАЙНЫЕ НАХОДКИ
===================================================== */

const littleFinds = [
  {
    icon: "✦",
    title: "звёздочка",
    text: "просто лежала тут",
  },

  {
    icon: "☘",
    title: "маленькая удача",
    text: "забирай, пригодится",
  },

  {
    icon: "⌁",
    title: "бумажный самолётик",
    text: "куда-то летел и решил остаться",
  },

  {
    icon: "●",
    title: "камешек",
    text: "Дракоша говорит, что он ценный",
  },

  {
    icon: "✿",
    title: "что-то маленькое",
    text: "пусть просто побудет здесь",
  },
];


/* =====================================================
   ФРАЗЫ ДРАКОШИ
===================================================== */

const dragonReplies = [
  "м?",
  "👀",
  "...",
  "я вообще-то отдыхал",
  "чего тыкаемся",
  "zZ",
  "я тут",
  "ничего не делал",
];


/* =====================================================
   МИНСК
===================================================== */

function getMinskInfo(date = new Date()) {

  const time =
    new Intl.DateTimeFormat(
      "ru-RU",
      {
        timeZone:
          "Europe/Minsk",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hourCycle:
          "h23",
      }
    ).format(date);


  const hour =
    Number(
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone:
            "Europe/Minsk",

          hour:
            "numeric",

          hourCycle:
            "h23",
        }
      ).format(date)
    );


  const dateKey =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Europe/Minsk",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      }
    ).format(date);


  return {
    time,
    hour,
    dateKey,
  };

}


/* =====================================================
   ПОГОДА
===================================================== */

function weatherLabel(code) {

  if (code === 0) {
    return "ясно";
  }

  if (
    code >= 1 &&
    code <= 3
  ) {
    return "облачно";
  }

  if (
    code >= 45 &&
    code <= 48
  ) {
    return "туман";
  }

  if (
    code >= 51 &&
    code <= 67
  ) {
    return "дождь";
  }

  if (
    code >= 71 &&
    code <= 77
  ) {
    return "снег";
  }

  if (
    code >= 80 &&
    code <= 82
  ) {
    return "ливень";
  }

  if (
    code >= 85 &&
    code <= 86
  ) {
    return "снегопад";
  }

  if (
    code >= 95
  ) {
    return "гроза";
  }

  return "Минск";
}


function weatherIsRainy(code) {

  return (
    (
      code >= 51 &&
      code <= 67
    ) ||
    (
      code >= 80 &&
      code <= 82
    ) ||
    code >= 95
  );

}


/* =====================================================
   ЗВУК ДОЖДЯ
===================================================== */

function createRainSound() {

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioContext) {
    return null;
  }


  const context =
    new AudioContext();


  const duration =
    5;


  const buffer =
    context.createBuffer(
      2,
      context.sampleRate *
        duration,
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

      const white =
        Math.random() * 2 -
        1;


      last =
        last * 0.92 +
        white * 0.08;


      data[i] =
        last * 0.72;

    }

  }


  const source =
    context.createBufferSource();


  source.buffer =
    buffer;

  source.loop =
    true;


  const lowPass =
    context.createBiquadFilter();


  lowPass.type =
    "lowpass";

  lowPass.frequency.value =
    4200;


  const highPass =
    context.createBiquadFilter();


  highPass.type =
    "highpass";

  highPass.frequency.value =
    130;


  const gain =
    context.createGain();


  gain.gain.value =
    0.18;


  source.connect(
    lowPass
  );


  lowPass.connect(
    highPass
  );


  highPass.connect(
    gain
  );


  gain.connect(
    context.destination
  );


  source.start();


  return {
    context,
    source,
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
    weather,
    setWeather,
  ] = useState(
    null
  );


  const [
    mood,
    setMood,
  ] = useState(
    "warm"
  );


  const [
    rainSoundOn,
    setRainSoundOn,
  ] = useState(
    false
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
    kissBurst,
    setKissBurst,
  ] = useState(
    false
  );


  const [
    found,
    setFound,
  ] = useState(
    false
  );


  const [
    findOpen,
    setFindOpen,
  ] = useState(
    false
  );


  const rainRef =
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
     СОХРАНЯЕМ СВЕТ
  =================================================== */

  useEffect(() => {

    try {

      const saved =
        window.localStorage
          .getItem(
            "our-home-mood"
          );


      if (
        saved === "soft" ||
        saved === "warm" ||
        saved === "night"
      ) {

        setMood(
          saved
        );

      }

    } catch {}

  }, []);


  /* ===================================================
     ПОГОДА МИНСКА
  =================================================== */

  useEffect(() => {

    let active =
      true;


    async function loadWeather() {

      try {

        const response =
          await fetch(
            "/api/weather",
            {
              cache:
                "no-store",
            }
          );


        if (!response.ok) {
          return;
        }


        const data =
          await response.json();


        if (active) {
          setWeather(
            data
          );
        }

      } catch (error) {

        console.warn(
          "HOME WEATHER:",
          error
        );

      }

    }


    loadWeather();


    const timer =
      window.setInterval(
        loadWeather,
        10 * 60 * 1000
      );


    return () => {

      active =
        false;

      window.clearInterval(
        timer
      );

    };

  }, []);


  /* ===================================================
     ВЫБОР ФРАЗЫ И НАХОДКИ

     Меняются сами со временем.
  =================================================== */

  const seed =
    (
      Number(
        minsk.dateKey.replace(
          /\D/g,
          ""
        )
      ) +
      minsk.hour
    );


  const quietPhrase =
    quietPhrases[
      seed %
      quietPhrases.length
    ];


  const littleFind =
    littleFinds[
      seed %
      littleFinds.length
    ];


  /* ===================================================
     РЕАЛЬНЫЙ ДОЖДЬ

     Если сейчас в Минске дождь,
     визуальные капли появляются сами.

     ЗВУК сам не включается.
  =================================================== */

  const realRain =
    weatherIsRainy(
      Number(
        weather?.weatherCode
      )
    );


  const showRain =
    realRain ||
    rainSoundOn;


  /* ===================================================
     СВЕТ
  =================================================== */

  function changeMood() {

    let next =
      "warm";


    if (
      mood === "warm"
    ) {
      next =
        "soft";
    }

    else if (
      mood === "soft"
    ) {
      next =
        "night";
    }

    else {
      next =
        "warm";
    }


    setMood(
      next
    );


    try {

      window.localStorage
        .setItem(
          "our-home-mood",
          next
        );

    } catch {}

  }


  function moodText() {

    if (
      mood === "soft"
    ) {
      return "тихо";
    }


    if (
      mood === "night"
    ) {
      return "ночь";
    }


    return "тепло";
  }


  /* ===================================================
     ДОЖДЬ
  =================================================== */

  async function toggleRain() {

    if (
      rainRef.current
    ) {

      try {

        rainRef.current
          .source
          .stop();

      } catch {}


      try {

        await rainRef.current
          .context
          .close();

      } catch {}


      rainRef.current =
        null;


      setRainSoundOn(
        false
      );


      return;

    }


    try {

      const rain =
        createRainSound();


      if (!rain) {
        return;
      }


      if (
        rain.context.state ===
        "suspended"
      ) {

        await rain.context
          .resume();

      }


      rainRef.current =
        rain;


      setRainSoundOn(
        true
      );

    } catch (error) {

      console.error(
        "RAIN:",
        error
      );

    }

  }


  useEffect(() => {

    return () => {

      if (
        rainRef.current
      ) {

        try {

          rainRef.current
            .source
            .stop();

        } catch {}


        try {

          rainRef.current
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
     ДРАКОША
  =================================================== */

  function tapDragon() {

    const nextCount =
      dragonTaps + 1;


    setDragonTaps(
      nextCount
    );


    if (
      nextCount >= 5
    ) {

      setDragonTaps(
        0
      );


      setDragonText(
        "ладно. тьмок ♡"
      );


      setKissBurst(
        true
      );


      window.setTimeout(
        () =>
          setKissBurst(
            false
          ),
        1500
      );

    }

    else {

      const text =
        dragonReplies[
          Math.floor(
            Math.random() *
            dragonReplies.length
          )
        ];


      setDragonText(
        text
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
        () => {

          setDragonText(
            "zZ"
          );

        },
        2600
      );

  }


  /* ===================================================
     НАХОДКА
  =================================================== */

  function openFind() {

    setFound(
      true
    );


    setFindOpen(
      true
    );


    window.setTimeout(
      () =>
        setFindOpen(
          false
        ),
      3500
    );

  }


  return (

    <div
      className={`
        home-v5-page
        home-v5-${mood}
      `}
    >


      {/* =================================================
          HEADER
      ================================================= */}

      <section className="home-v5-header">


        <div>

          <small>
            Минск · {minsk.time}

            {
              weather &&
              (
                <>
                  {" · "}
                  {
                    Math.round(
                      weather.temperature
                    )
                  }°
                </>
              )
            }

          </small>


          <h1>
            Домой
          </h1>


          <p>
            {quietPhrase}
          </p>

        </div>


        <div className="home-v5-header-dot">
          ·
        </div>


      </section>



      {/* =================================================
          ЖИВАЯ СЦЕНА
      ================================================= */}

      <section
        className={`
          home-v5-scene
          ${
            showRain
              ? "is-raining"
              : ""
          }
        `}
      >


        {/* НЕБОЛЬШОЕ СОСТОЯНИЕ */}

        <div className="home-v5-scene-status">

          <span>
            {
              weather
                ? weatherLabel(
                    Number(
                      weather.weatherCode
                    )
                  )
                : "наш мирок"
            }
          </span>


          <i />


          <span>
            {moodText()}
          </span>

        </div>



        {/* СВЕТОВЫЕ ТОЧКИ */}

        <div className="home-v5-particles">

          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />

        </div>



        {/* ДОЖДЬ */}

        {
          showRain &&
          (

            <div className="home-v5-rain">

              {
                Array.from({
                  length:
                    32,
                }).map(
                  (
                    _,
                    index
                  ) => (

                    <i
                      key={
                        index
                      }
                      style={{
                        left:
                          `${
                            (
                              index *
                              37
                            ) %
                            100
                          }%`,

                        animationDelay:
                          `${
                            (
                              index %
                              11
                            ) *
                            -0.13
                          }s`,

                        animationDuration:
                          `${
                            1.1 +
                            (
                              index %
                              5
                            ) *
                            0.15
                          }s`,
                      }}
                    />

                  )
                )
              }

            </div>

          )
        }



        {/* ЛАМПА */}

        <button
          type="button"
          className="home-v5-lamp"
          onClick={
            changeMood
          }
          aria-label="Изменить свет"
        >

          <span className="home-v5-lamp-shade" />

          <span className="home-v5-lamp-light" />

          <span className="home-v5-lamp-neck" />

          <span className="home-v5-lamp-base" />

        </button>



        {/* МЯГКИЙ ОСТРОВОК */}

        <div className="home-v5-island">

          <span />

        </div>



        {/* ДРАКОША */}

        <button
          type="button"
          className="home-v5-dragon"
          onClick={
            tapDragon
          }
          aria-label="Потыкать Дракошу"
        >

          <img
            src="/drakosha.png"
            alt="Дракоша"
          />


          <span className="home-v5-dragon-talk">
            {dragonText}
          </span>

        </button>



        {/* ТЬМОК */}

        {
          kissBurst &&
          (

            <div className="home-v5-hearts">

              <i>♡</i>
              <i>♡</i>
              <i>♡</i>
              <i>♡</i>
              <i>♡</i>
              <i>♡</i>

            </div>

          )
        }



        {/* СЛУЧАЙНАЯ НАХОДКА */}

        <button
          type="button"
          className={`
            home-v5-find
            ${
              found
                ? "is-found"
                : ""
            }
          `}
          onClick={
            openFind
          }
          aria-label="Посмотреть находку"
        >

          {
            littleFind.icon
          }

        </button>



        {/* ТЕКСТ НАХОДКИ */}

        {
          findOpen &&
          (

            <div className="home-v5-find-card">

              <b>
                {littleFind.title}
              </b>


              <span>
                {littleFind.text}
              </span>

            </div>

          )
        }



        {/* КНОПКИ */}

        <div className="home-v5-controls">


          <button
            type="button"
            onClick={
              changeMood
            }
          >

            <span>
              ◐
            </span>

            <div>

              <b>
                свет
              </b>

              <small>
                {moodText()}
              </small>

            </div>

          </button>



          <button
            type="button"
            className={
              rainSoundOn
                ? "active"
                : ""
            }
            onClick={
              toggleRain
            }
          >

            <span>
              ≋
            </span>

            <div>

              <b>
                дождь
              </b>

              <small>

                {
                  rainSoundOn
                    ? "шумит"
                    : "включить"
                }

              </small>

            </div>

          </button>


        </div>


      </section>



      {/* =================================================
          НИЗ
      ================================================= */}

      <section className="home-v5-bottom">


        <span>
          ♡
        </span>


        <p>
          здесь ничего
          не надо успевать
        </p>


      </section>


    </div>

  );

}
