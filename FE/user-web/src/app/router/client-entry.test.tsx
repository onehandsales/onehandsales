import { act } from "react";
import { describe, expect, it } from "vitest";
import { router } from "@/app/router/router";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle } = setupPreviewApp("/app/clients");
// 기능 : 고객 모달의 회사·기본 연락처를 실제 제어 입력으로 채운다.
async function fillClient(name = "Review Company") {
  await input('#new-client-form input[placeholder="Smith Co."]', name);
  await input('#new-client-form input[placeholder="Jane Smith"]', "Review Contact");
  await input('#new-client-form input[type="email"]', "review@example.test");
}
// 기능 : 합성 키 입력의 기본 취소 여부와 현재 제어의 동작을 함께 확인한다.
async function key(selector: string, value: string, composing = false) {
  const event = new KeyboardEvent("keydown", { key: value, isComposing: composing, bubbles: true, cancelable: true });
  await act(async () => element(selector).dispatchEvent(event));
  return event;
}
// 기능 : 고객 생성·조회·취소와 이미 연결된 프로젝트 선택의 동일 객체 경계를 검증한다.
describe("G19 client journeys", () => {
  // 기능 : 고객 검색·정렬과 생성 취소가 기존 query·hash 및 복귀 위치를 보존한다.
  it("preserves unrelated query and hash across search, sorting and creation cancellation", async () => {
    await navigate("/app/clients?keep=1#client-results"); await settle();
    await input(".client-search input", "Sample"); expect(window.location.hash).toBe("#client-results");
    await click(".client-table th:first-child button"); expect(window.location.hash).toBe("#client-results");
    const origin = window.location.pathname + window.location.search + window.location.hash;
    await click(".client-list-tools a"); await settle(); expect(window.location.hash).toBe("#client-results");
    await click(".client-dialog .dialog__close"); expect(window.location.pathname + window.location.search + window.location.hash).toBe(origin);
    expect(new URLSearchParams(window.location.search).get("keep")).toBe("1");
    await navigate("/app/settings/company?visit=menu#company"); await settle();
    await click(".app-new"); await click('.app-create-menu [role="menuitem"]'); await settle(); await click(".client-dialog .dialog__close");
    expect(window.location.pathname + window.location.search + window.location.hash).toBe("/app/settings/company?visit=menu#company");
  });
  // 기능 : 한글 검색 조합은 확정 전 URL과 목록에 반영하지 않고 새 이력에서 폐기한다.
  it("keeps an unfinished search composition separate from committed navigation", async () => {
    await act(async () => element(".client-search input").dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await input(".client-search input", "고");
    expect(new URLSearchParams(window.location.search).has("q")).toBe(false);
    expect(document.querySelectorAll(".client-table tbody tr")).toHaveLength(2);
    await act(async () => element(".client-search input").dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    expect(new URLSearchParams(window.location.search).get("q")).toBe("고");
    await act(async () => element(".client-search input").dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await input(".client-search input", "고객"); await navigate("/app/clients?q=고&visit=2");
    expect(element<HTMLInputElement>(".client-search input").value).toBe("고");
    await act(async () => router.navigate(-1));
    expect(element<HTMLInputElement>(".client-search input").value).toBe("고");
    await input(".client-search input", "Sample"); expect(new URLSearchParams(window.location.search).get("q")).toBe("Sample");
  });
  // 기능 : 한 번 생성한 고객과 태그가 목록·상세·프로젝트 선택에 같은 ID로 전달된다.
  it("creates once after retry and keeps the saved customer across list and project selection", async () => {
    await choose(".client-tools select", "write-error"); await click(".client-list-tools a"); await settle(); await fillClient();
    await click(".client-tag-selection button"); await click(".client-tag-options label:first-child input"); await click(".client-tag-options button");
    await click('[form="new-client-form"]'); await settle();
    expect(element('#new-client-form [role="alert"]').textContent).toContain("inputs are preserved");
    await click('[form="new-client-form"]'); await click('[form="new-client-form"]'); await settle(); await settle();
    expect(element("h1").textContent).toBe("Review Company"); expect(element(".client-contact").textContent).toContain("review@example.test");
    expect(element(".client-detail-heading .client-tag").textContent).toBe("Client");
    const detailPath = window.location.pathname;
    await navigate("/app/clients"); await settle();
    expect(document.querySelectorAll('[data-client-id="studio-a:client-new-1"]')).toHaveLength(1);
    await input(".client-search input", "Review Company"); await click('.client-table tbody tr a'); await settle();
    expect(window.location.pathname).toBe(detailPath);
    await click('[aria-label="Add project"]'); await settle();
    expect(element(".project-dialog").textContent).toContain("New Project");
    expect(new URLSearchParams(window.location.search).get("projectClient")).toBe("studio-a:client-new-1");
  });
  // 기능 : 태그 선택의 Escape는 모달 전체가 아니라 선택창만 닫고 진입 버튼으로 복귀한다.
  it("closes only the tag chooser on Escape and preserves the client draft", async () => {
    await click(".client-list-tools a"); await settle(); await fillClient(); await click(".client-tag-selection button");
    const event = await key(".client-tag-options input", "Escape");
    expect(event.defaultPrevented).toBe(true); expect(document.querySelector(".client-tag-options")).toBeNull();
    expect(element<HTMLDialogElement>(".client-dialog").open).toBe(true);
    expect(document.activeElement).toBe(element(".client-tag-selection button"));
    expect(element<HTMLInputElement>('#new-client-form input[type="email"]').value).toBe("review@example.test");
  });
  // 기능 : 한글 조합 중 Escape와 Enter가 모달 취소나 고객 제출로 이어지지 않는다.
  it("suppresses composing Escape and Enter without submitting", async () => {
    await click(".client-list-tools a"); await settle(); await fillClient();
    const selector = '#new-client-form input[type="email"]';
    await act(async () => element(selector).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    expect((await key(selector, "Escape", true)).defaultPrevented).toBe(true);
    expect((await key(selector, "Enter", true)).defaultPrevented).toBe(true);
    await click('[form="new-client-form"]'); await settle(); expect(element<HTMLDialogElement>(".client-dialog").open).toBe(true);
    await act(async () => element(selector).dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    await click('[form="new-client-form"]'); await settle(); await settle(); expect(element("h1").textContent).toBe("Review Company");
  });
  // 기능 : 필수 입력 오류가 해당 입력과 연결되고 첫 수정 대상으로 초점이 이동한다.
  it("focuses and describes the invalid contact input", async () => {
    await click(".client-list-tools a"); await settle(); await click('[form="new-client-form"]');
    const contact = element<HTMLInputElement>('#new-client-form input[placeholder="Jane Smith"]');
    expect(document.activeElement).toBe(contact);
    expect(contact.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(contact.getAttribute("aria-describedby") ?? "")?.textContent).toContain("contact name");
  });
  // 기능 : 생성 성공 안내는 해당 고객에게만 나타나고 이력으로 다시 방문해도 재생하지 않는다.
  it("does not replay a creation notice on history return or a different customer", async () => {
    await click(".client-list-tools a"); await settle(); await fillClient(); await click('[form="new-client-form"]'); await settle(); await settle();
    expect(element(".client-notice").textContent).toContain("successfully added 1 client");
    await navigate("/app/clients"); await act(async () => router.navigate(-1)); await settle();
    expect(element("h1").textContent).toBe("Review Company"); expect(document.querySelector(".client-notice")).toBeNull();
    await act(async () => router.navigate("/app/clients/studio-a%3Aclient-sample", { state: { createdClientId: "studio-a:client-new-1" } })); await settle();
    expect(element("h1").textContent).toBe("Sample Client"); expect(document.querySelector(".client-notice")).toBeNull();
  });
  // 기능 : 처리 중 같은 경로의 새 이력과 명시적 닫기가 늦은 고객 생성을 취소한다.
  it("cancels pending creation on navigation and close without changing saved rows", async () => {
    await choose(".client-tools select", "slow"); await click(".client-list-tools a"); await settle(1700); await fillClient("Aborted"); await click('[form="new-client-form"]');
    await navigate("/app/clients?create=client&visit=2"); await settle(1700);
    expect(element<HTMLInputElement>('#new-client-form input[placeholder="Smith Co."]').value).toBe("");
    await fillClient("Closed"); await click('[form="new-client-form"]'); await click(".client-dialog .dialog__close"); await settle(1700);
    expect(window.location.search).toBe("?visit=2"); expect(document.querySelectorAll(".client-table tbody tr")).toHaveLength(2);
  }, 12000);
  // 기능 : 이미 구현된 프로젝트의 고객 추가를 취소하거나 저장해도 프로젝트 제목 초안을 유지한다.
  it("preserves the existing project draft across nested client cancel and creation", async () => {
    await navigate("/app/projects?create=project"); await settle();
    await input(".project-title-field input", "Existing project draft");
    await click(".project-client-trigger"); await click(".project-new-client"); await fillClient("Cancelled nested");
    await click(".client-dialog .dialog__close"); expect(element<HTMLInputElement>(".project-title-field input").value).toBe("Existing project draft");
    await click(".project-client-trigger"); await click(".project-new-client"); await fillClient("Selected nested client");
    await click('[form="new-client-form"]'); await settle(); await settle();
    expect(element<HTMLInputElement>(".project-title-field input").value).toBe("Existing project draft");
    expect(element(".project-client-trigger").textContent).toContain("Selected nested client");
    await click(".project-client-trigger"); expect(element('[role="option"][aria-selected="true"]').textContent).toContain("review@example.test");
    await navigate("/app/clients"); await settle();
    expect(element('[data-client-id="studio-a:client-new-1"]').textContent).toContain("Selected nested client");
    expect(element(".client-table").textContent).not.toContain("Cancelled nested");
  });
  // 기능 : 고객 탭의 관찰 제어와 미수록 인계·브랜드 설정 복귀를 실제 URL로 구분한다.
  it("connects portal, automation and settings tabs without claiming unrecorded actions succeeded", async () => {
    await click('.clients-heading a[href$="tab=portal"]');
    expect(element(".client-portal-url").textContent).toContain("https://app.hellobonsai.com/u/joe-doe-10/cl...");
    await click(".client-portal-url"); expect(element("dialog h2").textContent).toBe("Portal link not available"); await click("dialog .dialog__close");
    await click(".client-banner-close"); expect(document.querySelector(".client-portal-banner")).toBeNull();
    await click(".client-portal-caption a"); await settle(); expect(window.location.pathname).toBe("/app/settings/branding");
    await act(async () => router.navigate(-1)); await settle(); expect(element(".client-portal-preview")).toBeTruthy();
    await click('.clients-heading a[href$="tab=automations"]'); expect(element(".client-automation h2").textContent).toBe("Workflow Automation");
    await click(".client-automation .client-primary"); expect(element("dialog h2").textContent).toBe("New Automation"); await click("dialog .dialog__close");
    await click('.clients-heading a[href$="tab=settings"]'); expect(document.querySelectorAll(".client-tag-row")).toHaveLength(2);
    expect(element(".client-fields-section").textContent).toContain("3 Fields");
  });
});
