import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { MoreHorizontal } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { usePreviewEnvironment } from "@/features/preview";
import { useTasks } from "../hooks/use-tasks";
import { useTaskMutation } from "../hooks/use-task-mutation";
import type { Task, TaskLifecycleAction } from "../model/task-types";

// 기능 : 카드·패널의 같은 작업 메뉴에서 보관과 확인 후 삭제를 구분하고 취소·중복·초점을 관리한다.
export function TaskActions({ task, label = "Task actions" }: { task: Task; label?: string }) {
  const query = useTasks(); const mutation = useTaskMutation(); const { state: preview } = usePreviewEnvironment();
  const [open, setOpen] = useState(false); const [confirming, setConfirming] = useState(false); const [information, setInformation] = useState(""); const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const allowed = preview.session?.role === "owner";
  const url = new URL(window.location.href); url.searchParams.set("task", task.id);
  // 기능 : 메뉴를 닫으며 진행 중인 보관을 취소하고 원래 제어로 복귀한다.
  function closeMenu() { mutation.cancel(); setOpen(false); trigger.current?.focus(); }
  const closeRef = useRef(closeMenu);
  // 기능 : 전역 메뉴 이벤트에는 최신 취소 함수를 전달하되 입력마다 메뉴 초점을 재설정하지 않는다.
  useEffect(function updateClose() { closeRef.current = closeMenu; });
  // 기능 : 삭제 확인을 취소해 저장 원본과 대상 ID를 유지한다.
  function cancelDelete() { mutation.cancel(); setConfirming(false); }
  // 기능 : 살아 있는 대상의 revision만 저장하고 실패 시 같은 대상·확인 상태를 유지한다.
  function perform(action: TaskLifecycleAction) { void mutation.run(async signal => { await query.store.remove(query.scope, task.id, task.revision, action, signal); return true; }); }
  // 기능 : 원본에 있는 삭제는 별도 확인 모달로 열고 보관과 혼동하지 않게 한다.
  function askDelete() { closeMenu(); setConfirming(true); }
  // 기능 : 원본 미확인 기능은 실제 성공을 만들지 않고 로컬 안내만 연다.
  function explain(title: string) { closeMenu(); setCopied(false); setInformation(title); }
  // 기능 : 외부 서비스 없이 현재 작업의 로컬 URL만 클립보드에 복사한다.
  async function copyLink() { try { await navigator.clipboard.writeText(url.href); setCopied(true); } catch { setCopied(false); } }
  // 기능 : 메뉴 첫 항목·바깥 클릭과 컴포넌트 수명을 연결한다.
  useEffect(function bindMenu() {
    if (!open) return; root.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    // 기능 : 메뉴 바깥을 누르면 진행 중인 보관을 취소하고 메뉴만 닫는다.
    function outside(event: PointerEvent) { if (event.target instanceof Node && !root.current?.contains(event.target)) closeRef.current(); }
    document.addEventListener("pointerdown", outside);
    return function cleanup() { document.removeEventListener("pointerdown", outside); };
  }, [open]);
  // 기능 : 키보드 탐색·Escape를 메뉴 안에서 처리해 부모 패널의 의도치 않은 닫힘을 막는다.
  function keydown(event: KeyboardEvent) {
    if (!open) return;
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeMenu(); }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); const buttons = [...root.current!.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')]; const index = buttons.indexOf(document.activeElement as HTMLButtonElement); buttons[event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length]?.focus(); }
  }
  return <div className="task-actions" ref={root} onKeyDown={keydown}><button type="button" ref={trigger} aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => open ? closeMenu() : setOpen(true)}><MoreHorizontal size={20} /></button>
    {open && <div className="task-action-menu" role="menu" aria-label="Task actions menu">
      <button role="menuitem" type="button" onClick={() => explain("Following tasks")}>Unfollow</button>
      <button role="menuitem" type="button" onClick={() => explain("Copy Link")}>Copy Link</button>
      <button role="menuitem" type="button" aria-disabled={!allowed || mutation.pending} onClick={() => { if (allowed && !mutation.pending) perform("archive"); }}>{mutation.pending ? "Archiving…" : "Archive"}</button>
      <button role="menuitem" type="button" aria-disabled={!allowed || mutation.pending} onClick={() => { if (allowed && !mutation.pending) askDelete(); }}>Delete</button>
      {!allowed && <p className="task-permission-note">Only the workspace owner can archive or delete tasks in this preview.</p>}
      {mutation.error && <p role="alert">{mutation.error}</p>}{mutation.pending && <button type="button" onClick={closeMenu}>Cancel archive</button>}
    </div>}
    {confirming && <Dialog className="task-delete-dialog" title="Confirm Deletion" onClose={cancelDelete}><p>Are you sure you want to permanently delete this task?</p><p className="task-delete-target sr-only">{task.title}</p>{mutation.error && <p role="alert">{mutation.error}</p>}<button className="task-delete-confirm" type="button" disabled={mutation.pending} onClick={() => perform("delete")}>{mutation.pending ? "Deleting…" : "Delete Task"}</button>{mutation.pending && <button type="button" className="task-delete-cancel" onClick={cancelDelete}>Cancel deletion</button>}</Dialog>}
    {information && <Dialog title={information} onClose={() => setInformation("")}>{information === "Copy Link" ? <><label>Local task URL<input readOnly value={url.href} onFocus={event => event.currentTarget.select()} /></label><button type="button" onClick={() => void copyLink()}>Copy local link</button><p role="status">{copied ? "Local link copied." : "Copy the local URL. No external link is opened."}</p></> : <p>{information === "Task permissions" ? "Only the workspace owner can archive or delete tasks in this preview." : "Following and notifications are not available in this preview."}</p>}<button type="button" onClick={() => setInformation("")}>Return to task</button></Dialog>}
  </div>;
}
