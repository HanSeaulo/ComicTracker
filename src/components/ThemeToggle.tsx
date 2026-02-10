"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const THEME_KEY = "theme";

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    const initial = stored === "light" ? "light" : "dark";
    if (stored !== "light" && stored !== "dark") {
      window.localStorage.setItem(THEME_KEY, initial);
    }
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function setAndApply(next: ThemeMode) {
    setTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <SunIcon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
      <button
        type="button"
        role="switch"
        aria-checked={mounted ? isDark : true}
        onClick={() => setAndApply(isDark ? "light" : "dark")}
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-950 ${
          isDark
            ? "border-slate-900 bg-slate-900 dark:border-slate-100 dark:bg-slate-100"
            : "border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-800"
        }`}
        aria-label="Toggle dark mode"
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition dark:bg-slate-900 ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <MoonIcon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
