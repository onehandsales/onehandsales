import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronLeft,
  Loader2,
  Package,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { DataUploadIcon } from "@/components/icons/data-upload-icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import {
  useCancelImportJobMutation,
  useConfirmImportJobMutation,
  useGenerateImportMappingMutation,
  useUpdateImportJobRowsMutation,
  useUpdateImportMappingMutation,
  useValidateImportJobMutation,
} from "@/features/import-export/hooks/use-import-export-mutations";
import {
  useImportJobDetail,
  useImportJobErrors,
} from "@/features/import-export/hooks/use-import-export-queries";
import type {
  ImportFieldValue,
  ImportJobDetailResponse,
  ImportJobRow,
  ImportJobRowStatus,
  ImportJobStatus,
  ImportMappedRowData,
  ImportTargetType,
} from "@/features/import-export/types/import-export";
import type { ImportTemplateColumn } from "@/features/import-export/types/import-template";
import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

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

const terminalStatuses = new Set<ImportJobStatus>([
  "CONFIRMED",
  "FAILED",
  "CANCELED",
  "EXPIRED",
]);

type ImportReviewScreenProps = {
  readonly importJobId: string;
};

type DraftRow = {
  readonly rowId: string;
  readonly rowNumber: number;
  readonly data: ImportMappedRowData;
  readonly excluded: boolean;
};

