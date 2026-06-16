import {
  BriefcaseBusiness,
  Building2,
  Download,
  IdCard,
  Mail,
  Phone,
  Plus,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { Toast } from "@/components/ui/toast";
import { useAuthSession } from "@/features/auth";
import { ContactCreateDialog } from "@/features/contact/components/contact-create-dialog";
import { ContactTaxonomyManageDialog } from "@/features/contact/components/contact-taxonomy-manage-dialog";
import {
  useContactDepartments,
  useContactJobGrades,
  useContactList,
} from "@/features/contact/hooks/use-contact-list";
import {
  useContactDeals,
  useContactDetail,
} from "@/features/contact/hooks/use-contact-detail";
import { useExportContactsMutation } from "@/features/contact/hooks/use-contact-mutations";
import type { ContactListItem } from "@/features/contact/types/contact";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateWithOptions } from "@/utils/format";

export function ContactListScreen() {
  const { user } = useAuthSession();
  const [usernameText, setUsernameText] = useState("");
  const [username, setUsername] = useState("");
  const [companyId] = useState("");
  const [contactDepartmentId, setContactDepartmentId] = useState("");
  const [contactJobGradeId, setContactJobGradeId] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);
  const [pendingDepartmentName, setPendingDepartmentName] = useState("");
  const [pendingJobGradeName, setPendingJobGradeName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      username: username || undefined,
      companyId: companyId || undefined,
      contactDepartmentId: contactDepartmentId || undefined,
      contactJobGradeId: contactJobGradeId || undefined,
    }),
    [companyId, contactDepartmentId, contactJobGradeId, page, username],
  );
  const exportFilters = useMemo(
    () => ({
      username: username || undefined,
      companyId: companyId || undefined,
      contactDepartmentId: contactDepartmentId || undefined,
      contactJobGradeId: contactJobGradeId || undefined,
    }),
    [companyId, contactDepartmentId, contactJobGradeId, username],
  );

  const contactsQuery = useContactList(listParams);
  const jobGradesQuery = useContactJobGrades();
  const departmentsQuery = useContactDepartments();
  const exportContactsMutation = useExportContactsMutation();
  const contactList = contactsQuery.data;
  const jobGrades = useMemo(
    () => jobGradesQuery.data?.items ?? [],
    [jobGradesQuery.data],
  );
  const departments = useMemo(
    () => departmentsQuery.data?.items ?? [],
    [departmentsQuery.data],
  );

  const displayTimeZone = user?.timeZone ?? getBrowserTimeZoneFallback();
  const hasSearch =
    username.length > 0 ||
    companyId.length > 0 ||
    contactDepartmentId.length > 0 ||
    contactJobGradeId.length > 0;

  useEffect(() => {
    if (!pendingDepartmentName) return;
    const matched = departments.find(
      (d) => d.departmentName === pendingDepartmentName,
    );
    if (matched) {
      setContactDepartmentId(matched.id);
      setPage(1);
      setPendingDepartmentName("");
    }
  }, [departments, pendingDepartmentName]);

  useEffect(() => {
    const items = contactList?.items ?? [];
    if (selectedContactId && !items.some((contact) => contact.id === selectedContactId)) {
      setSelectedContactId("");
    }
  }, [contactList?.items, selectedContactId]);

  useEffect(() => {
    if (!pendingJobGradeName) return;
    const matched = jobGrades.find(
      (j) => j.jobGradeName === pendingJobGradeName,
    );
    if (matched) {
      setContactJobGradeId(matched.id);
      setPage(1);
      setPendingJobGradeName("");
    }
  }, [jobGrades, pendingJobGradeName]);

  useEffect(() => {
    if (
      contactDepartmentId &&
      !departments.some((d) => d.id === contactDepartmentId)
    ) {
      setContactDepartmentId("");
      setPage(1);
    }
  }, [contactDepartmentId, departments]);

  useEffect(() => {
    if (
      contactJobGradeId &&
      !jobGrades.some((j) => j.id === contactJobGradeId)
    ) {
      setContactJobGradeId("");
      setPage(1);
    }
  }, [contactJobGradeId, jobGrades]);

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
            icon: Plus,
            tooltip: "담당자 추가",
            onClick: () => setIsCreateOpen(true),
            variant: "primary",
          },
          {
            icon: Download,
            tooltip: "파일로 내보내기",
            onClick: () => void onExport(),
            disabled: exportContactsMutation.isPending,
          },
        ]}
      />

      {/* 검색 + 필터 툴바 */}
      <div className="flex h-10 shrink-0 items-center gap-2 px-5">
        <form className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition focus-within:border-[#93C5FD] focus-within:bg-white" onSubmit={onSearchSubmit}>
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="w-[220px] bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(e) => setUsernameText(e.target.value)}
            placeholder="이름 검색"
            value={usernameText}
          />
        </form>
        <FilterChip
          active={!hasSearch}
          label="전체"
          onClick={() => {
            setUsername("");
            setUsernameText("");
            setContactDepartmentId("");
            setContactJobGradeId("");
            setPage(1);
          }}
        />
        <select
          className={cn(
            "h-8 min-w-[118px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
            contactDepartmentId
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]",
          )}
          disabled={departmentsQuery.isLoading}
          onChange={(e) => {
            const v = e.target.value;
            if (v === ADD_TAXONOMY_VALUE) {
              setTaxonomyOpen(true);
              return;
            }
            setContactDepartmentId(v);
            setPage(1);
          }}
          value={contactDepartmentId}
        >
          <option value="">부서</option>
          <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.departmentName}
            </option>
          ))}
        </select>
        <select
          className={cn(
            "h-8 min-w-[118px] appearance-none rounded-md border px-3 text-[13px] outline-none transition",
            contactJobGradeId
              ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]",
          )}
          disabled={jobGradesQuery.isLoading}
          onChange={(e) => {
            const v = e.target.value;
            if (v === ADD_TAXONOMY_VALUE) {
              setTaxonomyOpen(true);
              return;
            }
            setContactJobGradeId(v);
            setPage(1);
          }}
          value={contactJobGradeId}
        >
          <option value="">직급</option>
          <option value={ADD_TAXONOMY_VALUE}>+ 추가</option>
          {jobGrades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.jobGradeName}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <span className="text-[12px] text-[#9CA3AF]">
          {contactList?.totalCount ?? 0}명
        </span>
      </div>

      {/* 알림 */}
      {notice || exportContactsMutation.error ? (
        <div className="px-5 pt-2">
          {notice ? (
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
          ) : null}
          {exportContactsMutation.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {getApiErrorMessage(exportContactsMutation.error)}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* 테이블 + 미리보기 */}
      <div className="flex min-h-0 flex-1 gap-5 overflow-hidden px-5 pb-3 pt-1">
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            {/* 테이블 헤더 (데스크톱) */}
            <div className="hidden h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-6 md:flex">
              <div className="w-[130px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                이름
              </div>
              <div className="w-[150px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                회사
              </div>
              <div className="w-[110px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                부서
              </div>
              <div className="w-[90px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                직급
              </div>
              <div className="w-[120px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                핸드폰
              </div>
              <div className="w-[180px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                이메일
              </div>
              <div className="w-[118px] shrink-0 text-right text-[12px] font-semibold text-[#64748B]">
                등록일
              </div>
              <div className="min-w-0 flex-1" />
            </div>

            {contactsQuery.isLoading ? (
              <ContactListSkeleton />
            ) : contactsQuery.isError ? (
              <ContactListError
                error={contactsQuery.error}
                onRetry={() => void contactsQuery.refetch()}
              />
            ) : !contactList || contactList.items.length === 0 ? (
              <ContactEmptyState
                hasSearch={hasSearch}
                onCreate={() => setIsCreateOpen(true)}
              />
            ) : (
              <div>
                <div className="hidden md:block">
                  {contactList.items.map((c) => (
                    <ContactRow
                      contact={c}
                      displayTimeZone={displayTimeZone}
                      isActive={c.id === selectedContactId}
                      key={c.id}
                      onSelect={setSelectedContactId}
                    />
                  ))}
                </div>
                <div className="divide-y divide-[#E2E5EC] md:hidden">
                  {contactList.items.map((c) => (
                    <ContactCard
                      key={c.id}
                      contact={c}
                      displayTimeZone={displayTimeZone}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {contactList ? (
            <Pagination
              page={contactList.page}
              totalPages={contactList.totalPages}
              onPageChange={setPage}
              className="py-3"
            />
          ) : null}
        </div>

        {selectedContactId ? (
          <div className="hidden w-[380px] shrink-0 flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white md:flex">
            <div className="flex shrink-0 items-center justify-between border-b border-[#E6EAF0] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  aria-label="미리보기 닫기"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E5EC] text-[#64748B] transition hover:bg-blue-50/60 hover:text-[#2563EB]"
                  onClick={() => setSelectedContactId("")}
                  title="닫기"
                  type="button"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <span className="text-[12px] font-medium text-[#6B7280]">미리보기</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  className="inline-flex h-7 items-center rounded-md border border-[#E2E5EC] bg-white px-2.5 text-[12px] font-medium text-[#374151] transition hover:bg-[#F5F6F8]"
                  to={`/contacts/${selectedContactId}`}
                >
                  상세보기
                </Link>
              </div>
            </div>
            <ContactPreviewPanel contactId={selectedContactId} />
          </div>
        ) : null}
      </div>

      <ContactCreateDialog
        onCreated={() => setNotice("담당자가 추가되었습니다.")}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
      <ContactTaxonomyManageDialog
        onCreated={(kind, name) => {
          if (kind === "department") setPendingDepartmentName(name);
          else setPendingJobGradeName(name);
        }}
        onOpenChange={setTaxonomyOpen}
        open={taxonomyOpen}
      />
    </section>
  );
}

function ContactRow({
  contact,
  displayTimeZone,
  isActive,
  onSelect,
}: {
  readonly contact: ContactListItem;
  readonly displayTimeZone: string;
  readonly isActive: boolean;
  readonly onSelect: (contactId: string) => void;
}) {
  return (
    <button
      className={cn(
        "flex h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] px-6 text-left transition-colors last:border-b-0 hover:bg-blue-50/60",
        isActive ? "bg-blue-50" : "bg-white"
      )}
      onClick={() => onSelect(contact.id)}
      type="button"
    >
      <div className="w-[130px] shrink-0 min-w-0">
        <span className="block truncate text-[13px] font-semibold text-[#111827]">
          {contact.username}
        </span>
      </div>
      <div className="w-[150px] min-w-0 shrink-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#F1F5F9] px-2.5 text-[11px] font-semibold text-[#475569]"
          title={contact.company.companyName}
        >
          <span className="min-w-0 truncate whitespace-nowrap">{contact.company.companyName}</span>
        </span>
      </div>
      <div className="w-[110px] min-w-0 shrink-0">
        <span
          className="block truncate text-[12px] font-medium text-[#2563EB]"
          title={contact.contactDepartment.departmentName}
        >
          {contact.contactDepartment.departmentName}
        </span>
      </div>
      <div className="w-[90px] min-w-0 shrink-0">
        <span
          className="inline-flex h-[22px] max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[#FEF3C7] px-2.5 text-[11px] font-semibold text-[#B45309]"
          title={contact.contactJobGrade.jobGradeName}
        >
          <span className="min-w-0 truncate whitespace-nowrap">{contact.contactJobGrade.jobGradeName}</span>
        </span>
      </div>
      <div
        className="w-[120px] shrink-0 truncate text-[12px] font-medium text-[#475569]"
        title={contact.mobile || "-"}
      >
        {contact.mobile || "-"}
      </div>
      <div
        className="w-[180px] shrink-0 truncate text-[12px] font-medium text-[#475569]"
        title={contact.email || "-"}
      >
        {contact.email || "-"}
      </div>
      <div
        className="w-[118px] shrink-0 text-right text-[12px] font-medium text-[#64748B]"
        title={formatContactCreatedAt(contact.createdAt, displayTimeZone)}
      >
        {formatContactCreatedAt(contact.createdAt, displayTimeZone)}
      </div>
      <div className="min-w-0 flex-1" />
    </button>
  );
}

function ContactCard({
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
          <p>등록일 {formatContactCreatedAt(contact.createdAt, displayTimeZone)}</p>
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

function ContactPreviewPanel({ contactId }: { readonly contactId: string }) {
  const contactQuery = useContactDetail(contactId);
  const dealsQuery = useContactDeals(contactId);
  const contact = contactQuery.data;
  const deals = dealsQuery.data?.items ?? [];

  if (contactQuery.isLoading) {
    return <ContactPreviewSkeleton />;
  }

  if (contactQuery.isError || !contact) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-red-500">
        담당자 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
          <IdCard className="h-5 w-5" strokeWidth={1.7} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[16px] font-semibold text-[#111827]">
            {contact.username}
          </h2>
          <p className="mt-1 truncate text-[13px] font-medium text-[#475569]">
            {contact.company.companyName}
          </p>
          <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
            <InfoPill icon={Building2} tone="blue">
              {contact.contactDepartment.departmentName}
            </InfoPill>
            <InfoPill icon={IdCard} tone="amber">
              {contact.contactJobGrade.jobGradeName}
            </InfoPill>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <ContactInfoRow icon={Phone} label="핸드폰" value={contact.mobile || "-"} />
        <ContactInfoRow icon={Mail} label="이메일" value={contact.email || "-"} />
      </div>

      <PreviewSection icon={BriefcaseBusiness} title="딜">
        {dealsQuery.isLoading ? (
          <PreviewMutedText>불러오는 중</PreviewMutedText>
        ) : deals.length === 0 ? (
          <PreviewMutedText>연결된 딜이 없습니다.</PreviewMutedText>
        ) : (
          deals.slice(0, 5).map((deal) => (
            <Link
              className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2 py-2 transition hover:bg-[#F9FAFB]"
              key={deal.id}
              to={`/deals/${deal.id}`}
            >
              <span className="min-w-0 truncate text-[13px] font-medium text-[#111827]">
                {deal.dealName}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-[#1D4ED8]">
                {deal.dealCost.toLocaleString("ko-KR")}원
              </span>
            </Link>
          ))
        )}
      </PreviewSection>
    </div>
  );
}

function InfoPill({
  children,
  icon: Icon,
  tone,
}: {
  readonly children: string;
  readonly icon: LucideIcon;
  readonly tone: "blue" | "amber";
}) {
  const toneClass = tone === "blue"
    ? "bg-[#DBEAFE] text-[#1D4ED8]"
    : "bg-[#FEF3C7] text-[#B45309]";

  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full min-w-0 items-center gap-1 overflow-hidden rounded-full px-2.5 text-[11px] font-semibold",
        toneClass
      )}
      title={children}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={1.8} />
      <span className="min-w-0 truncate whitespace-nowrap">{children}</span>
    </span>
  );
}

function ContactInfoRow({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border border-[#E6EAF0] bg-[#FAFBFC] px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.8} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-[#94A3B8]">{label}</p>
        <p className="truncate text-[13px] font-semibold text-[#111827]">{value}</p>
      </div>
    </div>
  );
}

function PreviewSection({
  children,
  icon: Icon,
  title,
}: {
  readonly children: ReactNode;
  readonly icon: LucideIcon;
  readonly title: string;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#475569]">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        {title}
      </div>
      <div className="divide-y divide-[#EEF2F7] rounded-md border border-[#E6EAF0] bg-white">
        {children}
      </div>
    </div>
  );
}

function PreviewMutedText({ children }: { readonly children: string }) {
  return <p className="px-3 py-3 text-[12px] text-[#94A3B8]">{children}</p>;
}

function ContactPreviewSkeleton() {
  return (
    <div className="flex-1 space-y-4 overflow-hidden px-4 py-4">
      <div className="flex gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-[#EEF2F7]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-[#EEF2F7]" />
          <div className="h-4 w-40 animate-pulse rounded bg-[#EEF2F7]" />
          <div className="h-5 w-44 animate-pulse rounded-full bg-[#EEF2F7]" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-14 animate-pulse rounded-md bg-[#EEF2F7]" />
        <div className="h-14 animate-pulse rounded-md bg-[#EEF2F7]" />
      </div>
      <div className="h-36 animate-pulse rounded-md bg-[#EEF2F7]" />
    </div>
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

function ContactEmptyState({
  hasSearch,
  onCreate,
}: {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E2E5EC] bg-[#FAFAF8]">
        <IdCard className="h-5 w-5 text-[#9CA3AF]" strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-[14px] font-semibold text-[#111827]">
        {hasSearch
          ? "조건에 맞는 담당자가 없습니다"
          : "등록된 담당자가 없습니다"}
      </p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">
        담당자를 추가하고 딜과 연결해보세요
      </p>
      <button
        className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-md bg-[#1D4ED8] px-3.5 text-[13px] font-medium text-white transition hover:bg-[#1E40AF]"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        담당자 추가
      </button>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center rounded-[6px] border px-3 text-[13px] transition",
        active
          ? "border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8]"
          : "border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB]",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

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

const ADD_TAXONOMY_VALUE = "__add_taxonomy__";
