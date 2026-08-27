{
  easterEgg &&
  (

    <div
      className={`
        camp-easter-overlay
        camp-easter-${easterEgg.type}
      `}
      onClick={() =>
        setEasterEgg(
          null
        )
      }
    >


      <div className="camp-easter-particles">

        {
          Array.from({
            length: 18,
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
                  "--i":
                    index,
                }}
              >
                {
                  easterEgg.type === "fire"
                    ? "✦"

                    : easterEgg.type === "water"
                      ? "·"

                      : easterEgg.type === "dragon"
                        ? "♡"

                        : "✦"
                }
              </i>

            )
          )
        }

      </div>


      <div className="camp-easter-content">


        <span className="camp-easter-icon">
          {easterEgg.icon}
        </span>


        <small>
          {easterEgg.eyebrow}
        </small>


        <h2>
          {easterEgg.title}
        </h2>


        <p>
          {easterEgg.text}
        </p>


        <span className="camp-easter-tap">
          нажми, чтобы закрыть
        </span>


      </div>


    </div>

  )
}
