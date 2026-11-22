import { useRef, useState } from "react";
import type { DragEvent, KeyboardEvent, FocusEvent } from "react";
import { GripVertical, Plus } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { usePreviewEnvironment } from "@/features/preview";
import { useTasks } from "../hooks/use-tasks";
import { useTaskMutation } from "../hooks/use-task-mutation";
import { taskStatusPalette, taskStatusStyle } from "../model/task-status-values";
import type { TaskStatus, TaskStatusDefinition } from "../model/task-types";

// 기능 : 원본 상태 정의 모달에서 이름·팔레트·순서를 저장하고 실패 초안과 취소 수명을 분리한다.
export function TaskStatusSettingsDialog({ onClose }: { onClose: () => void }) {
  const query = useTasks(); const { state: preview } = usePreviewEnvironment(); const mutation = useTaskMutation();
  const [snapshot, setSnapshot] = useState(() => query.store.statuses(query.scope));
  const [draft, setDraft] = useState(snapshot.items); const [editing, setEditing] = useState<TaskStatus | null>(null);
  const [notice, setNotice] = useState(""); const [unavailable, setUnavailable] = useState(false); const dragging = useRef<TaskStatus | null>(null); const composing = useRef(false);
  const allowed = preview.session?.role === "owner"; const locked = mutation.pending || !allowed;
  // 기능 : 한 정의 snapshot만 확정하고 성공 후에도 작업 자체의 상태와 과거 활동은 유지한다.
  async function save(items = draft) {
    if (locked || composing.current || JSON.stringify(items) === JSON.stringify(snapshot.items)) return;
    const result = await mutation.run(signal => query.store.saveStatuses(query.scope, snapshot.revision, items, signal));
    if (result) { setSnapshot(result); setDraft(result.items); setNotice("Task status updated successfully."); }
  }
  // 기능 : 입력 중인 표시명만 바꾸며 아직 저장하지 않은 이름을 원본과 분리한다.
  function rename(id: TaskStatus, name: string) { setDraft(items => items.map(item => item.id === id ? { ...item, name } : item)); }
  // 기능 : 색 선택과 현재 이름을 같은 snapshot으로 저장해 서로 덮는 저장 경합을 막는다.
  function color(id: TaskStatus, value: string) { if (locked) return; const next = draft.map(item => item.id === id ? { ...item, color: value } : item); setDraft(next); void save(next); }
  // 기능 : Done을 고정한 두 일반 상태의 순서를 바꾸되 작업 ID와 완료 의미를 유지한다.
  function reorder(id: TaskStatus) { if (locked || id === "Done") return; const next = [draft[1]!, draft[0]!, draft[2]!]; setDraft(next); void save(next); }
  // 기능 : 드래그 대상이 다른 일반 상태일 때만 순서를 교체한다.
  function drop(event: DragEvent, target: TaskStatus) { event.preventDefault(); const id = dragging.current; dragging.current = null; if (id && id !== target && target !== "Done") reorder(id); }
  // 기능 : 키보드 순서 변경과 조합 중 Enter 무시·편집 취소를 명시적으로 처리한다.
  function keydown(event: KeyboardEvent, item: TaskStatusDefinition) {
    if (event.nativeEvent.isComposing || composing.current || event.keyCode === 229) return;
    if (event.key === "Escape" && editing) { event.preventDefault(); event.stopPropagation(); mutation.cancel(); setDraft(query.store.statuses(query.scope).items); setSnapshot(query.store.statuses(query.scope)); setEditing(null); }
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); void save(); setEditing(null); }
    if (event.altKey && ["ArrowUp", "ArrowDown"].includes(event.key) && item.id !== "Done") { event.preventDefault(); reorder(item.id); }
  }
  // 기능 : 같은 편집 행 밖으로 초점을 옮길 때만 이름을 확정하고 팔레트를 닫는다.
  function blur(event: FocusEvent<HTMLInputElement>) { if (!event.currentTarget.parentElement?.parentElement?.contains(event.relatedTarget)) { void save(); setEditing(null); } }
  // 기능 : 충돌 후 사용자 선택으로만 최신 정의를 불러와 편집 초안을 교체한다.
  function reload() { mutation.cancel(); const next = query.store.statuses(query.scope); setSnapshot(next); setDraft(next.items); setEditing(null); }
  // 기능 : 모달 이탈은 진행 저장과 미저장 초안을 폐기하며 성공한 저장은 유지한다.
  function close() { mutation.cancel(); onClose(); }
  return <Dialog title="Status Settings" className="task-status-dialog" onClose={close}><div className="task-status-definitions">
    {!allowed && <p role="status">Only the workspace owner can edit these settings in this preview.</p>}
    {draft.map(item => <div key={item.id} className={`task-definition${item.id === "Done" ? " is-done" : ""}`} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, item.id)} onKeyDown={event => keydown(event, item)}>
      {item.id !== "Done" && <button type="button" className="task-definition-grip" aria-label={`Reorder ${item.name}`} title="Move status (Alt + Arrow Up/Down)" draggable={!locked} disabled={locked} onDragStart={() => { dragging.current = item.id; }} onDragEnd={() => { dragging.current = null; }} onClick={() => reorder(item.id)}><GripVertical size={15} /></button>}
      <div className="task-definition-input" style={taskStatusStyle(item)}><span aria-hidden="true" /><input aria-label={`Status name ${item.id}`} value={item.name} maxLength={40} disabled={locked} onFocus={() => setEditing(item.id)} onChange={event => rename(item.id, event.currentTarget.value)} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onBlur={blur} /></div>
      {editing === item.id && <div className="task-status-palette" role="group" aria-label={`Color for ${item.name}`}>{taskStatusPalette.map((value, index) => <button key={value} type="button" aria-label={`Color ${index + 1}`} aria-pressed={item.color === value} disabled={locked} style={{ backgroundColor: value }} onPointerDown={event => event.preventDefault()} onClick={() => color(item.id, value)} />)}</div>}
      {item.id === draft[1]?.id && <button type="button" className="task-add-status" onClick={() => setUnavailable(true)}><Plus size={18} />Add Status</button>}
    </div>)}
    {mutation.pending && <p role="status">Saving status settings…</p>}
    {mutation.error && <div role="alert"><p>{mutation.error}</p><button type="button" disabled={mutation.pending} onClick={() => void save()}>Retry status save</button><button type="button" onClick={reload}>Reload saved statuses</button></div>}
  </div>{notice && <div className="task-feedback" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss status message" onClick={() => setNotice("")}>×</button></div>}
    {unavailable && <Dialog title="Add Status" onClose={() => setUnavailable(false)}><p>Adding or deleting status definitions is not available in this preview. Existing tasks and statuses remain unchanged.</p><button type="button" onClick={() => setUnavailable(false)}>Return to status settings</button></Dialog>}
  </Dialog>;
}
