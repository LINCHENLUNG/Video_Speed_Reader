import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

type AuthFormProps = {
  mode: "signin" | "signup";
  onSubmit: (email: string, password: string) => Promise<void>;
  error: string | null;
  notice?: string | null;
};

export function AuthForm({ mode, onSubmit, error, notice }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSignUp = mode === "signup";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/25 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8">
        <Logo />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md animate-fade-up rounded-2xl border border-white/10 bg-card/90 p-8 shadow-2xl shadow-black/40 backdrop-blur sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-zinc-400">{isSignUp ? "註冊帳號，開始使用" : "登入你的帳號"}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink px-4 py-3 text-white placeholder-zinc-600 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password / 密碼
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-ink px-4 py-3 text-white placeholder-zinc-600 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30"
                placeholder={isSignUp ? "At least 6 characters" : "••••••••"}
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm text-violet-200"
              >
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-violet-400 px-4 py-3 font-semibold text-ink shadow-lg shadow-violet-500/20 transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Please wait…" : isSignUp ? "Sign up / 註冊" : "Sign in / 登入"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-400">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Link to="/signin" className="font-medium text-violet-400 hover:text-violet-300">
                  Sign in / 登入
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link to="/signup" className="font-medium text-violet-400 hover:text-violet-300">
                  Create an account / 註冊
                </Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
