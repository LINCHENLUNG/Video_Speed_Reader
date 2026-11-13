import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/SignUpForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign up · Video Speed Reader" };

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app");

  return <SignUpForm />;
}
