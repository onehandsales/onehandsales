import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createWorkspace,
  type CreatedWorkspaceResponse,
} from "@/features/workspace/api/workspace-api";
import { useAppI18n, type AppLocale } from "@/features/app-i18n";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type WorkspaceJobOptionKey =
  | "sales"
  | "marketing"
  | "realEstate"
  | "recruiting"
  | "technicalSales"
  | "insuranceFinance"
  | "educationCoaching"
  | "other";

type WorkspaceCreateStep = "name" | "job";

type WorkspaceJobOption = {
  readonly imageAlt: string;
  readonly imageSrc: string;
  readonly key: WorkspaceJobOptionKey;
  readonly label: string;
};

type WorkspaceCreateModalCopy = {
  readonly back: string;
  readonly creatingTitle: string;
  readonly jobDescription: string;
  readonly jobTitleSuffix: string;
  readonly nameInputLabel: string;
  readonly namePlaceholder: string;
  readonly nameTitle: string;
  readonly next: string;
  readonly jobs: readonly Omit<WorkspaceJobOption, "imageSrc">[];
};

const WORKSPACE_CREATE_LOADING_CLOSE_DELAY_MS = 5000;

const workspaceJobImageSrcByKey: Record<WorkspaceJobOptionKey, string> = {
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

const workspaceCreateModalCopyByLocale: Record<
  AppLocale,
  WorkspaceCreateModalCopy
> = {
  "ko-KR": {
    back: "이전",
    creatingTitle: "새로운 작업 공간을 생성하고 있어요.",
    jobDescription: "하나를 선택하면 업무에 맞는 CRM 준비 흐름으로 이어갈게요.",
    jobTitleSuffix: "는 어떤 일을 위한 공간인가요?",
    nameInputLabel: "작업 공간 이름",
    namePlaceholder: "예: 부동산 매물 관리",
    nameTitle: "새 작업 공간 이름을 작성해 주세요.",
    next: "다음",
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
  en: {
    back: "Back",
    creatingTitle: "Creating your new workspace.",
    jobDescription: "Choose one so this workspace can continue with the right CRM setup.",
    jobTitleSuffix: " is for what kind of work?",
    nameInputLabel: "Workspace name",
    namePlaceholder: "Example: Real estate listings",
    nameTitle: "Name your new workspace.",
    next: "Next",
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
};

// 기능 : 새 작업 공간 생성 모달의 이름 입력과 업무 선택 단계를 렌더링합니다.
export function CreateWorkspaceModalContent({
  onCreated,
  onCreationComplete,
  onClose,
}: {
  readonly onCreated: (response: CreatedWorkspaceResponse) => Promise<void> | void;
  readonly onCreationComplete: () => void;
  readonly onClose: () => void;
}) {
  // 1. 처리 흐름에 필요한 앱 언어와 화면 문구를 준비한다.
  const { locale, t } = useAppI18n();
  const copy = workspaceCreateModalCopyByLocale[locale];
  // 2. 처리 흐름에 필요한 입력값과 단계 상태를 준비한다.
  const [workspaceName, setWorkspaceName] = useState("");
  const [step, setStep] = useState<WorkspaceCreateStep>("name");
  const [selectedJobKey, setSelectedJobKey] =
    useState<WorkspaceJobOptionKey | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasCreatedWorkspace, setHasCreatedWorkspace] = useState(false);
  const [createdWorkspaceResponse, setCreatedWorkspaceResponse] =
    useState<CreatedWorkspaceResponse | null>(null);
  const [createLoadingModalOpen, setCreateLoadingModalOpen] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  );
  // 3. 이후 단계에서 사용할 카드 목록과 버튼 상태를 계산한다.
  const jobOptions = useMemo(
    () =>
      copy.jobs.map((job) => ({
        ...job,
        imageSrc: workspaceJobImageSrcByKey[job.key],
      })),
    [copy.jobs],
  );
  const canMoveNext = workspaceName.trim().length > 0;

  // 4. Workspace 생성 완료 안내 모달이 열리면 일정 시간 뒤 생성 결과를 반영하고 전체 모달을 닫는다.
  useEffect(() => {
    if (!createLoadingModalOpen || !createdWorkspaceResponse) {
      return;
    }

    const closeTimerId = window.setTimeout(() => {
      void (async () => {
        await onCreated(createdWorkspaceResponse);
        onCreationComplete();
      })();
    }, WORKSPACE_CREATE_LOADING_CLOSE_DELAY_MS);

    return () => window.clearTimeout(closeTimerId);
  }, [
    createLoadingModalOpen,
    createdWorkspaceResponse,
    onCreated,
    onCreationComplete,
  ]);

  // 기능 : 이름 입력 단계에서 업무 선택 단계로 이동합니다.
  const onSubmitName = (event: FormEvent<HTMLFormElement>) => {
    // 1. 브라우저 기본 제출 동작을 막는다.
    event.preventDefault();
    // 2. 이름이 비어 있으면 현재 단계에 머문다.
    if (!canMoveNext) {
      return;
    }

    // 3. 업무 선택 카드 단계로 이동한다.
    setCreateErrorMessage(null);
    setStep("job");
  };

  // 기능 : 업무 선택 단계에서 이름 입력 단계로 돌아갑니다.
  // 기능 : 업무 카드 클릭 시 현재 입력 이름으로 새 Workspace 생성 API를 호출합니다.
  const onSelectJob = async (key: WorkspaceJobOptionKey) => {
    if (isCreating || hasCreatedWorkspace) {
      return;
    }

    const normalizedWorkspaceName = workspaceName.trim();

    if (normalizedWorkspaceName.length === 0) {
      setStep("name");
      return;
    }

    setSelectedJobKey(key);
    setCreateErrorMessage(null);
    setCreatedWorkspaceResponse(null);
    setIsCreating(true);

    try {
      const response = await createWorkspace({
        workspaceName: normalizedWorkspaceName,
      });
      setCreatedWorkspaceResponse(response);
      setHasCreatedWorkspace(true);
      setIsCreating(false);
      setCreateLoadingModalOpen(true);
    } catch (error) {
      setCreateErrorMessage(getApiErrorMessage(error));
      setIsCreating(false);
    }
  };

  const onBackToNameStep = () => {
    if (isCreating || hasCreatedWorkspace) {
      return;
    }

    // 1. 사용자가 입력한 이름은 유지하고 이전 단계로 돌아간다.
    setCreateErrorMessage(null);
    setStep("name");
  };

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <button
        aria-label={t("common.close")}
        className="absolute right-4 top-4 z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#64748B] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
        onClick={onClose}
        type="button"
      >
        <X className="h-4 w-4" strokeWidth={1.8} />
      </button>
      <div className="h-full min-h-0 overflow-y-auto">
        {step === "name" ? (
          <WorkspaceNameStep
            canMoveNext={canMoveNext}
            copy={copy}
            workspaceName={workspaceName}
            onNameChange={setWorkspaceName}
            onSubmit={onSubmitName}
          />
        ) : (
          <WorkspaceJobStep
            copy={copy}
            createErrorMessage={createErrorMessage}
            isCreating={isCreating}
            isSelectionLocked={isCreating || hasCreatedWorkspace}
            jobOptions={jobOptions}
            selectedJobKey={selectedJobKey}
            workspaceName={workspaceName.trim()}
            onBack={onBackToNameStep}
            onSelectJob={onSelectJob}
          />
        )}
      </div>
      {createLoadingModalOpen ? (
        <WorkspaceCreateLoadingDialog title={copy.creatingTitle} />
      ) : null}
    </div>
  );
}

