import type { Scenario } from "@/features/preview";
import { useTemplateStore } from "../data/template-context";
// 기능 : 템플릿 조회·저장 장애를 개발 도구에서만 재현하고 기본 상태로 복원한다.
export function TemplateTools() { const { store, state } = useTemplateStore(); return <details className="client-tools"><summary>Template preview controls</summary><label>Template scenario<select aria-label="Template scenario" value={state.scenario} onChange={event => store.setScenario(event.currentTarget.value as Scenario)}>{["normal", "slow", "read-error", "write-error", "empty", "denied"].map(value => <option key={value}>{value}</option>)}</select></label></details>; }
