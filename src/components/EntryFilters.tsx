"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EntryStatus, EntryType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";

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
    "w-full sm:w-auto";

  return (
    <div className={mobile ? "grid gap-3" : "hidden items-center gap-3 sm:flex"}>
      <Select
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
      </Select>
      <Select
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
      </Select>
      <Select
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
      </Select>
      <Button type="button" variant="secondary" onClick={onReset}>
        Reset
      </Button>
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
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            name="q"
            key={queryParam}
            defaultValue={queryParam}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search titles..."
            className="min-w-[220px] flex-1"
          />

          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsMobileOpen(true)}
            className="sm:hidden"
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>

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
      </Card>

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
              <Label>Filters</Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
              >
                Done
              </Button>
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
