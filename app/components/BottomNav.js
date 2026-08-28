"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "⌂", label: "Главная", match: "/" },
  { href: "/#mini-screen", icon: "✉", label: "Послания", match: "#mini-screen" },
  { href: "/home", icon: "△", label: "Домой Кэсся", match: "/home" },
  { href: "/chancery", icon: "▤", label: "Всё серьёзно", match: "/chancery" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav world-v4-bottom-nav" aria-label="Главное меню">
      {items.map((item) => {
        const active =
          item.match === "/"
            ? pathname === "/"
            : item.match.startsWith("/") && pathname.startsWith(item.match);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${active ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
