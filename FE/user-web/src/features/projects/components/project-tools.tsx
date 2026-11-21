import type { Scenario } from "@/features/preview";
import { useProjectStore } from "../data/project-context";
// 기능 : 프로젝트 목 조회/저장 장애를 실제 API 없이 재현하고 정상 복귀를 제공한다.
export function ProjectTools() { const { state, store } = useProjectStore(); return <details className="client-tools"><summary>Project preview controls</summary><label>Project scenario<select aria-label="Project scenario" value={state.scenario} onChange={event => store.setScenario(event.currentTarget.value as Scenario)}>{[["normal", "Normal"], ["slow", "Slow"], ["read-error", "Read error once"], ["write-error", "Write error once"], ["empty", "Empty (read-only)"], ["denied", "Access denied"]].map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></details>; }
