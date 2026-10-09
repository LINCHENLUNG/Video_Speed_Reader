import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Logo } from "./Logo";
import { ArrowUpRightIcon } from "./Icons";

export function Header() {
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:h-24 sm:px-8">
        <Logo />
        <Link
          to={session ? "/app" : "/signin"}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-violet-400 px-3 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-violet-500/20 transition hover:bg-violet-300 sm:px-6 sm:py-3 sm:text-base"
        >
          {session ? "Dashboard / 控制台" : "Sign in / 登入"}
          <ArrowUpRightIcon className="hidden h-4 w-4 sm:block" />
        </Link>
      </div>
    </header>
  );
}
