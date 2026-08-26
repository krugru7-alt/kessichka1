import PushSender from "./PushSender";
import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  getSession,
} from "../lib/auth";


export default async function AdminPage() {

  const session =
    await getSession();


  if (
    !session
  ) {

    redirect(
      "/login"
    );

  }


  if (
    session.role !==
    "admin"
  ) {

    redirect(
      "/"
    );

  }


  return (

    <div className="page world-admin-page">


      <section className="world-admin-hero">


        <small>
          НАШ МИРОК · УПРАВЛЕНИЕ
        </small>


        <h1>
          Панель Обсидика
        </h1>


        <p>
          Здесь будем управлять тем,
          что появляется в нашем мирке.
        </p>


        <Link
          href="/"
          className="world-admin-back"
        >
          ← Вернуться в наш мирок
        </Link>


      </section>



      <section className="world-admin-grid">


       
<PushSender />


        <article className="world-admin-card">

          <span>
            🔔
          </span>

          <small>
            ПРИВЕТЫ
          </small>

          <h2>
            Push
          </h2>

          <p>
            Отсюда будем отправлять Кэссичке приветы на телефон.
          </p>

          <i>
            подключим дальше
          </i>

        </article>



        <article className="world-admin-card">

          <span>
            ⚖
          </span>

          <small>
            ОТДЕЛ №01
          </small>

          <h2>
            Всё серьёзно
          </h2>

          <p>
            Документы, подписи, статусы и журнал Канцелярии.
          </p>

          <Link href="/chancery">
            Открыть →
          </Link>

        </article>



        <article className="world-admin-card">

          <span>
            ☀
          </span>

          <small>
            ГЛАВНАЯ
          </small>

          <h2>
            Наш мирок
          </h2>

          <p>
            Позже здесь поменяем сообщения дня и расписание.
          </p>

          <Link href="/">
            Посмотреть →
          </Link>

        </article>


      </section>


    </div>
  );
}
