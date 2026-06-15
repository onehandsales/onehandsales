import { Download, IdCard, Plus, Search } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Link, useNavigate } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { Toast } from "@/components/ui/toast";
import { ContactCreateDialog } from "@/features/contact/components/contact-create-dialog";
import { ContactTaxonomyManageDialog } from "@/features/contact/components/contact-taxonomy-manage-dialog";
import {
  useContactDepartments,
  useContactJobGrades,
  useContactList,
} from "@/features/contact/hooks/use-contact-list";
import { useExportContactsMutation } from "@/features/contact/hooks/use-contact-mutations";
import type { ContactListItem } from "@/features/contact/types/contact";
import { getApiErrorMessage, type ApiBlobResponse } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

export function ContactListScreen() {
  const navigate = useNavigate();
  const [usernameText, setUsernameText] = useState("");
  const [username, setUsername] = useState("");
  const [companyId] = useState("");
  const [contactDepartmentId, setContactDepartmentId] = useState("");
  const [contactJobGradeId, setContactJobGradeId] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
        <form className="flex h-7 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-2.5 transition focus-within:border-[#93C5FD] focus-within:bg-white" onSubmit={onSearchSubmit}>
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="w-[140px] bg-transparent text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
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
            "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition",
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
            "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition",
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
      <div className="px-5 pt-3">
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

      {/* 테이블 */}
      <div className="px-5 py-3">
        <div className="overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
          {/* 테이블 헤더 (데스크톱) */}
          <div className="hidden h-9 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-4 md:flex">
            <div className="w-[170px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              이름
            </div>
            <div className="w-[150px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              회사
            </div>
            <div className="w-[100px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              부서
            </div>
            <div className="w-[80px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              직급
            </div>
            <div className="w-[130px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              핸드폰
            </div>
            <div className="min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              이메일
            </div>

            <div className="w-[72px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
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
            <ContactEmptyState
              hasSearch={hasSearch}
              onCreate={() => setIsCreateOpen(true)}
            />
          ) : (
            <div>
              <div className="hidden md:block">
                {contactList.items.map((c) => (
                  <ContactRow
                    key={c.id}
                    contact={c}
                    onClick={() => void navigate(`/contacts/${c.id}`)}
                  />
                ))}
              </div>
              <div className="divide-y divide-[#E2E5EC] md:hidden">
                {contactList.items.map((c) => (
                  <ContactCard key={c.id} contact={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {contactList ? (
        <Pagination
          page={contactList.page}
          totalPages={contactList.totalPages}
          onPageChange={setPage}
          className="py-3"
        />
      ) : null}

      <ContactCreateDialog
        onCreated={() => setNotice("거래처가 추가되었습니다.")}
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
  onClick,
}: {
  readonly contact: ContactListItem;
  readonly onClick: () => void;
}) {
  return (
    <div
      className="flex h-[52px] cursor-pointer items-center border-b border-[#E2E5EC] px-4 last:border-b-0 hover:bg-[#FAFAF8]"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      role="button"
      tabIndex={0}
    >
      <div className="w-[170px] shrink-0 min-w-0">
        <span className="block truncate text-[13px] font-medium text-[#111827]">
          {contact.username}
        </span>
      </div>
      <div className="w-[150px] shrink-0 min-w-0">
        <span className="block truncate text-[13px] text-[#6B7280]">
          {contact.company.companyName}
        </span>
      </div>
      <div className="w-[100px] shrink-0">
        <span className="text-[12px] text-[#9CA3AF]">
          {contact.contactDepartment.departmentName}
        </span>
      </div>
      <div className="w-[80px] shrink-0">
        <span className="text-[12px] font-medium text-[#1D4ED8]">
          {contact.contactJobGrade.jobGradeName}
        </span>
      </div>
      <div className="w-[130px] shrink-0">
        <span className="text-[13px] text-[#6B7280]">{contact.mobile}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-[#6B7280]">
          {contact.email}
        </span>
      </div>

      <div className="w-[72px] shrink-0">
        <span className="text-[12px] text-[#9CA3AF]">
          {formatDate(contact.createdAt, { year: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function ContactCard({ contact }: { readonly contact: ContactListItem }) {
  return (
    <Link
      className="flex items-center justify-between bg-white px-4 py-3 hover:bg-[#FAFAF8]"
      to={`/contacts/${contact.id}`}
    >
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#111827]">
          {contact.username}
        </p>
        <p className="mt-0.5 text-[12px] text-[#9CA3AF]">
          {contact.company.companyName} ·{" "}
          {contact.contactDepartment.departmentName}
        </p>
      </div>
      <div className="ml-4 shrink-0 text-right">
        <p className="text-[12px] font-medium text-[#1D4ED8]">
          {contact.contactJobGrade.jobGradeName}
        </p>
        <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{contact.mobile}</p>
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
          className="h-[52px] animate-pulse border-b border-[#E2E5EC] bg-[#F9FAFB] last:border-b-0"
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
        거래처 추가
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
        "inline-flex h-7 items-center rounded-md px-2.5 text-[12px] font-medium transition",
        active
          ? "bg-[#1D4ED8] text-white"
          : "text-[#6B7280] hover:bg-[#FAFAF8]",
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

const ADD_TAXONOMY_VALUE = "__add_taxonomy__";
