import Link from "next/link";
import { db } from "@/lib/db";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ImportForm } from "@/components/ImportForm";

export default async function ImportPage() {
  const lastImport = await db.importRun.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const lastImportSummary = lastImport
    ? {
        status: lastImport.status,
        filename: lastImport.filename,
        totalRows: lastImport.totalRows,
        uniqueKeys: lastImport.uniqueKeys,
        duplicates: lastImport.duplicates,
        createdCount: lastImport.createdCount,
        updatedCount: lastImport.updatedCount,
        durationMs: lastImport.durationMs,
        createdAt: lastImport.createdAt.toISOString(),
        error: lastImport.error,
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              ComicTracker
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Import Spreadsheet</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300" href="/imports">
              Import history
            </Link>
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300" href="/">
              Back to list
            </Link>
          </div>
        </div>

        <ImportForm lastImport={lastImportSummary} />
      </div>
    </div>
  );
}
