import { Button } from "./button";

// 기능 : 로딩·빈 상태·오류 문구와 재시도 행동을 업무 중립적으로 표시한다.
export function StatusPanel({ title, message, onRetry }: { title: string; message?: string; onRetry?: () => void }) {
  return <section className="status-panel" aria-live="polite">
    <h2>{title}</h2>{message && <p>{message}</p>}
    {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
  </section>;
}
