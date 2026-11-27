import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle } = setupPreviewApp("/app/settings/company");
// 기능 : 실제 회사 폼에서 하위 초안·전체 저장·공개 접근·파일 수명을 검증한다.
describe("G15 company settings journeys", () => {
  // 기능 : 주소 저장은 부모 초안만 바꾸며 전체 취소와 저장이 통화 및 중복 주소를 보존하는지 확인한다.
  it("separates address draft, discard and company save without currency conversion", async () => {
    await click(".company-address-summary"); expect(element<HTMLButtonElement>(".company-save").disabled).toBe(true);
    await input('.company-address-fields input[id$="line1"]', "Singapore, Singapore, 139953");
    await choose(".company-address-fields label:nth-last-of-type(2) select", "Singapore");
    await click(".company-address-actions button:last-child");
    expect(element(".company-address-summary").textContent).toContain("Singapore, Singapore, 139953");
    expect(document.activeElement).toBe(element(".company-address-summary"));
    expect(element(".company-settings-logo strong").textContent).toBe("MYR");
    await click(".company-edit-actions button"); await settle(); expect(element(".company-address-summary").textContent).toBe("Add Address");
    await click(".company-address-summary"); await input('.company-address-fields input[id$="line1"]', "Saved address");
    await click(".company-address-actions button:last-child"); await click(".company-save"); await settle();
    await navigate("/app"); await navigate("/app/settings/company"); await settle();
    expect(element(".company-address-summary").textContent).toContain("Saved address");
  });
  // 기능 : 같은 경로의 이력 변경에서 늦은 저장을 취소하고 명시적 재시도만 저장되게 한다.
  it("cancels a save on same-route navigation and preserves the editable draft", async () => {
    await input('[aria-label="Company Name"]', "History draft"); await choose(".company-tools select", "slow");
    await click(".company-save"); await navigate("/app/settings/company?visit=next#form"); await settle(1600);
    expect(element<HTMLInputElement>('[aria-label="Company Name"]').value).toBe("History draft");
    await click(".auth-account > button"); expect(element(".auth-account-title").textContent).toBe("Studio A"); await click(".auth-account > button");
    await choose(".company-tools select", "save-error"); await click(".company-save"); await settle();
    expect(element(".company-error").textContent).toContain("changes are still here");
    await click(".company-save"); await settle(); await click(".auth-account > button");
    expect(element(".auth-account-title").textContent).toBe("History draft");
    await navigate("/app/settings/company?visit=again");
    expect(document.body.querySelector(".company-save-notice")).toBeNull();
  });
  // 기능 : 비활성 초안을 취소하면 공개 상태가 유지되고 저장한 비활성은 공유 접근과 독립적으로 적용된다.
  it("keeps profile URL and shared access independent of saved visibility", async () => {
    const slug = element<HTMLInputElement>('[aria-label="Profile URL slug"]').value;
    await click(".company-profile-toggle button:last-child"); await navigate("/u/" + slug);
    expect(element("h1").textContent).toBe("Studio A"); expect(document.activeElement).toBe(element("#main-content"));
    await navigate("/app/settings/company"); await settle(); await click(".company-profile-toggle button:last-child"); await click(".company-save"); await settle();
    expect(element<HTMLInputElement>('[aria-label="Profile URL slug"]').value).toBe(slug);
    await navigate("/u/" + slug); expect(element("h1").textContent).toContain("unavailable");
    await navigate("/share/sample"); expect(location.pathname).toBe("/share/sample");
    expect(document.body.textContent).not.toContain("This public profile is unavailable");
  });
  // 기능 : 이전 이력의 파일 읽기는 새 화면에 늦게 적용하지 않고 읽은 파일 URL은 제거 시 해제한다.
  it("cancels old logo reads and releases preview URLs", async () => {
    const decode = vi.fn(async () => ({ close: vi.fn() })); vi.stubGlobal("createImageBitmap", decode);
    const create = vi.fn(() => "blob:g15-preview"); const revoke = vi.fn();
    vi.stubGlobal("URL", class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
    const file = new File(["local image"], "logo.png", { type: "image/png" });
    // 기능 : OS 파일 선택창을 대체한 File 입력을 전달하며 실제 이미지 디코딩 검증과 구분한다.
    async function pick() { await act(async () => { const node = element<HTMLInputElement>('input[type="file"]'); Object.defineProperty(node, "files", { configurable: true, value: [file] }); node.dispatchEvent(new Event("change", { bubbles: true })); }); }
    await choose(".company-tools select", "slow"); await pick(); await navigate("/app/settings/company?file=next"); await settle(1600);
    expect(decode).not.toHaveBeenCalled(); expect(create).not.toHaveBeenCalled();
    await choose(".company-tools select", "normal"); await pick(); expect(element('[role="status"].sr-only').textContent).toBe("Reading image…"); await settle();
    expect(element<HTMLImageElement>('[alt="Company logo preview"]').src).toBe("blob:g15-preview");
    await click('[aria-label="Remove company logo"]'); expect(revoke).toHaveBeenCalledWith("blob:g15-preview");
  });
});
