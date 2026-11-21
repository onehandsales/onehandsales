import type { Scenario } from "@/features/preview";
import { selectTemplates } from "./template-catalog";
import type { TemplateType } from "./template-catalog";

// 기능 : 공개 카탈로그 조회에 취소·일회 실패·느린 응답 시나리오를 제공한다.
export function createTemplateReader() {
  let failedRevision: number | null = null;
  // 기능 : 필터 스냅샷을 읽고 취소된 요청은 실패 소비나 결과 갱신을 하지 않는다.
  return async function readTemplates(input: { type: TemplateType; industry: string; query: string; page: number; scenario: Scenario; revision: number }, signal: AbortSignal) {
    await new Promise<void>(function delayRead(resolve, reject) {
      // 기능 : 완료 시 취소 리스너를 제거하고 현재 조회를 끝낸다.
      function finish() { signal.removeEventListener("abort", cancel); resolve(); }
      const timer = setTimeout(finish, input.scenario === "slow" ? 1500 : 80);
      // 기능 : 이전 검색의 예약 응답을 폐기한다.
      function cancel() { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); }
      if (signal.aborted) cancel(); else signal.addEventListener("abort", cancel, { once: true });
    });
    signal.throwIfAborted();
    if (input.scenario === "read-error" && failedRevision !== input.revision) { failedRevision = input.revision; throw new Error("Templates could not be loaded. Please try again."); }
    return selectTemplates(input.type, input.industry, input.query, input.page, input.scenario === "empty");
  };
}
