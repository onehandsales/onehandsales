import {
  BriefcaseBusiness,
  ChevronLeft,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SummaryTaxonomySelect } from "@/components/ui/summary-taxonomy-select";
import { Toast } from "@/components/ui/toast";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  useContactDeals,
  useContactDetail,
  useContactMemoLogs,
  useContactPrivateMemoLogs,
} from "@/features/contact/hooks/use-contact-detail";
import {
  useContactDepartments,
  useContactJobGrades,
} from "@/features/contact/hooks/use-contact-list";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";
import {
  useDeleteContactMutation,
  useUpdateContactMutation,
  useCreateContactMemoLogMutation,
  useUpdateContactMemoLogMutation,
  useCreateContactPrivateMemoLogMutation,
  useUpdateContactPrivateMemoLogMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import {
  contactEditFormSchema,
  toContactEditFormValues,
  toUpdateContactInput,
  toCreateContactMemoLogInput,
  toUpdateContactMemoLogInput,
  toCreateContactPrivateMemoLogInput,
  toUpdateContactPrivateMemoLogInput,
  contactMemoLogFormSchema,
  contactPrivateMemoLogFormSchema,
  emptyContactMemoLogFormValues,
  emptyContactPrivateMemoLogFormValues,
  type ContactEditFormValues,
  type ContactMemoLogFormValues,
  type ContactPrivateMemoLogFormValues,
} from "@/features/contact/schemas/contact-schema";
import type {
  ContactCompanyOption,
  ContactDepartment,
  ContactDeal,
  ContactDetail,
  ContactJobGrade,
  ContactMemoLog,
  ContactPrivateMemoLog,
} from "@/features/contact/types/contact";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate, formatDateTime } from "@/utils/format";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

type ContactDetailScreenProps = {
  readonly contactId: string;
};

