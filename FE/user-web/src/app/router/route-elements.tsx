import type { ReactNode } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { PublicSiteLocaleSync } from "@/features/public-site/i18n/public-site-locale-sync";
import {
  resolvePublicSiteLanguage,
  toPublicSitePath,
  type PublicSiteLocalizedPath,
} from "@/features/public-site/i18n/public-site-locale-routes";

// 기능 : 공개 사이트 라우트 영역을 렌더링합니다.
export function PublicSiteRoute({ children }: { readonly children: ReactNode }) {
  return <PublicSiteLocaleSync>{children}</PublicSiteLocaleSync>;
}

// 기능 : 레거시 공개 사이트 리다이렉트 영역을 렌더링합니다.
export function LegacyPublicSiteRedirect({
  to,
}: {
  readonly to: PublicSiteLocalizedPath;
}) {
  const location = useLocation();
  const language = resolvePublicSiteLanguage(location.pathname);
  const targetPath = toPublicSitePath(language, to);

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
  const location = useLocation();
  const params = useParams();
  const paramValue = paramName ? params[paramName] : undefined;
  const targetPath = paramValue ? `${to}/${encodeURIComponent(paramValue)}` : to;

  return <Navigate replace to={`${targetPath}${location.search}`} />;
}
