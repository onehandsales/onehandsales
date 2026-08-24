import { AlertCircle, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import type { SupportRequestType } from "@/features/support-request/types/support-request";

const SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH = 1000;
const SUPPORT_REQUEST_MOCK_SUBMIT_DELAY_MS = 350;
const SUPPORT_REQUEST_CLOSE_DELAY_MS = 2000;

type SupportRequestTemplate = {
  readonly labelKey: AppI18nKey;
  readonly templateKey: AppI18nKey;
  readonly type: SupportRequestType;
};

const SUPPORT_REQUEST_TEMPLATES: readonly SupportRequestTemplate[] = [
  {
    type: "FEATURE_QUESTION",
    labelKey: "helpModal.supportFeatureQuestionLabel",
    templateKey: "helpModal.supportFeatureQuestionTemplate",
  },
  {
    type: "PRICING_QUESTION",
    labelKey: "helpModal.supportPricingQuestionLabel",
    templateKey: "helpModal.supportPricingQuestionTemplate",
  },
  {
    type: "PHONE_CONSULTATION",
    labelKey: "helpModal.supportPhoneConsultationLabel",
    templateKey: "helpModal.supportPhoneConsultationTemplate",
  },
  {
    type: "FEATURE_SUGGESTION",
    labelKey: "helpModal.supportFeatureSuggestionLabel",
    templateKey: "helpModal.supportFeatureSuggestionTemplate",
  },
  {
    type: "OTHER",
    labelKey: "helpModal.supportOtherLabel",
    templateKey: "helpModal.supportOtherTemplate",
  },
];

const DEFAULT_SUPPORT_REQUEST_TEMPLATE = SUPPORT_REQUEST_TEMPLATES[0]!;

// 기능 : 도움말 모달 안에서 지원 요청 작성 디자인을 렌더링합니다.
export function SupportRequestHelpContent({
  onSubmitted,
}: {
  readonly onSubmitted: () => void;
}) {
  const { t } = useAppI18n();
  const [selectedType, setSelectedType] = useState<SupportRequestType>(
    DEFAULT_SUPPORT_REQUEST_TEMPLATE.type
  );
  const [pendingType, setPendingType] = useState<SupportRequestType | null>(null);
  const [description, setDescription] = useState(() =>
    t(DEFAULT_SUPPORT_REQUEST_TEMPLATE.templateKey)
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const descriptionLength = Array.from(description).length;
  const trimmedDescription = description.trim();
  const selectedTemplate = getSupportRequestTemplate(selectedType);
  const selectedTemplateText = t(selectedTemplate.templateKey);
  const hasUserEditedDescription =
    trimmedDescription.length > 0 &&
    normalizeSupportRequestText(description) !==
      normalizeSupportRequestText(selectedTemplateText);
  const canSubmit =
    hasUserEditedDescription && !isSubmitting && successMessage === null;

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }

      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // 기능 : 지원 요청 내용을 1000자까지 화면 상태에 반영합니다.
  const onDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextDescription = Array.from(event.target.value)
      .slice(0, SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH)
      .join("");

    setDescription(nextDescription);
    setSubmitError(null);
  };

  // 기능 : 템플릿 선택 시 사용자가 템플릿 외 내용을 작성했으면 교체 확인을 요청합니다.
  const onTemplateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as SupportRequestType;

    if (nextType === selectedType) {
      return;
    }

    if (hasUserEditedDescription) {
      setPendingType(nextType);
      return;
    }

    applyTemplate(nextType);
  };

  // 기능 : 선택된 템플릿 문구를 입력창에 반영합니다.
  const applyTemplate = (nextType: SupportRequestType) => {
    const nextTemplate = getSupportRequestTemplate(nextType);
    setSelectedType(nextType);
    setDescription(t(nextTemplate.templateKey));
    setSubmitError(null);
  };

  // 기능 : 템플릿 교체 확인 모달에서 교체를 확정합니다.
  const confirmTemplateReplace = () => {
    if (pendingType) {
      applyTemplate(pendingType);
    }

    setPendingType(null);
  };

  // 기능 : 지원 요청 디자인 단계의 제출 완료 상태를 로컬로 표시합니다.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setSubmitError(t("helpModal.supportDescriptionRequired"));
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    submitTimerRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(t("helpModal.supportSubmitted"));
      closeTimerRef.current = window.setTimeout(
        onSubmitted,
        SUPPORT_REQUEST_CLOSE_DELAY_MS
      );
    }, SUPPORT_REQUEST_MOCK_SUBMIT_DELAY_MS);
  };

  return (
    <section className="relative min-h-full bg-white px-5 py-6 pr-11">
      <div>
        <h3 className="text-[20px] font-bold leading-tight text-[#111827]">
          {t("helpModal.supportTitle")}
        </h3>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
        <label className="grid gap-2">
          <span className="text-[13px] font-semibold text-[#111827]">
            {t("helpModal.supportTemplateLabel")}
          </span>
          <span className="relative">
            <select
              className="h-10 w-full appearance-none rounded-lg border border-[#D8DEE8] bg-white px-3 pr-9 text-[13px] font-medium text-[#111827] outline-none transition focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              onChange={onTemplateChange}
              value={selectedType}
            >
              {SUPPORT_REQUEST_TEMPLATES.map((template) => (
                <option key={template.type} value={template.type}>
                  {t(template.labelKey)}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
              strokeWidth={2}
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-[13px] font-semibold text-[#111827]">
            {t("helpModal.supportDescriptionLabel")}
          </span>
          <textarea
            className="min-h-[190px] resize-none rounded-lg border border-[#D8DEE8] bg-white px-3 py-2 text-[13px] leading-6 text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
            maxLength={SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH}
            onChange={onDescriptionChange}
            placeholder={t("helpModal.supportDescriptionPlaceholder")}
            value={description}
          />
          <div className="flex items-start justify-between gap-3 text-[12px] leading-5 text-[#64748B]">
            <span className="min-w-0 flex-1">
              {t("helpModal.supportConsentNotice")}
            </span>
            <span aria-live="polite" className="shrink-0 tabular-nums">
              {descriptionLength}/{SUPPORT_REQUEST_DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
        </label>

        {submitError ? (
          <div className="flex items-start gap-2 rounded-lg bg-[#FEF2F2] px-3 py-2 text-[12px] leading-5 text-[#B91C1C]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{submitError}</span>
          </div>
        ) : null}

        <div className="mt-1 flex justify-end pt-2">
          <button
            className="inline-flex h-9 min-w-[76px] items-center justify-center gap-1.5 rounded-md bg-[#3A83F7] px-4 text-[13px] font-semibold text-white transition hover:bg-[#256FE6] active:bg-[#1D5FD0] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
            disabled={!canSubmit}
            type="submit"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : null}
            {isSubmitting
              ? t("helpModal.supportSubmitting")
              : t("helpModal.supportSubmitAction")}
          </button>
        </div>
      </form>

      <TemplateReplaceConfirmDialog
        onCancel={() => setPendingType(null)}
        onConfirm={confirmTemplateReplace}
        open={pendingType !== null}
      />

      {successMessage ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 px-5 backdrop-blur-[1px]">
          <div
            aria-live="polite"
            className="grid max-w-[280px] justify-items-center gap-2 rounded-xl bg-white px-5 py-4 text-center shadow-2xl ring-1 ring-[#E5E7EB]"
            role="status"
          >
            <CheckCircle2 className="h-7 w-7 text-[#16A34A]" strokeWidth={2} />
            <p className="text-[13px] font-semibold leading-6 text-[#111827]">
              {successMessage}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

// 기능 : 템플릿 교체 확인 모달을 렌더링합니다.
function TemplateReplaceConfirmDialog({
  onCancel,
  onConfirm,
  open,
}: {
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly open: boolean;
}) {
  const { t } = useAppI18n();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel, open]);

  // 기능 : 확인 모달 바깥 영역 클릭 시 모달을 닫습니다.
  const onBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 px-4"
      onMouseDown={onBackdropMouseDown}
    >
      <section
        aria-modal="true"
        className="w-full max-w-[312px] rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h4 className="text-center text-[14px] font-semibold text-[#111827]">
          {t("helpModal.supportTemplateReplaceTitle")}
        </h4>
        <p className="mt-2 text-center text-[12px] leading-5 text-[#64748B]">
          {t("helpModal.supportTemplateReplaceDescription")}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="h-9 rounded-md border border-[#D1D5DB] px-3 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] active:bg-[#F3F4F6]"
            onClick={onCancel}
            type="button"
          >
            {t("common.cancel")}
          </button>
          <button
            className="h-9 rounded-md bg-[#111827] px-3 text-[13px] font-semibold text-white transition hover:bg-[#374151] active:bg-[#030712]"
            onClick={onConfirm}
            type="button"
          >
            {t("helpModal.supportTemplateReplaceConfirm")}
          </button>
        </div>
      </section>
    </div>
  );
}

// 기능 : 지원 요청 유형으로 템플릿 설정을 조회합니다.
function getSupportRequestTemplate(
  type: SupportRequestType
): SupportRequestTemplate {
  return (
    SUPPORT_REQUEST_TEMPLATES.find((template) => template.type === type) ??
    DEFAULT_SUPPORT_REQUEST_TEMPLATE
  );
}

// 기능 : 템플릿 기본 문구와 입력값을 비교할 때 줄바꿈과 앞뒤 공백 차이를 정규화합니다.
function normalizeSupportRequestText(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}