// 기능 : 담당자 상세 화면을 렌더링합니다.
export function ContactDetailScreen({ contactId }: ContactDetailScreenProps) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const contactQuery = useContactDetail(contactId);
  const dealsQuery = useContactDeals(contactId);
  const memoLogsQuery = useContactMemoLogs(contactId);
  const privateMemoLogsQuery = useContactPrivateMemoLogs(contactId);
  const deleteContactMutation = useDeleteContactMutation();

  const memoLogs: ContactMemoLog[] =
    memoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const privateMemoLogs: ContactPrivateMemoLog[] =
    privateMemoLogsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (contactQuery.isLoading) {
    return <ContactDetailSkeleton />;
  }

  if (contactQuery.isError) {
    return (
      <ContactDetailError
        error={contactQuery.error}
        onRetry={() => void contactQuery.refetch()}
      />
    );
  }

  const contact = contactQuery.data;

  if (!contact) {
    return <ContactDetailSkeleton />;
  }

  const deals = dealsQuery.data?.items ?? [];

  const onDeleteContact = async () => {
    if (!window.confirm(`${contact.username} 담당자를 삭제할까요?`)) {
      return;
    }

    setActionError(null);

    try {
      await deleteContactMutation.mutateAsync(contact.id);
      void navigate("/contacts", {
        replace: true,
        state: { notice: "담당자가 삭제되었습니다." },
      });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

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
            <Toast
              message={actionError}
              onClose={() => setActionError(null)}
              variant="error"
            />
          </div>
        ) : null}

        {/* TopBar */}
        <div className="flex h-16 items-center gap-3 bg-transparent px-6">
          <Link to="/contacts">
            <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
          </Link>
          <div className="flex flex-1 items-center gap-1.5 text-[13px]">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <span className="font-medium text-[#6B7280]">담당자</span>
            <span className="text-[#9CA3AF]">/</span>
            <span className="font-bold text-[#111827]">{contact.username}</span>
          </div>
          <button
            aria-label={isEditing ? "수정 취소" : "수정"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] disabled:opacity-50"
            onClick={() => setIsEditing((value) => !value)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] disabled:opacity-50"
            disabled={deleteContactMutation.isPending}
            onClick={() => void onDeleteContact()}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4 pb-24">
          <ContactSummaryHeader
            contact={contact}
            isEditing={isEditing}
            onCancelEdit={() => setIsEditing(false)}
            onSaved={() => {
              void contactQuery.refetch();
              setNotice("담당자 정보가 저장되었습니다.");
              setIsEditing(false);
            }}
          />

          <ConnectedDealsTable
            deals={deals}
            isLoading={dealsQuery.isLoading}
          />
          <ContactMemoPanel
            contactId={contactId}
            memoLogs={memoLogs}
            isLoading={memoLogsQuery.isLoading}
            hasNext={Boolean(memoLogsQuery.hasNextPage)}
            isFetchingNext={memoLogsQuery.isFetchingNextPage}
            onFetchMore={() => void memoLogsQuery.fetchNextPage()}
            onChanged={setNotice}
          />
          <ContactActivityLogPanel
            contactId={contactId}
            privateMemoLogs={privateMemoLogs}
            isLoading={privateMemoLogsQuery.isLoading}
            hasNext={Boolean(privateMemoLogsQuery.hasNextPage)}
            isFetchingNext={privateMemoLogsQuery.isFetchingNextPage}
            onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
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
            <Toast
              message={actionError}
              onClose={() => setActionError(null)}
              variant="error"
            />
          </div>
        ) : null}

        {/* TopBar */}
        <div className="flex h-16 shrink-0 items-center gap-3 bg-transparent px-6">
          <Link to="/contacts">
            <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
          </Link>
          <div className="flex flex-1 items-center gap-1.5 text-[13px]">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <span className="font-medium text-[#6B7280]">담당자</span>
            <span className="text-[#9CA3AF]">/</span>
            <span className="font-bold text-[#111827]">{contact.username}</span>
          </div>
          <button
            aria-label="수정"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            onClick={() => setIsEditing((v) => !v)}
            type="button"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="삭제"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
            disabled={deleteContactMutation.isPending}
            onClick={() => void onDeleteContact()}
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          <ContactSummaryHeader
            contact={contact}
            isEditing={isEditing}
            onCancelEdit={() => setIsEditing(false)}
            onSaved={() => {
              void contactQuery.refetch();
              setNotice("담당자 정보가 저장되었습니다.");
              setIsEditing(false);
            }}
          />

          {/* 1행: 연결딜 (전체 너비) */}
          <ConnectedDealsTable
            deals={deals}
            isLoading={dealsQuery.isLoading}
          />

          {/* 2행: 담당자 로그 + 비밀 메모 */}
          <div className="grid grid-cols-2 gap-4">
            <ContactMemoPanel
              contactId={contactId}
              memoLogs={memoLogs}
              isLoading={memoLogsQuery.isLoading}
              hasNext={Boolean(memoLogsQuery.hasNextPage)}
              isFetchingNext={memoLogsQuery.isFetchingNextPage}
              onFetchMore={() => void memoLogsQuery.fetchNextPage()}
              onChanged={setNotice}
            />
            <ContactActivityLogPanel
              contactId={contactId}
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

// ── Contact Summary Header ──────────────────────────────────────────

