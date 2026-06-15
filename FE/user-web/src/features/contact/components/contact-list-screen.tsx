import {
  BriefcaseBusiness,
  Download,
  IdCard,
  Layers3,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { ContactCreateDialog } from "@/features/contact/components/contact-create-dialog";
import {
  useContactDepartments,
  useContactJobGrades,
  useContactList,
} from "@/features/contact/hooks/use-contact-list";
import {
  useCreateDepartmentMutation,
  useCreateJobGradeMutation,
  useDeleteDepartmentMutation,
  useDeleteJobGradeMutation,
  useExportContactsMutation,
} from "@/features/contact/hooks/use-contact-mutations";
import type {
  ContactDepartment,
  ContactJobGrade,
  ContactListItem,
} from "@/features/contact/types/contact";
import {
  ApiClientError,
  getApiErrorMessage,
  type ApiBlobResponse,
} from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

// 기능 : 거래처 목록, 검색 필터, 부서/직급 관리, 엑셀 내보내기 화면을 렌더링합니다.
export function ContactListScreen() {
  const [usernameText, setUsernameText] = useState("");
  const [username, setUsername] = useState("");
  const [companyId] = useState("");
  const [contactDepartmentId, setContactDepartmentId] = useState("");
  const [contactJobGradeId, setContactJobGradeId] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      username: username || undefined,
      companyId: companyId || undefined,
      contactDepartmentId: contactDepartmentId || undefined,
      contactJobGradeId: contactJobGradeId || undefined,
    }),
    [companyId, contactDepartmentId, contactJobGradeId, page, username]
  );
  const exportFilters = useMemo(
    () => ({
      username: username || undefined,
      companyId: companyId || undefined,
      contactDepartmentId: contactDepartmentId || undefined,
      contactJobGradeId: contactJobGradeId || undefined,
    }),
    [companyId, contactDepartmentId, contactJobGradeId, username]
  );

  const contactsQuery = useContactList(listParams);
  const jobGradesQuery = useContactJobGrades();
  const departmentsQuery = useContactDepartments();
  const exportContactsMutation = useExportContactsMutation();
  const contactList = contactsQuery.data;
  const jobGrades = jobGradesQuery.data?.items ?? [];
  const departments = departmentsQuery.data?.items ?? [];
  const hasSearch =
    username.length > 0 ||
    companyId.length > 0 ||
    contactDepartmentId.length > 0 ||
    contactJobGradeId.length > 0;

  // 기능 : 이름 검색어를 확정하고 첫 페이지로 이동합니다.
  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUsername(usernameText.trim());
    setPage(1);
  };

  // 기능 : 모든 거래처 목록 필터를 초기화합니다.
  const onResetFilters = () => {
    setUsername("");
    setUsernameText("");
    setContactDepartmentId("");
    setContactJobGradeId("");
    setPage(1);
  };

  // 기능 : 현재 필터 기준으로 거래처 목록 엑셀 파일을 내려받습니다.
  const onExport = async () => {
    const file = await exportContactsMutation.mutateAsync(exportFilters);

    downloadBlobFile(file, "contacts.xlsx");
  };

  return (
    <section className="flex flex-col gap-0 px-6 py-5">
      <form
        className="mb-3 flex min-h-10 shrink-0 flex-wrap items-center gap-2"
        onSubmit={onSearchSubmit}
      >
        <button
          className={cn(
            "inline-flex h-[30px] items-center rounded-[7px] px-3 text-[12px] font-bold transition-colors",
            !hasSearch
              ? "border border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
              : "border border-[#E6EAF0] bg-white text-[#475569] hover:bg-gray-50"
          )}
          onClick={onResetFilters}
          type="button"
        >
          전체
        </button>
        <div className="relative w-full sm:w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
          <input
            className="h-[30px] w-full rounded-[7px] border border-[#E6EAF0] bg-white pl-8 pr-3 text-[12px] font-medium text-[#334155] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#C7D7FE]"
            onChange={(event) => setUsernameText(event.target.value)}
            placeholder="이름 검색"
            value={usernameText}
          />
        </div>
        <select
          className={cn(
            "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
            contactDepartmentId && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
          )}
          disabled={departmentsQuery.isLoading}
          onChange={(event) => {
            setContactDepartmentId(event.target.value);
            setPage(1);
          }}
          value={contactDepartmentId}
        >
          <option value="">전체 부서</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.departmentName}
            </option>
          ))}
        </select>
        <select
          className={cn(
            "inline-flex h-[30px] cursor-pointer appearance-none items-center rounded-[7px] border border-[#E6EAF0] bg-white pl-3 pr-7 text-[12px] font-medium text-[#475569] outline-none transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
            contactJobGradeId && "border-[#C7D7FE] bg-[#EAF2FF] text-[#1D4ED8]"
          )}
          disabled={jobGradesQuery.isLoading}
          onChange={(event) => {
            setContactJobGradeId(event.target.value);
            setPage(1);
          }}
          value={contactJobGradeId}
        >
          <option value="">전체 직급</option>
          {jobGrades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.jobGradeName}
            </option>
          ))}
        </select>
        <button
          className="inline-flex h-[30px] items-center gap-1.5 rounded-[7px] border border-[#E6EAF0] bg-white px-3 text-[12px] font-bold text-[#475569] transition-colors hover:bg-gray-50"
          type="submit"
        >
          <Search className="h-3.5 w-3.5" />
          검색
        </button>
        <div className="hidden flex-1 md:block" />
        <span className="text-[12px] font-semibold text-[#64748B]">
          {exportContactsMutation.isPending
            ? "내보내는 중..."
            : `${contactList?.totalCount ?? 0}개`}
        </span>
        <button
          className="inline-flex h-[30px] items-center gap-1.5 rounded-[7px] border border-[#E6EAF0] bg-white px-3 text-[12px] font-bold text-[#475569] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={exportContactsMutation.isPending}
          onClick={() => void onExport()}
          type="button"
        >
          <Download className="h-3.5 w-3.5" />
          내보내기
        </button>
        <button
          className="inline-flex h-[30px] items-center gap-1.5 rounded-[7px] bg-[#1D4ED8] px-3 text-[12px] font-bold text-white transition-colors hover:bg-[#1E40AF]"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
          거래처 추가
        </button>
      </form>

      {notice ? (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {exportContactsMutation.error ? (
        <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-[#EF4444]">
          {getApiErrorMessage(exportContactsMutation.error)}
        </p>
      ) : null}

      <ContactTaxonomyManager
        departments={departments}
        isLoading={jobGradesQuery.isLoading || departmentsQuery.isLoading}
        jobGrades={jobGrades}
        onNotice={setNotice}
      />

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
        <>
          <ContactListContent contacts={contactList.items} />
          {contactList.totalPages > 1 || page > 1 ? (
            <Pagination
              page={contactList.page}
              totalCount={contactList.totalCount}
              totalPages={contactList.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <ContactCreateDialog
        onCreated={() => setNotice("거래처가 추가되었습니다.")}
        onOpenChange={setIsCreateOpen}
        open={isCreateOpen}
      />
    </section>
  );
}

type ContactTaxonomyManagerProps = {
  readonly jobGrades: ContactJobGrade[];
  readonly departments: ContactDepartment[];
  readonly isLoading: boolean;
  readonly onNotice: (notice: string) => void;
};

// 기능 : 거래처 부서와 직급의 생성/삭제 관리를 렌더링합니다.
function ContactTaxonomyManager({
  jobGrades,
  departments,
  isLoading,
  onNotice,
}: ContactTaxonomyManagerProps) {
  const [jobGradeName, setJobGradeName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const createJobGradeMutation = useCreateJobGradeMutation();
  const deleteJobGradeMutation = useDeleteJobGradeMutation();
  const createDepartmentMutation = useCreateDepartmentMutation();
  const deleteDepartmentMutation = useDeleteDepartmentMutation();
  const actionError =
    createJobGradeMutation.error ??
    deleteJobGradeMutation.error ??
    createDepartmentMutation.error ??
    deleteDepartmentMutation.error ??
    null;
  const isMutating =
    createJobGradeMutation.isPending ||
    deleteJobGradeMutation.isPending ||
    createDepartmentMutation.isPending ||
    deleteDepartmentMutation.isPending;

  // 기능 : 거래처 직급을 생성합니다.
  const onJobGradeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = jobGradeName.trim();

    if (!name) {
      return;
    }

    await createJobGradeMutation.mutateAsync({ jobGradeName: name });
    setJobGradeName("");
    onNotice("직급이 추가되었습니다.");
  };

  // 기능 : 거래처 부서를 생성합니다.
  const onDepartmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = departmentName.trim();

    if (!name) {
      return;
    }

    await createDepartmentMutation.mutateAsync({ departmentName: name });
    setDepartmentName("");
    onNotice("부서가 추가되었습니다.");
  };

  // 기능 : 사용 중이지 않은 직급을 삭제합니다.
  const onJobGradeDelete = async (grade: ContactJobGrade) => {
    if (!window.confirm(`${grade.jobGradeName} 직급을 삭제할까요?`)) {
      return;
    }

    await deleteJobGradeMutation.mutateAsync(grade.id);
    onNotice("직급이 삭제되었습니다.");
  };

  // 기능 : 사용 중이지 않은 부서를 삭제합니다.
  const onDepartmentDelete = async (dept: ContactDepartment) => {
    if (!window.confirm(`${dept.departmentName} 부서를 삭제할까요?`)) {
      return;
    }

    await deleteDepartmentMutation.mutateAsync(dept.id);
    onNotice("부서가 삭제되었습니다.");
  };

  return (
    <section className="mb-3 grid gap-0 overflow-hidden rounded-lg border border-[#E5EAF0] bg-white lg:grid-cols-2">
      <ContactTaxonomyColumn
        emptyText="등록된 부서가 없습니다."
        icon={Layers3}
        inputPlaceholder="새 부서"
        isLoading={isLoading}
        isMutating={isMutating}
        items={departments.map((dept) => ({
          id: dept.id,
          label: dept.departmentName,
          onDelete: () => void onDepartmentDelete(dept),
        }))}
        name={departmentName}
        onNameChange={setDepartmentName}
        onSubmit={onDepartmentSubmit}
        title="부서 관리"
      />
      <ContactTaxonomyColumn
        emptyText="등록된 직급이 없습니다."
        icon={BriefcaseBusiness}
        inputPlaceholder="새 직급"
        isLoading={isLoading}
        isMutating={isMutating}
        items={jobGrades.map((grade) => ({
          id: grade.id,
          label: grade.jobGradeName,
          onDelete: () => void onJobGradeDelete(grade),
        }))}
        name={jobGradeName}
        onNameChange={setJobGradeName}
        onSubmit={onJobGradeSubmit}
        title="직급 관리"
      />
      {actionError ? (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2.5 text-sm text-[#EF4444] lg:col-span-2">
          {getContactTaxonomyErrorMessage(actionError)}
        </p>
      ) : null}
    </section>
  );
}

type ContactTaxonomyColumnProps = {
  readonly title: string;
  readonly inputPlaceholder: string;
  readonly emptyText: string;
  readonly icon: typeof Layers3;
  readonly name: string;
  readonly items: Array<{
    readonly id: string;
    readonly label: string;
    readonly onDelete: () => void;
  }>;
  readonly isLoading: boolean;
  readonly isMutating: boolean;
  readonly onNameChange: (value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// 기능 : 부서/직급 관리 컬럼을 렌더링합니다.
function ContactTaxonomyColumn({
  title,
  inputPlaceholder,
  emptyText,
  icon: Icon,
  name,
  items,
  isLoading,
  isMutating,
  onNameChange,
  onSubmit,
}: ContactTaxonomyColumnProps) {
  return (
    <div className="grid content-start gap-3 border-b border-[#E6EAF0] px-4 py-3 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[#64748B]" />
        <h2 className="text-[12px] font-bold text-[#334155]">{title}</h2>
      </div>
      <form className="flex gap-2" onSubmit={(e) => void onSubmit(e)}>
        <input
          className="h-[30px] min-w-0 flex-1 rounded-[7px] border border-[#E6EAF0] px-3 text-[12px] outline-none focus:border-[#C7D7FE]"
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={inputPlaceholder}
          value={name}
        />
        <button
          className="inline-flex h-[30px] items-center rounded-[7px] border border-[#E6EAF0] bg-white px-3 text-[12px] font-bold text-[#475569] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isMutating || name.trim().length === 0}
          type="submit"
        >
          추가
        </button>
      </form>
      <div className="flex min-h-10 flex-wrap gap-2">
        {isLoading ? (
          <span className="text-[12px] text-[#94A3B8]">불러오는 중</span>
        ) : items.length === 0 ? (
          <span className="text-[12px] text-[#94A3B8]">{emptyText}</span>
        ) : (
          items.map((item) => (
            <span
              className="inline-flex h-7 items-center gap-2 rounded-md border border-[#E6EAF0] bg-[#FAFBFC] px-2 text-[12px] text-[#475569]"
              key={item.id}
            >
              <span className="max-w-52 truncate">{item.label}</span>
              <button
                aria-label={`${item.label} 삭제`}
                className="grid h-5 w-5 place-items-center rounded text-[#94A3B8] hover:bg-white hover:text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isMutating}
                onClick={item.onDelete}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}

type ContactListContentProps = {
  readonly contacts: ContactListItem[];
};

// 기능 : 거래처 목록 테이블과 모바일 카드를 렌더링합니다.
function ContactListContent({ contacts }: ContactListContentProps) {
  return (
    <>
      <div className="hidden flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white md:flex">
        <div
          className="flex shrink-0 items-center border-b border-[#E6EAF0] bg-[#FAFBFC] px-6"
          style={{ height: 44 }}
        >
          <ContactHeaderCell width={190}>이름</ContactHeaderCell>
          <ContactHeaderCell width={220}>회사명</ContactHeaderCell>
          <ContactHeaderCell width={140}>부서</ContactHeaderCell>
          <ContactHeaderCell width={120}>직급</ContactHeaderCell>
          <ContactHeaderCell width={150}>핸드폰번호</ContactHeaderCell>
          <ContactHeaderCell flex>이메일</ContactHeaderCell>
        </div>
        {contacts.map((contact) => (
          <Link
            className="flex items-center border-b border-[#E8EDF3] px-6 transition-colors hover:bg-[#F9FAFB] last:border-b-0"
            key={contact.id}
            style={{ height: 62 }}
            to={`/contacts/${contact.id}`}
          >
            <div className="min-w-0 shrink-0" style={{ width: 190 }}>
              <span className="block truncate text-[13px] font-semibold text-[#111827]">
                {contact.username}
              </span>
              <span className="block truncate text-[11px] text-[#94A3B8]">
                {formatDate(contact.createdAt, { year: "2-digit" })} 등록
              </span>
            </div>
            <div className="min-w-0 shrink-0" style={{ width: 220 }}>
              <span className="block truncate text-[12px] text-[#374151]">
                {contact.company.companyName}
              </span>
            </div>
            <div className="shrink-0" style={{ width: 140 }}>
              <span className="inline-flex h-6 max-w-[120px] items-center rounded-full bg-[#DBEAFE] px-2.5 text-[11px] font-medium text-[#2568D8]">
                <span className="truncate">{contact.contactDepartment.departmentName}</span>
              </span>
            </div>
            <div className="shrink-0" style={{ width: 120 }}>
              <span className="inline-flex h-6 max-w-[100px] items-center rounded-md bg-[#D1FAE5] px-2.5 text-[11px] font-medium text-[#065F46]">
                <span className="truncate">{contact.contactJobGrade.jobGradeName}</span>
              </span>
            </div>
            <div className="shrink-0" style={{ width: 150 }}>
              <span className="text-[12px] font-semibold text-[#374151]">
                {contact.mobile}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-[12px] text-[#374151]">
                {contact.email}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {contacts.map((contact) => (
          <Link
            className="block rounded-lg border border-[#E5EAF0] bg-white p-4 transition-colors hover:bg-[#F9FAFB]"
            key={contact.id}
            to={`/contacts/${contact.id}`}
          >
            <div className="min-w-0">
              <p className="block truncate text-[15px] font-semibold text-[#111827]">
                {contact.username}
              </p>
              <p className="mt-1 text-[12px] text-[#64748B]">
                {contact.company.companyName}
              </p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <MobileField label="부서" value={contact.contactDepartment.departmentName} />
              <MobileField label="직급" value={contact.contactJobGrade.jobGradeName} />
              <MobileField label="핸드폰번호" value={contact.mobile} />
              <MobileField label="이메일" value={contact.email} />
            </dl>
          </Link>
        ))}
      </div>
    </>
  );
}

function ContactHeaderCell({
  children,
  width,
  flex = false,
}: {
  readonly children: string;
  readonly width?: number;
  readonly flex?: boolean;
}) {
  return (
    <div
      className={cn("shrink-0 text-[12px] font-bold text-[#334155]", flex && "min-w-0 flex-1")}
      style={width ? { width } : undefined}
    >
      {children}
    </div>
  );
}

// 기능 : 거래처 목록 로딩 상태를 렌더링합니다.
function ContactListSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="animate-pulse border-b border-[#E8EDF3] bg-[#FAFBFC] last:border-b-0"
          key={index}
          style={{ height: 62 }}
        />
      ))}
    </div>
  );
}

// 기능 : 거래처 목록 조회 실패 상태를 렌더링합니다.
function ContactListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#E5EAF0] bg-white px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-[#EF4444]">
        {getApiErrorMessage(error)}
      </p>
      <button
        className="mt-3 inline-flex h-8 items-center rounded-lg border border-[#E5E7EB] px-3 text-[13px] text-[#374151] hover:bg-[#F9FAFB]"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

// 기능 : 거래처 목록 빈 상태를 렌더링합니다.
function ContactEmptyState({
  hasSearch,
  onCreate,
}: {
  readonly hasSearch: boolean;
  readonly onCreate: () => void;
}) {
  return (
    <div className="grid place-items-center rounded-lg border border-[#E5EAF0] bg-white px-5 py-16 text-center">
      <IdCard className="h-10 w-10 text-[#D1D5DB]" />
      <p className="mt-4 text-[14px] font-semibold text-[#374151]">
        {hasSearch ? "조건에 맞는 거래처가 없습니다." : "등록된 거래처가 없습니다."}
      </p>
      <p className="mt-1 text-[13px] text-[#9CA3AF]">
        거래처를 추가하면 회사와 딜 흐름을 연결할 수 있습니다.
      </p>
      <button
        className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 text-[13px] font-semibold text-white hover:bg-[#1E40AF]"
        onClick={onCreate}
        type="button"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        거래처 추가
      </button>
    </div>
  );
}

// 기능 : 모바일 카드의 라벨/값 쌍을 렌더링합니다.
function MobileField({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md bg-[#F9FAFB] px-3 py-2">
      <dt className="text-[11px] text-[#94A3B8]">{label}</dt>
      <dd className="mt-1 truncate text-[13px] font-semibold text-[#374151]">{value}</dd>
    </div>
  );
}

// 기능 : Blob 응답을 브라우저 다운로드로 연결합니다.
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

// 기능 : 부서/직급 삭제 불가 오류를 사용자 메시지로 변환합니다.
function getContactTaxonomyErrorMessage(error: unknown) {
  if (
    error instanceof ApiClientError &&
    error.statusCode === 409
  ) {
    return "사용 중인 항목은 삭제할 수 없습니다.";
  }

  return getApiErrorMessage(error);
}
