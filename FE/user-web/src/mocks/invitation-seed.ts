// 의미 : F002 10–13의 과거 협업 화면은 다른 프로젝트 Flow의 초기 상태와 독립된 작업공간 표본이다.
export const INVITATION_WORKSPACE_ID = "studio-invitation";
export const invitationRecordedOverview = {
  unbilledSeconds: 76,
  billedSeconds: 3607,
  activities: [
    { id: "recorded-complete-1", actor: "Joe Doe", action: "completed" as const, title: "Initial Chat", at: "Feb 7, 2024, 12:43:59 PM" },
    { id: "recorded-complete-2", actor: "Joe Doe", action: "completed" as const, title: "Initial Chat", at: "Feb 7, 2024, 12:43:59 PM" },
    { id: "recorded-archive", actor: "Joe Doe", action: "archived" as const, title: "Initial Chat", at: "Feb 6, 2024, 3:22:11 AM" },
  ],
};
