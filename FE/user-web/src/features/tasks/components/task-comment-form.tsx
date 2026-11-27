import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { taskInitials } from "../model/task-values";
import { useTasks } from "../hooks/use-tasks";
import { useTaskMutation } from "../hooks/use-task-mutation";

// 기능 : 댓글 입력·성공 초기화·실패 보존·중복 및 조합 입력 제출을 독립적으로 관리한다.
export function TaskCommentForm({ taskId, actorName }: { taskId: string; actorName: string }) {
  const { store, scope } = useTasks(); const mutation = useTaskMutation(); const [body, setBody] = useState(""); const composing = useRef(false); const submission = useRef(crypto.randomUUID()); const input = useRef<HTMLTextAreaElement>(null); const [focusVersion, setFocusVersion] = useState(0); const errorId = useId();
  // 기능 : 명시적 제출만 같은 작업에 추가하고 성공한 입력만 비운다.
  async function submit(event: FormEvent) {
    event.preventDefault(); if (composing.current || !body.trim() || mutation.pending) return;
    const result = await mutation.run(signal => store.addComment(scope, taskId, body, submission.current, signal));
    if (result) { setBody(""); submission.current = crypto.randomUUID(); setFocusVersion(value => value + 1); }
  }
  // 기능 : 성공·제출 취소 후 잠금이 풀린 입력으로 초점을 돌린다.
  useEffect(function restoreInputFocus() { if (focusVersion && !mutation.pending) input.current?.focus(); }, [focusVersion, mutation.pending]);
  return <form className="task-comment-form" aria-label="Add task comment" onSubmit={submit}>
    <span className="task-avatar" aria-hidden="true">{taskInitials(actorName)}</span>
    <div><textarea ref={input} aria-label="Comment body" aria-describedby={mutation.error ? errorId : undefined} placeholder="Add a comment..." maxLength={4000} value={body} disabled={mutation.pending} onChange={event => setBody(event.currentTarget.value)} onCompositionStart={event => { event.stopPropagation(); composing.current = true; }} onCompositionEnd={event => { event.stopPropagation(); composing.current = false; }} onBlur={() => { composing.current = false; }} onKeyDown={event => { if ((composing.current || event.nativeEvent.isComposing || event.keyCode === 229) && ["Enter", "Escape"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); } }} />
      <button className="task-primary" type="submit" disabled={!body.trim() || mutation.pending}>{mutation.pending ? "Adding Comment…" : "Add Comment"}</button>
      {mutation.pending && <button className="task-comment-cancel" type="button" onClick={() => { mutation.cancel(); setFocusVersion(value => value + 1); }}>Cancel comment submission</button>}
      {mutation.error && <p id={errorId} role="alert">{mutation.error}</p>}
    </div>
  </form>;
}
