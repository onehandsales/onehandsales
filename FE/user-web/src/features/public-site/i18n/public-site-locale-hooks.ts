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
  const location = useLocation();
  const navigate = useNavigate();
  const { setLanguage } = usePublicSiteLanguage();

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
