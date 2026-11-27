import { useEffect, useRef, useState } from "react";
import type { TeamRow } from "@/features/team";
import type { Task } from "../model/task-types";
import { SubtaskCreate } from "./subtask-create";
import { SubtaskRow } from "./subtask-row";

// 기능 : 저장된 부모에만 하위 목록/새 입력을 연결하고 패널 안에서 초점을 복원한다.
export function TaskSubtasks({ task, members, onUnavailable }: { task: Task | null; members: TeamRow[]; onUnavailable: () => void }) {
  const [adding, setAdding] = useState(false); const trigger = useRef<HTMLButtonElement>(null); const returnFocus = useRef(false);
  // 기능 : 입력행이 실제로 사라진 렌더 이후 살아 있는 추가 버튼으로 초점을 돌린다.
  useEffect(function restoreInputFocus() { if (!adding && returnFocus.current && trigger.current) { returnFocus.current = false; trigger.current.focus(); } }, [adding]);
  // 기능 : 입력행 종료 뒤 새 항목 추가 버튼으로 돌아간다.
  function closeInput() { returnFocus.current = true; setAdding(false); }
  return <section className="task-subtasks"><h3>Subtasks</h3>{task?.subtasks.map(child => <SubtaskRow key={child.id} child={child} members={members} onUnavailable={onUnavailable} />)}{adding && task ? <SubtaskCreate taskId={task.id} onClose={closeInput} /> : <button ref={trigger} className="task-add" type="button" disabled={!task} onClick={() => setAdding(true)}>＋ Add Subtask</button>}{!task && <p className="subtask-help">Save a task title and project before adding subtasks.</p>}</section>;
}
