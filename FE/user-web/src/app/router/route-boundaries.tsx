import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { QueryScope } from "../providers/query-scope";

// 기능 : 내부 경계에만 가상 세션을 요구하고 새 실행 차수마다 업무 캐시와 초안을 폐기한다.
export function WorkspaceBoundary() {
  const { state } = usePreviewEnvironment();
  const location = useLocation();
  if (!state.session) return <Navigate replace to={"/login?returnTo=" + encodeURIComponent(location.pathname)} />;
  return <QueryScope key={state.revision}><Outlet key={location.pathname} /></QueryScope>;
}

// 기능 : 공유 조회 캐시를 내부 세션 전환과 분리해 공개 링크 수명을 유지한다.
export function SharedBoundary() { return <QueryScope><Outlet /></QueryScope>; }

// 기능 : 렌더링 실패를 일반 목 조회 오류와 구분하고 수동 복구 경로를 제공한다.
export function RouteFailure() {
  return <main className="page-content"><h1>The preview could not be displayed.</h1><a href="/">Reload preview</a></main>;
}
