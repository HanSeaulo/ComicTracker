"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

export type CoverSearchResult = {
  id: number;
  title: string;
  romaji?: string;
  english?: string;
  native?: string;
  synonyms: string[];
  imageLarge?: string;
  imageMedium?: string;
};

type CoverSearchModalProps = {
  open: boolean;
  onClose: () => void;
  initialQuery: string;
  onSelect: (result: CoverSearchResult) => Promise<void>;
};

export function CoverSearchModal({
  open,
  onClose,
  initialQuery,
  onSelect,
}: CoverSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CoverSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setResults([]);
      setError(null);
      setSelectingId(null);
    }
  }, [open, initialQuery]);

  if (!open) return null;

  const search = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/anilist/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { results?: CoverSearchResult[]; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Search failed.");
      }

      setResults(payload?.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="mx-auto mt-8 w-full max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Card className="max-h-[80vh] overflow-auto p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <Label>Find cover</Label>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search AniList title"
            />
            <Button variant="primary" onClick={search} loading={isLoading}>
              Search
            </Button>
          </div>

          {error ? (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="grid grid-cols-[72px_1fr_auto] gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                {result.imageMedium ? (
                  <img
                    src={result.imageMedium}
                    alt={result.title}
                    className="h-20 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-20 w-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {result.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {result.romaji || result.english || result.native || "No alternate title data"}
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={selectingId === result.id}
                    onClick={async () => {
                      setSelectingId(result.id);
                      try {
                        await onSelect(result);
                        onClose();
                      } finally {
                        setSelectingId(null);
                      }
                    }}
                  >
                    Use this cover
                  </Button>
                </div>
              </div>
            ))}
            {!isLoading && results.length === 0 ? (
              <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Search for a title to see results.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
