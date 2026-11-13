"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "./AuthForm";
import { createClient } from "@/lib/supabase/client";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/app");
    router.refresh();
  };

  return <AuthForm mode="signin" onSubmit={handleSignIn} error={error} />;
}
