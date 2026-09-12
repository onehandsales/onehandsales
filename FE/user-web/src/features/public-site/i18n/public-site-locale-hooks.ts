import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  replacePublicSiteLocaleInPathname,
  toPublicSitePath,
  type PublicSiteLocalizedPath,
} from "@/features/public-site/i18n/public-site-locale-routes";
import {
  usePublicSiteLanguage,
  type PublicSiteLanguage,
} from "@/features/public-site/i18n/public-site-language";

// 기능 : Public Site Path hook으로 상태와 동작을 제공합니다.
export function usePublicSitePath() {
  const { language } = usePublicSiteLanguage();

  return useCallback(
    (pathname: PublicSiteLocalizedPath | string = "/") =>
      toPublicSitePath(language, pathname),
    [language]
  );
}

// 기능 : Public Site Locale Switcher hook으로 상태와 동작을 제공합니다.
export function usePublicSiteLocaleSwitcher() {
  // 1. 처리 흐름에 필요한 location 값을 준비한다.
  const location = useLocation();
  // 2. 처리 흐름에 필요한 navigate 값을 준비한다.
  const navigate = useNavigate();
  // 3. 처리 흐름에 필요한 { setLanguage } 값을 준비한다.
  const { setLanguage } = usePublicSiteLanguage();

  // 4. 계산된 결과를 호출자에게 반환한다.
  return useCallback(
    (nextLanguage: PublicSiteLanguage) => {
      setLanguage(nextLanguage);
      navigate(
        `${replacePublicSiteLocaleInPathname(
          location.pathname,
          nextLanguage
        )}${location.search}${location.hash}`,
        { replace: true }
      );
    },
    [location.hash, location.pathname, location.search, navigate, setLanguage]
  );
}
