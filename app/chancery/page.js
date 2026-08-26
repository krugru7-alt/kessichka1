"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* =====================================================
   ВРЕМЕННЫЕ ДОКУМЕНТЫ
   Позже заменим на документы из Neon
===================================================== */

const DEMO_DOCUMENTS = [
  {
    id: "k-001",
    number: "К-001/26",
    title: "Договор об обязательном отдыхе",
    date: "26.08.2026",
    status: "sign",
    statusLabel: "Требует подписи",
    type: "Договор",
    fileName: "Договор_об_обязательном_отдыхе.pdf",
    description:
      "Документ регулирует порядок своевременного отдыха и устанавливает ответственность за попытки делать слишком много дел одновременно.",
    requiresSignature: true,
  },

  {
    id: "k-002",
    number: "К-002/26",
    title: "Акт приёма-передачи тьмока",
    date: "20.08.2026",
    status: "active",
    statusLabel: "Действует",
    type: "Акт",
    fileName: "Акт_приема_передачи_тьмока.pdf",
    description:
      "Факт передачи одного тьмока подтверждён. Претензий по количеству, качеству и комплектности не имеется.",
    requiresSignature: false,
  },

  {
    id: "k-003",
    number: "К-003/26",
    title: "Лицензия на законные капризы",
    date: "14.08.2026",
    status: "active",
    statusLabel: "Действует",
    type: "Лицензия",
    fileName: "Лицензия_на_капризы.pdf",
    description:
      "Предоставляет владельцу документа бессрочное право на разумное количество капризов без дополнительного согласования.",
    requiresSignature: false,
  },

  {
    id: "k-004",
    number: "К-004/26",
    title: "Постановление о пяти минутах безделья",
    date: "07.08.2026",
    status: "done",
    statusLabel: "Исполнено",
    type: "Постановление",
    fileName: "Постановление_о_безделье.pdf",
    description:
      "Постановление исполнено в полном объёме. Срок обжалования давно и безнадёжно пропущен.",
    requiresSignature: false,
  },

  {
    id: "k-005",
    number: "К-005/26",
    title: "Материалы особой важности",
    date: "01.08.2026",
    status: "archive",
    statusLabel: "Архив",
    type: "Материалы дела",
    fileName: "Материалы_особой_важности.pdf",
    description:
      "Документ помещён в архив. Основания для извлечения из архива отсутствуют. Пока.",
    requiresSignature: false,
  },
];

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
   ОСНОВНАЯ СТРАНИЦА
===================================================== */

