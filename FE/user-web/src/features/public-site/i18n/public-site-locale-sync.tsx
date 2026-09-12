import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getPublicSiteLanguageFromPathname } from "@/features/public-site/i18n/public-site-locale-routes";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

type PublicSiteLocaleSyncProps = {
  readonly children: ReactNode;
};

// 기능 : PublicSiteLocaleSync 컴포넌트를 렌더링합니다.
export function PublicSiteLocaleSync({
  children,
}: PublicSiteLocaleSyncProps) {
  const location = useLocation();
  const { language, setLanguage } = usePublicSiteLanguage();

  useEffect(() => {
    const routeLanguage = getPublicSiteLanguageFromPathname(location.pathname);

    if (routeLanguage && routeLanguage !== language) {
      setLanguage(routeLanguage);
    }
  }, [language, location.pathname, setLanguage]);

  return children;
}
