import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, type ReactNode } from "react";
import { localPublicPath } from "../model/public-destinations";
import { usePublicExperience } from "../data/public-context";
import type { PublicIntentOptions } from "../data/public-context";
import { usePublicOrigin } from "../hooks/use-public-origin";

// 기능 : 공개 링크를 로컬 목적지로 연결하고 소셜 안내에는 전체 출발 이력과 메모리 수명을 전달한다.
export function PublicLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const origin = usePublicOrigin();
  const path = localPublicPath(href);
  const social = path === "/outbound/linkedin" || path === "/outbound/twitter";
  return <Link to={path} state={social ? { companyOrigin: origin?.path, companyOriginKey: origin?.key, companyOriginEntry: origin } : undefined} className={className}>{children}</Link>;
}

// 기능 : 가입 CTA의 출처를 한 번만 메모리에 인계하고 가상 가입 화면으로 이동한다.
export function SignupLink({ source, children, className = "public-button", intentOptions }: { source: string; children: ReactNode; className?: string; intentOptions?: PublicIntentOptions }) {
  const { start } = usePublicExperience();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navigating = useRef(false);
  // 기능 : 새 탭의 독립 메모리를 현재 탭 인계로 오인하지 않도록 일반 이동만 기록한다.
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault();
      if (pathname === "/signup" || navigating.current) return;
      navigating.current = true;
      const publicIntentId = start(source, pathname, false, intentOptions);
      void navigate("/signup", { state: { publicIntentId } });
    }
  }
  return <Link to="/signup" className={className} onClick={handleClick}>{children}</Link>;
}
