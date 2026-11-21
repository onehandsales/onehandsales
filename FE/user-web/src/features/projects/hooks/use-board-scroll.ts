import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useProjects } from "./use-projects";
import type { ProjectView } from "../model/project-types";
const positions = new Map<string, number>();
const revealed = new Set<string>();
// 기능 : 같은 세션·검색/필터의 보드 위치를 뷰 전환·상세 복귀에 보존하며 새 생성 카드만 한 번 노출한다.
export function useBoardScroll(projects: ProjectView[]) { const root = useRef<HTMLDivElement>(null); const location = useLocation(); const { scope } = useProjects(); const params = new URLSearchParams(location.search); const key = `${scope.actorId}:${scope.workspaceId}:${scope.revision}:${params.get("q") ?? ""}:${params.get("stage") ?? ""}:${params.get("client") ?? ""}`; const hasCreated = projects.some(project => project.id === (location.state as { createdProjectId?: string } | null)?.createdProjectId);
  // 기능 : 최초 마운트는 저장 위치를 복원하고 이탈 직전의 실제 스크롤을 메모리에 보관한다.
  useLayoutEffect(function restoreScroll() { const node = root.current; if (!node) return; const previous = positions.get(key); const createdKey = `${key}:${location.key}`; if (hasCreated && !revealed.has(createdKey)) { revealed.add(createdKey); if (revealed.size > 100) revealed.delete(revealed.values().next().value!); const id = (location.state as { createdProjectId?: string } | null)?.createdProjectId; const card = Array.from(node.querySelectorAll<HTMLElement>("[data-project-id]")).find(item => item.dataset.projectId === id); if (card) node.scrollLeft = Math.max(0, card.offsetLeft - node.offsetLeft - 440); } else if (previous !== undefined) node.scrollLeft = previous;
    return function savePosition() { positions.set(key, node.scrollLeft); if (positions.size > 100) positions.delete(positions.keys().next().value!); };
  }, [key, hasCreated, location.key, location.state]); return root; }
