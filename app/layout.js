import "./globals.css";
import SiteShell from "./components/SiteShell";

export const metadata = {
  title: "Для Кэссички ❤️",
  description: "Маленький личный уголок в интернете",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
