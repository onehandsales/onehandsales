import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useProjects } from "../hooks/use-projects";
import { ProjectCreateLink } from "./project-create-link";
// 기능 : 고객 상세에 같은 프로젝트 원본의 연결 결과와 신규 생성 진입을 표시한다.
export function ClientProjects({ clientId }: { clientId: string }) { const query = useProjects(); const projects = query.data?.filter(project => project.clientId === clientId) ?? []; return <section><div className="client-panel-title"><h2>Projects</h2><ProjectCreateLink clientId={clientId} className="client-round" label="Add project"><Plus /></ProjectCreateLink></div>{query.isPending ? <p role="status">Loading projects…</p> : query.isError ? <div role="alert"><p>{query.error.message}</p><button onClick={() => void query.refetch()}>Retry projects</button></div> : projects.length ? <div className="client-project-list">{projects.map(project => <Link key={project.id} to={`/app/projects/${encodeURIComponent(project.id)}`}><strong>{project.name}</strong><span>{project.stage}</span></Link>)}</div> : <div className="client-empty client-empty-projects">No projects started yet.</div>}</section>; }
