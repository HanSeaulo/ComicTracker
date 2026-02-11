import Link from "next/link";
import { db } from "@/lib/db";
import { EntryStatus, EntryType, Prisma } from "@prisma/client";
import { EntryFilters } from "@/components/EntryFilters";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ChapterButtons } from "@/components/ChapterButtons";
import { AppHeader } from "@/components/AppHeader";

type SearchParams = {
  q?: string;
  status?: string;
  type?: string;
  sort?: string;
  imported?: string;
  updated?: string;
  skipped?: string;
};

const typeLabels: Record<EntryType, string> = {
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  LIGHT_NOVEL: "Light Novel",
  WESTERN: "Western",
};

const statusLabels: Record<EntryStatus, string> = {
  CURRENT: "Current",
  COMPLETED: "Completed",
};

function formatDate(date: Date | null) {
  if (!date) return "--";
  return date.toISOString().slice(0, 10);
}

function parseFilter<T extends string>(value: unknown, values: T[]): T | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (values.includes(trimmed as T)) return trimmed as T;
  return null;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim();
  const queryLower = query ? query.toLowerCase().trim() : undefined;
  const status = parseFilter(resolvedParams.status, Object.values(EntryStatus));
  const type = parseFilter(resolvedParams.type, Object.values(EntryType));
  const sort = resolvedParams.sort ?? "title";

  const whereClause: Prisma.EntryWhereInput = {
    status: status ?? undefined,
    type: type ?? undefined,
    ...(queryLower
      ? {
          OR: [
            { titleLower: { contains: queryLower } },
            { baseTitleLower: { contains: queryLower } },
            { descriptorLower: { contains: queryLower } },
            { altTitles: { some: { titleLower: { contains: queryLower } } } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "updated"
      ? [{ updatedAt: "desc" as const }]
      : sort === "chapters"
      ? [{ chaptersRead: "desc" as const }]
      : sort === "created"
      ? [{ createdAt: "desc" as const }]
      : [{ title: "asc" as const }];

  const entries = await db.entry.findMany({
    where: whereClause,
    orderBy,
  });

  const sortedEntries =
    sort === "progress"
      ? [...entries].sort((a, b) => {
          const aProgress =
            a.totalChapters && a.totalChapters > 0 && a.chaptersRead !== null
              ? a.chaptersRead / a.totalChapters
              : -1;
          const bProgress =
            b.totalChapters && b.totalChapters > 0 && b.chaptersRead !== null
              ? b.chaptersRead / b.totalChapters
              : -1;
          return bProgress - aProgress;
        })
      : entries;

  const recentEntries = await db.entry.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: 6,
  });
  const recentSorted = [...recentEntries].sort((a, b) => {
    const aPriority = a.status === EntryStatus.CURRENT ? 0 : 1;
    const bPriority = b.status === EntryStatus.CURRENT ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const imported = resolvedParams.imported ? Number(resolvedParams.imported) : undefined;
  const updated = resolvedParams.updated ? Number(resolvedParams.updated) : undefined;
  const skipped = resolvedParams.skipped ? Number(resolvedParams.skipped) : undefined;
  const showImportMessage =
    typeof imported === "number" &&
    typeof updated === "number" &&
    typeof skipped === "number" &&
    Number.isFinite(imported) &&
    Number.isFinite(updated) &&
    Number.isFinite(skipped);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <AppHeader
          title="Library"
          actions={
            <>
              <ThemeToggle />
              <Link
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
                href="/import"
              >
                Import .xlsx
              </Link>
              <Link
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                href="/entries/new"
              >
                Add Entry
              </Link>
            </>
          }
        />

        <EntryFilters />

        <section className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Latest Updates
            </h2>
            <Link className="text-xs font-semibold text-slate-600 dark:text-slate-300" href="/updates">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentSorted.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200"
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
                <ChapterButtons entryId={entry.id} />
              </div>
            ))}
          </div>
        </section>

        {showImportMessage && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Import complete: {imported} created, {updated} updated, {skipped} skipped.
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900">
          <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="col-span-4">Name</span>
            <span className="col-span-3 text-right">Chapters</span>
            <span className="col-span-1 text-right">Score</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Type</span>
          </div>
          {sortedEntries.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No entries yet. Add one or import a spreadsheet.
            </div>
          )}
          {sortedEntries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-12 gap-3 border-b border-slate-100 px-4 py-4 text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-200"
            >
              <div className="col-span-4">
                <Link
                  className="font-semibold text-slate-900 hover:underline dark:text-slate-100"
                  href={`/entries/${entry.id}`}
                >
                  {entry.title}
                </Link>
                {entry.startDate && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(entry.startDate)} → {formatDate(entry.endDate)}
                  </p>
                )}
              </div>
              <div className="col-span-3 text-right">
                <div className="flex flex-col items-end gap-2">
                  <span>
                    {entry.chaptersRead ?? "--"} / {entry.totalChapters ?? "--"}
                  </span>
                  <ChapterButtons entryId={entry.id} />
                </div>
              </div>
              <div className="col-span-1 text-right">{entry.score ?? "--"}</div>
              <div className="col-span-2">
                {entry.status ? statusLabels[entry.status] : "Unknown"}
              </div>
              <div className="col-span-2">{typeLabels[entry.type]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
