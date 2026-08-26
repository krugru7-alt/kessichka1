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
   СТАРЫЙ ФОРМАТ ПОДПИСЕЙ
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


  const canvasRef =
    useRef(null);

  const documentStageRef =
    useRef(null);

  const drawingRef =
    useRef(false);

  const draggingSignatureRef =
    useRef(false);


  /* =====================================================
     ЗАГРУЖАЕМ ПОДПИСИ
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

          if (!raw) {
            return;
          }

          if (
            raw.startsWith(
              "data:image"
            )
          ) {
            result[
              document.id
            ] =
              normalizeSignature(
                raw
              );

            return;
          }

          const parsed =
            JSON.parse(raw);

          if (parsed?.image) {
            result[
              document.id
            ] =
              normalizeSignature(
                parsed
              );
          }
        } catch {
          // ничего критичного
        }
      }
    );

    setSavedSignatures(
      result
    );
  }, []);


  /* =====================================================
     СОХРАНЕНИЕ
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
      // позже здесь будет сервер
    }
  }


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
    useMemo(() => {
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

    setPlacementMode(
      false
    );

    setSignatureHasInk(
      false
    );

    setImageError(
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

    setPlacementMode(
      false
    );

    setSignatureHasInk(
      false
    );

    setImageError(
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
      2.4;

    context.lineCap =
      "round";

    context.lineJoin =
      "round";

    context.strokeStyle =
      "#193868";
  }


  useEffect(() => {
    if (!signatureMode) {
      return;
    }

    const timer =
      window.setTimeout(
        prepareCanvas,
        80
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
    event.preventDefault();

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

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

      x: 50,
      y: 86,
      width: 27,
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

    setSignatureMode(
      false
    );

    setSignatureHasInk(
      false
    );

    setPlacementMode(
      true
    );
  }


  /* =====================================================
     ПЕРЕТАСКИВАНИЕ
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
      ) * 100;

    let y =
      (
        (
          event.clientY -
          rect.top
        ) /
        rect.height
      ) * 100;

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

      {counts.sign > 0 && (

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
              {counts.sign}
              {" "}
              {counts.sign === 1
                ? "документ"
                : "документа"}
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

      )}


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


        {/* ФИЛЬТРЫ */}

        <div className="chancery-filters">

          {FILTERS.map(
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

                {item.label}

                <span>
                  {
                    counts[
                      item.id
                    ]
                  }
                </span>

              </button>

            )
          )}

        </div>


        {/* ДОКУМЕНТЫ */}

        <div className="chancery-case-list">

          {visibleDocuments.length ===
          0 ? (

            <div className="chancery-empty">

              <b>
                Пусто
              </b>

              <span>
                В этой категории
                сейчас нет документов.
              </span>

            </div>

          ) : (

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
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
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

          )}

        </div>

      </section>


      <p className="chancery-register-note">
        Электронный реестр ·
        Канцелярия К.
      </p>


      {/* =================================================
          ОТКРЫТЫЙ ДОКУМЕНТ
      ================================================= */}

      {selectedDocument && (

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

            {/* TOP */}

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


              <span
                className="chancery-file-status"
              >
                {
                  getStatusText(
                    selectedDocument
                  )
                }
              </span>

            </header>


            {!signatureMode && (
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


                {/* =======================================
                    ОРИГИНАЛ
                ======================================= */}

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


                  {!imageError ? (

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


                      {savedSignatures[
                        selectedDocument.id
                      ] && (

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
                              `${savedSignatures[
                                selectedDocument.id
                              ].x}%`,

                            top:
                              `${savedSignatures[
                                selectedDocument.id
                              ].y}%`,

                            width:
                              `${savedSignatures[
                                selectedDocument.id
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

                  ) : (

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

                  )}

                </section>


                {/* =======================================
                    РАЗМЕЩЕНИЕ ПОДПИСИ
                ======================================= */}

                {placementMode &&
                  savedSignatures[
                    selectedDocument.id
                  ] && (

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
                        onClick={() =>
                          setPlacementMode(
                            false
                          )
                        }
                      >
                        Закрепить
                      </button>

                    </section>

                  )}


                {/* =======================================
                    ДЕЙСТВИЯ
                ======================================= */}

                {!placementMode && (

                  <section className="chancery-file-actions">

                    {isAwaitingSignature(
                      selectedDocument
                    ) && (

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

                    )}


                    {savedSignatures[
                      selectedDocument.id
                    ] && (

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

                    )}


                    {savedSignatures[
                      selectedDocument.id
                    ] && (

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

                    )}

                  </section>

                )}

              </>
            )}


            {/* =================================================
                ЭКРАН ПОДПИСИ
            ================================================= */}

            {signatureMode && (

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
                    подпись
                  </span>

                </div>


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

            )}

          </article>

        </div>

      )}

    </main>
  );
}
