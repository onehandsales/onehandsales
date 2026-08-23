import html2canvas from "html2canvas";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppI18n } from "@/features/app-i18n";
import { useCreateErrorReportMutation } from "@/features/error-report/hooks/use-error-report-mutations";
import { getApiErrorMessage } from "@/lib/api-client";

const ERROR_REPORT_MIN_DESCRIPTION_LENGTH = 10;
const ERROR_REPORT_CAPTURE_IGNORE_SELECTOR =
  "[data-error-report-capture-ignore='true']";

// 역할 : ErrorReportStep 도움말 에러 신고 화면의 단계 상태를 정의합니다.
type ErrorReportStep = "intro" | "form";

// 기능 : 도움말 모달 안에서 에러 신고 작성과 제출 흐름을 렌더링합니다.
export function ErrorReportHelpContent({
  onSubmitted,
}: {
  readonly onSubmitted: () => void;
}) {
  const { t } = useAppI18n();
  const createErrorReportMutation = useCreateErrorReportMutation();
  const [step, setStep] = useState<ErrorReportStep>("intro");
  const [description, setDescription] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(
    null
  );
  const [includeScreenshot, setIncludeScreenshot] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const trimmedDescription = description.trim();
  const descriptionLength = useMemo(
    () => Array.from(trimmedDescription).length,
    [trimmedDescription]
  );
  const isDescriptionValid =
    descriptionLength >= ERROR_REPORT_MIN_DESCRIPTION_LENGTH;
  const canSubmit =
    isDescriptionValid &&
    !createErrorReportMutation.isPending &&
    successMessage === null;

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

  // 기능 : 현재 screenshot preview URL을 해제하고 화면 상태에서 제거합니다.
  const clearScreenshotPreviewUrl = () => {
    setScreenshotPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return null;
    });
  };

  // 기능 : 에러 신고 시작 시 현재 화면 screenshot을 자동으로 캡처합니다.
  const onStartReport = async () => {
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
      setStep("form");
    }
  };

  // 기능 : 사용자가 원할 때 screenshot을 다시 캡처합니다.
  const onRetryCapture = async () => {
    await onStartReport();
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
      closeTimerRef.current = window.setTimeout(onSubmitted, 1000);
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
        <p className="mt-2 text-[13px] leading-6 text-[#64748B]">
          {t("helpModal.errorDescription")}
        </p>
      </div>

      {step === "intro" ? (
        <div className="mt-6 grid gap-3">
          <article className="rounded-lg bg-[#F8FAFC] px-4 py-3">
            <h4 className="text-[13px] font-semibold text-[#111827]">
              {t("helpModal.errorBodyTitle")}
            </h4>
            <p className="mt-1.5 text-[13px] leading-6 text-[#64748B]">
              {t("helpModal.errorBodyDescription")}
            </p>
          </article>
          <button
            className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md bg-[#111827] px-3 text-[13px] font-semibold text-white transition hover:bg-[#374151] active:bg-[#030712] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
            disabled={isCapturing}
            onClick={() => void onStartReport()}
            type="button"
          >
            {isCapturing ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            ) : (
              <Camera className="h-4 w-4" strokeWidth={2} />
            )}
            {isCapturing
              ? t("helpModal.errorCapturing")
              : t("helpModal.errorStartAction")}
          </button>
        </div>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={(event) => void onSubmit(event)}>
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#111827]">
                  {screenshotBlob
                    ? t("helpModal.errorCaptureReady")
                    : t("helpModal.errorNoScreenshot")}
                </p>
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
                  includeScreenshot ? "bg-[#111827]" : "bg-[#CBD5E1]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={!screenshotBlob}
                onClick={() => setIncludeScreenshot((current) => !current)}
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

            {screenshotPreviewUrl ? (
              <div className="mt-3 overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
                <img
                  alt={t("helpModal.errorScreenshotAlt")}
                  className="h-24 w-full object-cover"
                  src={screenshotPreviewUrl}
                />
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[12px] leading-5 text-[#64748B]">
                {includeScreenshot && screenshotBlob
                  ? t("helpModal.errorScreenshotIncluded")
                  : t("helpModal.errorScreenshotExcluded")}
              </p>
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] font-semibold text-[#334155] transition hover:bg-[#E4E8F0] active:bg-[#CBD5E1]"
                disabled={isCapturing}
                onClick={() => void onRetryCapture()}
                type="button"
              >
                {isCapturing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {t("helpModal.errorRetryCapture")}
              </button>
            </div>
          </div>

          <label className="grid gap-2">
            <span className="text-[13px] font-semibold text-[#111827]">
              {t("helpModal.errorDescriptionLabel")}
            </span>
            <textarea
              className="min-h-[116px] resize-none rounded-lg border border-[#D8DEE8] bg-white px-3 py-2 text-[13px] leading-6 text-[#111827] outline-none transition placeholder:text-[#94A3B8] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10"
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("helpModal.errorDescriptionPlaceholder")}
              value={description}
            />
            <span
              className={`text-[12px] leading-5 ${
                isDescriptionValid ? "text-[#64748B]" : "text-[#B45309]"
              }`}
            >
              {t("helpModal.errorDescriptionHint")}
            </span>
          </label>

          {submitError ? (
            <div className="flex items-start gap-2 rounded-lg bg-[#FEF2F2] px-3 py-2 text-[12px] leading-5 text-[#B91C1C]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{submitError}</span>
            </div>
          ) : null}

          <button
            className="inline-flex h-9 w-fit items-center gap-1.5 rounded-md bg-[#111827] px-3 text-[13px] font-semibold text-white transition hover:bg-[#374151] active:bg-[#030712] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
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
        </form>
      )}

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
