"use client";

import { useState } from "react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");

  const [message, setMessage] = useState(
    "бусссс ты те надулась"
  );

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  async function sendNow() {
    try {
      setSending(true);
      setStatus("Отправляю…");

      const response = await fetch(
        "/api/send-push",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${secret}`,
          },

          body: JSON.stringify({
            title: "Внеплановый привет ❤️",
            body: message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Ошибка отправки"
        );
      }

      if (data.sent > 0) {
        setStatus(
          `Улетело сразу ❤️ Отправлено: ${data.sent}`
        );
      } else {
        setStatus(
          `Не отправилось. Подписок: ${data.total || 0}`
        );

        console.log(data.errors);
      }
    } catch (error) {
      setStatus(
        error?.message || "Ошибка"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        padding: "40px 18px",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          width: "min(100%, 450px)",
          padding: "22px",
          borderRadius: "24px",
          background: "rgba(255,255,255,.06)",
        }}
      >
        <h1>Отправить сейчас</h1>

        <input
          type="password"
          placeholder="PUSH_SECRET"
          value={secret}
          onChange={(e) =>
            setSecret(e.target.value)
          }
          style={{
            width: "100%",
            padding: "13px",
            marginBottom: "12px",
            borderRadius: "12px",
          }}
        />

        <textarea
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          rows={4}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "12px",
          }}
        />

        <button
          onClick={sendNow}
          disabled={sending}
          style={{
            width: "100%",
            marginTop: "14px",
            padding: "14px",
            borderRadius: "14px",
            cursor: "pointer",
          }}
        >
          {sending
            ? "Отправляю…"
            : "Отправить прямо сейчас ❤️"}
        </button>

        {status && (
          <p
            style={{
              textAlign: "center",
              marginTop: "12px",
            }}
          >
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