function ContactSummaryHeader({
  contact,
  isEditing,
  onCancelEdit,
  onSaved,
}: {
  readonly contact: ContactDetail;
  readonly isEditing: boolean;
  readonly onCancelEdit: () => void;
  readonly onSaved: () => void;
}) {
  const updateContactMutation = useUpdateContactMutation();
  const companiesQuery = useCompanyOptions();
  const departmentsQuery = useContactDepartments();
  const jobGradesQuery = useContactJobGrades();
  const companyOptions = mergeContactCompanyOptions(
    companiesQuery.data?.items ?? [],
    contact.company
  );
  const departments = mergeContactDepartments(
    departmentsQuery.data?.items ?? [],
    contact.contactDepartment
  );
  const jobGrades = mergeContactJobGrades(
    jobGradesQuery.data?.items ?? [],
    contact.contactJobGrade
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactEditFormValues>({
    resolver: zodResolver(contactEditFormSchema),
    defaultValues: toContactEditFormValues(contact),
  });
  const selectedCompanyId = watch("companyId");
  const selectedDepartmentId = watch("contactDepartmentId");
  const selectedJobGradeId = watch("contactJobGradeId");

  useEffect(() => {
    if (isEditing) {
      reset(toContactEditFormValues(contact));
    }
  }, [contact, isEditing, reset]);

  const onSubmit = handleSubmit(async (values) => {
    await updateContactMutation.mutateAsync(
      toUpdateContactInput(contact.id, values)
    );
    onSaved();
  });
  const validationError =
    errors.username?.message ??
    errors.companyId?.message ??
    errors.contactDepartmentId?.message ??
    errors.contactJobGradeId?.message ??
    errors.mobile?.message ??
    errors.email?.message;

  if (isEditing) {
    return (
      <form
        className="flex min-h-[74px] flex-wrap items-center gap-3 rounded-xl border border-[#BFDBFE] bg-white px-5 py-4 shadow-[0_0_0_1px_rgba(37,99,235,0.04)]"
        onSubmit={onSubmit}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
          <span className="text-[16px] font-extrabold text-[#4F46E5]">
            {contact.username.charAt(0)}
          </span>
        </div>

        <div className="min-w-[120px] flex-[1_1_160px] md:max-w-[180px] md:flex-none">
          <label className="sr-only" htmlFor="contact-summary-edit-name">
            이름
          </label>
          <input
            aria-invalid={Boolean(errors.username)}
            className="h-9 w-full rounded-lg border border-[#DDE3EE] bg-white px-3 text-[15px] font-extrabold text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            id="contact-summary-edit-name"
            {...register("username")}
          />
        </div>

        <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] md:block" />

        <input type="hidden" {...register("companyId")} />
        <SummaryTaxonomySelect
          emptyText="조건에 맞는 회사가 없습니다."
          getLabel={(company) => company.companyName}
          id="contact-summary-edit-company"
          invalid={Boolean(errors.companyId)}
          itemKindLabel="회사"
          items={companyOptions}
          selectedId={selectedCompanyId}
          tone="blue"
          widthClassName="w-[150px]"
          onSelect={(id) =>
            setValue("companyId", id, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <input type="hidden" {...register("contactDepartmentId")} />
        <SummaryTaxonomySelect
          emptyText="조건에 맞는 부서가 없습니다."
          getLabel={(department) => department.departmentName}
          id="contact-summary-edit-department"
          invalid={Boolean(errors.contactDepartmentId)}
          itemKindLabel="부서"
          items={departments}
          selectedId={selectedDepartmentId}
          tone="amber"
          widthClassName="w-[128px]"
          onSelect={(id) =>
            setValue("contactDepartmentId", id, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <input type="hidden" {...register("contactJobGradeId")} />
        <SummaryTaxonomySelect
          emptyText="조건에 맞는 직급이 없습니다."
          getLabel={(jobGrade) => jobGrade.jobGradeName}
          id="contact-summary-edit-job-grade"
          invalid={Boolean(errors.contactJobGradeId)}
          itemKindLabel="직급"
          items={jobGrades}
          selectedId={selectedJobGradeId}
          tone="green"
          widthClassName="w-[116px]"
          onSelect={(id) =>
            setValue("contactJobGradeId", id, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] lg:block" />

        <InlineTextInput
          id="contact-summary-edit-mobile"
          label="휴대폰"
          register={register("mobile")}
          widthClassName="w-[128px]"
        />
        <InlineTextInput
          id="contact-summary-edit-email"
          label="이메일"
          register={register("email")}
          widthClassName="w-[210px]"
        />

        <div className="flex-1" />

        {validationError || updateContactMutation.error ? (
          <span className="basis-full text-[12px] font-semibold text-[#B91C1C] md:basis-auto">
            {validationError ?? getApiErrorMessage(updateContactMutation.error)}
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
          disabled={updateContactMutation.isPending}
          type="submit"
        >
          {updateContactMutation.isPending ? "저장 중" : "저장"}
        </button>
      </form>
    );
  }

  return (
    <div className="flex min-h-[74px] flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
        <span className="text-[16px] font-extrabold text-[#4F46E5]">
          {contact.username.charAt(0)}
        </span>
      </div>
      <span className="shrink-0 text-[20px] font-extrabold leading-none text-[#111827]">
        {contact.username}
      </span>
      <div className="h-5 w-px shrink-0 bg-[#E5E7EB]" />
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">회사</span>
        <Link
          className="font-extrabold text-[#111827] hover:text-[#2563EB] hover:underline"
          to={`/companies/${contact.company.id}`}
        >
          {contact.company.companyName}
        </Link>
      </div>
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">부서</span>
        <span className="font-extrabold text-[#111827]">
          {contact.contactDepartment.departmentName}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-[13px]">
        <span className="font-semibold text-[#9CA3AF]">직급</span>
        <span className="font-extrabold text-[#111827]">
          {contact.contactJobGrade.jobGradeName}
        </span>
      </div>
      <div className="h-5 w-px shrink-0 bg-[#E5E7EB]" />
      <ContactInfoChip
        icon={Phone}
        label={contact.mobile || "-"}
      />
      <ContactInfoChip
        icon={Mail}
        label={contact.email || "-"}
      />
      <div className="flex-1" />
      <div className="flex items-center gap-4 text-[12px] text-[#9CA3AF]">
        <span>등록 {formatDateTime(contact.createdAt, { includeYear: true })}</span>
        <span>수정 {formatDateTime(contact.updatedAt, { includeYear: true })}</span>
      </div>
    </div>
  );
}

// ── Contact Basic Info Panel ────────────────────────────────────────

// ── Connected Deals Table ───────────────────────────────────────────

const DEAL_DOT_COLORS = ["#B45309", "#0369A1", "#2563EB", "#15803D", "#9CA3AF"];

function ConnectedDealsTable({
  deals,
  isLoading,
}: {
  readonly deals: ContactDeal[];
  readonly isLoading: boolean;
}) {
  const SHOW_LIMIT = 4;
  const hasMore = deals.length > SHOW_LIMIT;

  return (
    <div className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      <div className="flex h-[48px] shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
        <BriefcaseBusiness className="h-4 w-4 text-[#6B7280]" />
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
      <div className="relative h-[8px] w-[8px] rounded-full bg-[#2563EB]" />
    </div>
  );
}

function ContactMemoPanel({
  contactId,
  memoLogs,
  isLoading,
  hasNext,
  isFetchingNext,
  onFetchMore,
  onChanged,
}: {
  readonly contactId: string;
  readonly memoLogs: ContactMemoLog[];
  readonly isLoading: boolean;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly onFetchMore: () => void;
  readonly onChanged: (notice: string) => void;
}) {
  const createMemoMutation = useCreateContactMemoLogMutation(contactId);
  const updateMemoMutation = useUpdateContactMemoLogMutation(contactId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const createForm = useForm<ContactMemoLogFormValues>({
    resolver: zodResolver(contactMemoLogFormSchema),
    defaultValues: emptyContactMemoLogFormValues,
  });

  const editForm = useForm<ContactMemoLogFormValues>({
    resolver: zodResolver(contactMemoLogFormSchema),
    defaultValues: emptyContactMemoLogFormValues,
  });

  const onSubmitCreate = createForm.handleSubmit(async (values) => {
    await createMemoMutation.mutateAsync(
      toCreateContactMemoLogInput(contactId, values)
    );
    createForm.reset(emptyContactMemoLogFormValues);
    setIsCreateOpen(false);
    onChanged("담당자 로그가 추가되었습니다.");
  });

  const onStartEdit = (log: ContactMemoLog) => {
    setEditingId(log.id);
    editForm.reset({ memoType: log.memoType, memo: log.memo });
  };

  const onSubmitEdit = editForm.handleSubmit(async (values) => {
    if (!editingId) return;
    await updateMemoMutation.mutateAsync(
      toUpdateContactMemoLogInput(contactId, editingId, values)
    );
    setEditingId(null);
    onChanged("담당자 로그가 수정되었습니다.");
  });

  const createFormId = "contact-log-create-form";
  const editFormId = "contact-log-edit-form";

  return (
    <>
    <div className="flex h-[420px] flex-col rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#E5E7EB] px-4">
        <span className="text-[15px] font-extrabold text-[#111827]">담당자 로그</span>
        <div className="flex-1" />
        <button
          aria-label="담당자 로그 추가"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-colors hover:bg-[#1D4ED8]"
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
          <p className="text-[13px] text-[#9CA3AF]">담당자 로그가 없습니다.</p>
        ) : (
          memoLogs.map((log, index) => (
              <div
                className="group flex gap-3"
                key={log.id}
              >
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
                </button>
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
      title="담당자 로그 추가"
      onOpenChange={setIsCreateOpen}
    >
      <ModalForm id={createFormId} onSubmit={onSubmitCreate}>
        <ModalFormSection title="담당자 로그">
          <ModalFieldGroup
            error={createForm.formState.errors.memoType?.message}
            id="contact-log-create-title"
            label="제목"
          >
            <input
              className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-log-create-title"
              placeholder="담당자 로그 제목"
              {...createForm.register("memoType")}
            />
          </ModalFieldGroup>
          <ModalFieldGroup
            error={createForm.formState.errors.memo?.message}
            id="contact-log-create-memo"
            label="내용"
          >
            <textarea
              className="min-h-28 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-log-create-memo"
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
      title="담당자 로그 수정"
      onOpenChange={(open) => {
        if (!open) setEditingId(null);
      }}
    >
      <ModalForm id={editFormId} onSubmit={onSubmitEdit}>
        <ModalFormSection title="담당자 로그">
          <ModalFieldGroup
            error={editForm.formState.errors.memoType?.message}
            id="contact-log-edit-title"
            label="제목"
          >
            <input
              className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-log-edit-title"
              placeholder="담당자 로그 제목"
              {...editForm.register("memoType")}
            />
          </ModalFieldGroup>
          <ModalFieldGroup
            error={editForm.formState.errors.memo?.message}
            id="contact-log-edit-memo"
            label="내용"
          >
            <textarea
              className="min-h-28 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-log-edit-memo"
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
    </>
  );
}

// ── Activity Log Panel ──────────────────────────────────────────────

function ContactActivityLogPanel({
  contactId,
  privateMemoLogs,
  isLoading,
  hasNext,
  isFetchingNext,
  onFetchMore,
  onChanged,
}: {
  readonly contactId: string;
  readonly privateMemoLogs: ContactPrivateMemoLog[];
  readonly isLoading: boolean;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly onFetchMore: () => void;
  readonly onChanged: (notice: string) => void;
}) {
  const createMutation = useCreateContactPrivateMemoLogMutation(contactId);
  const updateMutation = useUpdateContactPrivateMemoLogMutation(contactId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const createForm = useForm<ContactPrivateMemoLogFormValues>({
    resolver: zodResolver(contactPrivateMemoLogFormSchema),
    defaultValues: emptyContactPrivateMemoLogFormValues,
  });

  const editForm = useForm<ContactPrivateMemoLogFormValues>({
    resolver: zodResolver(contactPrivateMemoLogFormSchema),
    defaultValues: emptyContactPrivateMemoLogFormValues,
  });

  const onSubmitCreate = createForm.handleSubmit(async (values) => {
    await createMutation.mutateAsync(
      toCreateContactPrivateMemoLogInput(contactId, values)
    );
    createForm.reset(emptyContactPrivateMemoLogFormValues);
    setIsCreateOpen(false);
    onChanged("비밀 메모가 추가되었습니다.");
  });

  const onStartEdit = (log: ContactPrivateMemoLog) => {
    setEditingId(log.id);
    editForm.reset({ memo: log.memo });
  };

  const onSubmitEdit = editForm.handleSubmit(async (values) => {
    if (!editingId) return;
    await updateMutation.mutateAsync(
      toUpdateContactPrivateMemoLogInput(contactId, editingId, values)
    );
    setEditingId(null);
    onChanged("비밀 메모가 수정되었습니다.");
  });

  const createFormId = "contact-private-memo-create-form";
  const editFormId = "contact-private-memo-edit-form";

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
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white transition-colors hover:bg-[#1D4ED8]"
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
          <p className="text-[13px] text-[#9CA3AF]">등록된 비밀 메모가 없습니다.</p>
        ) : (
          privateMemoLogs.map((log, index) => (
              <div
                className="group flex gap-3"
                key={log.id}
              >
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
            id="contact-private-memo-create-memo"
            label="내용"
          >
            <textarea
              className="min-h-32 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-private-memo-create-memo"
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
            id="contact-private-memo-edit-memo"
            label="내용"
          >
            <textarea
              className="min-h-32 resize-y rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              id="contact-private-memo-edit-memo"
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
    </>
  );
}

// ── 공통 소형 컴포넌트 ──────────────────────────────────────────────

function ContactInfoChip({
  icon: Icon,
  label,
}: {
  readonly icon: typeof Phone;
  readonly label: string;
}) {
  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#E6EAF0] bg-white px-3 text-[12px] text-[#374151]">
      <Icon className="h-3.5 w-3.5 text-[#9CA3AF]" />
      {label}
    </span>
  );
}

function InlineTextInput({
  id,
  label,
  register,
  widthClassName,
}: {
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly widthClassName: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <label className="shrink-0 font-semibold text-[#9CA3AF]" htmlFor={id}>
        {label}
      </label>
      <input
        className={`${widthClassName} h-8 rounded-lg border border-[#DDE3EE] bg-white px-2 text-[13px] font-extrabold text-[#111827] outline-none transition-colors focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]`}
        id={id}
        {...register}
      />
    </div>
  );
}

function mergeContactCompanyOptions(
  companies: ContactCompanyOption[],
  current: ContactCompanyOption
) {
  return companies.some((company) => company.id === current.id)
    ? companies
    : [current, ...companies];
}

function mergeContactDepartments(
  departments: ContactDepartment[],
  current: ContactDepartment
) {
  return departments.some((department) => department.id === current.id)
    ? departments
    : [current, ...departments];
}

function mergeContactJobGrades(
  jobGrades: ContactJobGrade[],
  current: ContactJobGrade
) {
  return jobGrades.some((jobGrade) => jobGrade.id === current.id)
    ? jobGrades
    : [current, ...jobGrades];
}

// ── Skeleton / Error ────────────────────────────────────────────────

function ContactDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col bg-[#FAFAF8]">
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

function ContactDetailSkeleton() {
  return (
    <div className="min-h-full bg-[#FAFAF8]">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="h-4 w-4 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-4 w-48 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="ml-auto flex gap-2">
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
          <div className="h-9 w-14 animate-pulse rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <div className="h-[72px] animate-pulse rounded-xl bg-white" />
        <div className="flex gap-4">
          <div className="h-[240px] flex-1 animate-pulse rounded-xl bg-white" />
          <div className="h-[240px] flex-1 animate-pulse rounded-xl bg-white" />
        </div>
        <div className="flex gap-4">
          <div className="h-[420px] flex-1 animate-pulse rounded-xl bg-white" />
          <div className="h-[420px] flex-1 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
    </div>
  );
}
