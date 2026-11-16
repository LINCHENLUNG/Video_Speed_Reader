import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/** Header balance badge for signed-in pages. Server component: reads the user's own profile row (RLS). */
export async function CreditsBadge({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("credits_balance").eq("id", userId).maybeSingle();
  const balance = Number(data?.credits_balance ?? 0);

  return (
    <Link
      href="/credits"
      className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-card px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:border-violet-400/50 hover:text-violet-300"
    >
      <span>Credits: {balance}</span>
      <span className="hidden text-xs font-medium text-violet-400 sm:inline">Buy more / 購買</span>
    </Link>
  );
}
