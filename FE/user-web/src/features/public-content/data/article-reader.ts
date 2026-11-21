import type { Scenario } from "@/features/preview";
import type { BlogCategory } from "./article-catalog";
import { selectArticles } from "./article-catalog";

// 기능 : 공개 글의 메모리 조회·지연·일회 실패를 화면 수명에 맞는 독립 공급자로 만든다.
export function createArticleReader() {
  let failedRevision: number | null = null;
  // 기능 : 취소 신호를 따르는 메모리 목록 조회로 실패 후 재시도를 제공한다.
  return async function readArticles(input: { category: BlogCategory | ""; query: string; page: number; scenario: Scenario; revision: number }, signal: AbortSignal) {
    await new Promise<void>(function waitForLocalRead(resolve, reject) {
      // 기능 : 조회 완료 시 취소 리스너를 제거한다.
      function finish() { signal.removeEventListener("abort", cancel); resolve(); }
      const timer = setTimeout(finish, input.scenario === "slow" ? 1500 : 100);
      // 기능 : 검색이나 화면이 바뀌면 타이머를 폐기해 종료된 조회를 성공시키지 않는다.
      function cancel() { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); }
      if (signal.aborted) cancel(); else signal.addEventListener("abort", cancel, { once: true });
    });
    signal.throwIfAborted();
    if (input.scenario === "read-error" && failedRevision !== input.revision) { failedRevision = input.revision; throw new Error("The articles could not be loaded. Please try again."); }
    return selectArticles(input.category, input.query, input.page, input.scenario === "empty");
  };
}
