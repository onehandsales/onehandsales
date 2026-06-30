import { zodResolver } from "@hookform/resolvers/zod";
import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  IdCard,
  Loader2,
  Package,
  Pencil,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ModalFooterActions,
  ModalFormRow,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { Toast } from "@/components/ui/toast";
import {
  useDealCompanyOptions,
  useDealContactOptions,
  useDealProductOptions,
} from "@/features/deal/hooks/use-deal-entity-options";
import { useDealList } from "@/features/deal/hooks/use-deal-list";
import {
  EntityMultiSelectField,
  type EntitySelectOption,
} from "@/features/meeting-note/components/meeting-note-create-dialog";
import {
  useDeleteMeetingNoteMutation,
  useUpdateMeetingNoteMutation,
} from "@/features/meeting-note/hooks/use-meeting-note-mutations";
import { useMeetingNoteDetail } from "@/features/meeting-note/hooks/use-meeting-note-queries";
import type {
  MeetingNote,
  MeetingNoteCompany,
  MeetingNoteContact,
  MeetingNoteDeal,
  MeetingNoteProduct,
  MeetingNoteSourceType,
  UpdateMeetingNoteInput,
} from "@/features/meeting-note/types/meeting-note";
import { getMeetingDateParts } from "@/features/meeting-note/utils/meeting-note-date";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDate, formatDateTime, formatMoney } from "@/utils/format";
import { readLocationNotice } from "@/utils/location-state";

type MeetingNoteDetailScreenProps = {
  readonly meetingNoteId: string;
};

const MEETING_NOTE_SOURCE_LABEL = {
  MANUAL: "직접 작성",
  STT_AI: "음성 AI",
  TEXT_AI: "텍스트 AI",
} satisfies Record<MeetingNoteSourceType, string>;
const MEETING_NOTE_LINKED_LIST_SCROLL_CLASS = "max-h-[116px] overflow-y-auto";

const meetingNoteDetailEditSchema = z.object({
  companyIds: z.array(z.string()).min(1, "회사를 1개 이상 선택해 주세요."),
  contactIds: z.array(z.string()).min(1, "담당자를 1명 이상 선택해 주세요."),
  dealIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  details: z.string().trim().min(1, "상세 내용을 입력해 주세요.").max(10000),
  meetingLocalDateTime: z.string().trim().min(1, "미팅 일시를 선택해 주세요."),
  nextPlan: z.string().max(2000).optional(),
  requiredAction: z.string().max(2000).optional(),
  title: z.string().trim().min(1, "회의록 제목을 입력해 주세요.").max(100),
});

type MeetingNoteDetailEditFormValues = z.infer<
  typeof meetingNoteDetailEditSchema
>;

// 기능 : 회의록 단건 상세 페이지를 딜 상세 페이지와 같은 읽기 중심 레이아웃으로 렌더링합니다.
export function MeetingNoteDetailScreen({
  meetingNoteId,
}: MeetingNoteDetailScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState(() => readLocationNotice(location.state));
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savedMeetingNote, setSavedMeetingNote] = useState<MeetingNote | null>(
    null,
  );
  const detailQuery = useMeetingNoteDetail(meetingNoteId, Boolean(meetingNoteId));
  const deleteMutation = useDeleteMeetingNoteMutation();
  const detail = savedMeetingNote ?? detailQuery.data ?? null;

  useEffect(() => {
    if (!notice) {
      return;
    }

    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, notice]);

  const onDeleteMeetingNote = async () => {
    setActionError(null);

    try {
      await deleteMutation.mutateAsync(meetingNoteId);
      setDeleteConfirmOpen(false);
      void navigate("/meeting-notes", {
        replace: true,
      state: { notice: "회의록을 삭제했어요." },
      });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  if (!meetingNoteId) {
    return (
      <MeetingNoteStateShell>
        <MeetingNoteDetailError
      error="회의록 ID를 확인할 수 없어요."
          onRetry={() => void navigate("/meeting-notes")}
        />
      </MeetingNoteStateShell>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <MeetingNoteStateShell>
        <MeetingNoteDetailSkeleton />
      </MeetingNoteStateShell>
    );
  }

  if (detailQuery.isError || !detail) {
    return (
      <MeetingNoteStateShell>
        <MeetingNoteDetailError
          error={detailQuery.error}
          onRetry={() => void detailQuery.refetch()}
        />
      </MeetingNoteStateShell>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#FAFAF8] md:flex md:h-full md:min-h-0 md:flex-col">
        {notice ? (
          <div className="px-4 pt-3 md:px-6">
            <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
          </div>
        ) : null}
        {actionError ? (
          <div className="px-4 pt-3 md:px-6">
            <Toast
              message={actionError}
              onClose={() => setActionError(null)}
              variant="error"
            />
          </div>
        ) : null}

        <MeetingNoteDetailTopBar
          deletePending={deleteMutation.isPending}
          meetingNoteTitle={detail.title}
          onDelete={() => setDeleteConfirmOpen(true)}
          onEdit={() => {
            setActionError(null);
            setIsEditOpen(true);
          }}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-24 md:p-6">
          <MeetingNoteDetailBody detail={detail} />
        </div>
      </div>

      <MeetingNoteEditDialog
        detail={detail}
        open={isEditOpen}
        onError={(message) => setActionError(message)}
        onOpenChange={setIsEditOpen}
        onSaved={(updated) => {
          setSavedMeetingNote(updated);
    setNotice("회의록을 수정했어요.");
          setIsEditOpen(false);
        }}
      />

      <ConfirmDialog
          cancelLabel="닫기"
        confirmLabel="삭제"
        errorMessage={actionError}
        isPending={deleteMutation.isPending}
        open={deleteConfirmOpen}
        title="회의록을 삭제할까요?"
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setDeleteConfirmOpen(false);
            setActionError(null);
          }
        }}
        onConfirm={() => void onDeleteMeetingNote()}
      />
    </>
  );
}

