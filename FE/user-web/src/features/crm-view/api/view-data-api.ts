import { apiClient } from "@/lib/api-client";
import type { ViewDataRequest, ViewDataResponse, ViewGroupResponse, ViewMainResponse } from "../types/view-data";

// 기능 : 기존 인증 흐름으로 본문을 조회하고 선택한 대상과 응답의 일치를 확인합니다.
async function readViewData(input: ViewDataRequest, part: "MAIN" | "GROUP_ITEMS", signal: AbortSignal, groupToken?: string) {
  // 1. 저장 상태는 GET으로 읽고 임시 편집은 별도 미리보기 POST로 전달한다.
  const query = new URLSearchParams({ sourceType: input.sourceType, limit: String(input.limit), part });
  if (input.q) query.set("q", input.q);
  if (input.cursor) query.set("cursor", input.cursor);
  if (groupToken) query.set("groupToken", groupToken);
  const base = `/api/users/me/workspaces/${encodeURIComponent(input.workspaceId)}/view-definitions/${encodeURIComponent(input.viewDefinitionId)}/data`;
  const response = await apiClient<ViewDataResponse>(input.preview ? `${base}/preview?sourceType=${input.sourceType}` : `${base}?${query}`,
    input.preview ? { signal, method: "POST", body: JSON.stringify({ ...input.preview, query: { part, q: input.q, limit: input.limit,
      ...(input.cursor ? { cursor: input.cursor } : {}), ...(groupToken ? { groupToken } : {}) } }) } : { signal });
  // 2. 이전 대상·보기·타입의 응답을 현재 본문에 적용하지 않는다.
  const sourceId = input.sourceType === "OBJECT" ? response?.source?.objectDefinitionId : response?.source?.listDefinitionId;
  if (!response || typeof response.viewDefinitionId !== "string" || response.viewDefinitionId.toLowerCase() !== input.viewDefinitionId.toLowerCase() ||
      response.viewType !== input.viewType || response.part !== part || response.source?.kind !== input.sourceType ||
      sourceId?.toLowerCase() !== input.targetId.toLowerCase() ||
      !["READY", "NEEDS_CONFIGURATION"].includes(response.state) || typeof response.configurationFingerprint !== "string" || !Array.isArray(response.bindings))
    throw new Error("View data response mismatch");
  return response;
}

// 기능 : 선택 View의 첫 본문 또는 표·목록의 다음 페이지를 읽습니다.
export async function getViewMainData(input: ViewDataRequest, signal: AbortSignal): Promise<ViewMainResponse> {
  const response = await readViewData(input, "MAIN", signal);
  if (response.part !== "MAIN") throw new Error("View data part mismatch");
  return response;
}

// 기능 : 서버에서 받은 그룹 token으로 칸반 열의 카드 페이지를 읽습니다.
export async function getViewGroupData(input: ViewDataRequest & { readonly groupToken: string }, signal: AbortSignal): Promise<ViewGroupResponse> {
  const response = await readViewData(input, "GROUP_ITEMS", signal, input.groupToken);
  if (response.part !== "GROUP_ITEMS") throw new Error("View data part mismatch");
  if (response.state === "READY" && response.data.groupToken !== input.groupToken) throw new Error("View group token mismatch");
  return response;
}
