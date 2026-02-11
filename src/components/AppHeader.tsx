import type { ReactNode } from "react";
import { BackButton } from "@/components/BackButton";
import { LogoutButton } from "@/components/LogoutButton";

type AppHeaderProps = {
  title: ReactNode;
  showBack?: boolean;
  actions?: ReactNode;
};

export function AppHeader({ title, showBack = false, actions }: AppHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        {showBack ? <BackButton /> : null}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            ComicTracker
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
        <LogoutButton />
      </div>
    </header>
  );
}
