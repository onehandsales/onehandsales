// 기능 : 실제 요청 없이 목 지연을 만들고 취소 시 타이머와 리스너를 정리한다.
export function abortableDelay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise(function schedule(resolve, reject) {
    if (signal.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
    // 기능 : 취소된 작업이 메모리 저장까지 진행하지 못하게 한다.
    function abort() { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); }
    // 기능 : 정상 대기 종료 후 취소 구독을 정리한다.
    function finish() { signal.removeEventListener("abort", abort); resolve(); }
    const timer = setTimeout(finish, milliseconds); signal.addEventListener("abort", abort, { once: true });
  });
}
