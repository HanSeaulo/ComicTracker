import { NextResponse } from "next/server";

const ANILIST_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 10) {
    media(search: $search, type: MANGA) {
      id
      title { romaji english native }
      synonyms
      coverImage { large medium }
    }
  }
}
`;

type AniListBody = {
  query?: unknown;
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as AniListBody | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (query.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters." },
      { status: 400 },
    );
  }

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: ANILIST_QUERY,
      variables: { search: query },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return NextResponse.json(
      { error: `AniList request failed (${response.status}). ${text.slice(0, 200)}` },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as {
    data?: {
      Page?: {
        media?: AniListMedia[];
      };
    };
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors?.length) {
    return NextResponse.json(
      { error: payload.errors[0]?.message ?? "AniList returned an error." },
      { status: 502 },
    );
  }

  const media = payload.data?.Page?.media ?? [];
  const simplified = media.map((item) => {
    const romaji = item.title?.romaji ?? undefined;
    const english = item.title?.english ?? undefined;
    const native = item.title?.native ?? undefined;
    return {
      id: item.id,
      title: english || romaji || native || "Unknown title",
      romaji,
      english,
      native,
      synonyms: item.synonyms ?? [],
      imageLarge: item.coverImage?.large ?? undefined,
      imageMedium: item.coverImage?.medium ?? undefined,
    };
  });

  return NextResponse.json({ results: simplified });
}
