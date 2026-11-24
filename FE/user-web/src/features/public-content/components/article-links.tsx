import type { MouseEvent, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { publicHistoryIndex, readPublicOrigin, usePublicExperience, usePublicOrigin } from "@/features/public-web";

// 기능 : 카드·본문 관련 기사가 같은 탭의 전체 출발 URL과 이력을 전달하게 한다.
export function ArticleLink({ to, children }: { to: string; children: ReactNode }) {
  const origin = usePublicOrigin();
  return <Link to={to} state={{ articleOrigin: origin }}>{children}</Link>;
}

// 기능 : 같은 메모리의 출발 이력으로 복귀하고 직접 진입·새 탭·초기화는 기본 블로그로 연결한다.
export function ArticleBackLink() {
  const { state } = useLocation();
  const { scope } = usePublicExperience();
  const navigate = useNavigate();
  const candidate = readPublicOrigin(state?.articleOrigin, scope);
  const origin = candidate && /^\/(blog(?:[/?#]|$)|software\/small-businesses(?:[?#]|$))/.test(candidate.path) ? candidate : undefined;
  // 기능 : 가입 취소 등 중간 이력이 추가되어도 저장한 출발 위치로 돌아가며 보조 클릭은 기본 링크로 유지한다.
  function handleBack(event: MouseEvent<HTMLAnchorElement>) {
    const index = publicHistoryIndex();
    if (!event.defaultPrevented && origin && index !== undefined && index > origin.index && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault(); void navigate(origin.index - index);
    }
  }
  return <Link className="article-back" to={origin?.path ?? "/blog"} onClick={handleBack}>← Back to Blog</Link>;
}
