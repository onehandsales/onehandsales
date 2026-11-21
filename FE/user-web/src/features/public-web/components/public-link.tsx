import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { localPublicPath } from "../model/public-destinations";
import { usePublicExperience } from "../data/public-context";
import type { PublicIntentOptions } from "../data/public-context";

// 기능 : 공개 원본 링크를 등록한 로컬 목적지로 이동시킨다.
export function PublicLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const location = useLocation();
  const path = localPublicPath(href);
  const social = path === "/outbound/linkedin" || path === "/outbound/twitter";
  return <Link to={path} state={social ? { companyOrigin: location.pathname + location.search, companyOriginKey: location.key } : undefined} className={className}>{children}</Link>;
}

// 기능 : 가입 CTA의 출처만 메모리에 인계하고 미구현 가입 경계로 이동한다.
export function SignupLink({ source, children, className = "public-button", intentOptions }: { source: string; children: ReactNode; className?: string; intentOptions?: PublicIntentOptions }) {
  const { start } = usePublicExperience();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // 기능 : 새 탭의 독립 메모리를 현재 탭 인계로 오인하지 않도록 일반 이동만 기록한다.
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      if (pathname === "/signup") return;
      const publicIntentId = start(source, pathname, false, intentOptions);
      void navigate("/signup", { state: { publicIntentId } });
    }
  }
  return <Link to="/signup" className={className} onClick={handleClick}>{children}</Link>;
}
