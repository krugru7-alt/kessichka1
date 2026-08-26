"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


export default function DrakoshaBuddy() {

  const [
    side,
    setSide,
  ] = useState("right");


  const [
    walking,
    setWalking,
  ] = useState(false);


  const [
    showKiss,
    setShowKiss,
  ] = useState(false);


  const kissTimerRef =
    useRef(null);


  /* =====================================================
     ДРАКОША ПЕРЕБЕГАЕТ С ОДНОЙ СТОРОНЫ НА ДРУГУЮ
  ===================================================== */

  useEffect(() => {

    let waitTimer;
    let walkTimer;


    function scheduleMove() {

      const delay =
        18000 +
        Math.random() *
        18000;


      waitTimer =
        window.setTimeout(
          () => {

            setWalking(
              true
            );


            setSide(
              (current) =>
                current === "right"
                  ? "left"
                  : "right"
            );


            walkTimer =
              window.setTimeout(
                () => {

                  setWalking(
                    false
                  );


                  scheduleMove();

                },
                2600
              );

          },
          delay
        );
    }


    scheduleMove();


    return () => {

      window.clearTimeout(
        waitTimer
      );


      window.clearTimeout(
        walkTimer
      );

    };

  }, []);



  /* =====================================================
     ТЬМОК НА ВЕСЬ ЭКРАН
  ===================================================== */

  function launchKiss() {

    window.clearTimeout(
      kissTimerRef.current
    );


    /*
      Небольшой сброс нужен,
      чтобы анимация запускалась
      даже при повторном нажатии.
    */

    setShowKiss(
      false
    );


    window.setTimeout(
      () => {

        setShowKiss(
          true
        );


        kissTimerRef.current =
          window.setTimeout(
            () => {

              setShowKiss(
                false
              );

            },
            1450
          );

      },
      20
    );
  }



  /* =====================================================
     ЧИСТИМ ТАЙМЕР
  ===================================================== */

  useEffect(() => {

    return () => {

      window.clearTimeout(
        kissTimerRef.current
      );

    };

  }, []);



  return (
    <>

      {/* =================================================
          БЕГАЮЩИЙ ДРАКОША
      ================================================= */}

      <div
        className={
          `buddy buddy-${side} ${
            walking
              ? "walking"
              : ""
          }`
        }
      >

        <button
          className="buddy-button"
          type="button"
          onClick={
            launchKiss
          }
          aria-label="Тьмок от Дракоши"
        >

          <img
            src="/drakosha.png"
            alt="Дракоша"
          />

        </button>

      </div>



      {/* =================================================
          ПОЛНОЭКРАННЫЙ ПОЦЕЛУЙ
      ================================================= */}

      {
        showKiss &&
        (

          <div
            className="drakosha-kiss-overlay"
            aria-hidden="true"
          >

            <span className="drakosha-kiss-heart heart-one">
              ♥
            </span>

            <span className="drakosha-kiss-heart heart-two">
              ♥
            </span>

            <span className="drakosha-kiss-heart heart-three">
              ♥
            </span>

            <span className="drakosha-kiss-heart heart-four">
              ♥
            </span>

            <span className="drakosha-kiss-heart heart-five">
              ♥
            </span>


            <div className="drakosha-kiss-center">

              <div className="drakosha-kiss-lips">
                💋
              </div>


              <strong>
                ТЬМОК
              </strong>

            </div>

          </div>

        )
      }

    </>
  );
}
