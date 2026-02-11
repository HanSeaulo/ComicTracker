"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { autofillMissingCoversSafe } from "@/app/actions/coverAutofill";
import { useToast } from "@/components/ui/Toast";

export function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  const onAutofill = async () => {
    const confirmed = window.confirm(
      "This will try to fill missing covers using AniList and skip unclear matches. It can take around 30 seconds per run. Continue?",
    );
    if (!confirmed) return;

    setOpen(false);
    setIsAutofilling(true);
    try {
      const summary = await autofillMissingCoversSafe({ limit: 30 });
      toast({
        title: "Auto-fill complete",
        description: `Updated ${summary.updated}, skipped ${summary.skipped}, failed ${summary.failed}, scanned ${summary.scanned} in ${summary.durationSeconds}s.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Auto-fill failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsAutofilling(false);
    }
  };

  const menuItemClass =
    "block w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.5c1.3-3 3.9-4.5 6.5-4.5s5.2 1.5 6.5 4.5" />
        </svg>
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 z-20 mt-2 min-w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <Link href="/import" role="menuitem" onClick={() => setOpen(false)} className={menuItemClass}>
            Import .xlsx
          </Link>
          <Link href="/imports" role="menuitem" onClick={() => setOpen(false)} className={menuItemClass}>
            Import history
          </Link>
          <Link href="/activity" role="menuitem" onClick={() => setOpen(false)} className={menuItemClass}>
            Activity
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={onAutofill}
            disabled={isAutofilling}
            className={menuItemClass}
          >
            {isAutofilling ? "Auto-filling covers..." : "Auto-fill covers (safe)"}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className={menuItemClass}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

