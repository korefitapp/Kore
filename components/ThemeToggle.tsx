"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Toggle light/dark mode persistido em localStorage.
 * Reusável em qualquer página (login, app, dashboards).
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kore:theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (saved === null && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("kore:theme", next ? "dark" : "light");
  }

  if (!mounted) {
    return <span className="inline-block h-9 w-9" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="inline-grid h-9 w-9 place-items-center rounded-xl border border-kore-border bg-kore-card text-kore-subink transition hover:border-kore-emerald/60 hover:text-kore-ink"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
