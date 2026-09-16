import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/auth";
import {
  resolvePublicSiteLanguage,
  resolvePublicSiteLanguageFromUserProfile,
  toPublicSitePath,
} from "@/features/public-site/i18n/public-site-locale-routes";
import type { PublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";
import {
  CrmEnvironmentBuildingScreen,
  useCrmEnvironmentBuildProgress,
  useDefaultSidebarWorkspaceQuery,
} from "@/features/workspace";
import { getApiErrorMessage } from "@/lib/api-client";

type WorkspaceLoadingCopy = {
  readonly logoAria: string;
  readonly buildingTitle: string;
  readonly progressLabel: string;
};

const workspaceLoadingCopyByLanguage: Record<
  PublicSiteLanguage,
  WorkspaceLoadingCopy
> = {
  ko: {
    logoAria: "OneHand 홈",
    buildingTitle: "작업공간을 불러오고 있어요.",
    progressLabel: "작업공간 불러오기 진행률",
  },
  "en-US": {
    logoAria: "OneHand home",
    buildingTitle: "Loading your Workspace.",
    progressLabel: "Workspace loading progress",
  },
  "en-CA": {
    logoAria: "OneHand home",
    buildingTitle: "Loading your Workspace.",
    progressLabel: "Workspace loading progress",
  },
};

const workspaceLoadingHtmlLangByLanguage: Record<PublicSiteLanguage, string> = {
  ko: "ko-KR",
  "en-US": "en-US",
  "en-CA": "en-CA",
};

// 기능 : 앱 진입 전 기본 Workspace를 불러오는 전체 화면을 렌더링합니다.
export function WorkspaceLoadingPage() {
  const { user } = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const fallbackLanguage = resolvePublicSiteLanguage(location.pathname);
  const workspaceLoadingLanguage = resolvePublicSiteLanguageFromUserProfile(
    user,
    fallbackLanguage
  );
  const copy = workspaceLoadingCopyByLanguage[workspaceLoadingLanguage];
  const htmlLang = workspaceLoadingHtmlLangByLanguage[workspaceLoadingLanguage];
  const homePath = toPublicSitePath(workspaceLoadingLanguage, "/");
  const defaultWorkspaceQuery = useDefaultSidebarWorkspaceQuery();
  const buildProgress = useCrmEnvironmentBuildProgress(true);

  useEffect(() => {
    // 1. 기본 Workspace 조회와 구축 연출이 모두 끝난 뒤 앱 첫 화면으로 이동한다.
    if (!buildProgress.isDone || !defaultWorkspaceQuery.data) {
      return;
    }

    navigate(
      `/app?workspaceId=${encodeURIComponent(defaultWorkspaceQuery.data.id)}`,
      { replace: true }
    );
  }, [buildProgress.isDone, defaultWorkspaceQuery.data, navigate]);

  return (
    <CrmEnvironmentBuildingScreen
      errorMessage={
        defaultWorkspaceQuery.error
          ? getApiErrorMessage(defaultWorkspaceQuery.error)
          : null
      }
      homePath={homePath}
      htmlLang={htmlLang}
      logoAria={copy.logoAria}
      progress={buildProgress.progress}
      progressLabel={copy.progressLabel}
      title={copy.buildingTitle}
    />
  );
}
