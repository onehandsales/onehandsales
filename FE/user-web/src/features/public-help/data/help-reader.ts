import type { Scenario } from "@/features/preview";
import { selectHelpArticles } from "./help-catalog";
// 기능 : 도움말 검색에 독립적인 취소·지연·일회 실패 시나리오를 공급한다.
export function createHelpReader() {
  let failedRevision: number | null = null;
  // 기능 : 현재 검색 조건의 메모리 결과만 반환하고 이탈한 조회를 취소한다.
  return async function readHelp(input: { query: string; collectionId?: string; scenario: Scenario; revision: number }, signal: AbortSignal) {
    await new Promise<void>(function waitForHelp(resolve, reject) {
      // 기능 : 정상 완료에서 취소 리스너를 해제한다.
      function finish() { signal.removeEventListener("abort", cancel); resolve(); }
      const timer = setTimeout(finish, input.scenario === "slow" ? 1500 : 80);
      // 기능 : 이전 검색 예약을 폐기한다.
      function cancel() { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); }
      if (signal.aborted) cancel(); else signal.addEventListener("abort", cancel, { once: true });
    });
    signal.throwIfAborted();
    if (input.scenario === "read-error" && failedRevision !== input.revision) { failedRevision = input.revision; throw new Error("Help articles could not be loaded. Please try again."); }
    return selectHelpArticles(input.query, input.collectionId, input.scenario === "empty");
  };
}
