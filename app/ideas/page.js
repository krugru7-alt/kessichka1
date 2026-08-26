"use client";

import { useMemo, useState } from "react";

const IDEAS = [
  {
    id: "constellation",
    icon: "✦",
    title: "Созвездие",
    subtitle: "маленькая вселенная, которая постепенно растёт",
  },
  {
    id: "greenhouse",
    icon: "⌇",
    title: "Оранжерея",
    subtitle: "странные растения с собственным поведением",
  },
  {
    id: "kaleidoscope",
    icon: "◉",
    title: "Кэссиоскоп",
    subtitle: "живой калейдоскоп света и стекла",
  },
  {
    id: "frames",
    icon: "▥",
    title: "Кадры",
    subtitle: "плёнка из маленьких живых сцен",
  },
  {
    id: "specimens",
    icon: "◇",
    title: "Экземпляры",
    subtitle: "коллекция непонятных цифровых объектов",
  },
  {
    id: "cloud",
    icon: "≈",
    title: "Облако",
    subtitle: "слова и мелочи, плавающие в пространстве",
  },
  {
    id: "aquarium",
    icon: "◌",
    title: "Аквариум",
    subtitle: "тихие световые существа под стеклом",
  },
  {
    id: "shelf",
    icon: "⌗",
    title: "Странная полка",
    subtitle: "предметы, которые ведут себя не так, как ожидаешь",
  },
  {
    id: "night",
    icon: "☾",
    title: "Ночная сторона",
    subtitle: "место, которое просыпается только ночью",
  },
  {
    id: "mirror",
    icon: "↔",
    title: "Зеркало",
    subtitle: "немного неправильное отражение самого сайта",
  },
];

const STAR_POSITIONS = [
  [18, 24],
  [34, 17],
  [52, 29],
  [72, 20],
  [83, 41],
  [64, 50],
  [42, 45],
  [25, 58],
  [76, 69],
  [52, 73],
  [31, 78],
  [15, 69],
];

const CLOUD_BITS = [
  "тьмок",
  "сегодня",
  "бус",
  "не спеши",
  "✦",
  "куда-то",
  "маленькая штука",
  "здесь",
  "ещё немного",
];

