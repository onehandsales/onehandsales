import type { Scenario } from "@/features/preview";
import { useClientStore } from "../data/client-context";
// 기능 : 개발용 고객 조회·저장 장애만 명시적으로 선택하고 저장 데이터와 구분한다.
export function ClientTools() { const { store, state } = useClientStore(); return <details className="client-tools"><summary>Client preview controls</summary><label>Client scenario<select value={state.scenario} onChange={event => store.setScenario(event.currentTarget.value as Scenario)}>{["normal", "slow", "read-error", "write-error", "empty", "denied"].map(value => <option key={value} value={value}>{value}</option>)}</select></label><p>Local memory only. Refresh resets data; signing out preserves saved clients in this tab.</p></details>; }
