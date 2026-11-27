import { useEffect, useId, useRef, useState } from "react";
import { useTasks } from "../hooks/use-tasks";
import { useTaskMutation } from "../hooks/use-task-mutation";

// 기능 : Save 이전의 새 하위 입력을 원본과 분리하고 실패·취소·중복 제출을 처리한다.
export function SubtaskCreate({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const query = useTasks(); const action = useTaskMutation(); const [title, setTitle] = useState(""); const input = useRef<HTMLInputElement>(null); const submissionId = useRef(crypto.randomUUID()); const composing = useRef(false);
  const errorId = useId(); const invalid = !!action.error && !title.trim();
  // 기능 : 검증 오류 뒤 제목을 바로 수정할 수 있게 초점을 복귀한다.
  useEffect(function focusInvalid() { if (invalid) input.current?.focus(); }, [invalid]);
  // 기능 : 새 행 진입 시 제목 입력으로 키보드 초점을 옮긴다.
  useEffect(function focusInput() { input.current?.focus(); }, []);
  // 기능 : 명시적 Save 성공 뒤에만 새 입력행을 닫고 같은 부모 목록에 반영한다.
  async function save() { if (composing.current) return; const child = await action.run(signal => query.store.addSubtask(query.scope, taskId, title, submissionId.current, signal)); if (child) onClose(); }
  // 기능 : 새 입력 취소는 진행 요청과 미저장 제목만 폐기한다.
  function cancel() { action.cancel(); onClose(); }
  return <div className="subtask-create" onKeyDown={event => { if ((composing.current || event.nativeEvent.isComposing || event.keyCode === 229) && ["Enter", "Escape"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); return; } if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancel(); } }}>
    <form className="subtask-input-row" onSubmit={event => { event.preventDefault(); void save(); }}><span className="subtask-empty-check" aria-hidden="true" /><input ref={input} aria-invalid={invalid || undefined} aria-describedby={action.error ? errorId : undefined} aria-label="New subtask title" placeholder="Enter your subtask..." maxLength={200} value={title} disabled={action.pending} onChange={event => setTitle(event.currentTarget.value)} onBlur={() => { composing.current = false; }} onCompositionStart={event => { event.stopPropagation(); composing.current = true; }} onCompositionEnd={event => { event.stopPropagation(); composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || composing.current || event.keyCode === 229)) event.preventDefault(); }} /><button type="submit" disabled={action.pending}>{action.pending ? "Saving…" : "Save"}</button></form>
    <button type="button" className="subtask-cancel" onClick={cancel}>Cancel subtask</button>{action.error && <p id={errorId} role="alert" className="subtask-error">{action.error}</p>}
  </div>;
}
