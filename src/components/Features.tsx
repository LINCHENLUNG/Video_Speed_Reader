import type { ReactNode } from "react";
import { FadeIn } from "./FadeIn";
import { FeatureCard, type FeatureTone } from "./FeatureCard";
import { ShieldCheckIcon, StopwatchIcon, WaveformIcon } from "./Icons";

const features: {
  titleZh: string;
  titleEn: string;
  description: string;
  tagline: string;
  tone: FeatureTone;
  icon: ReactNode;
}[] = [
  {
    titleZh: "高準確度逐字稿",
    titleEn: "High-accuracy transcripts",
    description: "Powered by OpenAI Whisper. Every word captured clearly, in Chinese and English.",
    tagline: "中文 & English",
    tone: "violet",
    icon: <WaveformIcon className="h-7 w-7" />,
  },
  {
    titleZh: "三分鐘交付",
    titleEn: "Three-minute turnaround",
    description: "Your video is processed in the background. We'll email you when your transcript is ready.",
    tagline: "Less waiting. More creating.",
    tone: "emerald",
    icon: <StopwatchIcon className="h-7 w-7" />,
  },
  {
    titleZh: "可商用授權",
    titleEn: "Commercial-use ready",
    description: "Your words, your work. You own the output—repurpose, publish, and use it however you like.",
    tagline: "100% yours",
    tone: "orange",
    icon: <ShieldCheckIcon className="h-7 w-7" />,
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-white/5 bg-ink-deep">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <FadeIn>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-400 sm:text-sm">
                Every word. Without the wait.
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Long videos. Short turnaround.
              </h2>
            </div>
            <p className="max-w-md text-lg leading-relaxed text-zinc-400">
              From recorded thoughts to blog posts, course notes, and searchable archives.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {features.map((feature, i) => (
            <FadeIn key={feature.titleEn} delay={i * 120} className="h-full">
              <FeatureCard index={`/0${i + 1}`} {...feature} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
