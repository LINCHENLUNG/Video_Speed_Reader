import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { WaveformIcon } from "@/components/Icons";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard · Video Speed Reader" };

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-white/5 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/upload"
              className="whitespace-nowrap rounded-lg bg-violet-400 px-3 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-violet-500/20 transition hover:bg-violet-300 sm:px-5"
            >
              Upload / 上傳
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-8 sm:py-24">
        <div className="animate-fade-up">
          <h1 className="break-all text-3xl font-bold tracking-tight text-white sm:text-5xl">Hi {user.email}</h1>

          <div className="mt-12 flex flex-col items-start gap-6 rounded-2xl border border-dashed border-white/15 bg-card p-8 sm:flex-row sm:items-center sm:p-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <WaveformIcon className="h-7 w-7" />
            </div>
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-zinc-300">
                Paste a video link and get a transcript back. 貼上影片連結，取得逐字稿。
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 font-semibold text-violet-400 transition hover:text-violet-300"
              >
                Go to Upload / 前往上傳 →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
