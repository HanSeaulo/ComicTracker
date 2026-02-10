"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { EntryStatus, EntryType, ImportStatus, ActivityAction, Prisma } from "@prisma/client";
import { parseImportedTitle, PAREN_KEEP_KEYWORDS } from "@/lib/titleParsing";

type ParsedEntry = {
  title: string;
  titleLower: string;
  baseTitle: string;
  baseTitleLower: string;
  descriptor: string | null;
  descriptorLower: string;
  altTitles: string[];
  type: EntryType;
  status: EntryStatus | null;
  chaptersRead: number | null;
  totalChapters: number | null;
  score: number | null;
  startDate: Date | null;
  endDate: Date | null;
};

const ACTIVITY_LOG_LIMIT = 1000;

const unknownTokens = new Set(["", "?", "n/a", "na", "unknown", "-"]);

type ActivityChanges = Prisma.JsonObject;

function normalizeDateValue(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

async function trimActivityLogs(tx: Prisma.TransactionClient) {
  const overflow = await tx.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: ACTIVITY_LOG_LIMIT,
    select: { id: true },
  });
  if (overflow.length === 0) return;
  await tx.activityLog.deleteMany({
    where: { id: { in: overflow.map((row) => row.id) } },
  });
}

async function createActivityLog(
  tx: Prisma.TransactionClient,
  data: Prisma.ActivityLogCreateInput,
) {
  await tx.activityLog.create({ data });
  await trimActivityLogs(tx);
}

function buildChange<T>(from: T, to: T) {
  return from === to ? null : { from, to };
}

function getAltTitleSet(titles: { title: string }[]) {
  return titles.map((title) => title.title.toLowerCase().trim()).filter(Boolean).sort();
}

function normalizeString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (unknownTokens.has(str.toLowerCase())) return null;
  return str;
}

function parseIntOrNull(value: unknown): number | null {
  const str = normalizeString(value);
  if (str === null) return null;
  const parsed = Number(str);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

function parseScore(value: unknown): number | null {
  const str = normalizeString(value);
  if (str === null) return null;

  const ratioMatch = str.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
  let score = Number.NaN;
  if (ratioMatch) {
    const numerator = Number(ratioMatch[1]);
    const denominator = Number(ratioMatch[2]);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0) {
      score = (numerator / denominator) * 10;
    }
  } else {
    score = Number(str);
  }

  if (!Number.isFinite(score)) return null;
  score = Math.max(0, Math.min(10, score));
  return Number(score.toFixed(2));
}

function parseStatus(value: unknown): EntryStatus | null {
  const str = normalizeString(value);
  if (str === null) return null;
  const upper = str.toUpperCase();
  if (upper === "CR" || upper === "CURRENT") return EntryStatus.CURRENT;
  if (upper === "COM" || upper === "COMPLETED") return EntryStatus.COMPLETED;
  return null;
}

function parseEntryType(value: unknown): EntryType | null {
  const str = normalizeString(value);
  if (str === null) return null;
  const upper = str.toUpperCase();
  if (upper === "MANHWA") return EntryType.MANHWA;
  if (upper === "MANHUA") return EntryType.MANHUA;
  if (upper === "LIGHTNOVEL" || upper === "LIGHT_NOVEL" || upper === "LIGHT NOVEL")
    return EntryType.LIGHT_NOVEL;
  if (upper === "WESTERN") return EntryType.WESTERN;
  return null;
}

function parseDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const str = normalizeString(value);
  if (str === null) return null;
  const parsed = new Date(str);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function parseExcelDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const lowered = trimmed.toLowerCase();
    if (lowered === "?" || lowered === "??" || lowered === "????") return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      0,
      0,
      0,
      0,
    );
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const base = Date.UTC(1899, 11, 30);
    return new Date(base + value * 86400000);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const isoMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]);
      const day = Number(isoMatch[3]);
      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const parts = trimmed.split(/[/-]/);
    if (parts.length === 3) {
      const first = Number(parts[0]);
      const second = Number(parts[1]);
      let year = Number(parts[2]);
      if (!Number.isFinite(first) || !Number.isFinite(second) || !Number.isFinite(year)) return null;

      let day: number;
      let month: number;
      if (first > 12) {
        day = first;
        month = second;
      } else if (second > 12) {
        day = second;
        month = first;
      } else {
        day = first;
        month = second;
      }

      if (year < 100) {
        year = year <= 69 ? 2000 + year : 1900 + year;
      }

      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  return null;
}

