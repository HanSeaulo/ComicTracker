import Link from "next/link";
import { importEntries } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ImportPage() {
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
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300" href="/">
              Back to list
            </Link>
          </div>
        </div>

        <form action={importEntries} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Upload a .xlsx file with sheets named Manhwa, Manhua, LightNovel, or Western.</p>
            <p>Columns: Title, Status (CR/COM), Chapters Read, Total Chapters, Score, Start Date, End Date.</p>
          </div>

          <input
            type="file"
            name="file"
            accept=".xlsx"
            required
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:text-slate-200 dark:file:bg-slate-100 dark:file:text-slate-900"
          />

          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
          >
            Import Entries
          </button>
        </form>
      </div>
    </div>
  );
}
