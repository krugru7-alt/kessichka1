"use client";

import {
  useState,
} from "react";


const QUICK_MESSAGES = [

  "Не забудь поесть, бус ♥",

  "Просто маленький тьмок тебе 💋",

  "Я тут. Хорошего тебе дня ♥",

];


export default function PushSender() {

  const [
    message,
    setMessage,
  ] = useState(
    ""
  );


  const [
    sending,
    setSending,
  ] = useState(
    false
  );


  const [
    result,
    setResult,
  ] = useState(
    ""
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  async function send(
    event
  ) {

    event.preventDefault();


    const value =
      message.trim();


    if (
      !value ||
      sending
    ) {
      return;
    }


    try {

      setSending(
        true
      );


      setResult(
        ""
      );


      setError(
        ""
      );


      const response =
        await fetch(
          "/api/admin/push",
          {

            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                message:
                  value,
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
          "Не получилось отправить"
        );

      }


      setResult(
        data.sent === 1
          ? "Привет отправлен Кэссичке ♥"
          : `Отправлено на ${data.sent} устройств ♥`
      );


      setMessage(
        ""
      );


    } catch (error) {

      setError(
        error?.message ||
        "Не получилось отправить"
      );


    } finally {

      setSending(
        false
      );

    }
  }


  return (

    <article className="world-admin-card admin-push-card">


      <span className="admin-push-icon">
        🔔
      </span>


      <small>
        ПРИВЕТЫ
      </small>


      <h2>
        Push Кэссичке
      </h2>


      <p>
        Напиши что-нибудь —
        и это прилетит ей
        уведомлением.
      </p>


      <form
        className="admin-push-form"
        onSubmit={
          send
        }
      >


        <textarea
          rows={3}
          maxLength={220}
          value={
            message
          }
          placeholder="Что отправим буське?"
          onChange={
            (event) =>
              setMessage(
                event.target.value
              )
          }
        />


        <div className="admin-push-counter">
          {message.length}/220
        </div>


        <div className="admin-push-quick">

          {
            QUICK_MESSAGES.map(
              (item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setMessage(
                      item
                    )
                  }
                >
                  {item}
                </button>

              )
            )
          }

        </div>


        <button
          type="submit"
          className="admin-push-send"
          disabled={
            sending ||
            !message.trim()
          }
        >

          {
            sending
              ? "Отправляю…"
              : "Отправить привет ♥"
          }

        </button>


      </form>


      {
        result &&
        (

          <div className="admin-push-success">
            ✓ {result}
          </div>

        )
      }


      {
        error &&
        (

          <div className="admin-push-error">
            {error}
          </div>

        )
      }


    </article>
  );
}
