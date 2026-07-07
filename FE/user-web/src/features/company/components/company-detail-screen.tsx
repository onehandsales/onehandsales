import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  Plus,
  Pencil,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { SummaryTaxonomySelect } from "@/components/ui/summary-taxonomy-select";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { CompanyEditDialog } from "@/features/company/components/company-edit-dialog";
import {
  useCompanyContacts,
  useCompanyDeals,
  useCompanyDetail,
  useCompanyMemoLogs,
  useCompanyPrivateMemoLogs,
} from "@/features/company/hooks/use-company-detail";
import {
  useDeleteCompanyMutation,
  useDeleteCompanyMemoLogMutation,
  useDeleteCompanyPrivateMemoLogMutation,
  useUpdateCompanyMutation,
  useCreateCompanyMemoLogMutation,
  useUpdateCompanyMemoLogMutation,
  useCreateCompanyPrivateMemoLogMutation,
  useUpdateCompanyPrivateMemoLogMutation,
} from "@/features/company/hooks/use-company-mutations";
import {
  useCompanyFields,
  useCompanyRegions,
} from "@/features/company/hooks/use-company-list";
import type {
  CompanyDetail,
  CompanyContact,
  CompanyDeal,
  CompanyField,
  CompanyMemoLog,
  CompanyPrivateMemoLog,
  CompanyRegion,
} from "@/features/company/types/company";
import {
  companyEditFormSchema,
  toCreateCompanyMemoLogInput,
  toUpdateCompanyMemoLogInput,
  toCreateCompanyPrivateMemoLogInput,
  toUpdateCompanyPrivateMemoLogInput,
  toCompanyEditFormValues,
  toUpdateCompanyInput,
  companyMemoLogFormSchema,
  companyPrivateMemoLogFormSchema,
  emptyCompanyMemoLogFormValues,
  emptyCompanyPrivateMemoLogFormValues,
  type CompanyEditFormValues,
  type CompanyMemoLogFormValues,
  type CompanyPrivateMemoLogFormValues,
} from "@/features/company/schemas/company-schema";
import { PageHeader } from "@/components/layout/page-header";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/utils/format";
import {
  LOG_DELETE_CONFIRM_MESSAGE,
  LOG_DELETE_SUCCESS_DESCRIPTION,
  LOG_DELETE_SUCCESS_MESSAGE,
} from "@/utils/log-delete-feedback";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type CompanyDetailScreenProps = {
  readonly companyId: string;
};

