import { Link, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { ProjectStage } from "../model/project-types";
// 기능 : 생성 진입 고객/열을 URL에 명시해 직접 진입과 브라우저 이력에서도 구분한다.
export function ProjectCreateLink({ clientId, stage, children, className, label }: { clientId?: string; stage?: ProjectStage; children: ReactNode; className?: string; label?: string }) { const location = useLocation(); const params = new URLSearchParams(location.search); params.set("create", "project"); params.set("projectOrigin", clientId ? "client" : stage ? "column" : "global"); params.delete("projectClient"); params.delete("projectStage"); if (clientId) params.set("projectClient", clientId); if (stage) params.set("projectStage", stage); return <Link className={className} aria-label={label} to={{ pathname: location.pathname, search: params.toString(), hash: location.hash }} state={location.state} preventScrollReset>{children}</Link>; }
