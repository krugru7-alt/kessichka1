import {
  createHmac,
  timingSafeEqual,
} from "crypto";

import {
  cookies,
} from "next/headers";


const COOKIE_NAME =
  "our-world-session";


const SESSION_SECONDS =
  60 * 60 * 24 * 90;



/* =====================================================
   СЕКРЕТ
===================================================== */

function getSecret() {

  const secret =
    process.env.AUTH_SECRET;


  if (!secret) {

    throw new Error(
      "AUTH_SECRET не настроен"
    );

  }


  return secret;
}



/* =====================================================
   ПОДПИСЬ COOKIE
===================================================== */

function sign(
  value
) {

  return createHmac(
    "sha256",
    getSecret()
  )
    .update(
      value
    )
    .digest(
      "base64url"
    );
}



/* =====================================================
   СОЗДАЁМ СЕССИЮ
===================================================== */

function createSessionToken(
  user
) {

  const role =
    user === "obsid"
      ? "admin"
      : "user";


  const payload = {

    user,

    role,

    exp:
      Date.now() +
      SESSION_SECONDS *
      1000,

  };


  const encoded =
    Buffer
      .from(
        JSON.stringify(
          payload
        )
      )
      .toString(
        "base64url"
      );


  const signature =
    sign(
      encoded
    );


  return `${encoded}.${signature}`;
}



/* =====================================================
   ЧИТАЕМ СЕССИЮ
===================================================== */

function readSessionToken(
  token
) {

  try {

    if (!token) {
      return null;
    }


    const parts =
      token.split(
        "."
      );


    if (
      parts.length !== 2
    ) {
      return null;
    }


    const [
      encoded,
      signature,
    ] = parts;


    const expected =
      sign(
        encoded
      );


    const receivedBuffer =
      Buffer.from(
        signature
      );


    const expectedBuffer =
      Buffer.from(
        expected
      );


    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {

      return null;

    }


    if (
      !timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {

      return null;

    }


    const payload =
      JSON.parse(
        Buffer
          .from(
            encoded,
            "base64url"
          )
          .toString(
            "utf8"
          )
      );


    if (
      payload.user !==
        "kessi" &&
      payload.user !==
        "obsid"
    ) {

      return null;

    }


    if (
      payload.role !==
        "user" &&
      payload.role !==
        "admin"
    ) {

      return null;

    }


    if (
      typeof payload.exp !==
        "number" ||
      payload.exp <
        Date.now()
    ) {

      return null;

    }


    return payload;


  } catch {

    return null;

  }
}



/* =====================================================
   ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
===================================================== */

export async function getSession() {

  const cookieStore =
    await cookies();


  const token =
    cookieStore
      .get(
        COOKIE_NAME
      )
      ?.value;


  return readSessionToken(
    token
  );
}



/* =====================================================
   ВОЙТИ
===================================================== */

export async function setSession(
  user
) {

  const cookieStore =
    await cookies();


  const token =
    createSessionToken(
      user
    );


  cookieStore.set(
    COOKIE_NAME,
    token,
    {

      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        SESSION_SECONDS,

    }
  );
}



/* =====================================================
   ВЫЙТИ
===================================================== */

export async function clearSession() {

  const cookieStore =
    await cookies();


  cookieStore.set(
    COOKIE_NAME,
    "",
    {

      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        0,

    }
  );
}
