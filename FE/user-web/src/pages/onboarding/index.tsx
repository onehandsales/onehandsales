import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import {
  useAuthSession,
  useCompleteJobSelectionOnboardingMutation,
} from "@/features/auth";
import {
  getPublicSiteLanguageFromPathname,
  resolvePublicSiteLanguage,
  resolvePublicSiteLanguageFromUserProfile,
  toPublicSitePath,
} from "@/features/public-site/i18n/public-site-locale-routes";
import type { PublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";
import {
  CrmEnvironmentBuildingScreen,
  useCrmEnvironmentBuildProgress,
} from "@/features/workspace";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type JobOptionKey =
  | "sales"
  | "marketing"
  | "realEstate"
  | "recruiting"
  | "technicalSales"
  | "insuranceFinance"
  | "educationCoaching"
  | "other";

type JobOption = {
  readonly key: JobOptionKey;
  readonly label: string;
  readonly imageAlt: string;
  readonly imageSrc: string;
};

type OnboardingCopy = {
  readonly logoAria: string;
  readonly title: string;
  readonly subtitle: string;
  readonly buildingTitle: string;
  readonly progressLabel: string;
  readonly jobs: readonly Omit<JobOption, "imageSrc">[];
};

const jobImageSrcByKey: Record<JobOptionKey, string> = {
  sales:
    "https://static.vecteezy.com/system/resources/previews/003/592/676/non_2x/single-continuous-line-drawing-of-two-young-sales-manager-analyze-sales-growth-chart-on-screen-monitor-with-marketing-staff-sales-growth-evaluation-concept-one-line-draw-design-illustration-vector.jpg",
  marketing:
    "https://static.vecteezy.com/system/resources/previews/024/211/247/non_2x/single-one-line-drawing-digital-marketing-social-media-market-digital-concept-continuous-line-drawing-illustration-vector.jpg",
  realEstate:
    "https://static.vecteezy.com/system/resources/previews/027/839/179/non_2x/continuous-line-drawing-of-housing-estate-building-single-line-vector.jpg",
  recruiting:
    "https://static.vecteezy.com/system/resources/previews/043/178/770/non_2x/continuous-one-line-drawing-job-search-recruiting-hiring-concept-doodle-illustration-vector.jpg",
  technicalSales:
    "https://static.vecteezy.com/system/resources/previews/046/888/229/non_2x/single-one-line-drawing-young-marketing-manager-discussing-sales-report-from-sales-division-during-receiving-phone-call-company-report-modern-continuous-line-draw-design-graphic-illustration-vector.jpg",
  insuranceFinance:
    "https://static.vecteezy.com/system/resources/previews/022/175/696/non_2x/continuous-one-line-drawing-health-insurance-clipboard-icon-insurance-concept-single-line-draws-design-graphic-illustration-vector.jpg",
  educationCoaching:
    "https://static.vecteezy.com/system/resources/previews/003/592/481/non_2x/one-single-line-drawing-of-young-businessman-giving-business-coaching-to-class-members-at-the-office-group-training-and-meeting-concept-continuous-line-draw-design-illustration-graphic-vector.jpg",
  other: "/onboarding/etc-sketch.svg",
};

const onboardingCopyByLanguage: Record<PublicSiteLanguage, OnboardingCopy> = {
  ko: {
    logoAria: "OneHand 홈",
    title: "어떤 일을 주로 하세요?",
    subtitle: "하나를 선택하면 업무에 맞는 CRM을 빠르게 준비할게요.",
    buildingTitle: "나의 작업 공간을 생성중이에요.",
    progressLabel: "나의 작업 공간 생성 진행률",
    jobs: [
      {
        key: "sales",
        label: "영업",
        imageAlt: "영업 담당자들이 모니터를 함께 보는 검정색 라인 스케치",
      },
      {
        key: "marketing",
        label: "마케팅",
        imageAlt: "온라인 마케팅 화면과 확성기를 그린 검정색 라인 스케치",
      },
      {
        key: "realEstate",
        label: "부동산",
        imageAlt: "주택과 건물을 한 줄로 그린 검정색 라인 스케치",
      },
      {
        key: "recruiting",
        label: "헤드헌팅/채용",
        imageAlt: "쌍안경을 든 채용 담당자를 그린 검정색 라인 스케치",
      },
      {
        key: "technicalSales",
        label: "B2B 기술영업",
        imageAlt: "전화하며 영업 리포트를 논의하는 담당자의 검정색 라인 스케치",
      },
      {
        key: "insuranceFinance",
        label: "보험/재무",
        imageAlt: "보험 서류와 우산을 그린 검정색 라인 스케치",
      },
      {
        key: "educationCoaching",
        label: "교육/코칭",
        imageAlt: "학생을 지도하는 선생님의 검정색 라인 스케치",
      },
      {
        key: "other",
        label: "기타 등등",
        imageAlt: "ETC 글자를 손그림으로 그린 검정색 스케치",
      },
    ],
  },
  "en-US": {
    logoAria: "OneHand home",
    title: "What kind of work do you do?",
    subtitle: "Choose one and we will quickly prepare your CRM workspace.",
    buildingTitle: "Creating your Workspace.",
    progressLabel: "Workspace creation progress",
    jobs: [
      {
        key: "sales",
        label: "Sales",
        imageAlt: "Black line sketch of sales teammates reviewing a monitor",
      },
      {
        key: "marketing",
        label: "Marketing",
        imageAlt: "Black line sketch of a digital marketing screen and megaphone",
      },
      {
        key: "realEstate",
        label: "Real Estate",
        imageAlt: "Black line sketch of houses and buildings",
      },
      {
        key: "recruiting",
        label: "Recruiting",
        imageAlt: "Black line sketch of a recruiter holding binoculars",
      },
      {
        key: "technicalSales",
        label: "B2B Technical Sales",
        imageAlt: "Black line sketch of a person discussing a sales report",
      },
      {
        key: "insuranceFinance",
        label: "Insurance/Finance",
        imageAlt: "Black line sketch of insurance documents and an umbrella",
      },
      {
        key: "educationCoaching",
        label: "Education/Coaching",
        imageAlt: "Black line sketch of a coach teaching students",
      },
      {
        key: "other",
        label: "Something Else",
        imageAlt: "Black hand-drawn sketch of the letters ETC",
      },
    ],
  },
  "en-CA": {
    logoAria: "OneHand home",
    title: "What kind of work do you do?",
    subtitle: "Choose one and we will quickly prepare your CRM workspace.",
    buildingTitle: "Creating your Workspace.",
    progressLabel: "Workspace creation progress",
    jobs: [
      {
        key: "sales",
        label: "Sales",
        imageAlt: "Black line sketch of sales teammates reviewing a monitor",
      },
      {
        key: "marketing",
        label: "Marketing",
        imageAlt: "Black line sketch of a digital marketing screen and megaphone",
      },
      {
        key: "realEstate",
        label: "Real Estate",
        imageAlt: "Black line sketch of houses and buildings",
      },
      {
        key: "recruiting",
        label: "Recruiting/Search",
        imageAlt: "Black line sketch of a recruiter holding binoculars",
      },
      {
        key: "technicalSales",
        label: "B2B Technical Sales",
        imageAlt: "Black line sketch of a person discussing a sales report",
      },
      {
        key: "insuranceFinance",
        label: "Insurance/Financial Services",
        imageAlt: "Black line sketch of insurance documents and an umbrella",
      },
      {
        key: "educationCoaching",
        label: "Education/Coaching",
        imageAlt: "Black line sketch of a coach teaching students",
      },
      {
        key: "other",
        label: "Something Else",
        imageAlt: "Black hand-drawn sketch of the letters ETC",
      },
    ],
  },
};

const onboardingHtmlLangByLanguage: Record<PublicSiteLanguage, string> = {
  ko: "ko-KR",
  "en-US": "en-US",
  "en-CA": "en-CA",
};

// 기능 : 첫 로그인 직업 선택 온보딩 화면을 렌더링합니다.
export function OnboardingPage() {
  const { isAuthenticated, isInitializing, isPending, user } = useAuthSession();
  const completeJobSelectionMutation =
    useCompleteJobSelectionOnboardingMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const routeLanguage = getPublicSiteLanguageFromPathname(location.pathname);
  const fallbackLanguage = resolvePublicSiteLanguage(location.pathname);
  const onboardingLanguage =
    routeLanguage ??
    resolvePublicSiteLanguageFromUserProfile(user, fallbackLanguage);
  const copy = onboardingCopyByLanguage[onboardingLanguage];
  const htmlLang = onboardingHtmlLangByLanguage[onboardingLanguage];
  const jobOptions = copy.jobs.map((job) => ({
    ...job,
    imageSrc: jobImageSrcByKey[job.key],
  }));
  const homePath = toPublicSitePath(onboardingLanguage, "/");
  const loginPath = toPublicSitePath(onboardingLanguage, "/login");
  const [isBuildingCrm, setIsBuildingCrm] = useState(false);
  const [isJobSelectionSaved, setIsJobSelectionSaved] = useState(false);
  const buildProgress = useCrmEnvironmentBuildProgress(isBuildingCrm);
  const isSubmitting = completeJobSelectionMutation.isPending || isBuildingCrm;

  useEffect(() => {
    if (
      isBuildingCrm &&
      buildProgress.isDone &&
      isJobSelectionSaved
    ) {
      navigate("/app", { replace: true });
    }
  }, [
    buildProgress.isDone,
    isBuildingCrm,
    isJobSelectionSaved,
    navigate,
  ]);

  // 1. 인증 상태 복원 중에는 흰 화면을 유지한다.
  if (isInitializing || isPending) {
    return <main className="min-h-screen bg-white" />;
  }

  // 2. 인증되지 않은 사용자는 로그인 화면으로 돌려보낸다.
  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: `${location.pathname}${location.search}` }}
        to={loginPath}
      />
    );
  }

  if (!user) {
    return <main className="min-h-screen bg-white" />;
  }

  // 3. 이미 온보딩을 완료한 사용자는 앱으로 보낸다.
  if (user.jobSelectOnboardingCompletedAt !== null && !isBuildingCrm) {
    return <Navigate replace to="/app" />;
  }

  // 기능 : 선택한 텍스트와 무관하게 완료 시각만 저장합니다.
  const onSelectJob = () => {
    if (isSubmitting) {
      return;
    }

    setIsJobSelectionSaved(false);
    setIsBuildingCrm(true);

    // 1. 온보딩 완료 후 구축 연출이 끝나면 앱 첫 화면으로 이동한다.
    completeJobSelectionMutation.mutate(undefined, {
      onSuccess: () => {
        setIsJobSelectionSaved(true);
      },
      onError: () => {
        setIsBuildingCrm(false);
      },
    });
  };

  if (isBuildingCrm) {
    return (
      <CrmEnvironmentBuildingScreen
        homePath={homePath}
        htmlLang={htmlLang}
        logoAria={copy.logoAria}
        progress={buildProgress.progress}
        progressLabel={copy.progressLabel}
        title={copy.buildingTitle}
      />
    );
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-white px-5 text-[#111111]"
      lang={htmlLang}
    >
      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur">
        <div className="flex h-14 w-full items-center px-[14px]">
          <Link
            aria-label={copy.logoAria}
            className="flex h-9 w-9 items-center justify-center text-[#111111]"
            to={homePath}
          >
            <OneHandLogoMark className="h-9 w-9" />
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col justify-center pb-10 pt-24">
        <header className="mb-8">
          <h1 className="text-[32px] font-semibold leading-[1.18] tracking-normal text-[#111111] sm:text-[40px]">
            {copy.title}
          </h1>
          <p className="mt-3 text-[15px] leading-6 text-[#6B6A67]">
            {copy.subtitle}
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {jobOptions.map(({ imageAlt, imageSrc, key, label }) => (
            <button
              key={key}
              className={cn(
                "group relative flex aspect-[1.28] w-full flex-col overflow-hidden rounded-[8px] border border-[#E7E5E1] bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-[#D8D5D0] hover:bg-[#F2F2EF] hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus-visible:border-[#D8D5D0] focus-visible:bg-[#F2F2EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8D5D0]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
                isSubmitting && "hover:bg-white"
              )}
              disabled={isSubmitting}
              type="button"
              onClick={onSelectJob}
            >
              <span className="relative block min-h-0 flex-1 overflow-hidden bg-[#F7F6F3] transition-colors duration-150 ease-out group-hover:bg-[#F2F2EF] group-focus-visible:bg-[#F2F2EF]">
                <img
                  alt={imageAlt}
                  className="h-full w-full object-cover grayscale"
                  loading="eager"
                  src={imageSrc}
                />
              </span>
              <span className="flex h-11 shrink-0 items-center justify-center border-t border-[#EEEDEA] px-3 text-center transition-colors duration-150 ease-out group-hover:border-[#E2E0DC] group-focus-visible:border-[#E2E0DC]">
                <span className="block max-w-full text-center text-[15px] font-medium leading-5 text-[#111111]">
                  {label}
                </span>
              </span>
            </button>
          ))}
        </div>

        {completeJobSelectionMutation.error ? (
          <p className="mt-4 rounded-[6px] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#B91C1C]">
            {getApiErrorMessage(completeJobSelectionMutation.error)}
          </p>
        ) : null}
      </section>
    </main>
  );
}
