import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  useAuthSession,
  useCompleteJobSelectionOnboardingMutation,
} from "@/features/auth";
import {
  resolvePublicSiteLanguage,
  toPublicSitePath,
} from "@/features/public-site/i18n/public-site-locale-routes";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type JobOption = {
  readonly label: string;
  readonly description: string;
  readonly imageAlt: string;
  readonly imageSrc: string;
};

const jobOptions: readonly JobOption[] = [
  {
    label: "영업",
    description: "고객과 기회를 관리해요",
    imageAlt: "영업 담당자들이 모니터를 함께 보는 검정색 라인 스케치",
    imageSrc:
      "https://static.vecteezy.com/system/resources/previews/003/592/676/non_2x/single-continuous-line-drawing-of-two-young-sales-manager-analyze-sales-growth-chart-on-screen-monitor-with-marketing-staff-sales-growth-evaluation-concept-one-line-draw-design-illustration-vector.jpg",
  },
  {
    label: "마케팅",
    description: "캠페인과 리드를 정리해요",
    imageAlt: "온라인 마케팅 화면과 확성기를 그린 검정색 라인 스케치",
    imageSrc:
      "https://static.vecteezy.com/system/resources/previews/024/211/247/non_2x/single-one-line-drawing-digital-marketing-social-media-market-digital-concept-continuous-line-drawing-illustration-vector.jpg",
  },
  {
    label: "부동산",
    description: "매물과 방문을 연결해요",
    imageAlt: "주택과 건물을 한 줄로 그린 검정색 라인 스케치",
    imageSrc:
      "https://static.vecteezy.com/system/resources/previews/027/839/179/non_2x/continuous-line-drawing-of-housing-estate-building-single-line-vector.jpg",
  },
  {
    label: "헤드헌팅/채용",
    description: "후보자와 인터뷰를 추적해요",
    imageAlt: "쌍안경을 든 채용 담당자를 그린 검정색 라인 스케치",
    imageSrc:
      "https://static.vecteezy.com/system/resources/previews/043/178/770/non_2x/continuous-one-line-drawing-job-search-recruiting-hiring-concept-doodle-illustration-vector.jpg",
  },
  {
    label: "B2B 기술영업",
    description: "회사와 기술 이슈를 연결해요",
    imageAlt: "전화하며 영업 리포트를 논의하는 담당자를 그린 검정색 라인 스케치",
    imageSrc:
      "https://static.vecteezy.com/system/resources/previews/046/888/229/non_2x/single-one-line-drawing-young-marketing-manager-discussing-sales-report-from-sales-division-during-receiving-phone-call-company-report-modern-continuous-line-draw-design-graphic-illustration-vector.jpg",
  },
  {
    label: "보험/재무",
    description: "상담과 갱신을 챙겨요",
    imageAlt: "보험 서류와 우산을 그린 검정색 라인 스케치",
    imageSrc:
      "https://static.vecteezy.com/system/resources/previews/022/175/696/non_2x/continuous-one-line-drawing-health-insurance-clipboard-icon-insurance-concept-single-line-draws-design-graphic-illustration-vector.jpg",
  },
  {
    label: "교육/코칭",
    description: "수강생과 세션을 관리해요",
    imageAlt: "학생을 지도하는 선생님의 검정색 라인 스케치",
    imageSrc:
      "https://static.vecteezy.com/system/resources/previews/003/592/481/non_2x/one-single-line-drawing-of-young-businessman-giving-business-coaching-to-class-members-at-the-office-group-training-and-meeting-concept-continuous-line-draw-design-illustration-graphic-vector.jpg",
  },
  {
    label: "기타 등등",
    description: "맞는 항목을 함께 찾아요",
    imageAlt: "ETC 글자를 손그림으로 그린 검정색 스케치",
    imageSrc: "/onboarding/etc-sketch.svg",
  },
];

const CRM_BUILD_DURATION_MS = 5000;

