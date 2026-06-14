import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthSession } from "@/features/auth/auth-context";

type ProtectedRouteProps = {
  readonly children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing, isPending } = useAuthSession();
  const location = useLocation();

  if (isInitializing || isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        세션을 확인하는 중입니다.
      </div>
    );
  }

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
