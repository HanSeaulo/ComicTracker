"use client";

import { useEffect } from "react";

type ThemeMode = "dark" | "light";

const THEME_KEY = "theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider() {
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    const initial: ThemeMode = stored === "light" ? "light" : "dark";

    if (stored !== "light" && stored !== "dark") {
      window.localStorage.setItem(THEME_KEY, initial);
    }

    applyTheme(initial);
  }, []);

  return null;
}
