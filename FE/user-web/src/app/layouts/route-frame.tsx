import { useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";

// 기능 : 공개·내부 경계에 공통으로 이동 초점과 실제 브라우저 스크롤 이력을 관리한다.
export function RouteFrame() {
  const { pathname } = useLocation();
  // 기능 : 경로 변경 후 본문 초점을 옮기되 뒤로 이동의 스크롤 복원을 보존한다.
  useEffect(function focusRouteContent() {
    document.title = "OneHand CRM · Bonsai UI preview";
    document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
  }, [pathname]);
  return <><a className="skip-link" href="#main-content">Skip to content</a><Outlet /><ScrollRestoration storageKey="onehand.preview.scroll" /></>;
}
