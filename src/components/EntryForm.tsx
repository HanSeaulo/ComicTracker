import { EntryStatus, EntryType, Entry } from "@prisma/client";

type EntryFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initial?: Partial<Entry>;
};

const typeOptions = [
  { value: EntryType.MANHWA, label: "Manhwa" },
  { value: EntryType.MANHUA, label: "Manhua" },
  { value: EntryType.LIGHT_NOVEL, label: "Light Novel" },
  { value: EntryType.WESTERN, label: "Western" },
];

const statusOptions = [
  { value: "", label: "Unknown" },
  { value: EntryStatus.CURRENT, label: "Current" },
  { value: EntryStatus.COMPLETED, label: "Completed" },
];

export function EntryForm({ action, submitLabel, initial }: EntryFormProps) {
  return (
    <form action={action} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Title
          <input
            name="title"
            defaultValue={initial?.title ?? ""}
            required
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Type
          <select
            name="type"
            defaultValue={initial?.type ?? EntryType.MANHWA}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Status
          <select
            name="status"
            defaultValue={initial?.status ?? ""}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Score (0-10)
          <input
            name="score"
            type="number"
            min={0}
            max={10}
            step="0.1"
            defaultValue={initial?.score ?? ""}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Chapters Read
          <input
            name="chaptersRead"
            type="number"
            min={0}
            defaultValue={initial?.chaptersRead ?? ""}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Total Chapters
          <input
            name="totalChapters"
            type="number"
            min={0}
            defaultValue={initial?.totalChapters ?? ""}
            placeholder="?"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Start Date
          <input
            name="startDate"
            type="date"
            defaultValue={initial?.startDate ? initial.startDate.toISOString().slice(0, 10) : ""}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          End Date
          <input
            name="endDate"
            type="date"
            defaultValue={initial?.endDate ? initial.endDate.toISOString().slice(0, 10) : ""}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
      >
        {submitLabel}
      </button>
    </form>
  );
}
