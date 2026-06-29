import {
  ChevronDown,
  Download,
  IdCard,
  Plus,
  RotateCcw,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { ContactCreateDialog } from "@/features/contact/components/contact-create-dialog";
import { ContactTaxonomyManageDialog } from "@/features/contact/components/contact-taxonomy-manage-dialog";
import {
  useContactDepartments,
  useContactList,
} from "@/features/contact/hooks/use-contact-list";
import { useCompanyOptions } from "@/features/contact/hooks/use-company-options";
import { useExportContactsMutation } from "@/features/contact/hooks/use-contact-mutations";
import type {
  ContactListItem,
  ContactSort,
} from "@/features/contact/types/contact";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";
import {
  readLocationNotice,
  readLocationNoticeDescription,
} from "@/utils/location-state";

const CONTACT_SORT_OPTIONS: Array<{
  readonly value: ContactSort;
  readonly label: string;
}> = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "usernameAsc", label: "이름순" },
];

const CONTACT_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(84px,0.8fr) minmax(96px,0.9fr) minmax(64px,0.6fr) minmax(54px,0.5fr) minmax(76px,0.7fr) minmax(96px,1fr) minmax(82px,0.65fr)",
};

export function ContactListScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthSession();
  const [usernameText, setUsernameText] = useState("");
  const [username, setUsername] = useState("");
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [contactDepartmentIds, setContactDepartmentIds] = useState<string[]>([]);
  const [sort, setSort] = useState<ContactSort>("createdAtDesc");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);
  const [pendingDepartmentName, setPendingDepartmentName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeDescription, setNoticeDescription] = useState<string | null>(null);
  const [actionError] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      username: username || undefined,
      companyIds: companyIds.length > 0 ? companyIds : undefined,
      contactDepartmentId: contactDepartmentIds[0] ?? undefined,
      sort,
    }),
    [companyIds, contactDepartmentIds, page, sort, username],
  );
  const exportFilters = useMemo(
    () => ({
      username: username || undefined,
      companyIds: companyIds.length > 0 ? companyIds : undefined,
      contactDepartmentId: contactDepartmentIds[0] ?? undefined,
      sort,
    }),
    [companyIds, contactDepartmentIds, sort, username],
  );

  const contactsQuery = useContactList(listParams);
  const departmentsQuery = useContactDepartments();
  const companyOptionsQuery = useCompanyOptions();
  const exportContactsMutation = useExportContactsMutation();

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    setNoticeDescription(readLocationNoticeDescription(location.state));
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const contactList = contactsQuery.data;
  const departments = useMemo(
    () => departmentsQuery.data?.items ?? [],
    [departmentsQuery.data],
  );
  const companyOptions = useMemo(
    () => companyOptionsQuery.data?.items ?? [],
    [companyOptionsQuery.data],
  );

  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const hasSearch =
    username.length > 0 ||
    companyIds.length > 0 ||
    contactDepartmentIds.length > 0 ||
    sort !== "createdAtDesc";

  useEffect(() => {
    if (!pendingDepartmentName) return;
    const matched = departments.find(
      (d) => d.departmentName === pendingDepartmentName,
    );
    if (matched) {
      setContactDepartmentIds((prev) => addUniqueId(prev, matched.id));
      setPage(1);
      setPendingDepartmentName("");
    }
  }, [departments, pendingDepartmentName]);

  useEffect(() => {
    const validIds = new Set(departments.map((d) => d.id));
    const nextIds = contactDepartmentIds.filter((id) => validIds.has(id));
    if (nextIds.length !== contactDepartmentIds.length) {
      setContactDepartmentIds(nextIds);
      setPage(1);
    }
  }, [contactDepartmentIds, departments]);

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUsername(usernameText.trim());
    setPage(1);
  };

  const onExport = async () => {
    const file = await exportContactsMutation.mutateAsync(exportFilters);
    downloadBlobFile(file, "contacts.xlsx");
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "담당자", icon: IdCard }]}
        actions={[
          {
            icon: Download,
            tooltip: "엑셀 다운로드",
            onClick: () => void onExport(),
            disabled: exportContactsMutation.isPending,
          },
          {
            icon: Plus,
            tooltip: "담당자 추가",
            onClick: () => setIsCreateOpen(true),
            variant: "primary",
          },
        ]}
      />

      {/* 검색 + 필터 툴바 (데스크톱) */}
      <div className="hidden min-h-10 shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-1 md:flex lg:gap-2">
        <form
          className="flex h-8 w-[clamp(150px,20vw,220px)] shrink-0 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition hover:border-[#93C5FD] hover:bg-white focus-within:border-[#4880EE] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4880EE]"
          onSubmit={onSearchSubmit}
        >
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(e) => setUsernameText(e.target.value)}
            placeholder="담당자명 검색"
            value={usernameText}
          />
        </form>
        <FilterChip
          active={!hasSearch}
          icon={RotateCcw}
          label="초기화"
          onClick={() => {
            setUsername("");
            setUsernameText("");
            setCompanyIds([]);
            setContactDepartmentIds([]);
            setSort("createdAtDesc");
            setPage(1);
          }}
        />
        <ContactTaxonomyFilterCombobox
          emptyText="조건에 맞는 회사가 없습니다."
          getLabel={(c) => c.companyName}
          itemKindLabel="회사"
          items={companyOptions}
          selectedIds={companyIds}
          size="desktop"
          tone="blue"
          onSelectedIdsChange={(ids) => {
            setCompanyIds(ids);
            setPage(1);
          }}
        />
        <ContactTaxonomyFilterCombobox
          emptyText="조건에 맞는 부서가 없습니다."
          getLabel={(d) => d.departmentName}
          itemKindLabel="부서"
          items={departments}
          selectedIds={contactDepartmentIds}
          size="desktop"
          tone="blue"
          onCreateClick={() => setTaxonomyOpen(true)}
          onSelectedIdsChange={(ids) => {
            setContactDepartmentIds(ids);
            setPage(1);
          }}
        />
        <ListFilterSelect
          active={sort !== "createdAtDesc"}
          ariaLabel="정렬 조건"
          className="w-[clamp(104px,10vw,118px)]"
          onChange={(nextSort) => {
            setSort(nextSort);
            setPage(1);
          }}
          options={CONTACT_SORT_OPTIONS}
          value={sort}
        />
        <div className="flex-1" />
        <span className="shrink-0 text-[12px] text-[#9CA3AF]">
          {contactList?.totalCount ?? 0}명
        </span>
      </div>

      {/* 알림 */}
      {notice || exportContactsMutation.error || actionError ? (
        <div className="hidden px-5 pt-2 md:block">
          {notice ? (
            <Toast
              description={noticeDescription ?? undefined}
              message={notice}
              onClose={() => {
                setNotice(null);
                setNoticeDescription(null);
              }}
              variant="success"
            />
          ) : null}
          {exportContactsMutation.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {getApiErrorMessage(exportContactsMutation.error)}
            </p>
          ) : null}
          {actionError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {actionError}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* 테이블 (데스크톱) */}
      <div className="hidden gap-3 overflow-x-auto px-5 pb-3 pt-1 md:flex xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex w-full min-w-[620px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            {/* 테이블 헤더 (데스크톱) */}
            <div
              className="hidden h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:grid md:px-4 xl:px-6"
              style={CONTACT_TABLE_GRID_STYLE}
            >
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                담당자명
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                회사
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                부서
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                직급
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                핸드폰
              </div>
              <div className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                이메일
              </div>
              <div className="min-w-0 truncate whitespace-nowrap text-[12px] font-semibold text-[#64748B]">
                등록일
              </div>
            </div>

            {contactsQuery.isLoading ? (
              <ContactListSkeleton />
            ) : contactsQuery.isError ? (
              <ContactListError
                error={contactsQuery.error}
                onRetry={() => void contactsQuery.refetch()}
              />
            ) : !contactList || contactList.items.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel="담당자 추가"
                icon={IdCard}
                onAction={() => setIsCreateOpen(true)}
                title={
                  hasSearch
                    ? "조건에 맞는 담당자가 없습니다"
                    : "등록된 담당자가 없습니다"
                }
              />
            ) : (
              <div className="min-w-0">
                {contactList.items.map((c) => (
                  <ContactRow
                    contact={c}
                    displayTimeZone={displayTimeZone}
                    key={c.id}
                  />
                ))}
              </div>
            )}
          </div>

          {contactList ? (
            <Pagination
              page={contactList.page}
              totalPages={contactList.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>

      {/* 모바일 뷰 */}
      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        {/* 모바일 알림 */}
        {notice ? (
          <div className="px-4 pt-2">
            <Toast
              description={noticeDescription ?? undefined}
              message={notice}
              onClose={() => {
                setNotice(null);
                setNoticeDescription(null);
              }}
              variant="success"
            />
          </div>
        ) : null}

        {/* 모바일 필터 칩 행 */}
        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <button
            aria-label="초기화"
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#4880EE] bg-[#4880EE] text-[12px] font-bold text-white transition hover:bg-[#4880EE] focus:border-[#4880EE] focus:outline-none focus:ring-1 focus:ring-[#4880EE]",
            )}
            onClick={() => {
              setUsername("");
              setUsernameText("");
              setCompanyIds([]);
              setContactDepartmentIds([]);
              setSort("createdAtDesc");
              setPage(1);
            }}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <ContactTaxonomyFilterCombobox
            emptyText="조건에 맞는 회사가 없습니다."
            getLabel={(c) => c.companyName}
            itemKindLabel="회사"
            items={companyOptions}
            selectedIds={companyIds}
            size="mobile"
            tone="blue"
              onSelectedIdsChange={(ids) => {
              setCompanyIds(ids);
              setPage(1);
            }}
          />
          <ContactTaxonomyFilterCombobox
            emptyText="조건에 맞는 부서가 없습니다."
            getLabel={(d) => d.departmentName}
            itemKindLabel="부서"
            items={departments}
            selectedIds={contactDepartmentIds}
            size="mobile"
            tone="blue"
            onCreateClick={() => setTaxonomyOpen(true)}
            onSelectedIdsChange={(ids) => {
              setContactDepartmentIds(ids);
              setPage(1);
            }}
          />
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {contactList?.totalCount ?? 0}명
          </span>
        </div>

        {/* 모바일 카드 목록 */}
        <div className="bg-white">
          {contactsQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
                />
              ))}
            </div>
          ) : contactsQuery.isError ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <p className="text-[13px] text-red-500">
                {getApiErrorMessage(contactsQuery.error)}
              </p>
              <button
                className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
                onClick={() => void contactsQuery.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </div>
          ) : !contactList || contactList.items.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="담당자 추가"
              icon={IdCard}
              onAction={() => setIsCreateOpen(true)}
              title={
                hasSearch
                  ? "조건에 맞는 담당자가 없습니다"
                  : "등록된 담당자가 없습니다"
              }
            />
          ) : (
            contactList.items.map((contact) => (
              <ContactMobileCard
                key={contact.id}
                contact={contact}
                displayTimeZone={displayTimeZone}
              />
            ))
          )}
        </div>

        {/* 모바일 페이지네이션 */}
        {contactList ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={contactList.page}
              totalPages={contactList.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        {/* FAB */}
        <button
          aria-label="담당자 추가"
          className="fixed bottom-24 right-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#4880EE] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
      </section>

      <ContactCreateDialog
        onCreated={() => setNotice("담당자가 추가되었습니다.")}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
      <ContactTaxonomyManageDialog
        onCreated={(kind, name) => {
          if (kind === "department") setPendingDepartmentName(name);
        }}
        onOpenChange={setTaxonomyOpen}
        open={taxonomyOpen}
      />
    </section>
  );
}

