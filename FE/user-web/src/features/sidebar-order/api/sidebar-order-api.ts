import { apiClient } from "@/lib/api-client";

export type SidebarOrderSection = "objects" | "lists" | "view-favorites";
export type SidebarOrderResponse = { readonly items: readonly { readonly id: string; readonly sortOrder: number }[] };

// 기능 : 해당 섹션의 전체 ID 목록을 최종 순서대로 저장합니다.
export function saveSidebarOrder(workspaceId: string, section: SidebarOrderSection, orderedIds: readonly string[]) {
  return apiClient<SidebarOrderResponse>(
    `/api/users/me/sidebar/workspaces/${encodeURIComponent(workspaceId)}/${section}/order`,
    { method: "PATCH", body: { orderedIds: [...orderedIds] } },
  );
}
