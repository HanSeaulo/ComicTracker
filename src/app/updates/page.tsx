import Link from "next/link";
import { db } from "@/lib/db";
import { EntryStatus } from "@prisma/client";
import { ChapterButtons } from "@/components/ChapterButtons";
import { AppHeader } from "@/components/AppHeader";

export default async function UpdatesPage() {
  const recentEntries = await db.entry.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: 50,
  });

  const sorted = [...recentEntries].sort((a, b) => {
    const aPriority = a.status === EntryStatus.CURRENT ? 0 : 1;
    const bPriority = b.status === EntryStatus.CURRENT ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <AppHeader title="Latest Updates" showBack />

        <div className="space-y-3">
          {sorted.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <div>
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
              <ChapterButtons entryId={entry.id} currentChapters={entry.chaptersRead} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
