import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileImage,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
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

const STATUS_FILTER_OPTIONS: Array<{
  readonly id: BusinessCardScanStatus;
  readonly label: string;
}> = [
  { id: "OCR_SUCCESS", label: "확인 필요" },
  { id: "CONFIRMED", label: "저장 완료" },
  { id: "OCR_FAILED", label: "등록 실패" },
];

export function BusinessCardScanScreen() {
  const { user } = useAuthSession();
  const [page, setPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<BusinessCardScanStatus[]>(
    []
  );
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedScanLogId, setSelectedScanLogId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const listParams = useMemo(
    () => ({
      page,
      status: statusFilters.length > 0 ? statusFilters : undefined,
    }),
    [page, statusFilters]
  );
  const scanLogsQuery = useBusinessCardScanLogs(listParams);
  const detailQuery = useBusinessCardScanLogDetail(selectedScanLogId);
  const pageData = scanLogsQuery.data;
  const resetStatusFilter = () => {
    setStatusFilters([]);
    setPage(1);
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "명함 스캔", icon: Camera }]}
        actions={[
          {
            icon: Plus,
            tooltip: "명함스캔",
            onClick: () => setIsRegisterOpen(true),
            variant: "primary",
          },
        ]}
      />

      <div className="hidden min-h-10 shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-1 md:flex lg:gap-2">
        <button
          aria-label="전체"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#4880EE] bg-[#4880EE] text-[13px] font-bold text-white transition hover:bg-[#4880EE] focus:border-[#4880EE] focus:outline-none focus:ring-1 focus:ring-[#4880EE]"
          onClick={resetStatusFilter}
          type="button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <StatusFilterCombobox
          selectedStatuses={statusFilters}
          size="desktop"
          onSelectedStatusesChange={(nextStatuses) => {
            setStatusFilters(nextStatuses);
            setPage(1);
          }}
        />
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
                actionLabel="명함스캔"
                icon={Camera}
                onAction={() => setIsRegisterOpen(true)}
                title="명함 스캔 내역이 없어요."
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
          <button
            aria-label="전체"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#4880EE] bg-[#4880EE] text-[12px] font-bold text-white transition hover:bg-[#4880EE] focus:border-[#4880EE] focus:outline-none focus:ring-1 focus:ring-[#4880EE]"
            onClick={resetStatusFilter}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <StatusFilterCombobox
            selectedStatuses={statusFilters}
            size="mobile"
            onSelectedStatusesChange={(nextStatuses) => {
              setStatusFilters(nextStatuses);
              setPage(1);
            }}
          />
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
              actionLabel="명함스캔"
              icon={Camera}
              onAction={() => setIsRegisterOpen(true)}
              title="명함 스캔 내역이 없어요."
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
          aria-label="명함스캔"
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

type StatusFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

