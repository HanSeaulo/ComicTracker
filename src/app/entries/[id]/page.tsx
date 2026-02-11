import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntryStatus, EntryType, Prisma } from "@prisma/client";
import { addAltTitle } from "@/app/actions";
import { DeleteEntryButton, RemoveAltTitleButton } from "@/components/EntryDeleteActions";
import { ChapterButtons } from "@/components/ChapterButtons";
import { AppHeader } from "@/components/AppHeader";

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

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.join(", ");
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

function renderChanges(changes: Prisma.JsonValue | null) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) return null;
  const entries = Object.entries(changes as Record<string, unknown>);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 grid gap-1 text-xs text-slate-500 dark:text-slate-400">
      {entries.map(([key, value]) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const valueObj = value as Record<string, unknown>;
          if ("from" in valueObj || "to" in valueObj) {
            return (
              <div key={key}>
                {key}: {formatValue(valueObj.from)} {"->"} {formatValue(valueObj.to)}
              </div>
            );
          }
          if ("added" in valueObj || "removed" in valueObj) {
            return (
              <div key={key}>
                {key}: +{formatValue(valueObj.added)} -{formatValue(valueObj.removed)}
              </div>
            );
          }
        }
        return (
          <div key={key}>
            {key}: {formatValue(value)}
          </div>
        );
      })}
    </div>
  );
}

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await db.entry.findUnique({
    where: { id },
    include: { altTitles: { orderBy: { title: "asc" } } },
  });
  if (!entry) return notFound();

  const recentChanges = await db.activityLog.findMany({
    where: { entryId: entry.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <AppHeader title={entry.title} showBack />

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-slate-900">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</dt>
              <dd className="text-base font-semibold text-slate-900 dark:text-slate-100">{typeLabels[entry.type]}</dd>
            </div>
            {entry.descriptor && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Descriptor
                </dt>
                <dd className="text-base font-semibold text-slate-900 dark:text-slate-100">{entry.descriptor}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</dt>
              <dd className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {entry.status ? statusLabels[entry.status] : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Chapters</dt>
              <dd className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {entry.chaptersRead ?? "--"} / {entry.totalChapters ?? "--"}
              </dd>
              <div className="mt-2">
                <ChapterButtons entryId={entry.id} />
              </div>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Score</dt>
              <dd className="text-base font-semibold text-slate-900 dark:text-slate-100">{entry.score ?? "--"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Start Date</dt>
              <dd className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatDate(entry.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">End Date</dt>
              <dd className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatDate(entry.endDate)}</dd>
            </div>
            {entry.altTitles.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Alternate Titles
                </dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {entry.altTitles.map((alt) => (
                    <RemoveAltTitleButton
                      key={alt.id}
                      entryId={entry.id}
                      altTitleId={alt.id}
                      altTitle={alt.title}
                    />
                  ))}
                </dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Add Alternate Title
              </dt>
              <dd className="mt-2">
                <form
                  action={addAltTitle.bind(null, entry.id)}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    name="altTitle"
                    placeholder="New alternate title"
                    className="min-w-[220px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="h-11 rounded-full bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                  >
                    Add
                  </button>
                </form>
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <Link
              className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
              href={`/entries/${entry.id}/edit`}
            >
              Edit
            </Link>
            <DeleteEntryButton entryId={entry.id} />
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Recent Changes
            </h2>
            <Link className="text-xs font-semibold text-slate-600 dark:text-slate-300" href="/activity">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentChanges.length === 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">No recent changes for this entry.</div>
            )}
            {recentChanges.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{log.createdAt.toLocaleString()}</span>
                  <span>{log.action.replace("_", " ")}</span>
                </div>
                <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                  {log.message ?? "Updated entry"}
                </div>
                {renderChanges(log.changes)}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
