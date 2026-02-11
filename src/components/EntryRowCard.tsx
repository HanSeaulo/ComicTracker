"use client";

import { useRouter } from "next/navigation";
import { ChapterButtons } from "@/components/ChapterButtons";
import { Card } from "@/components/ui/Card";

type EntryRowCardProps = {
  entryId: string;
  title: string;
  typeLabel: string;
  statusLabel: string;
  chaptersRead: number | null;
  totalChapters: number | null;
};

export function EntryRowCard({
  entryId,
  title,
  typeLabel,
  statusLabel,
  chaptersRead,
  totalChapters,
}: EntryRowCardProps) {
  const router = useRouter();

  const openEntry = () => {
    router.push(`/entries/${entryId}`);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={openEntry}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openEntry();
        }
      }}
      className="group grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 p-3 text-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] sm:p-3 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
    >
      <div className="min-w-0">
        <div className="line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {typeLabel} - {statusLabel} - {chaptersRead ?? "--"} / {totalChapters ?? "--"}
        </div>
      </div>
      <div className="rounded-full border border-slate-200 bg-white/70 p-1 dark:border-slate-700 dark:bg-slate-900/70">
        <ChapterButtons entryId={entryId} currentChapters={chaptersRead} />
      </div>
    </Card>
  );
}