function StatusFilterCombobox({
  selectedStatuses,
  size,
  onSelectedStatusesChange,
}: {
  readonly selectedStatuses: readonly BusinessCardScanStatus[];
  readonly size: "desktop" | "mobile";
  readonly onSelectedStatusesChange: (
    statuses: BusinessCardScanStatus[]
  ) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<StatusFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedStatusSet = useMemo(
    () => new Set(selectedStatuses),
    [selectedStatuses]
  );
  const selectedSummary = getSelectedStatusFilterSummary(selectedStatuses);
  const normalizedQuery = normalizeFilterText(search);
  const filteredStatuses =
    normalizedQuery.length > 0
      ? STATUS_FILTER_OPTIONS.filter((item) =>
          normalizeFilterText(item.label).includes(normalizedQuery)
        )
      : STATUS_FILTER_OPTIONS;
  const isMobile = size === "mobile";
  const inputValue = isOpen ? search : selectedSummary;

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }

    const updatePopoverPosition = () => {
      if (!inputRef.current) {
        return;
      }

      setPopoverPosition(
        getStatusFilterPopoverPosition(inputRef.current, isMobile)
      );
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    updatePopoverPosition();
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isMobile, isOpen]);

  const openOptions = (nextSearch: string) => {
    setSearch(nextSearch);

    if (inputRef.current) {
      setPopoverPosition(
        getStatusFilterPopoverPosition(inputRef.current, isMobile)
      );
    }

    setIsOpen(true);
  };

  const toggleStatus = (status: BusinessCardScanStatus) => {
    const nextStatuses = selectedStatusSet.has(status)
      ? selectedStatuses.filter((item) => item !== status)
      : [...selectedStatuses, status];

    setSearch("");
    onSelectedStatusesChange(nextStatuses);
  };

  const clearSelection = () => {
    setSearch("");
    onSelectedStatusesChange([]);
    inputRef.current?.focus();
    openOptions("");
  };

  return (
    <div
      className={cn(
        "relative shrink-0",
        isMobile ? "w-[120px]" : "w-[clamp(136px,14vw,178px)]"
      )}
      ref={wrapperRef}
    >
      <div className="relative">
        {isOpen ? (
          <Search
            className={cn(
              "pointer-events-none absolute top-1/2 shrink-0 -translate-y-1/2 text-[#9CA3AF]",
              isMobile ? "left-2.5 h-3 w-3" : "left-3 h-3 w-3"
            )}
          />
        ) : null}
        <input
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-label="상태 필터"
          autoComplete="off"
          className={cn(
            "w-full min-w-0 border outline-none transition",
            isMobile
              ? "h-7 rounded-full text-[12px]"
              : "h-8 rounded-full text-[13px]",
            isOpen
              ? cn(
                  "border-[#4880EE] bg-white text-[#111827] ring-1 ring-[#4880EE]",
                  isMobile ? "pl-7 pr-7" : "pl-8 pr-7"
                )
              : selectedStatuses.length > 0
                ? cn(
                    "border-[#BFDBFE] bg-[#EFF6FF] font-semibold text-[#1D4ED8]",
                    isMobile ? "pl-3 pr-7" : "pl-3.5 pr-7"
                  )
                : isMobile
                  ? "border-[#E5E7EB] bg-[#F3F4F6] pl-3 pr-7 text-[#4B5563] hover:border-[#D1D5DB]"
                  : "cursor-pointer border-[#E2E5EC] bg-transparent pl-3.5 pr-7 text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F5F6F8]"
          )}
          onChange={(event) => openOptions(event.target.value)}
          onFocus={() => openOptions("")}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setSearch("");
              inputRef.current?.blur();
              return;
            }

            if (event.key === "Enter") {
              const firstItem = filteredStatuses[0];
              if (!firstItem) {
                return;
              }

              event.preventDefault();
              toggleStatus(firstItem.id);
            }
          }}
          placeholder="상태 선택"
          ref={inputRef}
          value={inputValue}
        />
        {selectedStatuses.length > 0 || search ? (
          <button
            aria-label="상태 필터 지우기"
            className={cn(
              "absolute right-1 top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-white hover:text-[#374151]",
              isMobile ? "h-6 w-6" : "h-7 w-7"
            )}
            onClick={clearSelection}
            type="button"
          >
            <X className={isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </button>
        ) : (
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition-transform",
              isMobile ? "h-3 w-3" : "h-3.5 w-3.5",
              isOpen && "rotate-180"
            )}
          />
        )}
      </div>

      {isOpen ? (
        <div
          className={cn(
            "fixed z-50 overflow-hidden rounded-md border border-[#E6EAF0] bg-white shadow-lg",
            !popoverPosition && "invisible"
          )}
          style={{
            left: popoverPosition?.left ?? 0,
            top: popoverPosition?.top ?? 0,
            width: popoverPosition?.width ?? 256,
          }}
        >
          <button
            className={cn(
              "flex h-9 w-full items-center gap-1.5 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
              selectedStatuses.length === 0
                ? "font-semibold text-[#1D4ED8]"
                : "font-medium text-[#475569]"
            )}
            onClick={() => {
              setSearch("");
              setIsOpen(false);
              onSelectedStatusesChange([]);
            }}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            상태 초기화
          </button>

          <div className="max-h-[184px] overflow-y-auto border-y border-[#E6EAF0] py-1">
            {filteredStatuses.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                조건에 맞는 상태가 없습니다.
              </p>
            ) : (
              filteredStatuses.map((item) => {
                const isSelected = selectedStatusSet.has(item.id);

                return (
                  <button
                    className={cn(
                      "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                      isSelected && "bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
                    )}
                    key={item.id}
                    onClick={() => toggleStatus(item.id)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                        isSelected ? "border-[#4880EE]" : "border-[#CBD5E1]"
                      )}
                    >
                      {isSelected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4880EE]" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getStatusFilterPopoverPosition(
  input: HTMLInputElement,
  isMobile: boolean
): StatusFilterPopoverPosition {
  const rect = input.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = isMobile
    ? Math.min(256, Math.max(160, viewportWidth - margin * 2))
    : 256;
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

function getSelectedStatusFilterSummary(
  selectedStatuses: readonly BusinessCardScanStatus[]
) {
  if (selectedStatuses.length === 0) {
    return "";
  }

  if (selectedStatuses.length === 1) {
    const selectedStatus = selectedStatuses[0];
    return (
      STATUS_FILTER_OPTIONS.find((item) => item.id === selectedStatus)?.label ??
      ""
    );
  }

  return `상태 ${selectedStatuses.length}개`;
}

function normalizeFilterText(value: string) {
  return value.trim().toLowerCase();
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
  const [registrationProgress, setRegistrationProgress] = useState(0);
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
  const isRegistering = scanMutation.isPending;

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setFileError(null);
      setScanLog(null);
      setRegistrationProgress(0);
      reset(emptyBusinessCardConfirmFormValues);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!isRegistering) {
      if (!scanLog) {
        setRegistrationProgress(0);
      }
      return;
    }

    setRegistrationProgress(10);
    const intervalId = window.setInterval(() => {
      setRegistrationProgress((currentProgress) => {
        const nextStep =
          currentProgress < 55 ? 7 : currentProgress < 80 ? 4 : 1.5;

        return Math.min(currentProgress + nextStep, 92);
      });
    }, 420);

    return () => window.clearInterval(intervalId);
  }, [isRegistering, scanLog]);

  useEffect(() => {
    if (scanLog?.status === "OCR_SUCCESS") {
      reset(toConfirmFormValues(scanLog));
    }
  }, [reset, scanLog]);

  const onFileChange = (file: File | null) => {
    setSelectedFile(file);
    setFileError(validateBusinessCardImage(file));
    setScanLog(null);
    setRegistrationProgress(0);
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
            className="inline-flex h-9 items-center rounded-md border border-[#E2E5EC] bg-white px-4 text-[13px] font-medium text-[#4B5563] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRegistering}
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
              명함스캔
            </button>
          ) : null}
        </>
      }
      onOpenChange={(nextOpen) => {
        if (isRegistering && !nextOpen) {
          return;
        }

        onOpenChange(nextOpen);
      }}
      open={open}
      panelClassName="rounded-lg"
      size={isExtracted ? "lg" : "md"}
      title="명함스캔"
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
              "relative grid min-h-[300px] cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed bg-[#F9FAFB] p-4 text-center transition hover:bg-[#F3F4F6]",
              (scanLog || isRegistering) && "pointer-events-none opacity-90"
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
              disabled={Boolean(scanLog) || isRegistering}
              id="business-card-image"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              type="file"
            />
            {isRegistering ? (
              <div className="absolute inset-0 grid place-items-center bg-white/82 px-8 backdrop-blur-[2px]">
                <div className="grid w-full max-w-[320px] gap-3 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#EFF6FF]">
                    <Loader2 className="h-5 w-5 animate-spin text-[#4880EE]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827]">
                      명함스캔 중
                    </p>
                    <p className="mt-1 text-[12px] text-[#6B7280]">
                      잠시만 기다려주세요
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <div
                      className="h-full rounded-full bg-[#4880EE] transition-[width] duration-500 ease-out"
                      style={{ width: `${registrationProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </label>

          {selectedFile ? (
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-[#E2E5EC] px-3 py-2 text-[13px]">
              <span className="min-w-0 truncate text-[#4B5563]">
                {selectedFile.name}
              </span>
              {!scanLog && !isRegistering ? (
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
        <Camera className="h-4 w-4 text-[#4880EE]" />
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