function MeetingNoteDetailTopBar({
  deletePending,
  meetingNoteTitle,
  onDelete,
  onEdit,
}: {
  readonly deletePending: boolean;
  readonly meetingNoteTitle: string;
  readonly onDelete: () => void;
  readonly onEdit: () => void;
}) {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 bg-transparent px-4 md:px-6">
      <Link to="/meeting-notes">
        <ChevronLeft className="h-5 w-5 text-[#9CA3AF]" />
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
        <FileText className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
        <span className="font-medium text-[#6B7280]">회의록</span>
        <span className="text-[#9CA3AF]">/</span>
        <span className="truncate font-bold text-[#111827]">
          {meetingNoteTitle}
        </span>
      </div>
      <button
        aria-label="수정"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition-colors hover:bg-[#F9FAFB]"
        onClick={onEdit}
        type="button"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        aria-label="삭제"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FEE2E2] bg-white text-[#B91C1C] transition-colors hover:bg-red-50 disabled:opacity-50"
        disabled={deletePending}
        onClick={onDelete}
        type="button"
      >
        {deletePending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

// 기능 : 회의록 수정 form을 상세 화면 위 모달로 표시합니다.
function MeetingNoteEditDialog({
  detail,
  open,
  onError,
  onOpenChange,
  onSaved,
}: {
  readonly detail: MeetingNote;
  readonly open: boolean;
  readonly onError: (message: string | null) => void;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSaved: (meetingNote: MeetingNote) => void;
}) {
  const formId = "meeting-note-detail-edit-form";
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ModalShell
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={isSubmitting}
          pendingLabel="저장 중"
          submitIcon={<Save className="h-4 w-4" />}
          submitLabel="저장"
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      bodyClassName="py-4"
      footerClassName="h-14"
      panelClassName="max-h-[86vh] md:max-h-[760px]"
      size="lg"
      title="회의록 수정"
      onOpenChange={onOpenChange}
    >
      <MeetingNoteEditPanel
        detail={detail}
        formId={formId}
        onError={onError}
        onPendingChange={setIsSubmitting}
        onSaved={onSaved}
      />
    </ModalShell>
  );
}

function MeetingNoteDetailBody({ detail }: { readonly detail: MeetingNote }) {
  return (
    <>
      <MeetingNoteSummaryHeader detail={detail} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MeetingNoteLinkedCompaniesTable companies={detail.companies} />
        <MeetingNoteLinkedContactsTable contacts={detail.contacts} />
        <MeetingNoteLinkedProductsTable products={detail.products} />
        <MeetingNoteLinkedDealsTable deals={detail.deals} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <MeetingNoteTextPanel title="상세 내용" value={detail.details} />
        <div className="grid gap-4">
          <MeetingNoteTextPanel title="다음 계획" value={detail.nextPlan} />
          <MeetingNoteTextPanel title="필요 액션" value={detail.requiredAction} />
        </div>
      </div>
    </>
  );
}

function MeetingNoteSummaryHeader({ detail }: { readonly detail: MeetingNote }) {
  return (
    <div className="flex min-h-[74px] flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
        <FileText className="h-5 w-5 text-[#4F46E5]" />
      </div>
      <span className="min-w-[180px] flex-1 truncate text-[14px] font-extrabold leading-none text-[#111827]">
        {detail.title}
      </span>
      <MeetingNoteSourceBadge sourceType={detail.sourceType} />
      <div className="hidden h-5 w-px shrink-0 bg-[#E5E7EB] md:block" />
      <MeetingNoteSummaryChip
        label="미팅일"
        value={formatMeetingDate(detail.meetingAt)}
      />
      <MeetingNoteSummaryChip
        label="회사"
        value={formatMeetingNoteCompanySummary(detail)}
      />
      <MeetingNoteSummaryChip
        label="담당자"
        value={formatMeetingNoteContactSummary(detail)}
      />
      <MeetingNoteSummaryChip
        label="딜"
        value={formatMeetingNoteDealSummary(detail)}
      />
      <div className="flex-1" />
      <div className="flex items-center gap-4 text-[12px] text-[#9CA3AF]">
        <span>등록 {formatDateTime(detail.createdAt, { includeYear: true })}</span>
        <span>수정 {formatDateTime(detail.updatedAt, { includeYear: true })}</span>
      </div>
    </div>
  );
}

function MeetingNoteSourceBadge({
  sourceType,
}: {
  readonly sourceType: MeetingNoteSourceType;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11px] font-semibold",
        getMeetingNoteSourceClass(sourceType),
      )}
    >
      {MEETING_NOTE_SOURCE_LABEL[sourceType]}
    </span>
  );
}

