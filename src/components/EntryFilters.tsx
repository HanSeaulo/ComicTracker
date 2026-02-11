"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EntryStatus, EntryType } from "@prisma/client";

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

function updateParam(params: URLSearchParams, key: string, value: string | null) {
  if (!value) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}

function buildNextUrl(params: URLSearchParams) {
  const next = params.toString();
  return next ? `/?${next}` : "/";
}

type FilterControlsProps = {
  typeParam: string;
  statusParam: string;
  sortParam: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onReset: () => void;
  mobile?: boolean;
};

function FilterControls({
  typeParam,
  statusParam,
  sortParam,
  onTypeChange,
  onStatusChange,
  onSortChange,
  onReset,
  mobile = false,
}: FilterControlsProps) {
  const fieldClass =
    "h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

  return (
    <div className={mobile ? "grid gap-3" : "hidden items-center gap-3 sm:flex"}>
      <select
        name="type"
        value={typeParam}
        onChange={(event) => onTypeChange(event.target.value)}
        className={fieldClass}
      >
        <option value="">All types</option>
        {Object.values(EntryType).map((value) => (
          <option key={value} value={value}>
            {typeLabels[value]}
          </option>
        ))}
      </select>
      <select
        name="status"
        value={statusParam}
        onChange={(event) => onStatusChange(event.target.value)}
        className={fieldClass}
      >
        <option value="">All status</option>
        {Object.values(EntryStatus).map((value) => (
          <option key={value} value={value}>
            {statusLabels[value]}
          </option>
        ))}
      </select>
      <select
        name="sort"
        value={sortParam}
        onChange={(event) => onSortChange(event.target.value)}
        className={fieldClass}
      >
        <option value="title">Sort: Title (A-Z)</option>
        <option value="updated">Sort: Last Updated</option>
        <option value="chapters">Sort: Chapters Read</option>
        <option value="progress">Sort: Progress %</option>
        <option value="created">Sort: Date Created</option>
      </select>
      <button
        type="button"
        onClick={onReset}
        className="h-11 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-600"
      >
        Reset
      </button>
    </div>
  );
}

export function EntryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const queryParam = searchParams.get("q") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const statusParam = searchParams.get("status") ?? "";
  const sortParam = searchParams.get("sort") ?? "title";
  const activeCount =
    (queryParam ? 1 : 0) + (typeParam ? 1 : 0) + (statusParam ? 1 : 0) + (sortParam !== "title" ? 1 : 0);

  function handleQueryChange(value: string) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      updateParam(params, "q", value.trim() ? value.trim() : null);
      router.replace(buildNextUrl(params));
    }, 300);
  }

  function handleTypeChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    updateParam(params, "type", value || null);
    router.replace(buildNextUrl(params));
  }

  function handleStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    updateParam(params, "status", value || null);
    router.replace(buildNextUrl(params));
  }

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    updateParam(params, "sort", value || null);
    router.replace(buildNextUrl(params));
  }

  function handleReset() {
    router.replace("/");
  }

  return (
    <>
      <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            name="q"
            key={queryParam}
            defaultValue={queryParam}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search titles..."
            className="h-11 min-w-[220px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="h-11 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-slate-300 sm:hidden dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-600"
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>

          <FilterControls
            typeParam={typeParam}
            statusParam={statusParam}
            sortParam={sortParam}
            onTypeChange={handleTypeChange}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
            onReset={handleReset}
          />
        </div>
      </div>

      {isMobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100"
              >
                Done
              </button>
            </div>

            <FilterControls
              mobile
              typeParam={typeParam}
              statusParam={statusParam}
              sortParam={sortParam}
              onTypeChange={handleTypeChange}
              onStatusChange={handleStatusChange}
              onSortChange={handleSortChange}
              onReset={() => {
                handleReset();
                setIsMobileOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
