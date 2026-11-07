import { useSyncExternalStore } from "react";
import type { PublicSiteLanguage } from "./i18n/public-site-language";

const mobileImageQuery = "(max-width: 767px)";

// 기능 : 화면 구간이 바뀌면 기존 이미지 영역에 맞는 캡처를 다시 선택합니다.
function subscribeToImageViewport(onChange: () => void) {
  const media = window.matchMedia(mobileImageQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

// 기능 : 모바일 화면 여부를 읽고 레이아웃 변경 없이 이미지 소스만 선택합니다.
function isMobileImageViewport() {
  return window.matchMedia(mobileImageQuery).matches;
}

// 기능 : 서버 렌더링에서는 기본 데스크톱 캡처를 사용합니다.
function getServerImageViewport() {
  return false;
}

// 기능 : 언어와 화면 폭에 맞는 실제 제품 캡처 경로를 반환합니다.
export function usePublicProductImage(imagePath: string, language: PublicSiteLanguage) {
  const mobile = useSyncExternalStore(
    subscribeToImageViewport,
    isMobileImageViewport,
    getServerImageViewport,
  );
  const locale = language === "ko" ? "ko" : "en";
  return imagePath.replace(/\.jpg$/, `-${locale}${mobile ? "-mobile" : ""}.jpg`);
}
