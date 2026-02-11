import Link from "next/link";
import { db } from "@/lib/db";
import { ImportForm } from "@/components/ImportForm";
import { AppHeader } from "@/components/AppHeader";
import { buttonClasses } from "@/components/ui/Button";

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
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <AppHeader title="Import Spreadsheet" showBack />
        <ImportForm
          lastImport={lastImportSummary}
          afterUpload={
            <Link
              className={buttonClasses({ variant: "secondary" })}
              href="/imports"
            >
              Import history
            </Link>
          }
        />
      </div>
    </div>
  );
}
