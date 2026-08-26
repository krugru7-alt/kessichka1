"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


const AUTHORS = {

  obsid:
    "Обсидик",

  kessi:
    "Кэссичка",

};



/* =====================================================
   ВРЕМЯ ПО МИНСКУ
===================================================== */

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
      new Date(
        value
      )
    );


  } catch {

    return "";

  }
}



/* =====================================================
   КОМПОНЕНТ
===================================================== */

export default function MiniMessages() {

  const [
    messages,
    setMessages,
  ] = useState([]);


  const [
    sender,
    setSender,
  ] = useState(
    "obsid"
  );


  const [
    text,
    setText,
  ] = useState(
    ""
  );


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    sending,
    setSending,
  ] = useState(
    false
  );


  const [
    opened,
    setOpened,
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
     РИСОВАНИЕ
  ===================================================== */

  const [
    drawingHasInk,
    setDrawingHasInk,
  ] = useState(
    false
  );


  const [
    eraserMode,
    setEraserMode,
  ] = useState(
    false
  );


  const [
    canUndo,
    setCanUndo,
  ] = useState(
    false
  );


  const canvasRef =
    useRef(null);


  const drawingRef =
    useRef(false);


  const historyRef =
    useRef([]);



  /* =====================================================
     ЗАГРУЗКА ПОСЛАНИЙ
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


      setError(
        ""
      );


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


    /*
      Раз в 15 секунд проверяем,
      не появилось ли новое послание.
    */

    const timer =
      window.setInterval(
        loadMessages,
        15000
      );


    return () => {

      window.clearInterval(
        timer
      );

    };

  }, []);



  /* =====================================================
     ВЫБИРАЕМ, КТО ПИШЕТ
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
     ПОДГОТОВКА CANVAS
  ===================================================== */

  function prepareCanvas() {

    const canvas =
      canvasRef.current;


    if (!canvas) {
      return;
    }


    const rect =
      canvas.getBoundingClientRect();


    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }


    const ratio =
      Math.min(
        window.devicePixelRatio ||
        1,
        2
      );


    canvas.width =
      Math.round(
        rect.width *
        ratio
      );


    canvas.height =
      Math.round(
        rect.height *
        ratio
      );


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    context.lineCap =
      "round";


    context.lineJoin =
      "round";


    context.strokeStyle =
      "#7d3840";


    context.lineWidth =
      3 *
      ratio;


    context.globalCompositeOperation =
      "source-over";


    historyRef.current =
      [];


    setCanUndo(
      false
    );


    setDrawingHasInk(
      false
    );


    setEraserMode(
      false
    );
  }



  /* =====================================================
     КОГДА ОТКРЫВАЕМ РЕДАКТОР
  ===================================================== */

  useEffect(() => {

    if (!opened) {
      return;
    }


    const timer =
      window.setTimeout(
        prepareCanvas,
        80
      );


    return () => {

      window.clearTimeout(
        timer
      );

    };

  }, [
    opened,
  ]);



  /* =====================================================
     КООРДИНАТЫ ПАЛЬЦА / МЫШКИ
  ===================================================== */

  function getCanvasPoint(
    event
  ) {

    const canvas =
      canvasRef.current;


    if (!canvas) {
      return null;
    }


    const rect =
      canvas.getBoundingClientRect();


    return {

      x:
        (
          event.clientX -
          rect.left
        ) *
        (
          canvas.width /
          rect.width
        ),


      y:
        (
          event.clientY -
          rect.top
        ) *
        (
          canvas.height /
          rect.height
        ),

    };
  }



  /* =====================================================
     СОХРАНЯЕМ ШАГ ДЛЯ "НАЗАД"
  ===================================================== */

  function saveHistory() {

    const canvas =
      canvasRef.current;


    if (!canvas) {
      return;
    }


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    try {

      const snapshot =
        context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );


      historyRef.current.push(
        snapshot
      );


      /*
        Храним максимум 25 действий.
      */

      if (
        historyRef.current.length >
        25
      ) {

        historyRef.current.shift();

      }


      setCanUndo(
        true
      );


    } catch (error) {

      console.error(
        "Не удалось сохранить шаг рисунка:",
        error
      );

    }
  }



  /* =====================================================
     ЕСТЬ ЛИ РИСУНОК
  ===================================================== */

  function canvasHasInk() {

    const canvas =
      canvasRef.current;


    if (!canvas) {
      return false;
    }


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return false;
    }


    const pixels =
      context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;


    /*
      Проверяем альфа-канал.
    */

    for (
      let index = 3;
      index < pixels.length;
      index += 4
    ) {

      if (
        pixels[index] >
        0
      ) {

        return true;

      }
    }


    return false;
  }



  /* =====================================================
     НАЧАЛО РИСОВАНИЯ
  ===================================================== */

  function startDrawing(
    event
  ) {

    event.preventDefault();


    const canvas =
      canvasRef.current;


    if (!canvas) {
      return;
    }


    if (
      eraserMode &&
      !drawingHasInk
    ) {
      return;
    }


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    saveHistory();


    const scale =
      canvas.width /
      canvas.getBoundingClientRect()
        .width;


    if (eraserMode) {

      context.globalCompositeOperation =
        "destination-out";


      context.lineWidth =
        19 *
        scale;

    } else {

      context.globalCompositeOperation =
        "source-over";


      context.strokeStyle =
        "#7d3840";


      context.lineWidth =
        3 *
        scale;

    }


    const point =
      getCanvasPoint(
        event
      );


    if (!point) {
      return;
    }


    drawingRef.current =
      true;


    canvas.setPointerCapture?.(
      event.pointerId
    );


    context.beginPath();


    context.moveTo(
      point.x,
      point.y
    );
  }



  /* =====================================================
     РИСУЕМ
  ===================================================== */

  function draw(
    event
  ) {

    if (
      !drawingRef.current
    ) {
      return;
    }


    event.preventDefault();


    const canvas =
      canvasRef.current;


    if (!canvas) {
      return;
    }


    const context =
      canvas.getContext(
        "2d"
      );


    const point =
      getCanvasPoint(
        event
      );


    if (
      !context ||
      !point
    ) {
      return;
    }


    context.lineTo(
      point.x,
      point.y
    );


    context.stroke();


    if (!eraserMode) {

      setDrawingHasInk(
        true
      );

    }
  }



  /* =====================================================
     ЗАКОНЧИЛИ ШТРИХ
  ===================================================== */

  function stopDrawing(
    event
  ) {

    if (
      !drawingRef.current
    ) {
      return;
    }


    drawingRef.current =
      false;


    canvasRef.current
      ?.releasePointerCapture?.(
        event.pointerId
      );


    if (eraserMode) {

      setDrawingHasInk(
        canvasHasInk()
      );

    }
  }



  /* =====================================================
     НАЗАД
  ===================================================== */

  function undoDrawing() {

    const canvas =
      canvasRef.current;


    if (!canvas) {
      return;
    }


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    const previous =
      historyRef.current.pop();


    if (!previous) {

      setCanUndo(
        false
      );


      return;
    }


    context.putImageData(
      previous,
      0,
      0
    );


    setDrawingHasInk(
      canvasHasInk()
    );


    setCanUndo(
      historyRef.current.length >
      0
    );
  }



  /* =====================================================
     ОЧИСТИТЬ РИСУНОК
  ===================================================== */

  function clearDrawing() {

    const canvas =
      canvasRef.current;


    if (!canvas) {
      return;
    }


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    if (
      drawingHasInk
    ) {

      saveHistory();

    }


    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    setDrawingHasInk(
      false
    );


    setEraserMode(
      false
    );
  }



  /* =====================================================
     ЗАКРЫТЬ РЕДАКТОР
  ===================================================== */

  function closeComposer() {

    setOpened(
      false
    );


    setText(
      ""
    );


    setDrawingHasInk(
      false
    );


    setEraserMode(
      false
    );


    setCanUndo(
      false
    );


    historyRef.current =
      [];
  }



  /* =====================================================
     ОТПРАВИТЬ
  ===================================================== */

  async function sendMessage(
    event
  ) {

    event.preventDefault();


    if (sending) {
      return;
    }


    const message =
      text.trim();


    let drawingImage =
      "";


    if (
      drawingHasInk &&
      canvasRef.current
    ) {

      /*
        WebP заметно меньше PNG,
        поэтому база не раздувается.
      */

      drawingImage =
        canvasRef.current
          .toDataURL(
            "image/webp",
            0.82
          );

    }


    if (
      !message &&
      !drawingImage
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

                drawingImage,

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


     const savedMessage =
  data.message;


if (savedMessage) {
  setMessages(
    (current) => [
      ...current,
      savedMessage,
    ].slice(-12)
  );
}


closeComposer();


/*
  Обновляем серверный список
  отдельно.

  Даже если интернет мигнул,
  уже сохранённое послание
  не будет выглядеть как ошибка.
*/

window.setTimeout(
  () => {
    loadMessages();
  },
  300
);


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
      -6
    );



  /* =====================================================
     РЕНДЕР
  ===================================================== */

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



      {/* =================================================
          КТО ПИШЕТ
      ================================================= */}

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



      {/* =================================================
          ЛЕНТА
      ================================================= */}

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
                Можно написать или нарисовать первое послание
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


                {
                  item.message &&
                  (

                    <p>
                      {
                        item.message
                      }
                    </p>

                  )
                }


                {
                  item.drawingImage &&
                  (

                    <div className="mini-message-drawing">

                      <img
                        src={
                          item.drawingImage
                        }
                        alt="Рисунок в послании"
                      />

                    </div>

                  )
                }

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



      {/* =================================================
          КНОПКА ОТКРЫТЬ
      ================================================= */}

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

            /* =================================================
               РЕДАКТОР
            ================================================= */

            <form
              className="mini-message-form mini-message-form-draw"
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
                  2
                }
                placeholder={
                  "Можно написать что-нибудь…"
                }
                onChange={
                  (event) =>
                    setText(
                      event.target.value
                    )
                }
              />



              {/* ===============================================
                  РИСОВАЛКА
              =============================================== */}

              <div className="mini-draw-section">


                <div className="mini-draw-title">

                  <span>
                    или нарисуй
                  </span>


                  <small>
                    пальцем / мышкой
                  </small>

                </div>


                <div className="mini-draw-paper">

                  <canvas
                    ref={
                      canvasRef
                    }
                    onPointerDown={
                      startDrawing
                    }
                    onPointerMove={
                      draw
                    }
                    onPointerUp={
                      stopDrawing
                    }
                    onPointerCancel={
                      stopDrawing
                    }
                  />


                  {
                    !drawingHasInk &&
                    (

                      <span className="mini-draw-placeholder">
                        нарисуй тут что-нибудь ♡
                      </span>

                    )
                  }

                </div>



                {/* ===========================================
                    ИНСТРУМЕНТЫ
                =========================================== */}

                <div className="mini-draw-tools">


                  <button
                    type="button"
                    disabled={
                      !canUndo
                    }
                    onClick={
                      undoDrawing
                    }
                  >
                    ↶ Назад
                  </button>


                  <button
                    type="button"
                    className={
                      eraserMode
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setEraserMode(
                        (current) =>
                          !current
                      )
                    }
                  >

                    {
                      eraserMode
                        ? "✎ Рисовать"
                        : "⌫ Ластик"
                    }

                  </button>


                  <button
                    type="button"
                    disabled={
                      !drawingHasInk
                    }
                    onClick={
                      clearDrawing
                    }
                  >
                    Очистить
                  </button>

                </div>

              </div>



              {/* ===============================================
                  НИЖНИЕ КНОПКИ
              =============================================== */}

              <div className="mini-message-form-bottom">


                <small>
                  {text.length}/180
                </small>


                <button
                  type="button"
                  onClick={
                    closeComposer
                  }
                >
                  Отмена
                </button>


                <button
                  type="submit"
                  className="primary"
                  disabled={
                    (
                      !text.trim() &&
                      !drawingHasInk
                    ) ||
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