function MeetingNoteSummaryChip({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
      <span className="shrink-0 font-semibold text-[#9CA3AF]">{label}</span>
      <span className="truncate font-extrabold text-[#111827]">{value}</span>
    </div>
  );
}

function MeetingNoteLinkedCompaniesTable({
  companies,
}: {
  readonly companies: readonly MeetingNoteCompany[];
}) {
  return (
    <MeetingNoteLinkedTableFrame count={companies.length} title="연결 회사">
      {companies.length === 0 ? (
              <MeetingNoteLinkedEmpty text="회사를 연결하면 여기에서 볼 수 있어요." />
      ) : (
        <div className={getMeetingNoteLinkedListClass(companies.length)}>
          {companies.map((company) => {
            const hasLink = Boolean(company.companyId);
            const secondary =
              [company.companyFieldSnapshot, company.companyRegionSnapshot]
                .filter(Boolean)
                .join(" / ") || "-";
            const row = (
              <MeetingNoteLinkedRow
                icon={<Building2 className="h-3.5 w-3.5 text-[#4F46E5]" />}
                iconClassName="bg-[#EEF2FF]"
                primary={formatDeletedLabel(
                  company.companyNameSnapshot,
                  company.isDeleted,
                )}
                secondary={secondary}
                showChevron={hasLink}
              />
            );

            return hasLink && company.companyId ? (
              <Link
                className="block"
                key={company.id}
                to={`/companies/${company.companyId}`}
              >
                {row}
              </Link>
            ) : (
              <div key={company.id}>{row}</div>
            );
          })}
        </div>
      )}
    </MeetingNoteLinkedTableFrame>
  );
}

function MeetingNoteLinkedContactsTable({
  contacts,
}: {
  readonly contacts: readonly MeetingNoteContact[];
}) {
  return (
    <MeetingNoteLinkedTableFrame count={contacts.length} title="연결 담당자">
      {contacts.length === 0 ? (
              <MeetingNoteLinkedEmpty text="담당자를 연결하면 여기에서 볼 수 있어요." />
      ) : (
        <div className={getMeetingNoteLinkedListClass(contacts.length)}>
          {contacts.map((contact) => {
            const hasLink = Boolean(contact.contactId);
            const secondary =
              [
                contact.companyNameSnapshot,
                contact.departmentSnapshot,
                contact.jobGradeSnapshot,
              ]
                .filter(Boolean)
                .join(" / ") || "-";
            const row = (
              <MeetingNoteLinkedRow
                icon={<UserRound className="h-3.5 w-3.5 text-[#4880EE]" />}
                iconClassName="bg-[#DBEAFE]"
                primary={formatDeletedLabel(
                  contact.contactUsernameSnapshot,
                  contact.isDeleted,
                )}
                secondary={secondary}
                showChevron={hasLink}
              />
            );

            return hasLink && contact.contactId ? (
              <Link
                className="block"
                key={contact.id}
                to={`/contacts/${contact.contactId}`}
              >
                {row}
              </Link>
            ) : (
              <div key={contact.id}>{row}</div>
            );
          })}
        </div>
      )}
    </MeetingNoteLinkedTableFrame>
  );
}

