import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePreviewEnvironment } from "../data/preview-context";
import type { Scenario } from "../model/preview-types";

const scenarios: readonly { value: Scenario; label: string }[] = [
  { value: "normal", label: "Normal" }, { value: "slow", label: "Slow · 1.5s" },
  { value: "read-error", label: "Next read fails" }, { value: "write-error", label: "Next save fails" },
  { value: "empty", label: "Empty" }, { value: "denied", label: "Restricted" },
];

// 기능 : 제품 화면과 구분된 검증 도구에서 세션·작업공간·장애·초기화를 조작한다.
export function PreviewTools() {
  const { runtime, state } = usePreviewEnvironment();
  const navigate = useNavigate();
  // 기능 : 모든 목 상태를 초기화하고 초기화 결과를 확인할 수 있는 공통 UI 화면으로 돌아간다.
  async function handleReset() {
    // 이유 : 보호 화면의 로그인 redirect가 초기화 후 공개 이동을 덮지 않게 먼저 경계를 벗어난다.
    await navigate("/components", { replace: true, flushSync: true });
    runtime.reset();
  }
  // 기능 : 선택한 시나리오를 허용 목록에서 검증하고 새 실행 범위를 연다.
  function handleScenario(value: string) {
    const choice = scenarios.find((entry) => entry.value === value);
    if (choice) runtime.setScenario(choice.value);
  }
  // 기능 : 개발 도구의 선택값으로 가상 세션을 전환한다.
  function handleSession(value: string) {
    if (value === state.session?.id) return;
    runtime.setSession(value === "preview-a" || value === "preview-b" ? value : null);
  }
  return <details className="preview-tools">
    <summary>Preview controls</summary>
    <div className="preview-tools__body">
      <p>G01 verification only. Data resets on refresh.</p>
      <label>Session
        <select value={state.session?.id ?? "guest"} onChange={(event) => handleSession(event.currentTarget.value)}>
          <option value="guest">Guest</option><option value="preview-a">Alex · Owner</option><option value="preview-b">Blair · Member</option>
          {state.session?.id.startsWith("preview-user-") && <option value={state.session.id}>{state.session.name} · Local owner</option>}
        </select>
      </label>
      {state.session && <label>Workspace
        <select value={state.workspaceId ?? ""} onChange={(event) => runtime.setWorkspace(event.currentTarget.value)}>
          {state.session.workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
        </select>
      </label>}
      <label>Scenario
        <select value={state.scenario} onChange={(event) => handleScenario(event.currentTarget.value)}>
          {scenarios.map((scenario) => <option key={scenario.value} value={scenario.value}>{scenario.label}</option>)}
        </select>
      </label>
      <Button variant="secondary" onClick={handleReset}>Reset preview</Button>
      <small>Scenario changes discard open drafts. Read/save failures happen once, then allow retry.</small>
    </div>
  </details>;
}
