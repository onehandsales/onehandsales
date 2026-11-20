import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PublicFooter, PublicHeader } from "@/features/public-web";
import "@/styles/public-web.css";

// 기능 : 내부 앱과 구분된 공개 폰트·메뉴·푸터와 스크롤 헤더를 조립한다.
export function PublicLayout() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  // 기능 : 원본 스크롤 헤더 상태를 갱신하고 공개 경계를 나갈 때 리스너를 정리한다.
  useEffect(function observePublicScroll() {
    // 기능 : 스크롤 위치에 따라 그림자와 원본 고정 헤더 위치를 선택한다.
    function updateScroll() { setScrolled(window.scrollY > 100); }
    updateScroll(); window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  return <div className="public-web"><PublicHeader key={pathname} scrolled={scrolled} /><main id="main-content" tabIndex={-1}><Outlet /></main><PublicFooter /></div>;
}
