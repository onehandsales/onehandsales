import { useCompanySetup } from "@/features/company-setup/data/company-context";
import type { SettingsScenario } from "../model/settings-types";
// 기능 : 재현용 회사 시나리오를 제품 폼 밖에서 선택한다.
export function CompanyTools() { const { store, state } = useCompanySetup(); return <details className="company-tools"><summary>Local company controls</summary><label>Company scenario<select value={state.settingsScenario} onChange={event => store.setSettingsScenario(event.target.value as SettingsScenario)}>{["normal", "slow", "save-error", "read-error", "empty", "denied", "logo-error"].map(value => <option key={value}>{value}</option>)}</select></label><p>Memory only. Owner edits; members view. Refresh and Reset restore fixtures. File limit: PNG/JPEG/WebP, 2 MB. These are local assumptions.</p></details>; }
