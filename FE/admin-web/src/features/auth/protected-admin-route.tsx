import { Navigate, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAdminAuthSession } from "@/features/auth/auth-context";

type ProtectedAdminRouteProps = {
  readonly children: ReactNode;
};

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAuthenticated, isInitializing, role } = useAdminAuthSession();
  const location = useLocation();

  if (isInitializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-muted px-5 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          관리자 권한을 확인하는 중입니다.
        </p>
      </main>
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

  if (role !== "ADMIN") {
    return <AdminAccessDenied />;
  }

  return children;
}

function AdminAccessDenied() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuthSession();

  const onBackToLogin = () => {
    navigate("/login", {
      replace: true,
      state: { from: `${location.pathname}${location.search}` },
    });
    logout();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-muted px-5 text-center">
      <section className="grid w-full max-w-md gap-4 rounded-lg border bg-white p-6">
        <div>
          <p className="text-sm font-semibold text-primary">Onehand admin</p>
          <h1 className="mt-3 text-2xl font-semibold">
            관리자 권한이 필요합니다
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Admin role이 없는 계정은 운영 콘솔에 접근할 수 없습니다.
          </p>
        </div>
        <button
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={onBackToLogin}
          type="button"
        >
          로그인으로 돌아가기
        </button>
      </section>
    </main>
  );
}
