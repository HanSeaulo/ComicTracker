import { EntryForm } from "@/components/EntryForm";
import { createEntry } from "@/app/actions";
import { AppHeader } from "@/components/AppHeader";

export default function NewEntryPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <AppHeader title="Add Entry" showBack />

        <EntryForm action={createEntry} submitLabel="Create Entry" />
      </div>
    </div>
  );
}
