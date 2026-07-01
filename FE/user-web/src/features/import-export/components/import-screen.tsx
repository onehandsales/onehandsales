import {
  AlertCircle,
  Bot,
  Building2,
  ChevronDown,
  ChevronLeft,
  CheckCircle2,
  FileSpreadsheet,
  Handshake,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Search,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { ModalShell } from "@/components/ui/modal-shell";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import {
  useConfirmImportJobMutation,
  useCreateImportJobMutation,
  useUpdateImportMappingMutation,
} from "@/features/import-export/hooks/use-import-export-mutations";
import {
  useActiveImportTemplates,
  useDownloadImportTemplateMutation,
  useImportUserLogList,
} from "@/features/import-export/hooks/use-import-template-queries";
import {
  importTargetFields,
  validateImportFile,
  type ImportTargetField,
} from "@/features/import-export/schemas/import-export-schema";
import type {
  ImportFieldValue,
  ImportJobResponse,
  ImportMappedRowData,
  ImportMapping,
  ImportTargetType,
} from "@/features/import-export/types/import-export";
import type {
  ImportTemplateItem,
  ImportTemplateType,
} from "@/features/import-export/types/import-template";
import type { ImportUserLogListItem } from "@/features/import-export/types/import-user-log";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";

const IMPORT_LOG_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(0,1.05fr) minmax(0,1.5fr) minmax(0,1fr) minmax(0,0.85fr) minmax(0,0.85fr) minmax(0,1.05fr)",
};

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

const TARGET_FILTER_OPTIONS: Array<{
  readonly value: "ALL" | ImportTemplateType;
  readonly label: string;
}> = [
  { value: "ALL", label: "전체" },
  { value: "COMPANY", label: "회사" },
  { value: "CONTACT", label: "담당자" },
  { value: "PRODUCT", label: "제품" },
  { value: "DEAL", label: "딜" },
];
type ImportTargetFilterItem = {
  readonly id: ImportTemplateType;
  readonly label: string;
};
const TARGET_FILTER_ITEMS: readonly ImportTargetFilterItem[] =
  TARGET_FILTER_OPTIONS.flatMap((option) =>
    option.value === "ALL" ? [] : [{ id: option.value, label: option.label }]
  );
const DIRECT_IMPORT_TARGETS: readonly ImportTemplateType[] = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
];
const IMPORT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMPORT_MOBILE_PATTERN = /^010-\d{4}-\d{4}$/;
const IMPORT_MOBILE_DIGIT_PATTERN = /^010\d{8}$/;

type ImportDialogStep = "METHOD" | "DIRECT_TARGET" | "DIRECT_UPLOAD";
type ImportDialogMode = "DIRECT" | "AI" | null;

type EditableImportRow = {
  readonly rowNumber: number;
  readonly data: ImportMappedRowData;
  readonly errorMessage: string | null;
};

