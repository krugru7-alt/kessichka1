import "./globals.css";

import SiteShell from "./components/SiteShell";


export const metadata = {

  title:
    "Наш мирок ♥",

  description:
    "Всё общее с тобой такое родное",

};


export default function RootLayout({
  children,
}) {

  return (

    <html lang="ru">

      <body>

        <SiteShell>
          {children}
        </SiteShell>

      </body>

    </html>

  );
}
