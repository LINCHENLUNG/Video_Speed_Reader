import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/SignInForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in · Video Speed Reader" };

export default async function SignInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app");

  return <SignInForm />;
}
