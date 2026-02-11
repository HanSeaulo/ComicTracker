"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { incrementChapters } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type ChapterButtonsProps = {
  entryId: string;
  currentChapters?: number | null;
};

const COALESCE_MS = 300;

export function ChapterButtons({ entryId, currentChapters }: ChapterButtonsProps) {
  const [isPending, setIsPending] = useState(false);
  const pendingDeltaRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const chaptersRef = useRef<number | null>(currentChapters ?? null);
  const { toast } = useToast();

  useEffect(() => {
    chaptersRef.current = currentChapters ?? null;
  }, [currentChapters]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const flush = async () => {
    if (inFlightRef.current) return;
    const delta = pendingDeltaRef.current;
    if (delta === 0) return;

    pendingDeltaRef.current = 0;
    inFlightRef.current = true;
    setIsPending(true);

    try {
      const result = await incrementChapters(entryId, delta);
      const from = result?.from ?? chaptersRef.current;
      const to = result?.to ?? from;

      if (typeof to === "number") {
        chaptersRef.current = to;
      }

      if (typeof from === "number" && typeof to === "number") {
        toast({
          title: "Chapters updated",
          description: from === to ? `Now: ${to}` : `${from} -> ${to}`,
          variant: "success",
        });
      } else {
        toast({
          title: "Chapters updated",
          variant: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update chapters",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      inFlightRef.current = false;
      setIsPending(false);
      if (pendingDeltaRef.current !== 0) {
        void flush();
      }
    }
  };

  const queueUpdate = (delta: number) => {
    pendingDeltaRef.current += delta;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void flush();
    }, COALESCE_MS);
  };

  const onDeltaClick = (event: MouseEvent<HTMLButtonElement>, delta: number) => {
    event.preventDefault();
    event.stopPropagation();
    queueUpdate(delta);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={(event) => onDeltaClick(event, -1)}
        disabled={isPending}
        className="min-w-11 px-3"
      >
        -1
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={(event) => onDeltaClick(event, 1)}
        disabled={isPending}
        className="min-w-11 px-3"
      >
        {isPending ? "..." : "+1"}
      </Button>
    </div>
  );
}
