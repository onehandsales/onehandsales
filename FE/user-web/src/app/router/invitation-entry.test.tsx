import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle } = setupPreviewApp("/app/settings/team");
const workspace = "studio-invitation";
const invitation = `/invite/${workspace}/${workspace}%3Ainvite-jon`;
const project = `/app/projects/${workspace}%3Ateam-project-2`;
const submit = '.invitation-fields button[type="submit"]';
// 기능 : 소유자 도구에서 원본 초대 표본을 선택하고 실제 팀 링크로 진입한다.
async function openInvitation() {
  await navigate("/components"); await choose(".preview-tools label:nth-of-type(2) select", workspace);
  await navigate("/app/settings/team"); await settle();
  await click(`.team-tools a[href="${invitation}"]`);
  expect(element(".invitation-fields h2").textContent).toBe("Invitation email does not match");
  await click(".invitation-fields .invitation-primary"); await settle();
}
// 기능 : 초대 전용 입력에 가상 계정 이름과 비밀번호를 전달한다.
async function fillInvitation() { await input("#invited-name", "Jon Smith"); await input("#invited-password", "PreviewOnly123!"); }
// 기능 : 같은 앱 저장소에서 소유자로 돌아가 수락 또는 취소의 팀 결과를 확인한다.
async function returnOwner() {
  await navigate("/components"); await choose(".preview-tools label:first-of-type select", "preview-a");
  await choose(".preview-tools label:nth-of-type(2) select", workspace); await navigate("/app/settings/team"); await settle();
}
// 기능 : G17 발송 상태와 F002 수락 이후의 화면을 실제 라우터와 저장소로 연결한다.
describe("G18 invitation journeys", () => {
  // 기능 : 과거 기록을 수락 결과로 만들지 않고 같은 팀·작업·프로젝트를 역할에 따라 표시한다.
  it("accepts once and preserves recorded project history, task state and assigned access", async () => {
    await navigate("/components"); await choose(".preview-tools label:nth-of-type(2) select", workspace);
    await navigate(project); await settle();
    const history = element(".collaboration-activity").textContent;
    expect(document.querySelectorAll(".collaboration-activity li")).toHaveLength(3);
    await navigate("/app/settings/team"); await settle(); await click(`.team-tools a[href="${invitation}"]`);
    await click(".invitation-fields .invitation-primary"); await settle();
    expect(document.querySelector('input[type="email"]')).toBeNull(); expect(document.querySelector(".auth-captcha")).toBeNull();
    expect(element(".invitation-target").textContent).toContain("jon@example.test");
    await fillInvitation(); expect(element(".invitation-avatar span").textContent).toBe("JS");
    await click(submit); await click(submit); await settle(); await settle();
    expect(window.location.pathname).toBe(project); expect(element(".collaboration-notice").textContent).toContain("password was set");
    expect(element(".collaboration-activity").textContent).toBe(history);
    expect(element(".collaboration-time").textContent).toContain("00:01:16"); expect(element(".collaboration-time").textContent).toContain("01:00:07");
    expect(Array.from(document.querySelectorAll(".collaboration-people span"), node => node.textContent)).toEqual(["JS", "JS", "JD"]);
    await click('.collaboration-heading nav button:nth-child(2)'); await settle();
    expect(document.querySelectorAll(".task-card")).toHaveLength(1);
    expect(element('.task-board section[aria-label="Done"] .task-card').textContent).toContain("Initial Chat");
    expect(element(".task-card .task-overdue").textContent).toContain("Feb 06"); expect(element(".task-card .task-avatar").textContent).toBe("JD");
    await click('.collaboration-heading nav button:nth-child(3)'); expect(element(".project-time-layout").textContent).toContain("01:00:07");
    await click('.app-sidebar a[href="/app/tasks"]'); await settle();
    expect(document.querySelectorAll(".task-card")).toHaveLength(1); expect(element(".task-card").textContent).toContain("Design Project with Doe Studio"); expect(document.querySelector(".task-template-link")).toBeNull();
    await navigate("/app/projects"); await settle(); expect(document.querySelectorAll(".collaboration-table-region tbody tr")).toHaveLength(1);
    expect(element(".collaboration-table-region tbody").textContent).toContain("Doe Company"); expect(element(".collaboration-date").textContent).toBe("Feb 6, 2024");
    await input('[aria-label="Search projects"]', "missing"); expect(element('.collaboration-list [role="status"]').textContent).toBe("No matching projects.");
    await input('[aria-label="Search projects"]', ""); await click(".collaboration-filters>button");
    await navigate("/app/projects?visit=again"); expect(document.querySelector("dialog")).toBeNull();
    await click(".auth-account>button"); expect(Array.from(element('nav[aria-label="Account menu"]').children, node => node.textContent)).toEqual(["Help Center", "Settings", "Logout"]);
    for (const path of ["/app/settings/company", "/app/settings/team", "/app/invoices"]) { await navigate(path); expect(element("h1").textContent).toBe("Workspace access restricted"); expect(element("#main-content").tabIndex).toBe(-1); }
    await navigate(`/app/projects/${workspace}%3Ateam-project-1`); await settle(); expect(element("h1").textContent).toBe("Project unavailable");
    await navigate(invitation); expect(element(".invitation-unavailable h2").textContent).toBe("Invitation already accepted");
    await returnOwner(); expect(element(`[data-team-id="${workspace}:invite-jon"]`).textContent).not.toContain("Invite Pending");
    expect(document.querySelectorAll(".team-table tbody tr")).toHaveLength(5);
    await navigate(project); await settle(); expect(element(".collaboration-activity").textContent).toBe(history);
    await navigate("/components"); await choose(".preview-tools label:nth-of-type(2) select", "studio-a"); await navigate("/app/tasks"); await settle();
    expect(document.querySelectorAll(".task-card")).toHaveLength(3); expect(element(".task-template-link")).toBeTruthy();
  }, 15000);
  // 기능 : 같은 경로 이력·명시 취소·만료 전환은 지연 수락과 계정 생성을 중단한다.
  it("cancels late acceptance on same-path history, explicit cancel and expiration", async () => {
    await openInvitation(); await choose(".auth-tools select", "slow"); await fillInvitation();
    await click('.invitation-avatar button'); await click(submit); await navigate(invitation); await settle(1600);
    expect(element<HTMLInputElement>("#invited-name").value).toBe(""); expect(element<HTMLInputElement>("#invited-password").value).toBe("");
    expect(element('.invitation-avatar button').getAttribute("aria-label")).toBe("Remove profile initials"); expect(element<HTMLButtonElement>(submit).disabled).toBe(false);
    await fillInvitation(); await click(submit); await click('.invitation-alternatives a:last-child'); await settle(1600);
    expect(window.location.pathname).toBe("/"); await navigate(invitation); expect(element("#invited-name")).toBeTruthy();
    await fillInvitation(); await click(submit); await choose(".invitation-tools>label select", "expired"); await settle(1600);
    expect(element(".invitation-unavailable h2").textContent).toBe("Invitation expired");
    await choose(".invitation-tools>label select", "normal"); expect(element<HTMLInputElement>("#invited-name").value).toBe("");
    await returnOwner(); expect(element(`[data-team-id="${workspace}:invite-jon"]`).textContent).toContain("Invite Pending");
  }, 15000);
  // 기능 : 조합 중 제출을 막고 실패 후 같은 입력으로 재시도하되 시나리오 변경은 이전 요청을 폐기한다.
  it("guards composition and retries one failed acceptance without losing draft input", async () => {
    await openInvitation(); await choose(".auth-tools select", "fail-once"); await fillInvitation();
    await act(async () => { element("#invited-name").dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); element("form.invitation-fields").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
    await settle(); expect(element<HTMLButtonElement>(submit).disabled).toBe(false); expect(document.querySelector("#invitation-error")).toBeNull();
    await act(async () => element("#invited-name").dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    await click(submit); await settle(); expect(element("#invitation-error").textContent).toContain("failed");
    expect(element<HTMLInputElement>("#invited-name").value).toBe("Jon Smith"); expect(element<HTMLInputElement>("#invited-password").value).toBe("PreviewOnly123!");
    await choose(".auth-tools select", "slow"); await fillInvitation(); await click(submit); await choose(".auth-tools select", "normal"); await settle(1600);
    expect(element<HTMLInputElement>("#invited-name").value).toBe(""); expect(element<HTMLButtonElement>(submit).disabled).toBe(false);
    await fillInvitation(); await click(submit); await settle(); await settle(); expect(window.location.pathname).toBe(project);
    await returnOwner(); expect(document.querySelectorAll(`[data-team-id="${workspace}:invite-jon"]`)).toHaveLength(1);
  }, 15000);
  // 기능 : 기존 계정은 일반 가입을 거치지 않고 로그인 후 동일 초대 URL로 복귀한다.
  it("returns an existing account from login to its invitation without general signup", async () => {
    await click(".team-heading a"); await input('#team-invite-form input[type="email"]', "blair@example.test");
    await choose("#team-invite-form select", "Collaborator"); await click(".team-project-trigger"); await click(".team-project-options label:nth-of-type(2) input");
    await click('[form="team-invite-form"]'); await settle(); await settle();
    await click('.team-tools a[href*="invite-new-1"]'); await click(".invitation-fields .invitation-primary"); await settle();
    await click('.invitation-alternatives a:first-child'); expect(window.location.pathname).toBe("/login");
    await click(".auth-samples button:nth-of-type(2)"); await settle(); await settle();
    expect(window.location.pathname).toContain("/app/invitations/"); expect(element(".invitation-fields").textContent).toContain("Accept as Blair");
    expect(document.querySelector("#invited-password")).toBeNull(); await click(submit); await settle(); await settle();
    expect(window.location.pathname).toBe("/app/projects/studio-a%3Ateam-project-2");
  }, 10000);
});
