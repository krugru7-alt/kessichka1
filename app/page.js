import "./globals.css";

export default function Home() {
  return (
    <main className="kessichka-page">
      <section className="kessichka-card">
        <div className="kessichka-sun">☀️</div>

        <p className="kessichka-label">
          Для Кэссички
        </p>

        <h1 className="kessichka-title">
          Доброе утро ❤️
        </h1>

        <p className="kessichka-text">
          Пока я далеко.
          Мы будем напоминать тебе о простых вещах:
          поешь, не мёрзни, отдыхай и иногда улыбайся хехехе.
        </p>

        <div className="weather-card">
          <div className="weather-icon">🌤️</div>

          <h2 className="weather-title">
            Погода в Минске
          </h2>

          <p className="weather-text">
            Скоро здесь появится настоящая погода
          </p>
        </div>

        <p className="signature">
          — Обсидик
        </p>
      </section>
    </main>
  );
}
