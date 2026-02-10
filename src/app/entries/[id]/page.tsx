import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntryStatus, EntryType } from "@prisma/client";
import { addAltTitle } from "@/app/actions";
import { DeleteEntryButton, RemoveAltTitleButton } from "@/components/EntryDeleteActions";
import { ChapterButtons } from "@/components/ChapterButtons";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  if (!date) return "—";
  return date.toISOString().slice(0, 10);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              ComicTracker
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{entry.title}</h1>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <Link
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
              href={`/entries/${entry.id}/edit`}
            >
              Edit
            </Link>
            <DeleteEntryButton entryId={entry.id} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <dl className="grid gap-4 md:grid-cols-2">
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
              <div className="md:col-span-2">
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
            <div className="md:col-span-2">
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
                    className="min-w-[240px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                  >
                    Add
                  </button>
                </form>
              </dd>
            </div>
          </dl>
        </div>

        <Link className="mt-6 inline-flex text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300" href="/">
          Back to list
        </Link>
      </div>
    </div>
  );
}
