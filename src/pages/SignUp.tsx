import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { supabase } from "../lib/supabase";

export default function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSignUp = async (email: string, password: string) => {
    setError(null);
    setNotice(null);
    const { data, error } = await supabase.auth.signUp({
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
      navigate("/app", { replace: true });
    } else {
      // Email confirmation enabled in Supabase → wait for the link.
      setNotice("Check your inbox to confirm your email, then sign in. / 請到信箱點擊確認連結後再登入。");
    }
  };

  return <AuthForm mode="signup" onSubmit={handleSignUp} error={error} notice={notice} />;
}
