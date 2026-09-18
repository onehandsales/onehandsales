import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "@/features/auth";
import {
  toWorkspaceHomePath,
  useDefaultSidebarWorkspaceQuery,
} from "@/features/workspace";
import { HomePage } from "@/pages/home";

// 기능 : /app 진입 시 사용자의 기본 Workspace 홈으로 이동합니다.
export function AppWorkspaceRedirect() {
  // 1. 처리 흐름에 필요한 location 값을 준비한다.
  const location = useLocation();
  // 2. 처리 흐름에 필요한 user 값을 준비한다.
  const { user } = useAuthSession();
  // 3. 현재 사용자의 기본 Workspace를 조회한다.
  const defaultWorkspaceQuery = useDefaultSidebarWorkspaceQuery({
    userId: user?.id ?? null,
  });

  if (!user) {
    return null;
  }

  // 4. 기본 Workspace가 있으면 Workspace 홈 route로 이동한다.
  if (defaultWorkspaceQuery.data) {
    return (
      <Navigate
        replace
        to={`${toWorkspaceHomePath(defaultWorkspaceQuery.data.id)}${location.search}${location.hash}`}
      />
    );
  }

  // 5. 기본 Workspace 조회 중에는 /app entry route에서 화면 깜빡임을 막는다.
  if (defaultWorkspaceQuery.isLoading || defaultWorkspaceQuery.isFetching) {
    return null;
  }

  // 6. 기본 Workspace가 없거나 조회에 실패하면 기존 앱 홈 빈 상태를 유지한다.
  return <HomePage />;
}
