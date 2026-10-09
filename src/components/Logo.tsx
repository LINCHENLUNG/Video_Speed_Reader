import { Link } from "react-router-dom";
import { WaveformIcon } from "./Icons";

export function Logo() {
  return (
    <Link to="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Video Speed Reader home">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/10 text-violet-300 transition group-hover:border-violet-300/70 sm:h-10 sm:w-10">
        <WaveformIcon className="h-5 w-5" />
      </span>
      <span className="truncate whitespace-nowrap text-base font-semibold tracking-tight text-white sm:text-xl">
        Video Speed Reader<span className="text-violet-400"> .</span>
      </span>
    </Link>
  );
}
