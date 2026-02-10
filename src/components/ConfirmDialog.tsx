"use client";

import { ReactNode, useTransition } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  error?: string | null;
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  error,
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const confirmClasses =
    confirmVariant === "danger"
      ? "bg-rose-600 hover:bg-rose-500 text-white"
      : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => startTransition(onConfirm)}
            disabled={isPending}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${confirmClasses} disabled:opacity-60`}
          >
            {isPending ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type ConfirmActionButtonProps = {
  children: ReactNode;
  onClick: () => void;
  className?: string;
};

export function ConfirmActionButton({ children, onClick, className }: ConfirmActionButtonProps) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
