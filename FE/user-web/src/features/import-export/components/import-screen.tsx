import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  Package,
  RotateCcw,
  Upload,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DataUploadIcon } from "@/components/icons/data-upload-icon";
import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import {
  useCreateImportJobMutation,
} from "@/features/import-export/hooks/use-import-export-mutations";
import { useActiveImportJobs } from "@/features/import-export/hooks/use-import-export-queries";
import {
  useActiveImportTemplates,
  useDownloadImportTemplateMutation,
  useImportUserLogList,
} from "@/features/import-export/hooks/use-import-template-queries";
import {
  importTargetOptions,
  validateImportFile,
} from "@/features/import-export/schemas/import-export-schema";
import type {
  ImportJobStatus,
  ImportTargetType,
} from "@/features/import-export/types/import-export";
import type { ImportUserLogListItem } from "@/features/import-export/types/import-user-log";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";
import { readLocationNotice } from "@/utils/location-state";

const targetIcons: Record<ImportTargetType, LucideIcon> = {
  COMPANY: Building2,
  CONTACT: UserRound,
  PRODUCT: Package,
  DEAL: BriefcaseBusiness,
};

const targetLabels: Record<ImportTargetType, string> = {
  COMPANY: "회사",
  CONTACT: "담당자",
  PRODUCT: "제품",
  DEAL: "딜",
};

const targetToneClassNames: Record<
  ImportTargetType,
  {
    readonly selected: string;
    readonly idle: string;
    readonly iconBox: string;
    readonly icon: string;
  }
> = {
  COMPANY: {
    selected: "border-[#1F4EF5] bg-[#EEF4FF] text-[#1F4EF5]",
    idle: "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFF]",
    iconBox: "bg-[#EEF4FF]",
    icon: "text-[#1F4EF5]",
  },
  CONTACT: {
    selected: "border-[#4880EE] bg-[#EFF6FF] text-[#1F4EF5]",
    idle: "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFF]",
    iconBox: "bg-[#EFF6FF]",
    icon: "text-[#4880EE]",
  },
  PRODUCT: {
    selected: "border-[#15803D] bg-[#F0FDF4] text-[#15803D]",
    idle: "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FEFA]",
    iconBox: "bg-[#F0FDF4]",
    icon: "text-[#15803D]",
  },
  DEAL: {
    selected: "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]",
    idle: "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#FFFAFA]",
    iconBox: "bg-[#FEF2F2]",
    icon: "text-[#DC2626]",
  },
};

const activeStatuses = new Set<ImportJobStatus>([
  "UPLOADED",
  "MAPPED",
  "NEEDS_REVIEW",
  "READY_TO_CONFIRM",
  "CONFIRMING",
]);

