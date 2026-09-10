import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuthSession } from "@/features/auth";

// 기능 : access token을 받아 /admin/api/me 권한 확인을 요청합니다.
export function LoginPage() {
  const {
    clearError,
    error,
    isPending,
    loginWithAccessToken,
    role,
  } = useAdminAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = getRedirectPath(location.state);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    if (role === "ADMIN") {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, role]);

  // 기능 : token 입력값을 갱신하고 이전 오류를 지웁니다.
  const onAccessTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    clearError();
    setAccessToken(event.currentTarget.value);
  };

  // 기능 : 입력된 access token으로 관리자 권한 확인을 시작합니다.
  const onTokenSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = accessToken.trim();

    if (!token) {
      return;
    }

    void loginWithAccessToken(token);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5">
      <section className="w-full max-w-sm rounded-lg border bg-white p-6">
        <p className="text-sm font-semibold text-primary">OneHand admin</p>
        <h1 className="mt-3 text-2xl font-semibold">Admin login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a Backend App access token to verify /admin/api/me.
        </p>
        <form className="mt-6 grid gap-2" onSubmit={onTokenSubmit}>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              App access token
            </span>
            <input
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              onChange={onAccessTokenChange}
              placeholder="Backend App access token"
              type="password"
              value={accessToken}
            />
          </label>
          <button
            className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || accessToken.trim().length === 0}
            type="submit"
          >
            Verify admin
          </button>
        </form>
        {error ? (
          <p className="mt-3 rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}

// 기능 : 로그인 완료 후 돌아갈 Admin route를 복원합니다.
function getRedirectPath(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return "/";
  }

  const from = (state as Record<string, unknown>).from;

  return typeof from === "string" && from.startsWith("/") ? from : "/";
}
