import Link from "next/link";
import { db } from "@/lib/db";
import { ImportForm } from "@/components/ImportForm";
import { AppHeader } from "@/components/AppHeader";

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
        <AppHeader title="Import Spreadsheet" showBack />

        <div className="mb-4">
          <Link
            className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
            href="/imports"
          >
            Import history
          </Link>
        </div>

        <ImportForm lastImport={lastImportSummary} />
      </div>
    </div>
  );
}
