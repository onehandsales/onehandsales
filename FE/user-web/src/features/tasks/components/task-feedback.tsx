import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTaskStore } from "../data/task-context";

// 기능 : 대상 카드가 사라진 후에도 실제 보관·삭제 결과를 알리고 살아 있는 목록으로 초점을 복구한다.
export function TaskFeedback() {
  const { state } = useTaskStore(); const result = state.lifecycle; const [dismissed, setDismissed] = useState<number>(); const seen = useRef(result?.sequence);
  // 기능 : 사라진 트리거의 초점만 목록이나 본문으로 옮기며 다른 화면의 사용자 초점은 건드리지 않는다.
  useEffect(function restoreRemovedFocus() {
    if (!result || seen.current === result.sequence) return; seen.current = result.sequence;
    const frame = requestAnimationFrame(function focusSurvivor() { if (document.activeElement === document.body) document.querySelector<HTMLElement>(".task-board, #main-content")?.focus({ preventScroll: true }); });
    return function cleanup() { cancelAnimationFrame(frame); };
  }, [result]);
  if (!result || dismissed === result.sequence) return null;
  return <div className="task-feedback" role="status"><CheckCircle2 size={17} color="#55aa2d" /><span>Your task has been {result.action === "archive" ? "archived" : "deleted"}.</span><button type="button" aria-label="Dismiss task message" onClick={() => setDismissed(result.sequence)}>×</button></div>;
}
