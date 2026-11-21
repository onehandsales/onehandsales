// 기능 : 네트워크 없이 지연을 재현하고 취소 시 타이머와 리스너를 정리한다.
export function authDelay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise(function schedule(resolve, reject) {
    if (signal.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
    // 기능 : 취소된 작업을 메모리 저장 직전까지 진행시키지 않는다.
    function abort() { clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); }
    // 기능 : 대기 완료 시 더 이상 필요 없는 취소 리스너를 제거한다.
    function finish() { signal.removeEventListener("abort", abort); resolve(); }
    const timer = setTimeout(finish, milliseconds); signal.addEventListener("abort", abort, { once: true });
  });
}
