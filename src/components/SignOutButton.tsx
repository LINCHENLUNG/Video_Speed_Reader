"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="shrink-0 whitespace-nowrap rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-violet-400 hover:text-violet-300 disabled:opacity-60 sm:px-5"
    >
      {signingOut ? "Signing out…" : "Sign out / 登出"}
    </button>
  );
}
