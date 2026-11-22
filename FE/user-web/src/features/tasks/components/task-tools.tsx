import type { Scenario } from "@/features/preview";
import { useTaskStore } from "../data/task-context";
// 기능 : 로컬 작업의 조회·저장 지연과 실패를 재현하고 정상으로 복원한다.
export function TaskTools() { const { store, state } = useTaskStore(); return <details className="client-tools"><summary>Task preview controls</summary><label>Task scenario<select aria-label="Task scenario" value={state.scenario} onChange={event => store.setScenario(event.currentTarget.value as Scenario)}>{[["normal", "Normal"], ["slow", "Slow"], ["read-error", "Read error once"], ["write-error", "Write error once"], ["empty", "Empty (read-only)"], ["denied", "Access denied"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></details>; }