export function ImportScreen() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [targetTypes, setTargetTypes] = useState<ImportTemplateType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<ImportDialogStep>("METHOD");
  const [selectedImportMode, setSelectedImportMode] =
    useState<ImportDialogMode>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importJob, setImportJob] = useState<ImportJobResponse | null>(null);
  const [editableRows, setEditableRows] = useState<EditableImportRow[]>([]);
  const templatesQuery = useActiveImportTemplates();
  const downloadMutation = useDownloadImportTemplateMutation();
  const createImportJobMutation = useCreateImportJobMutation();
  const updateImportMappingMutation = useUpdateImportMappingMutation();
  const confirmImportJobMutation = useConfirmImportJobMutation(importJob?.id ?? "");
  const listParams = useMemo(
    () => ({
      page,
      ...(targetTypes.length > 0 ? { targetTypes } : {}),
    }),
    [page, targetTypes]
  );
  const logsQuery = useImportUserLogList(listParams);
  const templates = templatesQuery.data?.items ?? [];
  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  );
  const logs = logsQuery.data?.items ?? [];
  const actionError =
    logsQuery.error ??
    templatesQuery.error ??
    downloadMutation.error ??
    createImportJobMutation.error ??
    updateImportMappingMutation.error ??
    confirmImportJobMutation.error ??
    null;
  const importBusy =
    createImportJobMutation.isPending ||
    updateImportMappingMutation.isPending ||
    confirmImportJobMutation.isPending;

  const openDialog = () => {
    setDialogStep("METHOD");
    setSelectedImportMode(null);
    setSelectedTemplateId("");
    resetImportWorkflow();
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogStep("METHOD");
    setSelectedImportMode(null);
    setSelectedTemplateId("");
    resetImportWorkflow();
  };

  const resetImportWorkflow = () => {
    setFormError(null);
    setSelectedFile(null);
    setImportJob(null);
    setEditableRows([]);
  };

  const downloadTemplate = async (template: ImportTemplateItem) => {
    const file = await downloadMutation.mutateAsync({
      templateId: template.id,
    });

    downloadBlobFile(file, template.templateName);
    setNotice(`${template.templateName} 다운로드를 시작했습니다.`);
  };

  const onSelectDirectMode = () => {
    setSelectedImportMode("DIRECT");
    setDialogStep("DIRECT_TARGET");
    resetImportWorkflow();
  };

  const onSelectAiMode = () => {
    setSelectedImportMode("AI");
    setFormError(null);
  };

  const onDirectTargetSelect = async (targetType: ImportTemplateType) => {
    resetImportWorkflow();

    const template = templates.find((item) => item.templateType === targetType);

    if (!template) {
      setSelectedTemplateId("");
      setFormError(`${targetLabels[targetType]} 양식은 아직 준비 중입니다.`);
      return;
    }

    setSelectedTemplateId(template.id);
    try {
      await downloadTemplate(template);
      setDialogStep("DIRECT_UPLOAD");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const onFileChange = (file: File | null) => {
    const validationMessage = validateImportFile(file);

    setSelectedFile(validationMessage ? null : file);
    setImportJob(null);
    setEditableRows([]);
    setFormError(validationMessage);
  };

  const onRunDirectImport = async () => {
    if (!selectedTemplate || !selectedFile) {
      setFormError("불러올 파일을 선택해 주세요.");
      return;
    }

    const validationMessage = validateImportFile(selectedFile);

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const createdJob = await createImportJobMutation.mutateAsync({
      targetType: selectedTemplate.templateType,
      file: selectedFile,
    });
    const mapping = createDirectTemplateMapping(selectedTemplate);
    const updatedJob = await updateImportMappingMutation.mutateAsync({
      importJobId: createdJob.id,
      mapping,
    });

    setFormError(null);
    setImportJob(updatedJob);
    setEditableRows(toEditableRows(updatedJob));
  };

  const onEditableCellChange = (
    rowNumber: number,
    field: ImportTargetField,
    value: string
  ) => {
    setEditableRows((currentRows) =>
      currentRows.map((row) =>
        row.rowNumber === rowNumber
          ? {
              ...row,
              data: {
                ...row.data,
                [field.field]: toEditableFieldValue(value, field),
              },
              errorMessage: null,
            }
          : row
      )
    );
  };

  const onConfirmImport = async () => {
    if (!importJob) {
      setFormError("먼저 엑셀 파일을 업로드해 주세요.");
      return;
    }

    if (!selectedTemplate) {
      return;
    }

    const validationMessage = validateEditableRows(
      selectedTemplate.templateType as ImportTargetType,
      editableRows
    );

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const result = await confirmImportJobMutation.mutateAsync({
      importJobId: importJob.id,
      rows: editableRows.map((row) => ({
        rowNumber: row.rowNumber,
        data: row.data,
      })),
    });

    setNotice(`${targetLabels[importJob.targetType]} ${result.successCount}건을 생성했습니다.`);
    closeDialog();
    void logsQuery.refetch();
  };

  const resetFilters = () => {
    setTargetTypes([]);
    setPage(1);
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "데이터 불러오기", icon: Upload }]}
        actions={[
          {
            icon: Plus,
            tooltip: "불러오기 생성",
            onClick: openDialog,
            variant: "primary",
          },
        ]}
      />

      <div className="hidden min-h-10 shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-1 md:flex lg:gap-2">
        <button
          aria-label="초기화"
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition",
            targetTypes.length > 0
              ? "border-[#4880EE] bg-[#4880EE] text-white"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-white"
          )}
          onClick={resetFilters}
          type="button"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <ImportTargetFilterCombobox
          selectedIds={targetTypes}
          size="desktop"
          onSelectedIdsChange={(nextTargetTypes) => {
            setTargetTypes(nextTargetTypes);
            setPage(1);
          }}
        />
        <div className="flex-1" />
        <span className="shrink-0 text-[12px] text-[#9CA3AF]">
          {logsQuery.data?.totalCount ?? 0}건
        </span>
      </div>

      <div className="hidden min-w-0 gap-3 overflow-hidden px-5 pb-3 pt-1 md:flex xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {notice ? (
            <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
          ) : null}

          {actionError ? (
            <ErrorMessage message={getApiErrorMessage(actionError)} />
          ) : null}

          <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            <div
              className="grid h-11 shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-3 md:px-4 xl:px-6"
              style={IMPORT_LOG_TABLE_GRID_STYLE}
            >
              <ImportTableHeaderCell>대상</ImportTableHeaderCell>
              <ImportTableHeaderCell>파일명</ImportTableHeaderCell>
              <ImportTableHeaderCell>컨텍스트</ImportTableHeaderCell>
              <ImportTableHeaderCell>Row</ImportTableHeaderCell>
              <ImportTableHeaderCell>버전</ImportTableHeaderCell>
              <ImportTableHeaderCell>생성일</ImportTableHeaderCell>
            </div>

            {logsQuery.isLoading ? (
              <ImportListSkeleton />
            ) : logsQuery.isError ? (
              <ImportListError
                error={logsQuery.error}
                onRetry={() => void logsQuery.refetch()}
              />
            ) : logs.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel="불러오기 생성"
                icon={Upload}
                onAction={openDialog}
                title={
                  targetTypes.length > 0
                    ? "조건에 맞는 불러오기 내역이 없습니다."
                    : "아직 확정 완료된 불러오기 내역이 없습니다."
                }
              />
            ) : (
              <div className="min-w-0">
                {logs.map((log) => (
                  <ImportLogRow
                    key={log.id}
                    log={log}
                    onOpen={() => void navigate(`/import/${log.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {logsQuery.data ? (
            <Pagination
              onPageChange={setPage}
              page={logsQuery.data.page}
              totalPages={logsQuery.data.totalPages}
            />
          ) : null}
        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <button
            aria-label="초기화"
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
              targetTypes.length > 0
                ? "border-[#4880EE] bg-[#4880EE] text-white hover:bg-[#4880EE]"
                : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563] hover:border-[#D1D5DB]",
            )}
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <ImportTargetFilterCombobox
            selectedIds={targetTypes}
            size="mobile"
            onSelectedIdsChange={(nextTargetTypes) => {
              setTargetTypes(nextTargetTypes);
              setPage(1);
            }}
          />
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {logsQuery.data?.totalCount ?? 0}건
          </span>
        </div>

        {notice ? (
          <div className="px-4 pt-2">
            <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
          </div>
        ) : null}

        <div className="bg-white">
          {logsQuery.isLoading ? (
            <ImportMobileSkeleton />
          ) : logsQuery.isError ? (
            <ImportListError
              error={logsQuery.error}
              onRetry={() => void logsQuery.refetch()}
            />
          ) : logs.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="불러오기 생성"
              icon={Upload}
              onAction={openDialog}
              title="불러오기 내역이 없습니다."
            />
          ) : (
            logs.map((log) => (
              <ImportLogMobileCard
                key={log.id}
                log={log}
                onOpen={() => void navigate(`/import/${log.id}`)}
              />
            ))
          )}
        </div>

        {logsQuery.data ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              onPageChange={setPage}
              page={logsQuery.data.page}
              totalPages={logsQuery.data.totalPages}
            />
          </div>
        ) : null}

        <button
          aria-label="불러오기 생성"
          className="fixed bottom-24 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#4880EE] shadow-[0_4px_16px_rgba(59,130,246,0.27)]"
          onClick={openDialog}
          type="button"
        >
          <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
        </button>
      </section>

      <ImportTemplateDialog
        dialogStep={dialogStep}
        editableRows={editableRows}
        errorMessage={formError}
        importBusy={importBusy}
        importJob={importJob}
        isDownloading={downloadMutation.isPending}
        selectedImportMode={selectedImportMode}
        onCancel={closeDialog}
        onConfirmImport={() => void onConfirmImport()}
        onDirectTargetSelect={(targetType) => void onDirectTargetSelect(targetType)}
        onEditableCellChange={onEditableCellChange}
        onFileChange={onFileChange}
        onBack={() => {
          setFormError(null);
          setImportJob(null);
          setEditableRows([]);
          setSelectedFile(null);
          setDialogStep(dialogStep === "DIRECT_UPLOAD" ? "DIRECT_TARGET" : "METHOD");
        }}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeDialog();
          }
        }}
        onRunDirectImport={() => void onRunDirectImport()}
        onSelectAiMode={onSelectAiMode}
        onSelectDirectMode={onSelectDirectMode}
        open={dialogOpen}
        selectedFile={selectedFile}
        selectedTemplate={selectedTemplate}
        templates={templates}
      />
    </section>
  );
}

type ImportTargetFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

function ImportTargetFilterCombobox({
  selectedIds,
  size,
  onSelectedIdsChange,
}: {
  readonly selectedIds: readonly ImportTemplateType[];
  readonly size: "desktop" | "mobile";
  readonly onSelectedIdsChange: (ids: ImportTemplateType[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<ImportTargetFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => TARGET_FILTER_ITEMS.filter((item) => selectedIdSet.has(item.id)),
    [selectedIdSet]
  );
  const selectedSummary = getSelectedImportTargetFilterSummary(selectedItems);
  const normalizedQuery = normalizeImportFilterText(search.trim());
  const filteredItems =
    normalizedQuery.length > 0
      ? TARGET_FILTER_ITEMS.filter((item) =>
          normalizeImportFilterText(item.label).includes(normalizedQuery)
        )
      : TARGET_FILTER_ITEMS;
  const isMobile = size === "mobile";
  const inputValue = isOpen ? search : selectedSummary;

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePopoverPosition = () => {
      if (!inputRef.current) {
        return;
      }

      setPopoverPosition(
        getImportTargetFilterPopoverPosition(inputRef.current, isMobile)
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
        getImportTargetFilterPopoverPosition(inputRef.current, isMobile)
      );
    }

    setIsOpen(true);
  };

  const toggleItem = (item: ImportTargetFilterItem) => {
    const nextIds = selectedIdSet.has(item.id)
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    setSearch("");
    onSelectedIdsChange(nextIds);
  };

  const clearSelection = () => {
    setSearch("");
    onSelectedIdsChange([]);
    inputRef.current?.focus();
    openOptions("");
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative shrink-0",
        isMobile ? "w-[120px]" : "w-[clamp(136px,14vw,178px)]"
      )}
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
          ref={inputRef}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-label="불러오기 대상 필터"
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
              : selectedIds.length > 0
                ? cn(
                    "border-[#4880EE] bg-[#EEF4FF] font-semibold text-[#1D4ED8]",
                    isMobile ? "pl-3 pr-7" : "pl-3.5 pr-7"
                  )
                : isMobile
                  ? "border-[#E5E7EB] bg-[#F3F4F6] pl-3 pr-7 text-[#4B5563] hover:border-[#D1D5DB]"
                  : "cursor-pointer border-[#E2E5EC] bg-transparent pl-3.5 pr-7 text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F5F6F8]"
          )}
          onChange={(event) => {
            openOptions(event.target.value);
          }}
          onFocus={() => openOptions("")}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setSearch("");
              inputRef.current?.blur();
              return;
            }

            if (event.key === "Enter") {
              const firstItem = filteredItems[0];
              if (!firstItem) {
                return;
              }

              event.preventDefault();
              toggleItem(firstItem);
            }
          }}
          placeholder="대상 선택"
          value={inputValue}
        />
        {selectedIds.length > 0 || search ? (
          <button
            aria-label="불러오기 대상 필터 지우기"
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
            width: popoverPosition?.width ?? 220,
          }}
        >
          <button
            className={cn(
              "flex h-9 w-full items-center gap-1.5 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
              selectedIds.length === 0
                ? "font-semibold text-[#1D4ED8]"
                : "font-medium text-[#475569]"
            )}
            onClick={() => {
              setSearch("");
              setIsOpen(false);
              onSelectedIdsChange([]);
            }}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            대상 초기화
          </button>

          <div className="max-h-[184px] overflow-y-auto border-t border-[#E6EAF0] py-1">
            {filteredItems.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                검색 결과가 없습니다.
              </p>
            ) : (
              filteredItems.map((item) => {
                const Icon = targetIcons[item.id];
                const isSelected = selectedIdSet.has(item.id);

                return (
                  <button
                    className={cn(
                      "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                      isSelected && "bg-[#EEF4FF] font-semibold text-[#1D4ED8]"
                    )}
                    key={item.id}
                    onClick={() => toggleItem(item)}
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
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#4880EE]" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
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

function getSelectedImportTargetFilterSummary(
  selectedItems: readonly ImportTargetFilterItem[]
) {
  if (selectedItems.length === 0) {
    return "";
  }

  if (selectedItems.length === 1) {
    return selectedItems[0]?.label ?? "";
  }

  return `대상 ${selectedItems.length}개`;
}

function normalizeImportFilterText(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function getImportTargetFilterPopoverPosition(
  input: HTMLInputElement,
  isMobile: boolean
): ImportTargetFilterPopoverPosition {
  const rect = input.getBoundingClientRect();
  const viewportPadding = 12;
  const width = Math.max(rect.width, isMobile ? 180 : 220);
  const left = Math.min(
    Math.max(rect.left, viewportPadding),
    window.innerWidth - width - viewportPadding
  );

  return {
    left,
    top: rect.bottom + 6,
    width,
  };
}

function ImportLogRow({
  log,
  onOpen,
}: {
  readonly log: ImportUserLogListItem;
  readonly onOpen: () => void;
}) {
  const Icon = targetIcons[log.targetType];

  return (
    <div
      className="grid h-[66px] cursor-pointer items-center border-b border-[#E8EDF3] px-3 transition-colors last:border-b-0 hover:bg-[#EAF2FF] md:px-4 xl:px-6"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      style={IMPORT_LOG_TABLE_GRID_STYLE}
      tabIndex={0}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-[#4880EE]" />
        <span className="truncate text-[13px] font-semibold text-[#111827]">
          {targetLabels[log.targetType]}
        </span>
      </div>
      <div className="min-w-0 truncate text-[12px] font-medium text-[#475569]">
        {log.originalFileName}
      </div>
      <div className="min-w-0 truncate text-[12px] font-medium text-[#64748B]">
        {log.contextLabel ?? "-"}
      </div>
      <div className="min-w-0 whitespace-nowrap text-[12px] font-medium text-[#475569]">
        {log.importedRowCount.toLocaleString("ko-KR")} /{" "}
        {log.totalRowCount.toLocaleString("ko-KR")}
      </div>
      <div className="min-w-0">
        <Badge>{log.templateVersion}</Badge>
      </div>
      <div className="min-w-0 truncate text-[12px] font-medium text-[#64748B]">
        {formatLogCreatedAt(log.createdAt)}
      </div>
    </div>
  );
}

function ImportLogMobileCard({
  log,
  onOpen,
}: {
  readonly log: ImportUserLogListItem;
  readonly onOpen: () => void;
}) {
  const Icon = targetIcons[log.targetType];

  return (
    <button
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] text-left transition active:bg-[#F9FAFB] hover:bg-[#EAF2FF]"
      onClick={onOpen}
      type="button"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
        <Icon className="h-4 w-4 text-[#4880EE]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {log.originalFileName}
          </span>
          <Badge>{targetLabels[log.targetType]}</Badge>
        </div>
        <div className="mt-1 text-[12px] text-[#6B7280]">
          Row {log.importedRowCount.toLocaleString("ko-KR")} /{" "}
          {log.totalRowCount.toLocaleString("ko-KR")}
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="truncate text-[12px] text-[#6B7280]">
            {log.contextLabel ?? "-"}
          </span>
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {formatLogCreatedAt(log.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
}

function ImportTemplateDialog({
  open,
  dialogStep,
  selectedImportMode,
  templates,
  selectedTemplate,
  selectedFile,
  importJob,
  editableRows,
  errorMessage,
  isDownloading,
  importBusy,
  onFileChange,
  onSelectDirectMode,
  onSelectAiMode,
  onDirectTargetSelect,
  onRunDirectImport,
  onEditableCellChange,
  onConfirmImport,
  onBack,
  onCancel,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly dialogStep: ImportDialogStep;
  readonly selectedImportMode: ImportDialogMode;
  readonly templates: readonly ImportTemplateItem[];
  readonly selectedTemplate: ImportTemplateItem | null;
  readonly selectedFile: File | null;
  readonly importJob: ImportJobResponse | null;
  readonly editableRows: readonly EditableImportRow[];
  readonly errorMessage: string | null;
  readonly isDownloading: boolean;
  readonly importBusy: boolean;
  readonly onFileChange: (file: File | null) => void;
  readonly onSelectDirectMode: () => void;
  readonly onSelectAiMode: () => void;
  readonly onDirectTargetSelect: (targetType: ImportTemplateType) => void;
  readonly onRunDirectImport: () => void;
  readonly onEditableCellChange: (
    rowNumber: number,
    field: ImportTargetField,
    value: string
  ) => void;
  readonly onConfirmImport: () => void;
  readonly onBack: () => void;
  readonly onCancel: () => void;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const targetType = selectedTemplate?.templateType as ImportTargetType | undefined;
  const isActionDisabled =
    !selectedTemplate || isDownloading || importBusy || selectedTemplate.templateType === "DEAL";
  const title =
    dialogStep === "METHOD"
      ? "데이터 불러오기"
      : dialogStep === "DIRECT_TARGET"
        ? "직접 불러오기"
        : "엑셀 업로드";

  return (
    <ModalShell
      bodyClassName="px-5 py-5"
      footer={
        <>
          {dialogStep !== "METHOD" ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted"
              disabled={isDownloading || importBusy}
              onClick={onBack}
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </button>
          ) : null}
          <button
            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
            disabled={isDownloading || importBusy}
            onClick={onCancel}
            type="button"
          >
            닫기
          </button>
          {dialogStep === "DIRECT_UPLOAD" && importJob ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isActionDisabled || editableRows.length === 0}
              onClick={onConfirmImport}
              type="button"
            >
              {importBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              확정 생성
            </button>
          ) : null}
          {dialogStep === "DIRECT_UPLOAD" && !importJob ? (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#111827] px-4 text-sm font-medium text-white hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isActionDisabled || !selectedFile}
              onClick={onRunDirectImport}
              type="button"
            >
              {importBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              업로드
            </button>
          ) : null}
        </>
      }
      onOpenChange={onOpenChange}
      open={open}
      size="md"
      title={title}
    >
      <div className="grid gap-5">
        {dialogStep === "METHOD" ? (
          <div className="grid grid-cols-2 gap-3">
            <ImportMethodButton
              active={selectedImportMode === "DIRECT"}
              icon={FileSpreadsheet}
              label="직접 불러오기"
              onClick={onSelectDirectMode}
            />
            <ImportMethodButton
              active={selectedImportMode === "AI"}
              icon={Bot}
              label="AI 불러오기"
              onClick={onSelectAiMode}
            />
          </div>
        ) : null}

        {dialogStep === "DIRECT_TARGET" ? (
          <div className="grid grid-cols-2 gap-3">
            {DIRECT_IMPORT_TARGETS.map((target) => (
              <TemplateSelectButton
                active={selectedTemplate?.templateType === target}
                isAvailable={templates.some(
                  (template) => template.templateType === target
                )}
                key={target}
                onClick={() => onDirectTargetSelect(target)}
                targetType={target}
              />
            ))}
          </div>
        ) : null}

        {dialogStep === "DIRECT_UPLOAD" ? (
          <>
            <ImportFilePanel
              disabled={isDownloading || importBusy}
              file={selectedFile}
              mode="DIRECT"
              onFileChange={onFileChange}
            />
            {importJob && targetType ? (
              <ImportEditablePreview
                disabled={importBusy}
                onEditableCellChange={onEditableCellChange}
                rows={editableRows}
                targetType={targetType}
              />
            ) : null}
          </>
        ) : null}

        {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      </div>
    </ModalShell>
  );
}

function TemplateSelectButton({
  targetType,
  active,
  isAvailable,
  onClick,
}: {
  readonly targetType: ImportTemplateType;
  readonly active: boolean;
  readonly isAvailable: boolean;
  readonly onClick: () => void;
}) {
  const Icon = targetIcons[targetType];

  return (
    <button
      aria-disabled={!isAvailable}
      className={`grid aspect-[1.55] min-h-[112px] place-items-center gap-2 rounded-lg border p-4 text-center transition ${
        active
          ? "border-[#4880EE] bg-[#EEF4FF] text-[#1D4ED8]"
          : isAvailable
            ? "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
            : "border-[#E5E7EB] bg-white text-[#9CA3AF] hover:bg-[#F9FAFB]"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="grid place-items-center gap-2">
        <Icon className="h-7 w-7" />
        <span className="text-sm font-semibold">{targetLabels[targetType]}</span>
      </span>
    </button>
  );
}

function ImportMethodButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly active: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "grid aspect-[1.45] min-h-[128px] place-items-center gap-3 rounded-lg border p-5 text-center transition",
        active
          ? "border-[#4880EE] bg-[#EEF4FF] text-[#1D4ED8]"
          : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB]"
      )}
      onClick={onClick}
      type="button"
    >
      <span className="grid place-items-center gap-3">
        <Icon className="h-8 w-8" />
        <span className="text-sm font-semibold">{label}</span>
      </span>
    </button>
  );
}

