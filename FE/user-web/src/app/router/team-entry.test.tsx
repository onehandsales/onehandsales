import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle } = setupPreviewApp("/app/settings/team");
const scenario = ".team-tools label:first-of-type select";
// 기능 : 실제 초대 폼에서 이메일·역할·프로젝트를 선택한다.
async function fillInvite(email = "new@example.test") {
  await input('#team-invite-form input[type="email"]', email);
  await choose("#team-invite-form select", "Collaborator");
  await click(".team-project-trigger"); await click(".team-project-options label:nth-of-type(2) input");
}
// 기능 : 해당 이메일의 행 메뉴에서 제거 확인을 연다.
async function remove(email: string) { await click(`[aria-label="Actions for ${email}"]`); await click('.team-row-menu [role="menuitem"]:last-child'); }
// 기능 : 실제 앱의 초대·제거·대시보드 연결을 같은 저장소로 검증한다.
describe("G17 team journeys", () => {
  // 기능 : 입력·선택·실패·중복 제출 이후에도 하나의 Pending 행만 생성하는지 확인한다.
  it("keeps project controls and failed invitation retry connected to one Pending row", async () => {
    await choose(scenario, "invite-error"); await click(".team-heading a");
    expect(element<HTMLButtonElement>('[form="team-invite-form"]').disabled).toBe(true);
    await input('#team-invite-form input[type="email"]', "new@example.test");
    expect(element<HTMLButtonElement>('[form="team-invite-form"]').disabled).toBe(true);
    await fillInvite(); expect(element(".team-project-chip").textContent).toContain("Design Project");
    await click(".team-project-clear"); expect(document.querySelector(".team-project-chip")).toBeNull();
    await click(".team-project-options label:nth-of-type(2) input");
    await act(async () => element(".team-project-options").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(document.activeElement).toBe(element(".team-project-trigger")); expect(element("dialog").hasAttribute("open")).toBe(true);
    await click('[form="team-invite-form"]'); await settle(); expect(element(".team-invite-fields [role=alert]").textContent).toContain("selections are still here");
    await click('[form="team-invite-form"]'); await click('[form="team-invite-form"]'); await settle(); await settle();
    const row = element('[data-team-id="studio-a:invite-new-1"]'); expect(row.textContent).toContain("Invite Pending"); expect(row.textContent).toContain("1 Project");
    expect(document.querySelectorAll(".team-table tbody tr")).toHaveLength(3); expect(document.activeElement).toBe(element(".team-heading a"));
    await click(".team-heading a"); await fillInvite(); await click('[form="team-invite-form"]'); await settle();
    expect(element(".team-invite-fields [role=alert]").textContent).toContain("already exists");
  });
  // 기능 : 동일 URL 새 이력과 명시적 닫기가 처리 중 초대를 저장하지 않게 한다.
  it("cancels pending invitations on history change and dialog close", async () => {
    await choose(scenario, "slow"); await click(".team-heading a"); await fillInvite(); await click('[form="team-invite-form"]');
    await navigate("/app/settings/team?invite=1&visit=2"); await settle(1600);
    expect(element<HTMLInputElement>('#team-invite-form input[type="email"]').value).toBe("");
    await fillInvite("cancel@example.test"); await click('[form="team-invite-form"]'); await click("dialog .dialog__close"); await settle(1600);
    expect(window.location.search).toBe("?visit=2"); expect(document.querySelectorAll(".team-table tbody tr")).toHaveLength(2);
    expect(document.querySelector(".team-notice")).toBeNull(); expect(document.activeElement).toBe(element(".team-heading a"));
  });
  // 기능 : 제거 취소·실패·재시도는 대상 ID만 변경하고 동명 가입 멤버와 다른 초대를 보존한다.
  it("removes only the selected invitation and restores focus after cancel or success", async () => {
    await choose(".team-tools label:nth-of-type(2) select", "removing"); await settle();
    await remove("jon@example.test"); expect(element(".team-remove-body strong").textContent).toBe("jon@example.test");
    await click("dialog .dialog__close"); expect(document.activeElement).toBe(element('[aria-label="Actions for jon@example.test"]'));
    expect(document.querySelectorAll(".team-table tbody tr")).toHaveLength(5);
    await choose(scenario, "remove-error"); await settle(); await remove("jon@example.test"); await click(".team-danger"); await settle();
    expect(element(".team-remove-body [role=alert]").textContent).toContain("Unable");
    await click(".team-danger"); await settle(); await settle();
    expect(document.querySelector('[data-team-id="studio-a:invite-jon"]')).toBeNull();
    expect(element('[data-team-id="studio-a:member-jon"]').textContent).toContain("Feb 8, 2024");
    expect(document.querySelectorAll(".team-table tbody tr")).toHaveLength(4); expect(document.activeElement).toBe(element(".team-heading a"));
    await remove("jon2@example.test"); expect(element("dialog h2").textContent).toBe("Remove joined member");
    await click("dialog .dialog__close"); expect(document.querySelectorAll(".team-table tbody tr")).toHaveLength(4);
    await choose(scenario, "slow"); await settle(1600); await remove("smith@example.test"); await click(".team-danger");
    await navigate("/app/settings/team?visit=cancel-removal"); await settle(1600);
    expect(element('[data-team-id="studio-a:invite-smith"]').textContent).toContain("Invite Pending");
  }, 10000);
  // 기능 : 초기 안내는 저장된 팀 행과 연결되고 실제 초대 화면을 통해 Pending 상태를 갱신한다.
  it("connects dashboard invitation progress and entry to the canonical team", async () => {
    await remove("jane@example.test"); await click(".team-danger"); await settle();
    await navigate("/app"); await settle();
    expect(element('.setup-checklist nav button:nth-child(2)').classList.contains("is-done")).toBe(false);
    await click('.setup-checklist nav button:nth-child(2)'); await click('.setup-checklist-detail a');
    expect(window.location.pathname).toBe("/app/settings/team"); await fillInvite(); await click('[form="team-invite-form"]'); await settle();
    await navigate("/app"); await settle();
    expect(element('.setup-checklist nav button:nth-child(2)').classList.contains("is-done")).toBe(true);
    await click('.app-sidebar a[href="/app/settings/team?invite=1"]'); expect(element("dialog h2").textContent).toBe("Invite Member");
  });
});
