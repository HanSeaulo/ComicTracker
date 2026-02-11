"use client";

import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const onLogout = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isPending}
      className={
        className ??
        "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
      }
    >
      {isPending ? "Signing out..." : "Logout"}
    </button>
  );
}
