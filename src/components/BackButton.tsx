"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  className?: string;
};

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/library");
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
      }
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
  );
}
