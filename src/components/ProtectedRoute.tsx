import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullPageSpinner } from "./FullPageSpinner";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!session) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** Redirects already-signed-in users away from the auth pages. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (session) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
