"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

type SourceTitlesPayload = {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
  synonyms?: string[];
};

type CoverPayload = {
  coverImageUrl: string;
  coverSourceId: number;
  titles: SourceTitlesPayload;
};

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toKey(value: string) {
  return normalizeTitle(value).toLowerCase();
}

function ensureHttpUrl(value: string) {
  const parsed = new URL(value);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Cover URL must be http(s).");
  }
  return parsed.toString();
}

function extractSourceTitles(titles: SourceTitlesPayload) {
  return {
    romaji: titles.romaji?.trim() || null,
    english: titles.english?.trim() || null,
    native: titles.native?.trim() || null,
    synonyms: (titles.synonyms ?? []).map((value) => value.trim()).filter(Boolean),
    selectedAt: new Date().toISOString(),
  };
}

export async function setEntryCoverAndSourceTitles(entryId: string, payload: CoverPayload) {
  await requireAuth();

  const coverImageUrl = ensureHttpUrl(payload.coverImageUrl.trim());
  const source = extractSourceTitles(payload.titles);
  const now = new Date();

  await db.entry.update({
    where: { id: entryId },
    data: {
      coverImageUrl,
      coverSource: "ANILIST",
      coverSourceId: payload.coverSourceId,
      coverFetchedAt: now,
      sourceTitlesJson: JSON.stringify(source),
      sourceTitlesAt: now,
    },
  });

  revalidatePath("/");
  revalidatePath(`/entries/${entryId}`);
}

export async function applySourceTitlesToAltTitles(entryId: string, selectedTitles: string[]) {
  await requireAuth();

  const entry = await db.entry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      title: true,
      altTitles: { select: { titleLower: true } },
    },
  });
  if (!entry) {
    throw new Error("Entry not found.");
  }

  const entryKey = toKey(entry.title);
  const existingKeys = new Set(entry.altTitles.map((item) => item.titleLower));
  const unique = new Map<string, string>();

  for (const raw of selectedTitles) {
    const normalized = normalizeTitle(raw);
    if (!normalized) continue;
    const key = toKey(normalized);
    if (!key || key === entryKey || existingKeys.has(key)) continue;
    if (!unique.has(key)) {
      unique.set(key, normalized);
    }
  }

  const data = [...unique.entries()].map(([titleLower, title]) => ({
    entryId,
    title,
    titleLower,
  }));

  if (data.length > 0) {
    await db.altTitle.createMany({
      data,
      skipDuplicates: true,
    });
  }

  revalidatePath(`/entries/${entryId}`);
  revalidatePath("/");
  return { added: data.length };
}