function MeetingNoteLinkedProductsTable({
  products,
}: {
  readonly products: readonly MeetingNoteProduct[];
}) {
  return (
    <MeetingNoteLinkedTableFrame count={products.length} title="연결 제품">
      {products.length === 0 ? (
              <MeetingNoteLinkedEmpty text="제품을 연결하면 여기에서 볼 수 있어요." />
      ) : (
        <div className={getMeetingNoteLinkedListClass(products.length)}>
          {products.map((product) => {
            const hasLink = Boolean(product.productId);
            const secondary =
              [product.productCategorySnapshot, product.productStatusSnapshot]
                .filter(Boolean)
                .join(" / ") || "-";
            const price =
              product.productPriceSnapshot !== null
                ? formatMoney(product.productPriceSnapshot, "KRW")
                : "-";
            const row = (
              <MeetingNoteLinkedRow
                icon={<Package className="h-3.5 w-3.5 text-[#15803D]" />}
                iconClassName="bg-[#F0FDF4]"
                primary={formatDeletedLabel(
                  product.productNameSnapshot,
                  product.isDeleted,
                )}
                secondary={secondary}
                showChevron={hasLink}
                trailing={price}
              />
            );

            return hasLink && product.productId ? (
              <Link
                className="block"
                key={product.id}
                to={`/products/${product.productId}`}
              >
                {row}
              </Link>
            ) : (
              <div key={product.id}>{row}</div>
            );
          })}
        </div>
      )}
    </MeetingNoteLinkedTableFrame>
  );
}

function MeetingNoteLinkedDealsTable({
  deals,
}: {
  readonly deals: readonly MeetingNoteDeal[];
}) {
  return (
    <MeetingNoteLinkedTableFrame count={deals.length} title="연결 딜">
      {deals.length === 0 ? (
              <MeetingNoteLinkedEmpty text="딜을 연결하면 여기에서 볼 수 있어요." />
      ) : (
        <div className={getMeetingNoteLinkedListClass(deals.length)}>
          {deals.map((deal) => (
            <Link className="block" key={deal.id} to={`/deals/${deal.dealId}`}>
              <MeetingNoteLinkedRow
                icon={
                  <BriefcaseBusiness className="h-3.5 w-3.5 text-[#C2410C]" />
                }
                iconClassName="bg-[#FFEDD5]"
                primary={formatDeletedLabel(deal.dealNameSnapshot, deal.isDeleted)}
                secondary={deal.dealStatusSnapshot}
                trailing={formatDate(deal.dealExpectedEndDateSnapshot)}
              />
            </Link>
          ))}
        </div>
      )}
    </MeetingNoteLinkedTableFrame>
  );
}

function MeetingNoteLinkedTableFrame({
  children,
  count,
  title,
}: {
  readonly children: ReactNode;
  readonly count: number;
  readonly title: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <div className="flex h-[48px] shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
        <span className="text-[14px] font-extrabold text-[#111827]">{title}</span>
        <span className="text-[13px] font-semibold text-[#9CA3AF]">{count}</span>
      </div>
      {children}
    </div>
  );
}

function MeetingNoteLinkedRow({
  icon,
  iconClassName,
  primary,
  secondary,
  showChevron = true,
  trailing,
}: {
  readonly icon: ReactNode;
  readonly iconClassName: string;
  readonly primary: string;
  readonly secondary: string;
  readonly showChevron?: boolean;
  readonly trailing?: string;
}) {
  return (
    <div className="flex h-[58px] items-center gap-3 border-b border-[#F3F4F6] bg-white px-4 transition-colors last:border-0 hover:bg-[#F9FAFB]">
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <span
          className="block truncate text-[13px] font-extrabold text-[#111827]"
          title={primary}
        >
          {primary}
        </span>
        <span
          className="block truncate text-[11px] font-semibold leading-4 text-[#9CA3AF]"
          title={secondary}
        >
          {secondary}
        </span>
      </div>
      {trailing ? (
        <span className="max-w-[88px] truncate text-right text-[11px] font-semibold text-[#6B7280]">
          {trailing}
        </span>
      ) : null}
      {showChevron ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
      ) : null}
    </div>
  );
}

