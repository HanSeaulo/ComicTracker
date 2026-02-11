import { db } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";
import { ActivityAction, Prisma } from "@prisma/client";

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "--";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.join(", ");
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

function renderChanges(changes: Prisma.JsonValue | null) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) return null;
  const entries = Object.entries(changes as Record<string, unknown>);
  if (entries.length === 0) return null;

  return (
    <div className="mt-2 grid gap-1 text-xs text-slate-500 dark:text-slate-400">
      {entries.map(([key, value]) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          const valueObj = value as Record<string, unknown>;
          if ("from" in valueObj || "to" in valueObj) {
            return (
              <div key={key}>
                {key}: {formatValue(valueObj.from)} → {formatValue(valueObj.to)}
              </div>
            );
          }
          if ("added" in valueObj || "removed" in valueObj) {
            return (
              <div key={key}>
                {key}: +{formatValue(valueObj.added)} -{formatValue(valueObj.removed)}
              </div>
            );
          }
        }
        return (
          <div key={key}>
            {key}: {formatValue(value)}
          </div>
        );
      })}
    </div>
  );
}

const actionLabels: Record<ActivityAction, string> = {
  IMPORT_RUN: "Import run",
  ENTRY_CREATED: "Entry created",
  ENTRY_UPDATED: "Entry updated",
  ENTRY_DELETED: "Entry deleted",
};

export default async function ActivityPage() {
  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <AppHeader title="Activity Log" showBack />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-12 gap-3 border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="col-span-3">Date</span>
            <span className="col-span-3">Action</span>
            <span className="col-span-6">Details</span>
          </div>
          {logs.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No activity yet.
            </div>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className="grid grid-cols-12 gap-3 border-b border-slate-100 px-4 py-4 text-sm text-slate-700 last:border-b-0 dark:border-slate-800 dark:text-slate-200"
            >
              <div className="col-span-3">{log.createdAt.toLocaleString()}</div>
              <div className="col-span-3 font-semibold">{actionLabels[log.action]}</div>
              <div className="col-span-6">
                <div>{log.message ?? "--"}</div>
                {renderChanges(log.changes)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


