"use client";

import { useRef } from "react";
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

export function EntryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const queryParam = searchParams.get("q") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const statusParam = searchParams.get("status") ?? "";
  const sortParam = searchParams.get("sort") ?? "title";

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

  return (
    <div className="flex flex-wrap gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <input
        name="q"
        key={queryParam}
        defaultValue={queryParam}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder="Search titles..."
        className="min-w-[220px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      <select
        name="type"
        value={typeParam}
        onChange={(event) => handleTypeChange(event.target.value)}
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
        onChange={(event) => handleStatusChange(event.target.value)}
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
        onChange={(event) => handleSortChange(event.target.value)}
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="title">Sort: Title (A–Z)</option>
        <option value="updated">Sort: Last Updated</option>
        <option value="chapters">Sort: Chapters Read</option>
        <option value="progress">Sort: Progress %</option>
        <option value="created">Sort: Date Created</option>
      </select>
    </div>
  );
}
