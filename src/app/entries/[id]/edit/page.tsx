import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntryForm } from "@/components/EntryForm";
import { updateEntry } from "@/app/actions";
import { AppHeader } from "@/components/AppHeader";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = await db.entry.findUnique({ where: { id } });
  if (!entry) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <AppHeader title="Edit Entry" showBack />

        <EntryForm
          action={updateEntry.bind(null, entry.id)}
          submitLabel="Save Changes"
          initial={entry}
        />
      </div>
    </div>
  );
}
