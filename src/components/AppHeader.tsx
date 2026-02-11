import type { ReactNode } from "react";
import { BackButton } from "@/components/BackButton";
import { HeaderMenu } from "@/components/HeaderMenu";

type AppHeaderProps = {
  title: ReactNode;
  showBack?: boolean;
};

export function AppHeader({ title, showBack = false }: AppHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {showBack ? <BackButton /> : null}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            ComicTracker
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        </div>
      </div>
      <HeaderMenu />
    </header>
  );
}
