import { CollaborationProjects } from "@/features/invitations";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useCollaborationProjects } from "@/features/invitations";
import { CollaborationProject } from "@/features/invitations";
import { CollaborationTasks } from "@/features/invitations";
import "@/styles/collaboration.css";
// 기능 : G18에서 필요한 제한 프로젝트·작업 화면을 같은 팀 프로젝트 ID로 조합한다.
export function CollaborationPage() {
  const { projects, state, access } = useCollaborationProjects(); const { projectId } = useParams(); const location = useLocation(); const { pathname } = location; const [notice, setNotice] = useState(location.state?.invitationAccepted === access?.teamRowId && !!access);
  // 기능 : 수락 이력에서만 성공 안내를 보이고 다음 화면에서는 폐기한다.
  useEffect(function clearNotice() { if (!location.state?.invitationAccepted) setNotice(false); }, [location.key, location.state]);
  if (pathname === "/app/settings/profile") return <section className="collaboration-body"><h1>Account settings</h1><p>{state.session?.name}</p><p>This local invitation role can view its account name. Company, team, subscription and financial settings are unavailable.</p><Link to="/app/projects">Return to projects</Link></section>;
  if (projectId) { const project = projects.find(item => item.id === projectId); return project ? <><CollaborationProject project={project} />{notice && <div className="collaboration-notice" role="status"><span aria-hidden="true">✓</span>Your password was set successfully. You are now signed in.<button type="button" aria-label="Dismiss invitation message" onClick={() => setNotice(false)}>×</button></div>}</> : <section className="collaboration-body"><h1>Project unavailable</h1><p>This project is outside your assigned workspace scope.</p><Link to="/app/projects">Return to projects</Link></section>; }
  if (pathname === "/app/tasks") return <><header className="collaboration-heading"><h1>Tasks</h1></header><CollaborationTasks projects={projects} /></>;
  return <CollaborationProjects projects={projects} />;
}
