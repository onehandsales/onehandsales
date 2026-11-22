import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useProjects } from "../hooks/use-projects";
import { useProjectAction } from "../hooks/use-project-action";
import { projectStages } from "../model/project-types";
import type { ProjectStage, ProjectView } from "../model/project-types";
// 기능 : 드래그 없이 단계와 같은 열의 위치를 고르고 실패·취소 때 기존 배치를 유지한다.
export function ProjectMoveDialog({ project, onClose, onMoved }: { project: ProjectView; onClose: () => void; onMoved: (stage: ProjectStage) => void }) { const query = useProjects(); const action = useProjectAction(); const [stage, setStage] = useState(project.stage); const [beforeId, setBefore] = useState(""); const latest = query.data?.find(item => item.id === project.id);
  // 기능 : 현재 프로젝트 revision으로 명시한 이동 위치만 저장한다.
  async function submit() { if (!latest || action.pending) return; if (await action.run({ type: "move", projectId: project.id, revision: latest.revision, stage, beforeId: beforeId || null })) onMoved(stage); }
  return <Dialog title={`Move ${project.name}`} onClose={onClose} footer={<><button onClick={onClose}>Cancel</button><button className="client-primary" type="submit" form="project-move-form" disabled={action.pending || !latest}>Move project</button></>}><form id="project-move-form" className="project-filter-form" onSubmit={event => { event.preventDefault(); void submit(); }}><label>Stage<select aria-label="Stage" value={stage} disabled={action.pending} onChange={event => { setStage(event.currentTarget.value as ProjectStage); setBefore(""); }}>{projectStages.map(value => <option key={value}>{value}</option>)}</select></label><label>Position<select aria-label="Position" value={beforeId} disabled={action.pending} onChange={event => setBefore(event.currentTarget.value)}><option value="">Last in this stage</option>{query.data?.filter(item => item.stage === stage && item.id !== project.id).map(item => <option key={item.id} value={item.id}>Before {item.name}</option>)}</select></label>{!latest && <p role="alert">Project unavailable.</p>}{action.pending && <p role="status">Moving project…</p>}{action.error && <p role="alert" className="client-error">{action.error}</p>}</form></Dialog>;
}
