import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/auth";
import { sanitizeNextPath } from "@/lib/authToken";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolved = await searchParams;
  const nextPath = sanitizeNextPath(resolved.next);
  const session = await getSession();

  if (session) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-14">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            ComicTracker
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Sign in</h1>
        </div>
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
