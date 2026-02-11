"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const ANILIST_QUERY = `
query ($search: String, $perPage: Int) {
  Page(page: 1, perPage: $perPage) {
    media(search: $search, type: MANGA) {
      id
      title {
        romaji
        english
        native
      }
      synonyms
      coverImage {
        large
        medium
      }
    }
  }
}
`;

type AutofillOptions = {
  limit?: number;
};

type AniListMedia = {
  id: number;
  title?: {
    romaji?: string | null;
    english?: string | null;
    native?: string | null;
  } | null;
  synonyms?: string[] | null;
  coverImage?: {
    large?: string | null;
    medium?: string | null;
  } | null;
};

export type CoverAutofillSummary = {
  updated: number;
  skipped: number;
  failed: number;
  durationSeconds: number;
  scanned: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueNormalized(values: string[]) {
  const out = new Set<string>();
  for (const value of values) {
    const normalized = normalizeTitle(value);
    if (!normalized) continue;
    out.add(normalized);
  }
  return out;
}

function getMediaNames(media: AniListMedia) {
  const names = [
    media.title?.english ?? "",
    media.title?.romaji ?? "",
    media.title?.native ?? "",
    ...(media.synonyms ?? []),
  ];
  return uniqueNormalized(names);
}

async function searchAniList(query: string) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: ANILIST_QUERY,
      variables: { search: query, perPage: 5 },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`AniList request failed (${response.status}): ${text.slice(0, 160)}`);
  }

  const payload = (await response.json()) as {
    data?: { Page?: { media?: AniListMedia[] | null } | null } | null;
  };

  return payload.data?.Page?.media ?? [];
}

export async function autofillMissingCoversSafe(
  options: AutofillOptions = {},
): Promise<CoverAutofillSummary> {
  await requireAuth();

  const started = Date.now();
  const limit = Math.max(1, Math.min(100, options.limit ?? 30));

  const entries = await db.entry.findMany({
    where: {
      OR: [{ coverImageUrl: null }, { coverImageUrl: "" }],
    },
    include: {
      altTitles: {
        select: { title: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: limit,
  });

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];

    try {
      const media = await searchAniList(entry.title);
      if (media.length === 0) {
        skipped += 1;
      } else {
        const candidates = uniqueNormalized([entry.title, ...entry.altTitles.map((a) => a.title)]);

        const matchedIndex = media.findIndex((item) => {
          const names = getMediaNames(item);
          if (names.size === 0) return false;
          for (const candidate of candidates) {
            if (names.has(candidate)) return true;
          }
          return false;
        });

        const matchAllowed = matchedIndex !== -1 && (matchedIndex === 0 || media.length === 1);
        if (!matchAllowed) {
          skipped += 1;
        } else {
          const matched = media[matchedIndex];
          const coverImageUrl = matched.coverImage?.large ?? matched.coverImage?.medium ?? null;

          if (!coverImageUrl) {
            skipped += 1;
          } else {
            const now = new Date();
            const sourceTitles = {
              romaji: matched.title?.romaji ?? null,
              english: matched.title?.english ?? null,
              native: matched.title?.native ?? null,
              synonyms: matched.synonyms ?? [],
              selectedAt: now.toISOString(),
            };

            await db.entry.update({
              where: { id: entry.id },
              data: {
                coverImageUrl,
                coverSource: "ANILIST",
                coverSourceId: matched.id,
                coverFetchedAt: now,
                sourceTitlesJson: JSON.stringify(sourceTitles),
                sourceTitlesAt: now,
              },
            });
            updated += 1;
          }
        }
      }
    } catch {
      failed += 1;
    }

    if (i < entries.length - 1) {
      await sleep(900);
    }
  }

  revalidatePath("/");

  return {
    updated,
    skipped,
    failed,
    scanned: entries.length,
    durationSeconds: Number(((Date.now() - started) / 1000).toFixed(1)),
  };
}
