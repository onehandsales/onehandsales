import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PreviewTools } from "@/features/preview";

// 기능 : 앱 조립 계층에서 최소 화면과 검증 도구를 연결하고 이동 초점·스크롤을 정돈한다.
export function PreviewFrame() {
  const { pathname } = useLocation();
  // 기능 : 실제 경로 변경 후 스크롤 복원을 방해하지 않고 본문 시작점에 초점을 맞춘다.
  useEffect(function restoreRoutePosition() {
    document.title = "OneHand CRM · UI preview";
    document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
  }, [pathname]);
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="preview-header">
      <Link className="wordmark" to="/">OneHand CRM</Link>
      <span className="preview-badge">Local UI preview</span>
      <nav aria-label="Preview areas">
        <NavLink to="/" end>Public</NavLink><NavLink to="/login">Log in</NavLink>
        <NavLink to="/app">Workspace</NavLink><NavLink to="/share/sample">Shared</NavLink>
        <NavLink to="/components">Components</NavLink>
      </nav>
    </header>
    <main id="main-content" tabIndex={-1}><Outlet /></main>
    <aside aria-label="Development tools"><PreviewTools /></aside>
    <ScrollRestoration storageKey="onehand.preview.scroll" />
  </>;
}
