import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "@/components/ui/toast";
import { SummaryTaxonomySelect } from "@/components/ui/summary-taxonomy-select";
import {
  useCompanyContacts,
  useCompanyDeals,
  useCompanyDetail,
  useCompanyMemoLogs,
  useCompanyPrivateMemoLogs,
} from "@/features/company/hooks/use-company-detail";
import {
  useDeleteCompanyMutation,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type CompanyDetailScreenProps = {
  readonly companyId: string;
};

export function CompanyDetailScreen({ companyId }: CompanyDetailScreenProps) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const onDeleteCompany = async () => {
    if (!window.confirm(`${company.companyName} 회사를 삭제할까요?`)) return;
    setActionError(null);
    try {
      await deleteCompanyMutation.mutateAsync(company.id);
      void navigate("/companies", {
        replace: true,
        state: { notice: "회사가 삭제되었습니다." },
      });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const logoLetter = company.companyName.charAt(0);

  return (
    <>
      {/* ── Mobile ──────────────────────────────────────────── */}
      <div className="md:hidden min-h-screen bg-[#FAFAF8]">
        {notice ? (
          <div className="px-4 pt-3">
            <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
          </div>
        ) : null}
        {actionError ? (
          <div className="px-4 pt-3">
            <Toast message={actionError} onClose={() => setActionError(null)} variant="error" />
          </div>
        ) : null}

        {/* TopBar */}
        <div className="flex h-16 items-center gap-3 bg-transparent px-6">
          <Link to="/companies">
            <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
          </Link>
          <div className="flex flex-1 items-center gap-1.5 text-[13px]">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <span className="font-medium text-[#6B7280]">회사</span>
            <span className="text-[#9CA3AF]">/</span>
            <span className="font-bold text-[#111827]">{company.companyName}</span>
          </div>
          <button
            aria-label={isEditing ? "수정 취소" : "수정"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            onClick={() => setIsEditing((value) => !value)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
            disabled={deleteCompanyMutation.isPending}
            onClick={() => void onDeleteCompany()}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 pb-24">
          <CompanySummaryHeader
            company={company}
            contactCount={contacts.length}
            dealCount={deals.length}
            fields={fields}
            isEditing={isEditing}
            logoLetter={logoLetter}
            regions={regions}
            onCancelEdit={() => setIsEditing(false)}
            onSaved={() => {
              void companyQuery.refetch();
              setNotice("회사 정보가 저장되었습니다.");
              setIsEditing(false);
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
            onChanged={setNotice}
          />
        </div>
      </div>

      {/* ── Desktop ──────────────────────────────────────────── */}
      <div className="hidden md:flex h-full flex-col bg-[#FAFAF8]">
        {notice ? (
          <div className="mx-6 mt-3">
            <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
          </div>
        ) : null}
        {actionError ? (
          <div className="mx-6 mt-3">
            <Toast message={actionError} onClose={() => setActionError(null)} variant="error" />
          </div>
        ) : null}

        {/* TopBar */}
        <div className="flex h-16 shrink-0 items-center gap-3 bg-transparent px-6">
          <Link to="/companies">
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            onClick={() => setIsEditing((v) => !v)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
            disabled={deleteCompanyMutation.isPending}
            onClick={() => void onDeleteCompany()}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <CompanySummaryHeader
            company={company}
            contactCount={contacts.length}
            dealCount={deals.length}
            fields={fields}
            isEditing={isEditing}
            logoLetter={logoLetter}
            regions={regions}
            onCancelEdit={() => setIsEditing(false)}
            onSaved={() => {
              void companyQuery.refetch();
              setNotice("회사 정보가 저장되었습니다.");
              setIsEditing(false);
            }}
          />

          {/* 1행: 연결담당자 + 연결딜 */}
          <div className="grid grid-cols-2 gap-4">
            <ConnectedContactsTable contacts={contacts} isLoading={contactsQuery.isLoading} />
            <ConnectedDealsTable deals={deals} isLoading={dealsQuery.isLoading} />
          </div>

          {/* 2행: 메모 + 활동 로그 */}
          <div className="grid grid-cols-2 gap-4">
            <MemoPanel
              companyId={companyId}
              memoLogs={memoLogs}
              isLoading={memoLogsQuery.isLoading}
              hasNext={Boolean(memoLogsQuery.hasNextPage)}
              isFetchingNext={memoLogsQuery.isFetchingNextPage}
              onFetchMore={() => void memoLogsQuery.fetchNextPage()}
              onChanged={setNotice}
            />
            <ActivityLogPanel
              companyId={companyId}
              privateMemoLogs={privateMemoLogs}
              isLoading={privateMemoLogsQuery.isLoading}
              hasNext={Boolean(privateMemoLogsQuery.hasNextPage)}
              isFetchingNext={privateMemoLogsQuery.isFetchingNextPage}
              onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
              onChanged={setNotice}
            />
          </div>
        </div>
      </div>
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
        className="flex min-h-[74px] flex-wrap items-center gap-3 rounded-xl border border-[#BFDBFE] bg-white px-5 py-4 shadow-[0_0_0_1px_rgba(37,99,235,0.04)] md:flex-nowrap"
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
            className="h-9 w-full rounded-lg border border-[#DDE3EE] bg-white pl-8 pr-3 text-[15px] font-extrabold text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            id="company-summary-edit-name"
            {...register("companyName")}
          />
        </div>

        <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] md:block" />

        <input type="hidden" {...register("companyFieldId")} />
        <SummaryTaxonomySelect
          emptyText="조건에 맞는 분야가 없습니다."
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
          emptyText="조건에 맞는 지역이 없습니다."
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
          취소
        </button>
        <button
          className="h-9 rounded-lg bg-[#2563EB] px-4 text-[13px] font-extrabold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
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
  const SHOW_LIMIT = 4;
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
        <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">연결된 담당자가 없습니다.</p>
      ) : (
        <div className={hasMore ? "max-h-[232px] overflow-y-auto" : ""}>
          {contacts.map((contact) => {
            const jobGradeName = contact.contactJobGrade?.jobGradeName;

            return (
              <Link
                className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 hover:bg-[#F9FAFB] transition-colors last:border-0"
                key={contact.id}
                to={`/contacts/${contact.id}`}
              >
                <div className="h-6 w-6 shrink-0 rounded-full bg-[#DBEAFE]" />
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

const DEAL_DOT_COLORS = ["#B45309", "#0369A1", "#2563EB", "#15803D", "#9CA3AF"];

function ConnectedDealsTable({
  deals,
  isLoading,
}: {
  readonly deals: CompanyDeal[];
  readonly isLoading: boolean;
}) {
  const SHOW_LIMIT = 4;
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
        <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">연결된 딜이 없습니다.</p>
      ) : (
        <div className={hasMore ? "max-h-[232px] overflow-y-auto" : ""}>
          {deals.map((deal, idx) => (
            <Link
              className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 hover:bg-[#F9FAFB] transition-colors last:border-0"
              key={deal.id}
              to={`/deals/${deal.id}`}
            >
              <div
                className="h-[8px] w-[8px] shrink-0 rounded-full"
                style={{ backgroundColor: DEAL_DOT_COLORS[idx % DEAL_DOT_COLORS.length] }}
              />
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
  readonly onChanged: (notice: string) => void;
}) {
  const createMemoMutation = useCreateCompanyMemoLogMutation();
  const updateMemoMutation = useUpdateCompanyMemoLogMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    onChanged("메모가 추가되었습니다.");
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
    onChanged("메모가 수정되었습니다.");
  });

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">메모</span>
        <div className="flex-1" />
        <div className="flex h-6 items-center gap-1.5 rounded-xl bg-[#FFFBEB] px-2">
          <span className="text-[11px] font-semibold text-[#92400E]">암호화</span>
        </div>
      </div>

      {/* Composer */}
      <form
        className="flex shrink-0 flex-col gap-2.5 border-b border-[#F3F4F6] p-4"
        onSubmit={onSubmitCreate}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3">
            <input
              className="flex-1 bg-transparent text-[13px] font-semibold text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              placeholder="메모 제목"
              {...createForm.register("memoType")}
            />
          </div>
          <button
            className="flex h-9 w-[72px] shrink-0 items-center justify-center gap-1 rounded-lg bg-[#2563EB] text-[12px] font-extrabold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            disabled={createMemoMutation.isPending}
            type="submit"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
        <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3" style={{ minHeight: 52 }}>
          <textarea
            className="flex-1 resize-none bg-transparent text-[13px] font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            placeholder="내용 입력"
            rows={2}
            {...createForm.register("memo")}
          />
        </div>
      </form>

      {/* Memo List */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div className="h-16 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
            ))}
          </div>
        ) : memoLogs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">등록된 메모가 없습니다.</p>
        ) : (
          memoLogs.map((log) =>
            editingId === log.id ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] p-3"
                key={log.id}
                onSubmit={onSubmitEdit}
              >
                <div className="flex h-8 items-center rounded border border-[#BFDBFE] bg-white px-2">
                  <input
                    className="flex-1 bg-transparent text-[12px] font-semibold text-[#111827] outline-none"
                    {...editForm.register("memoType")}
                  />
                </div>
                <textarea
                  className="resize-none rounded border border-[#BFDBFE] bg-white p-2 text-[13px] font-medium text-[#374151] outline-none"
                  rows={3}
                  {...editForm.register("memo")}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="h-7 rounded px-2.5 text-[12px] font-semibold text-[#6B7280] hover:bg-white transition-colors"
                    onClick={() => setEditingId(null)}
                    type="button"
                  >
                    취소
                  </button>
                  <button
                    className="h-7 rounded bg-[#2563EB] px-2.5 text-[12px] font-extrabold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                    disabled={updateMemoMutation.isPending}
                    type="submit"
                  >
                    저장
                  </button>
                </div>
              </form>
            ) : (
              <div
                className="group flex flex-col gap-1 border-b border-[#F3F4F6] pb-2.5 last:border-0"
                key={log.id}
              >
                {/* 제목 행 — 클릭 시 본문 토글 */}
                <button
                  className="flex w-full items-center gap-1 text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 text-[#9CA3AF] transition-transform ${expandedId === log.id ? "rotate-90" : ""}`}
                  />
                  <span className="flex-1 truncate text-[13px] font-semibold text-[#111827]">
                    {log.memoType || "제목 없음"}
                  </span>
                  <span className="shrink-0 text-[11px] font-bold text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <div
                    className="ml-1 hidden h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-[#F3F4F6] transition-colors group-hover:flex"
                    onClick={(e) => { e.stopPropagation(); onStartEdit(log); }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onStartEdit(log); } }}
                  >
                    <Pencil className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                </button>
                {/* 본문 — 펼쳐진 경우만 표시 */}
                {expandedId === log.id ? (
                  <p className="pl-5 text-[13px] font-medium leading-[1.35] text-[#374151] whitespace-pre-wrap">
                    {log.memo}
                  </p>
                ) : null}
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
  readonly onChanged: (notice: string) => void;
}) {
  const createMutation = useCreateCompanyPrivateMemoLogMutation();
  const updateMutation = useUpdateCompanyPrivateMemoLogMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    onChanged("활동 로그가 추가되었습니다.");
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
    onChanged("활동 로그가 수정되었습니다.");
  });

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">활동 로그</span>
      </div>

      {/* Composer */}
      <form
        className="flex shrink-0 flex-col gap-2 border-b border-[#F3F4F6] p-4"
        onSubmit={onSubmitCreate}
      >
        <div className="flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5" style={{ minHeight: 48 }}>
          <textarea
            className="flex-1 resize-none bg-transparent text-[13px] font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            placeholder="활동 내용 입력"
            rows={2}
            {...createForm.register("memo")}
          />
        </div>
        <div className="flex justify-end">
          <button
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0D9488] px-3 text-[13px] font-extrabold text-white hover:bg-[#0F766E] transition-colors disabled:opacity-50"
            disabled={createMutation.isPending}
            type="submit"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
      </form>

      {/* Items */}
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div className="h-12 animate-pulse rounded-lg bg-[#F3F4F6]" key={i} />
            ))}
          </div>
        ) : privateMemoLogs.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF]">활동 기록이 없습니다.</p>
        ) : (
          privateMemoLogs.map((log) =>
            editingId === log.id ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[#CCFBF1] bg-[#F0FDFA] p-3"
                key={log.id}
                onSubmit={onSubmitEdit}
              >
                <textarea
                  className="resize-none rounded border border-[#99F6E4] bg-white p-2 text-[13px] font-medium text-[#374151] outline-none"
                  rows={3}
                  {...editForm.register("memo")}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="h-7 rounded px-2.5 text-[12px] font-semibold text-[#6B7280] hover:bg-white transition-colors"
                    onClick={() => setEditingId(null)}
                    type="button"
                  >
                    취소
                  </button>
                  <button
                    className="h-7 rounded bg-[#0D9488] px-2.5 text-[12px] font-extrabold text-white hover:bg-[#0F766E] transition-colors disabled:opacity-50"
                    disabled={updateMutation.isPending}
                    type="submit"
                  >
                    저장
                  </button>
                </div>
              </form>
            ) : (
              <div
                className="group flex flex-col gap-1 border-b border-[#F3F4F6] pb-2.5 last:border-0"
                key={log.id}
              >
                {/* 1줄 미리보기 행 — 클릭 시 전체 토글 */}
                <button
                  className="flex w-full items-center gap-2 text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-2xl bg-[#EFF6FF]">
                    <div className="h-[6px] w-[6px] rounded-full bg-[#2563EB]" />
                  </div>
                  <span className={`flex-1 text-[12px] font-medium text-[#4B5563] ${expandedId === log.id ? "whitespace-pre-wrap" : "truncate"}`}>
                    {log.memo}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold text-[#9CA3AF]">
                    {formatDateTime(log.createdAt, { includeYear: true })}
                  </span>
                  <div
                    className="ml-0.5 hidden h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-[#F3F4F6] transition-colors group-hover:flex"
                    onClick={(e) => { e.stopPropagation(); onStartEdit(log); }}
                    role="button"
                    tabIndex={-1}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onStartEdit(log); } }}
                  >
                    <Pencil className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                </button>
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
    <div className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[
          { label: "회사", to: "/companies", icon: Building2 },
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
    <div className="flex min-h-full flex-col bg-[#FAFAF8]">
      {/* TopBar skeleton */}
      <div className="flex h-16 items-center gap-3 border-b border-[#E5E7EB] bg-white px-6">
        <div className="h-4 w-4 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="ml-auto flex gap-2">
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6">
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