// 기능 : 첫 로그인 직업 선택 온보딩 화면을 렌더링합니다.
export function OnboardingPage() {
  const { isAuthenticated, isInitializing, isPending, user } = useAuthSession();
  const completeJobSelectionMutation =
    useCompleteJobSelectionOnboardingMutation();
  const navigate = useNavigate();
  const loginPath = toPublicSitePath(resolvePublicSiteLanguage(), "/login");
  const [isBuildingCrm, setIsBuildingCrm] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuildAnimationDone, setIsBuildAnimationDone] = useState(false);
  const [isJobSelectionSaved, setIsJobSelectionSaved] = useState(false);
  const isSubmitting = completeJobSelectionMutation.isPending || isBuildingCrm;

  useEffect(() => {
    if (!isBuildingCrm) {
      return;
    }

    const startedAt = performance.now();
    let frameId = 0;

    const updateProgress = (currentTime: number) => {
      const elapsedMs = currentTime - startedAt;
      const nextProgress = Math.min(
        100,
        Math.round((elapsedMs / CRM_BUILD_DURATION_MS) * 100)
      );

      setBuildProgress(nextProgress);

      if (nextProgress < 100) {
        frameId = requestAnimationFrame(updateProgress);
        return;
      }

      setIsBuildAnimationDone(true);
    };

    frameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isBuildingCrm]);

  useEffect(() => {
    if (isBuildingCrm && isBuildAnimationDone && isJobSelectionSaved) {
      navigate("/app", { replace: true });
    }
  }, [isBuildAnimationDone, isBuildingCrm, isJobSelectionSaved, navigate]);

  // 1. 인증 상태 복원 중에는 흰 화면을 유지한다.
  if (isInitializing || isPending) {
    return <main className="min-h-screen bg-white" />;
  }

  // 2. 인증되지 않은 사용자는 로그인 화면으로 돌려보낸다.
  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: "/onboarding" }}
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

    setBuildProgress(0);
    setIsBuildAnimationDone(false);
    setIsJobSelectionSaved(false);
    setIsBuildingCrm(true);

    // 1. 온보딩 완료 API와 구축 연출이 모두 끝난 뒤 앱 첫 화면으로 이동한다.
    completeJobSelectionMutation.mutate(undefined, {
      onSuccess: () => {
        setIsJobSelectionSaved(true);
      },
      onError: () => {
        setIsBuildingCrm(false);
        setBuildProgress(0);
        setIsBuildAnimationDone(false);
      },
    });
  };

  if (isBuildingCrm) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 text-[#111111]">
        <section className="w-full max-w-[360px] text-center">
          <h1 className="text-[24px] font-semibold leading-[1.25] tracking-normal text-[#111111]">
            CRM 환경을 구축중이에요.
          </h1>
          <div
            aria-label="CRM 환경 구축 진행률"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={buildProgress}
            className="mt-7 h-2 overflow-hidden rounded-full bg-[#EEEDEA]"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-[#111111] transition-[width] duration-100 ease-linear"
              style={{ width: `${buildProgress}%` }}
            />
          </div>
          <p
            aria-live="polite"
            className="mt-3 text-[13px] font-medium text-[#787774]"
          >
            {buildProgress}%
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 text-[#111111]">
      <section className="mx-auto flex min-h-screen w-full max-w-[1040px] flex-col justify-center py-10">
        <header className="mb-8">
          <h1 className="text-[32px] font-semibold leading-[1.18] tracking-normal text-[#111111] sm:text-[40px]">
            어떤 일을 주로 하세요?
          </h1>
          <p className="mt-3 max-w-[520px] text-[15px] leading-6 text-[#6B6A67]">
            항목 1개를 선택하시면 CRM 환경을 바로 구축해드려요.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {jobOptions.map(({ description, imageAlt, imageSrc, label }) => (
            <button
              key={label}
              className={cn(
                "group relative flex aspect-[1.28] w-full flex-col overflow-hidden rounded-[8px] border border-[#E7E5E1] bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-colors hover:border-[#D8D5D0] hover:bg-white focus-visible:border-[#D8D5D0] focus-visible:bg-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                isSubmitting && "hover:bg-white"
              )}
              disabled={isSubmitting}
              type="button"
              onClick={onSelectJob}
            >
              <span className="relative block h-[68%] w-full overflow-hidden bg-[#F7F6F3]">
                <img
                  alt={imageAlt}
                  className="h-full w-full object-cover grayscale transition duration-200 group-hover:scale-[1.04] group-hover:blur-[4px] group-hover:opacity-30 group-focus-visible:scale-[1.04] group-focus-visible:blur-[4px] group-focus-visible:opacity-30"
                  loading="eager"
                  src={imageSrc}
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="text-[13px] font-semibold leading-5 text-[#37352F]">
                    {description}
                  </span>
                </span>
              </span>
              <span className="flex h-[32%] items-center border-t border-[#EEEDEA] px-4">
                <span className="text-[15px] font-medium leading-5 text-[#111111]">
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
