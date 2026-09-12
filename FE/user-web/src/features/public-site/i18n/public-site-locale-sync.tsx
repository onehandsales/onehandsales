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
  // 1. 화면 상태와 동작에 필요한 location 값을 준비한다.
  const location = useLocation();
  // 2. 화면 상태와 동작에 필요한 { language, setLanguage } 값을 준비한다.
  const { language, setLanguage } = usePublicSiteLanguage();

  // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
  useEffect(() => {
    const routeLanguage = getPublicSiteLanguageFromPathname(location.pathname);

    if (routeLanguage && routeLanguage !== language) {
      setLanguage(routeLanguage);
    }
  }, [language, location.pathname, setLanguage]);

  // 4. 계산된 결과를 호출자에게 반환한다.
  return children;
}
