import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { PreviewScope } from "@/features/preview";

const positions = new Map<string, number>();
// 기능 : 작업 보드의 가로 위치를 문맥·필터별로 보관하고 실제 이력 복귀에 복원한다.
export function useTaskBoardScroll(scope: PreviewScope, ready: boolean) {
  const root = useRef<HTMLDivElement>(null); const location = useLocation();
  const params = new URLSearchParams(location.search);
  for (const key of ["task", "taskProject", "taskStatus"]) params.delete(key);
  params.sort();
  const key = `${scope.actorId}:${scope.workspaceId}:${scope.revision}:${location.pathname}?${params}`;
  // 기능 : 데이터 준비 후 위치를 복원하고 화면 이탈 시 최신 위치만 남긴다.
  useLayoutEffect(function restorePosition() {
    const node = root.current; if (!ready || !node) return;
    node.scrollLeft = positions.get(key) ?? 0;
    // 기능 : 보드 수명이 끝나면 위치를 저장하고 오래된 문맥의 메모리를 제한한다.
    return function rememberPosition() { positions.set(key, node.scrollLeft); if (positions.size > 100) positions.delete(positions.keys().next().value!); };
  }, [key, ready]);
  return root;
}
