"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
import { applySourceTitlesToAltTitles } from "@/app/entries/[id]/coverActions";

type EntrySourceTitlesSectionProps = {
  entryId: string;
  sourceTitlesJson: string | null;
};

type SourceTitles = {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
  synonyms?: string[];
};

function parseSourceTitles(value: string | null): SourceTitles | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as SourceTitles;
  } catch {
    return null;
  }
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function EntrySourceTitlesSection({
  entryId,
  sourceTitlesJson,
}: EntrySourceTitlesSectionProps) {
  const [showAllSynonyms, setShowAllSynonyms] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();
  const sourceTitles = parseSourceTitles(sourceTitlesJson);

  const chips = useMemo(() => {
    if (!sourceTitles) return [];
    const list = [
      sourceTitles.english,
      sourceTitles.romaji,
      sourceTitles.native,
      ...(sourceTitles.synonyms ?? []),
    ]
      .filter((value): value is string => Boolean(value && value.trim()))
      .map(normalize);

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const item of list) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }
    return unique;
  }, [sourceTitles]);

  if (chips.length === 0) return null;

  const visibleChips = showAllSynonyms ? chips : chips.slice(0, 10);

  const addAllSourceTitles = async () => {
    setIsApplying(true);
    try {
      const response = await applySourceTitlesToAltTitles(entryId, chips);
      toast({
        title: "Alternate titles updated",
        description: `Added ${response.added} alternate titles.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed to add alternate titles",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="mt-6 p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Label>Also known as (AniList)</Label>
        <Button variant="secondary" size="sm" onClick={addAllSourceTitles} loading={isApplying}>
          Add all to my alternate titles
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleChips.map((title) => (
          <span
            key={title}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {title}
          </span>
        ))}
      </div>

      {chips.length > 10 ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setShowAllSynonyms((value) => !value)}
        >
          {showAllSynonyms ? "Show less" : `Show more (${chips.length - 10})`}
        </Button>
      ) : null}
    </Card>
  );
}
