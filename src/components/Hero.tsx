import { Link } from "react-router-dom";
import { FadeIn } from "./FadeIn";
import { ArrowRightIcon, CheckIcon } from "./Icons";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Decorative glowing arc */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-[30rem] top-10 h-[60rem] w-[60rem] rounded-full border-[14px] border-violet-400/80 opacity-70 blur-[1px] shadow-[0_0_80px_10px_rgba(167,139,250,0.35)] sm:-right-[22rem]" />
        <div className="absolute -right-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <FadeIn>
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-violet-400 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            From video to your next big idea
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <h1 className="mt-8 text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-8xl lg:text-9xl">
            Video Speed
            <br />
            Reader<span className="text-violet-400">.</span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mt-10 text-2xl font-medium text-white sm:text-4xl">上傳影片，三分鐘內拿到逐字稿。</p>
          <p className="mt-4 text-lg text-zinc-400 sm:text-xl">
            Upload your video, get a clean transcript in three minutes.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-violet-400 px-8 py-4 text-lg font-semibold text-ink shadow-xl shadow-violet-500/25 transition hover:bg-violet-300"
            >
              Get started / 開始使用
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <span className="flex items-center gap-2 text-zinc-400">
              <CheckIcon className="h-4 w-4 text-violet-400" />
              Made for your next creation
            </span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
