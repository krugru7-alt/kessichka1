"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DOCUMENTS } from "./documents";


const FILTERS = [
  { id: "all", label: "Все" },
  { id: "sign", label: "На подпись" },
  { id: "active", label: "Действующие" },
  { id: "done", label: "Исполненные" },
  { id: "archive", label: "Архив" },
];


function canDocumentBeSigned(document) {
  return (
    document.signable === true &&
    (
      document.status === "active" ||
      document.status === "sign"
    )
  );
}


function formatSignedAt(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString(
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


function normalizeSignature(value) {
  if (!value) return null;

  if (
    typeof value === "string" &&
    value.startsWith("data:image")
  ) {
    return {
      image: value,
      signedAt: null,
      x: 42,
      y: 84,
      width: 28,
    };
  }

  return {
    ...value,

    x:
      typeof value.x === "number"
        ? value.x
        : 42,

    y:
      typeof value.y === "number"
        ? value.y
        : 84,

    width:
      typeof value.width === "number"
        ? value.width
        : 28,
  };
}


export default function ChanceryPage() {
  const [filter, setFilter] =
    useState("all");

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


  const canvasRef =
    useRef(null);

  const documentStageRef =
    useRef(null);

  const drawingRef =
    useRef(false);

  const signatureDragRef =
    useRef(false);


  /* =====================================================
     ЗАГРУЖАЕМ СОХРАНЁННЫЕ ПОДПИСИ
  ===================================================== */

  useEffect(() => {
    const result = {};

    DOCUMENTS.forEach(
      (document) => {
        try {
          const raw =
            localStorage.getItem(
              `chancery-signature-${document.id}`
            );

          if (!raw) return;

          if (
            raw.startsWith("data:image")
          ) {
            result[document.id] =
              normalizeSignature(raw);

            return;
          }

          const parsed =
            JSON.parse(raw);

          if (parsed?.image) {
            result[document.id] =
              normalizeSignature(parsed);
          }
        } catch {
          // Для тестового этапа не критично.
        }
      }
    );

    setSavedSignatures(result);
  }, []);


  /* =====================================================
     СОХРАНЕНИЕ ЗАПИСИ ПОДПИСИ
  ===================================================== */

  function persistSignature(
    documentId,
    record
  ) {
    try {
      localStorage.setItem(
        `chancery-signature-${documentId}`,
        JSON.stringify(record)
      );
    } catch {
      // Позже здесь будет Neon.
    }
  }


  function updateSignature(
    documentId,
    changes
  ) {
    setSavedSignatures(
      (current) => {
        const previous =
          current[documentId];

        if (!previous) {
          return current;
        }

        const updated = {
          ...previous,
          ...changes,
        };

        persistSignature(
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
     НА ПОДПИСЬ
  ===================================================== */

  function isAwaitingSignature(
    document
  ) {
    return (
      canDocumentBeSigned(
        document
      ) &&
      !savedSignatures[
        document.id
      ]
    );
  }


  /* =====================================================
     ДОКУМЕНТЫ
  ===================================================== */

  const visibleDocuments =
    useMemo(() => {
      if (filter === "all") {
        return DOCUMENTS;
      }

      if (filter === "sign") {
        return DOCUMENTS.filter(
          (document) =>
            canDocumentBeSigned(
              document
            ) &&
            !savedSignatures[
              document.id
            ]
        );
      }

      return DOCUMENTS.filter(
        (document) =>
          document.status ===
          filter
      );
    }, [
      filter,
      savedSignatures,
    ]);


  const counts =
    useMemo(
      () => ({
        all:
          DOCUMENTS.length,

        sign:
          DOCUMENTS.filter(
            (document) =>
              canDocumentBeSigned(
                document
              ) &&
              !savedSignatures[
                document.id
              ]
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
      [savedSignatures]
    );


  function openDocument(
    document
  ) {
    setSelectedDocument(
      document
    );

    setSignatureMode(false);
    setPlacementMode(false);
    setSignatureHasInk(false);
  }


  function closeDocument() {
    setSelectedDocument(null);
    setSignatureMode(false);
    setPlacementMode(false);
    setSignatureHasInk(false);
  }


  /* =====================================================
     CANVAS ДЛЯ РИСОВАНИЯ
  ===================================================== */

  function prepareCanvas() {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const rect =
      canvas.getBoundingClientRect();

    const ratio =
      window.devicePixelRatio || 1;

    canvas.width =
      rect.width * ratio;

    canvas.height =
      rect.height * ratio;

    const context =
      canvas.getContext("2d");

    context.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

    context.lineWidth = 2.4;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.strokeStyle =
      "#1c2d57";
  }


  useEffect(() => {
    if (!signatureMode) {
      return;
    }

    const timer =
      window.setTimeout(
        prepareCanvas,
        60
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [signatureMode]);


  function getCanvasPoint(
    event
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) return null;

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


  function startDrawing(
    event
  ) {
    event.preventDefault();

    const canvas =
      canvasRef.current;

    if (!canvas) return;

    drawingRef.current =
      true;

    canvas.setPointerCapture?.(
      event.pointerId
    );

    const point =
      getCanvasPoint(
        event
      );

    if (!point) return;

    const context =
      canvas.getContext("2d");

    context.beginPath();

    context.moveTo(
      point.x,
      point.y
    );
  }


  function drawSignature(
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

    if (!canvas) return;

    const point =
      getCanvasPoint(
        event
      );

    if (!point) return;

    const context =
      canvas.getContext("2d");

    context.lineTo(
      point.x,
      point.y
    );

    context.stroke();

    setSignatureHasInk(
      true
    );
  }


  function stopDrawing(
    event
  ) {
    drawingRef.current =
      false;

    canvasRef.current
      ?.releasePointerCapture?.(
        event.pointerId
      );
  }


  function clearSignature() {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const context =
      canvas.getContext("2d");

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setSignatureHasInk(
      false
    );
  }


  /* =====================================================
     СОХРАНЯЕМ НАРИСОВАННУЮ ПОДПИСЬ
  ===================================================== */

  function saveSignature() {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedDocument ||
      !signatureHasInk
    ) {
      return;
    }

    const record = {
      image:
        canvas.toDataURL(
          "image/png"
        ),

      signedAt:
        new Date().toISOString(),

      /*
        Начальное положение.
        Потом подпись можно
        перетащить пальцем.
      */

      x: 42,
      y: 84,
      width: 28,
    };

    persistSignature(
      selectedDocument.id,
      record
    );

    setSavedSignatures(
      (current) => ({
        ...current,

        [
          selectedDocument.id
        ]: record,
      })
    );

    setSignatureMode(false);

    setSignatureHasInk(false);

    setPlacementMode(true);
  }


  /* =====================================================
     ПЕРЕТАСКИВАНИЕ ПОДПИСИ
  ===================================================== */

  function startSignatureDrag(
    event
  ) {
    if (!placementMode) {
      return;
    }

    event.preventDefault();

    signatureDragRef.current =
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
      !signatureDragRef.current ||
      !placementMode ||
      !selectedDocument
    ) {
      return;
    }

    event.preventDefault();

    const stage =
      documentStageRef.current;

    if (!stage) return;

    const rect =
      stage.getBoundingClientRect();

    let x =
      (
        (
          event.clientX -
          rect.left
        ) /
        rect.width
      ) * 100;

    let y =
      (
        (
          event.clientY -
          rect.top
        ) /
        rect.height
      ) * 100;

    x = Math.max(
      8,
      Math.min(92, x)
    );

    y = Math.max(
      5,
      Math.min(95, y)
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
    signatureDragRef.current =
      false;

    event.currentTarget
      .releasePointerCapture?.(
        event.pointerId
      );
  }


  /* =====================================================
     РАЗМЕР ПОДПИСИ
  ===================================================== */

  function resizeSignature(
    amount
  ) {
    if (!selectedDocument) {
      return;
    }

    const signature =
      savedSignatures[
        selectedDocument.id
      ];

    if (!signature) return;

    const next =
      Math.max(
        15,
        Math.min(
          45,
          signature.width +
            amount
        )
      );

    updateSignature(
      selectedDocument.id,
      {
        width: next,
      }
    );
  }


  /* =====================================================
     РЕНДЕР
  ===================================================== */

  return (
    <main className="chancery-page">

      {/* ШАПКА */}

      <header className="chancery-header">

        <div className="chancery-seal">
          К
        </div>

        <div>
          <small>
            ЭЛЕКТРОННАЯ КАНЦЕЛЯРИЯ
          </small>

          <h1>
            Особый отдел
          </h1>

          <p>
            Управление договорчиков
            и иных особо важных бумаг
          </p>
        </div>

      </header>


      {/* СВОДКА */}

      <section className="chancery-summary">

        <div>
          <small>
            ДЕЛ В РЕЕСТРЕ
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


      {/* ФИЛЬТРЫ */}

      <nav className="chancery-filters">

        {FILTERS.map(
          (item) => (

            <button
              key={item.id}
              type="button"

              className={
                filter === item.id
                  ? "active"
                  : ""
              }

              onClick={() =>
                setFilter(
                  item.id
                )
              }
            >
              <span>
                {item.label}
              </span>

              <small>
                {
                  counts[
                    item.id
                  ]
                }
              </small>
            </button>

          )
        )}

      </nav>


      {/* РЕЕСТР */}

      <section className="chancery-register">

        <div className="chancery-register-head">

          <small>
            РЕЕСТР ДОКУМЕНТОВ
          </small>

          <span>
            {
              visibleDocuments
                .length
            }
          </span>

        </div>


        <div className="chancery-documents">

          {visibleDocuments.map(
            (document) => {

              const signature =
                savedSignatures[
                  document.id
                ];

              const signed =
                Boolean(signature);

              let statusText =
                document.statusLabel;

              if (signed) {
                statusText =
                  document.status ===
                  "active"
                    ? "Действует · Подписано"
                    : "Подписано";
              }

              return (

                <button
                  key={
                    document.id
                  }

                  type="button"

                  className="chancery-document"

                  onClick={() =>
                    openDocument(
                      document
                    )
                  }
                >

                  <div className="chancery-document-number">
                    {
                      document.number
                    }
                  </div>


                  <div className="chancery-document-main">

                    <small>
                      {document.type}
                    </small>

                    <h2>
                      {
                        document.title
                      }
                    </h2>

                    <p>
                      от{" "}
                      {
                        document.date
                      }
                    </p>

                  </div>


                  <div
                    className={
                      `chancery-status status-${document.status}`
                    }
                  >
                    <span />

                    {statusText}
                  </div>


                  <div className="chancery-document-arrow">
                    →
                  </div>

                </button>

              );
            }
          )}

        </div>

      </section>


      <footer className="chancery-footer">

        <span>
          КАНЦЕЛЯРИЯ К.
        </span>

        <small>
          Электронный реестр
          документов · 2026
        </small>

      </footer>


      {/* =================================================
          ПРОСМОТР ДОКУМЕНТА
      ================================================= */}

      {selectedDocument && (

        <div className="chancery-modal">

          <button
            type="button"

            className="chancery-modal-backdrop"

            onClick={
              closeDocument
            }

            aria-label="Закрыть"
          />


          <article className="chancery-file">

            <header className="chancery-file-top">

              <button
                type="button"
                onClick={
                  closeDocument
                }
              >
                ← назад
              </button>

              <span>
                №{" "}
                {
                  selectedDocument
                    .number
                }
              </span>

            </header>


            {!signatureMode && (
              <>

                {/* НАСТОЯЩИЙ ДОКУМЕНТ */}

                <div className="chancery-original-wrap">

                  <div
                    ref={
                      documentStageRef
                    }

                    className="chancery-original-stage"
                  >

                    <img
                      className="chancery-original-image"

                      src={
                        selectedDocument
                          .fileUrl
                      }

                      alt={
                        selectedDocument
                          .title
                      }
                    />


                    {/* ПОДПИСЬ ПОВЕРХ ОРИГИНАЛА */}

                    {savedSignatures[
                      selectedDocument.id
                    ] && (

                      <img
                        className={
                          `chancery-document-signature ${
                            placementMode
                              ? "placing"
                              : ""
                          }`
                        }

                        src={
                          savedSignatures[
                            selectedDocument
                              .id
                          ].image
                        }

                        alt="Подпись"

                        style={{
                          left:
                            `${savedSignatures[
                              selectedDocument
                                .id
                            ].x}%`,

                          top:
                            `${savedSignatures[
                              selectedDocument
                                .id
                            ].y}%`,

                          width:
                            `${savedSignatures[
                              selectedDocument
                                .id
                            ].width}%`,
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

                    )}

                  </div>

                </div>


                {/* РЕЖИМ РАЗМЕЩЕНИЯ */}

                {placementMode &&
                  savedSignatures[
                    selectedDocument.id
                  ] && (

                    <section className="signature-placement">

                      <div>
                        <b>
                          Размести подпись
                        </b>

                        <small>
                          Перетащи её пальцем
                          на нужную строку
                          документа
                        </small>
                      </div>


                      <div className="signature-size-controls">

                        <button
                          type="button"
                          onClick={() =>
                            resizeSignature(
                              -3
                            )
                          }
                        >
                          −
                        </button>

                        <span>
                          размер
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            resizeSignature(
                              3
                            )
                          }
                        >
                          +
                        </button>

                      </div>


                      <button
                        type="button"

                        className="signature-place-confirm"

                        onClick={() =>
                          setPlacementMode(
                            false
                          )
                        }
                      >
                        Закрепить подпись
                      </button>

                    </section>

                  )}


                {/* ДЕЙСТВИЯ */}

                {!placementMode && (

                  <div className="chancery-file-actions">

                    {isAwaitingSignature(
                      selectedDocument
                    ) && (

                      <button
                        type="button"

                        className="chancery-sign-button"

                        onClick={() =>
                          setSignatureMode(
                            true
                          )
                        }
                      >
                        Подписать документ
                      </button>

                    )}


                    {savedSignatures[
                      selectedDocument.id
                    ] && (
                      <>

                        <div className="chancery-signed-note">

                          <span>
                            ✓
                          </span>

                          <div>

                            <b>
                              Документ подписан
                            </b>

                            <small>
                              {
                                formatSignedAt(
                                  savedSignatures[
                                    selectedDocument
                                      .id
                                  ]
                                    .signedAt
                                )
                              }
                            </small>

                          </div>

                        </div>


                        <button
                          type="button"

                          className="chancery-edit-signature"

                          onClick={() =>
                            setPlacementMode(
                              true
                            )
                          }
                        >
                          Изменить положение подписи
                        </button>

                      </>
                    )}


                    <a
                      href={
                        selectedDocument
                          .fileUrl
                      }

                      target="_blank"

                      rel="noreferrer"

                      className="chancery-original-link"
                    >
                      Открыть оригинал отдельно
                    </a>

                  </div>

                )}

              </>
            )}


            {/* =================================================
                РИСОВАНИЕ ПОДПИСИ
            ================================================= */}

            {signatureMode && (

              <section className="signature-screen">

                <div className="signature-heading">

                  <small>
                    ЭЛЕКТРОННОЕ ПОДПИСАНИЕ
                  </small>

                  <h2>
                    Поставь подпись
                  </h2>

                  <p>
                    Распишись пальцем
                    внутри поля.
                  </p>

                </div>


                <div className="signature-document-mini">

                  <span>
                    {
                      selectedDocument
                        .number
                    }
                  </span>

                  <b>
                    {
                      selectedDocument
                        .title
                    }
                  </b>

                </div>


                <div className="signature-pad">

                  <canvas
                    ref={
                      canvasRef
                    }

                    onPointerDown={
                      startDrawing
                    }

                    onPointerMove={
                      drawSignature
                    }

                    onPointerUp={
                      stopDrawing
                    }

                    onPointerCancel={
                      stopDrawing
                    }
                  />

                  <div className="signature-line" />

                  <small>
                    подпись
                  </small>

                </div>


                <div className="signature-controls">

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

                    className="signature-confirm"

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

                  className="signature-cancel"

                  onClick={() =>
                    setSignatureMode(
                      false
                    )
                  }
                >
                  отменить
                </button>


                <p className="signature-disclaimer">
                  Визуальная внутренняя
                  подпись Канцелярии.
                </p>

              </section>

            )}

          </article>

        </div>

      )}

    </main>
  );
}
