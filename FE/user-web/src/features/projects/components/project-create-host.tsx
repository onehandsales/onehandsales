import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { useClients } from "@/features/clients";
import { useProjects } from "../hooks/use-projects";
import { projectStages } from "../model/project-types";
import type { Project, ProjectDraft, ProjectStage } from "../model/project-types";
import { NewProjectDialog } from "./new-project-dialog";
// 기능 : 생성 query의 문맥을 검증하고 닫기/성공을 실제 URL navigation으로 연결한다.
export function ProjectCreateHost() {
  const clients = useClients(); const projects = useProjects(); const [params] = useSearchParams(); const navigate = useNavigate(); const location = useLocation();
  const origin: ProjectDraft["origin"] = params.get("projectOrigin") === "client" ? "client" : params.get("projectOrigin") === "column" ? "column" : "global";
  const clientId = origin === "client" ? params.get("projectClient") ?? "" : ""; const candidate = params.get("projectStage") as ProjectStage; const stage = projectStages.includes(candidate) ? candidate : "New Lead";
  // 기능 : 생성 관련 query만 제거하고 원래 경로/선택 이력은 보존한다.
  function close() { const next = new URLSearchParams(params); for (const key of ["create", "projectOrigin", "projectClient", "projectStage"]) next.delete(key); void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, preventScrollReset: true, state: location.state }); }
  // 기능 : 고객 문맥은 새 상세로, 전체/열 문맥은 생성된 카드가 있는 보드로 이동한다.
  function created(project: Project) { void navigate(origin === "client" ? `/app/projects/${encodeURIComponent(project.id)}` : "/app/projects", { replace: true, state: { createdProjectId: project.id, createdStage: project.stage } }); }
  const invalidClient = origin === "client" && clients.data && !clients.data.clients.some(client => client.id === clientId);
  if (clients.isError || projects.isError || !clients.data || !projects.data || invalidClient || projects.state.scenario === "empty") return <Dialog title="New Project" onClose={close}>{clients.isError || projects.isError ? <div role="alert"><p>{clients.error?.message ?? projects.error?.message}</p><button onClick={() => { void clients.refetch(); void projects.refetch(); }}>Retry project form</button></div> : invalidClient ? <p role="alert">This client is unavailable in the current workspace.</p> : projects.state.scenario === "empty" ? <p>Choose normal in Project preview controls before creating a project.</p> : <p role="status">Preparing project form…</p>}</Dialog>;
  return <NewProjectDialog initial={{ name: "", clientId, origin, stage }} onClose={close} onCreated={created} />;
}
