import { Link, NavLink, Outlet } from "react-router-dom";
import { AccountMenu } from "@/features/mock-auth/components/account-menu";
import "@/styles/auth.css";
import { PreviewTools } from "@/features/preview";

// 기능 : 공개 원본 화면과 구분된 G01 내부 검증 메뉴와 도구를 조립한다.
export function PreviewFrame() {
  return <>
    <header className="preview-header">
      <Link className="wordmark" to="/">OneHand CRM</Link>
      <span className="preview-badge">Local UI preview</span>
      <nav aria-label="Preview areas">
        <NavLink to="/" end>Public</NavLink><NavLink to="/login">Log in</NavLink>
        <NavLink to="/app">Workspace</NavLink><NavLink to="/share/sample">Shared</NavLink>
        <NavLink to="/components">Components</NavLink>
      </nav><AccountMenu />
    </header>
    <main id="main-content" tabIndex={-1}><Outlet /></main>
    <aside aria-label="Development tools"><PreviewTools /></aside>
  </>;
}
