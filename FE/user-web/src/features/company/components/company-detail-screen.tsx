import {
  BriefcaseBusiness,
  Building2,
  Check,
  Copy,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Pencil,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
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
  toCreateCompanyMemoLogInput,
  toUpdateCompanyMemoLogInput,
  toCreateCompanyPrivateMemoLogInput,
  toUpdateCompanyPrivateMemoLogInput,
  companyMemoLogFormSchema,
  companyPrivateMemoLogFormSchema,
  emptyCompanyMemoLogFormValues,
  emptyCompanyPrivateMemoLogFormValues,
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

const COMPANY_DETAIL_FULL_WIDTH_STORAGE_KEY = "onehand.company.detail.fullWidth";
const COMPANY_DETAIL_SMALL_TEXT_STORAGE_KEY = "onehand.company.detail.smallText";
const COMPANY_RELATED_SECTION_CLASS_NAME =
  "rounded-lg bg-[#FAF9F6] px-4 pb-4";

export function CompanyDetailScreen({ companyId }: CompanyDetailScreenProps) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeDescription, setNoticeDescription] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(() =>
    readStoredBoolean(COMPANY_DETAIL_FULL_WIDTH_STORAGE_KEY, false)
  );
  const [isSmallText, setIsSmallText] = useState(() =>
    readStoredBoolean(COMPANY_DETAIL_SMALL_TEXT_STORAGE_KEY, false)
  );
  const pageMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    window.localStorage.setItem(
      COMPANY_DETAIL_FULL_WIDTH_STORAGE_KEY,
      String(isFullWidth)
    );
  }, [isFullWidth]);

  useEffect(() => {
    window.localStorage.setItem(
      COMPANY_DETAIL_SMALL_TEXT_STORAGE_KEY,
      String(isSmallText)
    );
  }, [isSmallText]);

  useEffect(() => {
    if (!isPageMenuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!pageMenuRef.current?.contains(event.target as Node)) {
        setIsPageMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPageMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isPageMenuOpen]);

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
  const contentWidthClassName = isFullWidth ? "max-w-[1444px]" : "max-w-[678px]";
  const twoColumnSectionsClassName = isFullWidth
    ? "grid gap-y-5 lg:grid-cols-2 lg:gap-x-10"
    : "grid gap-5";

  const showNotice = (message: string, description?: string) => {
    setNotice(message);
    setNoticeDescription(description ?? null);
  };

  const clearNotice = () => {
    setNotice(null);
    setNoticeDescription(null);
  };

  const onCopyEmail = async (email: string) => {
    try {
      await copyTextToClipboard(email);
    } catch {
      // Ignore clipboard failures; copying from the inline icon should stay silent.
    }
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

  return (
    <>
      <div className="flex min-h-full flex-col bg-white">
        <header className="flex h-11 shrink-0 items-center px-4">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px]">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <Link
              className="truncate font-semibold text-[#6B7280] transition hover:text-[#111827]"
              title="회사 목록으로 이동"
              to="/app/companies"
            >
              회사
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="truncate font-semibold text-[#111827]">
              {company.companyName}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              className="inline-flex h-8 items-center justify-center rounded-md px-2 text-[13px] font-semibold text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
              onClick={() => setIsEditOpen(true)}
              type="button"
            >
              수정
            </button>
            <div className="relative" ref={pageMenuRef}>
              <button
                aria-expanded={isPageMenuOpen}
                aria-haspopup="menu"
                aria-label="회사 페이지 옵션"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                onClick={() => setIsPageMenuOpen((open) => !open)}
                title="회사 페이지 옵션"
                type="button"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {isPageMenuOpen ? (
                <CompanyPageOptionsMenu
                  isDeleting={deleteCompanyMutation.isPending}
                  isFullWidth={isFullWidth}
                  isSmallText={isSmallText}
                  onDelete={() => {
                    setIsPageMenuOpen(false);
                    setDeleteConfirmOpen(true);
                  }}
                  onToggleFullWidth={() =>
                    setIsFullWidth((current) => !current)
                  }
                  onToggleSmallText={() =>
                    setIsSmallText((current) => !current)
                  }
                />
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-20 pt-14">
          <div
            className={`mx-auto grid min-h-full w-full ${contentWidthClassName} content-start gap-5`}
          >
            {notice ? (
              <Toast
                description={noticeDescription ?? undefined}
                message={notice}
                onClose={clearNotice}
                variant="success"
              />
            ) : null}
            {actionError ? (
              <Toast
                message={actionError}
                onClose={() => setActionError(null)}
                variant="error"
              />
            ) : null}

            <CompanySummaryHeader
              company={company}
              contactCount={contacts.length}
              dealCount={deals.length}
              isSmallText={isSmallText}
            />

            <div className={twoColumnSectionsClassName}>
              <ConnectedContactsTable
                contacts={contacts}
                isLoading={contactsQuery.isLoading}
                isSmallText={isSmallText}
                onCopyEmail={onCopyEmail}
              />
              <ConnectedDealsTable
                deals={deals}
                isLoading={dealsQuery.isLoading}
                isSmallText={isSmallText}
              />
            </div>

            <div className={twoColumnSectionsClassName}>
              <MemoPanel
                companyId={companyId}
                memoLogs={memoLogs}
                isLoading={memoLogsQuery.isLoading}
                hasNext={Boolean(memoLogsQuery.hasNextPage)}
                isFetchingNext={memoLogsQuery.isFetchingNextPage}
                isSmallText={isSmallText}
                onFetchMore={() => void memoLogsQuery.fetchNextPage()}
                onChanged={showNotice}
              />
              <ActivityLogPanel
                companyId={companyId}
                privateMemoLogs={privateMemoLogs}
                isLoading={privateMemoLogsQuery.isLoading}
                hasNext={Boolean(privateMemoLogsQuery.hasNextPage)}
                isFetchingNext={privateMemoLogsQuery.isFetchingNextPage}
                isSmallText={isSmallText}
                onFetchMore={() => void privateMemoLogsQuery.fetchNextPage()}
                onChanged={showNotice}
              />
            </div>
          </div>
        </main>
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

// ── Company Document Header ─────────────────────────────────────────

function CompanySummaryHeader({
  company,
  contactCount,
  dealCount,
  isSmallText,
}: {
  readonly company: CompanyDetail;
  readonly contactCount: number;
  readonly dealCount: number;
  readonly isSmallText: boolean;
}) {
  return (
    <section className="grid cursor-auto gap-6">
      <div className="grid gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#94A3B8]">
          <Building2 className="h-11 w-11" />
        </div>
        <h1
          className={`min-w-0 break-words font-semibold leading-tight text-[#111827] ${
            isSmallText ? "text-[34px]" : "text-[42px]"
          }`}
        >
          {company.companyName}
        </h1>
      </div>

      <div className="grid gap-1 py-3">
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          <CompanyDocumentProperty
            label="분야"
            isSmallText={isSmallText}
            value={company.companyField.field}
          />
          <CompanyDocumentProperty
            label="지역"
            isSmallText={isSmallText}
            value={company.companyRegion.region}
          />
          <CompanyDocumentProperty
            isSmallText={isSmallText}
            label="담당자"
            value={`${contactCount}명`}
          />
          <CompanyDocumentProperty
            isSmallText={isSmallText}
            label="딜"
            value={`${dealCount}건`}
          />
        </div>
      </div>
    </section>
  );
}

function CompanyDocumentProperty({
  isSmallText,
  label,
  value,
}: {
  readonly isSmallText: boolean;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div
      className={`grid min-h-8 grid-cols-[96px_minmax(0,1fr)] items-center gap-3 ${
        isSmallText ? "text-[13px]" : "text-[14px]"
      }`}
    >
      <span className="font-semibold text-[#94A3B8]">{label}</span>
      <span className="min-w-0 break-words font-medium text-[#111827]">
        {value}
      </span>
    </div>
  );
}

function CompanyDocumentSectionHeader({
  isSmallText,
  title,
  count,
}: {
  readonly isSmallText: boolean;
  readonly title: string;
  readonly count?: number;
}) {
  return (
    <div className="flex min-h-8 items-center gap-2">
      <h2
        className={`font-semibold text-[#111827] ${
          isSmallText ? "text-[14px]" : "text-[15px]"
        }`}
      >
        {title}
      </h2>
      {count !== undefined ? (
        <span className="text-[13px] font-semibold text-[#94A3B8]">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function CompanyEmptyText({
  children,
  isSmallText,
}: {
  readonly children: string;
  readonly isSmallText: boolean;
}) {
  return (
    <p
      className={`py-3 font-medium text-[#94A3B8] ${
        isSmallText ? "text-[12px]" : "text-[13px]"
      }`}
    >
      {children}
    </p>
  );
}

function CompanyLoadingRows({ count = 3 }: { readonly count?: number }) {
  return (
    <div className="grid gap-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="h-10 animate-pulse rounded-md bg-[#F3F4F6]"
          key={index}
        />
      ))}
    </div>
  );
}

function CompanyDocumentSection({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <section className={`grid gap-3 pt-3 ${className}`}>
      {children}
    </section>
  );
}

function CompanyPageOptionsMenu({
  isDeleting,
  isFullWidth,
  isSmallText,
  onDelete,
  onToggleFullWidth,
  onToggleSmallText,
}: {
  readonly isDeleting: boolean;
  readonly isFullWidth: boolean;
  readonly isSmallText: boolean;
  readonly onDelete: () => void;
  readonly onToggleFullWidth: () => void;
  readonly onToggleSmallText: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-9 z-50 w-[220px] rounded-lg border border-[#E5E7EB] bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
      role="menu"
    >
      <CompanyPageOptionToggle
        checked={isSmallText}
        label="작은 텍스트"
        onClick={onToggleSmallText}
      />
      <CompanyPageOptionToggle
        checked={isFullWidth}
        label="전체 너비"
        onClick={onToggleFullWidth}
      />
      <button
        className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isDeleting}
        onClick={onDelete}
        role="menuitem"
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        휴지통으로 이동
      </button>
    </div>
  );
}

function CompanyPageOptionToggle({
  checked,
  label,
  onClick,
}: {
  readonly checked: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className="flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-[13px] font-medium text-[#374151] transition hover:bg-[#F3F4F6]"
      onClick={onClick}
      role="menuitemcheckbox"
      aria-checked={checked}
      type="button"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? "bg-[#4880EE]" : "bg-[#E5E7EB]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

// ── Connected Contacts Table ────────────────────────────────────────

function ConnectedContactsTable({
  contacts,
  isLoading,
  isSmallText,
  onCopyEmail,
}: {
  readonly contacts: CompanyContact[];
  readonly isLoading: boolean;
  readonly isSmallText: boolean;
  readonly onCopyEmail: (email: string) => Promise<void>;
}) {
  const SHOW_LIMIT = 3;
  const hasMore = contacts.length > SHOW_LIMIT;
  const [copiedContactId, setCopiedContactId] = useState<string | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  const onClickCopyEmail = (contact: CompanyContact) => {
    if (copiedTimerRef.current) {
      clearTimeout(copiedTimerRef.current);
    }

    setCopiedContactId(contact.id);
    void onCopyEmail(contact.email);

    copiedTimerRef.current = setTimeout(() => {
      setCopiedContactId(null);
      copiedTimerRef.current = null;
    }, 800);
  };

  return (
    <CompanyDocumentSection className={COMPANY_RELATED_SECTION_CLASS_NAME}>
      <CompanyDocumentSectionHeader
        count={contacts.length}
        isSmallText={isSmallText}
        title="연결 담당자"
      />
      {isLoading ? (
        <CompanyLoadingRows />
      ) : contacts.length === 0 ? (
        <CompanyEmptyText isSmallText={isSmallText}>
          담당자를 연결하면 여기에서 볼 수 있어요.
        </CompanyEmptyText>
      ) : (
        <div
          className={
            hasMore
              ? "max-h-[168px] overflow-x-hidden overflow-y-auto pr-1"
              : "overflow-x-hidden"
          }
        >
          {contacts.map((contact) => {
            const jobGradeName = contact.contactJobGrade?.jobGradeName;
            const isEmailCopied = copiedContactId === contact.id;

            return (
              <div
                className="flex min-h-[56px] min-w-0 items-start gap-2.5 py-2 transition-colors hover:bg-[#F9FAFB]"
                key={contact.id}
              >
                <Link
                  aria-label={`${contact.username} 상세 보기`}
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE]"
                  to={`/app/contacts/${contact.id}`}
                >
                  <UserRound className="h-3.5 w-3.5 text-[#4880EE]" />
                </Link>
                <div className="grid min-w-0 flex-1 gap-x-3 gap-y-1 sm:grid-cols-[minmax(120px,0.85fr)_minmax(0,1.15fr)]">
                  <Link
                    className="min-w-0"
                    to={`/app/contacts/${contact.id}`}
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={`truncate font-extrabold text-[#111827] ${
                          isSmallText ? "text-[12px]" : "text-[13px]"
                        }`}
                      >
                        {contact.username}
                      </span>
                      {jobGradeName ? (
                        <span
                          className={`shrink-0 font-extrabold text-[#111827] ${
                            isSmallText ? "text-[12px]" : "text-[13px]"
                          }`}
                        >
                          {jobGradeName}
                        </span>
                      ) : null}
                    </div>
                    <span className="mt-0.5 block min-w-0 truncate text-[11px] font-semibold leading-4 text-[#94A3B8]">
                      {contact.contactDepartment.departmentName}
                    </span>
                  </Link>
                  <div
                    className={`grid min-w-0 content-start gap-0.5 font-medium leading-4 text-[#6B7280] ${
                      isSmallText ? "text-[11px]" : "text-[12px]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <button
                        aria-label={`${contact.email} 복사`}
                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded transition duration-150 hover:bg-[#EFF6FF] hover:text-[#4880EE] ${
                          isEmailCopied
                            ? "scale-110 text-[#4880EE]"
                            : "scale-100 text-[#94A3B8]"
                        }`}
                        onClick={() => onClickCopyEmail(contact)}
                        title="이메일 복사"
                        type="button"
                      >
                        {isEmailCopied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      <Link
                        className="min-w-0 max-w-full truncate"
                        to={`/app/contacts/${contact.id}`}
                      >
                        {contact.email}
                      </Link>
                    </div>
                    <Link
                      className="min-w-0 max-w-full truncate"
                      to={`/app/contacts/${contact.id}`}
                    >
                      {contact.mobile}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CompanyDocumentSection>
  );
}

// ── Connected Deals Table ───────────────────────────────────────────

function ConnectedDealsTable({
  deals,
  isLoading,
  isSmallText,
}: {
  readonly deals: CompanyDeal[];
  readonly isLoading: boolean;
  readonly isSmallText: boolean;
}) {
  const SHOW_LIMIT = 3;
  const hasMore = deals.length > SHOW_LIMIT;

  return (
    <CompanyDocumentSection className={COMPANY_RELATED_SECTION_CLASS_NAME}>
      <CompanyDocumentSectionHeader
        count={deals.length}
        isSmallText={isSmallText}
        title="연결 딜"
      />
      {isLoading ? (
        <CompanyLoadingRows />
      ) : deals.length === 0 ? (
        <CompanyEmptyText isSmallText={isSmallText}>
          딜을 연결하면 여기에서 볼 수 있어요.
        </CompanyEmptyText>
      ) : (
        <div
          className={
            hasMore
              ? "max-h-[168px] overflow-x-hidden overflow-y-auto pr-1"
              : "overflow-x-hidden"
          }
        >
          {deals.map((deal) => (
            <Link
              className="flex min-h-[56px] min-w-0 items-start gap-2.5 py-2 transition-colors hover:bg-[#F9FAFB]"
              key={deal.id}
              to={`/app/deals/${deal.id}`}
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2]">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-[#DC2626]" />
              </div>
              <div className="grid min-w-0 flex-1 gap-x-3 gap-y-1 sm:grid-cols-[minmax(120px,0.85fr)_minmax(0,1.15fr)]">
                <div className="min-w-0">
                  <span
                    className={`block min-w-0 truncate font-extrabold text-[#111827] ${
                      isSmallText ? "text-[12px]" : "text-[13px]"
                    }`}
                  >
                    {deal.dealName}
                  </span>
                  <span
                    className={`mt-0.5 block min-w-0 truncate font-medium leading-4 text-[#9CA3AF] ${
                      isSmallText ? "text-[11px]" : "text-[12px]"
                    }`}
                  >
                    {formatDate(deal.createdAt, { includeYear: true })}
                  </span>
                </div>
                <div
                  className={`grid min-w-0 content-start font-medium leading-4 text-[#6B7280] ${
                    isSmallText ? "text-[11px]" : "text-[12px]"
                  }`}
                >
                  <span
                    className={`min-w-0 max-w-full truncate font-semibold text-[#374151] ${
                      isSmallText ? "text-[12px]" : "text-[13px]"
                    }`}
                  >
                    ₩{deal.dealCost.toLocaleString("ko-KR")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </CompanyDocumentSection>
  );
}

// ── Memo Panel ──────────────────────────────────────────────────────

function TimelineMarker() {
  return (
    <div className="relative flex w-[8px] shrink-0 self-stretch items-start justify-center pt-[16px]">
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
  isSmallText,
  onFetchMore,
  onChanged,
}: {
  readonly companyId: string;
  readonly memoLogs: CompanyMemoLog[];
  readonly isLoading: boolean;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly isSmallText: boolean;
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
    <CompanyDocumentSection>
      <div className="flex min-h-8 items-center gap-2">
        <CompanyDocumentSectionHeader
          count={memoLogs.length}
          isSmallText={isSmallText}
          title="회사 로그"
        />
        <div className="flex-1" />
        <button
          aria-label="회사 로그 추가"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#4880EE] transition-colors hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
          onClick={() => setIsCreateOpen(true)}
          title="회사 로그 추가"
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1">
        {isLoading ? (
          <CompanyLoadingRows count={2} />
        ) : memoLogs.length === 0 ? (
          <CompanyEmptyText isSmallText={isSmallText}>
            회사 로그를 추가하면 여기에서 볼 수 있어요.
          </CompanyEmptyText>
        ) : (
          memoLogs.map((log) => (
              <div
                className="group flex gap-3"
                key={log.id}
              >
                {/* 제목 행 — 클릭 시 본문 토글 */}
                <TimelineMarker />
                <div className="min-w-0 flex-1">
                <button
                  className="flex min-h-[40px] w-full items-center bg-white text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <span
                    className={`flex-1 truncate font-semibold text-[#111827] ${
                      isSmallText ? "text-[12px]" : "text-[13px]"
                    }`}
                  >
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
                  <p
                    className={`whitespace-pre-wrap pb-3 pt-1 font-medium leading-[1.35] text-[#374151] ${
                      isSmallText ? "text-[12px]" : "text-[13px]"
                    }`}
                  >
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
    </CompanyDocumentSection>
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
  isSmallText,
  onFetchMore,
  onChanged,
}: {
  readonly companyId: string;
  readonly privateMemoLogs: CompanyPrivateMemoLog[];
  readonly isLoading: boolean;
  readonly hasNext: boolean;
  readonly isFetchingNext: boolean;
  readonly isSmallText: boolean;
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
    <CompanyDocumentSection>
      <div className="flex min-h-8 items-center gap-2">
        <CompanyDocumentSectionHeader
          count={privateMemoLogs.length}
          isSmallText={isSmallText}
          title="비밀 메모"
        />
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
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#4880EE] transition-colors hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
          onClick={() => setIsCreateOpen(true)}
          title="비밀 메모 추가"
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1">
        {isLoading ? (
          <CompanyLoadingRows />
        ) : privateMemoLogs.length === 0 ? (
          <CompanyEmptyText isSmallText={isSmallText}>
            비밀 메모를 추가하면 여기에서 볼 수 있어요.
          </CompanyEmptyText>
        ) : (
          privateMemoLogs.map((log) => (
              <div
                className="group flex gap-3"
                key={log.id}
              >
                {/* 1줄 미리보기 행 — 클릭 시 전체 토글 */}
                <TimelineMarker />
                <div className="min-w-0 flex-1">
                <button
                  className="flex min-h-[40px] w-full items-center bg-white text-left"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  type="button"
                >
                  <span
                    className={`flex-1 truncate font-medium text-[#4B5563] ${
                      isSmallText ? "text-[11px]" : "text-[12px]"
                    }`}
                  >
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
                  <p
                    className={`whitespace-pre-wrap pb-3 pt-1 font-medium leading-[1.35] text-[#4B5563] ${
                      isSmallText ? "text-[11px]" : "text-[12px]"
                    }`}
                  >
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
    </CompanyDocumentSection>
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
      <div className="flex h-16 items-center gap-3 bg-white px-6">
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

function readStoredBoolean(key: string, fallback: boolean) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);

  if (stored === "true") {
    return true;
  }
  if (stored === "false") {
    return false;
  }

  return fallback;
}

async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is not available.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Copy command failed.");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}
