import * as XLSX from "xlsx";
import { NextResponse } from "next/server";
import { EntryType } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const SHEET_NAME = "ComicTracker Export";
const HEADERS = [
  "Type",
  "Title",
  "Status",
  "Chapters Read",
  "Total Chapters",
  "Score",
  "Start Date",
  "End Date",
  "Alt Titles",
  "Cover Image URL",
  "Cover Source",
  "Cover Source ID",
  "Source Titles JSON",
  "Updated At",
] as const;

function parseBooleanFlag(value: string | null, defaultValue = true) {
  if (value === null) return defaultValue;
  return value === "1" || value.toLowerCase() === "true";
}

function parseTypeFilter(value: string | null) {
  if (!value || value === "ALL") return undefined;
  if (Object.values(EntryType).includes(value as EntryType)) {
    return value as EntryType;
  }
  return undefined;
}

function isHttpUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function formatDate(value: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    await requireAuth();
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const type = parseTypeFilter(url.searchParams.get("type"));
  const includeAltTitles = parseBooleanFlag(url.searchParams.get("includeAltTitles"), true);
  const includeCovers = parseBooleanFlag(url.searchParams.get("includeCovers"), true);

  const entries = await db.entry.findMany({
    where: {
      type,
    },
    include: {
      altTitles: {
        orderBy: { title: "asc" },
      },
    },
    orderBy: [{ type: "asc" }, { title: "asc" }],
  });

  const rows: (string | number)[][] = [];
  rows.push(["ComicTracker Export"]);
  rows.push(["Version", "2"]);
  rows.push([]);
  rows.push([...HEADERS]);

  for (const entry of entries) {
    const altTitles = includeAltTitles
      ? entry.altTitles.map((alt) => alt.title).filter(Boolean).join(" | ")
      : "";
    const coverImageUrl = includeCovers && isHttpUrl(entry.coverImageUrl) ? entry.coverImageUrl ?? "" : "";
    const coverSource = includeCovers && entry.coverSource ? entry.coverSource : "";
    const coverSourceId = includeCovers && typeof entry.coverSourceId === "number" ? entry.coverSourceId : "";
    const sourceTitlesJson = includeCovers ? entry.sourceTitlesJson ?? "" : "";

    rows.push([
      entry.type,
      entry.title,
      entry.status ?? "",
      typeof entry.chaptersRead === "number" ? entry.chaptersRead : "",
      typeof entry.totalChapters === "number" ? entry.totalChapters : "",
      typeof entry.score === "number" ? entry.score : "",
      formatDate(entry.startDate),
      formatDate(entry.endDate),
      altTitles,
      coverImageUrl,
      coverSource,
      coverSourceId,
      sourceTitlesJson,
      entry.updatedAt.toISOString(),
    ]);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, SHEET_NAME);
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="comictracker-export-v2.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
