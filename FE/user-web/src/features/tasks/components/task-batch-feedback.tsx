import { useState } from "react";
import { Link } from "react-router-dom";
import { useTaskStore } from "../data/task-context";
// 기능 : 실제 적용된 작업 개수와 프로젝트 보드로 연결하며 이전 문맥의 결과를 지운다.
export function TaskBatchFeedback() {
  const { state } = useTaskStore(); const [dismissed, setDismissed] = useState<number>(); const result = state.application;
  if (!result || dismissed === result.sequence) return null;
  return <div className="task-feedback task-batch-feedback" role="status"><span>Tasks created successfully.<span className="sr-only"> {result.ids.length} task{result.ids.length === 1 ? "" : "s"} created from template.</span> <Link to={`/app/projects/${encodeURIComponent(result.projectId)}?tab=Tasks`}>View project tasks</Link></span><button type="button" aria-label="Dismiss template application message" onClick={() => setDismissed(result.sequence)}>×</button></div>;
}
