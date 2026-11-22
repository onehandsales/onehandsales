import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { invitationAccess, usePreviewEnvironment } from "@/features/preview";
import { CollaborationProject, CollaborationProjects } from "@/features/invitations";
import { ProjectDirectory, ProjectDetail, ProjectTools, useProjects } from "@/features/projects";
import "@/styles/projects.css";
import "@/styles/collaboration.css";
// 기능 : 고객·전체·초대 접근의 같은 프로젝트 원본을 실제 경로에 조합한다.
export function ProjectsPage() {
  const query = useProjects(); const { projectId } = useParams(); const { state } = usePreviewEnvironment(); const access = invitationAccess(state); const location = useLocation(); const [notice, setNotice] = useState(""); const [dismissed, setDismissed] = useState("");
  // 기능 : 경로를 떠나면 이전 화면의 인계 안내를 닫는다.
  useEffect(function closeNotice() { setNotice(""); }, [location.key]);
  const project = query.data?.find(item => item.id === projectId);
  const created = (location.state as { createdProjectId?: string } | null)?.createdProjectId;
  const accepted = (location.state as { invitationAccepted?: string } | null)?.invitationAccepted;
  return <section className="projects-page">{query.isPending ? <p role="status" className="clients-read-state">Loading projects…</p> : query.isError ? <div className="clients-read-state" role="alert"><h1>Projects unavailable</h1><p>{query.error.message}</p><button onClick={() => void query.refetch()}>Retry projects</button></div> : projectId ? project ? access ? <CollaborationProject project={{ ...project, recorded: project.id.endsWith(":team-project-2") }} /> : <ProjectDetail key={`${query.scope.actorId}:${query.scope.workspaceId}:${query.scope.revision}:${project.id}`} project={project} onUnavailable={setNotice} /> : <div className="clients-read-state"><h1>Project unavailable</h1><p>This project is missing or outside your assigned workspace scope.</p><Link to="/app/projects">Return to projects</Link></div> : access ? <CollaborationProjects projects={query.data.map(item => ({ ...item, recorded: item.id.endsWith(":team-project-2") }))} /> : <ProjectDirectory key={`${query.scope.actorId}:${query.scope.workspaceId}:${query.scope.revision}`} projects={query.data} onUnavailable={setNotice} />}
    {!access && <ProjectTools />}{notice && <Dialog title={notice} onClose={() => setNotice("")}><p>This action is not available in this preview. Your project remains unchanged.</p><button onClick={() => setNotice("")}>Return to project</button></Dialog>}
    {created && created !== dismissed && <div className="client-notice" role="status">✓ Project created successfully<button aria-label="Dismiss project message" onClick={() => setDismissed(created)}>×</button></div>}
    {access && accepted === access.teamRowId && accepted !== dismissed && <div className="collaboration-notice" role="status">✓ Your password was set successfully. You are now signed in.<button aria-label="Dismiss invitation message" onClick={() => setDismissed(accepted)}>×</button></div>}
  </section>;
}
