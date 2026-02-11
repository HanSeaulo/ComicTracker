"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

type LatestUpdateItem = {
  id: string;
  title: string;
  chaptersRead: number | null;
  totalChapters: number | null;
};

type LatestUpdatesPanelProps = {
  updates: LatestUpdateItem[];
};

const STORAGE_KEY = "ct.latestUpdates.expanded";

export function LatestUpdatesPanel({ updates }: LatestUpdatesPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setExpanded(stored === "1");
    setHydrated(true);
  }, []);

  const toggle = () => {
    setExpanded((value) => {
      const next = !value;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <Card className="p-4 sm:p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
          aria-expanded={expanded}
        >
          <span>Latest Updates ({updates.length})</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <Link
          className="shrink-0 text-xs font-semibold text-slate-600 hover:underline dark:text-slate-300"
          href="/updates"
          onClick={(event) => event.stopPropagation()}
        >
          View all
        </Link>
      </div>

      {hydrated && expanded ? (
        <div className="mt-4 space-y-3">
          {updates.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200"
            >
              <Link
                className="font-semibold text-slate-900 hover:underline dark:text-slate-100"
                href={`/entries/${entry.id}`}
              >
                {entry.title}
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {entry.chaptersRead ?? "--"} / {entry.totalChapters ?? "--"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
