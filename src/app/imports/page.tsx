import Link from "next/link";
import { db } from "@/lib/db";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";

function formatDuration(ms: number) {
  if (!Number.isFinite(ms)) return "--";
  if (ms < 1000) return `${ms} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
}

export default async function ImportsPage() {
  const runs = await db.importRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              ComicTracker
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Import History</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LogoutButton />
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300" href="/import">
              Import
            </Link>
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300" href="/">
              Back to list
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="col-span-3">Date</span>
            <span className="col-span-3">File</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Created</span>
            <span className="col-span-1 text-right">Updated</span>
            <span className="col-span-1 text-right">Dupes</span>
            <span className="col-span-1 text-right">Duration</span>
          </div>
          {runs.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No imports yet.
            </div>
          )}
          {runs.map((run) => (
            <div
              key={run.id}
              className="grid grid-cols-12 gap-3 border-b border-slate-100 px-4 py-4 text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-200"
            >
              <div className="col-span-3">{run.createdAt.toLocaleString()}</div>
              <div className="col-span-3 truncate" title={run.filename}>
                {run.filename}
              </div>
              <div
                className={`col-span-2 font-semibold ${
                  run.status === "SUCCESS" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"
                }`}
              >
                {run.status}
              </div>
              <div className="col-span-1 text-right">{run.createdCount}</div>
              <div className="col-span-1 text-right">{run.updatedCount}</div>
              <div className="col-span-1 text-right">{run.duplicates}</div>
              <div className="col-span-1 text-right">{formatDuration(run.durationMs)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
