import { Link } from "react-router-dom";
import { WaveformIcon } from "./Icons";

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Video Speed Reader home">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/10 text-violet-300 transition group-hover:border-violet-300/70">
        <WaveformIcon className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
        Video Speed Reader<span className="text-violet-400"> .</span>
      </span>
    </Link>
  );
}
