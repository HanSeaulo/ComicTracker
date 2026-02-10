import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntryForm } from "@/components/EntryForm";
import { updateEntry } from "@/app/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              ComicTracker
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Edit Entry</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300" href={`/entries/${entry.id}`}>
              Back to details
            </Link>
          </div>
        </div>

        <EntryForm
          action={updateEntry.bind(null, entry.id)}
          submitLabel="Save Changes"
          initial={entry}
        />
      </div>
    </div>
  );
}
