import type { PreviewItem, PreviewSession } from "@/features/preview/model/preview-types";

export const SEED_TIME = "2024-02-06T09:00:00.000Z";
export const PREVIEW_SESSIONS: readonly PreviewSession[] = [
  { id: "preview-a", name: "Alex (preview)", role: "owner", workspaces: [
    { id: "studio-a", name: "Studio A" }, { id: "studio-a-two", name: "Studio A · Second" },
  ] },
  { id: "preview-b", name: "Blair (preview)", role: "member", workspaces: [
    { id: "studio-b", name: "Studio B" },
  ] },
];

// 기능 : 각 실행과 작업공간에 독립된 고정 항목을 만들어 초기화 결과를 재현한다.
export function createPreviewSeed(): Map<string, PreviewItem[]> {
  return new Map([
    ["preview-a/studio-a", [{ id: "sample-001", name: "Design Resources", updatedAt: SEED_TIME }]],
    ["preview-a/studio-a-two", [{ id: "sample-001", name: "Second studio sample", updatedAt: SEED_TIME }]],
    ["preview-b/studio-b", [{ id: "sample-001", name: "Member sample", updatedAt: SEED_TIME }]],
  ]);
}
