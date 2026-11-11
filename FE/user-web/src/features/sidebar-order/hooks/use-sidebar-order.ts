import { useRef, useState } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { ApiClientError } from "@/lib/api-client";
import { saveSidebarOrder, type SidebarOrderSection } from "../api/sidebar-order-api";
import { orderItems } from "../order-items";

export type SidebarOrderControl = {
  readonly isSaving: boolean;
  readonly error: "conflict" | "failed" | null;
  readonly onReorder: (orderedIds: readonly string[]) => Promise<void>;
};

type Options<T> = {
  readonly userId: string | null;
  readonly workspaceId: string | null | undefined;
  readonly section: SidebarOrderSection;
  readonly queryKey: QueryKey;
  readonly items: readonly T[];
};

// 기능 : 사용자/Workspace별 cache에서 낙관적 순서 저장과 실패 복구를 처리합니다.
export function useSidebarOrder<T extends { readonly id: string }>(options: Options<T>): SidebarOrderControl {
  const queryClient = useQueryClient();
  const pending = useRef(new Set<string>());
  const [state, setState] = useState<{ scope: string; saving: boolean; error: SidebarOrderControl["error"] } | null>(null);
  const scope = JSON.stringify([options.userId, options.workspaceId, options.section]);

  // 기능 : 같은 섹션의 저장 중 중복 요청을 막고 이전 범위 응답을 현재 목록에 적용하지 않습니다.
  async function onReorder(orderedIds: readonly string[]) {
    const { userId, workspaceId, section, queryKey } = options;
    if (!userId || !workspaceId || pending.current.has(scope)) return;
    const snapshot = queryClient.getQueryData<readonly T[]>(queryKey) ?? options.items;
    if (new Set(orderedIds).size !== snapshot.length || orderedIds.length !== snapshot.length ||
      snapshot.some(item => !orderedIds.includes(item.id))) {
      setState({ scope, saving: false, error: "conflict" });
      await queryClient.invalidateQueries({ queryKey, exact: true });
      return;
    }
    if (snapshot.every((item, index) => item.id === orderedIds[index])) return;
    pending.current.add(scope);
    setState({ scope, saving: true, error: null });
    try {
      // 1. 진행 중인 조회를 취소한 후 해당 cache에만 낙관적 순서를 반영한다.
      await queryClient.cancelQueries({ queryKey, exact: true });
      queryClient.setQueryData(queryKey, orderItems(snapshot, orderedIds));
      const result = await saveSidebarOrder(workspaceId, section, orderedIds);
      // 2. 저장 중 다른 동작으로 추가된 항목을 보존하고 서버 결과를 적용한다.
      queryClient.setQueryData<readonly T[]>(queryKey, current =>
        orderItems(current ?? snapshot, result.items.map(item => item.id)));
      setState(current => current?.scope === scope ? { scope, saving: true, error: null } : current);
    } catch (error) {
      queryClient.setQueryData<readonly T[]>(queryKey, current =>
        orderItems(current ?? snapshot, snapshot.map(item => item.id)));
      setState(current => current?.scope === scope
        ? { scope, saving: true, error: error instanceof ApiClientError && error.statusCode === 409 ? "conflict" : "failed" }
        : current);
    } finally {
      // 3. 성공/실패 모두 최신 서버 목록을 복원한다. 자동 쓰기 재시도는 하지 않는다.
      try {
        await queryClient.invalidateQueries({ queryKey, exact: true });
      } finally {
        pending.current.delete(scope);
        setState(current => current?.scope === scope ? { ...current, saving: false } : current);
      }
    }
  }

  return { isSaving: state?.scope === scope && state.saving, error: state?.scope === scope ? state.error : null, onReorder };
}
