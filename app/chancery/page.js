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
    label: "Все",
  },

  {
    id: "sign",
    label: "На подпись",
  },

  {
    id: "active",
    label: "Действующие",
  },

  {
    id: "done",
    label: "Исполненные",
  },

  {
    id: "archive",
    label: "Архив",
  },
];


/* =====================================================
   ПОМОЩНИКИ
===================================================== */

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
  if (!value) {
    return "";
  }

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


/* =====================================================
   СТРАНИЦА
===================================================== */

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
    savedSignatures,
    setSavedSignatures,
  ] = useState({});

  const [
    signatureHasInk,
    setSignatureHasInk,
  ] = useState(false);

  const canvasRef =
    useRef(null);

  const drawingRef =
    useRef(false);


  /* =====================================================
     ЗАГРУЖАЕМ ПОДПИСИ

     Сейчас они хранятся на телефоне.
     Позже перенесём в Neon.
  ===================================================== */

  useEffect(() => {
    const signatures = {};

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

          /*
            Поддержка старого формата,
            где сохранялась просто картинка.
          */

          if (
            raw.startsWith(
              "data:image"
            )
          ) {
            signatures[
              document.id
            ] = {
              image: raw,
              signedAt: null,
            };

            return;
          }

          const parsed =
            JSON.parse(raw);

          if (parsed?.image) {
            signatures[
              document.id
            ] = parsed;
          }
        } catch {
          // Не критично.
        }
      }
    );

    setSavedSignatures(
      signatures
    );
  }, []);


  /* =====================================================
     НА ПОДПИСЬ

     ВАЖНО:
     сюда попадает и status: active,
     если signable: true и подписи ещё нет.
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
     ФИЛЬТР
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


  /* =====================================================
     СЧЁТЧИКИ
  ===================================================== */

  const counts = useMemo(
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

    setSignatureHasInk(
      false
    );
  }


  function closeDocument() {
    setSelectedDocument(
      null
    );

    setSignatureMode(
      false
    );

    setSignatureHasInk(
      false
    );
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
      rect.width * ratio;

    canvas.height =
      rect.height * ratio;

    const context =
      canvas.getContext(
        "2d"
      );

    context.setTransform(
      ratio,
      0,
      0,
      ratio,
      0,
      0
    );

    context.lineWidth =
      2.2;

    context.lineCap =
      "round";

    context.lineJoin =
      "round";

    context.strokeStyle =
      "#1f252c";
  }


  useEffect(() => {
    if (
      !signatureMode
    ) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          prepareCanvas();
        },
        60
      );

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [signatureMode]);


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


  function startDrawing(
    event
  ) {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    event.preventDefault();

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

    const context =
      canvas.getContext(
        "2d"
      );

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


  /* =====================================================
     ОЧИСТИТЬ ПОДПИСЬ
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
     СОХРАНИТЬ ПОДПИСЬ
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
        new Date()
          .toISOString(),
    };

    try {
      localStorage.setItem(
        `chancery-signature-${selectedDocument.id}`,
        JSON.stringify(
          record
        )
      );
    } catch {
      // Пока не критично.
    }

    setSavedSignatures(
      (current) => ({
        ...current,

        [
          selectedDocument.id
        ]: record,
      })
    );

    setSignatureMode(
      false
    );

    setSignatureHasInk(
      false
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
            ЭЛЕКТРОННАЯ
            КАНЦЕЛЯРИЯ
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
                Boolean(
                  signature
                );

              let displayStatus =
                document.statusLabel;

              if (signed) {
                if (
                  document.status ===
                  "active"
                ) {
                  displayStatus =
                    "Действует · Подписано";
                } else {
                  displayStatus =
                    "Подписано";
                }
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
                      {
                        document.type
                      }
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

                    {
                      displayStatus
                    }

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
          ОТКРЫТЫЙ ДОКУМЕНТ
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
                ДЕЛО{" "}
                {
                  selectedDocument
                    .number
                }
              </span>

            </header>


            {!signatureMode && (
              <>

                <section className="chancery-paper">

                  <div className="paper-topline">
                    КАНЦЕЛЯРИЯ К.
                  </div>


                  <div className="paper-registration">

                    <span>
                      {
                        selectedDocument
                          .type
                      }
                    </span>

                    <span>
                      №{" "}
                      {
                        selectedDocument
                          .number
                      }
                    </span>

                  </div>


                  <h2>
                    {
                      selectedDocument
                        .title
                    }
                  </h2>


                  <div className="paper-date">
                    от{" "}
                    {
                      selectedDocument
                        .date
                    }
                  </div>


                  <div className="paper-divider" />


                  <p className="paper-text">
                    {
                      selectedDocument
                        .description
                    }
                  </p>


                  <div className="paper-file-info">

                    <small>
                      ОРИГИНАЛ ДОКУМЕНТА
                    </small>

                    <strong>
                      {
                        selectedDocument
                          .fileName
                      }
                    </strong>

                    {selectedDocument.fileUrl ? (

                      <a
                        className="chancery-open-original"

                        href={
                          selectedDocument
                            .fileUrl
                        }

                        target="_blank"

                        rel="noreferrer"
                      >
                        Открыть оригинал
                      </a>

                    ) : (

                      <span>
                        Файл пока не
                        загружен
                      </span>

                    )}

                  </div>


                  {savedSignatures[
                    selectedDocument.id
                  ] && (

                    <div className="paper-signature">

                      <small>
                        ПОДПИСЬ
                        СТОРОНЫ
                      </small>

                      <img
                        src={
                          savedSignatures[
                            selectedDocument
                              .id
                          ].image
                        }

                        alt="Подпись"
                      />

                      <span>
                        Подписано:{" "}
                        {
                          formatSignedAt(
                            savedSignatures[
                              selectedDocument
                                .id
                            ]
                              .signedAt
                          )
                        }
                      </span>

                    </div>

                  )}


                  <div
                    className={
                      `paper-stamp stamp-${selectedDocument.status}`
                    }
                  >

                    {savedSignatures[
                      selectedDocument.id
                    ]
                      ? selectedDocument.status ===
                        "active"
                        ? "ДЕЙСТВУЕТ · ПОДПИСАНО"
                        : "ПОДПИСАНО"

                      : selectedDocument
                          .statusLabel}

                  </div>


                  <div className="paper-bottom">

                    <span>
                      К-2026
                    </span>

                    <span>
                      Электронный
                      экземпляр
                    </span>

                  </div>

                </section>


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
                            selectedDocument.status ===
                            "active"
                              ? "Документ продолжает действовать"
                              : "Подпись зарегистрирована"
                          }
                        </small>

                      </div>

                    </div>

                  )}

                </div>

              </>
            )}


            {/* =================================================
                ПОДПИСЬ
            ================================================= */}

            {signatureMode && (

              <section className="signature-screen">

                <div className="signature-heading">

                  <small>
                    ПОДПИСАНИЕ
                    ДОКУМЕНТА
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
                    Подписать
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
                  отменить подписание
                </button>


                <p className="signature-disclaimer">
                  Внутренняя
                  визуальная подпись
                  Канцелярии.
                </p>

              </section>

            )}

          </article>

        </div>

      )}

    </main>
  );
}
