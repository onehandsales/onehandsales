import { useEffect, useRef, useState } from "react";
import { usePreviewEnvironment } from "@/features/preview";
import { useTemplateStore } from "../data/template-context";
// 기능 : 템플릿 변경의 중복 제출과 취소·문맥 이탈을 막고 실패 후 초안을 유지한다.
export function useTemplateMutation() {
  const { state: preview } = usePreviewEnvironment(); const { state } = useTemplateStore();
  const request = useRef<AbortController | null>(null); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  // 기능 : 시작한 요청의 결과만 전달하고 실패 안내를 재시도 중에도 유지한다.
  async function run<T>(operation: (signal: AbortSignal) => Promise<T>): Promise<T | undefined> {
    if (request.current) return; const controller = new AbortController(); request.current = controller; setPending(true);
    try { const result = await operation(controller.signal); if (!controller.signal.aborted && request.current === controller) { setError(""); return result; } }
    catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Unable to save. Please try again."); }
    finally { if (request.current === controller) { request.current = null; setPending(false); } }
  }
  // 기능 : 진행 변경만 취소해 이미 저장한 원본과 입력 초안을 유지한다.
  function cancel() { request.current?.abort(); request.current = null; setPending(false); setError(""); }
  // 기능 : 편집기·가상 계정·workspace·장애 문맥을 넘는 요청을 중단한다.
  useEffect(function bindLifetime() { setPending(false); setError(""); return function cleanup() { request.current?.abort(); request.current = null; }; }, [preview.revision, state.scenario]);
  return { run, cancel, pending, error };
}