// 기능 : Workspace 생성 완료 후 잠시 보여줄 로딩 모달을 렌더링합니다.
function WorkspaceCreateLoadingDialog({
  title,
}: {
  readonly title: string;
}) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/25 px-6">
      <section
        aria-modal="true"
        className="grid w-full max-w-[360px] justify-items-center rounded-[8px] bg-white px-8 py-9 text-center shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        role="dialog"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 rounded-full border-[3px] border-[#E4E2DC] border-t-[#4880EE] animate-spin"
        />
        <h2 className="mt-5 break-keep text-[20px] font-normal leading-[1.3] text-[#050505]">
          {title}
        </h2>
      </section>
    </div>
  );
}

// 기능 : 새 작업 공간 이름 입력 단계를 렌더링합니다.
function WorkspaceNameStep({
  canMoveNext,
  copy,
  onNameChange,
  onSubmit,
  workspaceName,
}: {
  readonly canMoveNext: boolean;
  readonly copy: WorkspaceCreateModalCopy;
  readonly onNameChange: (value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly workspaceName: string;
}) {
  return (
    <section className="flex min-h-full items-center bg-white px-8 py-10 md:px-12">
      <form
        className="mx-auto min-w-0 w-full max-w-[508px]"
        onSubmit={onSubmit}
      >
        <h1 className="break-keep text-[20px] font-normal leading-[1.2] tracking-normal text-[#050505]">
          {copy.nameTitle}
        </h1>

        <label className="mt-8 grid gap-2 text-[13px] font-normal text-[#111111]">
          {copy.nameInputLabel}
          <input
            autoFocus
            autoComplete="off"
            className="h-10 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
            maxLength={80}
            name="workspaceName"
            placeholder={copy.namePlaceholder}
            type="text"
            value={workspaceName}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>

        <button
          className={cn(
            "mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white transition-colors sm:mt-14",
            canMoveNext
              ? "hover:bg-[#336FE0] active:bg-[#2B63CB]"
              : "cursor-not-allowed opacity-45 hover:bg-[#4880EE]",
          )}
          disabled={!canMoveNext}
          type="submit"
        >
          {copy.next}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </section>
  );
}

// 기능 : 새 작업 공간에 연결할 업무 선택 카드를 렌더링합니다.
function WorkspaceJobStep({
  copy,
  createErrorMessage,
  isCreating,
  isSelectionLocked,
  jobOptions,
  onBack,
  onSelectJob,
  selectedJobKey,
  workspaceName,
}: {
  readonly copy: WorkspaceCreateModalCopy;
  readonly createErrorMessage: string | null;
  readonly isCreating: boolean;
  readonly isSelectionLocked: boolean;
  readonly jobOptions: readonly WorkspaceJobOption[];
  readonly onBack: () => void;
  readonly onSelectJob: (key: WorkspaceJobOptionKey) => Promise<void>;
  readonly selectedJobKey: WorkspaceJobOptionKey | null;
  readonly workspaceName: string;
}) {
  return (
    <section className="flex min-h-full items-center bg-white px-8 py-10 md:px-12">
      <button
        className={cn(
          "absolute left-4 top-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[13px] font-medium text-[#64748B] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]",
          isSelectionLocked ? "cursor-not-allowed opacity-55" : "",
        )}
        disabled={isSelectionLocked}
        onClick={onBack}
        type="button"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        {copy.back}
      </button>
      <div className="mx-auto min-w-0 w-full max-w-[508px]">
        <div>
          <h1 className="break-keep text-[20px] font-normal leading-[1.2] tracking-normal text-[#050505]">
            <span className="text-[#9CA3AF]">{workspaceName}</span>
            {copy.jobTitleSuffix}
          </h1>
          {createErrorMessage ? (
            <p
              className="mt-4 rounded-[6px] border border-[#F8D7DA] bg-[#FFF5F5] px-3 py-2 text-[13px] leading-5 text-[#B42318]"
              role="alert"
            >
              {createErrorMessage}
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {jobOptions.map(({ imageAlt, imageSrc, key, label }) => {
            const selected = selectedJobKey === key;

            return (
              <button
                aria-pressed={selected}
                className={cn(
                  "group relative flex aspect-[1.28] w-full flex-col overflow-hidden rounded-[8px] border bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-[#D8D5D0] hover:bg-[#F2F2EF] hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  selected
                    ? "border-[#4880EE] shadow-[0_10px_28px_rgba(72,128,238,0.14)]"
                    : "border-[#E7E5E1]",
                  isCreating ? "cursor-wait opacity-70" : "",
                  isSelectionLocked && !isCreating
                    ? "cursor-not-allowed opacity-70"
                    : "",
                )}
                disabled={isSelectionLocked}
                key={key}
                type="button"
                onClick={() => void onSelectJob(key)}
              >
                {selected ? (
                  <span className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-[#4880EE] text-white shadow-sm">
                    <Check className="h-4 w-4" strokeWidth={2.3} />
                  </span>
                ) : null}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
