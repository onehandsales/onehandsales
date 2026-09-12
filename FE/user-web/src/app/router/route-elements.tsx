import type { ReactNode } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { PublicSiteSeo } from "@/features/public-site/seo/public-site-seo";
import { PublicSiteLocaleSync } from "@/features/public-site/i18n/public-site-locale-sync";
import {
  resolvePublicSiteLanguage,
  toPublicSitePath,
  type PublicSiteLocalizedPath,
} from "@/features/public-site/i18n/public-site-locale-routes";

// 기능 : 공개 사이트 라우트 영역을 렌더링합니다.
export function PublicSiteRoute({ children }: { readonly children: ReactNode }) {
  return (
    <PublicSiteLocaleSync>
      <PublicSiteSeo />
      {children}
    </PublicSiteLocaleSync>
  );
}

// 기능 : 레거시 공개 사이트 리다이렉트 영역을 렌더링합니다.
export function LegacyPublicSiteRedirect({
  to,
}: {
  readonly to: PublicSiteLocalizedPath;
}) {
  // 1. 처리 흐름에 필요한 location 값을 준비한다.
  const location = useLocation();
  // 2. 이후 단계에서 사용할 language 값을 준비한다.
  const language = resolvePublicSiteLanguage(location.pathname);
  // 3. 이후 단계에서 사용할 targetPath 값을 준비한다.
  const targetPath = toPublicSitePath(language, to);

  // 4. 계산된 결과를 호출자에게 반환한다.
  return (
    <Navigate
      replace
      to={`${targetPath}${location.search}${location.hash}`}
    />
  );
}

// 기능 : 레거시 앱 리다이렉트 영역을 렌더링합니다.
export function LegacyAppRedirect({
  paramName,
  to,
}: {
  readonly paramName?: string;
  readonly to: string;
}) {
  // 1. 처리 흐름에 필요한 location 값을 준비한다.
  const location = useLocation();
  // 2. 처리 흐름에 필요한 params 값을 준비한다.
  const params = useParams();
  // 3. 이후 단계에서 사용할 paramValue 값을 준비한다.
  const paramValue = paramName ? params[paramName] : undefined;
  // 4. 이후 단계에서 사용할 targetPath 값을 준비한다.
  const targetPath = paramValue ? `${to}/${encodeURIComponent(paramValue)}` : to;

  // 5. 계산된 결과를 호출자에게 반환한다.
  return <Navigate replace to={`${targetPath}${location.search}`} />;
}
