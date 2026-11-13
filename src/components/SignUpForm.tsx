"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "./AuthForm";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSignUp = async (email: string, password: string) => {
    setError(null);
    setNotice(null);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      // Email confirmation disabled → user is signed in immediately.
      router.replace("/app");
      router.refresh();
    } else {
      // Email confirmation enabled in Supabase → wait for the link.
      setNotice("Check your inbox to confirm your email, then sign in. / 請到信箱點擊確認連結後再登入。");
    }
  };

  return <AuthForm mode="signup" onSubmit={handleSignUp} error={error} notice={notice} />;
}
