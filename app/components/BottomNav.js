"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    icon: "⌂",
    label: "Главная",
  },
  {
    href: "/dragon",
    icon: "🐉",
    label: "Дракоша",
  },
  {
    href: "/room",
    icon: "◌",
    label: "Следы",
  },
  {
    href: "/for-you",
    icon: "♥",
    label: "Для тебя",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav"
      aria-label="Главное меню"
    >
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${
              active ? "active" : ""
            }`}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
