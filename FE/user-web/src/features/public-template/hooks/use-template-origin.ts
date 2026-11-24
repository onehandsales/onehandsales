import type { MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { publicHistoryIndex, readPublicOrigin, usePublicExperience } from "@/features/public-web";
import type { PublicIntentOptions } from "@/features/public-web";
import { templateSelection } from "../data/template-catalog";
import type { PublicTemplate } from "../data/template-catalog";

// 기능 : 같은 공개 메모리의 템플릿 출발 이력만 사용하고 가입 취소 이후에도 최초 목록으로 복귀한다.
export function useTemplateOrigin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scope } = usePublicExperience();
  const candidate = readPublicOrigin(location.state?.templateOrigin, scope);
  const origin = candidate && /^\/(templates(?:[/?#]|$)|invoice-template(?:[/?#]|$))/.test(candidate.path) ? candidate : undefined;
  // 기능 : 중간 가입 이력을 건너뛰어 출발 위치로 이동하며 새 탭·수정 키는 실제 링크를 유지한다.
  function goBack(event: MouseEvent<HTMLAnchorElement>) {
    const index = publicHistoryIndex();
    if (!event.defaultPrevented && origin && index !== undefined && index > origin.index && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault(); void navigate(origin.index - index);
    }
  }
  return { origin, path: origin?.path ?? "/templates", goBack };
}

// 기능 : 템플릿 선택과 현재 전체 URL·출발 이력을 같은 가입 snapshot에 전달한다.
export function useTemplateIntent(item: Pick<PublicTemplate, "id" | "title" | "path" | "type">): PublicIntentOptions {
  const location = useLocation();
  const { origin } = useTemplateOrigin();
  return { template: templateSelection(item), returnTo: location.pathname + location.search + location.hash, returnOrigin: origin, returnOriginKind: "template" };
}
