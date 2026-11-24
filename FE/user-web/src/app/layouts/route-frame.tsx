import { useMockAuth } from "@/features/mock-auth";
import { useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { introductionRoutes } from "@/features/public-introduction";
import { commercialRoutes } from "@/features/public-commercial";
import { contentRoutes } from "@/features/public-content";
import { companyRoutes, useCompanyHistory } from "@/features/public-company";
import { templateRoutes } from "@/features/public-template";

// 기능 : 새 문서의 default 이력 키도 경로별로 구분해 다른 URL의 스크롤을 복원하지 않는다.
function scrollHistoryKey(location: { pathname: string; search: string; key: string }) { return `${location.pathname}${location.search}:${location.key}`; }

// 기능 : 공개·내부 경계에 공통으로 이동 초점과 실제 브라우저 스크롤 이력을 관리한다.
export function RouteFrame() {
  useCompanyHistory();
  const { pathname } = useLocation(); const { store: auth } = useMockAuth();
  // 기능 : 실제 경로 이탈 때만 미활성 이메일 도전을 폐기해 StrictMode 효과 재연결과 구분한다.
  useEffect(function releaseEmailChallenge() { if (pathname !== "/verify-email" && auth.getSnapshot().emailChallenge) auth.cancelEmailChallenge(); if (pathname !== "/two-factor" && auth.getSnapshot().twoFactor) auth.cancelFactor(); if (!pathname.startsWith("/password/") && auth.getSnapshot().resetChallenge?.status !== "used" && auth.getSnapshot().resetChallenge) auth.cancelReset(); }, [pathname, auth]);
  // 기능 : 경로 변경 후 본문 초점을 옮기되 뒤로 이동의 스크롤 복원을 보존한다.
  useEffect(function focusRouteContent() {
    document.title = `${[...introductionRoutes, ...commercialRoutes, ...contentRoutes, ...templateRoutes, ...companyRoutes, { path: "/invoice-generator", title: "Invoice Generator" }, { path: "/help", title: "Help Center" }, { path: "/support", title: "Contact Us" }].find(route => route.path === pathname)?.title ?? "OneHand CRM"} · Bonsai UI preview`;
    document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
  }, [pathname]);
  return <><a className="skip-link" href="#main-content">Skip to content</a><Outlet /><ScrollRestoration storageKey="onehand.preview.scroll" getKey={scrollHistoryKey} /></>;
}