export function CompanyDetailScreen({ companyId }: CompanyDetailScreenProps) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeDescription, setNoticeDescription] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const companyQuery = useCompanyDetail(companyId);
  const contactsQuery = useCompanyContacts(companyId);
  const dealsQuery = useCompanyDeals(companyId);
  const fieldsQuery = useCompanyFields();
  const regionsQuery = useCompanyRegions();
  const memoLogsQuery = useCompanyMemoLogs(companyId);
  const privateMemoLogsQuery = useCompanyPrivateMemoLogs(companyId);
  const deleteCompanyMutation = useDeleteCompanyMutation();

  const company = companyQuery.data;
  const fields = useMemo(
    () =>
      company
        ? mergeCompanyField(fieldsQuery.data?.items ?? [], company.companyField)
        : (fieldsQuery.data?.items ?? []),
    [company, fieldsQuery.data?.items]
  );
  const regions = useMemo(
    () =>
      company
        ? mergeCompanyRegion(regionsQuery.data?.items ?? [], company.companyRegion)
        : (regionsQuery.data?.items ?? []),
    [company, regionsQuery.data?.items]
  );
  const memoLogs = memoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const privateMemoLogs = privateMemoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (companyQuery.isLoading) return <CompanyDetailSkeleton />;
  if (companyQuery.isError) {
    return (
      <CompanyDetailError
        error={companyQuery.error}
        onRetry={() => void companyQuery.refetch()}
      />
    );
  }
  if (!company) return <CompanyDetailSkeleton />;

  const contacts = contactsQuery.data?.items ?? [];
  const deals = dealsQuery.data?.items ?? [];

  const showNotice = (message: string, description?: string) => {
    setNotice(message);
    setNoticeDescription(description ?? null);
  };

  const clearNotice = () => {
    setNotice(null);
    setNoticeDescription(null);
  };

  const onDeleteCompany = async () => {
    setActionError(null);
    try {
      await deleteCompanyMutation.mutateAsync(company.id);
      setDeleteConfirmOpen(false);
      void navigate("/app/companies", {
        replace: true,
        state: {
          notice: LOG_DELETE_SUCCESS_MESSAGE,
          noticeDescription: LOG_DELETE_SUCCESS_DESCRIPTION,
        },
      });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const logoLetter = company.companyName.charAt(0);

  return (
    <>
      {/* ── Mobile ──────────────────────────────────────────── */}
      <div className="md:hidden min-h-screen bg-white">
        {notice ? (
          <div className="px-4 pt-3">
            <Toast
              description={noticeDescription ?? undefined}
              message={notice}
              onClose={clearNotice}
              variant="success"
            />
          </div>
        ) : null}
        {actionError ? (
          <div className="px-4 pt-3">
            <Toast message={actionError} onClose={() => setActionError(null)} variant="error" />
          </div>
        ) : null}

        {/* TopBar */}
        <div className="flex h-16 items-center gap-3 bg-transparent px-6">
          <Link to="/app/companies">
            <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
          </Link>
          <div className="flex flex-1 items-center gap-1.5 text-[13px]">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <span className="font-medium text-[#6B7280]">회사</span>
            <span className="text-[#9CA3AF]">/</span>
            <span className="font-bold text-[#111827]">{company.companyName}</span>
          </div>
          <button
            aria-label="수정"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            onClick={() => setIsEditOpen(true)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
            disabled={deleteCompanyMutation.isPending}
            onClick={() => setDeleteConfirmOpen(true)}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 pb-24 pt-0">
          <CompanySummaryHeader
            company={company}
            contactCount={contacts.length}
            dealCount={deals.length}
            fields={fields}
            isEditing={false}
            logoLetter={logoLetter}
            regions={regions}
            onCancelEdit={() => setIsEditOpen(false)}
            onSaved={() => {
              void companyQuery.refetch();
            showNotice("회사 정보를 저장했어요.");
              setIsEditOpen(false);
            }}
          />

          <ConnectedContactsTable contacts={contacts} isLoading={contactsQuery.isLoading} />
          <ConnectedDealsTable deals={deals} isLoading={dealsQuery.isLoading} />
          <MemoPanel
            companyId={companyId}
            memoLogs={memoLogs}
            isLoading={memoLogsQuery.isLoading}
            hasNext={Boolean(memoLogsQuery.hasNextPage)}
            isFetchingNext={memoLogsQuery.isFetchingNextPage}
            onFetchMore={() => void memoLogsQuery.fetchNextPage()}
            onChanged={showNotice}
          />
        </div>
      </div>

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex h-full flex-col bg-white">
        {notice ? (
          <div className="mx-6 mt-3">
            <Toast
              description={noticeDescription ?? undefined}
              message={notice}
              onClose={clearNotice}
              variant="success"
            />
          </div>
        ) : null}
        {actionError ? (
          <div className="mx-6 mt-3">
            <Toast message={actionError} onClose={() => setActionError(null)} variant="error" />
          </div>
        ) : null}

        {/* TopBar */}
        <div className="flex h-16 shrink-0 items-center gap-3 bg-transparent px-6">
          <Link to="/app/companies">
            <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
          </Link>
          <div className="flex flex-1 items-center gap-1.5 text-[13px]">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <span className="font-medium text-[#6B7280]">회사</span>
            <span className="text-[#9CA3AF]">/</span>
            <span className="font-bold text-[#111827]">{company.companyName}</span>
          </div>
          <button
            aria-label="수정"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            onClick={() => setIsEditOpen(true)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
            disabled={deleteCompanyMutation.isPending}
            onClick={() => setDeleteConfirmOpen(true)}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6 pt-0">
          <CompanySummaryHeader
            company={company}
            contactCount={contacts.length}
            dealCount={deals.length}
            fields={fields}
            isEditing={false}
            logoLetter={logoLetter}
            regions={regions}
            onCancelEdit={() => setIsEditOpen(false)}
            onSaved={() => {
              void companyQuery.refetch();
              showNotice("회사 정보를 저장했어요.");
              setIsEditOpen(false);
            }}
          />

          {/* 1행: 연결담당자 + 연결딜 */}
          <div className="grid grid-cols-2 gap-4">
            <ConnectedContactsTable contacts={contacts} isLoading={contactsQuery.isLoading} />
            <ConnectedDealsTable deals={deals} isLoading={dealsQuery.isLoading} />
          </div>

          {/* 2행: 회사 로그 + 비밀 메모 */}
          <div className="grid grid-cols-2 gap-4">
            <MemoPanel
              companyId={companyId}
              memoLogs={memoLogs}
              isLoading={memoLogsQuery.isLoading}
              hasNext={Boolean(memoLogsQuery.hasNextPage)}
              isFetchingNext={memoLogsQuery.isFetchingNextPage}
              onFetchMore={() => void memoLogsQuery.fetchNextPage()}
              onChanged={showNotice}
            />
            <ActivityLogPanel
              companyId={companyId}
              privateMemoLogs={privateMemoLogs}
              isLoading={privateMemoLogsQuery.isLoading}
              hasNext={Boolean(privateMemoLogsQuery.hasNextPage)}
              isFetchingNext={privateMemoLogsQuery.isFetchingNextPage}
              onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
              onChanged={showNotice}
            />
          </div>
        </div>
      </div>
      <ConfirmDialog
        cancelLabel="아니요"
        confirmLabel="예"
        errorMessage={actionError}
        isPending={deleteCompanyMutation.isPending}
        open={deleteConfirmOpen}
        title={LOG_DELETE_CONFIRM_MESSAGE}
        onCancel={() => {
          if (!deleteCompanyMutation.isPending) {
            setActionError(null);
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={() => void onDeleteCompany()}
      />
      <CompanyEditDialog
        company={company}
        fields={fields}
        open={isEditOpen}
        regions={regions}
        onOpenChange={setIsEditOpen}
        onSaved={() => {
          void companyQuery.refetch();
          showNotice("회사 정보를 저장했어요.");
        }}
      />
    </>
  );
}

// ── Company Summary Header ──────────────────────────────────────────

function CompanySummaryHeader({
  company,
  logoLetter,
  contactCount,
  dealCount,
  fields,
  regions,
  isEditing,
  onCancelEdit,
  onSaved,
}: {
  readonly company: CompanyDetail;
  readonly logoLetter: string;
  readonly contactCount: number;
  readonly dealCount: number;
  readonly fields: CompanyField[];
  readonly regions: CompanyRegion[];
  readonly isEditing: boolean;
  readonly onCancelEdit: () => void;
  readonly onSaved: () => void;
}) {
  const updateCompanyMutation = useUpdateCompanyMutation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyEditFormValues>({
    resolver: zodResolver(companyEditFormSchema),
    defaultValues: toCompanyEditFormValues(company),
  });
  const selectedFieldId = watch("companyFieldId");
  const selectedRegionId = watch("companyRegionId");

  useEffect(() => {
    if (isEditing) {
      reset(toCompanyEditFormValues(company));
    }
  }, [company, isEditing, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateCompanyMutation.mutateAsync(
      toUpdateCompanyInput(company.id, values)
    );
    onSaved();
  });

  if (isEditing) {
    return (
      <form
        className="flex min-h-[74px] flex-wrap items-center gap-3 rounded-xl border border-[#BFDBFE] bg-white px-5 py-4 shadow-[0_0_0_1px_rgba(72,128,238,0.04)] md:flex-nowrap"
        onSubmit={onSubmit}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
          <span className="text-[16px] font-extrabold text-[#4F46E5]">{logoLetter}</span>
        </div>

        <div className="relative min-w-[160px] flex-[1_1_220px] md:max-w-[240px] md:flex-none">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          <label className="sr-only" htmlFor="company-summary-edit-name">
            회사명
          </label>
          <input
            aria-invalid={Boolean(errors.companyName)}
            className="h-9 w-full rounded-lg border border-[#DDE3EE] bg-white pl-8 pr-3 text-[15px] font-extrabold text-[#111827] outline-none transition-colors focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
            id="company-summary-edit-name"
            {...register("companyName")}
          />
        </div>

        <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] md:block" />

        <input type="hidden" {...register("companyFieldId")} />
        <SummaryTaxonomySelect
          emptyText="조건을 바꾸면 분야를 찾을 수 있어요."
          getLabel={(field) => field.field}
          id="company-summary-edit-field"
          invalid={Boolean(errors.companyFieldId)}
          itemKindLabel="분야"
          items={fields}
          selectedId={selectedFieldId}
          tone="amber"
          widthClassName="w-[clamp(136px,14vw,178px)]"
          onSelect={(id) =>
            setValue("companyFieldId", id, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <input type="hidden" {...register("companyRegionId")} />
        <SummaryTaxonomySelect
          emptyText="조건을 바꾸면 지역을 찾을 수 있어요."
          getLabel={(region) => region.region}
          id="company-summary-edit-region"
          invalid={Boolean(errors.companyRegionId)}
          itemKindLabel="지역"
          items={regions}
          selectedId={selectedRegionId}
          tone="green"
          widthClassName="w-[clamp(150px,16vw,210px)]"
          onSelect={(id) =>
            setValue("companyRegionId", id, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] lg:block" />
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="font-semibold text-[#9CA3AF]">담당자</span>
          <span className="font-extrabold text-[#111827]">{contactCount}명</span>
        </div>
        <div className="flex items-center gap-1.5 text-[13px]">
          <span className="font-semibold text-[#9CA3AF]">딜</span>
          <span className="font-extrabold text-[#111827]">{dealCount}건</span>
        </div>

        <div className="flex-1" />

        {updateCompanyMutation.error ? (
          <span className="basis-full text-[12px] font-semibold text-[#B91C1C] md:basis-auto">
            {getApiErrorMessage(updateCompanyMutation.error)}
          </span>
        ) : null}

        <button
          className="h-9 rounded-lg border border-[#DDE3EE] bg-white px-3 text-[13px] font-semibold text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
          onClick={onCancelEdit}
          type="button"
        >
              닫기
        </button>
        <button
          className="h-9 rounded-lg bg-[#4880EE] px-4 text-[13px] font-extrabold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={updateCompanyMutation.isPending}
          type="submit"
        >
          {updateCompanyMutation.isPending ? "저장 중" : "저장"}
        </button>
      </form>
    );
  }

  return (
    <div className="flex min-h-[74px] items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
        <span className="text-[16px] font-extrabold text-[#4F46E5]">{logoLetter}</span>
      </div>
      <span className="shrink-0 text-[20px] font-extrabold leading-none text-[#111827]">
        {company.companyName}
      </span>
      <div className="h-5 w-px shrink-0 bg-[#E5E7EB]" />
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">분야</span>
        <span className="font-extrabold text-[#111827]">{company.companyField.field}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">지역</span>
        <span className="font-extrabold text-[#111827]">{company.companyRegion.region}</span>
      </div>
      <div className="h-5 w-px shrink-0 bg-[#E5E7EB]" />
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">담당자</span>
        <span className="font-extrabold text-[#111827]">{contactCount}명</span>
      </div>
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">딜</span>
        <span className="font-extrabold text-[#111827]">{dealCount}건</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4 text-[12px] text-[#9CA3AF]">
        <span>등록 {formatDateTime(company.createdAt, { includeYear: true })}</span>
        <span>수정 {formatDateTime(company.updatedAt, { includeYear: true })}</span>
      </div>
    </div>
  );
}

// ── Connected Contacts Table ────────────────────────────────────────

function ConnectedContactsTable({
  contacts,
  isLoading,
}: {
  readonly contacts: CompanyContact[];
  readonly isLoading: boolean;
}) {
  const SHOW_LIMIT = 2;
  const hasMore = contacts.length > SHOW_LIMIT;

  return (
    <div className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[48px] shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
        <span className="text-[14px] font-extrabold text-[#111827]">연결 담당자</span>
        <span className="text-[13px] font-semibold text-[#9CA3AF]">{contacts.length}</span>
        <div className="flex-1" />
      </div>

      {isLoading ? (
        <div className="flex flex-col">
          {[1, 2, 3].map((i) => (
            <div className="h-[58px] animate-pulse border-b border-[#F3F4F6] bg-white/60" key={i} />
          ))}
        </div>
      ) : contacts.length === 0 ? (
          <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">담당자를 연결하면 여기에서 볼 수 있어요.</p>
      ) : (
        <div className={hasMore ? "max-h-[116px] overflow-y-auto" : ""}>
          {contacts.map((contact) => {
            const jobGradeName = contact.contactJobGrade?.jobGradeName;

            return (
              <Link
                className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 hover:bg-[#F9FAFB] transition-colors last:border-0"
                key={contact.id}
                to={`/app/contacts/${contact.id}`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE]">
                  <UserRound className="h-3.5 w-3.5 text-[#4880EE]" />
                </div>
                <div className="grid min-w-0 flex-1 grid-cols-[minmax(132px,1fr)_minmax(160px,1.1fr)_120px] items-center gap-3 whitespace-nowrap text-[12px] font-medium text-[#6B7280] max-sm:grid-cols-[minmax(0,1fr)_112px] max-sm:grid-rows-2">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[13px] font-extrabold text-[#111827]">
                        {contact.username}
                      </span>
                      {jobGradeName ? (
                        <span className="shrink-0 text-[13px] font-extrabold text-[#111827]">
                          {jobGradeName}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block min-w-0 truncate text-[11px] font-semibold leading-4 text-[#9CA3AF]">
                      {contact.contactDepartment.departmentName}
                    </span>
                  </div>
                  <span className="min-w-0 truncate max-sm:col-start-1 max-sm:row-start-2">
                    {contact.email}
                  </span>
                  <span className="min-w-0 truncate text-right text-[#374151] max-sm:col-start-2 max-sm:row-span-2 max-sm:row-start-1">
                    {contact.mobile}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Connected Deals Table ───────────────────────────────────────────

function ConnectedDealsTable({
  deals,
  isLoading,
}: {
  readonly deals: CompanyDeal[];
  readonly isLoading: boolean;
}) {
  const SHOW_LIMIT = 2;
  const hasMore = deals.length > SHOW_LIMIT;

  return (
    <div className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[48px] shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
        <span className="text-[14px] font-extrabold text-[#111827]">연결 딜</span>
        <span className="text-[13px] font-semibold text-[#9CA3AF]">{deals.length}</span>
        <div className="flex-1" />
      </div>

      {isLoading ? (
        <div className="flex flex-col">
          {[1, 2, 3].map((i) => (
            <div className="h-[58px] animate-pulse border-b border-[#F3F4F6] bg-white/60" key={i} />
          ))}
        </div>
      ) : deals.length === 0 ? (
          <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">딜을 연결하면 여기에서 볼 수 있어요.</p>
      ) : (
        <div className={hasMore ? "max-h-[116px] overflow-y-auto" : ""}>
          {deals.map((deal) => (
            <Link
              className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 hover:bg-[#F9FAFB] transition-colors last:border-0"
              key={deal.id}
              to={`/app/deals/${deal.id}`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2]">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-[#DC2626]" />
              </div>
              <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-[#111827]">
                {deal.dealName}
              </span>
              <span className="shrink-0 text-[13px] font-semibold text-[#374151]">
                ₩{deal.dealCost.toLocaleString("ko-KR")}
              </span>
              <span className="ml-3 shrink-0 text-[12px] text-[#9CA3AF]">
                {formatDate(deal.createdAt, { includeYear: true })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Memo Panel ──────────────────────────────────────────────────────

function TimelineMarker({
  isFirst,
  isLast,
}: {
  readonly isFirst: boolean;
  readonly isLast: boolean;
}) {
  return (
    <div className="relative flex w-[8px] shrink-0 self-stretch items-start justify-center pt-[16px]">
      {!isFirst ? (
        <div className="absolute left-1/2 top-0 h-[20px] w-px -translate-x-1/2 bg-[#DBEAFE]" />
      ) : null}
      {!isLast ? (
        <div className="absolute bottom-0 left-1/2 top-[20px] w-px -translate-x-1/2 bg-[#DBEAFE]" />
      ) : null}
      <div className="relative h-[8px] w-[8px] rounded-full bg-[#4880EE]" />
    </div>
  );
}

function MemoPanel({
  companyId,
  memoLogs,
  isLoading,
  hasNext,
  isFetchingNext,
  onFetchMore,
  onChanged,
}: {
  readonly companyId: string;
  readonly memoLogs: CompanyMemoLog[];
  readonly isLoading: boolean;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly onFetchMore: () => void;
  readonly onChanged: (notice: string, description?: string) => void;
}) {
  const createMemoMutation = useCreateCompanyMemoLogMutation();
  const updateMemoMutation = useUpdateCompanyMemoLogMutation();
  const deleteMemoMutation = useDeleteCompanyMemoLogMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingLog, setDeletingLog] = useState<CompanyMemoLog | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const createForm = useForm<CompanyMemoLogFormValues>({
    resolver: zodResolver(companyMemoLogFormSchema),
    defaultValues: emptyCompanyMemoLogFormValues,
  });

  const editForm = useForm<CompanyMemoLogFormValues>({
    resolver: zodResolver(companyMemoLogFormSchema),
    defaultValues: emptyCompanyMemoLogFormValues,
  });

  const onSubmitCreate = createForm.handleSubmit(async (values) => {
    await createMemoMutation.mutateAsync(toCreateCompanyMemoLogInput(companyId, values));
    createForm.reset(emptyCompanyMemoLogFormValues);
    setIsCreateOpen(false);
    onChanged("회사 로그를 추가했어요.");
  });

  const onStartEdit = (log: CompanyMemoLog) => {
    setEditingId(log.id);
    editForm.reset({ memoType: log.memoType, memo: log.memo });
  };

  const onSubmitEdit = editForm.handleSubmit(async (values) => {
    if (!editingId) return;
    await updateMemoMutation.mutateAsync(
      toUpdateCompanyMemoLogInput(companyId, editingId, values)
    );
    setEditingId(null);
    onChanged("회사 로그를 수정했어요.");
  });

  const onConfirmDelete = async () => {
    if (!deletingLog) return;
    setDeleteError(null);
    try {
      await deleteMemoMutation.mutateAsync({
        companyId,
        memoLogId: deletingLog.id,
      });
      if (editingId === deletingLog.id) {
        setEditingId(null);
      }
      if (expandedId === deletingLog.id) {
        setExpandedId(null);
      }
      setDeletingLog(null);
      onChanged(LOG_DELETE_SUCCESS_MESSAGE, LOG_DELETE_SUCCESS_DESCRIPTION);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    }
  };

  const createFormId = "company-log-create-form";
  const editFormId = "company-log-edit-form";

  return (
    <>
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">회사 로그</span>
        <div className="flex-1" />
        <button
          aria-label="회사 로그 추가"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4880EE] text-white transition-colors hover:bg-[#1D4ED8]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Memo List */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-2">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div className="h-16 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
            ))}
          </div>
        ) : memoLogs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">회사 로그를 추가하면 여기에서 볼 수 있어요.</p>
        ) : (
          memoLogs.map((log, index) => (
              <div
                className="group flex gap-3"
                key={log.id}
              >
                {/* 제목 행 — 클릭 시 본문 토글 */}
                <TimelineMarker
                  isFirst={index === 0}
                  isLast={index === memoLogs.length - 1}
                />
                <div className="min-w-0 flex-1">
                <button
                  className="flex min-h-[40px] w-full items-center bg-white text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <span className="flex-1 truncate text-[13px] font-semibold text-[#111827]">
                    {log.memoType || "제목 없음"}
                  </span>
                  <span className="shrink-0 text-[11px] font-bold text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <div
                    className="invisible ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded group-hover:visible"
                    onClick={(e) => { e.stopPropagation(); onStartEdit(log); }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onStartEdit(log); } }}
                  >
                    <Pencil className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                  <div
                    aria-label="삭제"
                    className="invisible ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#DC2626] hover:bg-[#FEE2E2] group-hover:visible"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteError(null);
                      setDeletingLog(log);
                    }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setDeleteError(null); setDeletingLog(log); } }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </div>
                </button>
                {/* 본문 — 펼쳐진 경우만 표시 */}
                {expandedId === log.id ? (
                  <p className="pb-3 pt-1 text-[13px] font-medium leading-[1.35] text-[#374151] whitespace-pre-wrap">
                    {log.memo}
                  </p>
                ) : null}
                </div>
              </div>
            )
          )
        )}
        {hasNext ? (
          <button
            className="text-[12px] font-semibold text-[#6B7280] hover:text-[#374151] transition-colors"
            disabled={isFetchingNext}
            onClick={onFetchMore}
            type="button"
          >
            {isFetchingNext ? "불러오는 중..." : "더 보기"}
          </button>
        ) : null}
      </div>
    </div>
    <ModalShell
      footer={
        <ModalFooterActions
          formId={createFormId}
          isSubmitting={createMemoMutation.isPending}
          pendingLabel="추가 중"
          submitLabel="추가"
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={() => void onSubmitCreate()}
        />
      }
      open={isCreateOpen}
      size="md"
      title="회사 로그 추가"
      onOpenChange={setIsCreateOpen}
    >
      <ModalForm id={createFormId} onSubmit={onSubmitCreate}>
        <ModalFormSection title="회사 로그">
          <ModalFieldGroup
            error={createForm.formState.errors.memoType?.message}
            id="company-log-create-title"
            label="제목"
          >
            <input
              className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-log-create-title"
              placeholder="회사 로그 제목"
              {...createForm.register("memoType")}
            />
          </ModalFieldGroup>
          <ModalFieldGroup
            error={createForm.formState.errors.memo?.message}
            id="company-log-create-memo"
            label="내용"
          >
            <textarea
              className="min-h-28 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-log-create-memo"
              placeholder="내용 입력"
              rows={4}
              {...createForm.register("memo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>
        {createMemoMutation.error ? (
          <p className="text-xs text-[#B91C1C]">
            {getApiErrorMessage(createMemoMutation.error)}
          </p>
        ) : null}
      </ModalForm>
    </ModalShell>
    <ModalShell
      footer={
        <ModalFooterActions
          formId={editFormId}
          isSubmitting={updateMemoMutation.isPending}
          pendingLabel="저장 중..."
          submitLabel="저장"
          onCancel={() => setEditingId(null)}
        />
      }
      open={editingId !== null}
      size="md"
      title="회사 로그 수정"
      onOpenChange={(open) => {
        if (!open) setEditingId(null);
      }}
    >
      <ModalForm id={editFormId} onSubmit={onSubmitEdit}>
        <ModalFormSection title="회사 로그">
          <ModalFieldGroup
            error={editForm.formState.errors.memoType?.message}
            id="company-log-edit-title"
            label="제목"
          >
            <input
              className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-log-edit-title"
              placeholder="회사 로그 제목"
              {...editForm.register("memoType")}
            />
          </ModalFieldGroup>
          <ModalFieldGroup
            error={editForm.formState.errors.memo?.message}
            id="company-log-edit-memo"
            label="내용"
          >
            <textarea
              className="min-h-28 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-log-edit-memo"
              placeholder="내용 입력"
              rows={4}
              {...editForm.register("memo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>
        {updateMemoMutation.error ? (
          <p className="text-xs text-[#B91C1C]">
            {getApiErrorMessage(updateMemoMutation.error)}
          </p>
        ) : null}
      </ModalForm>
    </ModalShell>
    <ConfirmDialog
      cancelLabel="아니요"
      confirmLabel="예"
      errorMessage={deleteError}
      isPending={deleteMemoMutation.isPending}
      open={deletingLog !== null}
      title={LOG_DELETE_CONFIRM_MESSAGE}
      onCancel={() => {
        if (!deleteMemoMutation.isPending) {
          setDeleteError(null);
          setDeletingLog(null);
        }
      }}
      onConfirm={() => void onConfirmDelete()}
    />
    </>
  );
}

// ── Activity Log Panel ──────────────────────────────────────────────

function ActivityLogPanel({
  companyId,
  privateMemoLogs,
  isLoading,
  hasNext,
  isFetchingNext,
  onFetchMore,
  onChanged,
}: {
  readonly companyId: string;
  readonly privateMemoLogs: CompanyPrivateMemoLog[];
  readonly isLoading: boolean;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly onFetchMore: () => void;
  readonly onChanged: (notice: string, description?: string) => void;
}) {
  const createMutation = useCreateCompanyPrivateMemoLogMutation();
  const updateMutation = useUpdateCompanyPrivateMemoLogMutation();
  const deleteMutation = useDeleteCompanyPrivateMemoLogMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingLog, setDeletingLog] = useState<CompanyPrivateMemoLog | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const createForm = useForm<CompanyPrivateMemoLogFormValues>({
    resolver: zodResolver(companyPrivateMemoLogFormSchema),
    defaultValues: emptyCompanyPrivateMemoLogFormValues,
  });

  const editForm = useForm<CompanyPrivateMemoLogFormValues>({
    resolver: zodResolver(companyPrivateMemoLogFormSchema),
    defaultValues: emptyCompanyPrivateMemoLogFormValues,
  });

  const onSubmitCreate = createForm.handleSubmit(async (values) => {
    await createMutation.mutateAsync(
      toCreateCompanyPrivateMemoLogInput(companyId, values)
    );
    createForm.reset(emptyCompanyPrivateMemoLogFormValues);
    setIsCreateOpen(false);
    onChanged("비밀 메모를 추가했어요.");
  });

  const onStartEdit = (log: CompanyPrivateMemoLog) => {
    setEditingId(log.id);
    editForm.reset({ memo: log.memo });
  };

  const onSubmitEdit = editForm.handleSubmit(async (values) => {
    if (!editingId) return;
    await updateMutation.mutateAsync(
      toUpdateCompanyPrivateMemoLogInput(companyId, editingId, values)
    );
    setEditingId(null);
    onChanged("비밀 메모를 수정했어요.");
  });

  const onConfirmDelete = async () => {
    if (!deletingLog) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync({
        companyId,
        privateMemoLogId: deletingLog.id,
      });
      if (editingId === deletingLog.id) {
        setEditingId(null);
      }
      if (expandedId === deletingLog.id) {
        setExpandedId(null);
      }
      setDeletingLog(null);
      onChanged(LOG_DELETE_SUCCESS_MESSAGE, LOG_DELETE_SUCCESS_DESCRIPTION);
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    }
  };

  const createFormId = "company-private-memo-create-form";
  const editFormId = "company-private-memo-edit-form";

  return (
    <>
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">비밀 메모</span>
        <div
          aria-label="암호화 보안 메모"
          className="flex items-center gap-1.5"
          title="암호화 보안 메모"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DBEAFE]">
            <ShieldCheck className="h-4 w-4 text-[#1D4ED8]" />
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DBEAFE]">
            <LockKeyhole className="h-4 w-4 text-[#1D4ED8]" />
          </span>
        </div>
        <div className="flex-1" />
        <button
          aria-label="비밀 메모 추가"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4880EE] text-white transition-colors hover:bg-[#1D4ED8]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Items */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-2">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div className="h-12 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
            ))}
          </div>
        ) : privateMemoLogs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">비밀 메모를 추가하면 여기에서 볼 수 있어요.</p>
        ) : (
          privateMemoLogs.map((log, index) => (
              <div
                className="group flex gap-3"
                key={log.id}
              >
                {/* 1줄 미리보기 행 — 클릭 시 전체 토글 */}
                <TimelineMarker
                  isFirst={index === 0}
                  isLast={index === privateMemoLogs.length - 1}
                />
                <div className="min-w-0 flex-1">
                <button
                  className="flex min-h-[40px] w-full items-center bg-white text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <span className="flex-1 truncate text-[12px] font-medium text-[#4B5563]">
                    {log.memo}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <div
                    className="invisible ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded group-hover:visible"
                    onClick={(e) => { e.stopPropagation(); onStartEdit(log); }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onStartEdit(log); } }}
                  >
                    <Pencil className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                  <div
                    aria-label="삭제"
                    className="invisible ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#DC2626] hover:bg-[#FEE2E2] group-hover:visible"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteError(null);
                      setDeletingLog(log);
                    }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setDeleteError(null); setDeletingLog(log); } }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </div>
                </button>
                {expandedId === log.id ? (
                  <p className="pb-3 pt-1 text-[12px] font-medium leading-[1.35] text-[#4B5563] whitespace-pre-wrap">
                    {log.memo}
                  </p>
                ) : null}
                </div>
              </div>
            )
          )
        )}
        {hasNext ? (
          <button
            className="text-[12px] font-semibold text-[#6B7280] hover:text-[#374151] transition-colors"
            disabled={isFetchingNext}
            onClick={onFetchMore}
            type="button"
          >
            {isFetchingNext ? "불러오는 중..." : "더 보기"}
          </button>
        ) : null}
      </div>
    </div>
    <ModalShell
      footer={
        <ModalFooterActions
          formId={createFormId}
          isSubmitting={createMutation.isPending}
          pendingLabel="추가 중"
          submitLabel="추가"
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={() => void onSubmitCreate()}
        />
      }
      open={isCreateOpen}
      size="md"
      title="비밀 메모 추가"
      onOpenChange={setIsCreateOpen}
    >
      <ModalForm id={createFormId} onSubmit={onSubmitCreate}>
        <ModalFormSection title="비밀 메모">
          <ModalFieldGroup
            error={createForm.formState.errors.memo?.message}
            id="company-private-memo-create-memo"
            label="내용"
          >
            <textarea
              className="min-h-32 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-private-memo-create-memo"
              placeholder="비밀 메모 입력"
              rows={5}
              {...createForm.register("memo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>
        {createMutation.error ? (
          <p className="text-xs text-[#B91C1C]">
            {getApiErrorMessage(createMutation.error)}
          </p>
        ) : null}
      </ModalForm>
    </ModalShell>
    <ModalShell
      footer={
        <ModalFooterActions
          formId={editFormId}
          isSubmitting={updateMutation.isPending}
          pendingLabel="저장 중..."
          submitLabel="저장"
          onCancel={() => setEditingId(null)}
        />
      }
      open={editingId !== null}
      size="md"
      title="비밀 메모 수정"
      onOpenChange={(open) => {
        if (!open) setEditingId(null);
      }}
    >
      <ModalForm id={editFormId} onSubmit={onSubmitEdit}>
        <ModalFormSection title="비밀 메모">
          <ModalFieldGroup
            error={editForm.formState.errors.memo?.message}
            id="company-private-memo-edit-memo"
            label="내용"
          >
            <textarea
              className="min-h-32 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="company-private-memo-edit-memo"
              placeholder="비밀 메모 입력"
              rows={5}
              {...editForm.register("memo")}
            />
          </ModalFieldGroup>
        </ModalFormSection>
        {updateMutation.error ? (
          <p className="text-xs text-[#B91C1C]">
            {getApiErrorMessage(updateMutation.error)}
          </p>
        ) : null}
      </ModalForm>
    </ModalShell>
    <ConfirmDialog
      cancelLabel="아니요"
      confirmLabel="예"
      errorMessage={deleteError}
      isPending={deleteMutation.isPending}
      open={deletingLog !== null}
      title={LOG_DELETE_CONFIRM_MESSAGE}
      onCancel={() => {
        if (!deleteMutation.isPending) {
          setDeleteError(null);
          setDeletingLog(null);
        }
      }}
      onConfirm={() => void onConfirmDelete()}
    />
    </>
  );
}

// ── Skeleton / Error ────────────────────────────────────────────────

function CompanyDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <PageHeader
        breadcrumbs={[
          { label: "회사", to: "/app/companies", icon: Building2 },
          { label: "오류" },
        ]}
      />
      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="text-[13px] text-red-600">{getApiErrorMessage(error)}</p>
          <button
            className="mt-3 inline-flex h-8 items-center rounded-lg border border-red-200 bg-white px-3 text-[13px] text-red-600 hover:bg-red-50"
            onClick={onRetry}
            type="button"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}

function CompanyDetailSkeleton() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* TopBar skeleton */}
      <div className="flex h-16 items-center gap-3 border-b border-[#E5E7EB] bg-white px-6">
        <div className="h-4 w-4 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="ml-auto flex gap-2">
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-0">
        <div className="h-[150px] animate-pulse rounded-xl bg-white" />
        <div className="flex gap-4">
          <div className="h-[300px] flex-1 animate-pulse rounded-xl bg-white" />
          <div className="h-[300px] flex-1 animate-pulse rounded-xl bg-white" />
        </div>
        <div className="flex gap-4">
          <div className="h-[300px] flex-1 animate-pulse rounded-xl bg-white" />
          <div className="h-[300px] w-[380px] shrink-0 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
    </div>
  );
}

function mergeCompanyField(fields: CompanyField[], current: CompanyField) {
  return fields.some((f) => f.id === current.id) ? fields : [current, ...fields];
}

function mergeCompanyRegion(regions: CompanyRegion[], current: CompanyRegion) {
  return regions.some((r) => r.id === current.id) ? regions : [current, ...regions];
}
