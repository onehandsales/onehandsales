import {
  AlertCircle,
  Building2,
  ChevronLeft,
  FileSpreadsheet,
  Handshake,
  Loader2,
  Package,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DataUploadIcon } from "@/components/icons/data-upload-icon";
import {
  useImportUserLogDetail,
} from "@/features/import-export/hooks/use-import-template-queries";
import type { ImportTemplateType } from "@/features/import-export/types/import-template";
import type {
  ImportSubmittedDataValue,
  ImportUserLogDetail,
} from "@/features/import-export/types/import-user-log";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

const targetIcons: Record<ImportTemplateType, LucideIcon> = {
  COMPANY: Building2,
  CONTACT: UserRound,
  PRODUCT: Package,
  DEAL: Handshake,
};

const targetLabels: Record<ImportTemplateType, string> = {
  COMPANY: "회사",
  CONTACT: "담당자",
  PRODUCT: "제품",
  DEAL: "딜",
};

type ImportDetailScreenProps = {
  readonly importUserLogId: string;
};

export function ImportDetailScreen({ importUserLogId }: ImportDetailScreenProps) {
  const detailQuery = useImportUserLogDetail(importUserLogId);

  if (detailQuery.isLoading) {
    return <ImportDetailSkeleton />;
  }

  if (detailQuery.isError) {
    return (
      <ImportDetailError
        error={detailQuery.error}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const detail = detailQuery.data;

  if (!detail) {
    return <ImportDetailSkeleton />;
  }

  const TargetIcon = targetIcons[detail.targetType];

  return (
    <section className="flex min-h-dvh flex-col bg-[#FAFAF8]">
      <ImportDetailHeader title={detail.originalFileName} />

      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto px-4 pb-24 pt-0 md:px-6 md:pb-6 md:pt-0">
        <div className="rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#EEF4FF] text-[#4880EE]">
                <TargetIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#6B7280]">
                  {targetLabels[detail.targetType]} 업로드
                </p>
                <h1 className="mt-1 truncate text-xl font-semibold text-[#111827]">
                  {detail.originalFileName}
                </h1>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {formatLogCreatedAt(detail.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <SummaryBadge label="버전" value={detail.templateVersion} />
              <SummaryBadge
                label="Row"
                value={`${detail.importedRowCount.toLocaleString("ko-KR")} / ${detail.totalRowCount.toLocaleString("ko-KR")}`}
              />
              <SummaryBadge
                label="파일 크기"
                value={formatFileSize(detail.fileSizeBytes)}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 border-t border-[#E6EAF0] pt-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.4fr)]">
            <section className="grid content-start gap-3">
              <h2 className="text-sm font-semibold text-[#111827]">기본 정보</h2>
              <InfoRow label="대상" value={targetLabels[detail.targetType]} />
              <InfoRow label="원본 파일명" value={detail.originalFileName} />
              <InfoRow label="컨텍스트" value={detail.contextLabel ?? "-"} />
              <InfoRow label="생성일" value={formatLogCreatedAt(detail.createdAt)} />
            </section>

            <section className="grid content-start gap-3">
              <h2 className="text-sm font-semibold text-[#111827]">컬럼 snapshot</h2>
              <div className="flex flex-wrap gap-1.5">
                {detail.templateColumns.map((column) => (
                  <span
                    className="rounded-md bg-[#F3F4F6] px-2 py-1 text-xs text-[#4B5563]"
                    key={column.key}
                  >
                    {column.label}
                    {column.required ? " *" : ""}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
          <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#E6EAF0] bg-[#FAFBFC] px-4">
            <div className="flex min-w-0 items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-[#4880EE]" />
              <h2 className="truncate text-sm font-semibold text-[#111827]">
                Row snapshot
              </h2>
            </div>
            <span className="text-xs text-[#9CA3AF]">
              {detail.rows.length.toLocaleString("ko-KR")}건
            </span>
          </div>

          {detail.rows.length === 0 ? (
            <div className="grid min-h-[260px] place-items-center px-5 text-center">
              <div>
                <FileSpreadsheet className="mx-auto h-6 w-6 text-[#9CA3AF]" />
                <p className="mt-3 text-sm font-semibold text-[#111827]">
                  저장된 row가 없습니다.
                </p>
              </div>
            </div>
          ) : (
            <ImportRowsTable detail={detail} />
          )}
        </section>
      </div>
    </section>
  );
}

function ImportDetailHeader({ title }: { readonly title: string }) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 bg-transparent px-6">
      <Link aria-label="목록으로 돌아가기" to="/import">
        <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        <DataUploadIcon className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
        <span className="shrink-0 font-medium text-[#6B7280]">
          데이터 업로드
        </span>
        <span className="shrink-0 text-[#9CA3AF]">/</span>
        <span className="min-w-0 truncate font-bold text-[#111827]">
          {title}
        </span>
      </div>
    </div>
  );
}

function ImportRowsTable({ detail }: { readonly detail: ImportUserLogDetail }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-[#FAFBFC] text-left">
          <tr className="border-b border-[#E6EAF0]">
            <th className="w-20 whitespace-nowrap px-4 py-3 text-xs font-semibold text-[#64748B]">
              Row
            </th>
            <th className="min-w-44 whitespace-nowrap px-4 py-3 text-xs font-semibold text-[#64748B]">
              표시 이름
            </th>
            {detail.templateColumns.map((column) => (
              <th
                className="min-w-40 whitespace-nowrap px-4 py-3 text-xs font-semibold text-[#64748B]"
                key={column.key}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {detail.rows.map((row) => (
            <tr className="border-b border-[#EEF2F7] last:border-b-0" key={row.id}>
              <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-[#64748B]">
                {row.rowNumber}
              </td>
              <td className="max-w-[240px] px-4 py-3 text-sm font-semibold text-[#111827]">
                <span className="block truncate">{row.targetLabel}</span>
              </td>
              {detail.templateColumns.map((column) => (
                <td
                  className="max-w-[260px] px-4 py-3 text-sm text-[#475569]"
                  key={`${row.id}-${column.key}`}
                >
                  <span className="block truncate">
                    {formatSubmittedValue(row.submittedData[column.key])}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryBadge({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-lg border border-[#E2E5EC] bg-[#FAFAF8] px-3 py-2">
      <p className="text-[11px] text-[#9CA3AF]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 text-sm">
      <dt className="text-[#6B7280]">{label}</dt>
      <dd className="min-w-0 truncate font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

function ImportDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="flex min-h-dvh flex-col bg-[#FAFAF8]">
      <ImportDetailHeader title="상세" />
      <div className="grid flex-1 place-items-center px-5">
        <div className="grid max-w-md gap-3 rounded-lg border border-red-200 bg-red-50 p-5 text-center text-red-700">
          <AlertCircle className="mx-auto h-6 w-6" />
          <p className="text-sm font-semibold">업로드 내역을 불러오지 못했습니다.</p>
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
            to="/import"
          >
            <ChevronLeft className="h-4 w-4" />
            목록으로
          </Link>
        </div>
      </div>
    </section>
  );
}

function ImportDetailSkeleton() {
  return (
    <section className="flex min-h-dvh flex-col bg-[#FAFAF8]">
      <ImportDetailHeader title="상세" />
      <div className="grid w-full gap-4 px-4 pb-24 pt-0 md:px-6 md:pb-6 md:pt-0">
        <div className="h-56 animate-pulse rounded-lg border bg-white" />
        <div className="grid min-h-[360px] place-items-center rounded-lg border bg-white text-[#6B7280]">
          <span className="inline-flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            불러오는 중
          </span>
        </div>
      </div>
    </section>
  );
}

function formatSubmittedValue(value: ImportSubmittedDataValue | undefined) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "예" : "아니오";
  }

  return String(value);
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

function formatFileSize(fileSizeBytes: number) {
  if (fileSizeBytes < 1024) {
    return `${fileSizeBytes} B`;
  }

  if (fileSizeBytes < 1024 * 1024) {
    return `${(fileSizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
