import type { ReactNode } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { PublicSiteLocaleSync } from "@/features/public-site/i18n/public-site-locale-sync";
import {
  resolvePublicSiteLanguage,
  toPublicSitePath,
  type PublicSiteLocalizedPath,
} from "@/features/public-site/i18n/public-site-locale-routes";
import { createAccountSettingsModalPath } from "@/components/layout/account-modal-route";

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

// 기능 : legacy Settings route를 Settings 계정 모달 bridge로 이동시킵니다.
export function AccountSettingsModalBridge() {
  const location = useLocation();
  const currentSearchParams = new URLSearchParams(location.search);
  // Google Calendar OAuth 결과 query는 일정 화면의 기존 handler가 정리합니다.
  const bridgeTargetPath = currentSearchParams.has("googleCalendar")
    ? "/app/schedules"
    : "/app";

  return (
    <Navigate
      replace
      to={createAccountSettingsModalPath(bridgeTargetPath, currentSearchParams)}
    />
  );
}
