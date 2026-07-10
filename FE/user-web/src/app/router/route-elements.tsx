import type { ReactNode } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { PublicSiteLocaleSync } from "@/features/public-site/i18n/public-site-locale-sync";
import {
  resolvePublicSiteLanguage,
  toPublicSitePath,
  type PublicSiteLocalizedPath,
} from "@/features/public-site/i18n/public-site-locale-routes";

export function PublicSiteRoute({ children }: { readonly children: ReactNode }) {
  return <PublicSiteLocaleSync>{children}</PublicSiteLocaleSync>;
}

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
