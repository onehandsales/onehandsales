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
    imageAlt: "악수하는 손을 그린 검정색 연필 스케치",
    imageSrc:
      "https://papik.pro/uploads/posts/2023-02/thumbs/1676131934_papik-pro-p-pozhimayut-ruki-risunok-48.jpg",
  },
  {
    label: "마케팅",
    description: "캠페인과 리드를 정리해요",
    imageAlt: "메가폰을 그린 검정색 스케치",
    imageSrc:
      "https://images.rawpixel.com/image_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI1LTA4L3NyLWltYWdlLTIyMDcyNS1taS1zLTY5Ni1tZTNuaTExMi5qcGc.jpg",
  },
  {
    label: "부동산",
    description: "매물과 방문을 연결해요",
    imageAlt: "집을 그린 검정색 스케치",
    imageSrc: "https://paintingvalley.com/sketches/easy-house-sketch-1.png",
  },
  {
    label: "헤드헌팅/채용",
    description: "후보자와 인터뷰를 추적해요",
    imageAlt: "면접 장면을 그린 검정색 연필 스케치",
    imageSrc: "https://v3b.fal.media/files/b/elephant/-8GGb0knw1EnqPNgeEbZH.jpg",
  },
  {
    label: "B2B 기술영업",
    description: "회사와 기술 이슈를 연결해요",
    imageAlt: "회의실에서 기술 영업을 논의하는 검정색 연필 스케치",
    imageSrc:
      "https://csuxjmfbwmkxiegfpljm.supabase.co/storage/v1/object/public/blog-images/organization-5129/1769685564014_image.png",
  },
  {
    label: "보험/재무",
    description: "상담과 갱신을 챙겨요",
    imageAlt: "재무 상담 장면을 그린 검정색 연필 스케치",
    imageSrc:
      "https://w7.pngwing.com/pngs/899/209/png-transparent-stylized-sketch-of-a-financial-advisor-reviewing-a-portfolio.png",
  },
  {
    label: "프리랜서/컨설팅",
    description: "프로젝트와 제안을 관리해요",
    imageAlt: "업무 상담을 나누는 두 사람의 검정색 스케치",
    imageSrc:
      "https://ilus.ai/_next/image?q=75&url=%2Fexample-landing-2%2Fink%2F05.png&w=640",
  },
  {
    label: "교육/코칭",
    description: "수강생과 세션을 관리해요",
    imageAlt: "학생을 지도하는 선생님의 검정색 라인 스케치",
    imageSrc:
      "https://i.pinimg.com/736x/56/e6/ed/56e6ed52aae9984980efcef07bcfe47e.jpg",
  },
];

// 기능 : 첫 로그인 직업 선택 온보딩 화면을 렌더링합니다.
export function OnboardingPage() {
  const { isAuthenticated, isInitializing, isPending, user } = useAuthSession();
  const completeJobSelectionMutation =
    useCompleteJobSelectionOnboardingMutation();
  const navigate = useNavigate();
  const loginPath = toPublicSitePath(resolvePublicSiteLanguage(), "/login");
  const isSubmitting = completeJobSelectionMutation.isPending;

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
  if (user.jobSelectOnboardingCompletedAt !== null) {
    return <Navigate replace to="/app" />;
  }

  // 기능 : 선택한 텍스트와 무관하게 완료 시각만 저장합니다.
  const onSelectJob = () => {
    // 1. 온보딩 완료 API를 호출한 뒤 앱 첫 화면으로 이동한다.
    completeJobSelectionMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/app", { replace: true });
      },
    });
  };

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
              </span>
              <span className="relative flex h-[32%] items-center border-t border-[#EEEDEA] px-4">
                <span className="text-[15px] font-medium leading-5 text-[#111111] transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
                  {label}
                </span>
                <span className="pointer-events-none absolute inset-0 flex items-center px-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="text-[13px] font-medium leading-5 text-[#37352F]">
                    {description}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>

        <button
          className="mx-auto mt-5 block text-[14px] font-medium text-[#787774] transition-colors hover:text-[#37352F] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
          type="button"
          onClick={onSelectJob}
        >
          Skip
        </button>

        {completeJobSelectionMutation.error ? (
          <p className="mt-4 rounded-[6px] bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#B91C1C]">
            {getApiErrorMessage(completeJobSelectionMutation.error)}
          </p>
        ) : null}
      </section>
    </main>
  );
}
