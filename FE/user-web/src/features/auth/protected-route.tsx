import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthSession } from "@/features/auth/auth-context";

type ProtectedRouteProps = {
  readonly children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}` }}
        to="/login"
      />
    );
  }

  return children;
}
