import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { UploadForm } from "@/components/UploadForm";
import { createClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/relativeTime";

export const metadata: Metadata = { title: "Upload · Video Speed Reader" };

type Job = { id: string; created_at: string; video_source_url: string; status: string };

const STATUS_STYLES: Record<string, string> = {
  pending: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  downloading: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  transcribe: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  done: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

function truncate(text: string, max = 50) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // RLS limits this to the signed-in user's rows; the explicit filter documents intent.
  const { data } = await supabase
    .from("jobs")
    .select("id, created_at, video_source_url, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const jobs = (data ?? []) as Job[];

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-white/5 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/app"
              className="hidden whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-300 transition hover:text-violet-300 sm:block"
            >
              Dashboard / 控制台
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-12 sm:px-8 sm:py-16">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 sm:text-sm">Transcriptions</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your videos / 你的影片</h1>
        </div>

        <section aria-label="Your transcription jobs">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-card p-8 text-center text-zinc-400">
              No transcriptions yet. Submit your first video below.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Created</th>
                    <th className="px-5 py-4 font-medium">URL</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Transcript</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.map((job) => (
                    <tr key={job.id} className="text-zinc-300">
                      <td className="whitespace-nowrap px-5 py-4 text-zinc-400">
                        <time dateTime={job.created_at} title={new Date(job.created_at).toISOString()}>
                          {relativeTime(job.created_at)}
                        </time>
                      </td>
                      <td className="px-5 py-4" title={job.video_source_url}>
                        {truncate(job.video_source_url)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_STYLES[job.status] ?? STATUS_STYLES.pending
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {job.status === "done" ? (
                          <a
                            href={`/api/jobs/${job.id}/transcript`}
                            download={`transcript-${job.id.slice(0, 8)}.txt`}
                            className="inline-flex items-center gap-1.5 font-medium text-violet-400 transition hover:text-violet-300"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.75}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
                            </svg>
                            .txt
                          </a>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <UploadForm />
      </main>
    </div>
  );
}
