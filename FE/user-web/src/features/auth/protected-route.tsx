import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthSession } from "@/features/auth/auth-context";
import {
  resolvePublicSiteLanguage,
  resolvePublicSiteLanguageFromUserProfile,
  toPublicSiteOnboardingPath,
  toPublicSitePath,
} from "@/features/public-site/i18n/public-site-locale-routes";

type ProtectedRouteProps = {
  readonly children: ReactNode;
};

// 기능 : ProtectedRoute route 보호 또는 전환 화면을 렌더링합니다.
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // 1. 처리 흐름에 필요한 { isAuthenticated, isInitializing, isPending } 값을 준비한다.
  const { isAuthenticated, isInitializing, isPending, user } = useAuthSession();
  // 2. 처리 흐름에 필요한 location 값을 준비한다.
  const location = useLocation();
  // 3. 이후 단계에서 사용할 loginPath 값을 준비한다.
  const fallbackLanguage = resolvePublicSiteLanguage(location.pathname);
  const loginPath = toPublicSitePath(fallbackLanguage, "/login");

  // 4. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (isInitializing || isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        세션을 확인하고 있어요.
      </div>
    );
  }

  // 5. 조건을 확인해 필요한 분기 처리를 수행한다.
  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}` }}
        to={loginPath}
      />
    );
  }

  // 6. 직업 선택 온보딩을 완료하지 않은 사용자는 앱 진입 전에 온보딩 화면으로 보낸다.
  if (user?.jobSelectOnboardingCompletedAt === null) {
    return (
      <Navigate
        replace
        to={toPublicSiteOnboardingPath(
          resolvePublicSiteLanguageFromUserProfile(user, fallbackLanguage)
        )}
      />
    );
  }

  // 7. 계산된 결과를 호출자에게 반환한다.
  return children;
}
