import {
  AlertCircle,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronLeft,
  Eye,
  FileSpreadsheet,
  GripVertical,
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
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { DataUploadIcon } from "@/components/icons/data-upload-icon";
import { PageHeader } from "@/components/layout/page-header";
import { ModalShell } from "@/components/ui/modal-shell";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import {
  useCreateCompanyFieldMutation,
  useCreateCompanyRegionMutation,
} from "@/features/company/hooks/use-company-mutations";
import { useCompanyFields, useCompanyRegions } from "@/features/company/hooks/use-company-list";
import type { CompanyField, CompanyRegion } from "@/features/company/types/company";
import {
  useCreateDepartmentMutation,
  useCreateJobGradeMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import {
  useContactDepartments,
  useContactJobGrades,
} from "@/features/contact/hooks/use-contact-list";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";
import type {
  ContactCompanyOption,
  ContactDepartment,
  ContactJobGrade,
} from "@/features/contact/types/contact";
import {
  useDealCompanyOptions,
  useDealContactOptions,
  useDealProductOptions,
  type DealCompanyOption,
  type DealContactOption,
  type DealProductOption,
} from "@/features/deal/hooks/use-deal-entity-options";
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
import {
  useCreateCategoryMutation,
  useCreateStatusMutation,
} from "@/features/product/hooks/use-product-mutations";
import {
  useProductCategories,
  useProductStatuses,
} from "@/features/product/hooks/use-product-detail";
import type {
  ProductCategory,
  ProductStatus,
} from "@/features/product/types/product";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";

const IMPORT_LOG_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(0,1fr) minmax(0,0.95fr) minmax(0,1.7fr) minmax(0,1.05fr)",
};

const IMPORT_PREVIEW_ROW_NUMBER_COLUMN_WIDTH = 25;
const IMPORT_PREVIEW_COLUMN_MIN_WIDTH = 72;
const IMPORT_PREVIEW_FIRST_DATA_ROW_NUMBER = 2;

const targetIcons: Record<ImportTemplateType, LucideIcon> = {
  COMPANY: Building2,
  CONTACT: UserRound,
  PRODUCT: Package,
  DEAL: BriefcaseBusiness,
};

const targetLabels: Record<ImportTemplateType, string> = {
  COMPANY: "회사",
  CONTACT: "담당자",
  PRODUCT: "제품",
  DEAL: "딜",
};

const targetColorClassNames: Record<
  ImportTemplateType,
  {
    readonly activeCard: string;
    readonly idleCard: string;
    readonly iconBox: string;
    readonly icon: string;
  }
> = {
  COMPANY: {
    activeCard: "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]",
    idleCard: "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FAFF]",
    iconBox: "bg-[#EEF2FF]",
    icon: "text-[#4F46E5]",
  },
  CONTACT: {
    activeCard: "border-[#4880EE] bg-[#DBEAFE] text-[#4880EE]",
    idleCard: "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F7FBFF]",
    iconBox: "bg-[#DBEAFE]",
    icon: "text-[#4880EE]",
  },
  PRODUCT: {
    activeCard: "border-[#15803D] bg-[#F0FDF4] text-[#15803D]",
    idleCard: "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F8FEFA]",
    iconBox: "bg-[#F0FDF4]",
    icon: "text-[#15803D]",
  },
  DEAL: {
    activeCard: "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]",
    idleCard: "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#FFFAFA]",
    iconBox: "bg-[#FEF2F2]",
    icon: "text-[#DC2626]",
  },
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
};

type ContactCompanyImportSummaryData = {
  readonly totalCompanyCount: number;
  readonly matchedCompanyCount: number;
  readonly newCompanyCount: number;
  readonly newCompanyNames: readonly string[];
  readonly newCompanyContactCounts: Readonly<Record<string, number>>;
};

type ContactCompanyResolutionValue = {
  readonly companyFieldName: string;
  readonly companyRegionName: string;
};

type ContactCompanyResolutionField = keyof ContactCompanyResolutionValue;
type ContactCompanyResolutionState = Readonly<
  Record<string, ContactCompanyResolutionValue>
>;

type DealCompanyResolutionValue = ContactCompanyResolutionValue;
type DealCompanyResolutionField = keyof DealCompanyResolutionValue;
type DealCompanyResolutionState = Readonly<
  Record<string, DealCompanyResolutionValue>
>;

type DealContactResolutionValue = {
  readonly companyName: string;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly contactDepartmentName: string;
  readonly contactJobGradeName: string;
};
type DealContactResolutionField = keyof Omit<
  DealContactResolutionValue,
  "companyName" | "contactName"
>;
type DealContactResolutionState = Readonly<
  Record<string, DealContactResolutionValue>
>;

type DealProductResolutionValue = {
  readonly productPrice: string;
  readonly productCategoryName: string;
  readonly productStatusName: string;
};
type DealProductResolutionField = keyof DealProductResolutionValue;
type DealProductResolutionState = Readonly<
  Record<string, DealProductResolutionValue>
>;

type DealImportSummaryData = {
  readonly newCompanyNames: readonly string[];
  readonly newContactKeys: readonly string[];
  readonly newProductNames: readonly string[];
  readonly contactLabels: Readonly<Record<string, string>>;
  readonly contactCompanyNames: Readonly<Record<string, string>>;
  readonly contactNames: Readonly<Record<string, string>>;
  readonly newCompanyCount: number;
  readonly newContactCount: number;
  readonly newProductCount: number;
};

type ImportTaxonomyPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};
type ImportPreviewDropPosition = "before" | "after";

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
  const [contactCompanyResolutions, setContactCompanyResolutions] =
    useState<ContactCompanyResolutionState>({});
  const [dealCompanyResolutions, setDealCompanyResolutions] =
    useState<DealCompanyResolutionState>({});
  const [dealContactResolutions, setDealContactResolutions] =
    useState<DealContactResolutionState>({});
  const [dealProductResolutions, setDealProductResolutions] =
    useState<DealProductResolutionState>({});
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
  const templates = useMemo(
    () => templatesQuery.data?.items ?? [],
    [templatesQuery.data?.items]
  );
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
    setContactCompanyResolutions({});
    setDealCompanyResolutions({});
    setDealContactResolutions({});
    setDealProductResolutions({});
  };

  const downloadTemplate = async (template: ImportTemplateItem) => {
    const file = await downloadMutation.mutateAsync({
      templateId: template.id,
    });

    downloadBlobFile(file, template.templateName);
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

  const onDirectTargetSelect = (targetType: ImportTemplateType) => {
    resetImportWorkflow();

    const template = templates.find((item) => item.templateType === targetType);

    if (!template) {
      setSelectedTemplateId("");
      setFormError(`${targetLabels[targetType]} 양식은 아직 준비 중입니다.`);
      return;
    }

    setSelectedTemplateId(template.id);
    setDialogStep("DIRECT_UPLOAD");
  };

  const onDownloadSelectedTemplate = async () => {
    if (!selectedTemplate) {
      return;
    }

    try {
      setFormError(null);
      await downloadTemplate(selectedTemplate);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  };

  const onFileChange = (file: File | null) => {
    const validationMessage = validateImportFile(file);

    setSelectedFile(validationMessage ? null : file);
    setImportJob(null);
    setEditableRows([]);
    setContactCompanyResolutions({});
    setDealCompanyResolutions({});
    setDealContactResolutions({});
    setDealProductResolutions({});
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
            }
          : row
      )
    );
  };

  const onEditableRowsReorder = (
    sourceRowNumber: number,
    targetRowNumber: number,
    dropPosition: ImportPreviewDropPosition
  ) => {
    setEditableRows((currentRows) =>
      reorderEditableRows(
        currentRows,
        sourceRowNumber,
        targetRowNumber,
        dropPosition
      )
    );
  };

  const onContactCompanyResolutionChange = (
    companyName: string,
    field: ContactCompanyResolutionField,
    value: string
  ) => {
    setContactCompanyResolutions((currentResolutions) => {
      const currentResolution = currentResolutions[companyName] ?? {
        companyFieldName: "",
        companyRegionName: "",
      };

      return {
        ...currentResolutions,
        [companyName]: {
          ...currentResolution,
          [field]: value,
        },
      };
    });
  };

  const onDealCompanyResolutionChange = (
    companyName: string,
    field: DealCompanyResolutionField,
    value: string
  ) => {
    setDealCompanyResolutions((currentResolutions) => {
      const currentResolution = currentResolutions[companyName] ?? {
        companyFieldName: "",
        companyRegionName: "",
      };

      return {
        ...currentResolutions,
        [companyName]: {
          ...currentResolution,
          [field]: value,
        },
      };
    });
  };

  const onDealContactResolutionChange = (
    contactKey: string,
    field: DealContactResolutionField,
    value: string
  ) => {
    setDealContactResolutions((currentResolutions) => {
      const parsedContact = parseDealContactResolutionKey(contactKey);
      const currentResolution = currentResolutions[contactKey] ?? {
        companyName: parsedContact.companyName,
        contactName: parsedContact.contactName,
        contactEmail: "",
        contactPhone: "",
        contactDepartmentName: "",
        contactJobGradeName: "",
      };

      return {
        ...currentResolutions,
        [contactKey]: {
          ...currentResolution,
          [field]: value,
        },
      };
    });
  };

  const onDealProductResolutionChange = (
    productName: string,
    field: DealProductResolutionField,
    value: string
  ) => {
    setDealProductResolutions((currentResolutions) => {
      const currentResolution = currentResolutions[productName] ?? {
        productPrice: "",
        productCategoryName: "",
        productStatusName: "",
      };

      return {
        ...currentResolutions,
        [productName]: {
          ...currentResolution,
          [field]: value,
        },
      };
    });
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

    await confirmImportJobMutation.mutateAsync({
      importJobId: importJob.id,
      contactCompanyResolutions:
        selectedTemplate.templateType === "CONTACT"
          ? toContactCompanyResolutionPayload(contactCompanyResolutions)
          : undefined,
      dealCompanyResolutions:
        selectedTemplate.templateType === "DEAL"
          ? toDealCompanyResolutionPayload(dealCompanyResolutions)
          : undefined,
      dealContactResolutions:
        selectedTemplate.templateType === "DEAL"
          ? toDealContactResolutionPayload(dealContactResolutions)
          : undefined,
      dealProductResolutions:
        selectedTemplate.templateType === "DEAL"
          ? toDealProductResolutionPayload(dealProductResolutions)
          : undefined,
      rows: editableRows.map((row) => ({
        rowNumber: row.rowNumber,
        data: row.data,
      })),
    });

    setNotice("데이터를 업로드했어요.");
    closeDialog();
    void logsQuery.refetch();
  };

  const resetFilters = () => {
    setTargetTypes([]);
    setPage(1);
  };

  return (
    <section className="flex min-h-full flex-col bg-white">
      <PageHeader
        breadcrumbs={[{ label: "데이터 업로드", icon: DataUploadIcon }]}
        actions={[
          {
            icon: Plus,
            tooltip: "데이터 업로드",
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
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
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
              <ImportTableHeaderCell>생성된 데이터 수</ImportTableHeaderCell>
              <ImportTableHeaderCell>등록한 파일명</ImportTableHeaderCell>
              <ImportTableHeaderCell>등록일</ImportTableHeaderCell>
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
                actionLabel="데이터 업로드"
                icon={DataUploadIcon}
                onAction={openDialog}
                title={
                  targetTypes.length > 0
                    ? "조건에 맞는 업로드 내역이 없습니다."
                    : "데이터가 존재하지 않아요"
                }
              />
            ) : (
              <div className="min-w-0">
                {logs.map((log) => (
                  <ImportLogRow
                    key={log.id}
                    log={log}
                    onOpen={() => void navigate(`/app/import/${log.id}`)}
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
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
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
              actionLabel="데이터 업로드"
              icon={DataUploadIcon}
              onAction={openDialog}
              title="업로드 내역이 없습니다."
            />
          ) : (
            logs.map((log) => (
              <ImportLogMobileCard
                key={log.id}
                log={log}
                onOpen={() => void navigate(`/app/import/${log.id}`)}
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
          aria-label="데이터 업로드"
          className="fixed bottom-24 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#4880EE] shadow-[0_4px_16px_rgba(59,130,246,0.27)]"
          onClick={openDialog}
          type="button"
        >
          <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
        </button>
      </section>

      <ImportTemplateDialog
        contactCompanyResolutions={contactCompanyResolutions}
        dealCompanyResolutions={dealCompanyResolutions}
        dealContactResolutions={dealContactResolutions}
        dealProductResolutions={dealProductResolutions}
        dialogStep={dialogStep}
        editableRows={editableRows}
        errorMessage={formError}
        importBusy={importBusy}
        importJob={importJob}
        isDownloading={downloadMutation.isPending}
        selectedImportMode={selectedImportMode}
        onContactCompanyResolutionChange={onContactCompanyResolutionChange}
        onConfirmImport={() => void onConfirmImport()}
        onDealCompanyResolutionChange={onDealCompanyResolutionChange}
        onDealContactResolutionChange={onDealContactResolutionChange}
        onDealProductResolutionChange={onDealProductResolutionChange}
        onDirectTargetSelect={onDirectTargetSelect}
        onDownloadSelectedTemplate={() => void onDownloadSelectedTemplate()}
        onEditableCellChange={onEditableCellChange}
        onEditableRowsReorder={onEditableRowsReorder}
        onFileChange={onFileChange}
        onBack={() => {
          setFormError(null);
          setImportJob(null);
          setEditableRows([]);
          setSelectedFile(null);
          setContactCompanyResolutions({});
          setDealCompanyResolutions({});
          setDealContactResolutions({});
          setDealProductResolutions({});
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
          aria-label="업로드 대상 필터"
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
            aria-label="업로드 대상 필터 지우기"
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
        {log.importedRowCount.toLocaleString("ko-KR")}건
      </div>
      <div className="min-w-0 truncate text-[12px] font-medium text-[#475569]">
        {log.originalFileName}
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
          <Badge>{targetLabels[log.targetType]}</Badge>
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {log.originalFileName}
          </span>
        </div>
        <div className="mt-1 text-[12px] text-[#6B7280]">
          생성된 데이터 수 {log.importedRowCount.toLocaleString("ko-KR")}건
        </div>
        <div className="mt-1 flex items-center justify-end gap-3">
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
  selectedTemplate,
  selectedFile,
  importJob,
  editableRows,
  contactCompanyResolutions,
  dealCompanyResolutions,
  dealContactResolutions,
  dealProductResolutions,
  errorMessage,
  isDownloading,
  importBusy,
  onFileChange,
  onSelectDirectMode,
  onSelectAiMode,
  onDirectTargetSelect,
  onDownloadSelectedTemplate,
  onRunDirectImport,
  onEditableCellChange,
  onEditableRowsReorder,
  onContactCompanyResolutionChange,
  onDealCompanyResolutionChange,
  onDealContactResolutionChange,
  onDealProductResolutionChange,
  onConfirmImport,
  onBack,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly dialogStep: ImportDialogStep;
  readonly selectedImportMode: ImportDialogMode;
  readonly selectedTemplate: ImportTemplateItem | null;
  readonly selectedFile: File | null;
  readonly importJob: ImportJobResponse | null;
  readonly editableRows: readonly EditableImportRow[];
  readonly contactCompanyResolutions: ContactCompanyResolutionState;
  readonly dealCompanyResolutions: DealCompanyResolutionState;
  readonly dealContactResolutions: DealContactResolutionState;
  readonly dealProductResolutions: DealProductResolutionState;
  readonly errorMessage: string | null;
  readonly isDownloading: boolean;
  readonly importBusy: boolean;
  readonly onFileChange: (file: File | null) => void;
  readonly onSelectDirectMode: () => void;
  readonly onSelectAiMode: () => void;
  readonly onDirectTargetSelect: (targetType: ImportTemplateType) => void;
  readonly onDownloadSelectedTemplate: () => void;
  readonly onRunDirectImport: () => void;
  readonly onEditableCellChange: (
    rowNumber: number,
    field: ImportTargetField,
    value: string
  ) => void;
  readonly onEditableRowsReorder: (
    sourceRowNumber: number,
    targetRowNumber: number,
    dropPosition: ImportPreviewDropPosition
  ) => void;
  readonly onContactCompanyResolutionChange: (
    companyName: string,
    field: ContactCompanyResolutionField,
    value: string
  ) => void;
  readonly onDealCompanyResolutionChange: (
    companyName: string,
    field: DealCompanyResolutionField,
    value: string
  ) => void;
  readonly onDealContactResolutionChange: (
    contactKey: string,
    field: DealContactResolutionField,
    value: string
  ) => void;
  readonly onDealProductResolutionChange: (
    productName: string,
    field: DealProductResolutionField,
    value: string
  ) => void;
  readonly onConfirmImport: () => void;
  readonly onBack: () => void;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const targetType = selectedTemplate?.templateType as ImportTargetType | undefined;
  const isContactPreview = Boolean(importJob) && targetType === "CONTACT";
  const isDealPreview = Boolean(importJob) && targetType === "DEAL";
  const companyOptionsQuery = useCompanyOptions({
    enabled: isContactPreview,
  });
  const dealCompanyOptionsQuery = useDealCompanyOptions({
    enabled: isDealPreview,
  });
  const dealContactOptionsQuery = useDealContactOptions({
    enabled: isDealPreview,
  });
  const dealProductOptionsQuery = useDealProductOptions({
    enabled: isDealPreview,
  });
  const companyFieldsQuery = useCompanyFields({
    enabled: isContactPreview || isDealPreview,
  });
  const companyRegionsQuery = useCompanyRegions({
    enabled: isContactPreview || isDealPreview,
  });
  const contactDepartmentsQuery = useContactDepartments({
    enabled: isDealPreview,
  });
  const contactJobGradesQuery = useContactJobGrades({
    enabled: isDealPreview,
  });
  const productCategoriesQuery = useProductCategories({
    enabled: isDealPreview,
  });
  const productStatusesQuery = useProductStatuses({
    enabled: isDealPreview,
  });
  const contactCompanySummary = useMemo(
    () =>
      isContactPreview && companyOptionsQuery.data
        ? createContactCompanyImportSummary(
            editableRows,
            companyOptionsQuery.data.items
          )
        : null,
    [companyOptionsQuery.data, editableRows, isContactPreview]
  );
  const dealSummary = useMemo(
    () =>
      isDealPreview &&
      dealCompanyOptionsQuery.data &&
      dealContactOptionsQuery.data &&
      dealProductOptionsQuery.data
        ? createDealImportSummary(
            editableRows,
            dealCompanyOptionsQuery.data,
            dealContactOptionsQuery.data,
            dealProductOptionsQuery.data
          )
        : null,
    [
      dealCompanyOptionsQuery.data,
      dealContactOptionsQuery.data,
      dealProductOptionsQuery.data,
      editableRows,
      isDealPreview,
    ]
  );
  const isActionDisabled = !selectedTemplate || isDownloading || importBusy;
  const hasEmptyPreviewCell =
    importJob && targetType ? hasEmptyEditableCell(targetType, editableRows) : false;
  const hasUnresolvedContactCompanies =
    isContactPreview &&
    (companyOptionsQuery.isLoading ||
      companyOptionsQuery.isError ||
      !contactCompanySummary ||
      hasIncompleteContactCompanyResolutions(
        contactCompanySummary,
        contactCompanyResolutions
      ));
  const hasUnresolvedDealResources =
    isDealPreview &&
    (dealCompanyOptionsQuery.isLoading ||
      dealContactOptionsQuery.isLoading ||
      dealProductOptionsQuery.isLoading ||
      dealCompanyOptionsQuery.isError ||
      dealContactOptionsQuery.isError ||
      dealProductOptionsQuery.isError ||
      !dealSummary ||
      hasIncompleteDealResourceResolutions(
        dealSummary,
        dealCompanyResolutions,
        dealContactResolutions,
        dealProductResolutions
      ));
  const canUploadPreview =
    Boolean(importJob) &&
    !isActionDisabled &&
    editableRows.length > 0 &&
    !hasEmptyPreviewCell &&
    !hasUnresolvedContactCompanies &&
    !hasUnresolvedDealResources;
  const titleLabel =
    dialogStep === "METHOD"
      ? "데이터 업로드"
      : dialogStep === "DIRECT_TARGET"
        ? "직접 업로드"
        : selectedTemplate
          ? `${targetLabels[selectedTemplate.templateType]} ${importJob ? "미리보기" : "업로드"}`
          : "업로드";
  const TitleIcon =
    dialogStep === "DIRECT_TARGET"
      ? FileSpreadsheet
      : dialogStep === "DIRECT_UPLOAD" && selectedTemplate
        ? targetIcons[selectedTemplate.templateType]
        : null;
  const titleIconClassNames =
    dialogStep === "DIRECT_TARGET"
      ? { box: "bg-transparent", icon: "text-black" }
      : dialogStep === "DIRECT_UPLOAD" && selectedTemplate
        ? {
            box: targetColorClassNames[selectedTemplate.templateType].iconBox,
            icon: targetColorClassNames[selectedTemplate.templateType].icon,
          }
        : null;

  return (
    <ModalShell
      bodyClassName="px-5 py-5"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center">
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
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {dialogStep === "DIRECT_UPLOAD" && importJob ? (
              <button
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium disabled:cursor-not-allowed",
                  canUploadPreview
                    ? "bg-[#4880EE] text-white hover:bg-[#1D4ED8]"
                    : "bg-[#E5E7EB] text-[#9CA3AF]",
                )}
                disabled={!canUploadPreview}
                onClick={onConfirmImport}
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
            {dialogStep === "DIRECT_UPLOAD" && !importJob ? (
              <button
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium disabled:cursor-not-allowed",
                  selectedFile
                    ? "bg-[#4880EE] text-white hover:bg-[#1D4ED8]"
                    : "bg-[#E5E7EB] text-[#9CA3AF]",
                )}
                disabled={isActionDisabled || !selectedFile}
                onClick={onRunDirectImport}
                type="button"
              >
                {importBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                미리보기
              </button>
            ) : null}
          </div>
        </div>
      }
      onOpenChange={onOpenChange}
      open={open}
      size={dialogStep === "DIRECT_UPLOAD" && importJob ? "xl" : "md"}
      title={
        <span className="inline-flex min-w-0 items-center gap-2">
          {TitleIcon && titleIconClassNames ? (
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                titleIconClassNames.box
              )}
            >
              <TitleIcon className={cn("h-4 w-4", titleIconClassNames.icon)} />
            </span>
          ) : null}
          <span className="min-w-0 truncate">{titleLabel}</span>
        </span>
      }
    >
      <div className="grid gap-5">
        {dialogStep === "METHOD" ? (
          <div className="grid grid-cols-2 gap-3">
            <ImportMethodButton
              active={selectedImportMode === "DIRECT"}
              icon={FileSpreadsheet}
              label="직접 업로드"
              onClick={onSelectDirectMode}
            />
            <ImportMethodButton
              active={selectedImportMode === "AI"}
              icon={Bot}
              label="AI 업로드"
              onClick={onSelectAiMode}
            />
          </div>
        ) : null}

        {dialogStep === "DIRECT_TARGET" ? (
          <div className="grid grid-cols-2 gap-3">
            {DIRECT_IMPORT_TARGETS.map((target) => (
              <TemplateSelectButton
                active={selectedTemplate?.templateType === target}
                key={target}
                onClick={() => onDirectTargetSelect(target)}
                targetType={target}
              />
            ))}
          </div>
        ) : null}

        {dialogStep === "DIRECT_UPLOAD" ? (
          <>
            {!importJob ? (
              <ImportFilePanel
                disabled={isDownloading || importBusy}
                file={selectedFile}
                isDownloading={isDownloading}
                onDownloadTemplate={onDownloadSelectedTemplate}
                onFileChange={onFileChange}
              />
            ) : null}
            {importJob && targetType ? (
              <ImportEditablePreview
                companyFields={companyFieldsQuery.data?.items ?? []}
                companyRegions={companyRegionsQuery.data?.items ?? []}
                contactCompanyResolutions={contactCompanyResolutions}
                contactCompanySummary={contactCompanySummary}
                contactDepartments={contactDepartmentsQuery.data?.items ?? []}
                contactJobGrades={contactJobGradesQuery.data?.items ?? []}
                dealCompanyResolutions={dealCompanyResolutions}
                dealContactResolutions={dealContactResolutions}
                dealProductResolutions={dealProductResolutions}
                dealSummary={dealSummary}
                disabled={importBusy}
                file={selectedFile}
                isCompanyOptionsError={companyOptionsQuery.isError}
                isCompanyOptionsLoading={companyOptionsQuery.isLoading}
                isDealOptionsError={
                  dealCompanyOptionsQuery.isError ||
                  dealContactOptionsQuery.isError ||
                  dealProductOptionsQuery.isError
                }
                isDealOptionsLoading={
                  dealCompanyOptionsQuery.isLoading ||
                  dealContactOptionsQuery.isLoading ||
                  dealProductOptionsQuery.isLoading
                }
                onEditableCellChange={onEditableCellChange}
                onEditableRowsReorder={onEditableRowsReorder}
                onContactCompanyResolutionChange={onContactCompanyResolutionChange}
                onDealCompanyResolutionChange={onDealCompanyResolutionChange}
                onDealContactResolutionChange={onDealContactResolutionChange}
                onDealProductResolutionChange={onDealProductResolutionChange}
                productCategories={productCategoriesQuery.data?.items ?? []}
                productStatuses={productStatusesQuery.data?.items ?? []}
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
  onClick,
}: {
  readonly targetType: ImportTemplateType;
  readonly active: boolean;
  readonly onClick: () => void;
}) {
  const Icon = targetIcons[targetType];
  const colorClassNames = targetColorClassNames[targetType];

  return (
    <button
      className={cn(
        "grid aspect-[1.55] min-h-[112px] place-items-center gap-2 rounded-lg border p-4 text-center transition",
        active ? colorClassNames.activeCard : colorClassNames.idleCard
      )}
      onClick={onClick}
      type="button"
    >
      <span className="grid place-items-center gap-2">
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl",
            colorClassNames.iconBox
          )}
        >
          <Icon className={cn("h-6 w-6", colorClassNames.icon)} />
        </span>
        <span className="text-sm font-medium">{targetLabels[targetType]}</span>
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
        <span className="text-sm font-medium">{label}</span>
      </span>
    </button>
  );
}

function ImportFilePanel({
  file,
  disabled,
  isDownloading,
  onDownloadTemplate,
  onFileChange,
}: {
  readonly file: File | null;
  readonly disabled: boolean;
  readonly isDownloading: boolean;
  readonly onDownloadTemplate: () => void;
  readonly onFileChange: (file: File | null) => void;
}) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragDepthRef = useRef(0);

  const handleDragEnter = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    dragDepthRef.current += 1;

    if (Array.from(event.dataTransfer.types).includes("Files")) {
      setIsDraggingFile(true);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    event.dataTransfer.dropEffect = "copy";
    setIsDraggingFile(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsDraggingFile(false);

    if (disabled) {
      return;
    }

    onFileChange(event.dataTransfer.files[0] ?? null);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#111827]">파일 업로드</h3>
          <p className="mt-1 text-xs text-[#6B7280]">
            <button
              className="font-semibold text-[#4880EE] underline underline-offset-2 disabled:cursor-wait disabled:text-[#93B4F5]"
              disabled={isDownloading}
              onClick={onDownloadTemplate}
              type="button"
            >
              데이터 양식
            </button>
            에 맞춰 파일을 업로드해주세요.
          </p>
        </div>
        {file ? (
          <Badge>{(file.size / 1024).toFixed(1)}KB</Badge>
        ) : null}
      </div>
      <label
        className={cn(
          "flex min-h-16 select-none items-center justify-center rounded-lg border border-dashed px-4 py-3 text-sm font-medium transition",
          disabled
            ? "cursor-not-allowed border-[#E5E7EB] bg-[#F3F4F6] text-[#9CA3AF]"
            : isDraggingFile
              ? "cursor-copy border-[#4880EE] bg-[#EEF4FF] text-[#1D4ED8]"
              : "cursor-pointer border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
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
        <span className="grid min-w-0 place-items-center gap-2">
          <span className="inline-flex min-w-0 items-center gap-2">
            <Upload
              className={cn(
                "h-4 w-4 shrink-0",
                isDraggingFile ? "text-[#1D4ED8]" : "text-[#4880EE]"
              )}
            />
            <span className="truncate">
              {isDraggingFile ? "파일 놓기" : file ? file.name : "파일 선택"}
            </span>
          </span>
          <span className="text-[11px] font-normal leading-none text-[#9CA3AF]">
            csv, xlsx 최대 10MB
          </span>
        </span>
      </label>
    </div>
  );
}

function ImportEditablePreview({
  targetType,
  rows,
  file,
  contactCompanySummary,
  contactCompanyResolutions,
  dealSummary,
  dealCompanyResolutions,
  dealContactResolutions,
  dealProductResolutions,
  companyFields,
  companyRegions,
  contactDepartments,
  contactJobGrades,
  productCategories,
  productStatuses,
  isCompanyOptionsLoading,
  isCompanyOptionsError,
  isDealOptionsLoading,
  isDealOptionsError,
  disabled,
  onEditableCellChange,
  onEditableRowsReorder,
  onContactCompanyResolutionChange,
  onDealCompanyResolutionChange,
  onDealContactResolutionChange,
  onDealProductResolutionChange,
}: {
  readonly targetType: ImportTargetType;
  readonly rows: readonly EditableImportRow[];
  readonly file: File | null;
  readonly contactCompanySummary: ContactCompanyImportSummaryData | null;
  readonly contactCompanyResolutions: ContactCompanyResolutionState;
  readonly dealSummary: DealImportSummaryData | null;
  readonly dealCompanyResolutions: DealCompanyResolutionState;
  readonly dealContactResolutions: DealContactResolutionState;
  readonly dealProductResolutions: DealProductResolutionState;
  readonly companyFields: readonly CompanyField[];
  readonly companyRegions: readonly CompanyRegion[];
  readonly contactDepartments: readonly ContactDepartment[];
  readonly contactJobGrades: readonly ContactJobGrade[];
  readonly productCategories: readonly ProductCategory[];
  readonly productStatuses: readonly ProductStatus[];
  readonly isCompanyOptionsLoading: boolean;
  readonly isCompanyOptionsError: boolean;
  readonly isDealOptionsLoading: boolean;
  readonly isDealOptionsError: boolean;
  readonly disabled: boolean;
  readonly onEditableCellChange: (
    rowNumber: number,
    field: ImportTargetField,
    value: string
  ) => void;
  readonly onEditableRowsReorder: (
    sourceRowNumber: number,
    targetRowNumber: number,
    dropPosition: ImportPreviewDropPosition
  ) => void;
  readonly onContactCompanyResolutionChange: (
    companyName: string,
    field: ContactCompanyResolutionField,
    value: string
  ) => void;
  readonly onDealCompanyResolutionChange: (
    companyName: string,
    field: DealCompanyResolutionField,
    value: string
  ) => void;
  readonly onDealContactResolutionChange: (
    contactKey: string,
    field: DealContactResolutionField,
    value: string
  ) => void;
  readonly onDealProductResolutionChange: (
    productName: string,
    field: DealProductResolutionField,
    value: string
  ) => void;
}) {
  const fields = importTargetFields[targetType];
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [draggedRowNumber, setDraggedRowNumber] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    readonly rowNumber: number;
    readonly position: ImportPreviewDropPosition;
  } | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const previewTableRef = useRef<HTMLDivElement | null>(null);
  const previewColumnWidths = fields.map((field) =>
    getImportPreviewColumnWidth(field, columnWidths)
  );
  const previewGridTemplateColumns = `${IMPORT_PREVIEW_ROW_NUMBER_COLUMN_WIDTH}px ${previewColumnWidths
    .map((width) => `minmax(0, ${width}fr)`)
    .join(" ")}`;
  const previewGridStyle = {
    gridTemplateColumns: previewGridTemplateColumns,
  };
  const newContactCompanyNames = new Set(
    contactCompanySummary?.newCompanyNames ?? []
  );
  const newDealCompanyNames = new Set(dealSummary?.newCompanyNames ?? []);
  const newDealContactKeys = new Set(dealSummary?.newContactKeys ?? []);
  const newDealProductNames = new Set(dealSummary?.newProductNames ?? []);
  const canReorderRows = !disabled && rows.length > 1;

  useEffect(() => {
    resizeCleanupRef.current?.();
    resizeCleanupRef.current = null;
    setColumnWidths({});
  }, [targetType]);

  useEffect(() => {
    return () => {
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    };
  }, []);

  const resetRowDragState = () => {
    setDraggedRowNumber(null);
    setDropIndicator(null);
  };

  const getRowDropPosition = (
    event: DragEvent<HTMLDivElement>
  ): ImportPreviewDropPosition => {
    const rowRect = event.currentTarget.getBoundingClientRect();

    return event.clientY - rowRect.top < rowRect.height / 2 ? "before" : "after";
  };

  const onRowDragStart = (
    rowNumber: number,
    event: DragEvent<HTMLButtonElement>
  ) => {
    if (!canReorderRows) {
      event.preventDefault();
      return;
    }

    resizeCleanupRef.current?.();
    setDraggedRowNumber(rowNumber);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(rowNumber));
  };

  const onRowDragOver = (
    rowNumber: number,
    event: DragEvent<HTMLDivElement>
  ) => {
    if (!canReorderRows || draggedRowNumber === null) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const nextPosition = getRowDropPosition(event);
    setDropIndicator((currentIndicator) =>
      currentIndicator?.rowNumber === rowNumber &&
      currentIndicator.position === nextPosition
        ? currentIndicator
        : { rowNumber, position: nextPosition }
    );
  };

  const onRowDrop = (
    rowNumber: number,
    event: DragEvent<HTMLDivElement>
  ) => {
    if (!canReorderRows || draggedRowNumber === null) {
      resetRowDragState();
      return;
    }

    event.preventDefault();
    onEditableRowsReorder(
      draggedRowNumber,
      rowNumber,
      getRowDropPosition(event)
    );
    resetRowDragState();
  };

  const onColumnResizeStart = (
    leftField: ImportTargetField,
    rightField: ImportTargetField,
    event: ReactMouseEvent<HTMLElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    resizeCleanupRef.current?.();

    const startX = event.clientX;
    const totalColumnWeight = fields.reduce(
      (totalWeight, field) =>
        totalWeight + getImportPreviewColumnWidth(field, columnWidths),
      0
    );
    const availableColumnWidth = Math.max(
      1,
      (previewTableRef.current?.clientWidth ?? 0) -
        IMPORT_PREVIEW_ROW_NUMBER_COLUMN_WIDTH
    );
    const pixelPerWeight = availableColumnWidth / totalColumnWeight;
    const startLeftWeight = getImportPreviewColumnWidth(leftField, columnWidths);
    const startRightWeight = getImportPreviewColumnWidth(rightField, columnWidths);
    const startLeftWidth = startLeftWeight * pixelPerWeight;
    const startRightWidth = startRightWeight * pixelPerWeight;
    const pairWidth = startLeftWidth + startRightWidth;
    const minColumnWidth = Math.min(
      IMPORT_PREVIEW_COLUMN_MIN_WIDTH,
      pairWidth / 2
    );
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function handleMouseMove(moveEvent: MouseEvent) {
      moveEvent.preventDefault();

      const nextLeftWidth = Math.min(
        pairWidth - minColumnWidth,
        Math.max(minColumnWidth, startLeftWidth + moveEvent.clientX - startX)
      );
      const nextRightWidth = pairWidth - nextLeftWidth;
      const nextLeftWeight = nextLeftWidth / pixelPerWeight;
      const nextRightWeight = nextRightWidth / pixelPerWeight;

      setColumnWidths((currentWidths) => {
        if (
          currentWidths[leftField.field] === nextLeftWeight &&
          currentWidths[rightField.field] === nextRightWeight
        ) {
          return currentWidths;
        }

        return {
          ...currentWidths,
          [leftField.field]: nextLeftWeight,
          [rightField.field]: nextRightWeight,
        };
      });
    }

    function cleanupResize() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseEnd);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;

      if (resizeCleanupRef.current === cleanupResize) {
        resizeCleanupRef.current = null;
      }
    }

    function handleMouseEnd() {
      cleanupResize();
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseEnd);
    resizeCleanupRef.current = cleanupResize;
  };

  return (
    <div className="grid gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#111827]">데이터 검토</h3>
          <p className="mt-1 text-xs text-[#6B7280]">
            최종 데이터를 검토해주세요.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge>{rows.length.toLocaleString("ko-KR")}행</Badge>
          {file ? <Badge>{(file.size / 1024).toFixed(1)}KB</Badge> : null}
        </div>
      </div>

      {targetType === "CONTACT" ? (
        <ContactCompanyImportSummary
          companyFields={companyFields}
          companyRegions={companyRegions}
          disabled={disabled}
          isError={isCompanyOptionsError}
          isLoading={isCompanyOptionsLoading}
          onResolutionChange={onContactCompanyResolutionChange}
          resolutions={contactCompanyResolutions}
          summary={contactCompanySummary}
        />
      ) : null}

      {targetType === "DEAL" ? (
        <DealResourceImportSummary
          companyFields={companyFields}
          companyRegions={companyRegions}
          contactDepartments={contactDepartments}
          contactJobGrades={contactJobGrades}
          dealCompanyResolutions={dealCompanyResolutions}
          dealContactResolutions={dealContactResolutions}
          dealProductResolutions={dealProductResolutions}
          disabled={disabled}
          isError={isDealOptionsError}
          isLoading={isDealOptionsLoading}
          onCompanyResolutionChange={onDealCompanyResolutionChange}
          onContactResolutionChange={onDealContactResolutionChange}
          onProductResolutionChange={onDealProductResolutionChange}
          productCategories={productCategories}
          productStatuses={productStatuses}
          summary={dealSummary}
        />
      ) : null}

      <div
        className="max-h-[320px] overflow-x-hidden overflow-y-auto rounded-md border border-[#E5E7EB] text-[11px]"
        ref={previewTableRef}
        role="table"
      >
        <div
          className="sticky top-0 z-10 grid bg-[#F8FAFC] text-left text-[#475569]"
          role="row"
          style={previewGridStyle}
        >
          <div
              className="flex h-[30px] w-[25px] items-center justify-center overflow-hidden border-b border-r border-[#CBD5E1] px-0 text-center text-[10px] font-semibold"
            role="columnheader"
          >
            행
          </div>
          {fields.map((field, fieldIndex) => {
            const previousField = fields[fieldIndex - 1];
            const nextField = fields[fieldIndex + 1];

            return (
              <div
                className="relative flex h-[30px] min-w-0 select-none items-center border-b border-r border-[#CBD5E1] px-2 font-semibold last:border-r-0"
                key={field.field}
                role="columnheader"
              >
                <span className="block truncate pr-1">{field.label}</span>
                {previousField ? (
                  <button
                    aria-label={`${field.label} 컬럼 왼쪽 경계 조절`}
                    className="absolute left-0 top-0 z-20 h-full w-3 cursor-col-resize appearance-none border-0 bg-transparent p-0"
                    onMouseDown={(event) =>
                      onColumnResizeStart(previousField, field, event)
                    }
                    type="button"
                  />
                ) : null}
                {nextField ? (
                  <button
                    aria-label={`${field.label} 컬럼 오른쪽 경계 조절`}
                    className="absolute right-0 top-0 z-20 h-full w-3 cursor-col-resize appearance-none border-0 bg-transparent p-0"
                    onMouseDown={(event) =>
                      onColumnResizeStart(field, nextField, event)
                    }
                    type="button"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {rows.map((row) => {
          const isDraggingRow = draggedRowNumber === row.rowNumber;
          const rowDropIndicator =
            dropIndicator?.rowNumber === row.rowNumber ? dropIndicator : null;

          return (
          <div
            className={cn(
              "relative grid border-b last:border-b-0",
              isDraggingRow && "opacity-45"
            )}
            key={row.rowNumber}
            onDragEnd={resetRowDragState}
            onDragOver={(event) => onRowDragOver(row.rowNumber, event)}
            onDrop={(event) => onRowDrop(row.rowNumber, event)}
            role="row"
            style={previewGridStyle}
          >
            {rowDropIndicator ? (
              <span
                className={cn(
                  "pointer-events-none absolute left-0 right-0 z-20 h-0.5 bg-[#4880EE]",
                  rowDropIndicator.position === "before"
                    ? "top-0"
                    : "bottom-[-1px]"
                )}
              />
            ) : null}
            <div
              className="flex h-[30px] w-[25px] items-center justify-center overflow-hidden border-r border-[#CBD5E1] bg-[#FAFBFC] px-0 text-center text-[10px] text-[#64748B]"
              role="cell"
            >
              <button
                aria-label={`${row.rowNumber}행 순서 변경`}
                className={cn(
                  "group/row-handle relative flex h-full w-full items-center justify-center overflow-hidden text-[10px] transition",
                  canReorderRows
                    ? "cursor-grab text-[#64748B] hover:bg-[#EFF6FF] active:cursor-grabbing"
                    : "cursor-default text-[#94A3B8]"
                )}
                disabled={!canReorderRows}
                draggable={canReorderRows}
                onDragStart={(event) => onRowDragStart(row.rowNumber, event)}
                title="행 끌어서 순서 변경"
                type="button"
              >
                <span className="transition group-hover/row-handle:opacity-0">
                  {row.rowNumber}
                </span>
                <GripVertical
                  aria-hidden="true"
                  className="absolute h-3.5 w-3.5 text-[#4880EE] opacity-0 transition group-hover/row-handle:opacity-100"
                />
              </button>
            </div>
            {fields.map((field) => {
              const cellValue = toInputValue(row.data[field.field]);
              const cellError = getImportPreviewCellError(
                field,
                row.data[field.field]
              );
              const isInvalidCell = cellError !== null;
              const normalizedCompanyName = cellValue.trim();
              const isNewContactCompany =
                targetType === "CONTACT" &&
                field.field === "companyName" &&
                normalizedCompanyName.length > 0 &&
                newContactCompanyNames.has(normalizedCompanyName);
              const isNewContactCompanyResolved =
                isNewContactCompany &&
                isContactCompanyResolutionComplete(
                  contactCompanyResolutions[normalizedCompanyName]
                );
              const rowCompanyName = toInputValue(row.data.companyName).trim();
              const rowContactName = toInputValue(row.data.contactName).trim();
              const rowProductName = toInputValue(row.data.productName).trim();
              const dealContactKey = createDealContactResolutionKey(
                rowCompanyName,
                rowContactName
              );
              const isNewDealCompany =
                targetType === "DEAL" &&
                field.field === "companyName" &&
                rowCompanyName.length > 0 &&
                newDealCompanyNames.has(rowCompanyName);
              const isNewDealCompanyResolved =
                isNewDealCompany &&
                isContactCompanyResolutionComplete(
                  dealCompanyResolutions[rowCompanyName]
                );
              const isNewDealContact =
                targetType === "DEAL" &&
                field.field === "contactName" &&
                rowCompanyName.length > 0 &&
                rowContactName.length > 0 &&
                newDealContactKeys.has(dealContactKey);
              const isNewDealContactResolved =
                isNewDealContact &&
                isDealContactResolutionComplete(
                  dealContactResolutions[dealContactKey]
                );
              const isNewDealProduct =
                targetType === "DEAL" &&
                field.field === "productName" &&
                rowProductName.length > 0 &&
                newDealProductNames.has(rowProductName);
              const isNewDealProductResolved =
                isNewDealProduct &&
                isDealProductResolutionComplete(
                  dealProductResolutions[rowProductName]
                );
              const creationBadge = isNewContactCompany
                ? {
                    resolved: isNewContactCompanyResolved,
                    resolvedLabel: "생성 예정",
                    unresolvedLabel: "생성 필요",
                  }
                : isNewDealCompany || isNewDealContact || isNewDealProduct
                  ? {
                      resolved:
                        isNewDealCompanyResolved ||
                        isNewDealContactResolved ||
                        isNewDealProductResolved,
                      resolvedLabel: "생성 예정",
                      unresolvedLabel: "생성 필요",
                    }
                  : null;

              return (
                <div
                  className={cn(
                    "flex h-[30px] min-w-0 items-center border-r border-[#CBD5E1] px-2 last:border-r-0",
                    isInvalidCell && "bg-red-50"
                  )}
                  key={field.field}
                  role="cell"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    {field.kind === "enum" ? (
                      <select
                        aria-invalid={isInvalidCell}
                        className={cn(
                          "h-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-0 text-[11px] outline-none disabled:bg-transparent",
                          isInvalidCell ? "text-red-700" : "text-[#111827]"
                        )}
                        disabled={disabled}
                        onChange={(event) =>
                          onEditableCellChange(
                            row.rowNumber,
                            field,
                            event.target.value
                          )
                        }
                        value={cellValue}
                      >
                        <option value="" />
                        {(field.enumValues ?? []).map((enumValue) => (
                          <option key={enumValue} value={enumValue}>
                            {enumValue}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        aria-invalid={isInvalidCell}
                        className={cn(
                          "h-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-0 text-[11px] outline-none disabled:bg-transparent",
                          isInvalidCell
                            ? "text-red-700"
                            : "text-[#111827]"
                        )}
                        disabled={disabled}
                        onChange={(event) =>
                          onEditableCellChange(
                            row.rowNumber,
                            field,
                            event.target.value
                          )
                        }
                        type={field.kind === "number" ? "text" : "text"}
                        value={cellValue}
                      />
                    )}
                    {creationBadge ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                          creationBadge.resolved
                            ? "bg-[#EFF6FF] text-[#1D4ED8]"
                            : "bg-[#FFF1F2] text-[#F04452]"
                        )}
                      >
                        {creationBadge.resolved
                          ? creationBadge.resolvedLabel
                          : creationBadge.unresolvedLabel}
                      </span>
                    ) : null}
                  </div>
                  {cellError ? (
                    <span
                      className="mt-1 block truncate text-[11px] text-red-500"
                      title={cellError}
                    >
                      {cellError}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function getDefaultImportPreviewColumnWidth(field: ImportTargetField): number {
  if (field.field === "contactEmail") {
    return 156;
  }

  if (field.field === "contactPhone") {
    return 136;
  }

  return 104;
}

function getImportPreviewColumnWidth(
  field: ImportTargetField,
  columnWidths: Readonly<Record<string, number>>
): number {
  return columnWidths[field.field] ?? getDefaultImportPreviewColumnWidth(field);
}

function isContactCompanyResolutionComplete(
  resolution: ContactCompanyResolutionValue | undefined
): boolean {
  return Boolean(
    resolution &&
      resolution.companyFieldName.trim().length > 0 &&
      resolution.companyRegionName.trim().length > 0
  );
}

function ContactCompanyImportSummary({
  summary,
  resolutions,
  companyFields,
  companyRegions,
  isLoading,
  isError,
  disabled,
  onResolutionChange,
}: {
  readonly summary: ContactCompanyImportSummaryData | null;
  readonly resolutions: ContactCompanyResolutionState;
  readonly companyFields: readonly CompanyField[];
  readonly companyRegions: readonly CompanyRegion[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly disabled: boolean;
  readonly onResolutionChange: (
    companyName: string,
    field: ContactCompanyResolutionField,
    value: string
  ) => void;
}) {
  const createCompanyFieldMutation = useCreateCompanyFieldMutation();
  const createCompanyRegionMutation = useCreateCompanyRegionMutation();

  if (isLoading) {
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-[#FAFBFC] px-3 py-2 text-[12px] text-[#6B7280]">
        회사 매칭 정보를 확인하고 있습니다.
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[12px] text-[#92400E]">
        회사 매칭 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  if (summary.totalCompanyCount === 0 || summary.newCompanyCount === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 rounded-md border border-[#E5E7EB] bg-[#FAFBFC] px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#FFF1F2] px-2 py-0.5 text-[11px] font-semibold text-[#F04452]">
          회사 생성 필요 {summary.newCompanyCount.toLocaleString("ko-KR")}개
        </span>
      </div>
      {summary.newCompanyCount > 0 ? (
        <>
          <div className="max-h-[180px] overflow-y-auto rounded-md border border-[#E5E7EB] bg-white">
            <div className="grid h-[30px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b bg-[#F8FAFC] text-[11px] font-semibold text-[#475569]">
              <div className="flex min-w-0 items-center px-3">새 회사명</div>
              <div className="flex min-w-0 items-center px-2">회사 분야</div>
              <div className="flex min-w-0 items-center px-2">회사 지역</div>
            </div>
            {summary.newCompanyNames.map((companyName) => {
              const resolution = resolutions[companyName] ?? {
                companyFieldName: "",
                companyRegionName: "",
              };
              const isFieldEmpty =
                resolution.companyFieldName.trim().length === 0;
              const isRegionEmpty =
                resolution.companyRegionName.trim().length === 0;

              return (
                <div
                  className="grid h-[30px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b last:border-b-0"
                  key={companyName}
                >
                  <div className="flex min-w-0 items-center px-3 text-[11px] text-[#111827]">
                    <span className="min-w-0 truncate" title={companyName}>
                      {companyName}
                    </span>
                    <span className="ml-1.5 shrink-0 text-[10px] font-medium text-[#9CA3AF]">
                      담당자{" "}
                      {(
                        summary.newCompanyContactCounts[companyName] ?? 0
                      ).toLocaleString("ko-KR")}
                      명
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <ImportTaxonomySelect
                      disabled={disabled}
                      emptyText="등록된 회사 분야가 없습니다."
                      getLabel={(field) => field.field}
                      invalid={isFieldEmpty}
                      isCreating={createCompanyFieldMutation.isPending}
                      itemKindLabel="분야"
                      items={companyFields}
                      placeholder="분야 선택"
                      selectedLabel={resolution.companyFieldName}
                      onCreate={async (name) => {
                        await createCompanyFieldMutation.mutateAsync({
                          field: name,
                        });
                        onResolutionChange(
                          companyName,
                          "companyFieldName",
                          name
                        );
                      }}
                      onSelect={(label) =>
                        onResolutionChange(companyName, "companyFieldName", label)
                      }
                    />
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <ImportTaxonomySelect
                      disabled={disabled}
                      emptyText="등록된 회사 지역이 없습니다."
                      getLabel={(region) => region.region}
                      invalid={isRegionEmpty}
                      isCreating={createCompanyRegionMutation.isPending}
                      itemKindLabel="지역"
                      items={companyRegions}
                      placeholder="지역 선택"
                      selectedLabel={resolution.companyRegionName}
                      onCreate={async (name) => {
                        await createCompanyRegionMutation.mutateAsync({
                          region: name,
                        });
                        onResolutionChange(
                          companyName,
                          "companyRegionName",
                          name
                        );
                      }}
                      onSelect={(label) =>
                        onResolutionChange(companyName, "companyRegionName", label)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function DealResourceImportSummary({
  summary,
  dealCompanyResolutions,
  dealContactResolutions,
  dealProductResolutions,
  companyFields,
  companyRegions,
  contactDepartments,
  contactJobGrades,
  productCategories,
  productStatuses,
  isLoading,
  isError,
  disabled,
  onCompanyResolutionChange,
  onContactResolutionChange,
  onProductResolutionChange,
}: {
  readonly summary: DealImportSummaryData | null;
  readonly dealCompanyResolutions: DealCompanyResolutionState;
  readonly dealContactResolutions: DealContactResolutionState;
  readonly dealProductResolutions: DealProductResolutionState;
  readonly companyFields: readonly CompanyField[];
  readonly companyRegions: readonly CompanyRegion[];
  readonly contactDepartments: readonly ContactDepartment[];
  readonly contactJobGrades: readonly ContactJobGrade[];
  readonly productCategories: readonly ProductCategory[];
  readonly productStatuses: readonly ProductStatus[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly disabled: boolean;
  readonly onCompanyResolutionChange: (
    companyName: string,
    field: DealCompanyResolutionField,
    value: string
  ) => void;
  readonly onContactResolutionChange: (
    contactKey: string,
    field: DealContactResolutionField,
    value: string
  ) => void;
  readonly onProductResolutionChange: (
    productName: string,
    field: DealProductResolutionField,
    value: string
  ) => void;
}) {
  const [openSections, setOpenSections] = useState({
    companies: true,
    contacts: true,
    products: true,
  });
  const createCompanyFieldMutation = useCreateCompanyFieldMutation();
  const createCompanyRegionMutation = useCreateCompanyRegionMutation();
  const createDepartmentMutation = useCreateDepartmentMutation();
  const createJobGradeMutation = useCreateJobGradeMutation();
  const createCategoryMutation = useCreateCategoryMutation();
  const createStatusMutation = useCreateStatusMutation();

  if (isLoading) {
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-[#FAFBFC] px-3 py-2 text-[12px] text-[#6B7280]">
        딜 연결 정보를 확인하고 있습니다.
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[12px] text-[#92400E]">
        딜 연결 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  const totalMissingCount =
    summary.newCompanyCount + summary.newContactCount + summary.newProductCount;

  if (totalMissingCount === 0) {
    return null;
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [section]: !currentSections[section],
    }));
  };

  return (
    <div className="grid gap-2 rounded-md border border-[#E5E7EB] bg-[#FAFBFC] px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {summary.newCompanyCount > 0 ? (
          <span className="rounded-full bg-[#FFF1F2] px-2 py-0.5 text-[11px] font-semibold text-[#F04452]">
            회사 생성 필요 {summary.newCompanyCount.toLocaleString("ko-KR")}개
          </span>
        ) : null}
        {summary.newContactCount > 0 ? (
          <span className="rounded-full bg-[#FFF1F2] px-2 py-0.5 text-[11px] font-semibold text-[#F04452]">
            담당자 생성 필요 {summary.newContactCount.toLocaleString("ko-KR")}개
          </span>
        ) : null}
        {summary.newProductCount > 0 ? (
          <span className="rounded-full bg-[#FFF1F2] px-2 py-0.5 text-[11px] font-semibold text-[#F04452]">
            제품 생성 필요 {summary.newProductCount.toLocaleString("ko-KR")}개
          </span>
        ) : null}
      </div>

      {summary.newCompanyCount > 0 ? (
        <DealResolutionSection
          count={summary.newCompanyCount}
          isOpen={openSections.companies}
          title="회사 생성"
          onToggle={() => toggleSection("companies")}
        >
          <div className="max-h-[170px] overflow-y-auto rounded-md border border-[#E5E7EB] bg-white">
            <div className="grid h-[30px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b bg-[#F8FAFC] text-[11px] font-semibold text-[#475569]">
              <div className="flex min-w-0 items-center px-3">새 회사명</div>
              <div className="flex min-w-0 items-center px-2">회사 분야</div>
              <div className="flex min-w-0 items-center px-2">회사 지역</div>
            </div>
            {summary.newCompanyNames.map((companyName) => {
              const resolution = dealCompanyResolutions[companyName] ?? {
                companyFieldName: "",
                companyRegionName: "",
              };

              return (
                <div
                  className="grid h-[30px] grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b last:border-b-0"
                  key={companyName}
                >
                  <div className="flex min-w-0 items-center px-3 text-[11px] text-[#111827]">
                    <span className="min-w-0 truncate" title={companyName}>
                      {companyName}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <ImportTaxonomySelect
                      disabled={disabled}
                      emptyText="등록된 회사 분야가 없습니다."
                      getLabel={(field) => field.field}
                      invalid={resolution.companyFieldName.trim().length === 0}
                      isCreating={createCompanyFieldMutation.isPending}
                      itemKindLabel="분야"
                      items={companyFields}
                      placeholder="분야 선택"
                      selectedLabel={resolution.companyFieldName}
                      onCreate={async (name) => {
                        await createCompanyFieldMutation.mutateAsync({
                          field: name,
                        });
                        onCompanyResolutionChange(
                          companyName,
                          "companyFieldName",
                          name
                        );
                      }}
                      onSelect={(label) =>
                        onCompanyResolutionChange(
                          companyName,
                          "companyFieldName",
                          label
                        )
                      }
                    />
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <ImportTaxonomySelect
                      disabled={disabled}
                      emptyText="등록된 회사 지역이 없습니다."
                      getLabel={(region) => region.region}
                      invalid={resolution.companyRegionName.trim().length === 0}
                      isCreating={createCompanyRegionMutation.isPending}
                      itemKindLabel="지역"
                      items={companyRegions}
                      placeholder="지역 선택"
                      selectedLabel={resolution.companyRegionName}
                      onCreate={async (name) => {
                        await createCompanyRegionMutation.mutateAsync({
                          region: name,
                        });
                        onCompanyResolutionChange(
                          companyName,
                          "companyRegionName",
                          name
                        );
                      }}
                      onSelect={(label) =>
                        onCompanyResolutionChange(
                          companyName,
                          "companyRegionName",
                          label
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </DealResolutionSection>
      ) : null}

      {summary.newContactCount > 0 ? (
        <DealResolutionSection
          count={summary.newContactCount}
          isOpen={openSections.contacts}
          title="담당자 생성"
          onToggle={() => toggleSection("contacts")}
        >
          <div className="max-h-[190px] overflow-y-auto rounded-md border border-[#E5E7EB] bg-white">
            <div className="grid h-[30px] grid-cols-[minmax(0,0.95fr)_minmax(0,0.8fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b bg-[#F8FAFC] text-[11px] font-semibold text-[#475569]">
              <div className="flex min-w-0 items-center px-2">회사명</div>
              <div className="flex min-w-0 items-center px-2">담당자명</div>
              <div className="flex min-w-0 items-center px-2">이메일</div>
              <div className="flex min-w-0 items-center px-2">핸드폰 번호</div>
              <div className="flex min-w-0 items-center px-2">부서</div>
              <div className="flex min-w-0 items-center px-2">직급</div>
            </div>
            {summary.newContactKeys.map((contactKey) => {
              const resolution = dealContactResolutions[contactKey] ?? {
                companyName: summary.contactCompanyNames[contactKey] ?? "",
                contactName: summary.contactNames[contactKey] ?? "",
                contactEmail: "",
                contactPhone: "",
                contactDepartmentName: "",
                contactJobGradeName: "",
              };

              return (
                <div
                  className="grid h-[30px] grid-cols-[minmax(0,0.95fr)_minmax(0,0.8fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] border-b last:border-b-0"
                  key={contactKey}
                >
                  <div className="flex min-w-0 items-center px-2 text-[11px] text-[#111827]">
                    <span className="truncate" title={resolution.companyName}>
                      {resolution.companyName}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center px-2 text-[11px] text-[#111827]">
                    <span className="truncate" title={resolution.contactName}>
                      {resolution.contactName}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <input
                      className="h-[30px] min-w-0 flex-1 border-0 bg-transparent px-0 text-[11px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                      disabled={disabled}
                      onChange={(event) =>
                        onContactResolutionChange(
                          contactKey,
                          "contactEmail",
                          event.target.value
                        )
                      }
                      placeholder="email@example.com"
                      value={resolution.contactEmail}
                    />
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <input
                      className="h-[30px] min-w-0 flex-1 border-0 bg-transparent px-0 text-[11px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                      disabled={disabled}
                      onChange={(event) =>
                        onContactResolutionChange(
                          contactKey,
                          "contactPhone",
                          event.target.value
                        )
                      }
                      placeholder="010-0000-0000"
                      value={resolution.contactPhone}
                    />
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <ImportTaxonomySelect
                      disabled={disabled}
                      emptyText="등록된 담당자 부서가 없습니다."
                      getLabel={(department) => department.departmentName}
                      invalid={
                        resolution.contactDepartmentName.trim().length === 0
                      }
                      isCreating={createDepartmentMutation.isPending}
                      itemKindLabel="부서"
                      items={contactDepartments}
                      placeholder="부서 선택"
                      selectedLabel={resolution.contactDepartmentName}
                      onCreate={async (name) => {
                        await createDepartmentMutation.mutateAsync({
                          departmentName: name,
                        });
                        onContactResolutionChange(
                          contactKey,
                          "contactDepartmentName",
                          name
                        );
                      }}
                      onSelect={(label) =>
                        onContactResolutionChange(
                          contactKey,
                          "contactDepartmentName",
                          label
                        )
                      }
                    />
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <ImportTaxonomySelect
                      disabled={disabled}
                      emptyText="등록된 담당자 직급이 없습니다."
                      getLabel={(jobGrade) => jobGrade.jobGradeName}
                      invalid={resolution.contactJobGradeName.trim().length === 0}
                      isCreating={createJobGradeMutation.isPending}
                      itemKindLabel="직급"
                      items={contactJobGrades}
                      placeholder="직급 선택"
                      selectedLabel={resolution.contactJobGradeName}
                      onCreate={async (name) => {
                        await createJobGradeMutation.mutateAsync({
                          jobGradeName: name,
                        });
                        onContactResolutionChange(
                          contactKey,
                          "contactJobGradeName",
                          name
                        );
                      }}
                      onSelect={(label) =>
                        onContactResolutionChange(
                          contactKey,
                          "contactJobGradeName",
                          label
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </DealResolutionSection>
      ) : null}

      {summary.newProductCount > 0 ? (
        <DealResolutionSection
          count={summary.newProductCount}
          isOpen={openSections.products}
          title="제품 생성"
          onToggle={() => toggleSection("products")}
        >
          <div className="max-h-[170px] overflow-y-auto rounded-md border border-[#E5E7EB] bg-white">
            <div className="grid h-[30px] grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b bg-[#F8FAFC] text-[11px] font-semibold text-[#475569]">
              <div className="flex min-w-0 items-center px-3">새 제품명</div>
              <div className="flex min-w-0 items-center px-2">가격</div>
              <div className="flex min-w-0 items-center px-2">카테고리</div>
              <div className="flex min-w-0 items-center px-2">상태</div>
            </div>
            {summary.newProductNames.map((productName) => {
              const resolution = dealProductResolutions[productName] ?? {
                productPrice: "",
                productCategoryName: "",
                productStatusName: "",
              };

              return (
                <div
                  className="grid h-[30px] grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b last:border-b-0"
                  key={productName}
                >
                  <div className="flex min-w-0 items-center px-3 text-[11px] text-[#111827]">
                    <span className="truncate" title={productName}>
                      {productName}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <input
                      className="h-[30px] min-w-0 flex-1 border-0 bg-transparent px-0 text-[11px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                      disabled={disabled}
                      onChange={(event) =>
                        onProductResolutionChange(
                          productName,
                          "productPrice",
                          event.target.value
                        )
                      }
                      placeholder="0"
                      value={resolution.productPrice}
                    />
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <ImportTaxonomySelect
                      disabled={disabled}
                      emptyText="등록된 제품 카테고리가 없습니다."
                      getLabel={(category) => category.categoryName}
                      invalid={resolution.productCategoryName.trim().length === 0}
                      isCreating={createCategoryMutation.isPending}
                      itemKindLabel="카테고리"
                      items={productCategories}
                      placeholder="카테고리 선택"
                      selectedLabel={resolution.productCategoryName}
                      onCreate={async (name) => {
                        await createCategoryMutation.mutateAsync({
                          categoryName: name,
                        });
                        onProductResolutionChange(
                          productName,
                          "productCategoryName",
                          name
                        );
                      }}
                      onSelect={(label) =>
                        onProductResolutionChange(
                          productName,
                          "productCategoryName",
                          label
                        )
                      }
                    />
                  </div>
                  <div className="flex min-w-0 items-center px-2">
                    <ImportTaxonomySelect
                      disabled={disabled}
                      emptyText="등록된 제품 상태가 없습니다."
                      getLabel={(status) => status.statusName}
                      invalid={resolution.productStatusName.trim().length === 0}
                      isCreating={createStatusMutation.isPending}
                      itemKindLabel="상태"
                      items={productStatuses}
                      placeholder="상태 선택"
                      selectedLabel={resolution.productStatusName}
                      onCreate={async (name) => {
                        await createStatusMutation.mutateAsync({
                          statusName: name,
                        });
                        onProductResolutionChange(
                          productName,
                          "productStatusName",
                          name
                        );
                      }}
                      onSelect={(label) =>
                        onProductResolutionChange(
                          productName,
                          "productStatusName",
                          label
                        )
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </DealResolutionSection>
      ) : null}
    </div>
  );
}

function DealResolutionSection({
  title,
  count,
  isOpen,
  children,
  onToggle,
}: {
  readonly title: string;
  readonly count: number;
  readonly isOpen: boolean;
  readonly children: ReactNode;
  readonly onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white">
      <button
        className="flex h-[34px] w-full items-center justify-between gap-2 bg-[#F8FAFC] px-3 text-left text-[12px] font-semibold text-[#111827]"
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-0 truncate">
          {title} {count.toLocaleString("ko-KR")}개
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#64748B] transition",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      {isOpen ? <div>{children}</div> : null}
    </div>
  );
}

function ImportTaxonomySelect<TItem extends { readonly id: string }>({
  disabled,
  emptyText,
  getLabel,
  invalid,
  isCreating,
  itemKindLabel,
  items,
  placeholder,
  selectedLabel,
  onCreate,
  onSelect,
}: {
  readonly disabled: boolean;
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly invalid: boolean;
  readonly isCreating: boolean;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly placeholder: string;
  readonly selectedLabel: string;
  readonly onCreate: (name: string) => Promise<void>;
  readonly onSelect: (label: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] =
    useState<ImportTaxonomyPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = search.trim();
  const normalizedQuery = normalizeImportTaxonomyText(query);
  const normalizedSelectedLabel = normalizeImportTaxonomyText(selectedLabel);
  const selectedItem = items.find(
    (item) => normalizeImportTaxonomyText(getLabel(item)) === normalizedSelectedLabel
  );
  const selectedDisplayLabel = selectedItem ? getLabel(selectedItem) : selectedLabel;
  const filteredItems =
    normalizedQuery.length > 0
      ? items.filter((item) =>
          normalizeImportTaxonomyText(getLabel(item)).includes(normalizedQuery)
        )
      : items;
  const hasExactMatch = items.some(
    (item) => normalizeImportTaxonomyText(getLabel(item)) === normalizedQuery
  );
  const canCreate = query.length > 0 && !hasExactMatch;
  const inputValue = isOpen ? search : selectedDisplayLabel;

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      return;
    }

    const updatePopoverPosition = () => {
      if (!inputRef.current) {
        return;
      }

      setPopoverPosition(getImportTaxonomyPopoverPosition(inputRef.current));
    };
    const onMouseDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
        setCreateError(null);
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
  }, [isOpen]);

  const openOptions = (nextSearch: string) => {
    setSearch(nextSearch);
    setCreateError(null);

    if (inputRef.current) {
      setPopoverPosition(getImportTaxonomyPopoverPosition(inputRef.current));
    }

    setIsOpen(true);
  };

  const selectItem = (item: TItem) => {
    const label = getLabel(item);

    onSelect(label);
    setSearch("");
    setCreateError(null);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const createItem = async () => {
    if (!canCreate || isCreating) {
      return;
    }

    try {
      setCreateError(null);
      await onCreate(query);
      setSearch("");
      setIsOpen(false);
      inputRef.current?.blur();
    } catch (error) {
      setCreateError(getApiErrorMessage(error));
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full min-w-0" ref={wrapperRef}>
      <div className="relative">
        {isOpen || !selectedDisplayLabel ? (
          <Search className="pointer-events-none absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9CA3AF]" />
        ) : null}
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-invalid={invalid}
          aria-label={`${itemKindLabel} 선택`}
          autoComplete="off"
          className={cn(
            "h-[30px] w-full min-w-0 border-0 bg-transparent pr-0 text-[11px] text-[#111827] outline-none placeholder:text-[#9CA3AF]",
            isOpen || !selectedDisplayLabel ? "pl-4" : "pl-0",
            disabled && "cursor-not-allowed opacity-70"
          )}
          disabled={disabled}
          onChange={(event) => {
            onSelect("");
            openOptions(event.target.value);
          }}
          onFocus={() => openOptions("")}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setSearch("");
              setCreateError(null);
              inputRef.current?.blur();
              return;
            }

            if (event.key === "Enter") {
              event.preventDefault();

              const firstItem = filteredItems[0];
              if (firstItem) {
                selectItem(firstItem);
                return;
              }

              void createItem();
            }
          }}
          placeholder={placeholder}
          value={inputValue}
        />
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
              "flex h-[30px] w-full items-center gap-1.5 px-3 text-left text-[12px] transition hover:bg-[#F9FAFB]",
              selectedDisplayLabel
                ? "font-medium text-[#475569]"
                : "font-semibold text-[#1D4ED8]"
            )}
            onClick={() => {
              onSelect("");
              setSearch("");
              setCreateError(null);
              setIsOpen(false);
            }}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {itemKindLabel} 초기화
          </button>
          <div className="max-h-[160px] overflow-y-auto border-y border-[#E6EAF0] py-1">
            {filteredItems.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                {emptyText}
              </p>
            ) : (
              filteredItems.map((item) => {
                const label = getLabel(item);
                const isSelected =
                  normalizeImportTaxonomyText(label) === normalizedSelectedLabel;

                return (
                  <button
                    className={cn(
                      "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[12px] transition hover:bg-[#F9FAFB]",
                      isSelected && "bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
                    )}
                    key={item.id}
                    onClick={() => selectItem(item)}
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
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                  </button>
                );
              })
            )}
          </div>

          {createError ? (
            <p className="px-3 py-1 text-[11px] text-[#F04452]">
              {createError}
            </p>
          ) : null}

          <button
            className="flex h-[30px] w-full items-center gap-1.5 px-3 text-left text-[12px] font-semibold text-[#4880EE] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isCreating || (query.length > 0 && !canCreate)}
            onClick={() => {
              if (!query) {
                inputRef.current?.focus();
                openOptions("");
                return;
              }

              void createItem();
            }}
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            {query ? `${query} 추가` : `새 ${itemKindLabel} 추가`}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getImportTaxonomyPopoverPosition(
  input: HTMLInputElement
): ImportTaxonomyPopoverPosition {
  const rect = input.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 16;
  const width = Math.min(256, Math.max(220, rect.width));
  const maxLeft = Math.max(margin, viewportWidth - width - margin);
  const left = Math.min(Math.max(rect.left, margin), maxLeft);

  return {
    left,
    top: rect.bottom + 4,
    width,
  };
}

function normalizeImportTaxonomyText(value: string) {
  return value.trim().toLowerCase();
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
    };
  });
}

function reorderEditableRows(
  rows: EditableImportRow[],
  sourceRowNumber: number,
  targetRowNumber: number,
  dropPosition: ImportPreviewDropPosition
): EditableImportRow[] {
  const sourceIndex = rows.findIndex((row) => row.rowNumber === sourceRowNumber);
  const targetIndex = rows.findIndex((row) => row.rowNumber === targetRowNumber);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return rows;
  }

  const sourceRow = rows[sourceIndex];

  if (!sourceRow) {
    return rows;
  }

  const rowsWithoutSource = rows.filter((_, index) => index !== sourceIndex);
  const targetIndexWithoutSource = rowsWithoutSource.findIndex(
    (row) => row.rowNumber === targetRowNumber
  );

  if (targetIndexWithoutSource === -1) {
    return rows;
  }

  const insertIndex =
    dropPosition === "before"
      ? targetIndexWithoutSource
      : targetIndexWithoutSource + 1;
  const reorderedRows = [
    ...rowsWithoutSource.slice(0, insertIndex),
    sourceRow,
    ...rowsWithoutSource.slice(insertIndex),
  ];

  return renumberEditableRows(reorderedRows);
}

function renumberEditableRows(
  rows: readonly EditableImportRow[]
): EditableImportRow[] {
  return rows.map((row, index) => ({
    ...row,
    rowNumber: IMPORT_PREVIEW_FIRST_DATA_ROW_NUMBER + index,
  }));
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

function getImportPreviewCellError(
  field: ImportTargetField,
  value: ImportFieldValue | undefined
): string | null {
  const textValue = toInputValue(value).trim();

  if (field.required && textValue.length === 0) {
    return formatRequiredImportCellMessage(field.label);
  }

  if (textValue.length === 0) {
    return null;
  }

  if (field.field === "contactEmail" && !IMPORT_EMAIL_PATTERN.test(textValue)) {
    return "담당자 이메일 형식이 올바르지 않습니다.";
  }

  if (field.field === "contactPhone" && !isImportPhoneValue(textValue)) {
    return "담당자 핸드폰 번호 형식이 올바르지 않습니다.";
  }

  if (field.kind === "number" && !isNonNegativeIntegerValue(textValue)) {
    return `${field.label}${getKoreanTopicParticle(field.label)} 0 이상의 정수여야 합니다.`;
  }

  if (
    field.kind === "enum" &&
    field.enumValues &&
    !field.enumValues.includes(textValue)
  ) {
    return `${field.label}${getKoreanTopicParticle(field.label)} ${field.enumValues.join(", ")} 중 하나여야 합니다.`;
  }

  return null;
}

function formatRequiredImportCellMessage(label: string): string {
  return `${label}${getKoreanTopicParticle(label)} 필수입니다.`;
}

function getKoreanTopicParticle(text: string): "은" | "는" {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return "은";
  }

  const lastCharCode = trimmed.charCodeAt(trimmed.length - 1);

  if (lastCharCode < 0xac00 || lastCharCode > 0xd7a3) {
    return "은";
  }

  return (lastCharCode - 0xac00) % 28 === 0 ? "는" : "은";
}

function hasEmptyEditableCell(
  targetType: ImportTargetType,
  rows: readonly EditableImportRow[]
): boolean {
  const fields = importTargetFields[targetType];

  return rows.some((row) =>
    fields.some(
      (field) =>
        field.required && toInputValue(row.data[field.field]).trim().length === 0
    )
  );
}

function hasIncompleteContactCompanyResolutions(
  summary: ContactCompanyImportSummaryData,
  resolutions: ContactCompanyResolutionState
): boolean {
  return summary.newCompanyNames.some((companyName) => {
    const resolution = resolutions[companyName];

    return (
      !resolution ||
      resolution.companyFieldName.trim().length === 0 ||
      resolution.companyRegionName.trim().length === 0
    );
  });
}

function toContactCompanyResolutionPayload(
  resolutions: ContactCompanyResolutionState
) {
  return Object.entries(resolutions)
    .map(([companyName, resolution]) => ({
      companyName: companyName.trim(),
      companyFieldName: resolution.companyFieldName.trim(),
      companyRegionName: resolution.companyRegionName.trim(),
    }))
    .filter(
      (resolution) =>
        resolution.companyName.length > 0 &&
        resolution.companyFieldName.length > 0 &&
        resolution.companyRegionName.length > 0
    );
}

function createDealContactResolutionKey(
  companyName: string,
  contactName: string
): string {
  return `${companyName.trim()}\u0000${contactName.trim()}`;
}

function parseDealContactResolutionKey(contactKey: string): {
  readonly companyName: string;
  readonly contactName: string;
} {
  const [companyName = "", contactName = ""] = contactKey.split("\u0000");

  return {
    companyName,
    contactName,
  };
}

function isDealContactResolutionComplete(
  resolution: DealContactResolutionValue | undefined
): boolean {
  if (!resolution) {
    return false;
  }

  const contactEmail = resolution.contactEmail.trim();
  const contactPhone = resolution.contactPhone.trim();

  return (
    resolution.companyName.trim().length > 0 &&
    resolution.contactName.trim().length > 0 &&
    IMPORT_EMAIL_PATTERN.test(contactEmail) &&
    isImportPhoneValue(contactPhone) &&
    resolution.contactDepartmentName.trim().length > 0 &&
    resolution.contactJobGradeName.trim().length > 0
  );
}

function isDealProductResolutionComplete(
  resolution: DealProductResolutionValue | undefined
): boolean {
  return Boolean(
    resolution &&
      isNonNegativeIntegerValue(resolution.productPrice.trim()) &&
      resolution.productCategoryName.trim().length > 0 &&
      resolution.productStatusName.trim().length > 0
  );
}

function hasIncompleteDealResourceResolutions(
  summary: DealImportSummaryData,
  companyResolutions: DealCompanyResolutionState,
  contactResolutions: DealContactResolutionState,
  productResolutions: DealProductResolutionState
): boolean {
  return (
    summary.newCompanyNames.some(
      (companyName) =>
        !isContactCompanyResolutionComplete(companyResolutions[companyName])
    ) ||
    summary.newContactKeys.some(
      (contactKey) =>
        !isDealContactResolutionComplete(contactResolutions[contactKey])
    ) ||
    summary.newProductNames.some(
      (productName) =>
        !isDealProductResolutionComplete(productResolutions[productName])
    )
  );
}

function toDealCompanyResolutionPayload(
  resolutions: DealCompanyResolutionState
) {
  return toContactCompanyResolutionPayload(resolutions);
}

function toDealContactResolutionPayload(
  resolutions: DealContactResolutionState
) {
  return Object.values(resolutions)
    .filter((resolution) => isDealContactResolutionComplete(resolution))
    .map((resolution) => ({
      companyName: resolution.companyName.trim(),
      contactName: resolution.contactName.trim(),
      contactEmail: resolution.contactEmail.trim(),
      contactPhone: resolution.contactPhone.trim(),
      contactDepartmentName: resolution.contactDepartmentName.trim(),
      contactJobGradeName: resolution.contactJobGradeName.trim(),
    }));
}

function toDealProductResolutionPayload(
  resolutions: DealProductResolutionState
) {
  return Object.entries(resolutions)
    .filter(([, resolution]) => isDealProductResolutionComplete(resolution))
    .map(([productName, resolution]) => ({
      productName: productName.trim(),
      productPrice: Number(resolution.productPrice.trim().replaceAll(",", "")),
      productCategoryName: resolution.productCategoryName.trim(),
      productStatusName: resolution.productStatusName.trim(),
    }));
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
      const cellError = getImportPreviewCellError(field, row.data[field.field]);

      if (cellError) {
        return `${row.rowNumber}행의 ${cellError}`;
      }
    }
  }

  return null;
}

function createContactCompanyImportSummary(
  rows: readonly EditableImportRow[],
  companyOptions: readonly ContactCompanyOption[]
): ContactCompanyImportSummaryData {
  const existingCompanyNames = new Set(
    companyOptions
      .map((company) => company.companyName.trim())
      .filter((companyName) => companyName.length > 0)
  );
  const importedCompanyNames = [
    ...new Set(
      rows
        .map((row) => toInputValue(row.data.companyName).trim())
        .filter((companyName) => companyName.length > 0)
    ),
  ];
  const importedCompanyContactCounts = rows.reduce<Record<string, number>>(
    (counts, row) => {
      const companyName = toInputValue(row.data.companyName).trim();

      if (companyName.length === 0) {
        return counts;
      }

      return {
        ...counts,
        [companyName]: (counts[companyName] ?? 0) + 1,
      };
    },
    {}
  );
  const matchedCompanyCount = importedCompanyNames.filter((companyName) =>
    existingCompanyNames.has(companyName)
  ).length;
  const newCompanyNames = importedCompanyNames.filter(
    (companyName) => !existingCompanyNames.has(companyName)
  );

  return {
    totalCompanyCount: importedCompanyNames.length,
    matchedCompanyCount,
    newCompanyCount: newCompanyNames.length,
    newCompanyContactCounts: Object.fromEntries(
      newCompanyNames.map((companyName) => [
        companyName,
        importedCompanyContactCounts[companyName] ?? 0,
      ])
    ),
    newCompanyNames,
  };
}

function createDealImportSummary(
  rows: readonly EditableImportRow[],
  companyOptions: readonly DealCompanyOption[],
  contactOptions: readonly DealContactOption[],
  productOptions: readonly DealProductOption[]
): DealImportSummaryData {
  const existingCompanyNames = new Set(
    companyOptions
      .map((company) => company.companyName.trim())
      .filter((companyName) => companyName.length > 0)
  );
  const existingContactKeys = new Set(
    contactOptions
      .map((contact) =>
        createDealContactResolutionKey(
          contact.company.companyName,
          contact.username
        )
      )
      .filter((contactKey) => contactKey.length > 1)
  );
  const existingProductNames = new Set(
    productOptions
      .map((product) => product.productName.trim())
      .filter((productName) => productName.length > 0)
  );
  const importedCompanyNames = [
    ...new Set(
      rows
        .map((row) => toInputValue(row.data.companyName).trim())
        .filter((companyName) => companyName.length > 0)
    ),
  ];
  const importedContactEntries = new Map<
    string,
    {
      readonly companyName: string;
      readonly contactName: string;
    }
  >();
  const importedProductNames = [
    ...new Set(
      rows
        .map((row) => toInputValue(row.data.productName).trim())
        .filter((productName) => productName.length > 0)
    ),
  ];

  for (const row of rows) {
    const companyName = toInputValue(row.data.companyName).trim();
    const contactName = toInputValue(row.data.contactName).trim();

    if (companyName.length === 0 || contactName.length === 0) {
      continue;
    }

    const contactKey = createDealContactResolutionKey(companyName, contactName);

    if (!importedContactEntries.has(contactKey)) {
      importedContactEntries.set(contactKey, {
        companyName,
        contactName,
      });
    }
  }

  const newCompanyNames = importedCompanyNames.filter(
    (companyName) => !existingCompanyNames.has(companyName)
  );
  const newContactEntries = [...importedContactEntries.entries()].filter(
    ([contactKey]) => !existingContactKeys.has(contactKey)
  );
  const newProductNames = importedProductNames.filter(
    (productName) => !existingProductNames.has(productName)
  );

  return {
    newCompanyNames,
    newContactKeys: newContactEntries.map(([contactKey]) => contactKey),
    newProductNames,
    contactLabels: Object.fromEntries(
      newContactEntries.map(([contactKey, contact]) => [
        contactKey,
        `${contact.companyName} / ${contact.contactName}`,
      ])
    ),
    contactCompanyNames: Object.fromEntries(
      newContactEntries.map(([contactKey, contact]) => [
        contactKey,
        contact.companyName,
      ])
    ),
    contactNames: Object.fromEntries(
      newContactEntries.map(([contactKey, contact]) => [
        contactKey,
        contact.contactName,
      ])
    ),
    newCompanyCount: newCompanyNames.length,
    newContactCount: newContactEntries.length,
    newProductCount: newProductNames.length,
  };
}

function isImportPhoneValue(value: string): boolean {
  if (IMPORT_MOBILE_PATTERN.test(value)) {
    return true;
  }

  return IMPORT_MOBILE_DIGIT_PATTERN.test(value.replace(/\D/g, ""));
}

function isNonNegativeIntegerValue(value: string): boolean {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return false;
  }

  const numberValue = Number(normalized.replaceAll(",", ""));
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
