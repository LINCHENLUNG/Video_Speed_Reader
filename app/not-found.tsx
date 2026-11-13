import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8">
        <Logo />
      </div>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">404</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Page not found / 找不到頁面</h1>
        <Link
          href="/"
          className="rounded-lg bg-violet-400 px-6 py-3 font-semibold text-ink transition hover:bg-violet-300"
        >
          Back to home / 回首頁
        </Link>
      </main>
    </div>
  );
}
