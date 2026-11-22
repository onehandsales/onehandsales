import { TemplateApplyHost } from "@/features/task-template";
import "@/styles/task-templates.css";
import { TaskHost, TaskFeedback, TaskBatchFeedback } from "@/features/tasks";
import "@/styles/tasks.css";
import { ProjectCreateHost } from "@/features/projects";
import "@/styles/projects.css";
import { CreateMenu } from "@/features/app-shell/create-menu";
import { ClientCreateHost } from "@/features/clients";
import { QueryScope } from "../providers/query-scope";
import "@/styles/clients.css";
import { invitationAccess } from "@/features/preview";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { Menu, Search, CirclePlay } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { PreviewTools } from "@/features/preview";
import { usePreviewEnvironment } from "@/features/preview";
import { AccountMenu } from "@/features/mock-auth/components/account-menu";
import { AppSidebar } from "@/features/app-shell/sidebar";
import "@/styles/app-shell.css";

// 기능 : 내부 앱의 고정 메뉴·상단 도구·모바일 모달을 공개 레이아웃과 분리한다.
export function AppShell() {
  const location = useLocation(); const [params] = useSearchParams(); const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false); const mobileTrigger = useRef<HTMLButtonElement>(null);
  const { state: preview } = usePreviewEnvironment(); const invited = !!invitationAccess(preview);
  // 기능 : 다른 인증 문맥에 이전 메뉴 선택을 노출하지 않되 검증 도구의 펼침은 유지한다.
  useEffect(function clearScope() { setCollapsed(false); setMobileOpen(false); }, [preview.revision]);
  // 기능 : DOM이 교체되는 축소·확장 이후에도 같은 제어에 키보드 초점을 유지한다.
  function toggleSidebar() { setCollapsed(value => !value); window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(".app-sidebar-brand button")?.focus()); }
  // 기능 : 실제 경로 이동 시 열린 모바일 탐색을 닫는다.
  useEffect(function closeOnRoute() { setMobileOpen(false); }, [location.key]);
  // 기능 : 데스크톱으로 폭이 바뀌면 모달을 닫고 보이는 사이드바 제어로 초점을 옮긴다.
  useEffect(function followWidth() {
    const media = window.matchMedia("(min-width: 761px)");
    // 기능 : 숨겨지는 모바일 버튼 대신 데스크톱 메뉴에 키보드 초점을 둔다.
    function change() { if (media.matches && mobileOpen) { setMobileOpen(false); window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(".app-sidebar-brand button")?.focus()); } }
    media.addEventListener("change", change); return function removeListener() { media.removeEventListener("change", change); };
  }, [mobileOpen]);
  return <div className={`app-shell${collapsed ? " has-collapsed-sidebar" : ""}${invited ? " is-invited" : ""}`}>
    <aside className="app-sidebar-desktop"><AppSidebar collapsed={collapsed} onToggle={toggleSidebar} /></aside>
    <header className="app-toolbar"><button type="button" className="app-mobile-toggle" ref={mobileTrigger} aria-label="Open workspace menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={22} aria-hidden="true" /></button>{!invited && <Link className="app-search" to="/app/pending/search"><Search size={20} aria-hidden="true" /><span>Search</span></Link>}<div className="app-toolbar-actions">{!invited && <Link className="app-upgrade" to="/app/pending/subscription">Upgrade Now</Link>}<Link className="app-track" to="/app/pending/time-tracking"><CirclePlay size={27} aria-hidden="true" /><span>Track Time</span></Link>{!invited && <CreateMenu />}<AccountMenu compact /></div></header>
    <main id="main-content" className="app-main" tabIndex={-1}><Outlet /></main>
    <footer className="app-local-tools"><Link to="/app/preview">Foundation verification</Link><Link to="/">Public site</Link><Link to="/share/sample">Shared preview</Link><PreviewTools /></footer>
    {!invited && params.get("create") === "client" && <QueryScope key={preview.revision + ":" + location.key}><ClientCreateHost /></QueryScope>}
    {!invited && params.get("create") === "project" && <QueryScope key={preview.revision + ":" + location.key}><ProjectCreateHost /></QueryScope>}
    {params.has("task") && !params.has("applyTemplate") && !params.has("create") && <QueryScope key={preview.revision + ":task:" + location.pathname}><TaskHost /></QueryScope>}
    {params.has("applyTemplate") && !params.has("task") && !params.has("create") && <QueryScope key={preview.revision + ":template-apply:" + location.key}><TemplateApplyHost /></QueryScope>}
    <TaskFeedback /><TaskBatchFeedback />
    {mobileOpen && <Dialog title="Workspace menu" onClose={() => setMobileOpen(false)}><AppSidebar mobile /></Dialog>}
  </div>;
}
