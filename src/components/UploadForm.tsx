"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-ink px-4 py-3 text-white placeholder-zinc-600 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30";

export function UploadForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("zh");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_source_url: url.trim(), topic: topic.trim() || null, language }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }
      setUrl("");
      setTopic("");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-card p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-white">New transcription / 新增逐字稿</h2>
        <p className="mt-1 text-sm text-zinc-400">
          YouTube links aren&apos;t supported yet — use a direct mp4 / mp3 link.
        </p>
      </div>

      <div>
        <label htmlFor="video-url" className="block text-sm font-medium text-zinc-300">
          Video URL / 影片網址
        </label>
        <input
          id="video-url"
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Direct mp4 / mp3 URL (e.g. CloudFront, Vimeo, Internet Archive)"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-zinc-300">
            Topic / 主題 <span className="text-zinc-500">(optional)</span>
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Tech podcast — useful context for the model"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-zinc-300">
            Language / 語言
          </label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            <option value="zh">zh — 中文</option>
            <option value="en">en — English</option>
            <option value="ja">ja — 日本語</option>
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-violet-400 px-6 py-3 font-semibold text-ink shadow-lg shadow-violet-500/20 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Submitting…" : "Transcribe"}
      </button>
    </form>
  );
}
