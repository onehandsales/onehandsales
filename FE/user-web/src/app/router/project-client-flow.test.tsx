import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, click, choose, input, settle, waitFor } = setupPreviewApp("/app/clients");
const project = '[data-project-id="studio-a:project-new-1"]';
// 기능 : 연결 흐름에서 상세 탭의 실제 버튼을 선택한다.
async function tab(name: string) { await act(async () => Array.from(document.querySelectorAll<HTMLButtonElement>('[aria-label="Project sections"] button')).find(button => button.textContent === name)!.click()); }
// 기능 : 고객부터 프로젝트 설정까지 한 ID를 유지하는 전체 목 흐름을 검증한다.
describe("G19–G24 connected project journey", () => {
  // 기능 : 고객 생성·프로젝트 생성·보드/표·단계/태그·설정과 고객 복귀를 연속 검증한다.
  it("keeps one customer and project through creation, organization and settings", async () => {
    await click(".client-list-tools a"); await settle(); await input('#new-client-form input[placeholder="Smith Co."]', "Cleaning Company"); await input('#new-client-form input[placeholder="Jane Smith"]', "Cleaning Contact"); await input('#new-client-form input[type="email"]', "cleaning@example.test"); await click('[form="new-client-form"]');
    await waitFor(() => { expect(element("h1").textContent).toBe("Cleaning Company"); }); await click('[aria-label="Add project"]'); await settle(); await input(".project-title-field input", "Weekly cleaning"); await click('[form="new-project-form"]');
    await waitFor(() => { expect(element(".project-title-row h1").textContent).toBe("Weekly cleaning"); }); expect(element(".project-context-row > a").getAttribute("href")).toContain("studio-a%3Aclient-new-1");
    await click('[aria-label="Edit project name"]'); await input('[aria-label="Project name"]', "Weekly cleaning renamed"); await click(".project-name-editor .client-primary"); await waitFor(() => { expect(element(".project-title-row h1").textContent).toBe("Weekly cleaning renamed"); }); expect(document.querySelectorAll(".client-notice")).toHaveLength(1); expect(element(".client-notice").textContent).toContain("successfully updated"); await click('[aria-label="Dismiss project update"]'); expect(document.querySelector(".client-notice")).toBeNull();
    await click('a[href="/app/projects"]'); await waitFor(() => { expect(element(project).textContent).toContain("Weekly cleaning"); });
    await click(`${project} .project-keyboard-move`); await choose('[aria-label="Stage"]', "In Progress"); await click('[form="project-move-form"]'); await waitFor(() => { expect(element(project).closest("section")?.getAttribute("aria-label")).toBe("In Progress"); });
    await click(`${project} .project-actions-trigger`); await act(async () => document.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click()); await click(".project-tags-body > button"); await input('[role="combobox"]', "Weekly"); await click(".project-tag-create"); await waitFor(() => { expect(element(".project-linked-tags").textContent).toContain("Weekly"); }); await click(".project-tags-dialog .dialog__close");
    await click('[aria-label="Project views"] button:nth-child(2)'); expect(element(project).textContent).toContain("Weekly"); expect(element(`${project} .project-status-dot`).getAttribute("aria-label")).toBe("Stage: In Progress"); expect(document.querySelectorAll(project)).toHaveLength(1); await click(`${project} td:first-child a`);
    await tab("Settings"); await input('[aria-label="Project Title"]', "Weekly cleaning revised"); await input('[aria-label="End Date"]', "2026-12-31"); await input('[aria-label="Hourly Rate"]', "30.50"); await click('[aria-label="Send my client auto-reminders"]'); await click(".project-settings-card .client-primary");
    await waitFor(() => { expect(element(".project-title-row h1").textContent).toBe("Weekly cleaning revised"); expect(element(".project-updated-notice").textContent).toContain("successfully updated"); });
    expect(element(".project-activity").textContent).toContain("Weekly cleaning."); expect(element(".project-activity").textContent).not.toContain("Weekly cleaning revised"); await tab("Settings"); expect(element<HTMLInputElement>('[aria-label="End Date"]').value).toBe("2026-12-31"); expect(element<HTMLInputElement>('[aria-label="Hourly Rate"]').value).toBe("30.50"); expect(element<HTMLInputElement>('[aria-label="Send my client auto-reminders"]').checked).toBe(false);
    await tab("Overview"); await click(".project-context-row > a"); await waitFor(() => { expect(element(".client-project-list").textContent).toContain("Weekly cleaning revised"); }); expect(element("h1").textContent).toBe("Cleaning Company"); expect(element(".client-contact").textContent).toContain("cleaning@example.test");
    await click('a[href="/app/projects"]'); await waitFor(() => { expect(element(project).textContent).toContain("Weekly cleaning revised"); }); expect(element(project).textContent).toContain("Weekly"); expect(element(project).closest("section")?.getAttribute("aria-label")).toBe("In Progress");
  }, 20000);
});
