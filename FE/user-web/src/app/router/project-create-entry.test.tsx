import { act } from "react";
import { describe, expect, it } from "vitest";
import { router } from "@/app/router/router";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle } = setupPreviewApp("/app/projects");
const submit = '[form="new-project-form"]';
// 기능 : 프로젝트 고객 선택에서 실제 기본 연락처 행을 선택한다.
async function selectClient(index = 0) { await click(".project-client-trigger"); await click(`.project-client-menu [role="option"]:nth-child(${index + 1})`); }
// 기능 : 생성 폼의 조합 키가 브라우저 기본 동작으로 전파되는지 확인한다.
async function key(value: string) { const event = new KeyboardEvent("keydown", { key: value, isComposing: true, bubbles: true, cancelable: true }); await act(async () => element(".project-title-field input").dispatchEvent(event)); return event; }
// 기능 : 두 생성 경로·실패/취소·이력과 고객 연결을 실제 앱에서 검증한다.
describe("G21 project creation", () => {
  // 기능 : 생성 모달 취소는 원래 query·hash·상태를 보존한다.
  it("preserves navigation context when cancelling from either entry", async () => {
    for (const path of ["/app/projects?keep=1#board", "/app/clients/studio-a%3Aclient-doe?keep=1#projects"]) {
      await act(async () => router.navigate(path, { state: { retained: true } })); await settle();
      await click(path.includes("/clients/") ? '[aria-label="Add project"]' : ".project-list-tools a"); await settle();
      await click(".project-dialog .dialog__close");
      expect(window.location.pathname + window.location.search + window.location.hash).toBe(path);
      expect(router.state.location.state).toEqual({ retained: true });
    }
  });
  // 기능 : 조합 Enter/Escape를 차단하고 고객 하위 폼을 다녀온 뒤 정상 제출한다.
  it("guards composing keys and clears composition on the nested client transition", async () => {
    await click(".project-list-tools a"); await settle(); await input(".project-title-field input", "Composing title");
    await act(async () => element(".project-title-field input").dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    expect((await key("Escape")).defaultPrevented).toBe(true); expect((await key("Enter")).defaultPrevented).toBe(true);
    await click(".project-client-trigger"); await click(".project-new-client"); await click(".client-dialog .dialog__close");
    await selectClient(); await click(submit); await settle(); await settle();
    expect(element('[data-project-id="studio-a:project-new-1"]').textContent).toContain("Composing title");
  });
  // 기능 : 필수 오류는 수정할 입력과 연결되고 해당 제어로 초점이 이동한다.
  it("focuses and describes invalid title and client controls", async () => {
    await click(".project-list-tools a"); await settle(); await click(submit); await settle();
    const title = element<HTMLInputElement>(".project-title-field input");
    expect(document.activeElement).toBe(title); expect(title.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(title.getAttribute("aria-describedby") ?? "")?.textContent).toContain("title");
    await input(".project-title-field input", "Title"); await click(submit); await settle();
    const client = element(".project-client-trigger"); expect(document.activeElement).toBe(client);
    expect(client.getAttribute("aria-invalid")).toBe("true");
  });
  // 기능 : 고객 고정 생성 결과를 같은 고객·목록에 표시하고 과거 성공 안내를 재생하지 않는다.
  it("creates from the fixed client and does not replay success on history return", async () => {
    await navigate("/app/clients/studio-a%3Aclient-doe"); await settle(); await click('[aria-label="Add project"]'); await settle();
    expect(document.querySelector(".project-client-trigger")).toBeNull();
    await input(".project-title-field input", "Client project"); await click(submit); await click(submit); await settle(); await settle();
    expect(element("h1").textContent).toBe("Client project"); expect(element(".project-context-row").textContent).toContain("Doe Company");
    expect(element(".client-notice").textContent).toContain("Project created successfully");
    await navigate("/app/clients/studio-a%3Aclient-doe"); await settle(); expect(element(".client-project-list").textContent).toContain("Client project");
    await act(async () => router.navigate(-1)); await settle(); expect(document.querySelector(".client-notice")).toBeNull();
  });
  // 기능 : 열 생성의 단계·샘플 안내와 저장 실패 재시도는 한 프로젝트만 남긴다.
  it("retries a column creation once while preserving sample selection and title", async () => {
    await choose('[aria-label="Project scenario"]', "write-error"); await click('[aria-label="New project in In Progress"]'); await settle();
    await selectClient(1); expect(element(".project-sample-note").textContent).toContain("automatically");
    await input(".project-title-field input", "Column project"); await click(submit); await settle();
    expect(element('#new-project-form [role="alert"]').textContent).toContain("preserved");
    await click(submit); await click(submit); await settle(); await settle();
    expect(element('.project-column[aria-label="In Progress"] [data-project-id="studio-a:project-new-1"]').textContent).toContain("Column project");
    expect(document.querySelectorAll('[data-project-id="studio-a:project-new-1"]')).toHaveLength(1);
  });
  // 기능 : 같은 URL의 새 이력에서 이전 생성 요청과 제목 초안을 폐기한다.
  it("cancels a delayed creation when its route entry is replaced", async () => {
    await choose('[aria-label="Project scenario"]', "slow"); await click(".project-list-tools a"); await settle(1700);
    await selectClient(); await input(".project-title-field input", "Aborted project"); await click(submit);
    await navigate("/app/projects?create=project&visit=2"); await settle(1700);
    expect(element<HTMLInputElement>(".project-title-field input").value).toBe("");
    await click(".project-dialog .dialog__close"); await settle(1700); expect(document.querySelector('[data-project-id="studio-a:project-new-1"]')).toBeNull();
  }, 12000);
});
