import Link from "next/link";
import { db } from "@/lib/db";
import { EntryStatus, EntryType, Prisma } from "@prisma/client";
import { EntryFilters } from "@/components/EntryFilters";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppHeader } from "@/components/AppHeader";
import { EntryRowCard } from "@/components/EntryRowCard";
import { LatestUpdatesPanel } from "@/components/LatestUpdatesPanel";
import { buttonClasses } from "@/components/ui/Button";

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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <AppHeader title="Library" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-fit">
            <ThemeToggle />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className={buttonClasses({ variant: "primary" })}
              href="/entries/new"
            >
              Add Entry
            </Link>
          </div>
        </div>

        <EntryFilters />

        <LatestUpdatesPanel updates={recentSorted} />

        {showImportMessage && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            Import complete: {imported} created, {updated} updated, {skipped} skipped.
          </div>
        )}

        <div className="space-y-3">
          {sortedEntries.length === 0 && (
            <div className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
              No entries yet. Add one or import a spreadsheet.
            </div>
          )}
          {sortedEntries.map((entry) => (
            <EntryRowCard
              key={entry.id}
              entryId={entry.id}
              title={entry.title}
              typeLabel={typeLabels[entry.type]}
              statusLabel={entry.status ? statusLabels[entry.status] : "Unknown"}
              chaptersRead={entry.chaptersRead}
              totalChapters={entry.totalChapters}
              coverImageUrl={entry.coverImageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
