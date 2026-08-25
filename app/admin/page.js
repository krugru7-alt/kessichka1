"use client";

import { useState } from "react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");

  const [title, setTitle] = useState(
    "Внеплановый привет ❤️"
  );

  const [body, setBody] = useState(
    "бусссс ты те надулась"
  );

  const [sending, setSending] =
    useState(false);

  const [status, setStatus] =
    useState("");

  async function sendPush() {
    if (!secret.trim()) {
      setStatus("Введи секретный ключ");
      return;
    }

    if (!body.trim()) {
      setStatus("Напиши сообщение");
      return;
    }

    try {
      setSending(true);
      setStatus("Отправляю…");

      const response = await fetch(
        "/api/send-push",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${secret}`,
          },

          body: JSON.stringify({
            title: title.trim(),
            body: body.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Ошибка отправки"
        );
      }

      setStatus(
        `Отправлено ❤️ (${data.sent || 0})`
      );
    } catch (error) {
      setStatus(
        error?.message ||
          "Ошибка отправки"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        padding: "40px 18px 120px",

        display: "grid",
        placeItems: "center",
      }}
    >
      <section
        style={{
          width: "min(100%, 480px)",

          padding: "24px",

          border:
            "1px solid rgba(255,255,255,.10)",

          borderRadius: "26px",

          background:
            "rgba(255,255,255,.045)",

          backdropFilter:
            "blur(18px)",
        }}
      >
        <small
          style={{
            opacity: 0.4,
            letterSpacing: ".18em",
          }}
        >
          ADMIN
        </small>

        <h1
          style={{
            margin: "7px 0 6px",
          }}
        >
          Внеплановый привет
        </h1>

        <p
          style={{
            margin: "0 0 22px",

            opacity: 0.45,

            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          Сообщение сразу прилетит
          Push-уведомлением.
        </p>

        <label
          style={{
            display: "grid",
            gap: "6px",

            marginBottom: "13px",
          }}
        >
          <small
            style={{
              opacity: 0.4,
            }}
          >
            PUSH SECRET
          </small>

          <input
            type="password"
            value={secret}
            onChange={(event) =>
              setSecret(
                event.target.value
              )
            }
            placeholder="Секретный ключ"
            style={{
              width: "100%",

              padding: "13px 14px",

              border:
                "1px solid rgba(255,255,255,.10)",

              borderRadius: "14px",

              color: "white",

              background:
                "rgba(0,0,0,.18)",

              outline: "none",
            }}
          />
        </label>

        <label
          style={{
            display: "grid",
            gap: "6px",

            marginBottom: "13px",
          }}
        >
          <small
            style={{
              opacity: 0.4,
            }}
          >
            ЗАГОЛОВОК
          </small>

          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            style={{
              width: "100%",

              padding: "13px 14px",

              border:
                "1px solid rgba(255,255,255,.10)",

              borderRadius: "14px",

              color: "white",

              background:
                "rgba(0,0,0,.18)",

              outline: "none",
            }}
          />
        </label>

        <label
          style={{
            display: "grid",
            gap: "6px",
          }}
        >
          <small
            style={{
              opacity: 0.4,
            }}
          >
            СООБЩЕНИЕ
          </small>

          <textarea
            value={body}
            onChange={(event) =>
              setBody(
                event.target.value
              )
            }
            rows={5}
            style={{
              width: "100%",

              padding: "13px 14px",

              resize: "vertical",

              border:
                "1px solid rgba(255,255,255,.10)",

              borderRadius: "14px",

              color: "white",

              background:
                "rgba(0,0,0,.18)",

              outline: "none",
            }}
          />
        </label>

        <button
          type="button"
          onClick={sendPush}
          disabled={sending}
          style={{
            width: "100%",

            marginTop: "16px",

            padding: "14px",

            border:
              "1px solid rgba(255,100,145,.22)",

            borderRadius: "15px",

            color: "white",

            background:
              "linear-gradient(135deg, rgba(255,70,120,.22), rgba(255,255,255,.06))",

            fontWeight: 700,

            cursor:
              sending
                ? "default"
                : "pointer",

            opacity:
              sending ? 0.6 : 1,
          }}
        >
          {sending
            ? "Отправляю…"
            : "Отправить на телефон ❤️"}
        </button>

        {status && (
          <div
            style={{
              marginTop: "13px",

              padding: "10px",

              borderRadius: "12px",

              background:
                "rgba(255,255,255,.035)",

              fontSize: "11px",

              textAlign: "center",
            }}
          >
            {status}
          </div>
        )}
      </section>
    </main>
  );
}
