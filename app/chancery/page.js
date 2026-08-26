"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DOCUMENTS } from "./documents";


const FILTERS = [
  {
    id: "all",
    label: "Все дела",
  },
  {
    id: "sign",
    label: "На подпись",
  },
  {
    id: "active",
    label: "Действуют",
  },
  {
    id: "done",
    label: "Исполнены",
  },
  {
    id: "archive",
    label: "Архив",
  },
];


/* =====================================================
   МОЖНО ЛИ ПОДПИСАТЬ
===================================================== */

function canSign(document) {
  return (
    document.signable === true &&
    (
      document.status === "active" ||
      document.status === "sign"
    )
  );
}


/* =====================================================
   ДАТА ПОДПИСИ
===================================================== */

function formatSignedAt(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(value)
      .toLocaleString(
        "ru-RU",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
  } catch {
    return "";
  }
}


/* =====================================================
   НОРМАЛИЗАЦИЯ ПОДПИСИ
===================================================== */

function normalizeSignature(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "string" &&
    value.startsWith("data:image")
  ) {
    return {
      image: value,
      signedAt: null,
      x: 50,
      y: 86,
      width: 27,
    };
  }

  return {
    ...value,

    x:
      typeof value.x === "number"
        ? value.x
        : 50,

    y:
      typeof value.y === "number"
        ? value.y
        : 86,

    width:
      typeof value.width === "number"
        ? value.width
        : 27,
  };
}


/* =====================================================
   СТРАНИЦА
===================================================== */

