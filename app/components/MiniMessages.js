"use client";

import {
  useEffect,
  useState,
} from "react";


const AUTHORS = {
  obsid: "Обсидик",
  kessi: "Кэссичка",
};


function formatMessageTime(
  value
) {
  if (!value) {
    return "";
  }


  try {
    return new Intl.DateTimeFormat(
      "ru-RU",
      {
        timeZone:
          "Europe/Minsk",

        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    ).format(
      new Date(value)
    );

  } catch {
    return "";
  }
}


export default function MiniMessages() {

  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    sender,
    setSender,
  ] = useState("obsid");


  const [
    text,
    setText,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    sending,
    setSending,
  ] = useState(false);


  const [
    opened,
    setOpened,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     ЗАГРУЗКА
  ===================================================== */

  async function loadMessages() {
    try {
      const response =
        await fetch(
          "/api/messages",
          {
            cache:
              "no-store",
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
            "Ошибка загрузки"
        );
      }


      setMessages(
        data.messages ||
          []
      );


      setError("");

    } catch (error) {
      console.error(
        error
      );


      setError(
        "Не получилось загрузить послания"
      );

    } finally {
      setLoading(
        false
      );
    }
  }


  /* =====================================================
     ПЕРВЫЙ ЗАПУСК
  ===================================================== */

  useEffect(() => {

    try {
      const saved =
        localStorage.getItem(
          "kessi-message-author"
        );


      if (
        saved === "obsid" ||
        saved === "kessi"
      ) {
        setSender(
          saved
        );
      }

    } catch {
      // ничего страшного
    }


    loadMessages();


    const timer =
      window.setInterval(
        loadMessages,
        15000
      );


    return () =>
      window.clearInterval(
        timer
      );

  }, []);


  /* =====================================================
     ВЫБОР АВТОРА
  ===================================================== */

  function chooseSender(
    value
  ) {
    setSender(
      value
    );


    try {
      localStorage.setItem(
        "kessi-message-author",
        value
      );
    } catch {
      // ничего страшного
    }
  }


  /* =====================================================
     ОТПРАВИТЬ
  ===================================================== */

  async function sendMessage(
    event
  ) {
    event.preventDefault();


    const message =
      text.trim();


    if (
      !message ||
      sending
    ) {
      return;
    }


    try {
      setSending(
        true
      );


      setError(
        ""
      );


      const response =
        await fetch(
          "/api/messages",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sender,
                message,
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
            "Ошибка отправки"
        );
      }


      setText(
        ""
      );


      setOpened(
        false
      );


      await loadMessages();

    } catch (error) {
      console.error(
        error
      );


      setError(
        "Послание не отправилось"
      );

    } finally {
      setSending(
        false
      );
    }
  }


  const visibleMessages =
    messages.slice(
      -4
    );


  return (
    <section className="mini-messages">


      <header className="mini-messages-head">

        <div>

          <small>
            ✉ НАШ МИНИ-ЭКРАНЧИК
          </small>


          <h2>
            Послания друг другу
          </h2>

        </div>


        <span>
          ♥
        </span>

      </header>


      <div className="mini-message-author">

        <span>
          Пишу как:
        </span>


        <button
          type="button"
          className={
            sender === "obsid"
              ? "active"
              : ""
          }
          onClick={() =>
            chooseSender(
              "obsid"
            )
          }
        >
          Обсидик
        </button>


        <button
          type="button"
          className={
            sender === "kessi"
              ? "active"
              : ""
          }
          onClick={() =>
            chooseSender(
              "kessi"
            )
          }
        >
          Кэссичка
        </button>

      </div>


      <div className="mini-message-feed">

        {
          loading &&
          (
            <div className="mini-message-empty">
              Загружаем послания…
            </div>
          )
        }


        {
          !loading &&
          visibleMessages.length ===
          0 &&
          (
            <div className="mini-message-empty">

              <span>
                ♡
              </span>

              <b>
                Пока здесь тихо
              </b>

              <small>
                Можно оставить первое послание
              </small>

            </div>
          )
        }


        {
          visibleMessages.map(
            (item) => (

              <article
                key={
                  item.id
                }
                className={
                  `mini-message-card ${
                    item.sender ===
                    sender
                      ? "mine"
                      : ""
                  }`
                }
              >

                <header>

                  <b>
                    {
                      AUTHORS[
                        item.sender
                      ] ||
                      "Послание"
                    }
                  </b>


                  <small>
                    Минск ·{" "}
                    {
                      formatMessageTime(
                        item.createdAt
                      )
                    }
                  </small>

                </header>


                <p>
                  {
                    item.message
                  }
                </p>

              </article>

            )
          )
        }

      </div>


      {
        error &&
        (
          <p className="mini-message-error">
            {error}
          </p>
        )
      }


      {
        !opened
          ? (

            <button
              type="button"
              className="mini-message-open"
              onClick={() =>
                setOpened(
                  true
                )
              }
            >

              <span>
                Оставить послание
              </span>

              <b>
                ✎
              </b>

            </button>

          )
          : (

            <form
              className="mini-message-form"
              onSubmit={
                sendMessage
              }
            >

              <textarea
                value={
                  text
                }
                maxLength={
                  180
                }
                rows={
                  3
                }
                autoFocus
                placeholder={
                  `Послание от ${
                    AUTHORS[
                      sender
                    ]
                  }…`
                }
                onChange={
                  (event) =>
                    setText(
                      event.target.value
                    )
                }
              />


              <div className="mini-message-form-bottom">

                <small>
                  {text.length}/180
                </small>


                <button
                  type="button"
                  onClick={() => {
                    setOpened(
                      false
                    );

                    setText(
                      ""
                    );
                  }}
                >
                  Отмена
                </button>


                <button
                  type="submit"
                  className="primary"
                  disabled={
                    !text.trim() ||
                    sending
                  }
                >
                  {
                    sending
                      ? "Отправляем…"
                      : "Оставить ♥"
                  }
                </button>

              </div>

            </form>

          )
      }

    </section>
  );
}
