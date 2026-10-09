import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { WaveformIcon } from "../components/Icons";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-white/5 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Logo />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="shrink-0 whitespace-nowrap rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-violet-400 hover:text-violet-300 disabled:opacity-60 sm:px-5"
          >
            {signingOut ? "Signing out…" : "Sign out / 登出"}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-8 sm:py-24">
        <div className="animate-fade-up">
          <h1 className="break-all text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Hi {user?.email}
          </h1>

          <div className="mt-12 flex flex-col items-start gap-6 rounded-2xl border border-dashed border-white/15 bg-card p-8 sm:flex-row sm:items-center sm:p-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <WaveformIcon className="h-7 w-7" />
            </div>
            <p className="text-lg leading-relaxed text-zinc-300">
              Your dashboard is coming soon. Upload functionality will be added in the next milestone.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