export default function IdeasPage() {
  const [active, setActive] = useState(null);

  const [stars, setStars] = useState([0, 2, 6]);

  const [plants, setPlants] = useState({
    one: false,
    two: false,
    three: false,
  });

  const [scope, setScope] = useState({
    x: 50,
    y: 50,
  });

  const [frame, setFrame] = useState(0);

  const [specimen, setSpecimen] = useState(0);

  const [cloudBits, setCloudBits] =
    useState(CLOUD_BITS);

  const [bubbles, setBubbles] = useState([]);

  const [shelfSecret, setShelfSecret] =
    useState(null);

  const [mirrorShift, setMirrorShift] =
    useState(false);

  const activeIdea = useMemo(
    () =>
      IDEAS.find(
        (item) => item.id === active
      ),
    [active]
  );

  function addStar() {
    setStars((current) => {
      const next = STAR_POSITIONS.findIndex(
        (_, index) =>
          !current.includes(index)
      );

      if (next === -1) {
        return [0, 2, 6];
      }

      return [...current, next];
    });
  }

  function moveScope(event) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    setScope({ x, y });
  }

  function shuffleCloud() {
    setCloudBits((current) =>
      [...current].sort(
        () => Math.random() - 0.5
      )
    );
  }

  function addBubble(event) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    setBubbles((current) => [
      ...current.slice(-9),
      {
        id:
          Date.now() +
          Math.random(),
        x,
        size:
          10 +
          Math.random() * 22,
      },
    ]);
  }

  return (
    <main className="ideas-page">
      {!active && (
        <>
          <header className="ideas-head">
            <small>ВРЕМЕННАЯ ЛАБОРАТОРИЯ</small>

            <h1>
              Что оставим?
            </h1>

            <p>
              Здесь все варианты.
              Главную страницу и старые
              разделы мы не трогаем.
            </p>
          </header>

          <section className="ideas-grid">
            {IDEAS.map((idea, index) => (
              <button
                key={idea.id}
                type="button"
                className="ideas-card"
                onClick={() =>
                  setActive(idea.id)
                }
              >
                <span className="ideas-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <i>
                  {idea.icon}
                </i>

                <div>
                  <b>
                    {idea.title}
                  </b>

                  <p>
                    {idea.subtitle}
                  </p>
                </div>

                <em>→</em>
              </button>
            ))}
          </section>

          <p className="ideas-bottom-note">
            ничего из этого пока
            не часть основного сайта
          </p>
        </>
      )}

      {active && (
        <section
          className={`ideas-preview ideas-preview-${active}`}
        >
          <header className="ideas-preview-head">
            <button
              type="button"
              onClick={() =>
                setActive(null)
              }
            >
              ← назад
            </button>

            <div>
              <small>
                ПРОТОТИП
              </small>

              <h1>
                {activeIdea?.title}
              </h1>
            </div>

            <span>
              {activeIdea?.icon}
            </span>
          </header>

          {/* СОЗВЕЗДИЕ */}

          {active ===
            "constellation" && (
            <div
              className="demo-constellation"
              onClick={addStar}
            >
              <div className="constellation-space">
                {STAR_POSITIONS.map(
                  ([x, y], index) => (
                    <span
                      key={index}
                      className={`demo-star ${
                        stars.includes(
                          index
                        )
                          ? "visible"
                          : ""
                      }`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                      }}
                    >
                      ✦
                    </span>
                  )
                )}

                <div className="constellation-core">
                  <small>
                    найдено
                  </small>

                  <b>
                    {stars.length}
                  </b>

                  <span>
                    нажми куда-нибудь
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ОРАНЖЕРЕЯ */}

          {active ===
            "greenhouse" && (
            <div className="demo-greenhouse">
              <p>
                они немного странные.
                потрогай.
              </p>

              <div className="plant-row">
                <button
                  type="button"
                  className={`demo-plant plant-one ${
                    plants.one
                      ? "awake"
                      : ""
                  }`}
                  onClick={() =>
                    setPlants(
                      (current) => ({
                        ...current,
                        one:
                          !current.one,
                      })
                    )
                  }
                >
                  <span className="plant-stem" />

                  <i />
                  <i />
                  <i />

                  <small>
                    сонник
                  </small>
                </button>

                <button
                  type="button"
                  className={`demo-plant plant-two ${
                    plants.two
                      ? "awake"
                      : ""
                  }`}
                  onClick={() =>
                    setPlants(
                      (current) => ({
                        ...current,
                        two:
                          !current.two,
                      })
                    )
                  }
                >
                  <span className="plant-stem" />

                  <i />
                  <i />
                  <i />

                  <small>
                    бусинка
                  </small>
                </button>

                <button
                  type="button"
                  className={`demo-plant plant-three ${
                    plants.three
                      ? "awake"
                      : ""
                  }`}
                  onClick={() =>
                    setPlants(
                      (current) => ({
                        ...current,
                        three:
                          !current.three,
                      })
                    )
                  }
                >
                  <span className="plant-stem" />

                  <i />
                  <i />
                  <i />

                  <small>
                    нехочуха
                  </small>
                </button>
              </div>
            </div>
          )}

          {/* КЭССИОСКОП */}

          {active ===
            "kaleidoscope" && (
            <div
              className="demo-scope"
              onPointerMove={
                moveScope
              }
              style={{
                "--scope-x":
                  `${scope.x}%`,
                "--scope-y":
                  `${scope.y}%`,
              }}
            >
              <div className="scope-glass">
                <span className="scope-piece p1" />
                <span className="scope-piece p2" />
                <span className="scope-piece p3" />
                <span className="scope-piece p4" />
                <span className="scope-piece p5" />

                <div className="scope-center">
                  ◉
                </div>
              </div>

              <small>
                проведи пальцем
              </small>
            </div>
          )}

          {/* КАДРЫ */}

          {active === "frames" && (
            <div className="demo-film">
              <div className="film-strip">
                {[0, 1, 2, 3, 4].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      className={`film-frame ${
                        frame === item
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setFrame(item)
                      }
                    >
                      <span>
                        {item === 0 &&
                          "✦"}

                        {item === 1 &&
                          "○"}

                        {item === 2 &&
                          "☾"}

                        {item === 3 &&
                          "↝"}

                        {item === 4 &&
                          "?"}
                      </span>

                      <small>
                        00:
                        {String(
                          12 + item * 7
                        ).padStart(
                          2,
                          "0"
                        )}
                      </small>
                    </button>
                  )
                )}
              </div>

              <div className="film-live">
                <small>
                  КАДР{" "}
                  {String(
                    frame + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </small>

                <b>
                  {frame === 0 &&
                    "что-то пролетело"}

                  {frame === 1 &&
                    "оно смотрит"}

                  {frame === 2 &&
                    "ночной кадр"}

                  {frame === 3 &&
                    "не стой на месте"}

                  {frame === 4 &&
                    "этот пока закрыт"}
                </b>
              </div>
            </div>
          )}

          {/* ЭКЗЕМПЛЯРЫ */}

          {active ===
            "specimens" && (
            <div className="demo-specimens">
              <div
                className={`specimen-object specimen-${specimen}`}
                onClick={() =>
                  setSpecimen(
                    (current) =>
                      (current + 1) % 3
                  )
                }
              >
                <span />
                <i />
                <b>
                  {specimen + 1}
                </b>
              </div>

              <div className="specimen-label">
                <small>
                  ЭКЗЕМПЛЯР №
                  {String(
                    specimen + 1
                  ).padStart(
                    3,
                    "0"
                  )}
                </small>

                <p>
                  {specimen === 0 &&
                    "назначение неизвестно"}

                  {specimen === 1 &&
                    "похоже, оно реагирует"}

                  {specimen === 2 &&
                    "лучше не спрашивать"}
                </p>
              </div>
            </div>
          )}

          {/* ОБЛАКО */}

          {active === "cloud" && (
            <div
              className="demo-cloud"
              onClick={shuffleCloud}
            >
              {cloudBits.map(
                (bit, index) => (
                  <span
                    key={`${bit}-${index}`}
                    style={{
                      "--cloud-i":
                        index,
                    }}
                  >
                    {bit}
                  </span>
                )
              )}

              <small>
                ткни в облако
              </small>
            </div>
          )}

          {/* АКВАРИУМ */}

          {active ===
            "aquarium" && (
            <div
              className="demo-aquarium"
              onPointerDown={
                addBubble
              }
            >
              <div className="aqua-creature creature-one">
                <span />
                <i />
              </div>

              <div className="aqua-creature creature-two">
                <span />
                <i />
              </div>

              <div className="aqua-creature creature-three">
                <span />
                <i />
              </div>

              {bubbles.map(
                (bubble) => (
                  <span
                    key={bubble.id}
                    className="aqua-bubble"
                    style={{
                      left:
                        `${bubble.x}%`,
                      width:
                        `${bubble.size}px`,
                      height:
                        `${bubble.size}px`,
                    }}
                  />
                )
              )}

              <small>
                коснись стекла
              </small>
            </div>
          )}

          {/* ПОЛКА */}

          {active === "shelf" && (
            <div className="demo-shelf">
              <div className="shelf-board">
                {[
                  ["orb", "шар"],
                  ["ticket", "не билет"],
                  ["thing", "???"],
                  ["bell", "тихо"],
                ].map(
                  ([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`shelf-object shelf-${id} ${
                        shelfSecret === id
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setShelfSecret(
                          id
                        )
                      }
                    >
                      <span />

                      <small>
                        {label}
                      </small>
                    </button>
                  )
                )}
              </div>

              <p>
                {shelfSecret
                  ? `ты тронула: ${shelfSecret}`
                  : "на полке точно всё нормально"}
              </p>
            </div>
          )}

          {/* НОЧНАЯ */}

          {active === "night" && (
            <div className="demo-night">
              <div className="night-moon">
                ☾
              </div>

              <span className="night-dot nd1">
                ·
              </span>

              <span className="night-dot nd2">
                ·
              </span>

              <span className="night-dot nd3">
                ·
              </span>

              <div className="night-copy">
                <small>
                  НОЧНАЯ СТОРОНА
                </small>

                <b>
                  здесь после полуночи
                  будет иначе
                </b>

                <p>
                  часть вещей можно
                  вообще не показывать
                  днём
                </p>
              </div>
            </div>
          )}

          {/* ЗЕРКАЛО */}

          {active === "mirror" && (
            <div
              className={`demo-mirror ${
                mirrorShift
                  ? "shifted"
                  : ""
              }`}
              onClick={() =>
                setMirrorShift(
                  (current) =>
                    !current
                )
              }
            >
              <div className="mirror-real">
                <small>
                  СЕЙЧАС
                </small>

                <h2>
                  всё нормально
                </h2>

                <p>
                  или почти
                </p>
              </div>

              <div className="mirror-line" />

              <div className="mirror-copy">
                <small>
                  СЕЙЧАС
                </small>

                <h2>
                  всё нормально
                </h2>

                <p>
                  {mirrorShift
                    ? "я бы не была так уверена"
                    : "или почти"}
                </p>
              </div>

              <span>
                нажми на отражение
              </span>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
