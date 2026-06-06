import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Columns3,
  FileSpreadsheet,
  Handshake,
  Loader2,
  Package,
  Play,
  Save,
  Sparkles,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useConfirmImportJobMutation,
  useCreateImportJobMutation,
  useGenerateImportMappingMutation,
  useUpdateImportMappingMutation,
} from "@/features/import-export/hooks/use-import-export-mutations";
import { useImportJobDetail } from "@/features/import-export/hooks/use-import-export-queries";
import {
  createEmptyMapping,
  hasRequiredMapping,
  importTargetFields,
  importTargetOptions,
  validateImportFile,
} from "@/features/import-export/schemas/import-export-schema";
import type {
  ImportJobResponse,
  ImportJobResultResponse,
  ImportJobRow,
  ImportMapping,
  ImportMappingResponse,
  ImportRowStatus,
  ImportTargetType,
} from "@/features/import-export/types/import-export";
import { getApiErrorMessage } from "@/lib/api-client";

const targetIcons: Record<ImportTargetType, LucideIcon> = {
  COMPANY: Building2,
  CONTACT: UserRound,
  PRODUCT: Package,
  DEAL: Handshake,
};

export function ImportScreen() {
  const [targetType, setTargetType] = useState<ImportTargetType>("COMPANY");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [importJobId, setImportJobId] = useState("");
  const [lastJob, setLastJob] = useState<ImportJobResponse | null>(null);
  const [draftMapping, setDraftMapping] = useState<ImportMapping>(() =>
    createEmptyMapping("COMPANY")
  );
  const [latestSuggestion, setLatestSuggestion] =
    useState<ImportMappingResponse | null>(null);
  const [result, setResult] = useState<ImportJobResultResponse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const detailQuery = useImportJobDetail(importJobId);
  const createMutation = useCreateImportJobMutation();
  const mappingMutation = useGenerateImportMappingMutation();
  const updateMappingMutation = useUpdateImportMappingMutation();
  const confirmMutation = useConfirmImportJobMutation(importJobId);
  const currentJob = chooseLatestJob(detailQuery.data?.job ?? null, lastJob);
  const currentRows = useMemo(
    () => currentJob?.previewRows ?? detailQuery.data?.rows ?? [],
    [currentJob?.previewRows, detailQuery.data?.rows]
  );
  const currentTargetType = currentJob?.targetType ?? targetType;
  const sourceColumns = useMemo(
    () => collectSourceColumns(currentRows),
    [currentRows]
  );
  const actionError =
    createMutation.error ??
    mappingMutation.error ??
    updateMappingMutation.error ??
    confirmMutation.error ??
    detailQuery.error ??
    null;
  const suggestion = latestSuggestion ?? currentJob?.aiMapping ?? null;
  const hasSavedMapping = Boolean(currentJob?.mapping);
  const hasInvalidRows = (currentJob?.invalidRowCount ?? 0) > 0;
  const canSaveMapping =
    Boolean(currentJob) && hasRequiredMapping(currentTargetType, draftMapping);
  const canConfirm =
    Boolean(currentJob) &&
    hasSavedMapping &&
    !hasInvalidRows &&
    currentJob?.status !== "COMPLETED" &&
    !confirmMutation.isPending;

  const onTargetChange = (nextTargetType: ImportTargetType) => {
    setTargetType(nextTargetType);
    setSelectedFile(null);
    setFileError(null);
    setImportJobId("");
    setLastJob(null);
    setLatestSuggestion(null);
    setResult(null);
    setNotice(null);
    setDraftMapping(createEmptyMapping(nextTargetType));
  };

  const onFileChange = (file: File | null) => {
    setSelectedFile(file);
    setFileError(validateImportFile(file));
    setImportJobId("");
    setLastJob(null);
    setLatestSuggestion(null);
    setResult(null);
    setNotice(null);
    setDraftMapping(createEmptyMapping(targetType));
  };

  const onUpload = async () => {
    const validationMessage = validateImportFile(selectedFile);

    if (validationMessage || !selectedFile) {
      setFileError(validationMessage);
      return;
    }

    const job = await createMutation.mutateAsync({
      targetType,
      file: selectedFile,
    });

    setImportJobId(job.id);
    setLastJob(job);
    setLatestSuggestion(job.aiMapping ?? null);
    setDraftMapping(
      completeMapping(job.targetType, job.mapping ?? job.aiMapping?.suggestedMapping)
    );
    setNotice("파일 업로드와 미리보기가 완료되었습니다.");
  };

  const onGenerateMapping = async () => {
    if (!currentJob) {
      return;
    }

    const generated = await mappingMutation.mutateAsync(currentJob.id);
    setLatestSuggestion(generated);
    setDraftMapping(completeMapping(currentTargetType, generated.suggestedMapping));
    setNotice("AI 매핑 제안이 준비되었습니다.");
    void detailQuery.refetch();
  };

  const onSaveMapping = async () => {
    if (!currentJob || !canSaveMapping) {
      return;
    }

    const job = await updateMappingMutation.mutateAsync({
      importJobId: currentJob.id,
      mapping: draftMapping,
    });

    setLastJob(job);
    setNotice(
      job.invalidRowCount > 0
        ? "매핑은 저장되었지만 오류 행이 있어 확정할 수 없습니다."
        : "매핑과 행 검증이 완료되었습니다."
    );
  };

  const onConfirm = async () => {
    if (!currentJob || !canConfirm) {
      return;
    }

    const confirmed = await confirmMutation.mutateAsync({
      importJobId: currentJob.id,
    });

    setResult(confirmed);
    setLastJob(null);
    setConfirmOpen(false);
    setNotice("가져오기 실행이 완료되었습니다.");
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-2xl font-semibold">데이터 가져오기</h1>
        <p className="text-sm text-muted-foreground">
          Excel/CSV 파일을 올리고 매핑을 확인한 뒤 데이터를 반영합니다.
        </p>
      </header>

      {notice ? (
        <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <section className="grid content-start gap-5 rounded-lg border bg-white p-4">
          <TargetSelector
            selectedTargetType={targetType}
            onSelect={onTargetChange}
          />

          <FileUploadPanel
            file={selectedFile}
            fileError={fileError}
            isUploading={createMutation.isPending}
            onFileChange={onFileChange}
            onUpload={() => void onUpload()}
          />

          <JobSummary job={currentJob} result={result} />
        </section>

        <section className="grid content-start gap-5 rounded-lg border bg-white p-4">
          <MappingPanel
            canConfirm={canConfirm}
            canSaveMapping={canSaveMapping}
            currentJob={currentJob}
            draftMapping={draftMapping}
            isConfirming={confirmMutation.isPending}
            isGenerating={mappingMutation.isPending}
            isSaving={updateMappingMutation.isPending}
            onConfirm={() => setConfirmOpen(true)}
            onGenerateMapping={() => void onGenerateMapping()}
            onMappingChange={(field, sourceColumn) =>
              setDraftMapping((current) => ({
                ...current,
                [field]: sourceColumn || null,
              }))
            }
            onSaveMapping={() => void onSaveMapping()}
            sourceColumns={sourceColumns}
            suggestion={suggestion}
            targetType={currentTargetType}
          />
        </section>
      </div>

      <PreviewTable
        rows={currentRows}
        sourceColumns={sourceColumns}
        targetType={currentTargetType}
        useMappedData={hasSavedMapping}
      />

      {result ? <ResultPanel result={result} /> : null}

      {confirmOpen && currentJob ? (
        <ConfirmDialog
          isPending={confirmMutation.isPending}
          job={currentJob}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void onConfirm()}
        />
      ) : null}
    </section>
  );
}

function TargetSelector({
  selectedTargetType,
  onSelect,
}: {
  readonly selectedTargetType: ImportTargetType;
  readonly onSelect: (targetType: ImportTargetType) => void;
}) {
  return (
    <div className="grid gap-3">
      <div>
        <h2 className="text-base font-semibold">대상 선택</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          가져올 데이터 유형을 선택합니다.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {importTargetOptions.map((option) => {
          const Icon = targetIcons[option.value];
          const active = selectedTargetType === option.value;

          return (
            <button
              className={`grid min-h-[74px] gap-1 rounded-md border px-3 py-2 text-left ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-white hover:bg-muted"
              }`}
              key={option.value}
              onClick={() => onSelect(option.value)}
              type="button"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4" />
                {option.label}
              </span>
              <span
                className={`text-xs ${
                  active ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FileUploadPanel({
  file,
  fileError,
  isUploading,
  onFileChange,
  onUpload,
}: {
  readonly file: File | null;
  readonly fileError: string | null;
  readonly isUploading: boolean;
  readonly onFileChange: (file: File | null) => void;
  readonly onUpload: () => void;
}) {
  return (
    <div className="grid gap-3">
      <div>
        <h2 className="text-base font-semibold">파일 업로드</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          CSV, XLS, XLSX 형식의 10MB 이하 파일을 지원합니다.
        </p>
      </div>

      <label
        className="grid min-h-[180px] cursor-pointer place-items-center rounded-lg border border-dashed bg-muted/30 p-4 text-center hover:bg-muted/50"
        htmlFor="import-file"
      >
        <div className="grid gap-3">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white">
            <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">가져오기 파일 선택</p>
            <p className="mt-1 text-xs text-muted-foreground">
                    파일을 선택하면 미리보기 작업을 만들 수 있습니다.
            </p>
          </div>
        </div>
        <input
          accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="sr-only"
          id="import-file"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          type="file"
        />
      </label>

      {file ? (
        <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
          <span className="inline-flex min-w-0 items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{file.name}</span>
          </span>
          <button
            aria-label="선택한 파일 지우기"
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => onFileChange(null)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {fileError ? <p className="text-sm text-destructive">{fileError}</p> : null}

      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isUploading}
        onClick={onUpload}
        type="button"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        업로드
      </button>
    </div>
  );
}

function JobSummary({
  job,
  result,
}: {
  readonly job: ImportJobResponse | null;
  readonly result: ImportJobResultResponse | null;
}) {
  if (!job) {
    return (
      <div className="rounded-md border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
        파일 없음
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-md border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">가져오기 작업</span>
        <StatusBadge status={job.status} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <Metric label="전체" value={job.rowCount} />
        <Metric label="정상" value={job.validRowCount} />
        <Metric label="오류" value={job.invalidRowCount} />
      </div>
      {result ? (
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <Metric label="성공" value={result.successCount} />
          <Metric label="실패" value={result.failedCount} />
        </div>
      ) : null}
    </div>
  );
}

function MappingPanel({
  currentJob,
  targetType,
  sourceColumns,
  draftMapping,
  suggestion,
  canSaveMapping,
  canConfirm,
  isGenerating,
  isSaving,
  isConfirming,
  onGenerateMapping,
  onSaveMapping,
  onConfirm,
  onMappingChange,
}: {
  readonly currentJob: ImportJobResponse | null;
  readonly targetType: ImportTargetType;
  readonly sourceColumns: readonly string[];
  readonly draftMapping: ImportMapping;
  readonly suggestion: ImportMappingResponse | null;
  readonly canSaveMapping: boolean;
  readonly canConfirm: boolean;
  readonly isGenerating: boolean;
  readonly isSaving: boolean;
  readonly isConfirming: boolean;
  readonly onGenerateMapping: () => void;
  readonly onSaveMapping: () => void;
  readonly onConfirm: () => void;
  readonly onMappingChange: (field: string, sourceColumn: string) => void;
}) {
  return (
    <div className="grid content-start gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">컬럼 매핑</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            원본 컬럼을 저장 대상 필드에 연결합니다.
          </p>
        </div>
        <Columns3 className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!currentJob || isGenerating}
          onClick={onGenerateMapping}
          type="button"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          AI 매핑
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSaveMapping || isSaving}
          onClick={onSaveMapping}
          type="button"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          매핑 저장
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canConfirm || isConfirming}
          onClick={onConfirm}
          type="button"
        >
          {isConfirming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          가져오기 실행
        </button>
      </div>

      {suggestion ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          AI 신뢰도 {Math.round(suggestion.confidence * 100)}%
          {suggestion.unmappedColumns.length > 0
            ? ` · 미사용 컬럼 ${suggestion.unmappedColumns.length}개`
            : ""}
        </div>
      ) : null}

      {!currentJob ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="매핑 대기"
          text="파일을 업로드하면 원본 컬럼을 선택할 수 있습니다."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {importTargetFields[targetType].map((field) => (
            <div className="grid gap-2" key={field.field}>
              <label className="text-sm font-medium" htmlFor={`mapping-${field.field}`}>
                {field.label}
                {field.required ? (
                  <span className="ml-1 text-destructive">*</span>
                ) : null}
              </label>
              <select
                className="h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                id={`mapping-${field.field}`}
                onChange={(event) => onMappingChange(field.field, event.target.value)}
                value={draftMapping[field.field] ?? ""}
              >
                <option value="">매핑 없음</option>
                {sourceColumns.map((sourceColumn) => (
                  <option key={sourceColumn} value={sourceColumn}>
                    {sourceColumn}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {currentJob?.invalidRowCount ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
          오류 행이 있어 가져오기 실행이 비활성화되었습니다.
        </p>
      ) : null}
    </div>
  );
}

function PreviewTable({
  rows,
  sourceColumns,
  targetType,
  useMappedData,
}: {
  readonly rows: readonly ImportJobRow[];
  readonly sourceColumns: readonly string[];
  readonly targetType: ImportTargetType;
  readonly useMappedData: boolean;
}) {
  const columns = useMappedData
    ? importTargetFields[targetType].map((field) => field.field)
    : sourceColumns;

  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">미리보기</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            행별 데이터와 오류 사유를 확인합니다.
          </p>
        </div>
        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="미리보기 없음"
          text="파일을 업로드하면 행이 표시됩니다."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="w-20 px-3 py-2 font-medium">Row</th>
                <th className="w-32 px-3 py-2 font-medium">상태</th>
                {columns.map((column) => (
                  <th className="min-w-36 px-3 py-2 font-medium" key={column}>
                    {toColumnLabel(targetType, column, useMappedData)}
                  </th>
                ))}
                <th className="min-w-60 px-3 py-2 font-medium">오류</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-t" key={row.id}>
                  <td className="px-3 py-2 text-muted-foreground">{row.rowNumber}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                  {columns.map((column) => (
                    <td className="max-w-[220px] px-3 py-2" key={column}>
                      <span className="block truncate">
                        {formatCellValue(
                          useMappedData
                            ? row.mappedData?.[column] ?? null
                            : row.rawData[column] ?? ""
                        )}
                      </span>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-destructive">
                    {row.errorMessage ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ResultPanel({ result }: { readonly result: ImportJobResultResponse }) {
  return (
    <section className="grid gap-3 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">실행 결과</h2>
        <StatusBadge status={result.status} />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <Metric label="성공 행" value={result.successCount} />
        <Metric label="실패 행" value={result.failedCount} />
      </div>
      {result.errors.length > 0 ? (
        <div className="grid gap-2">
          {result.errors.map((error) => (
            <p
              className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive"
              key={`${error.rowNumber}-${error.message}`}
            >
              행 {error.rowNumber ?? "-"} · {error.message}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ConfirmDialog({
  job,
  isPending,
  onCancel,
  onConfirm,
}: {
  readonly job: ImportJobResponse;
  readonly isPending: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
      <div
        aria-modal="true"
        className="grid w-full max-w-md gap-4 rounded-lg bg-white p-5 shadow-lg"
        role="dialog"
      >
        <div>
          <h2 className="text-lg font-semibold">가져오기 실행</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {job.rowCount}개 행이 현재 매핑 기준으로 반영됩니다.
          </p>
        </div>
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          실행 후 생성된 데이터는 개별 화면에서 관리해야 합니다.
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            실행
          </button>
        </div>
      </div>
    </div>
  );
}

function NoticeMessage({
  message,
  onDismiss,
}: {
  readonly message: string;
  readonly onDismiss: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      <span className="inline-flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </span>
      <button
        aria-label="알림 닫기"
        className="grid h-7 w-7 place-items-center rounded-md hover:bg-emerald-100"
        onClick={onDismiss}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ErrorMessage({ message }: { readonly message: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      {message}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly text: string;
}) {
  return (
    <div className="grid place-items-center rounded-md border bg-muted/30 px-4 py-10 text-center">
      <div className="grid max-w-sm gap-2">
        <Icon className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <div className="rounded-md border bg-white px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value.toLocaleString()}</p>
    </div>
  );
}

function StatusBadge({ status }: { readonly status: ImportRowStatus | string }) {
  const tone = getStatusTone(status);

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium ${tone}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function getStatusTone(status: string) {
  if (["COMPLETED", "IMPORTED", "VALID", "MAPPING_READY"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (["FAILED", "VALIDATION_FAILED"].includes(status)) {
    return "border-destructive/30 bg-red-50 text-destructive";
  }

  if (["PROCESSING", "MAPPING_PENDING"].includes(status)) {
    return "border-blue-200 bg-blue-50 text-blue-900";
  }

  return "border-muted bg-muted/40 text-muted-foreground";
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    UPLOADED: "업로드",
    PREVIEW_READY: "미리보기",
    MAPPING_PENDING: "매핑 중",
    MAPPING_READY: "매핑 완료",
    VALIDATION_FAILED: "오류",
    CONFIRMED: "확정",
    PROCESSING: "실행 중",
    COMPLETED: "완료",
    FAILED: "실패",
    CANCELED: "취소",
    PENDING: "대기",
    VALID: "정상",
    IMPORTED: "반영",
    SKIPPED: "건너뜀",
  };

  return labels[status] ?? status;
}

function collectSourceColumns(rows: readonly ImportJobRow[]) {
  const columns = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row.rawData).forEach((column) => columns.add(column));
  });

  return Array.from(columns);
}

function completeMapping(
  targetType: ImportTargetType,
  mapping: ImportMapping | null | undefined
): ImportMapping {
  return {
    ...createEmptyMapping(targetType),
    ...(mapping ?? {}),
  };
}

function chooseLatestJob(
  queriedJob: ImportJobResponse | null,
  localJob: ImportJobResponse | null
) {
  if (!queriedJob) {
    return localJob;
  }

  if (!localJob) {
    return queriedJob;
  }

  return Date.parse(localJob.updatedAt) >= Date.parse(queriedJob.updatedAt)
    ? localJob
    : queriedJob;
}

function toColumnLabel(
  targetType: ImportTargetType,
  column: string,
  useMappedData: boolean
) {
  if (!useMappedData) {
    return column;
  }

  return (
    importTargetFields[targetType].find((field) => field.field === column)?.label ??
    column
  );
}

function formatCellValue(value: string | number | null) {
  if (value === null || value === "") {
    return "-";
  }

  return String(value);
}