function ContactMobileCard({
  contact,
  displayTimeZone,
}: {
  readonly contact: ContactListItem;
  readonly displayTimeZone: string;
}) {
  const initial = contact.username.charAt(0).toUpperCase();

  return (
    <Link
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] transition active:bg-[#F9FAFB]"
      to={`/contacts/${contact.id}`}
    >
      {/* 이니셜 아바타 */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
        <span className="text-[13px] font-bold text-[#4880EE]">{initial}</span>
      </div>
      {/* 내용 */}
      <div className="min-w-0 flex-1">
        {/* Row1: 이름 + 직급 배지 */}
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {contact.username}
          </span>
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#FEF3C7] px-2 text-[11px] font-semibold text-[#B45309]">
            {contact.contactJobGrade.jobGradeName}
          </span>
        </div>
        {/* Row2: 회사 · 부서 */}
        <p className="mt-0.5 text-[12px] text-[#6B7280]">
          {contact.company.companyName} ·{" "}
          {contact.contactDepartment.departmentName}
        </p>
        {/* Row3: 연락처 + 등록일 */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[12px] text-[#6B7280]">
            {contact.mobile || contact.email || "-"}
          </span>
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {formatContactCreatedAt(contact.createdAt, displayTimeZone)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ContactRow({
  contact,
  displayTimeZone,
}: {
  readonly contact: ContactListItem;
  readonly displayTimeZone: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="grid h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] bg-white px-3 text-left transition-colors last:border-b-0 hover:bg-[#EFF6FF] md:px-4 xl:px-6"
      onClick={() => void navigate(`/contacts/${contact.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void navigate(`/contacts/${contact.id}`);
        }
      }}
      role="button"
      style={CONTACT_TABLE_GRID_STYLE}
      tabIndex={0}
    >
      <div className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {contact.username}
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#F1F5F9] px-2.5 text-[11px] font-semibold text-[#475569]"
          title={contact.company.companyName}
        >
          <span className="min-w-0 truncate whitespace-nowrap">
            {contact.company.companyName}
          </span>
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="block truncate text-[12px] font-medium text-[#4880EE]"
          title={contact.contactDepartment.departmentName}
        >
          {contact.contactDepartment.departmentName}
        </span>
      </div>
      <div className="min-w-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#FEF3C7] px-2.5 text-[11px] font-semibold text-[#B45309]"
          title={contact.contactJobGrade.jobGradeName}
        >
          <span className="min-w-0 truncate whitespace-nowrap">
            {contact.contactJobGrade.jobGradeName}
          </span>
        </span>
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#475569]"
        title={contact.mobile || "-"}
      >
        {contact.mobile || "-"}
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#475569]"
        title={contact.email || "-"}
      >
        {contact.email || "-"}
      </div>
      <div
        className="min-w-0 truncate text-[12px] font-medium text-[#64748B]"
        title={formatContactCreatedAt(contact.createdAt, displayTimeZone)}
      >
        {formatContactCreatedAt(contact.createdAt, displayTimeZone)}
      </div>
    </div>
  );
}

export function ContactCard({
  contact,
  displayTimeZone,
}: {
  readonly contact: ContactListItem;
  readonly displayTimeZone: string;
}) {
  return (
    <Link
      className="flex items-start justify-between gap-4 bg-white px-6 py-3 hover:bg-[#FAFAF8]"
      to={`/contacts/${contact.id}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#111827]">
          {contact.username}
        </p>
        <p className="mt-0.5 text-[12px] text-[#9CA3AF]">
          {contact.company.companyName} ·{" "}
          {contact.contactDepartment.departmentName}
        </p>
        <div className="mt-2 space-y-1 text-[12px] text-[#64748B]">
          <p className="truncate">핸드폰 {contact.mobile || "-"}</p>
          <p className="truncate">이메일 {contact.email || "-"}</p>
          <p>
            등록일 {formatContactCreatedAt(contact.createdAt, displayTimeZone)}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[12px] font-medium text-[#1D4ED8]">
          {contact.contactJobGrade.jobGradeName}
        </p>
      </div>
    </Link>
  );
}

function ContactListSkeleton() {
  return (
    <div className="overflow-hidden">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className="h-[66px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0"
        />
      ))}
    </div>
  );
}

function ContactListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-14 text-center">
      <p className="text-[13px] text-red-500">{getApiErrorMessage(error)}</p>
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

function FilterChip({
  icon: Icon,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly icon?: LucideIcon;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#4880EE] bg-[#4880EE] text-[13px] font-bold text-white transition hover:bg-[#4880EE] focus:border-[#4880EE] focus:outline-none focus:ring-1 focus:ring-[#4880EE]",
      )}
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
    </button>
  );
}

// ── ContactTaxonomyFilterCombobox ────────────────────────────────────────────

type FieldFilterPopoverPosition = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
};

type ContactTaxonomyFilterItem = {
  readonly id: string;
};

type ContactTaxonomyFilterTone = "blue" | "amber" | "green";

function ContactTaxonomyFilterCombobox<
  TItem extends ContactTaxonomyFilterItem,
>({
  emptyText,
  getLabel,
  itemKindLabel,
  items,
  selectedIds,
  size,
  tone,
  onCreateClick,
  onSelectedIdsChange,
}: {
  readonly emptyText: string;
  readonly getLabel: (item: TItem) => string;
  readonly itemKindLabel: string;
  readonly items: readonly TItem[];
  readonly selectedIds: readonly string[];
  readonly size: "desktop" | "mobile";
  readonly tone: ContactTaxonomyFilterTone;
  readonly onCreateClick?: () => void;
  readonly onSelectedIdsChange: (ids: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPosition, setPopoverPosition] =
    useState<FieldFilterPopoverPosition | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIdSet.has(item.id)),
    [items, selectedIdSet],
  );
  const selectedSummary = getSelectedTaxonomyFilterSummary(
    selectedItems,
    getLabel,
    itemKindLabel,
  );
  const query = search.trim();
  const normalizedQuery = normalizeFilterText(query);
  const filteredItems =
    normalizedQuery.length > 0
      ? items.filter((item) =>
          normalizeFilterText(getLabel(item)).includes(normalizedQuery),
        )
      : items;
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
        getFieldFilterPopoverPosition(inputRef.current, isMobile),
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

  const toggleItem = (item: TItem) => {
    const nextIds = selectedIdSet.has(item.id)
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    setSearch("");
    onSelectedIdsChange(nextIds);
  };

  const openOptions = (nextSearch: string) => {
    setSearch(nextSearch);

    if (inputRef.current) {
      setPopoverPosition(
        getFieldFilterPopoverPosition(inputRef.current, isMobile),
      );
    }

    setIsOpen(true);
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
        isMobile ? "w-[120px]" : "w-[clamp(136px,14vw,178px)]",
      )}
    >
      <div className="relative">
        {/* Search icon — only visible when open */}
        {isOpen ? (
          <Search
            className={cn(
              "pointer-events-none absolute top-1/2 shrink-0 -translate-y-1/2 text-[#9CA3AF]",
              isMobile ? "left-2.5 h-3 w-3" : "left-3 h-3 w-3",
            )}
          />
        ) : null}
        <input
          ref={inputRef}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-label={`${itemKindLabel} 필터`}
          autoComplete="off"
          className={cn(
            "w-full min-w-0 border outline-none transition",
            isMobile
              ? "h-7 rounded-full text-[12px]"
              : "h-8 rounded-full text-[13px]",
            isOpen
              ? cn(
                  "border-[#4880EE] bg-white text-[#111827] ring-1 ring-[#4880EE]",
                  isMobile ? "pl-7 pr-7" : "pl-8 pr-7",
                )
              : selectedIds.length > 0
                ? cn(
                    getTaxonomyFilterInputSelectedClass(tone),
                    isMobile ? "pl-3 pr-7" : "pl-3.5 pr-7",
                  )
                : isMobile
                  ? "border-[#E5E7EB] bg-[#F3F4F6] pl-3 pr-7 text-[#4B5563] hover:border-[#D1D5DB]"
                  : "cursor-pointer border-[#E2E5EC] bg-transparent pl-3.5 pr-7 text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F5F6F8]",
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
          placeholder={`${itemKindLabel} 선택`}
          value={inputValue}
        />
        {/* Right icon: × when selected/searching, ▾ when idle */}
        {selectedIds.length > 0 || search ? (
          <button
            aria-label={`${itemKindLabel} 필터 지우기`}
            className={cn(
              "absolute right-1 top-1/2 grid -translate-y-1/2 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-white hover:text-[#374151]",
              isMobile ? "h-6 w-6" : "h-7 w-7",
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
              isOpen && "rotate-180",
            )}
          />
        )}
      </div>

      {isOpen ? (
        <div
          className={cn(
            "fixed z-50 overflow-hidden rounded-md border border-[#E6EAF0] bg-white shadow-lg",
            !popoverPosition && "invisible",
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
              selectedIds.length === 0
                ? "font-semibold text-[#1D4ED8]"
                : "font-medium text-[#475569]",
            )}
            onClick={() => {
              setSearch("");
              setIsOpen(false);
              onSelectedIdsChange([]);
            }}
            type="button"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {itemKindLabel} 초기화
          </button>

          <div className="max-h-[184px] overflow-y-auto border-y border-[#E6EAF0] py-1">
            {filteredItems.length === 0 ? (
              <p className="px-3 py-3 text-[12px] text-[#9CA3AF]">
                {emptyText}
              </p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIdSet.has(item.id);

                return (
                  <button
                    className={cn(
                      "flex h-8 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] transition hover:bg-[#F9FAFB]",
                      isSelected && getTaxonomyFilterItemSelectedClass(tone),
                    )}
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                        isSelected
                          ? getTaxonomyFilterCheckBorderClass(tone)
                          : "border-[#CBD5E1]",
                      )}
                    >
                      {isSelected ? (
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            getTaxonomyFilterCheckDotClass(tone),
                          )}
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {getLabel(item)}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {onCreateClick ? (
            <button
              className="flex h-9 w-full items-center gap-1.5 px-3 text-left text-[12px] font-semibold text-[#4880EE] transition hover:bg-[#EFF6FF]"
              onClick={() => {
                setIsOpen(false);
                setSearch("");
                onCreateClick();
              }}
              type="button"
            >
              <Plus className="h-3.5 w-3.5" />
              새 {itemKindLabel} 추가
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getFieldFilterPopoverPosition(
  input: HTMLInputElement,
  isMobile: boolean,
): FieldFilterPopoverPosition {
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

function getSelectedTaxonomyFilterSummary<
  TItem extends ContactTaxonomyFilterItem,
>(
  selectedItems: readonly TItem[],
  getLabel: (item: TItem) => string,
  itemKindLabel: string,
) {
  if (selectedItems.length === 0) {
    return "";
  }

  if (selectedItems.length === 1) {
    const selectedItem = selectedItems[0];
    return selectedItem ? getLabel(selectedItem) : "";
  }

  return `${itemKindLabel} ${selectedItems.length}개`;
}

function getTaxonomyFilterInputSelectedClass(tone: ContactTaxonomyFilterTone) {
  if (tone === "blue") return "border-[#BFDBFE] bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  if (tone === "green") return "border-[#BBF7D0] bg-[#F0FDF4] font-semibold text-[#15803D]";
  return "border-[#FDE68A] bg-[#FFFBEB] font-semibold text-[#B45309]";
}

function getTaxonomyFilterItemSelectedClass(tone: ContactTaxonomyFilterTone) {
  if (tone === "blue") return "bg-[#EFF6FF] font-semibold text-[#1D4ED8]";
  if (tone === "green") return "bg-[#F0FDF4] font-semibold text-[#15803D]";
  return "bg-[#FFFBEB] font-semibold text-[#B45309]";
}

function getTaxonomyFilterCheckBorderClass(tone: ContactTaxonomyFilterTone) {
  if (tone === "blue") return "border-[#4880EE]";
  if (tone === "green") return "border-[#15803D]";
  return "border-[#B45309]";
}

function getTaxonomyFilterCheckDotClass(tone: ContactTaxonomyFilterTone) {
  if (tone === "blue") return "bg-[#4880EE]";
  if (tone === "green") return "bg-[#15803D]";
  return "bg-[#B45309]";
}

// ── Utilities ────────────────────────────────────────────────────────────────

function downloadBlobFile(file: ApiBlobResponse, fallbackFileName: string) {
  const url = window.URL.createObjectURL(file.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName ?? fallbackFileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function formatContactCreatedAt(value: string, timeZone: string) {
  return formatDateWithOptions(value, {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  });
}

function getBrowserTimeZoneFallback() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
  } catch {
    return "Asia/Seoul";
  }
}

function normalizeFilterText(value: string) {
  return value.trim().toLowerCase();
}

function addUniqueId(ids: readonly string[], id: string) {
  return ids.includes(id) ? [...ids] : [...ids, id];
}
