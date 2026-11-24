import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PublicFooter, PublicHeader, usePublicExperience } from "@/features/public-web";
import type { PublicIntentOptions } from "@/features/public-web";
import { usePreviewEnvironment } from "@/features/preview";
import { templateRoutes, TemplateDetailHeader, quotePath } from "@/features/public-template";
import { companyRoutes, readCompanyOrigin } from "@/features/public-company";
import "@/styles/public-web.css";

// 기능 : 공개 레이아웃·스크롤 헤더를 조립하고 회사 화면의 전체 URL과 외부 안내 복귀를 가입에 인계한다.
export function PublicLayout() {
  const location = useLocation(); const { pathname } = location;
  const { scope } = usePublicExperience();
  const { state } = usePreviewEnvironment();
  const introduction = ["/crm", "/software/consulting", "/software/small-businesses"].includes(pathname);
  const company = companyRoutes.some(route => route.path === pathname);
  const signupIntentOptions: PublicIntentOptions | undefined = company ? { returnTo: pathname + location.search + location.hash, returnOrigin: readCompanyOrigin(location.state?.companyOriginEntry, scope), returnOriginKind: "company" } : undefined;
  const commercial = ["/pricing", "/reviews"].includes(pathname);
  const content = pathname === "/blog" || pathname.startsWith("/blog/") || pathname === "/invoice-generator";
  const template = pathname.startsWith("/templates") || templateRoutes.some(route => route.path === pathname) || pathname.includes("-template");
  const [scrolled, setScrolled] = useState(false);
  // 기능 : 원본 스크롤 헤더 상태를 갱신하고 공개 경계를 나갈 때 리스너를 정리한다.
  useEffect(function observePublicScroll() {
    // 기능 : 스크롤 위치에 따라 그림자와 원본 고정 헤더 위치를 선택한다.
    function updateScroll() { setScrolled(window.scrollY > 100); }
    updateScroll(); window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  return <div className={`public-web ${introduction ? "public-introduction" : ""} ${commercial ? "public-commercial" : ""} ${company ? "public-company" : ""} ${pathname === "/careers" ? "is-careers" : ""} ${pathname === "/affiliates" ? "is-affiliate" : ""} ${content ? "public-content" : ""} ${template ? "public-template" : ""} ${pathname === "/pricing" ? "is-pricing" : ""} ${pathname === "/software/small-businesses" ? "is-small-business" : ""}`}>{pathname === quotePath ? <TemplateDetailHeader /> : <PublicHeader key={pathname} scrolled={scrolled} signedIn={Boolean(state.session)} signupIntentOptions={signupIntentOptions} />}<main id="main-content" tabIndex={-1}><Outlet /></main><PublicFooter /></div>;
}
