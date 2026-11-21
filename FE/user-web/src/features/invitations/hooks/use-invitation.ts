import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMockAuth } from "@/features/mock-auth";
import { usePreviewEnvironment } from "@/features/preview";
import { useTeamStore } from "@/features/team";
import { useTeamAction } from "@/features/team";
import type { TeamRow } from "@/features/team";
// 기능 : 초대 입력과 중복 제출·실패 후 보존·취소 수명을 페이지에서 분리한다.
export function useInvitation(target: TeamRow | null) {
  const { store: auth, state: authState } = useMockAuth(); const { store: team, state: teamState } = useTeamStore(); const { state } = usePreviewEnvironment(); const navigate = useNavigate();
  const [name, setName] = useState(""); const [password, setPassword] = useState(""); const action = useTeamAction();
  // 기능 : 계정·초대·시나리오 전환은 입력을 비우되 자신의 수락 성공에 뒤따르는 이동 콜백은 유지한다.
  useEffect(function clearDraft() { setName(""); setPassword(""); }, [state.revision, target?.id, teamState.scenario, authState.scenario]);
  // 기능 : 초대 자체의 시나리오·대상이 바뀌면 진행 수락을 취소해 만료 전 요청이 되살아나지 않게 한다.
  useEffect(function cancelInvitationScenario() { return action.cancel; }, [teamState.scenario, target?.id, action.cancel]);
  const account = state.session ? auth.getAccount(state.session.id) : undefined;
  const matches = account?.email.toLowerCase() === target?.email.toLowerCase();
  // 기능 : 저장 직전 같은 초대 revision을 재확인하고 성공한 경우에만 허용 프로젝트로 이동한다.
  function accept() {
    if (!target) return;
    // 기능 : 입력 snapshot과 취소 신호를 인증 검증에 전달한다.
    async function saveInvitation(signal: AbortSignal) {
      // 기능 : 인증 성공 직전에 같은 팀 초대만 수락한다.
      function claimInvite(acceptedName: string) { return team.accept(target!, acceptedName); }
      await auth.acceptInvitation({ target: target!, name, password }, state.revision, signal, claimInvite);
    }
    // 기능 : 성공한 수락 이력을 허용된 프로젝트 화면으로 교체한다.
    function openProjects() { const projectId = target!.projectIds[0]; void navigate(projectId ? `/app/projects/${encodeURIComponent(projectId)}` : "/app/projects", { replace: true, state: { invitationAccepted: target!.id } }); }
    void action.run(saveInvitation, openProjects);
  }
  // 기능 : 다른 계정을 종료해도 현재 초대 URL을 유지하며 실패할 때 현재 세션을 보존한다.
  function signOut() {
    // 기능 : 로그아웃 성공 뒤 이전 계정의 비밀번호와 오류를 비운다.
    function cleared() { setPassword(""); action.setError(""); }
    void action.run(signal => auth.logout(state.revision, signal), cleared);
  }
  // 기능 : 명시적 취소는 탐색 완료를 기다리지 않고 입력과 지연 수락을 폐기한다.
  function cancel() { action.cancel(); setName(""); setPassword(""); }
  return { name, setName, password, setPassword, account, matches, accept, signOut, ...action, cancel };
}
