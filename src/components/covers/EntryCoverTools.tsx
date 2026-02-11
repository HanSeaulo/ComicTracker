"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  clearEntryCoverAndSourceTitles,
  setEntryCoverAndSourceTitles,
} from "@/app/entries/[id]/coverActions";
import { CoverSearchModal, type CoverSearchResult } from "@/components/covers/CoverSearchModal";

type EntryCoverToolsProps = {
  entryId: string;
  entryTitle: string;
  hasCover: boolean;
};

export function EntryCoverTools({ entryId, entryTitle, hasCover }: EntryCoverToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

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

  const onClearCover = async () => {
    setIsClearing(true);
    try {
      await clearEntryCoverAndSourceTitles(entryId);
      toast({ title: "Cover cleared", variant: "success" });
    } catch (err) {
      toast({
        title: "Failed to clear cover",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)}>
        {hasCover ? "Change cover" : "Find cover"}
      </Button>
      {hasCover ? (
        <Button
          variant="ghost"
          className="text-rose-700 hover:text-rose-800 dark:text-rose-300 dark:hover:text-rose-200"
          onClick={onClearCover}
          loading={isClearing}
        >
          Remove cover
        </Button>
      ) : null}

      <CoverSearchModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        initialQuery={entryTitle}
        onSelect={onSelectCover}
      />
    </>
  );
}
