import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileImage,
  IdCard,
  Loader2,
  Plus,
  Save,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { ModalShell } from "@/components/ui/modal-shell";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import {
  useConfirmBusinessCardScanMutation,
  useScanBusinessCardMutation,
} from "@/features/business-card/hooks/use-business-card-mutations";
import {
  useBusinessCardScanLogDetail,
  useBusinessCardScanLogs,
} from "@/features/business-card/hooks/use-business-card-queries";
import {
  businessCardConfirmSchema,
  emptyBusinessCardConfirmFormValues,
  formatMobileNumber,
  toConfirmFormValues,
  toConfirmInput,
  validateBusinessCardImage,
  type BusinessCardConfirmFormValues,
} from "@/features/business-card/schemas/business-card-schema";
import type {
  BusinessCardScanLog,
  BusinessCardScanStatus,
} from "@/features/business-card/types/business-card";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";

const TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(88px,0.7fr) minmax(130px,1fr) minmax(110px,0.8fr) minmax(120px,0.9fr) minmax(150px,1fr) minmax(92px,0.7fr) minmax(104px,0.8fr)",
};

type StatusFilter = "ALL" | BusinessCardScanStatus;

const STATUS_FILTERS: Array<{
  readonly value: StatusFilter;
  readonly label: string;
}> = [
  { value: "ALL", label: "전체" },
  { value: "OCR_SUCCESS", label: "확인 필요" },
  { value: "CONFIRMED", label: "저장 완료" },
  { value: "OCR_FAILED", label: "등록 실패" },
];

