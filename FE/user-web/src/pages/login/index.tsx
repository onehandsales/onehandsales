import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/auth";

export function LoginPage() {
  const { isAuthenticated, loginWithMock } = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = getRedirectPath(location.state);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const onLogin = () => {
    loginWithMock();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5">
      <section className="w-full max-w-sm rounded-lg border bg-white p-6">
        <p className="text-sm font-semibold text-primary">onehand.sales</p>
        <h1 className="mt-3 text-2xl font-semibold">로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Auth 목표 작업에서 Supabase provider 로그인을 연결합니다.
        </p>
        <button
          className="mt-6 h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground"
          onClick={onLogin}
          type="button"
        >
          계속
        </button>
      </section>
    </main>
  );
}

function getRedirectPath(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return "/";
  }

  const from = (state as Record<string, unknown>).from;

  return typeof from === "string" && from.startsWith("/") ? from : "/";
}