export function ImportScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedTargetType, setSelectedTargetType] =
    useState<ImportTargetType>("COMPANY");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const templatesQuery = useActiveImportTemplates();
  const activeJobsQuery = useActiveImportJobs({ limit: 5 });
  const logsQuery = useImportUserLogList({ page });
  const downloadTemplateMutation = useDownloadImportTemplateMutation();
  const createImportJobMutation = useCreateImportJobMutation();

  const activeJobs = useMemo(
    () =>
      (activeJobsQuery.data?.items ?? []).filter((job) =>
        activeStatuses.has(job.status)
      ),
    [activeJobsQuery.data?.items]
  );
  const selectedTemplate = useMemo(
    () =>
      templatesQuery.data?.items.find(
        (template) => template.templateType === selectedTargetType
      ) ?? null,
    [selectedTargetType, templatesQuery.data?.items]
  );
  const logs = logsQuery.data?.items ?? [];
  const actionError =
    activeJobsQuery.error ??
    logsQuery.error ??
    templatesQuery.error ??
    downloadTemplateMutation.error ??
    createImportJobMutation.error ??
    null;

  useEffect(() => {
    const nextNotice = readLocationNotice(location.state);

    if (nextNotice) {
      setNotice(nextNotice);
    }
  }, [location.state]);

  const onFileSelected = (file: File | null) => {
    const validationMessage = validateImportFile(file);

    setSelectedFile(validationMessage ? null : file);
    setFormError(validationMessage);
  };

  const onFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    onFileSelected(event.dataTransfer.files.item(0));
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setFormError("가져올 Excel 또는 CSV 파일을 선택해 주세요.");
      return;
    }

    const validationMessage = validateImportFile(selectedFile);

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const detail = await createImportJobMutation.mutateAsync({
      targetType: selectedTargetType,
      file: selectedFile,
    });

    navigate(`/app/import/review/${detail.job.id}`);
  };

  const downloadSelectedTemplate = async () => {
    if (!selectedTemplate) {
      setFormError("선택한 대상의 양식이 아직 준비되지 않았어요.");
      return;
    }

    const file = await downloadTemplateMutation.mutateAsync({
      templateId: selectedTemplate.id,
    });
    downloadBlobFile(file, selectedTemplate.templateName);
  };

  return (
    <section className="flex min-h-full flex-col bg-white">
      <PageHeader
        breadcrumbs={[{ label: "데이터 가져오기", icon: DataUploadIcon }]}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-24 pt-0 md:px-6 md:pb-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-w-0 gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="text-[22px] font-semibold text-[#111827]">
                데이터 가져오기
              </h1>
              <p className="text-[13px] leading-5 text-[#64748B]">
                파일을 올리고, 컬럼 매칭과 오류 행만 확인한 뒤 저장합니다.
              </p>
            </div>

            <ActiveImportJobsPanel
              isError={activeJobsQuery.isError}
              isLoading={activeJobsQuery.isLoading}
              jobs={activeJobs}
              onRetry={() => void activeJobsQuery.refetch()}
            />

            <section className="grid gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  새 파일로 시작하기
                </h2>
                <p className="mt-1 text-[12px] text-[#64748B]">
                  대상과 파일만 선택하면 다음 화면에서 매칭을 이어서 확인합니다.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {importTargetOptions.map((option) => {
                  const Icon = targetIcons[option.value];
                  const tone = targetToneClassNames[option.value];
                  const isSelected = selectedTargetType === option.value;

                  return (
                    <button
                      className={cn(
                        "flex h-[74px] min-w-0 flex-col justify-between rounded-lg border p-3 text-left transition",
                        isSelected ? tone.selected : tone.idle
                      )}
                      key={option.value}
                      onClick={() => {
                        setSelectedTargetType(option.value);
                        setFormError(null);
                      }}
                      type="button"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate text-[13px] font-semibold">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                className={cn(
                  "grid min-h-[168px] cursor-pointer place-items-center rounded-lg border border-dashed px-5 py-6 text-center transition",
                  isDraggingFile
                    ? "border-[#1F4EF5] bg-[#EEF4FF]"
                    : "border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F3F7FF]"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragLeave={() => setIsDraggingFile(false)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDrop={onFileDrop}
                role="button"
                tabIndex={0}
              >
                <input
                  accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  data-testid="import-file-input"
                  onChange={(event) =>
                    onFileSelected(event.currentTarget.files?.item(0) ?? null)
                  }
                  ref={fileInputRef}
                  type="file"
                />
                <div className="min-w-0">
                  <Upload className="mx-auto h-6 w-6 text-[#4880EE]" />
                  <p className="mt-3 text-[14px] font-semibold text-[#111827]">
                    {selectedFile ? selectedFile.name : "CSV 또는 XLSX 파일 올리기"}
                  </p>
                  <p className="mt-1 text-[12px] text-[#64748B]">
                    10MB 이하 파일을 사용할 수 있어요.
                  </p>
                </div>
              </div>

              {formError ? <InlineError>{formError}</InlineError> : null}
              {actionError ? (
                <InlineError>{getApiErrorMessage(actionError)}</InlineError>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={
                    downloadTemplateMutation.isPending ||
                    templatesQuery.isLoading ||
                    !selectedTemplate
                  }
                  onClick={() => void downloadSelectedTemplate()}
                  type="button"
                >
                  {downloadTemplateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  양식 받기
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-[#1F4EF5] bg-[#1F4EF5] px-4 text-[13px] font-semibold text-white transition hover:bg-[#173FD0] disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="import-upload-submit"
                  disabled={!selectedFile || createImportJobMutation.isPending}
                  onClick={() => void uploadFile()}
                  type="button"
                >
                  {createImportJobMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  매칭 확인하기
                </button>
              </div>
            </section>
          </div>

          <ImportQuickGuide />
        </section>

        <ImportHistorySection
          isError={logsQuery.isError}
          isLoading={logsQuery.isLoading}
          logs={logs}
          onRetry={() => void logsQuery.refetch()}
        />

        {logsQuery.data && logsQuery.data.totalPages > 1 ? (
          <Pagination
            page={logsQuery.data.page}
            onPageChange={setPage}
            totalPages={logsQuery.data.totalPages}
          />
        ) : null}
      </div>

      {notice ? (
        <Toast
          message={notice}
          onClose={() => setNotice(null)}
          variant="info"
        />
      ) : null}
    </section>
  );
}

function ActiveImportJobsPanel({
  isError,
  isLoading,
  jobs,
  onRetry,
}: {
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly jobs: readonly {
    readonly id: string;
    readonly targetType: ImportTargetType;
    readonly status: ImportJobStatus;
    readonly originalFileName: string;
    readonly totalRowCount: number;
    readonly validRowCount: number;
    readonly invalidRowCount: number;
    readonly expiresAt: string;
    readonly updatedAt: string;
  }[];
  readonly onRetry: () => void;
}) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="grid gap-2 rounded-lg border border-[#E5E7EB] bg-white p-4">
        <div className="h-5 w-44 animate-pulse rounded bg-[#EEF2F7]" />
        <div className="h-16 animate-pulse rounded bg-[#F8FAFC]" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-2 text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold">
              진행 중인 가져오기를 불러오지 못했어요.
            </p>
            <button
              className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 text-[12px] font-semibold text-red-700"
              onClick={onRetry}
              type="button"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              다시 시도
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-3 rounded-lg border border-[#D8E2F8] bg-[#F8FAFF] p-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[#111827]">
            진행 중인 가져오기가 있어요.
          </h2>
          <p className="mt-1 text-[12px] text-[#64748B]">
            이어서 확인할 수 있어요.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#4880EE]">
          {jobs.length}개
        </span>
      </div>
      <div className="grid gap-2">
        {jobs.map((job) => {
          const Icon = targetIcons[job.targetType];
          const tone = targetToneClassNames[job.targetType];

          return (
            <button
              className="flex min-w-0 items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white p-3 text-left transition hover:border-[#BBD0FF] hover:bg-[#FBFDFF]"
              data-testid={`active-import-job-${job.id}`}
              key={job.id}
              onClick={() => navigate(`/app/import/review/${job.id}`)}
              type="button"
            >
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
                  tone.iconBox
                )}
              >
                <Icon className={cn("h-4 w-4", tone.icon)} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-[#111827]">
                  {targetLabels[job.targetType]} 가져오기
                </span>
                <span className="mt-1 block truncate text-[12px] text-[#64748B]">
                  {job.originalFileName} · {job.totalRowCount.toLocaleString("ko-KR")}행 · {formatImportJobStatus(job.status)}
                </span>
                <span className="mt-1 block text-[11px] text-[#94A3B8]">
                  만료까지 {formatTimeLeft(job.expiresAt)}
                </span>
              </span>
              <span className="inline-flex h-8 shrink-0 items-center rounded-md bg-[#1F4EF5] px-3 text-[12px] font-semibold text-white">
                이어서 보기
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ImportQuickGuide() {
  return (
    <aside className="grid h-fit gap-3 rounded-lg border border-[#E5E7EB] bg-[#FAFBFC] p-4">
      <h2 className="text-[14px] font-semibold text-[#111827]">
        가져오기 흐름
      </h2>
      <ol className="grid gap-3">
        {[
          "파일 올리기",
          "컬럼 매칭 확인",
          "오류 행만 수정",
          "가져오기 완료",
        ].map((label, index) => (
          <li className="flex items-center gap-3" key={label}>
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[11px] font-semibold text-[#4880EE] ring-1 ring-[#D7E3FF]">
              {index + 1}
            </span>
            <span className="text-[13px] font-medium text-[#475569]">
              {label}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function ImportHistorySection({
  isError,
  isLoading,
  logs,
  onRetry,
}: {
  readonly isError: boolean;
  readonly isLoading: boolean;
  readonly logs: readonly ImportUserLogListItem[];
  readonly onRetry: () => void;
}) {
  return (
    <section className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#E5E7EB] bg-[#FAFBFC] px-4">
        <div className="flex min-w-0 items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-[#111827]" />
          <h2 className="truncate text-[14px] font-semibold text-[#111827]">
            완료된 가져오기
          </h2>
        </div>
        <span className="text-[12px] text-[#94A3B8]">
          {logs.length.toLocaleString("ko-KR")}개
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-0">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="h-12 animate-pulse border-b border-[#EEF2F7] bg-[#F8FAFC]"
              key={index}
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="grid flex-1 place-items-center p-5 text-center">
          <div>
            <p className="text-[13px] font-semibold text-red-600">
              완료된 가져오기를 불러오지 못했어요.
            </p>
            <button
              className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E5E7EB] px-3 text-[12px] font-semibold text-[#475569]"
              onClick={onRetry}
              type="button"
            >
              다시 시도
            </button>
          </div>
        </div>
      ) : null}

      {!isLoading && !isError && logs.length === 0 ? (
        <ListEmptyState
          actionLabel="새 파일로 시작하기"
          icon={FileSpreadsheet}
          title="완료된 가져오기가 없어요"
        />
      ) : null}

      {!isLoading && !isError && logs.length > 0 ? (
        <>
          <div className="hidden min-h-0 overflow-auto md:block">
            <table className="min-w-full border-collapse text-left">
              <thead className="sticky top-0 bg-[#FAFBFC]">
                <tr className="border-b border-[#E5E7EB] text-[12px] font-semibold text-[#64748B]">
                  <th className="w-32 px-4 py-3">대상</th>
                  <th className="w-32 px-4 py-3">저장한 행</th>
                  <th className="px-4 py-3">파일</th>
                  <th className="w-40 px-4 py-3">완료일</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <ImportLogRow key={log.id} log={log} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid md:hidden">
            {logs.map((log) => (
              <ImportLogMobileCard key={log.id} log={log} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

function ImportLogRow({ log }: { readonly log: ImportUserLogListItem }) {
  const navigate = useNavigate();
  const Icon = targetIcons[log.targetType];

  return (
    <tr
      className="h-12 cursor-pointer border-b border-[#EEF2F7] text-[13px] transition hover:bg-[#F8FAFC]"
      onClick={() => navigate(`/app/import/${log.id}`)}
    >
      <td className="px-4 py-2">
        <span className="inline-flex items-center gap-2 font-semibold text-[#111827]">
          <Icon className="h-4 w-4 text-[#64748B]" />
          {targetLabels[log.targetType]}
        </span>
      </td>
      <td className="px-4 py-2 font-medium text-[#475569]">
        {log.importedRowCount.toLocaleString("ko-KR")}건
      </td>
      <td className="max-w-[360px] px-4 py-2 text-[#475569]">
        <span className="block truncate">{log.originalFileName}</span>
      </td>
      <td className="px-4 py-2 text-[#64748B]">
        {formatLogCreatedAt(log.createdAt)}
      </td>
    </tr>
  );
}

function ImportLogMobileCard({ log }: { readonly log: ImportUserLogListItem }) {
  const navigate = useNavigate();
  const Icon = targetIcons[log.targetType];

  return (
    <button
      className="flex min-w-0 items-center gap-3 border-b border-[#EEF2F7] p-4 text-left last:border-b-0"
      onClick={() => navigate(`/app/import/${log.id}`)}
      type="button"
    >
      <Icon className="h-4 w-4 shrink-0 text-[#64748B]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {log.originalFileName}
        </span>
        <span className="mt-1 block text-[12px] text-[#64748B]">
          {targetLabels[log.targetType]} · {log.importedRowCount.toLocaleString("ko-KR")}건 · {formatLogCreatedAt(log.createdAt)}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#CBD5E1]" />
    </button>
  );
}

function InlineError({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function formatImportJobStatus(status: ImportJobStatus) {
  switch (status) {
    case "UPLOADED":
      return "컬럼 매칭 필요";
    case "MAPPED":
      return "매칭 확인 필요";
    case "NEEDS_REVIEW":
      return "오류 확인 필요";
    case "READY_TO_CONFIRM":
      return "가져오기 가능";
    case "CONFIRMING":
      return "저장 중";
    case "CONFIRMED":
      return "완료";
    case "FAILED":
      return "문제 발생";
    case "CANCELED":
      return "취소됨";
    case "EXPIRED":
      return "만료됨";
  }
}

function formatTimeLeft(expiresAt: string) {
  const expiresTime = new Date(expiresAt).getTime();
  const diffMs = expiresTime - Date.now();

  if (!Number.isFinite(expiresTime) || diffMs <= 0) {
    return "만료됨";
  }

  const hours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (hours < 24) {
    return `${hours}시간`;
  }

  return `${Math.ceil(hours / 24)}일`;
}

function formatLogCreatedAt(createdAt: string) {
  return formatDateWithOptions(createdAt, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function downloadBlobFile(file: ApiBlobResponse, fallbackFileName: string) {
  const url = URL.createObjectURL(file.blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = file.fileName ?? fallbackFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
