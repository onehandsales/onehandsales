import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuthSession } from "@/features/auth";

export function LoginPage() {
  const {
    clearError,
    error,
    isPending,
    loginAsAdmin,
    loginAsUser,
    loginWithAccessToken,
    role,
  } = useAdminAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = getRedirectPath(location.state);
  const [shouldRedirectUser, setShouldRedirectUser] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    if (role === "ADMIN") {
      navigate(redirectTo, { replace: true });
    }

    if (role === "USER" && shouldRedirectUser) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, role, shouldRedirectUser]);

  const onUserLogin = () => {
    setShouldRedirectUser(true);
    void loginAsUser();
  };

  const onAdminLogin = () => {
    setShouldRedirectUser(false);
    void loginAsAdmin();
  };

  const onTokenSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = accessToken.trim();

    if (!token) {
      return;
    }

    setShouldRedirectUser(false);
    void loginWithAccessToken(token);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-5">
      <section className="w-full max-w-sm rounded-lg border bg-white p-6">
        <p className="text-sm font-semibold text-primary">Onehand admin</p>
        <h1 className="mt-3 text-2xl font-semibold">관리자 로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Backend App access token은 `/admin/api/me`로 관리자 권한을 확인합니다.
        </p>
        <form className="mt-6 grid gap-2" onSubmit={onTokenSubmit}>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              App access token
            </span>
            <input
              className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              onChange={(event) => {
                clearError();
                setAccessToken(event.target.value);
              }}
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
            토큰으로 관리자 확인
          </button>
        </form>
        {error ? (
          <p className="mt-3 rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="mt-4 grid gap-2 border-t pt-4">
          <button
            className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground"
            disabled={isPending}
            onClick={onAdminLogin}
            type="button"
          >
            관리자로 계속
          </button>
          <button
            className="h-10 w-full rounded-md border bg-white text-sm font-medium hover:bg-muted"
            disabled={isPending}
            onClick={onUserLogin}
            type="button"
          >
            일반 사용자로 계속
          </button>
        </div>
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
