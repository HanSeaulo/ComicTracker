"use client";

import { useState } from "react";
import { deleteEntry, removeAltTitle } from "@/app/actions";
import { ConfirmActionButton, ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteEntryButton({ entryId }: { entryId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    try {
      setError(null);
      await deleteEntry(entryId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry.");
    }
  }

  return (
    <>
      <ConfirmActionButton
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center rounded-full bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400"
      >
        Delete
      </ConfirmActionButton>
      <ConfirmDialog
        open={open}
        title="Delete this entry?"
        body="This can’t be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        error={error}
      />
    </>
  );
}

export function RemoveAltTitleButton({
  entryId,
  altTitleId,
  altTitle,
}: {
  entryId: string;
  altTitleId: string;
  altTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    try {
      setError(null);
      await removeAltTitle(entryId, altTitleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove title.");
    }
  }

  return (
    <>
      <ConfirmActionButton
        onClick={() => setOpen(true)}
        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600"
      >
        {altTitle} ×
      </ConfirmActionButton>
      <ConfirmDialog
        open={open}
        title={`Remove alternate title “${altTitle}”?`}
        body="This will remove it from this entry."
        confirmLabel="Remove"
        confirmVariant="danger"
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        error={error}
      />
    </>
  );
}
