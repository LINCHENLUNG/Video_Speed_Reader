import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { supabase } from "../lib/supabase";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? "/app";

  const handleSignIn = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    navigate(from, { replace: true });
  };

  return <AuthForm mode="signin" onSubmit={handleSignIn} error={error} />;
}