export default function ChanceryPage() {

  const [
    filter,
    setFilter,
  ] = useState("all");


  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState(null);


  const [
    signatureMode,
    setSignatureMode,
  ] = useState(false);


  const [
    placementMode,
    setPlacementMode,
  ] = useState(false);


  const [
    signatureHasInk,
    setSignatureHasInk,
  ] = useState(false);


  const [
    savedSignatures,
    setSavedSignatures,
  ] = useState({});


  const [
    imageError,
    setImageError,
  ] = useState(false);


  const [
    signatureDeleteLoading,
    setSignatureDeleteLoading,
  ] = useState(false);


  /* =====================================================
     НОВОЕ — РЕДАКТОР ПОДПИСИ
  ===================================================== */

  const [
    eraserMode,
    setEraserMode,
  ] = useState(false);


  const [
    canUndo,
    setCanUndo,
  ] = useState(false);


  const canvasRef =
    useRef(null);


  const documentStageRef =
    useRef(null);


  const drawingRef =
    useRef(false);


  const draggingSignatureRef =
    useRef(false);


  /*
    Здесь храним предыдущие состояния
    Canvas для кнопки "Назад".
  */

  const signatureHistoryRef =
    useRef([]);



  /* =====================================================
     ЛОКАЛЬНОЕ СОХРАНЕНИЕ
  ===================================================== */

  function saveSignatureLocally(
    documentId,
    record
  ) {
    try {
      localStorage.setItem(
        `chancery-signature-${documentId}`,
        JSON.stringify(
          record
        )
      );
    } catch {
      // localStorage может быть недоступен.
    }
  }



  /* =====================================================
     СОХРАНЕНИЕ В NEON
  ===================================================== */

  async function persistSignature(
    documentId,
    record
  ) {

    saveSignatureLocally(
      documentId,
      record
    );


    try {

      const response =
        await fetch(
          "/api/chancery/signatures",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                documentId,

                image:
                  record.image,

                signedAt:
                  record.signedAt,

                x:
                  record.x,

                y:
                  record.y,

                width:
                  record.width,
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
          "Ошибка сохранения подписи"
        );
      }


      return true;

    } catch (error) {

      console.error(
        "Не удалось сохранить подпись в Neon:",
        error
      );


      return false;
    }
  }



  /* =====================================================
     ЗАГРУЖАЕМ ПОДПИСИ

     Neon — основной источник.
     localStorage — резерв.
  ===================================================== */

  useEffect(() => {

    let active = true;


    async function loadSignatures() {

      const localResult = {};


      /* ===============================================
         ЧИТАЕМ localStorage
      =============================================== */

      DOCUMENTS.forEach(
        (document) => {

          try {

            const raw =
              localStorage.getItem(
                `chancery-signature-${document.id}`
              );


            if (!raw) {
              return;
            }


            if (
              raw.startsWith(
                "data:image"
              )
            ) {

              localResult[
                document.id
              ] =
                normalizeSignature(
                  raw
                );

              return;
            }


            const parsed =
              JSON.parse(
                raw
              );


            if (parsed?.image) {

              localResult[
                document.id
              ] =
                normalizeSignature(
                  parsed
                );
            }

          } catch {
            // пропускаем повреждённую запись
          }
        }
      );


      /* ===============================================
         ЧИТАЕМ NEON
      =============================================== */

      try {

        const response =
          await fetch(
            "/api/chancery/signatures",
            {
              cache: "no-store",
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
            "Ошибка загрузки подписей"
          );
        }


        const serverResult = {};


        for (
          const signature of
          data.signatures || []
        ) {

          if (
            !signature?.documentId ||
            !signature?.image
          ) {
            continue;
          }


          serverResult[
            signature.documentId
          ] =
            normalizeSignature({
              image:
                signature.image,

              signedAt:
                signature.signedAt,

              x:
                Number(
                  signature.x
                ),

              y:
                Number(
                  signature.y
                ),

              width:
                Number(
                  signature.width
                ),
            });
        }


        if (!active) {
          return;
        }


        /*
          Neon — основной источник.
        */

        setSavedSignatures(
          serverResult
        );


        /*
          Синхронизируем localStorage
          с содержимым Neon.
        */

        DOCUMENTS.forEach(
          (document) => {

            const signature =
              serverResult[
                document.id
              ];


            try {

              if (signature) {

                localStorage.setItem(
                  `chancery-signature-${document.id}`,
                  JSON.stringify(
                    signature
                  )
                );

              } else {

                localStorage.removeItem(
                  `chancery-signature-${document.id}`
                );

              }

            } catch {
              // ничего критичного
            }

          }
        );


      } catch (error) {

        console.error(
          "Не удалось загрузить подписи из Neon:",
          error
        );


        /*
          Если Neon временно не работает,
          показываем локальные копии.
        */

        if (active) {
          setSavedSignatures(
            localResult
          );
        }

      }

    }


    loadSignatures();


    return () => {
      active = false;
    };

  }, []);



  /* =====================================================
     ОБНОВЛЕНИЕ ПОЛОЖЕНИЯ / РАЗМЕРА
  ===================================================== */

  function updateSignature(
    documentId,
    changes
  ) {

    setSavedSignatures(
      (current) => {

        const previous =
          current[
            documentId
          ];


        if (!previous) {
          return current;
        }


        const updated = {
          ...previous,
          ...changes,
        };


        saveSignatureLocally(
          documentId,
          updated
        );


        return {
          ...current,

          [documentId]:
            updated,
        };

      }
    );
  }



  /* =====================================================
     ЗАКРЕПИТЬ ПОДПИСЬ
  ===================================================== */

  function confirmPlacement() {

    if (!selectedDocument) {

      setPlacementMode(
        false
      );

      return;
    }


    const signature =
      savedSignatures[
        selectedDocument.id
      ];


    if (signature) {

      persistSignature(
        selectedDocument.id,
        signature
      );

    }


    setPlacementMode(
      false
    );
  }



  /* =====================================================
     УДАЛИТЬ ГОТОВУЮ ПОДПИСЬ
  ===================================================== */

  async function deleteSignature(
    documentId
  ) {

    if (!documentId) {
      return;
    }


    const confirmed =
      window.confirm(
        "Удалить подпись с этого документа?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setSignatureDeleteLoading(
        true
      );


      const response =
        await fetch(
          "/api/chancery/signatures",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                documentId,
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
          "Ошибка удаления подписи"
        );
      }


      try {

        localStorage.removeItem(
          `chancery-signature-${documentId}`
        );

      } catch {
        // ничего критичного
      }


      setSavedSignatures(
        (current) => {

          const next = {
            ...current,
          };


          delete next[
            documentId
          ];


          return next;
        }
      );


      setPlacementMode(
        false
      );


      setSignatureMode(
        false
      );


      setSignatureHasInk(
        false
      );


    } catch (error) {

      console.error(
        "Ошибка удаления подписи:",
        error
      );


      window.alert(
        "Не удалось удалить подпись."
      );


    } finally {

      setSignatureDeleteLoading(
        false
      );

    }

  }



  /* =====================================================
     СТАТУС
  ===================================================== */

  function isAwaitingSignature(
    document
  ) {

    return (
      canSign(document) &&
      !savedSignatures[
        document.id
      ]
    );
  }


  function getStatusText(
    document
  ) {

    const signed =
      Boolean(
        savedSignatures[
          document.id
        ]
      );


    if (
      signed &&
      document.status ===
        "active"
    ) {
      return "ДЕЙСТВУЕТ · ПОДПИСАНО";
    }


    if (signed) {
      return "ПОДПИСАНО";
    }


    if (
      isAwaitingSignature(
        document
      )
    ) {
      return "ДЕЙСТВУЕТ · НА ПОДПИСЬ";
    }


    return (
      document.statusLabel ||
      "В РЕЕСТРЕ"
    ).toUpperCase();
  }



  /* =====================================================
     ФИЛЬТРАЦИЯ
  ===================================================== */

  const visibleDocuments =
    useMemo(
      () => {

        if (
          filter === "all"
        ) {
          return DOCUMENTS;
        }


        if (
          filter === "sign"
        ) {

          return DOCUMENTS.filter(
            (document) =>
              isAwaitingSignature(
                document
              )
          );
        }


        return DOCUMENTS.filter(
          (document) =>
            document.status ===
            filter
        );

      },
      [
        filter,
        savedSignatures,
      ]
    );


  const counts =
    useMemo(
      () => ({

        all:
          DOCUMENTS.length,

        sign:
          DOCUMENTS.filter(
            (document) =>
              isAwaitingSignature(
                document
              )
          ).length,

        active:
          DOCUMENTS.filter(
            (document) =>
              document.status ===
              "active"
          ).length,

        done:
          DOCUMENTS.filter(
            (document) =>
              document.status ===
              "done"
          ).length,

        archive:
          DOCUMENTS.filter(
            (document) =>
              document.status ===
              "archive"
          ).length,

      }),
      [
        savedSignatures,
      ]
    );



  /* =====================================================
     ОТКРЫТИЕ ДОКУМЕНТА
  ===================================================== */

  function openDocument(
    document
  ) {

    setSelectedDocument(
      document
    );


    setSignatureMode(
      false
    );


    setPlacementMode(
      false
    );


    setSignatureHasInk(
      false
    );


    setImageError(
      false
    );


    setEraserMode(
      false
    );


    setCanUndo(
      false
    );


    signatureHistoryRef.current =
      [];
  }



  /* =====================================================
     ЗАКРЫТИЕ ДОКУМЕНТА
  ===================================================== */

  function closeDocument() {

    if (
      placementMode &&
      selectedDocument
    ) {

      const signature =
        savedSignatures[
          selectedDocument.id
        ];


      if (signature) {

        persistSignature(
          selectedDocument.id,
          signature
        );

      }
    }


    setSelectedDocument(
      null
    );


    setSignatureMode(
      false
    );


    setPlacementMode(
      false
    );


    setSignatureHasInk(
      false
    );


    setImageError(
      false
    );


    setEraserMode(
      false
    );


    setCanUndo(
      false
    );


    signatureHistoryRef.current =
      [];
  }



  /* =====================================================
     CANVAS
  ===================================================== */

  function prepareCanvas() {

    const canvas =
      canvasRef.current;


    if (!canvas) {
      return;
    }


    const rect =
      canvas.getBoundingClientRect();


    const ratio =
      window.devicePixelRatio ||
      1;


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


    context.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );


    context.lineWidth =
      2.4;


    context.lineCap =
      "round";


    context.lineJoin =
      "round";


    context.strokeStyle =
      "#193868";


    context.globalCompositeOperation =
      "source-over";
  }



  /* =====================================================
     ПРИ ОТКРЫТИИ ЭКРАНА ПОДПИСИ
  ===================================================== */

  useEffect(
    () => {

      if (!signatureMode) {
        return;
      }


      /*
        Новая процедура подписания =
        новая история действий.
      */

      signatureHistoryRef.current =
        [];


      setCanUndo(
        false
      );


      setEraserMode(
        false
      );


      setSignatureHasInk(
        false
      );


      const timer =
        window.setTimeout(
          prepareCanvas,
          80
        );


      return () =>
        window.clearTimeout(
          timer
        );

    },
    [
      signatureMode,
    ]
  );



  /* =====================================================
     ТОЧКА НА CANVAS
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
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,

    };
  }



  /* =====================================================
     СОХРАНЯЕМ ШАГ ДЛЯ "НАЗАД"
  ===================================================== */

  function saveCanvasHistory(
    context
  ) {

    const canvas =
      canvasRef.current;


    if (
      !canvas ||
      !context
    ) {
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


      signatureHistoryRef.current.push(
        snapshot
      );


      /*
        Максимум 30 шагов.
      */

      if (
        signatureHistoryRef.current.length >
        30
      ) {

        signatureHistoryRef.current.shift();

      }


      setCanUndo(
        true
      );


    } catch (error) {

      console.error(
        "Ошибка сохранения истории подписи:",
        error
      );

    }
  }



  /* =====================================================
     ПРОВЕРЯЕМ, ЕСТЬ ЛИ РИСУНОК
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
      Каждый четвёртый байт —
      прозрачность пикселя.
    */

    for (
      let i = 3;
      i < pixels.length;
      i += 4
    ) {

      if (
        pixels[i] >
        0
      ) {
        return true;
      }

    }


    return false;
  }



  /* =====================================================
     НАЗАД
  ===================================================== */

  function undoSignature() {

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
      signatureHistoryRef.current.pop();


    if (!previous) {

      setCanUndo(
        false
      );

      return;
    }


    /*
      putImageData восстанавливает Canvas
      пиксель в пиксель.
    */

    context.putImageData(
      previous,
      0,
      0
    );


    const hasInk =
      canvasHasInk();


    setSignatureHasInk(
      hasInk
    );


    setCanUndo(
      signatureHistoryRef.current.length >
      0
    );
  }



  /* =====================================================
     КАРАНДАШ / ЛАСТИК
  ===================================================== */

  function applySignatureTool(
    context
  ) {

    context.lineCap =
      "round";


    context.lineJoin =
      "round";


    if (eraserMode) {

      /*
        destination-out реально стирает
        нарисованные пиксели.
      */

      context.globalCompositeOperation =
        "destination-out";


      context.lineWidth =
        18;

    } else {

      context.globalCompositeOperation =
        "source-over";


      context.lineWidth =
        2.4;


      context.strokeStyle =
        "#193868";
    }
  }



  /* =====================================================
     НАЧАЛО РИСОВАНИЯ / СТИРАНИЯ
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


    /*
      Если поле пустое —
      ластику делать нечего.
    */

    if (
      eraserMode &&
      !signatureHasInk
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


    /*
      Сохраняем Canvas ДО нового штриха.
      Именно сюда вернёт кнопка "Назад".
    */

    saveCanvasHistory(
      context
    );


    applySignatureTool(
      context
    );


    drawingRef.current =
      true;


    canvas.setPointerCapture?.(
      event.pointerId
    );


    const point =
      getCanvasPoint(
        event
      );


    if (!point) {
      return;
    }


    context.beginPath();


    context.moveTo(
      point.x,
      point.y
    );
  }



  /* =====================================================
     РИСОВАНИЕ / СТИРАНИЕ
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


    const point =
      getCanvasPoint(
        event
      );


    if (!point) {
      return;
    }


    const context =
      canvas.getContext(
        "2d"
      );


    if (!context) {
      return;
    }


    context.lineTo(
      point.x,
      point.y
    );


    context.stroke();


    if (!eraserMode) {

      setSignatureHasInk(
        true
      );

    }
  }



  /* =====================================================
     КОНЕЦ РИСОВАНИЯ / СТИРАНИЯ
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


    /*
      После ластика проверяем,
      осталась ли подпись вообще.
    */

    if (eraserMode) {

      setSignatureHasInk(
        canvasHasInk()
      );

    }
  }



  /* =====================================================
     ОЧИСТИТЬ ВСЮ ПОДПИСЬ

     После очистки можно нажать "Назад".
  ===================================================== */

  function clearSignature() {

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
      signatureHasInk
    ) {

      saveCanvasHistory(
        context
      );

    }


    /*
      На время очистки сбрасываем transform,
      чтобы очистить весь физический Canvas.
    */

    context.save();


    context.setTransform(
      1,
      0,
      0,
      1,
      0,
      0
    );


    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    context.restore();


    setSignatureHasInk(
      false
    );


    setEraserMode(
      false
    );
  }



  /* =====================================================
     СОХРАНЯЕМ НОВУЮ ПОДПИСЬ
  ===================================================== */

  function saveSignature() {

    if (
      !selectedDocument ||
      !canvasRef.current ||
      !signatureHasInk
    ) {
      return;
    }


    const record = {

      image:
        canvasRef.current
          .toDataURL(
            "image/png"
          ),

      signedAt:
        new Date()
          .toISOString(),

      x:
        50,

      y:
        86,

      width:
        27,
    };


    /*
      Сохраняем в Neon.
    */

    persistSignature(
      selectedDocument.id,
      record
    );


    /*
      Показываем сразу,
      не ждём сервер.
    */

    setSavedSignatures(
      (current) => ({

        ...current,

        [
          selectedDocument.id
        ]:
          record,

      })
    );


    setSignatureMode(
      false
    );


    setSignatureHasInk(
      false
    );


    setEraserMode(
      false
    );


    setCanUndo(
      false
    );


    signatureHistoryRef.current =
      [];


    /*
      После рисования подпись
      можно разместить на документе.
    */

    setPlacementMode(
      true
    );
  }



  /* =====================================================
     ПЕРЕТАСКИВАНИЕ ГОТОВОЙ ПОДПИСИ
  ===================================================== */

  function startSignatureDrag(
    event
  ) {

    if (!placementMode) {
      return;
    }


    event.preventDefault();


    draggingSignatureRef.current =
      true;


    event.currentTarget
      .setPointerCapture?.(
        event.pointerId
      );
  }



  function moveSignature(
    event
  ) {

    if (
      !placementMode ||
      !selectedDocument ||
      !draggingSignatureRef.current
    ) {
      return;
    }


    event.preventDefault();


    const stage =
      documentStageRef.current;


    if (!stage) {
      return;
    }


    const rect =
      stage.getBoundingClientRect();


    let x =
      (
        (
          event.clientX -
          rect.left
        ) /
        rect.width
      ) *
      100;


    let y =
      (
        (
          event.clientY -
          rect.top
        ) /
        rect.height
      ) *
      100;


    x =
      Math.max(
        8,
        Math.min(
          92,
          x
        )
      );


    y =
      Math.max(
        5,
        Math.min(
          95,
          y
        )
      );


    updateSignature(
      selectedDocument.id,
      {
        x,
        y,
      }
    );
  }



  function stopSignatureDrag(
    event
  ) {

    draggingSignatureRef.current =
      false;


    event.currentTarget
      .releasePointerCapture?.(
        event.pointerId
      );
  }



  /* =====================================================
     РАЗМЕР ГОТОВОЙ ПОДПИСИ
  ===================================================== */

  function changeSignatureSize(
    amount
  ) {

    if (!selectedDocument) {
      return;
    }


    const current =
      savedSignatures[
        selectedDocument.id
      ];


    if (!current) {
      return;
    }


    const width =
      Math.max(
        14,
        Math.min(
          46,
          current.width +
          amount
        )
      );


    updateSignature(
      selectedDocument.id,
      {
        width,
      }
    );
  }



  /* =====================================================
     РЕНДЕР
  ===================================================== */

  return (

    <main className="chancery-page">


      {/* ===============================================
          ШАПКА ОТДЕЛА
      =============================================== */}

      <section className="chancery-department-head">

        <div className="chancery-department-copy">

          <small>
            ОТДЕЛ №01 · ЭЛЕКТРОННАЯ КАНЦЕЛЯРИЯ
          </small>


          <h1>
            Всё серьёзно
          </h1>


          <p>
            Договорчики, акты,
            заявления и прочие
            бумаги чрезвычайной
            важности.
          </p>

        </div>


        <div className="chancery-big-stamp">

          <span>
            К
          </span>


          <small>
            ОСОБЫЙ
            <br />
            ОТДЕЛ
          </small>

        </div>

      </section>



      {/* ===============================================
          ТРЕБУЮТ ВНИМАНИЯ
      =============================================== */}

      {
        counts.sign > 0 &&
        (

          <button
            type="button"
            className="chancery-attention"
            onClick={() =>
              setFilter(
                "sign"
              )
            }
          >

            <div>

              <small>
                ТРЕБУЮТ ВНИМАНИЯ
              </small>


              <b>

                {
                  counts.sign
                }

                {" "}

                {
                  counts.sign === 1
                    ? "документ"
                    : "документа"
                }

                {" "}

                на подпись

              </b>


              <span>
                Открыть входящие
              </span>

            </div>


            <strong>
              →
            </strong>

          </button>

        )
      }



      {/* ===============================================
          СТАТИСТИКА
      =============================================== */}

      <section className="chancery-stats">

        <div>

          <small>
            В РЕЕСТРЕ
          </small>

          <b>
            {counts.all}
          </b>

        </div>


        <div>

          <small>
            НА ПОДПИСЬ
          </small>

          <b>
            {counts.sign}
          </b>

        </div>


        <div>

          <small>
            ДЕЙСТВУЮТ
          </small>

          <b>
            {counts.active}
          </b>

        </div>

      </section>



      {/* ===============================================
          РЕЕСТР
      =============================================== */}

      <section className="chancery-registry">

        <header className="chancery-registry-head">

          <div>

            <small>
              РЕЕСТР
            </small>

            <h2>
              Дела
            </h2>

          </div>


          <span>
            {
              visibleDocuments.length
            }
          </span>

        </header>



        {/* ===============================================
            ФИЛЬТРЫ
        =============================================== */}

        <div className="chancery-filters">

          {
            FILTERS.map(
              (item) => (

                <button
                  key={
                    item.id
                  }
                  type="button"
                  className={
                    filter ===
                    item.id
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setFilter(
                      item.id
                    )
                  }
                >

                  {
                    item.label
                  }


                  <span>
                    {
                      counts[
                        item.id
                      ]
                    }
                  </span>

                </button>

              )
            )
          }

        </div>



        {/* ===============================================
            ДОКУМЕНТЫ
        =============================================== */}

        <div className="chancery-case-list">

          {
            visibleDocuments.length ===
            0
              ? (

                <div className="chancery-empty">

                  <b>
                    Пусто
                  </b>

                  <span>
                    В этой категории
                    сейчас нет документов.
                  </span>

                </div>

              )
              : (

                visibleDocuments.map(
                  (
                    document,
                    index
                  ) => {

                    const signed =
                      Boolean(
                        savedSignatures[
                          document.id
                        ]
                      );


                    return (

                      <button
                        key={
                          document.id
                        }
                        type="button"
                        className="chancery-case"
                        onClick={() =>
                          openDocument(
                            document
                          )
                        }
                      >

                        <div className="chancery-case-index">

                          {
                            String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )
                          }

                        </div>


                        <div className="chancery-case-copy">

                          <small>

                            {
                              document.type
                            }

                            {" · "}

                            {
                              document.date
                            }

                          </small>


                          <h3>
                            {
                              document.title
                            }
                          </h3>


                          <p>

                            №{" "}

                            {
                              document.number
                            }

                          </p>


                          <span
                            className={
                              `chancery-case-status ${
                                signed
                                  ? "signed"
                                  : ""
                              }`
                            }
                          >

                            {
                              getStatusText(
                                document
                              )
                            }

                          </span>

                        </div>


                        <div className="chancery-case-arrow">
                          →
                        </div>

                      </button>

                    );
                  }
                )

              )
          }

        </div>

      </section>



      <p className="chancery-register-note">
        Электронный реестр ·
        Канцелярия К.
      </p>



      {/* =================================================
          ОТКРЫТЫЙ ДОКУМЕНТ
      ================================================= */}

      {
        selectedDocument &&
        (

          <div className="chancery-modal">


            <button
              type="button"
              className="chancery-modal-bg"
              onClick={
                closeDocument
              }
              aria-label="Закрыть документ"
            />


            <article className="chancery-file">


              {/* ===============================================
                  ВЕРХ
              =============================================== */}

              <header className="chancery-file-header">

                <button
                  type="button"
                  onClick={
                    closeDocument
                  }
                >
                  ←
                </button>


                <div>

                  <small>
                    ДЕЛО
                  </small>

                  <b>

                    №{" "}

                    {
                      selectedDocument.number
                    }

                  </b>

                </div>


                <span className="chancery-file-status">

                  {
                    getStatusText(
                      selectedDocument
                    )
                  }

                </span>

              </header>



              {
                !signatureMode &&
                (

                  <>


                    <div className="chancery-file-meta">

                      <small>
                        {
                          selectedDocument.type
                        }
                      </small>


                      <h2>
                        {
                          selectedDocument.title
                        }
                      </h2>


                      <p>

                        Зарегистрировано:
                        {" "}

                        {
                          selectedDocument.date
                        }

                      </p>

                    </div>



                    {/* ===============================================
                        ОРИГИНАЛ
                    =============================================== */}

                    <section className="chancery-original-section">

                      <div className="chancery-original-label">

                        <span>
                          ОРИГИНАЛ ДОКУМЕНТА
                        </span>


                        <a
                          href={
                            selectedDocument.fileUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          открыть отдельно
                        </a>

                      </div>


                      {
                        !imageError
                          ? (

                            <div
                              ref={
                                documentStageRef
                              }
                              className="chancery-document-stage"
                            >

                              <img
                                src={
                                  selectedDocument.fileUrl
                                }
                                alt=""
                                className="chancery-original-image"
                                onError={() =>
                                  setImageError(
                                    true
                                  )
                                }
                              />


                              {
                                savedSignatures[
                                  selectedDocument.id
                                ] &&
                                (

                                  <img
                                    src={
                                      savedSignatures[
                                        selectedDocument.id
                                      ].image
                                    }
                                    alt=""
                                    className={
                                      `chancery-saved-signature ${
                                        placementMode
                                          ? "placing"
                                          : ""
                                      }`
                                    }
                                    style={{

                                      left:
                                        `${
                                          savedSignatures[
                                            selectedDocument.id
                                          ].x
                                        }%`,

                                      top:
                                        `${
                                          savedSignatures[
                                            selectedDocument.id
                                          ].y
                                        }%`,

                                      width:
                                        `${
                                          savedSignatures[
                                            selectedDocument.id
                                          ].width
                                        }%`,
                                    }}
                                    onPointerDown={
                                      startSignatureDrag
                                    }
                                    onPointerMove={
                                      moveSignature
                                    }
                                    onPointerUp={
                                      stopSignatureDrag
                                    }
                                    onPointerCancel={
                                      stopSignatureDrag
                                    }
                                  />

                                )
                              }

                            </div>

                          )
                          : (

                            <div className="chancery-image-error">

                              <b>
                                Файл документа
                                не найден
                              </b>


                              <span>
                                Проверь имя файла
                                в public/documents
                              </span>


                              <code>
                                {
                                  selectedDocument.fileUrl
                                }
                              </code>

                            </div>

                          )
                      }

                    </section>



                    {/* ===============================================
                        РАЗМЕЩЕНИЕ
                    =============================================== */}

                    {
                      placementMode &&
                      savedSignatures[
                        selectedDocument.id
                      ] &&
                      (

                        <section className="chancery-placement-panel">

                          <div>

                            <b>
                              Размести подпись
                            </b>


                            <span>
                              Перетаскивай её
                              пальцем по документу.
                            </span>

                          </div>


                          <div className="chancery-size-control">

                            <button
                              type="button"
                              onClick={() =>
                                changeSignatureSize(
                                  -3
                                )
                              }
                            >
                              −
                            </button>


                            <small>
                              РАЗМЕР
                            </small>


                            <button
                              type="button"
                              onClick={() =>
                                changeSignatureSize(
                                  3
                                )
                              }
                            >
                              +
                            </button>

                          </div>


                          <button
                            type="button"
                            className="chancery-placement-confirm"
                            onClick={
                              confirmPlacement
                            }
                          >
                            Закрепить
                          </button>

                        </section>

                      )
                    }



                    {/* ===============================================
                        ДЕЙСТВИЯ С ДОКУМЕНТОМ
                    =============================================== */}

                    {
                      !placementMode &&
                      (

                        <section className="chancery-file-actions">


                          {
                            isAwaitingSignature(
                              selectedDocument
                            ) &&
                            (

                              <button
                                type="button"
                                className="chancery-sign-main"
                                onClick={() =>
                                  setSignatureMode(
                                    true
                                  )
                                }
                              >

                                <span>
                                  ✎
                                </span>

                                Подписать документ

                              </button>

                            )
                          }



                          {
                            savedSignatures[
                              selectedDocument.id
                            ] &&
                            (

                              <div className="chancery-signed-info">

                                <div className="chancery-signed-stamp">
                                  ПОДПИСАНО
                                </div>


                                <div>

                                  <b>
                                    Подпись зарегистрирована
                                  </b>


                                  <small>

                                    {
                                      formatSignedAt(
                                        savedSignatures[
                                          selectedDocument.id
                                        ].signedAt
                                      )
                                    }

                                  </small>

                                </div>

                              </div>

                            )
                          }



                          {
                            savedSignatures[
                              selectedDocument.id
                            ] &&
                            (

                              <button
                                type="button"
                                className="chancery-edit-placement"
                                onClick={() =>
                                  setPlacementMode(
                                    true
                                  )
                                }
                              >
                                Изменить положение подписи
                              </button>

                            )
                          }



                          {
                            savedSignatures[
                              selectedDocument.id
                            ] &&
                            (

                              <button
                                type="button"
                                className="chancery-edit-placement chancery-delete-signature"
                                disabled={
                                  signatureDeleteLoading
                                }
                                onClick={() =>
                                  deleteSignature(
                                    selectedDocument.id
                                  )
                                }
                                style={{
                                  marginTop: "10px",
                                }}
                              >

                                {
                                  signatureDeleteLoading
                                    ? "Удаляем..."
                                    : "Удалить подпись"
                                }

                              </button>

                            )
                          }

                        </section>

                      )
                    }

                  </>

                )
              }



              {/* =================================================
                  ЭКРАН РИСОВАНИЯ ПОДПИСИ
              ================================================= */}

              {
                signatureMode &&
                (

                  <section className="chancery-sign-screen">


                    <div className="chancery-sign-head">

                      <small>
                        ПРОЦЕДУРА ПОДПИСАНИЯ
                      </small>


                      <h2>
                        Поставь подпись
                      </h2>


                      <p>
                        Распишись пальцем
                        или мышкой внутри
                        поля.
                      </p>

                    </div>



                    <div className="chancery-sign-document">

                      <small>
                        ДОКУМЕНТ
                      </small>


                      <b>
                        {
                          selectedDocument.title
                        }
                      </b>


                      <span>

                        №{" "}

                        {
                          selectedDocument.number
                        }

                      </span>

                    </div>



                    {/* ===============================================
                        ПОЛЕ ПОДПИСИ
                    =============================================== */}

                    <div className="chancery-sign-pad">

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


                      <div className="chancery-sign-line" />


                      <span>

                        {
                          eraserMode
                            ? "ластик включён"
                            : "подпись"
                        }

                      </span>

                    </div>



                    {/* ===============================================
                        НАЗАД + ЛАСТИК

                        Используем уже существующий класс кнопок,
                        поэтому globals.css менять не надо.
                    =============================================== */}

                    <div
                      className="chancery-sign-buttons"
                      style={{
                        marginBottom: "9px",
                      }}
                    >

                      <button
                        type="button"
                        disabled={
                          !canUndo
                        }
                        onClick={
                          undoSignature
                        }
                      >

                        ↶ Назад

                      </button>


                      <button
                        type="button"
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

                    </div>



                    {/* ===============================================
                        ОЧИСТИТЬ + ПРОДОЛЖИТЬ
                    =============================================== */}

                    <div className="chancery-sign-buttons">

                      <button
                        type="button"
                        onClick={
                          clearSignature
                        }
                      >
                        Очистить
                      </button>


                      <button
                        type="button"
                        className="primary"
                        disabled={
                          !signatureHasInk
                        }
                        onClick={
                          saveSignature
                        }
                      >
                        Продолжить
                      </button>

                    </div>



                    <button
                      type="button"
                      className="chancery-sign-cancel"
                      onClick={() =>
                        setSignatureMode(
                          false
                        )
                      }
                    >
                      Отмена
                    </button>



                    <small className="chancery-sign-note">
                      Внутренняя визуальная
                      подпись электронного
                      реестра.
                    </small>


                  </section>

                )
              }


            </article>

          </div>

        )
      }


    </main>
  );
}
