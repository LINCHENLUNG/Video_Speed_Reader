import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "./Icons";

export type FeatureTone = "violet" | "emerald" | "orange";

const toneStyles: Record<FeatureTone, { badge: string; accent: string }> = {
  violet: { badge: "bg-violet-500/10 text-violet-400", accent: "text-violet-400" },
  emerald: { badge: "bg-emerald-500/10 text-emerald-300", accent: "text-emerald-300" },
  orange: { badge: "bg-orange-500/10 text-orange-300", accent: "text-orange-300" },
};

type FeatureCardProps = {
  index: string;
  icon: ReactNode;
  titleZh: string;
  titleEn: string;
  description: string;
  tagline: string;
  tone: FeatureTone;
};

export function FeatureCard({ index, icon, titleZh, titleEn, description, tagline, tone }: FeatureCardProps) {
  const styles = toneStyles[tone];

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-card p-8 transition duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-10">
      <div className="flex items-start justify-between">
        <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${styles.badge}`}>{icon}</div>
        <span className="text-sm text-zinc-500">{index}</span>
      </div>

      <h3 className="mt-10 text-2xl font-semibold text-white">{titleZh}</h3>
      <p className="mt-2 text-lg font-medium text-white">{titleEn}</p>
      <p className="mt-6 flex-1 text-lg leading-relaxed text-zinc-400">{description}</p>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
        <span className={`text-sm font-medium ${styles.accent}`}>{tagline}</span>
        <ArrowUpRightIcon
          className={`h-4 w-4 ${styles.accent} transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5`}
        />
      </div>
    </article>
  );
}