export function BusinessCardScanScreen() {
  const { user } = useAuthSession();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedScanLogId, setSelectedScanLogId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const listParams = useMemo(
    () => ({
      page,
      status: statusFilter === "ALL" ? undefined : statusFilter,
    }),
    [page, statusFilter]
  );
  const scanLogsQuery = useBusinessCardScanLogs(listParams);
  const detailQuery = useBusinessCardScanLogDetail(selectedScanLogId);
  const pageData = scanLogsQuery.data;

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "명함 스캔", icon: IdCard }]}
        actions={[
          {
            icon: Plus,
            tooltip: "명함등록",
            onClick: () => setIsRegisterOpen(true),
            variant: "primary",
          },
        ]}
      />

      <div className="hidden min-h-10 shrink-0 items-center gap-2 overflow-x-auto px-5 py-1 md:flex">
        {STATUS_FILTERS.map((filter) => (
          <button
            className={cn(
              "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[13px] font-semibold transition",
              statusFilter === filter.value
                ? "border-[#4880EE] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-white"
            )}
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
            type="button"
          >
            {filter.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="shrink-0 text-[12px] text-[#9CA3AF]">
          {pageData?.totalCount ?? 0}건
        </span>
      </div>

      {notice ? (
        <div className="px-5 pt-2">
          <Toast
            message={notice}
            onClose={() => setNotice(null)}
            variant="success"
          />
        </div>
      ) : null}

      <div className="hidden gap-3 overflow-x-auto px-5 pb-3 pt-1 md:flex xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex w-full min-w-[780px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            <div
              className="grid h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-4 xl:px-6"
              style={TABLE_GRID_STYLE}
            >
              <HeaderCell>상태</HeaderCell>
              <HeaderCell>회사</HeaderCell>
              <HeaderCell>담당자</HeaderCell>
              <HeaderCell>휴대폰</HeaderCell>
              <HeaderCell>이메일</HeaderCell>
              <HeaderCell>모델</HeaderCell>
              <HeaderCell>등록일</HeaderCell>
            </div>

            {scanLogsQuery.isLoading ? (
              <ListSkeleton />
            ) : scanLogsQuery.isError ? (
              <ListError
                error={scanLogsQuery.error}
                onRetry={() => void scanLogsQuery.refetch()}
              />
            ) : !pageData || pageData.items.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel="명함등록"
                icon={IdCard}
                onAction={() => setIsRegisterOpen(true)}
                title="등록된 명함 내역이 없습니다"
              />
            ) : (
              pageData.items.map((scanLog) => (
                <ScanLogRow
                  displayTimeZone={displayTimeZone}
                  key={scanLog.id}
                  onOpen={() => setSelectedScanLogId(scanLog.id)}
                  scanLog={scanLog}
                />
              ))
            )}
          </div>

          {pageData ? (
            <Pagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          {STATUS_FILTERS.map((filter) => (
            <button
              className={cn(
                "inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-[12px] font-semibold",
                statusFilter === filter.value
                  ? "border-[#4880EE] bg-[#EFF6FF] text-[#1D4ED8]"
                  : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]"
              )}
              key={filter.value}
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="bg-white">
          {scanLogsQuery.isLoading ? (
            <ListSkeleton />
          ) : scanLogsQuery.isError ? (
            <ListError
              error={scanLogsQuery.error}
              onRetry={() => void scanLogsQuery.refetch()}
            />
          ) : !pageData || pageData.items.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="명함등록"
              icon={IdCard}
              onAction={() => setIsRegisterOpen(true)}
              title="등록된 명함 내역이 없습니다"
            />
          ) : (
            pageData.items.map((scanLog) => (
              <ScanLogMobileRow
                displayTimeZone={displayTimeZone}
                key={scanLog.id}
                onOpen={() => setSelectedScanLogId(scanLog.id)}
                scanLog={scanLog}
              />
            ))
          )}
        </div>

        {pageData ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        <button
          aria-label="명함등록"
          className="fixed bottom-24 right-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#4880EE] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={() => setIsRegisterOpen(true)}
          type="button"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
      </section>

      <BusinessCardRegisterDialog
        onConfirmed={(contactId) => {
          setNotice("명함이 담당자로 저장되었습니다.");
          setSelectedScanLogId(null);
          if (contactId) {
            window.setTimeout(() => setNotice(null), 4000);
          }
        }}
        onOpenChange={setIsRegisterOpen}
        open={isRegisterOpen}
      />
      <BusinessCardDetailDialog
        isLoading={detailQuery.isFetching}
        onOpenChange={(open) => {
          if (!open) setSelectedScanLogId(null);
        }}
        open={selectedScanLogId !== null}
        scanLog={detailQuery.data ?? null}
        timeZone={displayTimeZone}
      />
    </section>
  );
}

function BusinessCardRegisterDialog({
  open,
  onOpenChange,
  onConfirmed,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onConfirmed: (contactId: string | null) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [scanLog, setScanLog] = useState<BusinessCardScanLog | null>(null);
  const previewUrl = useObjectUrl(selectedFile);
  const scanMutation = useScanBusinessCardMutation();
  const confirmMutation = useConfirmBusinessCardScanMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessCardConfirmFormValues>({
    resolver: zodResolver(businessCardConfirmSchema),
    defaultValues: emptyBusinessCardConfirmFormValues,
  });
  const actionError = scanMutation.error ?? confirmMutation.error ?? null;
  const isExtracted = scanLog?.status === "OCR_SUCCESS";

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setFileError(null);
      setScanLog(null);
      reset(emptyBusinessCardConfirmFormValues);
    }
  }, [open, reset]);

  useEffect(() => {
    if (scanLog?.status === "OCR_SUCCESS") {
      reset(toConfirmFormValues(scanLog));
    }
  }, [reset, scanLog]);

  const onFileChange = (file: File | null) => {
    setSelectedFile(file);
    setFileError(validateBusinessCardImage(file));
    setScanLog(null);
    reset(emptyBusinessCardConfirmFormValues);
  };

  const onScan = async () => {
    const validationMessage = validateBusinessCardImage(selectedFile);

    if (validationMessage || !selectedFile) {
      setFileError(validationMessage);
      return;
    }

    setFileError(null);
    const nextScanLog = await scanMutation.mutateAsync({
      imageFile: selectedFile,
    });
    setScanLog(nextScanLog);
  };

  const onConfirm = handleSubmit(async (values) => {
    if (!scanLog || scanLog.status !== "OCR_SUCCESS") {
      return;
    }

    const response = await confirmMutation.mutateAsync(
      toConfirmInput(scanLog.id, values)
    );
    onConfirmed(response.contact.id);
    onOpenChange(false);
  });

  return (
    <ModalShell
      bodyClassName="px-5 py-4"
      footer={
        <>
          <button
            className="inline-flex h-9 items-center rounded-md border border-[#E2E5EC] bg-white px-4 text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB]"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            닫기
          </button>
          {scanLog?.status === "OCR_SUCCESS" ? (
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#4880EE] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={confirmMutation.isPending}
              onClick={() => void onConfirm()}
              type="button"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              저장
            </button>
          ) : !scanLog ? (
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#4880EE] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={scanMutation.isPending}
              onClick={() => void onScan()}
              type="button"
            >
              {scanMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              명함등록
            </button>
          ) : null}
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      panelClassName="rounded-lg"
      size={isExtracted ? "lg" : "md"}
      title="명함등록"
    >
      {isExtracted ? (
        <div className="grid gap-4">
          <RegisterStatusPanel scanLog={scanLog} />
          <form className="grid gap-4" onSubmit={onConfirm}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                errorMessage={errors.companyName?.message}
                id="business-card-company-name"
                label="회사명"
                register={register("companyName")}
                required
              />
              <TextField
                errorMessage={errors.companyFieldName?.message}
                id="business-card-company-field"
                label="회사분야"
                register={register("companyFieldName")}
              />
              <TextField
                errorMessage={errors.companyRegionName?.message}
                id="business-card-company-region"
                label="회사지역"
                register={register("companyRegionName")}
              />
              <TextField
                errorMessage={errors.contactName?.message}
                id="business-card-contact-name"
                label="담당자"
                register={register("contactName")}
                required
              />
              <MobileField
                errorMessage={errors.contactMobile?.message}
                register={register("contactMobile")}
              />
              <TextField
                errorMessage={errors.contactEmail?.message}
                id="business-card-contact-email"
                label="이메일"
                register={register("contactEmail")}
                required
              />
              <TextField
                errorMessage={errors.contactDepartmentName?.message}
                id="business-card-contact-department"
                label="부서"
                register={register("contactDepartmentName")}
              />
              <TextField
                errorMessage={errors.contactJobGradeName?.message}
                id="business-card-contact-job-grade"
                label="직급"
                register={register("contactJobGradeName")}
              />
            </div>
          </form>
          {actionError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {getApiErrorMessage(actionError)}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3">
          <label
            className={cn(
              "grid min-h-[300px] cursor-pointer place-items-center rounded-lg border border-dashed bg-[#F9FAFB] p-4 text-center transition hover:bg-[#F3F4F6]",
              scanLog && "pointer-events-none opacity-80"
            )}
            htmlFor="business-card-image"
          >
            {previewUrl ? (
              <img
                alt="명함 미리보기"
                className="max-h-[280px] w-full rounded-md object-contain"
                src={previewUrl}
              />
            ) : (
              <div className="grid gap-3">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white">
                  <FileImage className="h-6 w-6 text-[#9CA3AF]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">
                    명함 이미지 선택
                  </p>
                  <p className="mt-1 text-[12px] text-[#6B7280]">
                    JPG, PNG, WebP · 10MB 이하
                  </p>
                </div>
              </div>
            )}
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={Boolean(scanLog)}
              id="business-card-image"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>

          {selectedFile ? (
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-[#E2E5EC] px-3 py-2 text-[13px]">
              <span className="min-w-0 truncate text-[#4B5563]">
                {selectedFile.name}
              </span>
              {!scanLog ? (
                <button
                  aria-label="선택한 파일 지우기"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#9CA3AF] hover:bg-[#F3F4F6]"
                  onClick={() => onFileChange(null)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}

          {fileError ? (
            <p className="text-[12px] font-medium text-red-600">{fileError}</p>
          ) : null}

          {scanLog ? <RegisterStatusPanel scanLog={scanLog} /> : null}
          {actionError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {getApiErrorMessage(actionError)}
            </p>
          ) : null}
        </div>
      )}
    </ModalShell>
  );
}

function BusinessCardDetailDialog({
  open,
  isLoading,
  scanLog,
  timeZone,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly isLoading: boolean;
  readonly scanLog: BusinessCardScanLog | null;
  readonly timeZone: string;
  readonly onOpenChange: (open: boolean) => void;
}) {
  return (
    <ModalShell
      bodyClassName="px-5 py-4"
      footer={
        <button
          className="inline-flex h-9 items-center rounded-md border border-[#E2E5EC] bg-white px-4 text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB]"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          닫기
        </button>
      }
      onOpenChange={onOpenChange}
      open={open}
      panelClassName="rounded-lg"
      size="lg"
      title="명함 스캔 상세"
    >
      {isLoading || !scanLog ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-[#4880EE]" />
        </div>
      ) : (
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={scanLog.status} />
            <span className="text-[12px] text-[#6B7280]">
              {formatDate(scanLog.createdAt, timeZone)}
            </span>
            {scanLog.linked.contactId ? (
              <Link
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[12px] font-semibold text-[#1D4ED8]"
                to={`/contacts/${scanLog.linked.contactId}`}
              >
                <UserRound className="h-3.5 w-3.5" />
                담당자 보기
              </Link>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <DetailItem label="회사명" value={scanLog.extracted.companyName} />
            <DetailItem
              label="회사분야"
              value={scanLog.extracted.companyFieldName}
            />
            <DetailItem
              label="회사지역"
              value={scanLog.extracted.companyRegionName}
            />
            <DetailItem label="담당자" value={scanLog.extracted.contactName} />
            <DetailItem
              label="휴대폰"
              value={scanLog.extracted.contactMobile}
            />
            <DetailItem label="이메일" value={scanLog.extracted.contactEmail} />
            <DetailItem
              label="부서"
              value={scanLog.extracted.contactDepartmentName}
            />
            <DetailItem
              label="직급"
              value={scanLog.extracted.contactJobGradeName}
            />
          </div>

          <div className="grid gap-3 rounded-lg border border-[#E2E5EC] bg-[#F9FAFB] p-4 md:grid-cols-4">
            <DetailItem label="AI 모델" value={scanLog.ai.model} />
            <DetailItem
              label="요청 토큰"
              value={formatNumber(scanLog.usage.requestToken)}
            />
            <DetailItem
              label="응답 토큰"
              value={formatNumber(scanLog.usage.responseToken)}
            />
            <DetailItem
              label="소요시간"
              value={
                scanLog.usage.pendingTimeMs === null
                  ? null
                  : `${Math.round(scanLog.usage.pendingTimeMs)}ms`
              }
            />
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function ScanLogRow({
  scanLog,
  displayTimeZone,
  onOpen,
}: {
  readonly scanLog: BusinessCardScanLog;
  readonly displayTimeZone: string;
  readonly onOpen: () => void;
}) {
  return (
    <button
      className="grid h-[66px] w-full items-center border-b border-[#E2E5EC] bg-white px-4 text-left transition-colors last:border-b-0 hover:bg-[#EFF6FF] xl:px-6"
      onClick={onOpen}
      style={TABLE_GRID_STYLE}
      type="button"
    >
      <div className="min-w-0">
        <StatusBadge status={scanLog.status} />
      </div>
      <CellText value={scanLog.extracted.companyName} />
      <CellText value={scanLog.extracted.contactName} />
      <CellText value={scanLog.extracted.contactMobile} />
      <CellText value={scanLog.extracted.contactEmail} />
      <CellText value={scanLog.ai.model} />
      <CellText value={formatDate(scanLog.createdAt, displayTimeZone)} />
    </button>
  );
}

function ScanLogMobileRow({
  scanLog,
  displayTimeZone,
  onOpen,
}: {
  readonly scanLog: BusinessCardScanLog;
  readonly displayTimeZone: string;
  readonly onOpen: () => void;
}) {
  return (
    <button
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] text-left transition active:bg-[#F9FAFB]"
      onClick={onOpen}
      type="button"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EEF4FF]">
        <IdCard className="h-4 w-4 text-[#4880EE]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {scanLog.extracted.companyName ?? "-"}
          </span>
          <StatusBadge status={scanLog.status} />
        </div>
        <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
          {scanLog.extracted.contactName ?? "-"} ·{" "}
          {scanLog.extracted.contactMobile ?? "-"}
        </p>
        <p className="mt-1 text-[11px] text-[#9CA3AF]">
          {formatDate(scanLog.createdAt, displayTimeZone)}
        </p>
      </div>
      <Eye className="mt-1 h-4 w-4 shrink-0 text-[#9CA3AF]" />
    </button>
  );
}

function RegisterStatusPanel({ scanLog }: { readonly scanLog: BusinessCardScanLog }) {
  if (scanLog.status === "OCR_FAILED") {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
        자동 입력에 실패했습니다. 이미지는 저장되지 않았습니다.
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] font-medium text-emerald-800">
      <CheckCircle2 className="h-4 w-4" />
      자동 입력 완료
    </div>
  );
}

function StatusBadge({ status }: { readonly status: BusinessCardScanStatus }) {
  const style = {
    OCR_SUCCESS: "border-amber-200 bg-amber-50 text-amber-700",
    OCR_FAILED: "border-red-200 bg-red-50 text-red-600",
    CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  }[status];

  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center rounded-full border px-2 text-[11px] font-semibold",
        style
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function TextField({
  id,
  label,
  register,
  errorMessage,
  required = false,
}: {
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly errorMessage?: string;
  readonly required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-[12px] font-semibold text-[#374151]" htmlFor={id}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border border-[#E2E5EC] px-3 text-[13px] outline-none transition focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
        id={id}
        {...register}
      />
      {errorMessage ? (
        <p className="text-[12px] text-red-600" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function MobileField({
  register,
  errorMessage,
}: {
  readonly register: UseFormRegisterReturn;
  readonly errorMessage?: string;
}) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.value = formatMobileNumber(event.target.value);
    void register.onChange(event);
  };

  return (
    <div className="grid gap-1.5">
      <label
        className="text-[12px] font-semibold text-[#374151]"
        htmlFor="business-card-contact-mobile"
      >
        휴대폰 <span className="text-red-500">*</span>
      </label>
      <input
        aria-describedby={
          errorMessage ? "business-card-contact-mobile-error" : undefined
        }
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border border-[#E2E5EC] px-3 text-[13px] outline-none transition focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
        id="business-card-contact-mobile"
        inputMode="numeric"
        {...register}
        onChange={onChange}
        placeholder="010-0000-0000"
      />
      {errorMessage ? (
        <p
          className="text-[12px] text-red-600"
          id="business-card-contact-mobile-error"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function HeaderCell({ children }: { readonly children: string }) {
  return (
    <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
      {children}
    </div>
  );
}

function CellText({ value }: { readonly value: string | null }) {
  return (
    <div className="min-w-0 truncate text-[12px] font-medium text-[#475569]">
      {value ?? "-"}
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | null;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-[#9CA3AF]">{label}</p>
      <p className="mt-1 min-h-5 truncate text-[13px] font-medium text-[#111827]">
        {value ?? "-"}
      </p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          className="h-[66px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0"
          key={index}
        />
      ))}
    </div>
  );
}

function ListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <AlertCircle className="h-5 w-5 text-red-500" />
      <p className="mt-2 text-[13px] text-red-500">{getApiErrorMessage(error)}</p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280] hover:bg-[#FAFAF8]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function getStatusLabel(status: BusinessCardScanStatus) {
  switch (status) {
    case "OCR_SUCCESS":
      return "확인 필요";
    case "OCR_FAILED":
      return "등록 실패";
    case "CONFIRMED":
      return "저장 완료";
  }
}

function formatDate(value: string, timeZone: string) {
  return formatDateWithOptions(value, {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
}

function formatNumber(value: number | null) {
  return value === null ? null : value.toLocaleString("ko-KR");
}

function getBrowserTimeZoneFallback() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
