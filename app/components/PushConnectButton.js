"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function PushConnectButton() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkPush() {
      try {
        if (
          !("serviceWorker" in navigator) ||
          !("Notification" in window)
        ) {
          return;
        }

        if (Notification.permission !== "granted") {
          return;
        }

        const registration =
          await navigator.serviceWorker.ready;

        const subscription =
          await registration.pushManager.getSubscription();

        setEnabled(Boolean(subscription));
      } catch {}
    }

    checkPush();
  }, []);

  async function connectPush() {
    try {
      setLoading(true);

      if (!("Notification" in window)) {
        alert("Этот браузер не поддерживает уведомления.");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        alert("Этот браузер не поддерживает Push-уведомления.");
        return;
      }

      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Разрешение на уведомления не получено.");
        return;
      }

      const publicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error(
          "NEXT_PUBLIC_VAPID_PUBLIC_KEY не найден"
        );
      }

      const registration =
        await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(publicKey),
          });
      }

      await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      await fetch("/api/push/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      setEnabled(true);
    } catch (error) {
      console.error("PUSH CONNECT:", error);
      alert("Не получилось подключить уведомления.");
    } finally {
      setLoading(false);
    }
  }

  if (enabled) {
    return (
      <button
        type="button"
        className="push-connect-button is-enabled"
        disabled
      >
        🔔 Приветы подключены
      </button>
    );
  }

  return (
    <button
      type="button"
      className="push-connect-button"
      onClick={connectPush}
      disabled={loading}
    >
      {loading
        ? "Подключаю…"
        : "🔔 Подключить уведомления"}
    </button>
  );
}
