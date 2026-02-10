import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          ComicTracker
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          You're offline
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Check your connection and try again. Previously cached pages may still be available.
        </p>
        <div className="mt-6">
          <Link
            className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
            href="/"
          >
            Back to Library
          </Link>
        </div>
      </div>
    </div>
  );
}

