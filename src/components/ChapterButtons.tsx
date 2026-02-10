"use client";

import { useTransition } from "react";
import { incrementChapters } from "@/app/actions";

export function ChapterButtons({ entryId }: { entryId: string }) {
  const [isPending, startTransition] = useTransition();

  const update = (delta: number) => {
    startTransition(async () => {
      await incrementChapters(entryId, delta);
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => update(-1)}
        disabled={isPending}
        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        -1
      </button>
      <button
        type="button"
        onClick={() => update(1)}
        disabled={isPending}
        className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
      >
        {isPending ? "..." : "+1"}
      </button>
    </div>
  );
}