function MeetingNoteLinkedEmpty({ text }: { readonly text: string }) {
  return <p className="px-4 py-4 text-[13px] text-[#9CA3AF]">{text}</p>;
}

function MeetingNoteTextPanel({
  title,
  value,
}: {
  readonly title: string;
  readonly value: string | null;
}) {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <h2 className="mb-3 text-[14px] font-extrabold text-[#111827]">{title}</h2>
      <p className="min-h-[88px] whitespace-pre-wrap text-[14px] leading-7 text-[#374151]">
        {value?.trim() || "-"}
      </p>
    </section>
  );
}

function MeetingNoteEditPanel({
  detail,
  formId,
  onError,
  onPendingChange,
  onSaved,
}: {
  readonly detail: MeetingNote;
  readonly formId?: string;
  readonly onError: (message: string | null) => void;
  readonly onPendingChange?: (isPending: boolean) => void;
  readonly onSaved: (meetingNote: MeetingNote) => void;
}) {
  const updateMutation = useUpdateMeetingNoteMutation();
  const companyOptionsQuery = useDealCompanyOptions();
  const contactOptionsQuery = useDealContactOptions();
  const productOptionsQuery = useDealProductOptions();
  const dealOptionsQuery = useDealList({ page: 1, sort: "createdAtDesc" });
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<MeetingNoteDetailEditFormValues>({
    defaultValues: toMeetingNoteDetailEditFormValues(detail),
    resolver: zodResolver(meetingNoteDetailEditSchema),
  });
  const companyIds = useWatch({ control, name: "companyIds" }) ?? [];
  const contactIds = useWatch({ control, name: "contactIds" }) ?? [];
  const productIds = useWatch({ control, name: "productIds" }) ?? [];
  const dealIds = useWatch({ control, name: "dealIds" }) ?? [];
  const companyOptions = useMemo(
    () =>
      mergeEntityOptions(
        (companyOptionsQuery.data ?? []).map((company) => ({
          id: company.id,
          label: company.companyName,
        })),
        toCompanyEntityOptions(detail.companies),
      ),
    [companyOptionsQuery.data, detail.companies],
  );
  const allContactOptions = useMemo(
    () =>
      mergeEntityOptions<ContactEntitySelectOption>(
        (contactOptionsQuery.data ?? []).map((contact) => ({
          companyId: contact.companyId,
          description: contact.label,
          id: contact.id,
          label: contact.username,
        })),
        toContactEntityOptions(detail.contacts),
      ),
    [contactOptionsQuery.data, detail.contacts],
  );
  const productOptions = useMemo(
    () =>
      mergeEntityOptions(
        (productOptionsQuery.data ?? []).map((product) => ({
          description: [
            product.productCategory.categoryName,
            product.productStatus.statusName,
          ]
            .filter(Boolean)
            .join(" / "),
          id: product.id,
          label: product.productName,
        })),
        toProductEntityOptions(detail.products),
      ),
    [productOptionsQuery.data, detail.products],
  );
  const dealOptions = useMemo(
    () =>
      mergeEntityOptions(
        (dealOptionsQuery.data?.items ?? []).map((deal) => ({
          description: [
            deal.companies.map((company) => company.companyName).join(", "),
            deal.contacts.map((contact) => contact.username).join(", "),
          ]
            .filter(Boolean)
            .join(" / "),
          id: deal.id,
          label: deal.dealName,
        })),
        toDealEntityOptions(detail.deals),
      ),
    [dealOptionsQuery.data?.items, detail.deals],
  );
  const selectedCompanyIdSet = new Set(companyIds);
  const contactOptions =
    companyIds.length > 0
      ? allContactOptions.filter(
          (contact) =>
            contact.companyId && selectedCompanyIdSet.has(contact.companyId),
        )
      : [];

  useEffect(() => {
    reset(toMeetingNoteDetailEditFormValues(detail));
  }, [detail, reset]);

  useEffect(() => {
    onPendingChange?.(updateMutation.isPending);
  }, [onPendingChange, updateMutation.isPending]);

  const onCompanyIdsChange = (ids: string[]) => {
    const nextCompanyIdSet = new Set(ids);
    const nextContactIds = contactIds.filter((contactId) => {
      const contact = allContactOptions.find((option) => option.id === contactId);

      if (!contact) {
        return false;
      }

      return contact.companyId
        ? nextCompanyIdSet.has(contact.companyId)
        : false;
    });

    setValue("companyIds", ids, { shouldDirty: true, shouldValidate: true });
    setValue("contactIds", nextContactIds, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    onError(null);

    try {
      const updated = await updateMutation.mutateAsync(
        toMeetingNoteDetailUpdateInput(detail.id, values),
      );
      reset(toMeetingNoteDetailEditFormValues(updated));
      onSaved(updated);
    } catch (error) {
      onError(getApiErrorMessage(error));
    }
  });

  return (
    <form
      className="grid gap-4"
      id={formId}
      onSubmit={onSubmit}
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
        <MeetingNoteEditField
          errorMessage={errors.title?.message}
          id="meeting-note-detail-title"
          label="회의록 제목"
          register={register("title")}
        />
        <MeetingNoteEditField
          errorMessage={errors.meetingLocalDateTime?.message}
          id="meeting-note-detail-meeting-at"
          label="미팅 일시"
          register={register("meetingLocalDateTime")}
          type="datetime-local"
        />
      </div>

      <ModalFormRow className="gap-3" columns={2}>
        <EntityMultiSelectField
                    emptyText="새 회사를 등록하면 여기에서 볼 수 있어요."
          errorMessage={errors.companyIds?.message}
          icon={Building2}
          id="meeting-note-detail-company-ids"
          isLoading={companyOptionsQuery.isFetching}
          label="회사"
          options={companyOptions}
          selectedIds={companyIds}
          onChange={onCompanyIdsChange}
        />
        <EntityMultiSelectField
          emptyText={
            companyIds.length > 0
                      ? "담당자를 연결하면 선택한 회사에서 볼 수 있어요."
                      : "회사를 먼저 선택해 주세요."
          }
          errorMessage={errors.contactIds?.message}
          icon={IdCard}
          id="meeting-note-detail-contact-ids"
          isLoading={contactOptionsQuery.isFetching}
          label="담당자"
          options={contactOptions}
          selectedIds={contactIds}
          onChange={(ids) =>
            setValue("contactIds", ids, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </ModalFormRow>

      <ModalFormRow className="gap-3" columns={2}>
        <EntityMultiSelectField
                    emptyText="새 제품을 등록하면 여기에서 볼 수 있어요."
          errorMessage={errors.productIds?.message}
          icon={Package}
          id="meeting-note-detail-product-ids"
          isLoading={productOptionsQuery.isFetching}
          label="제품(옵션)"
          options={productOptions}
          selectedIds={productIds}
          onChange={(ids) =>
            setValue("productIds", ids, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <EntityMultiSelectField
                    emptyText="새 딜을 등록하면 여기에서 볼 수 있어요."
          errorMessage={errors.dealIds?.message}
          icon={BriefcaseBusiness}
          id="meeting-note-detail-deal-ids"
          isLoading={dealOptionsQuery.isFetching}
          label="딜(옵션)"
          options={dealOptions}
          selectedIds={dealIds}
          onChange={(ids) =>
            setValue("dealIds", ids, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </ModalFormRow>

      <MeetingNoteEditTextArea
        errorMessage={errors.details?.message}
        id="meeting-note-detail-details"
        label="상세 내용"
        register={register("details")}
        rows={8}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <MeetingNoteEditTextArea
          errorMessage={errors.nextPlan?.message}
          id="meeting-note-detail-next-plan"
          label="다음 계획"
          register={register("nextPlan")}
          rows={4}
        />
        <MeetingNoteEditTextArea
          errorMessage={errors.requiredAction?.message}
          id="meeting-note-detail-required-action"
          label="필요 액션"
          register={register("requiredAction")}
          rows={4}
        />
      </div>

    </form>
  );
}

function MeetingNoteEditField({
  errorMessage,
  id,
  label,
  register,
  type = "text",
}: {
  readonly errorMessage?: string;
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly type?: "datetime-local" | "text";
}) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-[12px] font-semibold text-[#6B7280]">{label}</span>
      <input
        aria-describedby={errorMessage ? `${id}-message` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-lg border border-[#DDE3EE] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
        id={id}
        type={type}
        {...register}
      />
      {errorMessage ? (
        <span className="text-[12px] text-[#B91C1C]" id={`${id}-message`}>
          {errorMessage}
        </span>
      ) : null}
    </label>
  );
}

function MeetingNoteEditTextArea({
  errorMessage,
  id,
  label,
  register,
  rows,
}: {
  readonly errorMessage?: string;
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly rows: number;
}) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-[12px] font-semibold text-[#6B7280]">{label}</span>
      <textarea
        aria-describedby={errorMessage ? `${id}-message` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="resize-none rounded-lg border border-[#DDE3EE] bg-white px-3 py-2 text-[14px] leading-6 text-[#111827] outline-none transition focus:border-[#4880EE] focus:ring-1 focus:ring-[#4880EE]"
        id={id}
        rows={rows}
        {...register}
      />
      {errorMessage ? (
        <span className="text-[12px] text-[#B91C1C]" id={`${id}-message`}>
          {errorMessage}
        </span>
      ) : null}
    </label>
  );
}

function MeetingNoteStateShell({ children }: { readonly children: ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-var(--topbar-height))] bg-[#F9FAFB] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  );
}

function MeetingNoteDetailSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="h-16 animate-pulse rounded-lg bg-white" />
      <div className="h-24 animate-pulse rounded-lg bg-white" />
      <div className="grid gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="h-36 animate-pulse rounded-lg bg-white" key={index} />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-white" />
    </div>
  );
}

function MeetingNoteDetailError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-white py-8 text-center">
      <p className="text-sm text-destructive">
        {typeof error === "string" ? error : getApiErrorMessage(error)}
      </p>
      <button
        className="inline-flex h-9 items-center rounded-md border px-3 text-sm hover:bg-muted"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function toMeetingNoteDetailEditFormValues(
  meetingNote: MeetingNote,
): MeetingNoteDetailEditFormValues {
  return {
    companyIds: toActiveCompanyIds(meetingNote.companies),
    contactIds: toActiveContactIds(meetingNote.contacts),
    dealIds: toActiveDealIds(meetingNote.deals),
    details: meetingNote.details,
    meetingLocalDateTime: meetingNote.meetingLocalDateTime?.slice(0, 16) ?? "",
    nextPlan: meetingNote.nextPlan ?? "",
    productIds: toActiveProductIds(meetingNote.products),
    requiredAction: meetingNote.requiredAction ?? "",
    title: meetingNote.title,
  };
}

function toMeetingNoteDetailUpdateInput(
  meetingNoteId: string,
  values: MeetingNoteDetailEditFormValues,
): UpdateMeetingNoteInput {
  return {
    companies: values.companyIds.map((companyId) => ({ companyId })),
    contacts: values.contactIds.map((contactId) => ({ contactId })),
    deals: (values.dealIds ?? []).map((dealId) => ({ dealId })),
    details: values.details.trim(),
    meetingLocalDateTime: values.meetingLocalDateTime.trim(),
    meetingNoteId,
    nextPlan: toOptionalText(values.nextPlan),
    products: (values.productIds ?? []).map((productId) => ({ productId })),
    requiredAction: toOptionalText(values.requiredAction),
    sourceType: "MANUAL",
    title: values.title.trim(),
  };
}

// 기능 : 삭제되지 않은 회의록 연결 회사 ID만 수정 기본값으로 추출합니다.
function toActiveCompanyIds(companies: readonly MeetingNoteCompany[]) {
  return companies
    .filter((company) => company.companyId && !company.isDeleted)
    .map((company) => company.companyId as string);
}

// 기능 : 삭제되지 않은 회의록 연결 담당자 ID만 수정 기본값으로 추출합니다.
function toActiveContactIds(contacts: readonly MeetingNoteContact[]) {
  return contacts
    .filter((contact) => contact.contactId && !contact.isDeleted)
    .map((contact) => contact.contactId as string);
}

// 기능 : 삭제되지 않은 회의록 연결 제품 ID만 수정 기본값으로 추출합니다.
function toActiveProductIds(products: readonly MeetingNoteProduct[]) {
  return products
    .filter((product) => product.productId && !product.isDeleted)
    .map((product) => product.productId as string);
}

// 기능 : 삭제되지 않은 회의록 연결 딜 ID만 수정 기본값으로 추출합니다.
function toActiveDealIds(deals: readonly MeetingNoteDeal[]) {
  return deals
    .filter((deal) => !deal.isDeleted)
    .map((deal) => deal.dealId);
}

type ContactEntitySelectOption = EntitySelectOption & {
  readonly companyId: string | null;
};

// 기능 : API 옵션에 현재 회의록의 활성 연결 옵션을 보강합니다.
function mergeEntityOptions<TOption extends EntitySelectOption>(
  options: readonly TOption[],
  currentOptions: readonly TOption[],
): TOption[] {
  const optionIds = new Set(options.map((option) => option.id));
  const missingOptions = currentOptions.filter(
    (option) => !optionIds.has(option.id),
  );

  return [...options, ...missingOptions];
}

// 기능 : 회의록 연결 회사 snapshot을 수정 모달 옵션 형태로 변환합니다.
function toCompanyEntityOptions(
  companies: readonly MeetingNoteCompany[],
): EntitySelectOption[] {
  return companies
    .filter((company) => company.companyId && !company.isDeleted)
    .map((company) => ({
      description: [
        company.companyFieldSnapshot,
        company.companyRegionSnapshot,
      ]
        .filter(Boolean)
        .join(" / "),
      id: company.companyId as string,
      label: company.companyNameSnapshot,
    }));
}

// 기능 : 회의록 연결 담당자 snapshot을 수정 모달 옵션 형태로 변환합니다.
function toContactEntityOptions(
  contacts: readonly MeetingNoteContact[],
): ContactEntitySelectOption[] {
  return contacts
    .filter(
      (contact) =>
        contact.contactId && contact.companyId && !contact.isDeleted,
    )
    .map((contact) => ({
      companyId: contact.companyId,
      description: [
        contact.companyNameSnapshot,
        contact.departmentSnapshot,
        contact.jobGradeSnapshot,
      ]
        .filter(Boolean)
        .join(" / "),
      id: contact.contactId as string,
      label: contact.contactUsernameSnapshot,
    }));
}

// 기능 : 회의록 연결 제품 snapshot을 수정 모달 옵션 형태로 변환합니다.
function toProductEntityOptions(
  products: readonly MeetingNoteProduct[],
): EntitySelectOption[] {
  return products
    .filter((product) => product.productId && !product.isDeleted)
    .map((product) => ({
      description: [
        product.productCategorySnapshot,
        product.productStatusSnapshot,
        product.productPriceSnapshot !== null
          ? formatMoney(product.productPriceSnapshot, "KRW")
          : null,
      ]
        .filter(Boolean)
        .join(" / "),
      id: product.productId as string,
      label: product.productNameSnapshot,
    }));
}

// 기능 : 회의록 연결 딜 snapshot을 수정 모달 옵션 형태로 변환합니다.
function toDealEntityOptions(
  deals: readonly MeetingNoteDeal[],
): EntitySelectOption[] {
  return deals
    .filter((deal) => !deal.isDeleted)
    .map((deal) => ({
      description: [
        deal.dealStatusSnapshot,
        formatMoney(deal.dealCostSnapshot, "KRW"),
        formatDate(deal.dealExpectedEndDateSnapshot),
      ]
        .filter(Boolean)
        .join(" / "),
      id: deal.dealId,
      label: deal.dealNameSnapshot,
    }));
}

function toOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0 ? trimmed : undefined;
}

function formatMeetingDate(value: string | null) {
  return getMeetingDateParts(value).full;
}

function formatMeetingNoteCompanySummary(detail: MeetingNote) {
  return (
    detail.companies
      .map((company) =>
        formatDeletedLabel(company.companyNameSnapshot, company.isDeleted),
      )
      .join(", ") ||
    "-"
  );
}

function formatMeetingNoteContactSummary(detail: MeetingNote) {
  return (
    detail.contacts
      .map((contact) =>
        formatDeletedLabel(contact.contactUsernameSnapshot, contact.isDeleted),
      )
      .join(", ") || "-"
  );
}

function formatMeetingNoteDealSummary(detail: MeetingNote) {
  return (
    detail.deals
      .map((deal) => formatDeletedLabel(deal.dealNameSnapshot, deal.isDeleted))
      .join(", ") || "-"
  );
}

function formatDeletedLabel(label: string, isDeleted: boolean): string {
  return isDeleted ? `${label} (삭제됨)` : label;
}

function getMeetingNoteLinkedListClass(count: number) {
  return count > 2 ? MEETING_NOTE_LINKED_LIST_SCROLL_CLASS : "";
}

function getMeetingNoteSourceClass(sourceType: MeetingNoteSourceType) {
  switch (sourceType) {
    case "MANUAL":
      return "bg-slate-100 text-slate-700";
    case "TEXT_AI":
      return "bg-blue-100 text-blue-700";
    case "STT_AI":
      return "bg-violet-100 text-violet-700";
  }
}
