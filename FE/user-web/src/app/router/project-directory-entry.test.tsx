import { act } from "react";
import { describe, expect, it } from "vitest";
import { router } from "@/app/router/router";
import { setupPreviewApp } from "@/test/preview-app";

const { element, navigate, click, choose, input, settle } = setupPreviewApp("/app/projects");
const search = '[aria-label="Search projects"]';
// 기능 : 실제 앱에서 보기 전환·검색·필터·표 메뉴의 연결과 이력 격리를 검증한다.
describe("G22 project directory", () => {
  // 기능 : 보기·필터·정렬 변경이 외부 query·hash·상태와 뒤로가기 문맥을 보존한다.
  it("preserves navigation context through views, filters, sort and history", async () => {
    await act(async () => router.navigate("/app/projects?keep=1#board", { state: { retained: true } })); await settle();
    await click('[aria-label="Project views"] button:nth-child(2)');
    expect(window.location.hash).toBe("#board"); expect(router.state.location.state).toEqual({ retained: true });
    await click(".project-filter"); await choose('[aria-label="Stage"]', "New Lead"); await click('[form="project-filter-form"]');
    await click(".project-table th:first-child button");
    const params = new URLSearchParams(window.location.search); expect(params.get("keep")).toBe("1"); expect(params.get("stage")).toBe("New Lead"); expect(params.get("dir")).toBe("desc");
    await click(".project-list-tools .client-text-action"); expect(new URLSearchParams(window.location.search).get("stage")).toBeNull();
    await act(async () => router.navigate(-1)); expect(new URLSearchParams(window.location.search).get("stage")).toBe("New Lead"); expect(window.location.hash).toBe("#board");
  });
  // 기능 : 조합 입력은 확정될 때만 검색하며 이력 이동 뒤의 늦은 조합 완료는 폐기한다.
  it("commits composition only in its originating entry", async () => {
    const count = document.querySelectorAll("[data-project-id]").length;
    await act(async () => element(search).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })));
    await input(search, "Consulting"); expect(window.location.search).toBe(""); expect(document.querySelectorAll("[data-project-id]")).toHaveLength(count);
    await act(async () => element(search).dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    expect(new URLSearchParams(window.location.search).get("q")).toBe("Consulting"); expect(document.querySelectorAll("[data-project-id]")).toHaveLength(1);
    await act(async () => element(search).dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))); await input(search, "Old draft");
    await navigate("/app/projects?q=Design&view=list"); await act(async () => element(search).dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })));
    expect(element<HTMLInputElement>(search).value).toBe("Design"); expect(new URLSearchParams(window.location.search).get("q")).toBe("Design");
  });
  // 기능 : 새 이력으로 이동하면 적용하지 않은 필터 초안과 열린 모달을 버린다.
  it("discards filter drafts on a new route entry", async () => {
    await click(".project-filter"); await choose('[aria-label="Stage"]', "In Progress");
    await navigate("/app/projects?view=list&stage=New+Lead"); expect(document.querySelector("#project-filter-form")).toBeNull();
    await click(".project-filter"); expect(element<HTMLSelectElement>('[aria-label="Stage"]').value).toBe("New Lead");
    await click(".dialog__close"); expect(new URLSearchParams(window.location.search).get("stage")).toBe("New Lead");
  });
  // 기능 : 새 목록 이력은 이전 행 메뉴를 닫고 미제공 삭제 안내는 데이터를 유지한다.
  it("closes stale row menus and keeps projects after an unavailable delete", async () => {
    await navigate("/app/projects?view=list"); await click(".project-table tbody tr .project-actions-trigger");
    await navigate("/app/projects?view=list&dir=desc"); expect(document.querySelector('[role="menu"]')).toBeNull();
    const count = document.querySelectorAll("[data-project-id]").length; await click(".project-table tbody tr .project-actions-trigger");
    await act(async () => document.querySelector<HTMLButtonElement>('[role="menuitem"]:last-child')!.click());
    expect(element("dialog").textContent).toContain("not available"); await click(".dialog__close"); expect(document.querySelectorAll("[data-project-id]")).toHaveLength(count);
  });
  // 기능 : 두 보기의 ID·금액·빈 열·메뉴와 상세 왕복 후 보드 위치를 함께 검증한다.
  it("shares projects across views and restores board position after detail return", async () => {
    const ids = Array.from(document.querySelectorAll<HTMLElement>("[data-project-id]"), node => node.dataset.projectId).sort();
    expect(document.querySelectorAll(".project-column")).toHaveLength(5); element(".project-board").scrollLeft = 420;
    await click('[aria-label="Project views"] button:nth-child(2)'); expect(Array.from(document.querySelectorAll<HTMLElement>("[data-project-id]"), node => node.dataset.projectId).sort()).toEqual(ids);
    expect(element(".project-table tbody tr td:nth-child(5)").textContent).toBe("$0.00");
    await click(".project-table tbody tr .project-actions-trigger");
    expect(Array.from(document.querySelectorAll('[role="menuitem"]'), node => node.textContent)).toEqual(["View Project", "Mark Completed", "Archive Project", "Delete Project"]);
    await act(async () => document.querySelector<HTMLButtonElement>('[role="menuitem"]')!.click()); await settle(); expect(window.location.pathname).toContain("/app/projects/studio-a");
    await act(async () => router.navigate(-1)); await settle(); expect(document.querySelector(".project-table")).not.toBeNull();
    await click('[aria-label="Project views"] button:first-child'); expect(element(".project-board").scrollLeft).toBe(420);
  });
});
