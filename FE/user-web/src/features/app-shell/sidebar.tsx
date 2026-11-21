import { usePreviewEnvironment } from "@/features/preview";
import { invitationAccess } from "@/features/preview";
import { Link, NavLink } from "react-router-dom";
import { PanelLeftClose } from "lucide-react";
import { appNavigation, appSidebarActions } from "./navigation";

// 기능 : 원본 메뉴 순서를 유지하며 축소 상태에서도 아이콘의 접근 이름과 실제 목적지를 제공한다.
export function AppSidebar({ collapsed = false, onToggle, mobile = false }: { collapsed?: boolean; onToggle?: () => void; mobile?: boolean }) {
  const { state } = usePreviewEnvironment(); const invited = !!invitationAccess(state);
  const groups = invited ? [{ label: "", items: appNavigation.flatMap(group => group.items).filter(item => ["Projects", "Tasks"].includes(item.name)).map(item => ({ ...item, path: item.name === "Projects" ? "/app/projects" : "/app/tasks" })) }] : appNavigation;
  return <div className={`app-sidebar${collapsed ? " is-collapsed" : ""}${mobile ? " is-mobile" : ""}`}>
    {!mobile && <div className="app-sidebar-brand">{collapsed ? <button type="button" title="Expand sidebar" aria-label="Expand sidebar" aria-expanded={false} onClick={onToggle}><img src="/bonsai-auth/symbol.png" alt="" /></button> : <><Link to="/app" aria-label="Bonsai workspace"><img src="/bonsai-auth/logo.png" alt="bonsai" /></Link><button type="button" aria-label="Collapse sidebar" aria-expanded={true} onClick={onToggle}><PanelLeftClose size={20} aria-hidden="true" /></button></>}</div>}
    <nav aria-label="Workspace navigation">{groups.map(group => <div className="app-nav-group" key={group.label}>{group.label && <p className="app-nav-label">{group.label}</p>}{group.items.map(({ name, path, Icon }) => <NavLink key={path} to={path} end aria-label={name} title={collapsed ? name : undefined}><Icon size={18} aria-hidden="true" /><span>{name}</span></NavLink>)}</div>)}</nav>
    {!invited && <div className="app-sidebar-bottom">{appSidebarActions.map(({ name, path, Icon }) => <Link key={path} to={path} aria-label={name} title={collapsed ? name : undefined}><Icon size={19} aria-hidden="true" /><span>{name}</span></Link>)}</div>}
  </div>;
}