function ImportFilePanel({
  file,
  disabled,
  mode,
  onFileChange,
}: {
  readonly file: File | null;
  readonly disabled: boolean;
  readonly mode: "DIRECT";
  readonly onFileChange: (file: File | null) => void;
}) {
  const description =
    mode === "DIRECT"
      ? "다운로드한 양식에 맞춰 작성한 Excel 파일을 업로드하세요."
      : "";

  return (
    <div className="grid gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#111827]">파일 업로드</h3>
          <p className="mt-1 text-xs text-[#6B7280]">{description}</p>
        </div>
        {file ? (
          <Badge>{(file.size / 1024).toFixed(1)}KB</Badge>
        ) : null}
      </div>
      <label className="flex min-h-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm font-medium text-[#475569] transition hover:bg-[#F1F5F9]">
        <input
          accept=".csv,.xlsx"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            onFileChange(event.target.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
          type="file"
        />
        <span className="inline-flex min-w-0 items-center gap-2">
          <Upload className="h-4 w-4 shrink-0 text-[#4880EE]" />
          <span className="truncate">
            {file ? file.name : "불러올 파일을 선택하세요"}
          </span>
        </span>
      </label>
    </div>
  );
}

function ImportEditablePreview({
  targetType,
  rows,
  disabled,
  onEditableCellChange,
}: {
  readonly targetType: ImportTargetType;
  readonly rows: readonly EditableImportRow[];
  readonly disabled: boolean;
  readonly onEditableCellChange: (
    rowNumber: number,
    field: ImportTargetField,
    value: string
  ) => void;
}) {
  const fields = importTargetFields[targetType];

  return (
    <div className="grid gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#111827]">미리보기 수정</h3>
          <p className="mt-1 text-xs text-[#6B7280]">
            확정 전 최종 값입니다. 이 값으로 실제 데이터가 생성됩니다.
          </p>
        </div>
        <Badge>{rows.length.toLocaleString("ko-KR")}행</Badge>
      </div>

      <div className="max-h-[320px] overflow-auto rounded-md border border-[#E5E7EB]">
        <table className="min-w-full border-collapse text-[13px]">
          <thead className="sticky top-0 z-10 bg-[#F8FAFC] text-left text-[#475569]">
            <tr>
              <th className="w-16 border-b px-3 py-2 font-semibold">행</th>
              {fields.map((field) => (
                <th
                  className="min-w-[160px] border-b px-3 py-2 font-semibold"
                  key={field.field}
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b last:border-b-0" key={row.rowNumber}>
                <td className="bg-[#FAFBFC] px-3 py-2 text-[#64748B]">
                  {row.rowNumber}
                </td>
                {fields.map((field) => (
                  <td className="px-2 py-2" key={field.field}>
                    <input
                      className="h-8 w-full rounded-md border border-[#D1D5DB] px-2 text-[13px] outline-none focus:border-[#4880EE] focus:ring-2 focus:ring-[#4880EE]/20 disabled:bg-[#F3F4F6]"
                      disabled={disabled}
                      onChange={(event) =>
                        onEditableCellChange(
                          row.rowNumber,
                          field,
                          event.target.value
                        )
                      }
                      type={field.kind === "number" ? "text" : "text"}
                      value={toInputValue(row.data[field.field])}
                    />
                    {row.errorMessage ? (
                      <span className="mt-1 block truncate text-[11px] text-red-500">
                        {row.errorMessage}
                      </span>
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImportTableHeaderCell({ children }: { readonly children: string }) {
  return (
    <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
      {children}
    </div>
  );
}

function Badge({ children }: { readonly children: ReactNode }) {
  const title = typeof children === "string" ? children : undefined;

  return (
    <span
      className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#EEF4FF] px-2.5 text-[11px] font-semibold text-[#4880EE]"
      title={title}
    >
      <span className="min-w-0 truncate whitespace-nowrap">{children}</span>
    </span>
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
    <div className="flex items-center justify-between gap-4 rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm text-[#166534]">
      <span className="inline-flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </span>
      <button
        aria-label="알림 닫기"
        className="grid h-7 w-7 place-items-center rounded-md hover:bg-[#DCFCE7]"
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
    <div className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <AlertCircle className="h-4 w-4" />
      {message}
    </div>
  );
}

function ImportListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <p className="text-[13px] text-red-500">{getApiErrorMessage(error)}</p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function ImportListSkeleton() {
  return (
    <div>
      {Array.from({ length: 8 }, (_, index) => (
        <div
          className="h-[66px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
          key={index}
        />
      ))}
    </div>
  );
}

function ImportMobileSkeleton() {
  return (
    <div>
      {Array.from({ length: 8 }, (_, index) => (
        <div
          className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
          key={index}
        />
      ))}
    </div>
  );
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

function createDirectTemplateMapping(template: ImportTemplateItem): ImportMapping {
  return Object.fromEntries(
    template.columns.map((column) => [column.key, column.label])
  );
}

function toEditableRows(job: ImportJobResponse): EditableImportRow[] {
  const fields = importTargetFields[job.targetType as ImportTargetType];

  return job.previewRows.map((row) => {
    const data: Record<string, ImportFieldValue> = {};

    for (const field of fields) {
      data[field.field] = row.mappedData?.[field.field] ?? null;
    }

    return {
      rowNumber: row.rowNumber,
      data,
      errorMessage: row.errorMessage,
    };
  });
}

function toEditableFieldValue(
  value: string,
  field: ImportTargetField
): ImportFieldValue {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return null;
  }

  if (field.kind !== "number") {
    return normalized;
  }

  const numberValue = Number(normalized.replaceAll(",", ""));
  return Number.isFinite(numberValue) ? numberValue : normalized;
}

function toInputValue(value: ImportFieldValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function validateEditableRows(
  targetType: ImportTargetType,
  rows: readonly EditableImportRow[]
): string | null {
  if (rows.length === 0) {
    return "확정할 데이터 row가 없습니다.";
  }

  const fields = importTargetFields[targetType];

  for (const row of rows) {
    for (const field of fields) {
      const value = row.data[field.field];
      const textValue = value === null || value === undefined ? "" : String(value).trim();

      if (field.required && textValue.length === 0) {
        return `${row.rowNumber}행의 ${field.label} 값을 입력해 주세요.`;
      }

      if (textValue.length === 0) {
        continue;
      }

      if (field.field === "contactEmail" && !IMPORT_EMAIL_PATTERN.test(textValue)) {
        return `${row.rowNumber}행의 담당자 이메일 형식이 올바르지 않습니다.`;
      }

      if (field.field === "contactPhone" && !isImportPhoneValue(textValue)) {
        return `${row.rowNumber}행의 담당자 핸드폰 번호 형식이 올바르지 않습니다.`;
      }

      if (field.kind === "number" && !isNonNegativeIntegerValue(textValue)) {
        return `${row.rowNumber}행의 ${field.label}은 0 이상의 정수여야 합니다.`;
      }
    }
  }

  return null;
}

function isImportPhoneValue(value: string): boolean {
  if (IMPORT_MOBILE_PATTERN.test(value)) {
    return true;
  }

  return IMPORT_MOBILE_DIGIT_PATTERN.test(value.replace(/\D/g, ""));
}

function isNonNegativeIntegerValue(value: string): boolean {
  const numberValue = Number(value.replaceAll(",", ""));
  return Number.isInteger(numberValue) && numberValue >= 0;
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
