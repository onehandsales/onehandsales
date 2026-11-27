import { act } from "react";
import { File } from "node:buffer";
import { describe, expect, it, vi } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle } = setupPreviewApp("/app/clients?tab=settings");
const detail = "/app/clients/studio-a%3Aclient-doe";
const fieldInput = '.client-definition-edit input';
// 기능 : 실제 제어 입력의 조합 시작과 Escape 기본 취소를 확인한다.
async function composition(selector: string, escape = false) {
  await act(async () => element(selector).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
  const event = new KeyboardEvent("keydown", { key: "Escape", isComposing: true, bubbles: true, cancelable: true });
  if (escape) await act(async () => element(selector).dispatchEvent(event));
  return event;
}
// 기능 : 파일 선택 이벤트만 대체하고 앱의 디코딩·초안·저장 경로를 그대로 실행한다.
async function selectImage(file: File) {
  await act(async () => {
    const node = element<HTMLInputElement>('input[aria-label="Choose client image"]');
    Object.defineProperty(node, "files", { configurable: true, value: [file] });
    node.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
// 기능 : 실제 파일 선택·픽셀 디코딩과 구분하여 Object URL 생성과 해제 수명만 관찰한다.
function imageEnvironment() {
  let sequence = 0; const active = new Set<string>();
  const create = vi.fn(() => { const url = `blob:g20-${++sequence}`; active.add(url); return url; });
  const revoke = vi.fn((url: string) => active.delete(url));
  vi.stubGlobal("URL", class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
  const decode = vi.fn(async (): Promise<{ close: () => void }> => ({ close: vi.fn() })); vi.stubGlobal("createImageBitmap", decode);
  return { active, create, revoke, decode };
}
// 기능 : URL 수명과 필드·이미지 편집의 취소 및 재진입을 실제 앱에 연결한다.
describe("G20 client editing journeys", () => {
  // 기능 : 조합 취소 키는 정의 편집을 닫지 않는다.
  it("keeps a field definition open during composing Escape", async () => {
    await click(".client-fields-section .client-primary");
    const event = await composition(fieldInput, true);
    expect(event.defaultPrevented).toBe(true); expect(document.querySelector(fieldInput)).not.toBeNull();
  });
  // 기능 : 조합 중 명시적 취소 뒤 새 정의를 저장하고 빈 행 개수와 저장 개수를 구분한다.
  it("saves a fresh definition after cancelling unfinished composition", async () => {
    await click(".client-fields-section .client-primary"); await composition(fieldInput);
    await click('.client-definition-edit button[type="button"]'); await click(".client-fields-section .client-primary");
    expect(element(".client-fields-section header").textContent).toContain("4 Fields");
    expect(element(".client-fields-section header").textContent).toContain("3 saved, 1 unsaved row");
    await input(fieldInput, "Email"); await click('.client-definition-edit button[type="submit"]'); await settle(); await settle();
    expect(document.querySelector(fieldInput)).toBeNull(); expect(element(".client-field-name").textContent).toBe("Email");
    expect(element(".client-fields-section header").textContent).toContain("4 saved");
  });
  // 기능 : 값 편집의 조합 취소 후 새 입력이 같은 고객에 저장되고 다른 연락처는 유지된다.
  it("saves a value after cancelling unfinished composition", async () => {
    await navigate(detail); await settle(); await click('[aria-label="Edit value Phone Number"]');
    await composition(".client-value-form input"); await click('.client-value-form button[type="button"]');
    await click('[aria-label="Edit value Phone Number"]'); await input(".client-value-form input", "010-1234-5678");
    await click('.client-value-form button[type="submit"]'); await settle(); await settle();
    expect(document.querySelector(".client-value-form")).toBeNull(); expect(element(".client-field-value").textContent).toBe("010-1234-5678");
    expect(element(".client-contact").textContent).toContain("Jane Doe");
  });
  // 기능 : 동일 경로의 새 이력은 처리 중 정의 추가를 취소해 나중에 저장하지 않는다.
  it("discards a pending definition when the route entry changes", async () => {
    await choose(".client-tools select", "slow"); await settle(1700); await click(".client-fields-section .client-primary");
    await input(fieldInput, "Aborted definition"); await click('.client-definition-edit button[type="submit"]');
    await navigate("/app/clients?tab=settings&visit=2"); expect(document.querySelector(fieldInput)).toBeNull(); await settle(3300);
    expect(document.querySelector(fieldInput)).toBeNull(); expect(element(".client-fields-section").textContent).not.toContain("Aborted definition");
    expect(element(".client-fields-section header").textContent).toContain("3 Fields");
  }, 10000);
  // 기능 : 같은 고객 상세의 새 이력은 값 저장을 취소하고 저장 전 표시로 복귀한다.
  it("discards a pending value on a new entry of the same client", async () => {
    await navigate(detail); await settle(); await choose(".client-tools select", "slow"); await settle(1700);
    await click('[aria-label="Edit value Phone Number"]'); await input(".client-value-form input", "Never saved"); await click('.client-value-form button[type="submit"]');
    await navigate(detail + "?visit=2"); expect(document.querySelector(".client-value-form")).toBeNull(); await settle(3300);
    expect(document.querySelector(".client-value-form")).toBeNull(); expect(document.querySelector(".client-field-value")).toBeNull();
  }, 10000);
  // 기능 : 늦은 이미지 디코딩이 같은 고객의 새 이력에서 편집기를 되살리지 않는다.
  it("discards an image editor and late decoding on same-client navigation", async () => {
    let finish!: (value: { close: () => void }) => void;
    const close = vi.fn(); vi.stubGlobal("createImageBitmap", vi.fn(() => new Promise(resolve => { finish = resolve; })));
    await navigate(detail); await settle(); await click('[aria-label="Update client image"]');
    await selectImage(new File(["image"], "late.png", { type: "image/png" }));
    await navigate(detail + "?visit=2"); await act(async () => finish({ close }));
    expect(document.querySelector('[aria-label="Choose client image"]')).toBeNull(); expect(close).toHaveBeenCalledOnce();
    expect(document.querySelector(".client-large-avatar img")).toBeNull();
  });
  // 기능 : 신규 고객 생성부터 정의·값·이미지 변경까지 같은 ID로 연결하고 삭제 범위를 검증한다.
  it("connects creation, list, detail, independent values and image retry/removal", async () => {
    const media = imageEnvironment();
    await navigate("/app/clients?create=client"); await settle();
    await input('[name="companyName"]', "Connected customer"); await input('[name="contactName"]', "Contact Person"); await input('[name="email"]', "contact@example.test");
    await click('[form="new-client-form"]'); await settle(); await settle(); const createdPath = window.location.pathname;
    await click('.client-additional a'); await settle(); await click(".client-fields-section .client-primary"); await input(fieldInput, "Email");
    await click('.client-definition-edit button[type="submit"]'); await settle(); await settle();
    const fieldId = element(".client-fields-section [data-field-id]").dataset.fieldId!;
    await navigate("/app/clients"); await settle(); await click('[data-client-id="studio-a:client-new-1"] a'); await settle();
    expect(window.location.pathname).toBe(createdPath);
    await click('[aria-label="Edit value Email"]'); await input(".client-value-form input", "independent@example.test"); await click('.client-value-form button[type="submit"]'); await settle(); await settle();
    expect(element(".client-contact-email").textContent).toContain("contact@example.test");
    await choose(".client-tools select", "write-error"); await settle(); await click('[aria-label="Update client image"]');
    await selectImage(new File(["image bytes"], "customer.png", { type: "image/png" }));
    expect(document.querySelector(".client-large-avatar img")).toBeNull(); await click('.client-edit-actions .client-primary'); await settle();
    expect(element('dialog [role="alert"]').textContent).toContain("preserved");
    await click('.client-edit-actions .client-primary'); await click('.client-edit-actions .client-primary'); await settle(); await settle();
    expect(element(".client-large-avatar img").getAttribute("alt")).toBe("Connected customer image");
    expect(element(".client-notice").textContent).toContain("successfully updated");
    await navigate("/app/clients"); await settle(); expect(element('[data-client-id="studio-a:client-new-1"] img').getAttribute("alt")).toBe("Connected customer image");
    await navigate(createdPath); await settle(); expect(document.querySelector(".client-notice")).toBeNull();
    await click('[aria-label="Remove client image"]'); await click('dialog .client-edit-actions button:first-child'); expect(element(".client-large-avatar img")).toBeTruthy();
    await click('[aria-label="Remove client image"]'); await click('dialog .client-primary'); await settle(); await settle();
    expect(document.querySelector(".client-large-avatar img")).toBeNull(); expect(media.active.size).toBe(0);
    await click('.client-additional a'); await settle(); await click('[aria-label="Edit field Email"]'); await input(fieldInput, "Customer Note"); await click('.client-definition-edit button[type="submit"]'); await settle(); await settle();
    expect(element(`[data-field-id="${fieldId}"]`).textContent).toContain("Customer Note");
    expect(document.activeElement).toBe(element('[aria-label="Edit field Customer Note"]'));
    await navigate(createdPath); await settle(); expect(element(".client-field-value").textContent).toBe("independent@example.test");
    await navigate("/app/clients/studio-a%3Aclient-sample"); await settle(); expect(document.querySelector(".client-field-value")).toBeNull();
    await click('.client-additional a'); await settle(); await click('[aria-label="Delete field Customer Note"]'); await click('dialog .client-primary'); await settle(); await settle();
    await navigate(createdPath); await settle(); expect(document.querySelector(`[data-field-id="${fieldId}"]`)).toBeNull(); expect(element(".client-contact-email").textContent).toContain("contact@example.test");
  }, 25000);
  // 기능 : 이미지 형식·용량·읽기 실패와 최신 선택을 분리하고 취소 시 모든 미리보기 URL을 해제한다.
  it("validates files, retries decoding and ignores an older image selection", async () => {
    const media = imageEnvironment(); await navigate(detail); await settle(); await click('[aria-label="Remove client image"]');
    expect(element("dialog h2").textContent).toBe("No image to remove"); await click("dialog .dialog__close");
    await act(async () => element('[aria-label="Update client image"]').focus()); await click('[aria-label="Update client image"]');
    await selectImage(new File(["svg"], "bad.svg", { type: "image/svg+xml" })); expect(element('dialog [role="alert"]').textContent).toContain("2 MB");
    await selectImage(new File([new Uint8Array(2 * 1024 * 1024 + 1)], "large.png", { type: "image/png" })); expect(media.decode).not.toHaveBeenCalled();
    media.decode.mockRejectedValueOnce(new Error("decode failed")); await selectImage(new File(["bad bytes"], "broken.png", { type: "image/png" }));
    expect(element('dialog [role="alert"]').textContent).toContain("Unable to read"); await click('dialog [role="alert"] button'); expect(element(".client-image-filename").textContent).toBe("broken.png");
    let finish!: (value: { close: () => void }) => void;
    media.decode.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    await selectImage(new File(["old"], "old.png", { type: "image/png" })); await selectImage(new File(["new"], "new.png", { type: "image/png" }));
    const close = vi.fn(); await act(async () => finish({ close })); expect(close).toHaveBeenCalledOnce(); expect(element(".client-image-filename").textContent).toBe("new.png");
    await click("dialog .dialog__close"); expect(media.active.size).toBe(0); expect(document.querySelector(".client-large-avatar img")).toBeNull();
    expect(document.activeElement).toBe(element('[aria-label="Update client image"]'));
  });
  // 기능 : 고객 값의 조합 중 Escape와 일반 취소를 구분하고 원래 편집 버튼에 복귀한다.
  it("keeps a value open during composing Escape and restores edit focus on cancel", async () => {
    await navigate(detail); await settle(); await click('[aria-label="Edit value Website"]');
    expect((await composition(".client-value-form input", true)).defaultPrevented).toBe(true); expect(element(".client-value-form")).toBeTruthy();
    await click('.client-value-form button[type="button"]'); expect(document.activeElement).toBe(element('[aria-label="Edit value Website"]'));
  });
  // 기능 : 생성 직후 이미지를 저장하면 최신 업데이트 알림만 남고 생성 알림과 겹치지 않는다.
  it("replaces the creation notice with the image update notice", async () => {
    imageEnvironment(); await navigate("/app/clients?create=client"); await settle();
    await input('[name="contactName"]', "Image client"); await input('[name="email"]', "image@example.test");
    await click('[form="new-client-form"]'); await settle(); await settle(); expect(element(".client-notice").textContent).toContain("added 1 client");
    await click('[aria-label="Update client image"]'); await selectImage(new File(["image"], "new.png", { type: "image/png" }));
    await click('dialog .client-primary'); await settle(); await settle();
    expect(document.querySelectorAll(".client-notice")).toHaveLength(1); expect(element(".client-notice").textContent).toContain("successfully updated");
  });
});