function normalizeTitleValue(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function parseTitleParts(rawTitle: string) {
  const normalized = normalizeTitleValue(rawTitle);
  return {
    title: normalized,
    baseTitle: normalized,
    descriptor: null as string | null,
    altTitles: [] as string[],
  };
}

function parseEntryFromForm(formData: FormData): ParsedEntry {
  const rawTitle = normalizeString(formData.get("title"));
  if (!rawTitle) {
    throw new Error("Title is required.");
  }
  const { title, baseTitle, descriptor, altTitles } = parseTitleParts(rawTitle);
  const titleLower = title.toLowerCase().trim();
  const baseTitleLower = baseTitle.toLowerCase().trim();

  const type = parseEntryType(formData.get("type"));
  if (!type) {
    throw new Error("Type is required.");
  }

  return {
    title,
    titleLower,
    baseTitle,
    baseTitleLower,
    descriptor,
    descriptorLower: descriptor ? descriptor.toLowerCase().trim() : "",
    altTitles,
    type,
    status: parseStatus(formData.get("status")),
    chaptersRead: parseIntOrNull(formData.get("chaptersRead")),
    totalChapters: parseIntOrNull(formData.get("totalChapters")),
    score: parseScore(formData.get("score")),
    startDate: parseDate(formData.get("startDate")),
    endDate: parseDate(formData.get("endDate")),
  };
}

export async function createEntry(formData: FormData) {
  const data = parseEntryFromForm(formData);
  const { altTitles, ...entryData } = data;
  const entry = await db.$transaction(async (tx) => {
    const created = await tx.entry.create({
      data: {
        ...entryData,
        altTitles: altTitles.length
          ? {
              createMany: {
                data: altTitles.map((title) => ({
                  title,
                  titleLower: title.toLowerCase().trim(),
                })),
              },
            }
          : undefined,
      },
    });

    await createActivityLog(tx, {
      action: ActivityAction.ENTRY_CREATED,
      entry: { connect: { id: created.id } },
      changes: {
        title: { to: created.title },
        type: { to: created.type },
      } as ActivityChanges,
      message: `Created ${created.title}`,
      source: "create",
    });

    return created;
  });
  revalidatePath("/");
  redirect(`/entries/${entry.id}`);
}

export async function updateEntry(id: string, formData: FormData) {
  const data = parseEntryFromForm(formData);
  const { altTitles, ...entryData } = data;
  const altTitlesProvided = altTitles.length > 0;
  const existing = await db.entry.findUnique({
    where: { id },
    include: { altTitles: true },
  });
  if (!existing) {
    throw new Error("Entry not found.");
  }

  await db.$transaction(async (tx) => {
    await tx.entry.update({
      where: { id },
      data: entryData,
    });

    if (altTitlesProvided) {
      await tx.altTitle.deleteMany({ where: { entryId: id } });
      if (altTitles.length) {
        await tx.altTitle.createMany({
          data: altTitles.map((title) => ({
            entryId: id,
            title,
            titleLower: title.toLowerCase().trim(),
          })),
        });
      }
    }

    const changes: ActivityChanges = {};
    const titleChange = buildChange(existing.title, entryData.title);
    if (titleChange) changes.title = titleChange;
    const typeChange = buildChange(existing.type, entryData.type);
    if (typeChange) changes.type = typeChange;
    const statusChange = buildChange(existing.status, entryData.status);
    if (statusChange) changes.status = statusChange;
    const chaptersChange = buildChange(existing.chaptersRead, entryData.chaptersRead);
    if (chaptersChange) changes.chaptersRead = chaptersChange;
    const totalChaptersChange = buildChange(existing.totalChapters, entryData.totalChapters);
    if (totalChaptersChange) changes.totalChapters = totalChaptersChange;
    const scoreChange = buildChange(existing.score, entryData.score);
    if (scoreChange) changes.score = scoreChange;
    const startDateChange = buildChange(
      normalizeDateValue(existing.startDate),
      normalizeDateValue(entryData.startDate),
    );
    if (startDateChange) changes.startDate = startDateChange;
    const endDateChange = buildChange(
      normalizeDateValue(existing.endDate),
      normalizeDateValue(entryData.endDate),
    );
    if (endDateChange) changes.endDate = endDateChange;

    if (altTitlesProvided) {
      const previousAltTitles = getAltTitleSet(existing.altTitles);
      const nextAltTitles = altTitles
        .map((title) => title.toLowerCase().trim())
        .filter(Boolean)
        .sort();
      if (previousAltTitles.join("|") !== nextAltTitles.join("|")) {
        changes.altTitles = { from: previousAltTitles, to: nextAltTitles };
      }
    }

    if (Object.keys(changes).length > 0) {
      await createActivityLog(tx, {
        action: ActivityAction.ENTRY_UPDATED,
        entry: { connect: { id } },
        changes,
        message: `Updated ${existing.title}`,
        source: "edit",
      });
    }
  });
  revalidatePath("/");
  redirect(`/entries/${id}`);
}

export async function deleteEntry(id: string) {
  await db.$transaction(async (tx) => {
    const existing = await tx.entry.findUnique({
      where: { id },
      select: { id: true, title: true, type: true },
    });
    if (!existing) {
      throw new Error("Entry not found.");
    }

    await createActivityLog(tx, {
      action: ActivityAction.ENTRY_DELETED,
      entry: { connect: { id: existing.id } },
      changes: {
        title: existing.title,
        type: existing.type,
      } as ActivityChanges,
      message: `Deleted ${existing.title}`,
      source: "delete",
    });

    await tx.entry.delete({ where: { id } });
  });
  revalidatePath("/");
  redirect("/");
}

export async function addAltTitle(entryId: string, formData: FormData) {
  const rawTitle = normalizeString(formData.get("altTitle"));
  if (!rawTitle) {
    throw new Error("Alternate title is required.");
  }
  const title = normalizeTitleValue(rawTitle);
  const titleLower = title.toLowerCase().trim();

  await db.$transaction(async (tx) => {
    const existing = await tx.altTitle.findUnique({
      where: { entryId_titleLower: { entryId, titleLower } },
      select: { id: true },
    });
    if (existing) return;

    await tx.altTitle.create({
      data: {
        entryId,
        title,
        titleLower,
      },
    });

    await createActivityLog(tx, {
      action: ActivityAction.ENTRY_UPDATED,
      entry: { connect: { id: entryId } },
      changes: {
        altTitles: { added: [title] },
      } as ActivityChanges,
      message: `Added alternate title "${title}"`,
      source: "alt-title",
    });
  });

  revalidatePath(`/entries/${entryId}`);
  redirect(`/entries/${entryId}`);
}

export async function removeAltTitle(entryId: string, altTitleId: string) {
  await db.$transaction(async (tx) => {
    const existing = await tx.altTitle.findUnique({
      where: { id: altTitleId },
      select: { title: true, entryId: true },
    });
    if (!existing) return;

    await createActivityLog(tx, {
      action: ActivityAction.ENTRY_UPDATED,
      entry: { connect: { id: entryId } },
      changes: {
        altTitles: { removed: [existing.title] },
      } as ActivityChanges,
      message: `Removed alternate title "${existing.title}"`,
      source: "alt-title",
    });

    await tx.altTitle.delete({
      where: { id: altTitleId },
    });
  });
  revalidatePath(`/entries/${entryId}`);
  redirect(`/entries/${entryId}`);
}

export async function incrementChapters(entryId: string, delta: number) {
  await db.$transaction(async (tx) => {
    const current = await tx.entry.findUnique({
      where: { id: entryId },
      select: { chaptersRead: true, title: true },
    });
    if (!current) return;
    const currentValue = current.chaptersRead ?? 0;
    const next = Math.max(0, currentValue + delta);
    if (next === currentValue) return;

    await tx.entry.update({
      where: { id: entryId },
      data: { chaptersRead: next },
    });

    await createActivityLog(tx, {
      action: ActivityAction.ENTRY_UPDATED,
      entry: { connect: { id: entryId } },
      changes: {
        chaptersRead: { from: currentValue, to: next },
      } as ActivityChanges,
      message: `Updated chapters for ${current.title}`,
      source: "chapters",
    });
  });
  revalidatePath("/");
  revalidatePath(`/entries/${entryId}`);
}

function normalizeRowType(sheetName: string): EntryType | null {
  const type = parseEntryType(sheetName);
  if (!type) return null;
  return type;
}

export type ImportResult = {
  status: "SUCCESS" | "FAILED";
  filename: string;
  totalRows: number;
  uniqueKeys: number;
  duplicates: number;
  createdCount: number;
  updatedCount: number;
  durationMs: number;
  error?: string | null;
};

export async function importEntries(formData: FormData): Promise<ImportResult> {
  const startedAt = Date.now();
  const file = formData.get("file");
  const filename = file instanceof File ? file.name : "unknown";

  try {
    if (!(file instanceof File)) {
      throw new Error("No file uploaded.");
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      throw new Error("Please upload an .xlsx file.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;
    const updateLogs: string[] = [];
    const debug = process.env.IMPORT_DEBUG === "1";
    const rowsByKey = new Map<string, { rowNumber: number; entry: ParsedEntry }[]>();

    for (const sheetName of workbook.SheetNames) {
      const entryType = normalizeRowType(sheetName);
      if (!entryType) continue;
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: null,
        raw: true,
      });

      for (const [index, row] of rows.entries()) {
        const rawTitle = normalizeString(row["Title"]);
        if (!rawTitle) {
          skippedCount += 1;
          continue;
        }
        const { mainTitle, altTitles } = parseImportedTitle(rawTitle, PAREN_KEEP_KEYWORDS);
        const title = normalizeTitleValue(mainTitle);
        const titleLower = title.toLowerCase().trim();
        const baseTitle = title;
        const baseTitleLower = titleLower;
        const descriptor = null;

        const data: ParsedEntry = {
          title,
          titleLower,
          baseTitle,
          baseTitleLower,
          descriptor,
          descriptorLower: "",
          altTitles,
          type: entryType,
          status: parseStatus(row["Status (CR/COM)"] ?? row["Status"]),
          chaptersRead: parseIntOrNull(row["Chapters Read"]),
          totalChapters: parseIntOrNull(row["Total Chapters"]),
          score: parseScore(row["Score"]),
          startDate: parseExcelDate(row["Start Date"]),
          endDate: parseExcelDate(row["End Date"]),
        };

        const uniqueKey = `${data.type}::${data.titleLower}`;
        const rowNumber = index + 2;
        const group = rowsByKey.get(uniqueKey) ?? [];
        group.push({ rowNumber, entry: data });
        rowsByKey.set(uniqueKey, group);
      }
    }

    duplicateCount = Math.max(
      0,
      [...rowsByKey.values()].reduce((sum, group) => sum + (group.length - 1), 0),
    );

    const mergeAltTitles = (groups: { rowNumber: number; entry: ParsedEntry }[]) => {
      const titles = new Map<string, string>();
      for (const row of groups) {
        for (const alt of row.entry.altTitles) {
          const key = alt.toLowerCase().trim();
          if (!key) continue;
          if (!titles.has(key)) {
            titles.set(key, alt.trim());
          }
        }
      }
      return [...titles.values()];
    };

    const mergeStatus = (groups: { rowNumber: number; entry: ParsedEntry }[]) => {
      const hasCompleted = groups.some((row) => row.entry.status === EntryStatus.COMPLETED);
      if (hasCompleted) return EntryStatus.COMPLETED;
      const hasCurrent = groups.some((row) => row.entry.status === EntryStatus.CURRENT);
      if (hasCurrent) return EntryStatus.CURRENT;
      return null;
    };

    const mergeDates = (groups: { rowNumber: number; entry: ParsedEntry }[]) => {
      const startDates = groups.map((row) => row.entry.startDate).filter(Boolean) as Date[];
      const endDates = groups.map((row) => row.entry.endDate).filter(Boolean) as Date[];
      const earliestStart = startDates.length
        ? new Date(Math.min(...startDates.map((date) => date.getTime())))
        : null;
      const latestEnd = endDates.length
        ? new Date(Math.max(...endDates.map((date) => date.getTime())))
        : null;
      return { earliestStart, latestEnd };
    };

    const mergeGroup = (groups: { rowNumber: number; entry: ParsedEntry }[]) => {
      const first = groups[0].entry;
      const chaptersRead = Math.max(...groups.map((row) => row.entry.chaptersRead ?? 0), 0);
      const totalChaptersValues = groups
        .map((row) => row.entry.totalChapters)
        .filter((value) => value !== null) as number[];
      const totalChapters = totalChaptersValues.length ? Math.max(...totalChaptersValues) : null;
      const scoreValues = groups.map((row) => row.entry.score).filter((value) => value !== null) as number[];
      const score = scoreValues.length ? Math.max(...scoreValues) : null;
      const status = mergeStatus(groups);
      const { earliestStart, latestEnd } = mergeDates(groups);
      const altTitles = mergeAltTitles(groups);
      return {
        ...first,
        chaptersRead: chaptersRead || null,
        totalChapters,
        score,
        status,
        startDate: earliestStart,
        endDate: status === EntryStatus.COMPLETED ? latestEnd : first.endDate ?? latestEnd,
        altTitles,
      };
    };

    if (debug) {
      console.log("Import dedupe groups:");
      for (const [key, group] of rowsByKey.entries()) {
        if (group.length > 1) {
          console.log(
            `key=${key} rows=[${group.map((row) => row.rowNumber).join(", ")}] mergedFrom=${group.length}`,
          );
        }
      }
    }

    for (const [key, group] of rowsByKey.entries()) {
      const data = mergeGroup(group);

      const existing = await db.entry.findUnique({
        where: { title_type: { title: data.title, type: data.type } },
        select: {
          id: true,
          title: true,
          titleLower: true,
          baseTitle: true,
          baseTitleLower: true,
          descriptor: true,
          descriptorLower: true,
          status: true,
          chaptersRead: true,
          totalChapters: true,
          score: true,
          startDate: true,
          endDate: true,
          altTitles: { select: { titleLower: true } },
        },
      });

      const { altTitles: altTitlesData, ...entryData } = data;
      const upserted = await db.entry.upsert({
        where: { title_type: { title: entryData.title, type: entryData.type } },
        create: entryData,
        update: entryData,
        select: { id: true },
      });

      const altTitleOps = [db.altTitle.deleteMany({ where: { entryId: upserted.id } })];
      if (altTitlesData.length) {
        altTitleOps.push(
          db.altTitle.createMany({
            data: altTitlesData.map((title) => ({
              entryId: upserted.id,
              title,
              titleLower: title.toLowerCase().trim(),
            })),
          }),
        );
      }
      await db.$transaction(altTitleOps);

      if (existing) {
        const changedFields: string[] = [];
        const compare = <T>(label: string, oldValue: T, newValue: T) => {
          if (oldValue !== newValue) changedFields.push(label);
        };
        compare("title", existing.title, entryData.title);
        compare("titleLower", existing.titleLower, entryData.titleLower);
        compare("baseTitle", existing.baseTitle, entryData.baseTitle);
        compare("baseTitleLower", existing.baseTitleLower, entryData.baseTitleLower);
        compare("descriptor", existing.descriptor, entryData.descriptor);
        compare("descriptorLower", existing.descriptorLower, entryData.descriptorLower);
        compare("status", existing.status, entryData.status);
        compare("chaptersRead", existing.chaptersRead, entryData.chaptersRead);
        compare("totalChapters", existing.totalChapters, entryData.totalChapters);
        compare("score", existing.score, entryData.score);
        compare(
          "startDate",
          existing.startDate?.toISOString() ?? null,
          entryData.startDate?.toISOString() ?? null,
        );
        compare(
          "endDate",
          existing.endDate?.toISOString() ?? null,
          entryData.endDate?.toISOString() ?? null,
        );
        const existingAltTitles = new Set(existing.altTitles.map((alt) => alt.titleLower));
        const incomingAltTitles = new Set(altTitlesData.map((title) => title.toLowerCase().trim()));
        const altTitlesChanged =
          existingAltTitles.size !== incomingAltTitles.size ||
          [...incomingAltTitles].some((value) => !existingAltTitles.has(value));
        if (altTitlesChanged) changedFields.push("altTitles");

        updateLogs.push(
          `UPDATE match=title_type key="${key}" id=${existing.id} changed=[${changedFields.join(", ") || "none"}]`,
        );
        updatedCount += 1;
      } else {
        createdCount += 1;
      }
    }

    if (updateLogs.length > 0) {
      console.log("Import update details:");
      updateLogs.forEach((line) => console.log(line));
    }
    if (duplicateCount > 0) {
      console.log(`Import duplicate titles detected: ${duplicateCount}`);
    }

    const totalRows = [...rowsByKey.values()].reduce((sum, group) => sum + group.length, 0);
    const uniqueKeys = rowsByKey.size;
    const durationMs = Date.now() - startedAt;

    await db.$transaction(async (tx) => {
      const importRun = await tx.importRun.create({
        data: {
          filename,
          totalRows,
          uniqueKeys,
          duplicates: duplicateCount,
          createdCount,
          updatedCount,
          durationMs,
          status: ImportStatus.SUCCESS,
        },
      });

      await createActivityLog(tx, {
        action: ActivityAction.IMPORT_RUN,
        changes: {
          importRunId: importRun.id,
          status: "SUCCESS",
          filename,
          totalRows,
          uniqueKeys,
          duplicates: duplicateCount,
          createdCount,
          updatedCount,
          durationMs,
        } as ActivityChanges,
        message: `Import completed: ${createdCount} created, ${updatedCount} updated, ${duplicateCount} duplicates.`,
        source: "import",
      });
    });

    revalidatePath("/");
    revalidatePath("/import");
    revalidatePath("/imports");

    return {
      status: "SUCCESS",
      filename,
      totalRows,
      uniqueKeys,
      duplicates: duplicateCount,
      createdCount,
      updatedCount,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "Import failed.";
    const truncated = message.length > 400 ? `${message.slice(0, 400)}...` : message;

    await db.$transaction(async (tx) => {
      const importRun = await tx.importRun.create({
        data: {
          filename,
          totalRows: 0,
          uniqueKeys: 0,
          duplicates: 0,
          createdCount: 0,
          updatedCount: 0,
          durationMs,
          status: ImportStatus.FAILED,
          error: truncated,
        },
      });

      await createActivityLog(tx, {
        action: ActivityAction.IMPORT_RUN,
        changes: {
          importRunId: importRun.id,
          status: "FAILED",
          filename,
          durationMs,
          error: truncated,
        } as ActivityChanges,
        message: `Import failed: ${truncated}`,
        source: "import",
      });
    });

    revalidatePath("/import");
    revalidatePath("/imports");

    return {
      status: "FAILED",
      filename,
      totalRows: 0,
      uniqueKeys: 0,
      duplicates: 0,
      createdCount: 0,
      updatedCount: 0,
      durationMs,
      error: truncated,
    };
  }
}
