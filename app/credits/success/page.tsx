import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Payment received · Video Speed Reader" };

// Display only: credits are added by the Stripe webhook, never by this page.
export default async function CreditsSuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-white/5 bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center px-4 sm:px-8">
          <Logo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-24 text-center sm:px-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Thank you! / 感謝購買！</h1>
        <p className="mt-4 text-zinc-300">
          Your credits will appear in a few seconds. / 點數將在幾秒內入帳。
        </p>
        <Link
          href="/credits"
          className="mt-8 inline-flex rounded-lg bg-violet-400 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-violet-300"
        >
          Back to credits / 回到點數頁
        </Link>
      </main>
    </div>
  );
}
