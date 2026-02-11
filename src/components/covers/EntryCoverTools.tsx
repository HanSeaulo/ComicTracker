"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
import {
  applySourceTitlesToAltTitles,
  setEntryCoverAndSourceTitles,
} from "@/app/entries/[id]/coverActions";
import { CoverSearchModal, type CoverSearchResult } from "@/components/covers/CoverSearchModal";

type EntryCoverToolsProps = {
  entryId: string;
  entryTitle: string;
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

export function EntryCoverTools({ entryId, entryTitle, sourceTitlesJson }: EntryCoverToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const visibleChips = showAllSynonyms ? chips : chips.slice(0, 10);

  const onSelectCover = async (result: CoverSearchResult) => {
    const coverImageUrl = result.imageLarge || result.imageMedium;
    if (!coverImageUrl) {
      throw new Error("Selected AniList result has no cover image.");
    }
    await setEntryCoverAndSourceTitles(entryId, {
      coverImageUrl,
      coverSourceId: result.id,
      titles: {
        romaji: result.romaji ?? null,
        english: result.english ?? null,
        native: result.native ?? null,
        synonyms: result.synonyms ?? [],
      },
    });
    toast({ title: "Cover saved", variant: "success" });
  };

  const addAllSourceTitles = async () => {
    if (chips.length === 0) return;
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
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Find cover
      </Button>

      <CoverSearchModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        initialQuery={entryTitle}
        onSelect={onSelectCover}
      />

      {chips.length > 0 ? (
        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
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
        </div>
      ) : null}
    </>
  );
}
