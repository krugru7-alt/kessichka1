"use client";

import { useEffect, useState } from "react";


function urlBase64ToUint8Array(base64String) {

  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (
      base64String + padding
    )
      .replace(/-/g, "+")
      .replace(/_/g, "/");


  const rawData =
    window.atob(base64);


  return Uint8Array.from(
    [...rawData].map(
      (char) =>
        char.charCodeAt(0)
    )
  );

}



export default function PushReconnectButton() {

  const [status, setStatus] =
    useState("checking");

  const [message, setMessage] =
    useState("");



  useEffect(() => {

    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {

      setStatus("unsupported");

      return;
    }


    if (
      Notification.permission ===
      "granted"
    ) {

      setStatus("granted");

      setMessage(
        "Уведомления разрешены. Можно переподключить устройство."
      );

      return;
    }


    if (
      Notification.permission ===
      "denied"
    ) {

      setStatus("denied");

      setMessage(
        "Уведомления запрещены в браузере."
      );

      return;
    }


    setStatus("default");

  }, []);



  async function connectPush() {

    try {

      setStatus("loading");

      setMessage(
        "Подключаем уведомления…"
      );


      /* =============================================
         1. Проверяем разрешение
      ============================================= */

      let permission =
        Notification.permission;


      if (
        permission === "default"
      ) {

        permission =
          await Notification.requestPermission();

      }


      if (
        permission === "denied"
      ) {

        setStatus("denied");

        setMessage(
          "Браузер заблокировал уведомления. Разреши их в настройках сайта и нажми кнопку ещё раз."
        );

        return;

      }


      if (
        permission !== "granted"
      ) {

        setStatus("default");

        setMessage(
          "Разрешение на уведомления не получено."
        );

        return;

      }



      /* =============================================
         2. Service Worker
      ============================================= */

      await navigator.serviceWorker.register(
        "/sw.js"
      );


      const registration =
        await navigator.serviceWorker.ready;



      /* =============================================
         3. VAPID PUBLIC KEY
      ============================================= */

      const publicKey =
        process.env
          .NEXT_PUBLIC_VAPID_PUBLIC_KEY;


      if (!publicKey) {

        throw new Error(
          "NEXT_PUBLIC_VAPID_PUBLIC_KEY не найден"
        );

      }



      /* =============================================
         4. Удаляем старую подписку

         Это специально:
         если раньше были другие VAPID-ключи,
         создадим полностью новую подписку.
      ============================================= */

      const oldSubscription =
        await registration.pushManager
          .getSubscription();


      if (oldSubscription) {

        try {

          await oldSubscription
            .unsubscribe();

        } catch (error) {

          console.warn(
            "Не удалось удалить старую подписку:",
            error
          );

        }

      }



      /* =============================================
         5. Создаём новую подписку
      ============================================= */

      const subscription =
        await registration.pushManager
          .subscribe({

            userVisibleOnly:
              true,

            applicationServerKey:
              urlBase64ToUint8Array(
                publicKey
              ),

          });



      const subscriptionJson =
        subscription.toJSON();



      /* =============================================
         6. Сохраняем в старой Push-системе

         Оставляем для совместимости.
      ============================================= */

      const subscribeResponse =
        await fetch(
          "/api/subscribe",
          {

            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                subscriptionJson
              ),

          }
        );


      if (
        !subscribeResponse.ok
      ) {

        const data =
          await subscribeResponse
            .json()
            .catch(() => ({}));


        throw new Error(
          data?.error ||
          "Не удалось сохранить Push-подписку"
        );

      }



      /* =============================================
         7. Привязываем устройство
            к Кэссичке / Обсидику

         Сервер сам смотрит текущую сессию.
      ============================================= */

      const registerResponse =
        await fetch(
          "/api/push/register",
          {

            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                subscriptionJson
              ),

          }
        );


      const registerData =
        await registerResponse
          .json()
          .catch(() => ({}));


      if (
        !registerResponse.ok
      ) {

        throw new Error(
          registerData?.error ||
          "Не удалось привязать устройство"
        );

      }



      /* =============================================
         ГОТОВО
      ============================================= */

      setStatus("success");

      setMessage(
        registerData?.user === "kessi"
          ? "Готово ♥ Устройство Кэссички подключено."
          : "Готово. Устройство подключено."
      );


    } catch (error) {

      console.error(
        "PUSH CONNECT:",
        error
      );


      setStatus("error");

      setMessage(
        error?.message ||
        "Не удалось подключить уведомления."
      );

    }

  }



  return (

    <div className="push-reconnect">


      <button
        type="button"
        className={`
          push-reconnect-button
          push-status-${status}
        `}
        onClick={
          connectPush
        }
        disabled={
          status ===
          "loading"
        }
      >

        <span className="push-reconnect-icon">
          {
            status === "success"
              ? "✓"
              : "◉"
          }
        </span>


        <span>

          <b>

            {
              status === "loading"
                ? "Подключаем…"

                : status === "success"
                  ? "Уведомления подключены"

                  : status === "granted"
                    ? "Переподключить уведомления"

                    : "Подключить уведомления"
            }

          </b>


          <small>

            {
              status === "success"
                ? "этот телефон зарегистрирован"

                : "нажми, чтобы разрешить Push"
            }

          </small>

        </span>

      </button>


      {
        message &&
        (

          <p className="push-reconnect-message">
            {message}
          </p>

        )
      }


      {
        status === "denied" &&
        (

          <p className="push-reconnect-help">

            Разрешение уже было запрещено.
            Открой настройки этого сайта
            в браузере → Уведомления →
            Разрешить, а потом вернись
            сюда и нажми кнопку снова.

          </p>

        )
      }


      {
        status === "unsupported" &&
        (

          <p className="push-reconnect-help">

            Этот браузер не поддерживает
            Push-уведомления.

          </p>

        )
      }


    </div>

  );

}
