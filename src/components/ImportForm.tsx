"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { importEntries, type ImportResult } from "@/app/actions";

type ImportSummary = ImportResult & {
  createdAt?: string;
};

type ImportFormProps = {
  lastImport?: ImportSummary | null;
};

function formatBytes(size: number) {
  if (!Number.isFinite(size)) return "--";
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDuration(ms: number) {
  if (!Number.isFinite(ms)) return "--";
  if (ms < 1000) return `${ms} ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}m ${remainder}s`;
}

export function ImportForm({ lastImport }: ImportFormProps) {
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canceledRef = useRef(false);
  const runIdRef = useRef(0);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileInfo(null);
      return;
    }
    setFileInfo({ name: file.name, size: file.size });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file");
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;
    if (!file) {
      setError("Please select an .xlsx file before importing.");
      setResult(null);
      return;
    }

    canceledRef.current = false;
    setError(null);
    setResult(null);
    setIsSubmitting(true);
    runIdRef.current += 1;
    const currentRun = runIdRef.current;

    try {
      const formData = new FormData(form);
      const response = await importEntries(formData);
      if (runIdRef.current !== currentRun || canceledRef.current) return;
      if (response.status === "FAILED") {
        setError(response.error ?? "Import failed.");
      } else {
        setResult(response);
      }
    } catch (err) {
      if (runIdRef.current !== currentRun || canceledRef.current) return;
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      if (runIdRef.current === currentRun && !canceledRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) return;
    runIdRef.current += 1;
    canceledRef.current = true;
    setIsSubmitting(false);
    setError("Import canceled.");
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900"
      >
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>Upload a .xlsx file with sheets named Manhwa, Manhua, LightNovel, or Western.</p>
          <p>Columns: Title, Status (CR/COM), Chapters Read, Total Chapters, Score, Start Date, End Date.</p>
        </div>

        <div className="space-y-3">
          <input
            type="file"
            name="file"
            accept=".xlsx"
            required
            disabled={isSubmitting}
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:opacity-60 dark:text-slate-200 dark:file:bg-slate-100 dark:file:text-slate-900"
          />
          {fileInfo && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Selected: {fileInfo.name} · {formatBytes(fileInfo.size)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-slate-900 dark:border-t-transparent" />
                Importing...
              </>
            ) : (
              "Import Entries"
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isSubmitting}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600"
          >
            Cancel
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {result && result.status === "SUCCESS" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          <div className="text-xs font-semibold uppercase tracking-wider">Import complete</div>
          <div className="mt-2 grid gap-1 text-sm">
            <div>Created: {result.createdCount}</div>
            <div>Updated: {result.updatedCount}</div>
            <div>Duplicates: {result.duplicates}</div>
            <div>Total rows: {result.totalRows}</div>
            <div>Unique keys: {result.uniqueKeys}</div>
            <div>Duration: {formatDuration(result.durationMs)}</div>
          </div>
        </div>
      )}

      {lastImport && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Last import
          </div>
          <div className="mt-2 grid gap-1">
            <div>
              {lastImport.createdAt ? new Date(lastImport.createdAt).toLocaleString() : "--"} ·{" "}
              {lastImport.filename}
            </div>
            <div>
              Status:{" "}
              <span className={lastImport.status === "SUCCESS" ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
                {lastImport.status}
              </span>
            </div>
            <div>Created: {lastImport.createdCount}</div>
            <div>Updated: {lastImport.updatedCount}</div>
            <div>Duplicates: {lastImport.duplicates}</div>
            <div>Duration: {formatDuration(lastImport.durationMs)}</div>
            {lastImport.status === "FAILED" && lastImport.error && (
              <div className="text-rose-600 dark:text-rose-300">Error: {lastImport.error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
