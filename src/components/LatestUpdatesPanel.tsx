"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

type LatestUpdateItem = {
  id: string;
  title: string;
  chaptersRead: number | null;
  totalChapters: number | null;
};

type LatestUpdatesPanelProps = {
  updates: LatestUpdateItem[];
};

export function LatestUpdatesPanel({ updates }: LatestUpdatesPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const onChange = () => setDesktop(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const defaultVisibleCount = desktop ? 5 : 3;
  const visibleItems = useMemo(
    () => (expanded ? updates : updates.slice(0, defaultVisibleCount)),
    [expanded, updates, defaultVisibleCount],
  );
  const canToggle = updates.length > defaultVisibleCount;

  return (
    <Card className="p-4 sm:p-4">
      <div className="flex items-center justify-between">
        <Label>Latest Updates</Label>
        <Link className="text-xs font-semibold text-slate-600 dark:text-slate-300" href="/updates">
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {visibleItems.map((entry) => (
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

      {canToggle ? (
        <div className="mt-3">
          <Button variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Show less" : `Show more (${updates.length - defaultVisibleCount})`}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
