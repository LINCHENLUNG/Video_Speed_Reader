import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { CreditTiers } from "@/components/CreditTiers";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Credits · Video Speed Reader" };

const TYPE_STYLE: Record<string, { label: string; className: string }> = {
  purchase: { label: "Purchase / 購買", className: "text-emerald-400" },
  signup_bonus: { label: "Signup bonus / 註冊贈點", className: "text-yellow-400" },
  deduction: { label: "Usage / 使用", className: "text-zinc-400" },
  admin_grant: { label: "Grant / 贈與", className: "text-sky-400" },
};

export default async function CreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ data: profile }, { data: products }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("credits_balance").eq("id", user.id).single(),
    supabase
      .from("credit_products")
      .select("id, name, credits, price_usd")
      .eq("active", true)
      .order("price_usd"),
    supabase
      .from("credit_transactions")
      .select("id, amount, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const tiers = (products ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    credits: Number(p.credits),
    price_usd: Number(p.price_usd),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-white/5 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/upload"
              className="whitespace-nowrap rounded-lg bg-violet-400 px-3 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-violet-500/20 transition hover:bg-violet-300 sm:px-5"
            >
              Upload / 上傳
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-4 py-12 sm:px-8 sm:py-16">
        <section className="rounded-2xl border border-white/10 bg-card p-8">
          <p className="text-sm text-zinc-400">Balance / 餘額</p>
          <p className="mt-2 text-5xl font-bold text-white">{Number(profile?.credits_balance ?? 0)}</p>
          <p className="mt-2 text-sm text-zinc-400">1 credit = 1 minute of video / 1 點 = 1 分鐘影片</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Buy credits / 購買點數</h2>
          <CreditTiers products={tiers} />
          <p className="text-xs text-zinc-500">Test mode: use card 4242 4242 4242 4242. / 測試模式：請使用測試卡 4242 4242 4242 4242。</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">History / 紀錄</h2>
          {transactions && transactions.length > 0 ? (
            <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-card">
              {transactions.map((t) => {
                const style = TYPE_STYLE[t.type as string] ?? { label: t.type as string, className: "text-zinc-400" };
                const amount = Number(t.amount);
                const shown = t.type === "deduction" ? `-${Math.abs(amount)}` : `+${amount}`;
                return (
                  <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${style.className}`}>{style.label}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {t.description ?? ""} · {new Date(t.created_at as string).toLocaleString("en-US", { timeZone: "UTC" })} UTC
                      </p>
                    </div>
                    <p className={`shrink-0 text-lg font-bold ${style.className}`}>{shown}</p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">No transactions yet. / 尚無紀錄。</p>
          )}
        </section>
      </main>
    </div>
  );
}
