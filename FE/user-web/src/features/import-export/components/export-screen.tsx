import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Handshake,
  Loader2,
  NotebookPen,
  Package,
  Play,
  ShieldAlert,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useCreateExportJobMutation,
  useDownloadExportFileMutation,
} from "@/features/import-export/hooks/use-import-export-mutations";
import { useExportJobDetail } from "@/features/import-export/hooks/use-import-export-queries";
import {
  exportFormatOptions,
  exportTargetOptions,
} from "@/features/import-export/schemas/import-export-schema";
import type {
  ExportDownloadResponse,
  ExportFormat,
  ExportJobResponse,
  ExportJobStatus,
  ExportTargetType,
} from "@/features/import-export/types/import-export";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

const targetIcons: Record<ExportTargetType, LucideIcon> = {
  COMPANY: Building2,
  CONTACT: UserRound,
  PRODUCT: Package,
  DEAL: Handshake,
  SCHEDULE: CalendarDays,
  MEETING_NOTE: NotebookPen,
};

const formatIcons: Record<ExportFormat, LucideIcon> = {
  EXCEL: FileSpreadsheet,
  PDF: FileText,
};

const statusMeta: Record<
  ExportJobStatus,
  { readonly label: string; readonly className: string }
> = {
  PENDING: {
    label: "대기",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  PROCESSING: {
    label: "처리 중",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  COMPLETED: {
    label: "완료",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  FAILED: {
    label: "실패",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  EXPIRED: {
    label: "만료",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

export function ExportScreen() {
  const [targetType, setTargetType] = useState<ExportTargetType>("COMPANY");
  const [format, setFormat] = useState<ExportFormat>("EXCEL");
  const [includeSensitiveData, setIncludeSensitiveData] = useState(false);
  const [exportJobId, setExportJobId] = useState("");
  const [lastJob, setLastJob] = useState<ExportJobResponse | null>(null);
  const [downloadInfo, setDownloadInfo] =
    useState<ExportDownloadResponse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const shouldPoll = isExportJobProcessing(lastJob?.status ?? null);
  const detailQuery = useExportJobDetail(exportJobId, shouldPoll);
  const createMutation = useCreateExportJobMutation();
  const downloadMutation = useDownloadExportFileMutation();
  const currentJob = detailQuery.data ?? lastJob;
  const actionError =
    createMutation.error ?? downloadMutation.error ?? detailQuery.error ?? null;
  const selectedTarget = useMemo(
    () => exportTargetOptions.find((option) => option.value === targetType),
    [targetType]
  );
  const selectedFormat = useMemo(
    () => exportFormatOptions.find((option) => option.value === format),
    [format]
  );
  const canDownload = Boolean(currentJob?.downloadReady);

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }

    setLastJob(detailQuery.data);
  }, [detailQuery.data]);

  const createJob = async (sensitiveConfirm: boolean) => {
    setNotice(null);
    setDownloadInfo(null);

    const job = await createMutation.mutateAsync({
      targetType,
      format,
      includeSensitiveData,
      sensitiveConfirm,
    });

    setExportJobId(job.id);
    setLastJob(job);
    setConfirmOpen(false);
    setNotice(
      job.downloadReady
        ? "내보내기 파일을 준비했어요."
        : "내보내기 작업을 만들었어요."
    );
  };

  const onCreateClick = () => {
    if (includeSensitiveData) {
      setConfirmOpen(true);
      return;
    }

    void createJob(false);
  };

  const onDownloadClick = async () => {
    if (!currentJob?.downloadReady) {
      return;
    }

    const download = await downloadMutation.mutateAsync({
      exportJobId: currentJob.id,
    });

    setDownloadInfo(download);
      setNotice("다운로드 링크를 준비했어요.");
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-2xl font-semibold">데이터 내보내기</h1>
        <p className="text-sm text-muted-foreground">
          대상과 파일 형식을 선택하고 필요한 데이터 파일을 만들어요.
        </p>
      </header>

      {notice ? (
        <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <section className="grid content-start gap-5 rounded-lg border bg-white p-4">
          <ExportTargetSelector
            selectedTargetType={targetType}
            onSelect={(nextTargetType) => {
              setTargetType(nextTargetType);
              setDownloadInfo(null);
              setNotice(null);
            }}
          />

          <ExportFormatSelector
            selectedFormat={format}
            onSelect={(nextFormat) => {
              setFormat(nextFormat);
              setDownloadInfo(null);
              setNotice(null);
            }}
          />

          <SensitiveDataPanel
            includeSensitiveData={includeSensitiveData}
            onChange={(checked) => {
              setIncludeSensitiveData(checked);
              setDownloadInfo(null);
              setNotice(null);
            }}
          />
        </section>

        <section className="grid content-start gap-5 rounded-lg border bg-white p-4">
          <ExportActionPanel
            canDownload={canDownload}
            currentJob={currentJob}
            includeSensitiveData={includeSensitiveData}
            isCreating={createMutation.isPending}
            isDownloading={downloadMutation.isPending}
            isPolling={detailQuery.isFetching && shouldPoll}
            onCreate={onCreateClick}
            onDownload={() => void onDownloadClick()}
            selectedFormatLabel={selectedFormat?.label ?? format}
            selectedTargetLabel={selectedTarget?.label ?? targetType}
          />

          {downloadInfo ? <DownloadLinkPanel downloadInfo={downloadInfo} /> : null}
        </section>
      </div>

      {confirmOpen ? (
        <SensitiveConfirmDialog
          formatLabel={selectedFormat?.label ?? format}
          isPending={createMutation.isPending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void createJob(true)}
          targetLabel={selectedTarget?.label ?? targetType}
        />
      ) : null}
    </section>
  );
}

type ExportTargetSelectorProps = {
  readonly selectedTargetType: ExportTargetType;
  readonly onSelect: (targetType: ExportTargetType) => void;
};

function ExportTargetSelector({
  selectedTargetType,
  onSelect,
}: ExportTargetSelectorProps) {
  return (
    <div className="grid gap-3">
      <div>
        <h2 className="text-base font-semibold">내보내기 대상</h2>
        <p className="text-sm text-muted-foreground">
            생성할 데이터 범위를 선택해요.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {exportTargetOptions.map((option) => {
          const Icon = targetIcons[option.value];
          const isSelected = selectedTargetType === option.value;

          return (
            <button
              key={option.value}
              className={`flex min-h-[76px] items-start gap-3 rounded-lg border p-3 text-left transition ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 bg-white hover:border-primary/50 hover:bg-muted"
              }`}
              type="button"
              onClick={() => onSelect(option.value)}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="grid min-w-0 gap-1">
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ExportFormatSelectorProps = {
  readonly selectedFormat: ExportFormat;
  readonly onSelect: (format: ExportFormat) => void;
};

function ExportFormatSelector({
  selectedFormat,
  onSelect,
}: ExportFormatSelectorProps) {
  return (
    <div className="grid gap-3 border-t pt-4">
      <div>
        <h2 className="text-base font-semibold">파일 형식</h2>
        <p className="text-sm text-muted-foreground">
              업무 목적에 맞는 형식을 선택해요.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {exportFormatOptions.map((option) => {
          const Icon = formatIcons[option.value];
          const isSelected = selectedFormat === option.value;

          return (
            <button
              key={option.value}
              className={`flex min-h-[72px] items-start gap-3 rounded-lg border p-3 text-left transition ${
                isSelected
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 bg-white hover:border-primary/50 hover:bg-muted"
              }`}
              type="button"
              onClick={() => onSelect(option.value)}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="grid min-w-0 gap-1">
                <span className="text-sm font-semibold">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type SensitiveDataPanelProps = {
  readonly includeSensitiveData: boolean;
  readonly onChange: (checked: boolean) => void;
};

function SensitiveDataPanel({
  includeSensitiveData,
  onChange,
}: SensitiveDataPanelProps) {
  return (
    <div className="grid gap-3 border-t pt-4">
      <div>
        <h2 className="text-base font-semibold">민감정보</h2>
        <p className="text-sm text-muted-foreground">
                  기본값은 연락처와 상세 메모를 제외해요.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <input
          checked={includeSensitiveData}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          type="checkbox"
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="grid gap-1">
          <span className="text-sm font-semibold">민감정보 포함</span>
          <span className="text-xs text-muted-foreground">
                  전화번호, 이메일, 주소, 일정 위치와 메모, 회의 상세 내용을 포함해요.
          </span>
        </span>
      </label>

      {includeSensitiveData ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>생성 전에 민감정보 포함 여부를 확인해 주세요.</span>
        </div>
      ) : null}
    </div>
  );
}

type ExportActionPanelProps = {
  readonly canDownload: boolean;
  readonly currentJob: ExportJobResponse | null;
  readonly includeSensitiveData: boolean;
  readonly isCreating: boolean;
  readonly isDownloading: boolean;
  readonly isPolling: boolean;
  readonly selectedFormatLabel: string;
  readonly selectedTargetLabel: string;
  readonly onCreate: () => void;
  readonly onDownload: () => void;
};

function ExportActionPanel({
  canDownload,
  currentJob,
  includeSensitiveData,
  isCreating,
  isDownloading,
  isPolling,
  selectedFormatLabel,
  selectedTargetLabel,
  onCreate,
  onDownload,
}: ExportActionPanelProps) {
  const StatusIcon = currentJob?.downloadReady ? CheckCircle2 : Clock3;

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-base font-semibold">작업 생성</h2>
        <p className="text-sm text-muted-foreground">
            현재 선택한 조건으로 파일을 만들어요.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <SummaryItem label="대상" value={selectedTargetLabel} />
          <SummaryItem label="형식" value={selectedFormatLabel} />
          <SummaryItem
            label="민감정보"
            value={includeSensitiveData ? "포함" : "제외"}
          />
        </div>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isCreating}
          type="button"
          onClick={onCreate}
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
          내보내기 생성
        </button>
      </div>

      <div className="grid gap-3 rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusIcon
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold">작업 상태</span>
          </div>
          {currentJob ? <StatusBadge status={currentJob.status} /> : null}
        </div>

        {currentJob ? (
          <div className="grid gap-3 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <SummaryItem label="작업 ID" value={currentJob.id} />
              <SummaryItem
                label="생성일"
                value={formatDateWithOptions(currentJob.createdAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <SummaryItem
                label="다운로드"
                value={currentJob.downloadReady ? "준비됨" : "준비 중"}
              />
              <SummaryItem
                label="민감정보"
                value={currentJob.includeSensitiveData ? "포함" : "제외"}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
                    내보내기 작업을 만들면 여기에서 볼 수 있어요.
          </p>
        )}

        {isPolling ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  작업 상태를 확인하고 있어요.
          </div>
        ) : null}

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canDownload || isDownloading}
          type="button"
          onClick={onDownload}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          다운로드
        </button>
      </div>
    </div>
  );
}

type DownloadLinkPanelProps = {
  readonly downloadInfo: ExportDownloadResponse;
};

function DownloadLinkPanel({ downloadInfo }: DownloadLinkPanelProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-start gap-2 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="grid gap-1">
                  <span className="font-semibold">다운로드 링크를 만들었어요.</span>
          <span>
            만료 시간:{" "}
            {formatDateWithOptions(downloadInfo.expiresAt, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>
      <a
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        href={downloadInfo.downloadUrl}
        rel="noreferrer"
        target="_blank"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        다운로드 열기
      </a>
    </div>
  );
}

type SensitiveConfirmDialogProps = {
  readonly formatLabel: string;
  readonly isPending: boolean;
  readonly targetLabel: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};

function SensitiveConfirmDialog({
  formatLabel,
  isPending,
  targetLabel,
  onCancel,
  onConfirm,
}: SensitiveConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
      <div
        aria-modal="true"
        className="grid w-full max-w-lg gap-4 rounded-lg bg-white p-5 shadow-xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold">민감정보 포함 확인</h2>
            <p className="text-sm text-muted-foreground">
                  {targetLabel} 데이터를 {formatLabel} 파일로 만들어요.
            </p>
          </div>
          <button
            aria-label="닫기"
            className="rounded-md p-1 hover:bg-muted"
            type="button"
            onClick={onCancel}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            이 파일에는 연락처, 위치, 메모 등 민감정보가 포함될 수 있어요. 외부
            공유 전 보안 기준을 확인해 주세요.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-muted"
            disabled={isPending}
            type="button"
            onClick={onCancel}
          >
            닫기
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="button"
            onClick={onConfirm}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            확인 후 생성
          </button>
        </div>
      </div>
    </div>
  );
}

type SummaryItemProps = {
  readonly label: string;
  readonly value: string;
};

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="grid gap-1 rounded-md bg-white p-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="break-words text-sm font-semibold">{value}</span>
    </div>
  );
}

type StatusBadgeProps = {
  readonly status: ExportJobStatus;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const meta = statusMeta[status];

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

type NoticeMessageProps = {
  readonly message: string;
  readonly onDismiss: () => void;
};

function NoticeMessage({ message, onDismiss }: NoticeMessageProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </div>
      <button
        aria-label="알림 닫기"
        className="rounded-md p-1 hover:bg-emerald-100"
        type="button"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

type ErrorMessageProps = {
  readonly message: string;
};

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function isExportJobProcessing(status: ExportJobStatus | null) {
  return status === "PENDING" || status === "PROCESSING";
}
