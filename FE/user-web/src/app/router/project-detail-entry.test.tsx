import { act } from "react";
import { describe, expect, it } from "vitest";
import { router } from "@/app/router/router";
import { setupPreviewApp } from "@/test/preview-app";

const path = "/app/projects/studio-a%3Ateam-project-2";
const { element, navigate, click, choose, input, settle, waitFor } = setupPreviewApp(path);
// 기능 : 상세 탭의 실제 버튼을 눌러 화면 전환을 검증한다.
async function tab(name: string) { await act(async () => Array.from(document.querySelectorAll<HTMLButtonElement>('[aria-label="Project sections"] button')).find(button => button.textContent === name)!.click()); }
// 기능 : 조합 키가 편집 종료로 전파되는지 확인한다.
async function compositionEscape(selector: string) { await act(async () => { const node = element(selector); node.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); node.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", isComposing: true, bubbles: true, cancelable: true })); }); }
// 기능 : 실제 저장 완료 화면이 나타날 때까지 React 비동기 작업을 확인한다.
async function saved(name?: string) { await settle(); await waitFor(() => { expect(element(".project-updated-notice").textContent).toContain("successfully updated"); if (name) expect(element(".project-title-row h1").textContent).toBe(name); }); }
// 기능 : 상세 저장과 URL·입력 수명의 경계를 실제 앱 저장소로 검증한다.
describe("G24 project detail entry", () => {
  // 기능 : 탭은 외부 복귀 문맥을 보존하고 현재 탭 재선택은 초안을 유지한다.
  it("preserves route context and the current settings draft", async () => {
    await act(async () => router.navigate(`${path}?source=client#project`, { state: { returnTo: "/app/clients" } })); await tab("Settings");
    expect(router.state.location.hash).toBe("#project"); expect(router.state.location.state).toEqual({ returnTo: "/app/clients" }); expect(router.state.location.search).toContain("source=client");
    await input('[aria-label="Project Title"]', "Draft kept"); const entry = router.state.location.key; await tab("Settings"); expect(router.state.location.key).toBe(entry); expect(element<HTMLInputElement>('[aria-label="Project Title"]').value).toBe("Draft kept");
    await tab("Team"); expect(element(".project-members").textContent).toContain("Alex"); await act(async () => router.navigate(-1)); expect(element<HTMLInputElement>('[aria-label="Project Title"]').value).toBe("Design Project with Doe Studio");
  });
  // 기능 : 이름 조합 취소는 폼을 유지하고 버튼 취소 뒤 재편집은 저장할 수 있다.
  it("keeps composing names open and resets composition after cancellation", async () => {
    await click('[aria-label="Edit project name"]'); await compositionEscape('[aria-label="Project name"]'); expect(document.querySelector(".project-name-editor")).not.toBeNull();
    await click('[aria-label="Cancel project name edit"]'); await click('[aria-label="Edit project name"]'); await input('[aria-label="Project name"]', "Renamed cleaning"); await click(".project-name-editor .client-primary"); await saved("Renamed cleaning");
    expect(element(".project-title-row h1").textContent).toBe("Renamed cleaning"); expect(element(".project-activity").textContent).toContain("Design Project with Doe");
    await navigate(`${path}?visit=2`); expect(document.querySelector(".project-updated-notice")).toBeNull();
    await navigate("/app/projects?view=list"); await settle(); expect(element('[data-project-id="studio-a:team-project-2"]').textContent).toContain("Renamed cleaning");
  }, 10000);
  // 기능 : 이름 검증 오류는 해당 입력과 연결되고 수정 후 재시도가 가능하다.
  it("focuses and describes an invalid project name", async () => {
    await click('[aria-label="Edit project name"]'); await input('[aria-label="Project name"]', "   "); await click(".project-name-editor .client-primary"); await settle();
    const field = element<HTMLInputElement>('[aria-label="Project name"]'); expect(field.getAttribute("aria-invalid")).toBe("true"); expect(document.activeElement).toBe(field); expect(document.getElementById(field.getAttribute("aria-describedby")!)?.textContent).toContain("1–200");
    await input('[aria-label="Project name"]', "Valid name"); await click(".project-name-editor .client-primary"); await saved();
  });
  // 기능 : 설정 조합 Esc와 기간 검증은 초안을 버리지 않으며 오류 입력에 초점을 둔다.
  it("keeps composing settings and identifies the invalid date", async () => {
    await tab("Settings"); await compositionEscape('[aria-label="Project Title"]'); expect(document.querySelector(".project-settings-layout")).not.toBeNull();
    await act(async () => element('[aria-label="Project Title"]').dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    await input('[aria-label="End Date"]', "2024-02-01"); await click(".project-settings-card .client-primary"); await settle(); const field = element<HTMLInputElement>('[aria-label="End Date"]');
    expect(field.getAttribute("aria-invalid")).toBe("true"); expect(document.activeElement).toBe(field); expect(document.getElementById(field.getAttribute("aria-describedby")!)?.textContent).toContain("on or after"); expect(router.state.location.search).toContain("Settings");
  });
  // 기능 : 설정 전체 저장·종료일 지우기·재진입과 과거 시간기록 불변을 확인한다.
  it("saves the whole settings draft without repricing historical time", async () => {
    await tab("Time Tracking"); const timeBefore = element(".project-time-entries").textContent; await tab("Settings"); await input('[aria-label="Project Title"]', "Cleaning plan"); await input('[aria-label="Hourly Rate"]', "35.75"); await input('[aria-label="End Date"]', "2024-02-21"); await click('[aria-label="Send my client auto-reminders"]');
    await act(async () => { const node = element<HTMLTextAreaElement>('[aria-label="Description"]'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(node, "**Weekly** cleaning"); node.dispatchEvent(new Event("input", { bubbles: true })); });
    await click(".project-settings-card .client-primary"); await saved("Cleaning plan"); expect(element(".project-title-row h1").textContent).toBe("Cleaning plan");
    await tab("Settings"); expect(document.querySelector(".project-updated-notice")).toBeNull(); expect(element<HTMLInputElement>('[aria-label="Hourly Rate"]').value).toBe("35.75"); expect(element<HTMLInputElement>('[aria-label="End Date"]').value).toBe("2024-02-21"); expect(element<HTMLInputElement>('[aria-label="Send my client auto-reminders"]').checked).toBe(false); expect(element<HTMLTextAreaElement>('[aria-label="Description"]').value).toBe("**Weekly** cleaning");
    await click('[aria-label="Clear end date"]'); await click(".project-settings-card .client-primary"); await saved(); await tab("Settings"); expect(element<HTMLInputElement>('[aria-label="End Date"]').value).toBe(""); await tab("Time Tracking"); expect(element(".project-time-entries").textContent).toBe(timeBefore); expect(element(".project-time-totals").textContent).toContain("$20.04");
    await act(async () => router.navigate(-2)); expect(document.querySelector(".project-updated-notice")).toBeNull();
  }, 12000);
  // 기능 : 지연 저장 중 이탈은 설정을 갱신하지 않고 기존 값으로 다시 진입한다.
  it("aborts a pending settings save when the detail entry changes", async () => {
    await choose('[aria-label="Project scenario"]', "slow"); await settle(1700); await tab("Settings"); await input('[aria-label="Project Title"]', "Aborted settings"); await click(".project-settings-card .client-primary"); await navigate(`${path}?tab=Settings&visit=2`); await settle(3300);
    expect(element<HTMLInputElement>('[aria-label="Project Title"]').value).toBe("Design Project with Doe Studio"); expect(document.querySelector(".project-updated-notice")).toBeNull();
  }, 12000);
  // 기능 : 이름 동시 변경으로 낡은 설정이 덮어쓰지 못하며 새 값 불러오기와 저장 실패 재시도를 제공한다.
  it("recovers stale settings and retries a failed atomic save", async () => {
    await tab("Settings"); await input('[aria-label="Project Title"]', "Stale draft"); await click('[aria-label="Edit project name"]'); await input('[aria-label="Project name"]', "Newer title"); await click(".project-name-editor .client-primary"); await saved("Newer title");
    await click(".project-settings-card .client-primary"); await settle(); expect(element('.project-settings-card [role="alert"]').textContent).toContain("changed"); expect(element<HTMLInputElement>('[aria-label="Project Title"]').value).toBe("Stale draft"); await click('.project-settings-card [role="alert"] button'); expect(element<HTMLInputElement>('[aria-label="Project Title"]').value).toBe("Newer title");
    await input('[aria-label="Hourly Rate"]', "-1"); await click(".project-settings-card .client-primary"); expect(element('[aria-label="Hourly Rate"]').getAttribute("aria-invalid")).toBe("true"); await input('[aria-label="Hourly Rate"]', "21.50");
    await choose('[aria-label="Project scenario"]', "write-error"); await settle(); await click(".project-settings-card .client-primary"); await waitFor(() => { expect(element('.project-settings-card [role="alert"]').textContent).toContain("preserved"); }); expect(element<HTMLInputElement>('[aria-label="Hourly Rate"]').value).toBe("21.50");
    await click(".project-settings-card .client-primary"); await saved(); await tab("Settings"); expect(element<HTMLInputElement>('[aria-label="Hourly Rate"]').value).toBe("21.50");
  }, 12000);
});
