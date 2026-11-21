import { useEffect, useRef, useState } from "react";
import { usePreviewEnvironment } from "@/features/preview";
import { useHelpExperience } from "../data/help-context";
import type { HelpReaction } from "../data/help-context";
// 기능 : 피드백의 최신 선택·실패·재시도·취소를 기사 수명 안에서만 처리한다.
export function useHelpFeedback(id: string) {
  const { state } = usePreviewEnvironment(); const { reactions, save } = useHelpExperience();
  const [choice, setChoice] = useState<HelpReaction | undefined>(reactions[id]); const [status, setStatus] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const token = useRef(0); const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const pending = useRef<HelpReaction | null>(null); const failed = useRef(false);
  // 기능 : 다른 기사·범위로 이동하면 늦은 응답을 무효화한다.
  useEffect(function registerFeedbackLifetime() { return () => { token.current += 1; if (timer.current) clearTimeout(timer.current); }; }, [id, state.revision]);
  // 기능 : 빠른 재선택은 이전 예약을 취소하고 마지막 선택만 저장한다.
  function submit(value: HelpReaction) {
    if (pending.current === value) return;
    if (timer.current) clearTimeout(timer.current);
    const operation = ++token.current; pending.current = value; setChoice(value); setStatus("pending");
    // 기능 : 실패는 선택을 보존하며 성공만 방문 메모리에 반영한다.
    function finish() {
      if (token.current !== operation) return; pending.current = null;
      if (state.scenario === "write-error" && !failed.current) { failed.current = true; setStatus("error"); return; }
      save(id, value); setStatus("saved");
    }
    timer.current = setTimeout(finish, state.scenario === "slow" ? 1500 : 100);
  }
  // 기능 : 미완료 선택을 취소하고 마지막으로 저장한 표시로 돌아간다.
  function cancel() { token.current += 1; if (timer.current) clearTimeout(timer.current); pending.current = null; setChoice(reactions[id]); setStatus("idle"); }
  return { choice, status, submit, cancel };
}
