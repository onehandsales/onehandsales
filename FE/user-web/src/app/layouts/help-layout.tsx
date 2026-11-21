import { Outlet } from "react-router-dom";
import { HelpProvider, HelpHeader, HelpFooter } from "@/features/public-help";
import { usePreviewEnvironment } from "@/features/preview";
import "@/styles/public-help.css";
// 기능 : 공개 마케팅과 구분되는 도움말 전용 레이아웃·방문 상태 범위를 조립한다.
export function HelpLayout() {
  const { state } = usePreviewEnvironment();
  return <div className="help-web"><HelpProvider key={state.revision}><HelpHeader /><main id="main-content" tabIndex={-1}><Outlet /></main><HelpFooter /></HelpProvider></div>;
}
