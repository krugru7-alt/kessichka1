import {
  setSession,
} from "../../../lib/auth";


export const runtime =
  "nodejs";


export async function POST() {

  try {

    await setSession(
      "kessi"
    );


    return Response.json({

      ok:
        true,

      user:
        "kessi",

      role:
        "user",

    });


  } catch (error) {

    console.error(
      "Kessi auth:",
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
