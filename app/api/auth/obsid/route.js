import {
  timingSafeEqual,
} from "crypto";

import {
  setSession,
} from "../../../lib/auth";


export const runtime =
  "nodejs";


function passwordsEqual(
  entered,
  expected
) {

  const enteredBuffer =
    Buffer.from(
      String(
        entered
      )
    );


  const expectedBuffer =
    Buffer.from(
      String(
        expected
      )
    );


  if (
    enteredBuffer.length !==
    expectedBuffer.length
  ) {

    return false;

  }


  return timingSafeEqual(
    enteredBuffer,
    expectedBuffer
  );
}


export async function POST(
  request
) {

  try {

    const expectedPassword =
      process.env
        .OBSID_PASSWORD;


    if (!expectedPassword) {

      console.error(
        "OBSID_PASSWORD не настроен"
      );


      return Response.json(
        {

          ok:
            false,

          error:
            "Вход пока не настроен",

        },
        {

          status:
            500,

        }
      );

    }


    const body =
      await request.json();


    const password =
      String(
        body?.password ||
        ""
      );


    if (
      !passwordsEqual(
        password,
        expectedPassword
      )
    ) {

      return Response.json(
        {

          ok:
            false,

          error:
            "Не тот пароль 👀",

        },
        {

          status:
            401,

        }
      );

    }


    await setSession(
      "obsid"
    );


    return Response.json({

      ok:
        true,

      user:
        "obsid",

      role:
        "admin",

    });


  } catch (error) {

    console.error(
      "Obsid auth:",
      error
    );


    return Response.json(
      {

        ok:
          false,

        error:
          "Не удалось войти",

      },
      {

        status:
          500,

      }
    );

  }
}
