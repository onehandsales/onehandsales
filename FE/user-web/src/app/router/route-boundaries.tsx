import { invitationAccess } from "@/features/preview";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { QueryScope } from "../providers/query-scope";
import { useMockAuth } from "@/features/mock-auth";

// 기능 : 내부 경계에만 가상 세션을 요구하고 새 실행 차수마다 업무 캐시와 초안을 폐기한다.
export function WorkspaceBoundary() {
  const { state } = usePreviewEnvironment();
  const { store } = useMockAuth();
  const location = useLocation();
  if (!state.session) return <Navigate replace to={"/login?returnTo=" + encodeURIComponent(location.pathname + location.search + location.hash)} />;
  if (!invitationAccess(state) && !store.getAccount(state.session.id)?.setupComplete) return <Navigate replace to={"/onboarding?returnTo=" + encodeURIComponent(location.pathname + location.search + location.hash)} />;
  if (invitationAccess(state)) {
    if (location.pathname === "/app") return <Navigate replace to="/app/projects" />;
    if (!/^\/app\/(projects(?:\/[^/]+)?|tasks|settings\/profile|pending\/time-tracking)$/.test(location.pathname)) return <main className="page-content" id="main-content" tabIndex={-1}><h1>Workspace access restricted</h1><p>This local invitation allows assigned projects and tasks. Company, financial and team management pages are unavailable.</p><Link to="/app/projects">Return to assigned projects</Link></main>;
  }
  return <Outlet />;
}

// 기능 : 앱 메뉴의 수명과 분리해 인증 차수가 바뀔 때 내부 조회·편집만 폐기한다.
export function WorkspaceContentScope() { const { state } = usePreviewEnvironment(); return <QueryScope key={state.revision}><Outlet /></QueryScope>; }

// 기능 : 공유 조회 캐시를 내부 세션 전환과 분리해 공개 링크 수명을 유지한다.
export function SharedBoundary() { return <QueryScope><Outlet /></QueryScope>; }

// 기능 : 렌더링 실패를 일반 목 조회 오류와 구분하고 수동 복구 경로를 제공한다.
export function RouteFailure() {
  return <main className="page-content"><h1>The preview could not be displayed.</h1><a href="/">Reload preview</a></main>;
}