export function ImportReviewScreen({ importJobId }: ImportReviewScreenProps) {
  const navigate = useNavigate();
  const confirmIdempotencyKeyRef = useRef<string | null>(null);
  const [draftRows, setDraftRows] = useState<Readonly<Record<string, DraftRow>>>(
    {}
  );
  const [dirtyRowIds, setDirtyRowIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [problemPanelOpen, setProblemPanelOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const detailQuery = useImportJobDetail(importJobId);
  const errorsQuery = useImportJobErrors({
    importJobId: problemPanelOpen ? importJobId : "",
    limit: 50,
  });
  const generateMappingMutation = useGenerateImportMappingMutation();
  const updateMappingMutation = useUpdateImportMappingMutation();
  const updateRowsMutation = useUpdateImportJobRowsMutation();
  const validateMutation = useValidateImportJobMutation();
  const confirmMutation = useConfirmImportJobMutation(importJobId);
  const cancelMutation = useCancelImportJobMutation();

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }

    setDraftRows(toDraftRows(detailQuery.data.rows));
    setDirtyRowIds(new Set());
  }, [detailQuery.data]);

  useEffect(() => {
    if (
      detailQuery.error instanceof ApiClientError &&
      detailQuery.error.statusCode === 404
    ) {
      navigate("/app/import", {
        replace: true,
        state: {
          notice: "가져오기를 찾지 못했어요. 새 파일로 다시 시작해 주세요.",
        },
      });
    }
  }, [detailQuery.error, navigate]);

  if (detailQuery.isLoading) {
    return <ImportReviewSkeleton />;
  }

  if (detailQuery.isError) {
    return (
      <ImportReviewError
        error={detailQuery.error}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const detail = detailQuery.data;

  if (!detail) {
    return <ImportReviewSkeleton />;
  }

  if (detail.job.status === "CONFIRMED" && detail.job.importUserLogId) {
    return <Navigate replace to={`/app/import/${detail.job.importUserLogId}`} />;
  }

  const isClosed = terminalStatuses.has(detail.job.status);
  const isBusy =
    generateMappingMutation.isPending ||
    updateMappingMutation.isPending ||
    updateRowsMutation.isPending ||
    validateMutation.isPending ||
    confirmMutation.isPending ||
    cancelMutation.isPending ||
    detail.job.status === "CONFIRMING";
  const visibleRows = createVisibleRows({
    detail,
    draftRows,
    showOnlyErrors,
  });
  const hasDirtyRows = dirtyRowIds.size > 0;
  const canConfirm =
    detail.job.status === "READY_TO_CONFIRM" &&
    detail.job.validRowCount > 0 &&
    detail.job.invalidRowCount === 0 &&
    !hasDirtyRows &&
    !isClosed;
  const primaryLabel = getPrimaryActionLabel(detail.job.status, hasDirtyRows);

  const changeMapping = async (fieldKey: string, sourceColumn: string) => {
    if (isClosed || isBusy) {
      return;
    }

    await updateMappingMutation.mutateAsync({
      importJobId,
      mapping: {
        ...detail.mapping,
        [fieldKey]: sourceColumn.length > 0 ? sourceColumn : null,
      },
    });
  };

  const changeDraftCell = (rowId: string, fieldKey: string, value: string) => {
    setDraftRows((currentRows) => {
      const row = currentRows[rowId];

      if (!row) {
        return currentRows;
      }

      return {
        ...currentRows,
        [rowId]: {
          ...row,
          data: {
            ...row.data,
            [fieldKey]: toDraftValue(value),
          },
        },
      };
    });
    setDirtyRowIds((currentIds) => new Set(currentIds).add(rowId));
  };

  const changeDraftExcluded = (rowId: string, excluded: boolean) => {
    setDraftRows((currentRows) => {
      const row = currentRows[rowId];

      if (!row) {
        return currentRows;
      }

      return {
        ...currentRows,
        [rowId]: {
          ...row,
          excluded,
        },
      };
    });
    setDirtyRowIds((currentIds) => new Set(currentIds).add(rowId));
  };

  const saveDirtyRows = async () => {
    const rows = [...dirtyRowIds]
      .map((rowId) => draftRows[rowId])
      .filter((row): row is DraftRow => row !== undefined);

    if (rows.length === 0) {
      return;
    }

    await updateRowsMutation.mutateAsync({
      importJobId,
      rows: rows.map((row) => ({
        rowId: row.rowId,
        data: row.data,
        excluded: row.excluded,
      })),
    });
  };

  const runPrimaryAction = async () => {
    if (isClosed || isBusy) {
      return;
    }

    if (detail.job.status === "UPLOADED" || detail.job.mappingSource === "NONE") {
      await generateMappingMutation.mutateAsync({ importJobId });
      return;
    }

    if (hasDirtyRows) {
      await saveDirtyRows();
      return;
    }

    if (canConfirm) {
      confirmIdempotencyKeyRef.current ??= createConfirmIdempotencyKey(importJobId);
      const result = await confirmMutation.mutateAsync({
        importJobId,
        idempotencyKey: confirmIdempotencyKeyRef.current,
      });
      confirmIdempotencyKeyRef.current = null;
      navigate(`/app/import/${result.importUserLogId}`, { replace: true });
      return;
    }

    await validateMutation.mutateAsync(importJobId);
  };

  const cancelImport = async () => {
    await cancelMutation.mutateAsync({ importJobId });
    navigate("/app/import", {
      replace: true,
      state: { notice: "가져오기를 취소했어요." },
    });
  };

  return (
    <section className="flex min-h-dvh flex-col bg-white">
      <ImportReviewHeader title={`${targetLabels[detail.job.targetType]} 가져오기`} />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-28 md:px-6 md:pb-24">
        <ReviewHero detail={detail} />
        <StepIndicator status={detail.job.status} />

        {isClosed ? <ClosedState status={detail.job.status} /> : null}
        {detail.job.invalidRowCount > 0 && !isClosed ? (
          <InlineNotice tone="warning">
            오류가 있는 셀만 수정하면 가져오기를 완료할 수 있어요.
          </InlineNotice>
        ) : null}
        {hasDirtyRows ? (
          <InlineNotice tone="info">
            수정한 내용이 있어요. 저장하면 서버 상태 기준으로 다시 확인합니다.
          </InlineNotice>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <MappingPanel
            detail={detail}
            disabled={isClosed || isBusy}
            onChangeMapping={(fieldKey, sourceColumn) =>
              void changeMapping(fieldKey, sourceColumn)
            }
            onGenerateMapping={() =>
              void generateMappingMutation.mutateAsync({ importJobId })
            }
          />

          <RowsPanel
            detail={detail}
            dirtyRowIds={dirtyRowIds}
            disabled={isClosed || isBusy}
            draftRows={draftRows}
            onCellChange={changeDraftCell}
            onExcludedChange={changeDraftExcluded}
            onToggleErrorFilter={() => setShowOnlyErrors((current) => !current)}
            showOnlyErrors={showOnlyErrors}
            visibleRows={visibleRows}
          />
        </section>

        <ProblemHistoryPanel
          errorsQuery={errorsQuery}
          isOpen={problemPanelOpen}
          onToggle={() => setProblemPanelOpen((current) => !current)}
        />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur md:left-[var(--app-sidebar-width,0px)] md:px-6">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-[12px] text-[#64748B]">
            <span className="font-semibold text-[#111827]">
              {formatImportJobStatus(detail.job.status)}
            </span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="truncate">
              유효 {detail.job.validRowCount.toLocaleString("ko-KR")}행,
              수정 필요 {detail.job.invalidRowCount.toLocaleString("ko-KR")}행
            </span>
          </div>
          <div className="flex min-w-0 gap-2">
            <button
              className="hidden h-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#475569] transition hover:bg-[#F8FAFC] sm:inline-flex"
              onClick={() => navigate("/app/import")}
              type="button"
            >
              나중에 이어서 하기
            </button>
            {!isClosed ? (
              <button
                className="hidden h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 sm:inline-flex"
                disabled={isBusy}
                onClick={() => setCancelDialogOpen(true)}
                type="button"
              >
                취소하기
              </button>
            ) : null}
            {isClosed ? (
              <button
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[#1F4EF5] bg-[#1F4EF5] px-4 text-[13px] font-semibold text-white transition hover:bg-[#173FD0] sm:flex-none"
                onClick={() => navigate("/app/import")}
                type="button"
              >
                새 파일로 시작하기
              </button>
            ) : (
              <button
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-[#1F4EF5] bg-[#1F4EF5] px-4 text-[13px] font-semibold text-white transition hover:bg-[#173FD0] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                data-testid="import-review-primary-action"
                disabled={
                  isBusy ||
                  (detail.job.status === "READY_TO_CONFIRM" &&
                    !canConfirm &&
                    !hasDirtyRows)
                }
                onClick={() => void runPrimaryAction()}
                type="button"
              >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {primaryLabel}
              </button>
            )}
          </div>
        </div>
      </footer>

      <ConfirmDialog
        cancelLabel="닫기"
        confirmLabel="취소하기"
        isPending={cancelMutation.isPending}
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={() => void cancelImport()}
        open={cancelDialogOpen}
        title="가져오기를 취소할까요?"
      />

      {notice ? (
        <Toast message={notice} onClose={() => setNotice(null)} variant="info" />
      ) : null}
    </section>
  );
}

function ImportReviewHeader({ title }: { readonly title: string }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 bg-white px-4 md:px-6">
      <Link aria-label="목록으로 돌아가기" to="/app/import">
        <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        <DataUploadIcon className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
        <span className="shrink-0 font-medium text-[#6B7280]">
          데이터 가져오기
        </span>
        <span className="shrink-0 text-[#CBD5E1]">/</span>
        <span className="min-w-0 truncate font-bold text-[#111827]">
          {title}
        </span>
      </div>
    </div>
  );
}

function ReviewHero({ detail }: { readonly detail: ImportJobDetailResponse }) {
  const Icon = targetIcons[detail.job.targetType];

  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#EEF4FF]">
            <Icon className="h-5 w-5 text-[#4880EE]" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-semibold text-[#111827]">
              {targetLabels[detail.job.targetType]} 가져오기
            </h1>
            <p className="mt-1 truncate text-[13px] text-[#64748B]">
              {detail.job.originalFileName}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-left sm:grid-cols-4 lg:min-w-[520px]">
          <SummaryFact label="전체 행" value={`${detail.job.totalRowCount}행`} />
          <SummaryFact label="유효 행" value={`${detail.job.validRowCount}행`} />
          <SummaryFact
            label="수정 필요"
            value={`${detail.job.invalidRowCount}행`}
          />
          <SummaryFact label="만료까지" value={formatTimeLeft(detail.job.expiresAt)} />
        </dl>
      </div>
    </section>
  );
}

function StepIndicator({ status }: { readonly status: ImportJobStatus }) {
  const currentStep = getCurrentStep(status);
  const steps = ["파일", "컬럼 매칭", "오류 확인", "완료"];

  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <li
            className={cn(
              "flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-md border text-[12px] font-semibold",
              isDone && "border-[#1F4EF5] bg-[#1F4EF5] text-white",
              isCurrent && "border-[#BBD0FF] bg-[#EEF4FF] text-[#1F4EF5]",
              !isDone && !isCurrent && "border-[#E5E7EB] bg-white text-[#94A3B8]"
            )}
            key={step}
          >
            {isDone ? <Check className="h-3.5 w-3.5" /> : null}
            <span className="truncate">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

function MappingPanel({
  detail,
  disabled,
  onChangeMapping,
  onGenerateMapping,
}: {
  readonly detail: ImportJobDetailResponse;
  readonly disabled: boolean;
  readonly onChangeMapping: (fieldKey: string, sourceColumn: string) => void;
  readonly onGenerateMapping: () => void;
}) {
  return (
    <section className="grid h-fit gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[#111827]">
            컬럼 매칭
          </h2>
          <p className="mt-1 text-[12px] text-[#64748B]">
            파일 컬럼을 onehand.sales 필드에 맞춥니다.
          </p>
        </div>
        <button
          className="inline-flex h-8 shrink-0 items-center rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#475569] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={onGenerateMapping}
          type="button"
        >
          자동 매칭
        </button>
      </div>
      <div className="grid gap-2">
        {detail.templateColumns.map((column) => (
          <label className="grid gap-1" key={column.key}>
            <span className="text-[12px] font-semibold text-[#475569]">
              {column.label}
              {column.required ? <span className="text-red-500"> *</span> : null}
            </span>
            <select
              className="h-9 rounded-md border border-[#D7DCE5] bg-white px-2 text-[13px] text-[#111827] outline-none transition focus:border-[#4880EE] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
              disabled={disabled}
              onChange={(event) => onChangeMapping(column.key, event.target.value)}
              value={detail.mapping[column.key] ?? ""}
            >
              <option value="">매칭하지 않음</option>
              {detail.sourceColumns.map((sourceColumn) => (
                <option key={sourceColumn} value={sourceColumn}>
                  {sourceColumn}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

function RowsPanel({
  detail,
  dirtyRowIds,
  disabled,
  draftRows,
  onCellChange,
  onExcludedChange,
  onToggleErrorFilter,
  showOnlyErrors,
  visibleRows,
}: {
  readonly detail: ImportJobDetailResponse;
  readonly dirtyRowIds: ReadonlySet<string>;
  readonly disabled: boolean;
  readonly draftRows: Readonly<Record<string, DraftRow>>;
  readonly onCellChange: (rowId: string, fieldKey: string, value: string) => void;
  readonly onExcludedChange: (rowId: string, excluded: boolean) => void;
  readonly onToggleErrorFilter: () => void;
  readonly showOnlyErrors: boolean;
  readonly visibleRows: readonly ImportJobRow[];
}) {
  return (
    <section className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex shrink-0 flex-col gap-3 border-b border-[#E5E7EB] bg-[#FAFBFC] p-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[#111827]">
            오류 행 확인
          </h2>
          <p className="mt-1 text-[12px] text-[#64748B]">
            수정이 필요한 셀만 강조합니다.
          </p>
        </div>
        <button
          className={cn(
            "inline-flex h-8 items-center justify-center rounded-md border px-3 text-[12px] font-semibold transition",
            showOnlyErrors
              ? "border-[#1F4EF5] bg-[#EEF4FF] text-[#1F4EF5]"
              : "border-[#E5E7EB] bg-white text-[#475569] hover:bg-[#F8FAFC]"
          )}
          onClick={onToggleErrorFilter}
          type="button"
        >
          오류 행만 보기
        </button>
      </div>

      {visibleRows.length === 0 ? (
        <div className="grid flex-1 place-items-center px-5 text-center">
          <p className="text-[13px] font-medium text-[#64748B]">
            표시할 오류 행이 없어요.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden min-h-0 flex-1 overflow-auto md:block">
            <table className="min-w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#FAFBFC]">
                <tr className="border-b border-[#E5E7EB] text-[12px] font-semibold text-[#64748B]">
                  <th className="w-16 px-3 py-3">행</th>
                  <th className="w-20 px-3 py-3">제외</th>
                  {detail.templateColumns.map((column) => (
                    <th className="min-w-44 px-3 py-3" key={column.key}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <EditableDesktopRow
                    columns={detail.templateColumns}
                    dirty={dirtyRowIds.has(row.rowId)}
                    disabled={disabled}
                    draft={draftRows[row.rowId]}
                    key={row.rowId}
                    onCellChange={onCellChange}
                    onExcludedChange={onExcludedChange}
                    row={row}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid md:hidden">
            {visibleRows.map((row) => (
              <EditableMobileRow
                columns={detail.templateColumns}
                dirty={dirtyRowIds.has(row.rowId)}
                disabled={disabled}
                draft={draftRows[row.rowId]}
                key={row.rowId}
                onCellChange={onCellChange}
                onExcludedChange={onExcludedChange}
                row={row}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function EditableDesktopRow({
  columns,
  dirty,
  disabled,
  draft,
  onCellChange,
  onExcludedChange,
  row,
}: EditableRowProps) {
  const excluded = draft?.excluded ?? row.status === "EXCLUDED";

  return (
    <tr className="border-b border-[#EEF2F7] last:border-b-0">
      <td className="px-3 py-3 align-top text-[12px] font-semibold text-[#64748B]">
        {row.rowNumber}
        {dirty ? <span className="ml-1 text-[#4880EE]">수정됨</span> : null}
      </td>
      <td className="px-3 py-3 align-top">
        <input
          aria-label={`${row.rowNumber}행 제외`}
          checked={excluded}
          className="h-4 w-4 rounded border-[#CBD5E1]"
          disabled={disabled}
          onChange={(event) => onExcludedChange(row.rowId, event.target.checked)}
          type="checkbox"
        />
      </td>
      {columns.map((column) => (
        <EditableCell
          column={column}
          disabled={disabled || excluded}
          draft={draft}
          key={column.key}
          onCellChange={onCellChange}
          row={row}
        />
      ))}
    </tr>
  );
}

function EditableMobileRow({
  columns,
  dirty,
  disabled,
  draft,
  onCellChange,
  onExcludedChange,
  row,
}: EditableRowProps) {
  const excluded = draft?.excluded ?? row.status === "EXCLUDED";

  return (
    <article className="grid gap-3 border-b border-[#EEF2F7] p-4 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#111827]">
            {row.rowNumber}행
            {dirty ? <span className="ml-1 text-[#4880EE]">수정됨</span> : null}
          </p>
          <p className="mt-1 truncate text-[12px] text-[#64748B]">
            {row.targetLabel ?? formatRowStatus(row.status)}
          </p>
        </div>
        <label className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
          <input
            checked={excluded}
            className="h-4 w-4"
            disabled={disabled}
            onChange={(event) => onExcludedChange(row.rowId, event.target.checked)}
            type="checkbox"
          />
          제외
        </label>
      </div>
      <div className="grid gap-3">
        {columns.map((column) => {
          const error = getCellError(row, column.key);

          return (
            <label className="grid gap-1" key={column.key}>
              <span className="text-[12px] font-semibold text-[#475569]">
                {column.label}
              </span>
              <input
                className={cn(
                  "h-9 rounded-md border bg-white px-2 text-[13px] text-[#111827] outline-none transition focus:border-[#4880EE]",
                  error ? "border-red-300 bg-red-50" : "border-[#D7DCE5]"
                )}
                disabled={disabled || excluded}
                onChange={(event) =>
                  onCellChange(row.rowId, column.key, event.target.value)
                }
                value={toInputValue(draft?.data[column.key] ?? row.data[column.key])}
              />
              {error ? (
                <span className="text-[11px] font-medium text-red-600">
                  {error}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </article>
  );
}

type EditableRowProps = {
  readonly columns: readonly ImportTemplateColumn[];
  readonly dirty: boolean;
  readonly disabled: boolean;
  readonly draft: DraftRow | undefined;
  readonly onCellChange: (rowId: string, fieldKey: string, value: string) => void;
  readonly onExcludedChange: (rowId: string, excluded: boolean) => void;
  readonly row: ImportJobRow;
};

function EditableCell({
  column,
  disabled,
  draft,
  onCellChange,
  row,
}: {
  readonly column: ImportTemplateColumn;
  readonly disabled: boolean;
  readonly draft: DraftRow | undefined;
  readonly onCellChange: (rowId: string, fieldKey: string, value: string) => void;
  readonly row: ImportJobRow;
}) {
  const error = getCellError(row, column.key);

  return (
    <td className="min-w-44 px-3 py-3 align-top">
      <input
        aria-label={`${row.rowNumber}행 ${column.label}`}
        className={cn(
          "h-9 w-full min-w-[160px] rounded-md border bg-white px-2 text-[13px] text-[#111827] outline-none transition focus:border-[#4880EE]",
          error ? "border-red-300 bg-red-50" : "border-[#D7DCE5]"
        )}
        data-testid={`import-row-${row.rowId}-field-${column.key}-desktop`}
        disabled={disabled}
        onChange={(event) => onCellChange(row.rowId, column.key, event.target.value)}
        value={toInputValue(draft?.data[column.key] ?? row.data[column.key])}
      />
      {error ? (
        <span className="mt-1 block text-[11px] font-medium text-red-600">
          {error}
        </span>
      ) : null}
    </td>
  );
}

function ProblemHistoryPanel({
  errorsQuery,
  isOpen,
  onToggle,
}: {
  readonly errorsQuery: ReturnType<typeof useImportJobErrors>;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <section className="rounded-lg border border-[#E5E7EB] bg-white">
      <button
        className="flex h-11 w-full items-center justify-between gap-3 px-4 text-left text-[13px] font-semibold text-[#475569]"
        onClick={onToggle}
        type="button"
      >
        문제 이력
        <span className="text-[12px] text-[#94A3B8]">
          {isOpen ? "닫기" : "열기"}
        </span>
      </button>
      {isOpen ? (
        <div className="border-t border-[#E5E7EB] p-4">
          {errorsQuery.isLoading ? (
            <p className="text-[12px] text-[#64748B]">불러오는 중</p>
          ) : null}
          {errorsQuery.isError ? (
            <p className="text-[12px] text-red-600">
              {getApiErrorMessage(errorsQuery.error)}
            </p>
          ) : null}
          {errorsQuery.data && errorsQuery.data.items.length === 0 ? (
            <p className="text-[12px] text-[#64748B]">
              추가로 확인할 문제가 없어요.
            </p>
          ) : null}
          {errorsQuery.data && errorsQuery.data.items.length > 0 ? (
            <ul className="grid gap-2">
              {errorsQuery.data.items.map((error) => (
                <li
                  className="rounded-md border border-[#EEF2F7] bg-[#FAFBFC] p-3 text-[12px] text-[#475569]"
                  key={error.id}
                >
                  <span className="font-semibold text-[#111827]">
                    {error.rowNumber ? `${error.rowNumber}행 · ` : ""}
                    {error.safeMessage}
                  </span>
                  <span className="mt-1 block text-[#94A3B8]">
                    {error.retryable ? "다시 시도 가능" : "확인이 필요해요"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function ClosedState({ status }: { readonly status: ImportJobStatus }) {
  return (
    <InlineNotice tone={status === "FAILED" ? "danger" : "warning"}>
      {getClosedStateMessage(status)}
    </InlineNotice>
  );
}

function InlineNotice({
  children,
  tone,
}: {
  readonly children: ReactNode;
  readonly tone: "danger" | "info" | "warning";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-[13px]",
        tone === "danger" && "border-red-200 bg-red-50 text-red-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "info" && "border-[#D7E3FF] bg-[#F8FAFF] text-[#1F4EF5]"
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function SummaryFact({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0 rounded-md bg-[#FAFBFC] px-3 py-2">
      <dt className="text-[11px] font-medium text-[#94A3B8]">{label}</dt>
      <dd className="mt-1 truncate text-[13px] font-semibold text-[#111827]">
        {value}
      </dd>
    </div>
  );
}

function ImportReviewError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="flex min-h-dvh flex-col bg-white">
      <ImportReviewHeader title="가져오기 확인" />
      <div className="grid flex-1 place-items-center px-5">
        <div className="grid max-w-md gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-center text-red-700">
          <AlertCircle className="mx-auto h-6 w-6" />
          <p className="text-sm font-semibold">
            가져오기를 불러오지 못했어요.
          </p>
          <p className="text-sm">{getApiErrorMessage(error)}</p>
          <button
            className="mx-auto inline-flex h-9 items-center rounded-md border bg-white px-3 text-sm font-medium text-[#374151]"
            onClick={onRetry}
            type="button"
          >
            다시 시도
          </button>
          <Link
            className="mx-auto inline-flex h-9 items-center gap-1.5 text-sm font-medium text-[#4880EE]"
            to="/app/import"
          >
            <ChevronLeft className="h-4 w-4" />
            목록으로
          </Link>
        </div>
      </div>
    </section>
  );
}

function ImportReviewSkeleton() {
  return (
    <section className="flex min-h-dvh flex-col bg-white">
      <ImportReviewHeader title="가져오기 확인" />
      <div className="grid gap-4 px-4 pb-28 md:px-6">
        <div className="h-28 animate-pulse rounded-lg border bg-[#F8FAFC]" />
        <div className="h-9 animate-pulse rounded-lg bg-[#F8FAFC]" />
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="h-80 animate-pulse rounded-lg border bg-[#F8FAFC]" />
          <div className="h-[420px] animate-pulse rounded-lg border bg-[#F8FAFC]" />
        </div>
      </div>
    </section>
  );
}

function toDraftRows(rows: readonly ImportJobRow[]) {
  return Object.fromEntries(
    rows.map((row) => [
      row.rowId,
      {
        rowId: row.rowId,
        rowNumber: row.rowNumber,
        data: { ...row.data },
        excluded: row.status === "EXCLUDED",
      },
    ])
  );
}

function createVisibleRows(input: {
  readonly detail: ImportJobDetailResponse;
  readonly draftRows: Readonly<Record<string, DraftRow>>;
  readonly showOnlyErrors: boolean;
}) {
  return input.detail.rows
    .filter((row) => !input.showOnlyErrors || hasRowError(row))
    .sort((left, right) => {
      const leftHasError = hasRowError(left) ? 0 : 1;
      const rightHasError = hasRowError(right) ? 0 : 1;

      if (leftHasError !== rightHasError) {
        return leftHasError - rightHasError;
      }

      const leftDirty = input.draftRows[left.rowId] ? 0 : 1;
      const rightDirty = input.draftRows[right.rowId] ? 0 : 1;

      if (leftDirty !== rightDirty) {
        return leftDirty - rightDirty;
      }

      return left.rowNumber - right.rowNumber;
    });
}

function hasRowError(row: ImportJobRow) {
  return row.status === "INVALID" || row.errors.length > 0;
}

function getCellError(row: ImportJobRow, fieldKey: string) {
  return row.errors.find((error) => error.fieldKey === fieldKey)?.message ?? null;
}

function toDraftValue(value: string): ImportFieldValue {
  const normalized = value.trim();
  return normalized.length === 0 ? null : normalized;
}

function toInputValue(value: ImportFieldValue | undefined) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function getPrimaryActionLabel(status: ImportJobStatus, hasDirtyRows: boolean) {
  if (status === "UPLOADED") {
    return "매칭 확인";
  }

  if (hasDirtyRows) {
    return "수정 저장";
  }

  if (status === "READY_TO_CONFIRM") {
    return "가져오기";
  }

  if (status === "CONFIRMING") {
    return "저장 중";
  }

  return "검증하기";
}

function getCurrentStep(status: ImportJobStatus) {
  switch (status) {
    case "UPLOADED":
    case "MAPPED":
      return 1;
    case "NEEDS_REVIEW":
    case "READY_TO_CONFIRM":
      return 2;
    case "CONFIRMING":
    case "CONFIRMED":
    case "FAILED":
    case "CANCELED":
    case "EXPIRED":
      return 3;
  }
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
      return "문제가 생겼어요";
    case "CANCELED":
      return "취소됨";
    case "EXPIRED":
      return "만료됨";
  }
}

function formatRowStatus(status: ImportJobRowStatus) {
  switch (status) {
    case "PENDING":
      return "검증 전";
    case "VALID":
      return "확인됨";
    case "INVALID":
      return "수정 필요";
    case "EXCLUDED":
      return "제외됨";
    case "IMPORTED":
      return "저장됨";
    case "FAILED":
      return "문제 발생";
  }
}

function getClosedStateMessage(status: ImportJobStatus) {
  switch (status) {
    case "EXPIRED":
      return "이 가져오기는 만료됐어요. 새 파일로 다시 시작해 주세요.";
    case "CANCELED":
      return "취소된 가져오기예요. 새 파일로 다시 시작해 주세요.";
    case "FAILED":
      return "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
    case "CONFIRMED":
      return "가져오기가 완료됐어요.";
    case "UPLOADED":
    case "MAPPED":
    case "NEEDS_REVIEW":
    case "READY_TO_CONFIRM":
    case "CONFIRMING":
      return "";
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

function createConfirmIdempotencyKey(importJobId: string) {
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `user-web-confirm-${importJobId}-${randomValue}`.slice(0, 128);
}
