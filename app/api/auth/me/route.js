import {
  getSession,
} from "../../../lib/auth";


export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";


export async function GET() {

  const session =
    await getSession();


  if (!session) {

    return Response.json(
      {

        ok:
          false,

      },
      {

        status:
          401,

        headers: {

          "Cache-Control":
            "no-store",

        },

      }
    );

  }


  return Response.json(
    {

      ok:
        true,

      user:
        session.user,

      role:
        session.role,

    },
    {

      headers: {

        "Cache-Control":
          "no-store",

      },

    }
  );
}
