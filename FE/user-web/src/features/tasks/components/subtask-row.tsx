import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { TeamRow } from "@/features/team";
import type { Subtask, SubtaskPatch } from "../model/task-types";
import { useTasks } from "../hooks/use-tasks";
import { useTaskMutation } from "../hooks/use-task-mutation";
import { TaskAssigneePicker } from "./task-assignee-picker";

// 기능 : 하위 제목·완료·담당자를 독립 patch로 저장하고 완료된 행의 편집도 유지한다.
export function SubtaskRow({ child, members, onUnavailable }: { child: Subtask; members: TeamRow[]; onUnavailable: () => void }) {
  const query = useTasks(); const action = useTaskMutation(); const [title, setTitle] = useState(child.title); const dirty = useRef(false); const base = useRef(child.revision); const composing = useRef(false); const last = useRef<{ patch: SubtaskPatch; revision: number } | null>(null);
  // 기능 : 편집 중이 아닌 제목만 최신 저장값으로 동기화한다.
  useEffect(function followSaved() { if (!dirty.current) { setTitle(child.title); base.current = child.revision; } }, [child.title, child.revision]);
  // 기능 : 최신 하위 항목을 접근 검증된 부모 원본에서 찾는다.
  function current() { return query.store.current(query.scope, child.parentTaskId)?.subtasks.find(row => row.id === child.id); }
  // 기능 : 오류 재시도는 같은 의도와 revision을 유지해 충돌을 조용히 덮지 않는다.
  async function save(patch: SubtaskPatch, revision = current()?.revision ?? child.revision) { last.current = { patch, revision }; const result = await action.run(signal => query.store.editSubtask(query.scope, child.parentTaskId, child.id, revision, patch, signal)); if (result && patch.title !== undefined) { dirty.current = false; setTitle(result.title); base.current = result.revision; } }
  // 기능 : 제목 확정은 입력을 시작한 revision으로 저장하며 미변경 입력은 제출하지 않는다.
  function commitTitle() { if (!dirty.current || composing.current) return; void save({ title }, base.current); }
  // 기능 : 미저장 제목/진행 변경을 취소하고 최신 저장값으로 명시적으로 돌아간다.
  function reload() { action.cancel(); dirty.current = false; const saved = current(); if (saved) { setTitle(saved.title); base.current = saved.revision; } }
  return <div data-subtask-id={child.id} className={`subtask-item${child.completed ? " is-complete" : ""}`}>
    <div className="subtask-row"><input type="checkbox" aria-label={`Complete subtask ${child.title}`} checked={child.completed} disabled={action.pending} onChange={event => void save({ completed: event.currentTarget.checked })} /><input className="subtask-title" aria-label={`Subtask title ${child.title}`} value={title} maxLength={200} disabled={action.pending} onFocus={() => { if (!dirty.current) base.current = current()?.revision ?? child.revision; }} onChange={event => { dirty.current = true; setTitle(event.currentTarget.value); }} onBlur={commitTitle} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.nativeEvent.isComposing || composing.current || event.keyCode === 229) return; if (event.key === "Enter") { event.preventDefault(); commitTitle(); } if (event.key === "Escape" && (dirty.current || action.pending || action.error)) { event.preventDefault(); event.stopPropagation(); reload(); } }} />
      <TaskAssigneePicker compact members={members} value={child.assigneeId} disabled={action.pending} label={`Assignee for ${child.title}`} onChange={assigneeId => void save({ assigneeId })} /><button type="button" className="subtask-delete" aria-label={`Delete subtask ${child.title}`} onClick={onUnavailable}><Trash2 size={18} /></button>
    </div>{action.pending && <p className="subtask-save-state" role="status">Saving subtask…</p>}{action.error && <div className="subtask-error" role="alert"><p>{action.error}</p><button onClick={() => { if (last.current) void save(last.current.patch, last.current.revision); }}>Retry subtask change</button><button onClick={reload}>Reload saved subtask</button></div>}
  </div>;
}