export default function ChanceryPage() {
  const [filter, setFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] =
    useState(null);

  const [signatureMode, setSignatureMode] =
    useState(false);

  const [savedSignatures, setSavedSignatures] =
    useState({});

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  /* =====================================================
     ЗАГРУЖАЕМ ЛОКАЛЬНЫЕ ПОДПИСИ

     Пока это только тест.
     На следующем этапе подписи уйдут в Neon.
  ===================================================== */

  useEffect(() => {
    const signatures = {};

    DEMO_DOCUMENTS.forEach((document) => {
      try {
        const signature = localStorage.getItem(
          `chancery-signature-${document.id}`
        );

        if (signature) {
          signatures[document.id] = signature;
        }
      } catch {
        // localStorage может быть недоступен
      }
    });

    setSavedSignatures(signatures);
  }, []);

  /* =====================================================
     ФИЛЬТРАЦИЯ
  ===================================================== */

  const visibleDocuments = useMemo(() => {
    if (filter === "all") {
      return DEMO_DOCUMENTS;
    }

    return DEMO_DOCUMENTS.filter(
      (document) => document.status === filter
    );
  }, [filter]);

  /* =====================================================
     СТАТИСТИКА
  ===================================================== */

  const counts = useMemo(() => {
    return {
      all: DEMO_DOCUMENTS.length,

      sign: DEMO_DOCUMENTS.filter(
        (document) => document.status === "sign"
      ).length,

      active: DEMO_DOCUMENTS.filter(
        (document) => document.status === "active"
      ).length,

      done: DEMO_DOCUMENTS.filter(
        (document) => document.status === "done"
      ).length,

      archive: DEMO_DOCUMENTS.filter(
        (document) => document.status === "archive"
      ).length,
    };
  }, []);

  /* =====================================================
     ОТКРЫТИЕ ДОКУМЕНТА
  ===================================================== */

  function openDocument(document) {
    setSelectedDocument(document);
    setSignatureMode(false);
  }

  function closeDocument() {
    setSelectedDocument(null);
    setSignatureMode(false);
  }

  /* =====================================================
     CANVAS — ПОДПИСЬ ПАЛЬЦЕМ / МЫШКОЙ
  ===================================================== */

  function prepareCanvas() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

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

    context.lineWidth = 2.2;

    context.lineCap = "round";
    context.lineJoin = "round";

    context.strokeStyle =
      "#1f252c";
  }

  useEffect(() => {
    if (!signatureMode) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        prepareCanvas();
      }, 50);

    return () =>
      window.clearTimeout(timeout);
  }, [signatureMode]);

  function getCanvasPoint(event) {
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

  function startDrawing(event) {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    event.preventDefault();

    drawingRef.current = true;

    canvas.setPointerCapture?.(
      event.pointerId
    );

    const point =
      getCanvasPoint(event);

    if (!point) {
      return;
    }

    const context =
      canvas.getContext("2d");

    context.beginPath();

    context.moveTo(
      point.x,
      point.y
    );
  }

  function drawSignature(event) {
    if (!drawingRef.current) {
      return;
    }

    event.preventDefault();

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const point =
      getCanvasPoint(event);

    if (!point) {
      return;
    }

    const context =
      canvas.getContext("2d");

    context.lineTo(
      point.x,
      point.y
    );

    context.stroke();
  }

  function stopDrawing(event) {
    drawingRef.current = false;

    canvasRef.current?.releasePointerCapture?.(
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
      canvas.getContext("2d");

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  /* =====================================================
     СОХРАНИТЬ ПОДПИСЬ

     Сейчас localStorage.
     Позже отправим PNG + дату в API.
  ===================================================== */

  function saveSignature() {
    const canvas =
      canvasRef.current;

    if (
      !canvas ||
      !selectedDocument
    ) {
      return;
    }

    const signature =
      canvas.toDataURL("image/png");

    try {
      localStorage.setItem(
        `chancery-signature-${selectedDocument.id}`,
        signature
      );
    } catch {
      // Не критично для тестового этапа
    }

    setSavedSignatures(
      (current) => ({
        ...current,

        [selectedDocument.id]:
          signature,
      })
    );

    setSignatureMode(false);
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
            {DEMO_DOCUMENTS.length}
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

      {/* ФИЛЬТР */}

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
                setFilter(item.id)
              }
            >
              <span>
                {item.label}
              </span>

              <small>
                {counts[item.id]}
              </small>
            </button>
          )
        )}
      </nav>

      {/* СПИСОК */}

      <section className="chancery-register">
        <div className="chancery-register-head">
          <small>
            РЕЕСТР ДОКУМЕНТОВ
          </small>

          <span>
            {visibleDocuments.length}
          </span>
        </div>

        <div className="chancery-documents">
          {visibleDocuments.map(
            (document) => {
              const signed =
                Boolean(
                  savedSignatures[
                    document.id
                  ]
                );

              return (
                <button
                  key={document.id}
                  type="button"
                  className="chancery-document"
                  onClick={() =>
                    openDocument(
                      document
                    )
                  }
                >
                  <div className="chancery-document-number">
                    {document.number}
                  </div>

                  <div className="chancery-document-main">
                    <small>
                      {document.type}
                    </small>

                    <h2>
                      {document.title}
                    </h2>

                    <p>
                      от{" "}
                      {document.date}
                    </p>
                  </div>

                  <div
                    className={`chancery-status status-${document.status}`}
                  >
                    <span />

                    {signed
                      ? "Подписано"
                      : document.statusLabel}
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

      {/* ПОДВАЛ */}

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
                  selectedDocument.number
                }
              </span>
            </header>

            {!signatureMode && (
              <>
                {/* БУМАЖНЫЙ ДОКУМЕНТ */}

                <section className="chancery-paper">
                  <div className="paper-topline">
                    КАНЦЕЛЯРИЯ К.
                  </div>

                  <div className="paper-registration">
                    <span>
                      {
                        selectedDocument.type
                      }
                    </span>

                    <span>
                      №{" "}
                      {
                        selectedDocument.number
                      }
                    </span>
                  </div>

                  <h2>
                    {
                      selectedDocument.title
                    }
                  </h2>

                  <div className="paper-date">
                    от{" "}
                    {
                      selectedDocument.date
                    }
                  </div>

                  <div className="paper-divider" />

                  <p className="paper-text">
                    {
                      selectedDocument.description
                    }
                  </p>

                  <div className="paper-file-info">
                    <small>
                      ПРИКРЕПЛЁННЫЙ ФАЙЛ
                    </small>

                    <strong>
                      {
                        selectedDocument.fileName
                      }
                    </strong>

                    <span>
                      PDF · просмотр
                      подключим следующим
                      шагом
                    </span>
                  </div>

                  {/* СОХРАНЁННАЯ ПОДПИСЬ */}

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
                          ]
                        }
                        alt="Подпись"
                      />

                      <span>
                        Документ подписан
                        в электронной
                        Канцелярии
                      </span>
                    </div>
                  )}

                  {/* ПЕЧАТЬ */}

                  <div
                    className={`paper-stamp stamp-${selectedDocument.status}`}
                  >
                    {savedSignatures[
                      selectedDocument.id
                    ]
                      ? "ПОДПИСАНО"
                      : selectedDocument.statusLabel}
                  </div>

                  <div className="paper-bottom">
                    <span>
                      К-2026
                    </span>

                    <span>
                      Лист 1 из 1
                    </span>
                  </div>
                </section>

                {/* ДЕЙСТВИЯ */}

                <div className="chancery-file-actions">
                  {selectedDocument.requiresSignature &&
                    !savedSignatures[
                      selectedDocument.id
                    ] && (
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
                          Документ
                          подписан
                        </b>

                        <small>
                          Подпись
                          зарегистрирована
                          в Канцелярии
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* =================================================
                ПОЛЕ ПОДПИСИ
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
                      selectedDocument.number
                    }
                  </span>

                  <b>
                    {
                      selectedDocument.title
                    }
                  </b>
                </div>

                <div className="signature-pad">
                  <canvas
                    ref={canvasRef}
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
                  Внутренняя визуальная
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
