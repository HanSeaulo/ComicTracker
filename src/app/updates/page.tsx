import { db } from "@/lib/db";
import { EntryStatus, EntryType } from "@prisma/client";
import { AppHeader } from "@/components/AppHeader";
import { EntryListRow } from "@/components/EntryListRow";

const typeLabels: Record<EntryType, string> = {
  MANHWA: "Manhwa",
  MANHUA: "Manhua",
  LIGHT_NOVEL: "Light Novel",
  WESTERN: "Western",
};

export default async function UpdatesPage() {
  const recentEntries = await db.entry.findMany({
    orderBy: [{ updatedAt: "desc" }],
    take: 50,
  });

  const sorted = [...recentEntries].sort((a, b) => {
    const aPriority = a.status === EntryStatus.CURRENT ? 0 : 1;
    const bPriority = b.status === EntryStatus.CURRENT ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <AppHeader title="Latest Updates" showBack />

        <div className="space-y-3">
          {sorted.map((entry) => (
            <EntryListRow
              key={entry.id}
              entryId={entry.id}
              title={entry.title}
              subtitle={`${typeLabels[entry.type]} - ${entry.status ?? "Unknown"} - ${entry.chaptersRead ?? "--"} / ${entry.totalChapters ?? "--"}`}
              chaptersRead={entry.chaptersRead}
              coverImageUrl={entry.coverImageUrl}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
