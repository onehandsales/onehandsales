import html2canvas from "html2canvas";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppI18n } from "@/features/app-i18n";
import { useCreateErrorReportMutation } from "@/features/error-report/hooks/use-error-report-mutations";
import { getApiErrorMessage } from "@/lib/api-client";

const ERROR_REPORT_CAPTURE_IGNORE_SELECTOR =
  "[data-error-report-capture-ignore='true']";
const ERROR_REPORT_DESCRIPTION_MAX_LENGTH = 500;
const ERROR_REPORT_CLOSE_DELAY_MS = 2000;

// 기능 : 도움말 모달 안에서 에러 신고 작성과 제출 흐름을 렌더링합니다.
export function ErrorReportHelpContent({
  onSubmitted,
}: {
  readonly onSubmitted: () => void;
}) {
  const { t } = useAppI18n();
  const createErrorReportMutation = useCreateErrorReportMutation();
  const [description, setDescription] = useState("");
  const [isCapturing, setIsCapturing] = useState(true);
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(
    null
  );
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [isScreenshotPreviewOpen, setIsScreenshotPreviewOpen] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const descriptionLength = Array.from(description).length;
  const trimmedDescription = description.trim();
  const isDescriptionValid = trimmedDescription.length > 0;
  const canSubmit =
    isDescriptionValid &&
    !isCapturing &&
    !createErrorReportMutation.isPending &&
    successMessage === null;
  const shouldShowScreenshotPreview =
    includeScreenshot && screenshotPreviewUrl !== null;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (screenshotPreviewUrl) {
        URL.revokeObjectURL(screenshotPreviewUrl);
      }
    };
  }, [screenshotPreviewUrl]);

  useEffect(() => {
    if (!includeScreenshot || screenshotPreviewUrl === null) {
      setIsScreenshotPreviewOpen(false);
    }
  }, [includeScreenshot, screenshotPreviewUrl]);

  // 기능 : 현재 screenshot preview URL을 해제하고 화면 상태에서 제거합니다.
  const clearScreenshotPreviewUrl = useCallback(() => {
    setScreenshotPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return null;
    });
  }, []);

  // 기능 : 에러 신고 섹션 진입 또는 재시도 시 현재 화면 screenshot을 자동으로 캡처합니다.
  const captureScreenshotForReport = useCallback(async () => {
    setIsCapturing(true);
    setCaptureError(null);
    setSubmitError(null);

    try {
      const blob = await captureCurrentPageScreenshot();
      setScreenshotBlob(blob);

      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        setScreenshotPreviewUrl((currentPreviewUrl) => {
          if (currentPreviewUrl) {
            URL.revokeObjectURL(currentPreviewUrl);
          }

          return previewUrl;
        });
        setIncludeScreenshot(true);
      } else {
        clearScreenshotPreviewUrl();
        setIncludeScreenshot(false);
        setCaptureError(t("helpModal.errorCaptureFailed"));
      }
    } catch {
      setScreenshotBlob(null);
      clearScreenshotPreviewUrl();
      setIncludeScreenshot(false);
      setCaptureError(t("helpModal.errorCaptureFailed"));
    } finally {
      setIsCapturing(false);
    }
  }, [clearScreenshotPreviewUrl, t]);

  useEffect(() => {
    let firstFrameId: number | null = null;
    let secondFrameId: number | null = null;

    // 1. 에러신고 모달을 먼저 paint한 뒤 screenshot 캡처를 시작한다.
    firstFrameId = window.requestAnimationFrame(() => {
      secondFrameId = window.requestAnimationFrame(() => {
        void captureScreenshotForReport();
      });
    });

    return () => {
      if (firstFrameId !== null) {
        window.cancelAnimationFrame(firstFrameId);
      }

      if (secondFrameId !== null) {
        window.cancelAnimationFrame(secondFrameId);
      }
    };
  }, [captureScreenshotForReport]);

  // 기능 : screenshot 포함 스위치를 변경하고 OFF일 때 큰 미리보기를 닫습니다.
  const onToggleScreenshot = () => {
    setIncludeScreenshot((current) => {
      if (current) {
        setIsScreenshotPreviewOpen(false);
      }

      return !current;
    });
  };

  // 기능 : 큰 screenshot 미리보기 바깥 영역 클릭 시 미리보기를 닫습니다.
  const onPreviewBackdropMouseDown = (
    event: ReactMouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      setIsScreenshotPreviewOpen(false);
    }
  };

  // 기능 : 에러 내용 입력값을 500자까지 화면 상태에 반영합니다.
  const onDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextDescription = Array.from(event.target.value)
      .slice(0, ERROR_REPORT_DESCRIPTION_MAX_LENGTH)
      .join("");

    setDescription(nextDescription);
  };

  // 기능 : 에러 내용과 선택 screenshot을 Backend API로 제출합니다.
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitError(null);

    try {
      const response = await createErrorReportMutation.mutateAsync({
        description: trimmedDescription,
        pageUrl: getCurrentPageUrl(),
        screenshot:
          includeScreenshot && screenshotBlob !== null ? screenshotBlob : null,
      });
      setSuccessMessage(response.message);
      closeTimerRef.current = window.setTimeout(
        onSubmitted,
        ERROR_REPORT_CLOSE_DELAY_MS
      );
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  return (
    <section className="relative min-h-full bg-white px-5 py-6 pr-11">
      <div>
        <h3 className="text-[20px] font-bold leading-tight text-[#111827]">
          {t("helpModal.errorTitle")}
        </h3>
      </div>

      <form
        className="mt-6 grid gap-4"
        onSubmit={(event) => void onSubmit(event)}
      >
        <label className="grid gap-2">
          <span className="text-[13px] font-semibold text-[#111827]">
            {t("helpModal.errorDescriptionLabel")}
          </span>
          <textarea
            className="min-h-[140px] resize-none rounded-lg border border-[#D8DEE8] bg-white px-3 py-2 text-[13px] leading-6 text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
            maxLength={ERROR_REPORT_DESCRIPTION_MAX_LENGTH}
            onChange={onDescriptionChange}
            placeholder={t("helpModal.errorDescriptionPlaceholder")}
            value={description}
          />
          <div className="flex items-start justify-between gap-3 text-[12px] leading-5 text-[#64748B]">
            <span className="min-w-0 flex-1">
              {t("helpModal.errorConsentNotice")}
            </span>
            <span aria-live="polite" className="shrink-0 tabular-nums">
              {descriptionLength}/{ERROR_REPORT_DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
        </label>

        <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {isCapturing ? (
                <div className="flex h-5 items-center">
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin text-[#64748B]"
                    strokeWidth={2}
                  />
                  <span className="sr-only">
                    {t("helpModal.errorScreenshotCapturingLabel")}
                  </span>
                </div>
              ) : (
                <p className="text-[13px] font-semibold text-[#111827]">
                  {t("helpModal.errorCaptureReady")}
                </p>
              )}
              {captureError ? (
                <p className="mt-1 text-[12px] leading-5 text-[#B45309]">
                  {captureError}
                </p>
              ) : null}
            </div>
            <button
              aria-checked={includeScreenshot}
              aria-label={t("helpModal.errorScreenshotToggleLabel")}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                includeScreenshot ? "bg-[#3A83F7]" : "bg-[#CBD5E1]"
              } disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={!screenshotBlob}
              onClick={onToggleScreenshot}
              role="switch"
              type="button"
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  includeScreenshot ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {shouldShowScreenshotPreview ? (
            <button
              aria-label={t("helpModal.errorScreenshotOpenLabel")}
              className="mt-3 block w-full overflow-hidden rounded-md border border-[#E5E7EB] bg-white text-left transition hover:border-[#CBD5E1] hover:shadow-sm active:border-[#94A3B8]"
              onClick={() => setIsScreenshotPreviewOpen(true)}
              type="button"
            >
              <img
                alt={t("helpModal.errorScreenshotAlt")}
                className="h-24 w-full object-cover"
                src={screenshotPreviewUrl}
              />
            </button>
          ) : null}
        </div>

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
            {createErrorReportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : null}
            {createErrorReportMutation.isPending
              ? t("helpModal.errorSubmitting")
              : t("helpModal.errorSubmitAction")}
          </button>
        </div>
      </form>

      {isScreenshotPreviewOpen && screenshotPreviewUrl ? (
        <div
          aria-label={t("helpModal.errorScreenshotPreviewTitle")}
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-5"
          data-error-report-capture-ignore="true"
          onMouseDown={onPreviewBackdropMouseDown}
          role="dialog"
        >
          <div className="relative max-h-[86vh] w-full max-w-[960px]">
            <button
              aria-label={t("common.close")}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-[#111827] shadow-sm transition hover:bg-white active:bg-[#E5E7EB]"
              onClick={() => setIsScreenshotPreviewOpen(false)}
              type="button"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
            <img
              alt={t("helpModal.errorScreenshotAlt")}
              className="max-h-[86vh] w-full rounded-lg bg-white object-contain shadow-2xl"
              src={screenshotPreviewUrl}
            />
          </div>
        </div>
      ) : null}

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

// 기능 : 현재 브라우저 주소를 에러 신고 pageUrl 값으로 반환합니다.
function getCurrentPageUrl(): string {
  return window.location.href;
}

// 기능 : 도움말 모달을 제외한 현재 DOM 화면을 PNG Blob으로 캡처합니다.
async function captureCurrentPageScreenshot(): Promise<Blob | null> {
  const canvas = await html2canvas(document.body, {
    backgroundColor: "#FFFFFF",
    ignoreElements: (element) =>
      element.closest(ERROR_REPORT_CAPTURE_IGNORE_SELECTOR) !== null,
    logging: false,
    scale: Math.min(window.devicePixelRatio || 1, 2),
    useCORS: true,
  });

  return toPngBlob(canvas);
}

// 기능 : canvas를 PNG Blob으로 변환합니다.
function toPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}
