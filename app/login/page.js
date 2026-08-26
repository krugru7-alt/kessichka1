"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";


export default function LoginPage() {

  const router =
    useRouter();


  const [
    mode,
    setMode,
  ] = useState(
    "choose"
  );


  const [
    password,
    setPassword,
  ] = useState(
    ""
  );


  const [
    loading,
    setLoading,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );



  /* =====================================================
     ЕСЛИ УЖЕ ВОШЛИ
  ===================================================== */

  useEffect(() => {

    let active =
      true;


    async function check() {

      try {

        const response =
          await fetch(
            "/api/auth/me",
            {

              cache:
                "no-store",

            }
          );


        if (
          active &&
          response.ok
        ) {

          router.replace(
            "/"
          );

        }

      } catch {
        // просто остаёмся на входе
      }
    }


    check();


    return () => {

      active =
        false;

    };

  }, [
    router,
  ]);



  /* =====================================================
     КЭССИЧКА
  ===================================================== */

  async function enterAsKessi() {

    if (loading) {
      return;
    }


    try {

      setLoading(
        true
      );


      setError(
        ""
      );


      const response =
        await fetch(
          "/api/auth/kessi",
          {

            method:
              "POST",

          }
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data?.ok
      ) {

        throw new Error(
          data?.error ||
          "Ошибка входа"
        );

      }


      window.location.href =
        "/";


    } catch (error) {

      setError(
        error?.message ||
        "Не получилось войти"
      );


      setLoading(
        false
      );

    }
  }



  /* =====================================================
     ОБСИДИК
  ===================================================== */

  async function enterAsObsid(
    event
  ) {

    event.preventDefault();


    if (
      loading ||
      !password
    ) {

      return;

    }


    try {

      setLoading(
        true
      );


      setError(
        ""
      );


      const response =
        await fetch(
          "/api/auth/obsid",
          {

            method:
              "POST",


            headers: {

              "Content-Type":
                "application/json",

            },


            body:
              JSON.stringify({

                password,

              }),

          }
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data?.ok
      ) {

        throw new Error(
          data?.error ||
          "Ошибка входа"
        );

      }


      window.location.href =
        "/";


    } catch (error) {

      setError(
        error?.message ||
        "Не получилось войти"
      );


      setLoading(
        false
      );

    }
  }



  return (

    <main className="world-login">


      <div className="world-login-glow" />


      <section className="world-login-card">


        <div className="world-login-heart">
          ♥
        </div>


        <small className="world-login-kicker">
          ТОЛЬКО ДЛЯ НАС
        </small>


        <h1>
          Наш мирок
        </h1>


        <p className="world-login-subtitle">
          наш маленький уголок
          в интернете
        </p>



        {
          mode ===
          "choose"
            ? (

              <div className="world-login-choose">


                <p>
                  Кто здесь?
                </p>


                <button
                  type="button"
                  className="world-person kessi"
                  disabled={
                    loading
                  }
                  onClick={
                    enterAsKessi
                  }
                >

                  <span>
                    ♡
                  </span>


                  <div>

                    <b>
                      Кэссичка
                    </b>

                    <small>
                      заходи, бус
                    </small>

                  </div>


                  <i>
                    →
                  </i>

                </button>



                <button
                  type="button"
                  className="world-person obsid"
                  disabled={
                    loading
                  }
                  onClick={() => {

                    setError(
                      ""
                    );


                    setMode(
                      "obsid"
                    );

                  }}
                >

                  <span>
                    ✦
                  </span>


                  <div>

                    <b>
                      Обсидик
                    </b>

                    <small>
                      тут нужна проверка
                    </small>

                  </div>


                  <i>
                    →
                  </i>

                </button>


              </div>

            )
            : (

              <form
                className="world-obsid-login"
                onSubmit={
                  enterAsObsid
                }
              >


                <button
                  type="button"
                  className="world-login-back"
                  onClick={() => {

                    setMode(
                      "choose"
                    );


                    setError(
                      ""
                    );


                    setPassword(
                      ""
                    );

                  }}
                >
                  ← назад
                </button>


                <div className="world-obsid-symbol">
                  ✦
                </div>


                <h2>
                  Обсидик
                </h2>


                <p>
                  тут нужна маленькая
                  проверка 👀
                </p>


                <input
                  type="password"
                  value={
                    password
                  }
                  autoFocus
                  autoComplete="current-password"
                  placeholder="Пароль"
                  onChange={
                    (event) =>
                      setPassword(
                        event.target.value
                      )
                  }
                />


                <button
                  type="submit"
                  className="world-login-submit"
                  disabled={
                    loading ||
                    !password
                  }
                >

                  {
                    loading
                      ? "Проверяю…"
                      : "Войти"
                  }

                </button>


              </form>

            )
        }



        {
          error &&
          (

            <p className="world-login-error">
              {error}
            </p>

          )
        }



        <div className="world-login-dragon">

          <img
            src="/drakosha.png"
            alt="Дракоша"
          />

        </div>


      </section>


    </main>
  );
}
