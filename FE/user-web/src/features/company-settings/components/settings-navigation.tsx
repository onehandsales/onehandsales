import { NavLink } from "react-router-dom";
const sections = [["Account", "/app/settings/company"], ["Branding", "/app/settings/branding"], ["Team", "/app/pending/team"], ["Integrations & Data", "/app/pending/integrations"], ["Subscription", "/app/pending/subscription"]];
// 기능 : 회사 설정과 문서 브랜드가 동일한 설정 탐색과 실제 로컬 경로를 공유한다.
export function SettingsNavigation() {
  return <header className="company-settings-header"><h1>Settings</h1><nav aria-label="Settings sections">{sections.map(([name, path]) => <NavLink key={path} to={path ?? "/app/settings/company"}>{name}</NavLink>)}</nav></header>;
}
