import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { Search, ListFilter } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { invitationAccess, usePreviewEnvironment } from "@/features/preview";
import { CollaborationProject, CollaborationProjects } from "@/features/invitations";
import { ProjectBoard, ProjectCreateLink, ProjectOverview, ProjectTools, useProjects } from "@/features/projects";
import "@/styles/projects.css";
import "@/styles/collaboration.css";
// 기능 : 고객·전체·초대 접근의 같은 프로젝트 원본을 실제 경로에 조합한다.
export function ProjectsPage() {
  const query = useProjects(); const { projectId } = useParams(); const { state } = usePreviewEnvironment(); const access = invitationAccess(state); const location = useLocation(); const [params, setParams] = useSearchParams(); const search = params.get("q") ?? ""; const [notice, setNotice] = useState(""); const [dismissed, setDismissed] = useState("");
  // 기능 : 경로를 떠나면 이전 화면의 인계 안내를 닫는다.
  useEffect(function closeNotice() { setNotice(""); }, [location.key]);
  const project = query.data?.find(item => item.id === projectId); const filtered = query.data?.filter(item => `${item.name} ${item.clientName}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())) ?? [];
  const created = (location.state as { createdProjectId?: string } | null)?.createdProjectId;
  const accepted = (location.state as { invitationAccepted?: string } | null)?.invitationAccepted;
  return <section className="projects-page">{query.isPending ? <p role="status" className="clients-read-state">Loading projects…</p> : query.isError ? <div className="clients-read-state" role="alert"><h1>Projects unavailable</h1><p>{query.error.message}</p><button onClick={() => void query.refetch()}>Retry projects</button></div> : projectId ? project ? access ? <CollaborationProject project={{ ...project, recorded: project.id.endsWith(":team-project-2") }} /> : <ProjectOverview project={project} onUnavailable={setNotice} /> : <div className="clients-read-state"><h1>Project unavailable</h1><p>This project is missing or outside your assigned workspace scope.</p><Link to="/app/projects">Return to projects</Link></div> : access ? <CollaborationProjects projects={query.data.map(item => ({ ...item, recorded: item.id.endsWith(":team-project-2") }))} /> : <><header className="clients-heading"><h1>Projects</h1><nav aria-label="Project views"><button aria-current="page">Board View</button><button onClick={() => setNotice("List View — G22")}>List View</button></nav></header><div className="projects-body"><div className="project-list-tools"><label className="client-search"><Search size={18} aria-hidden="true" /><input aria-label="Search projects" placeholder="Search..." value={search} onChange={event => { const next = new URLSearchParams(params); if (event.currentTarget.value) next.set("q", event.currentTarget.value); else next.delete("q"); void setParams(next, { replace: true, preventScrollReset: true }); }} /></label><button className="project-filter" onClick={() => setNotice("Project filters")}><ListFilter size={17} />Filters</button><ProjectCreateLink className="client-primary">New Project</ProjectCreateLink></div>{!filtered.length && <p role="status">{search ? "No matching projects." : "No projects yet."}</p>}<ProjectBoard projects={filtered} /></div></>}
    {!access && <ProjectTools />}{notice && <Dialog title={notice} onClose={() => setNotice("")}><p>This action belongs to a later recorded flow. No project or external service was changed.</p><button onClick={() => setNotice("")}>Return to project</button></Dialog>}
    {created && created !== dismissed && <div className="client-notice" role="status">✓ Project created successfully<button aria-label="Dismiss project message" onClick={() => setDismissed(created)}>×</button></div>}
    {access && accepted === access.teamRowId && accepted !== dismissed && <div className="collaboration-notice" role="status">✓ Your password was set successfully. You are now signed in.<button aria-label="Dismiss invitation message" onClick={() => setDismissed(accepted)}>×</button></div>}
  </section>;
}
