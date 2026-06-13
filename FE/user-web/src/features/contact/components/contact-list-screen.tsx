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
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Toast } from "@/components/ui/toast";
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

  // 기능 : 현재 필터 기준으로 거래처 목록 엑셀 파일을 내려받습니다.
  const onExport = async () => {
    const file = await exportContactsMutation.mutateAsync(exportFilters);

    downloadBlobFile(file, "contacts.xlsx");
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <PageHeader
        actions={
          <>
            <Button
              disabled={exportContactsMutation.isPending}
              isPending={exportContactsMutation.isPending}
              onClick={() => void onExport()}
              type="button"
            >
              <Download className="h-4 w-4" />
              목록 내보내기
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              type="button"
              variant="primary"
            >
              <Plus className="h-4 w-4" />
              거래처 추가
            </Button>
          </>
        }
        description="담당자와 회사 연결 정보를 관리합니다."
        title="거래처"
      />

      <form
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(160px,200px)_minmax(160px,200px)_auto]"
        onSubmit={onSearchSubmit}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setUsernameText(event.target.value)}
            placeholder="이름 검색"
            value={usernameText}
          />
        </div>
        <select
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
          className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            <Search className="h-4 w-4" />
            검색
          </Button>
        </div>
      </form>

      {notice ? (
        <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
      ) : null}

      {exportContactsMutation.error ? (
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
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
          <Pagination
            page={contactList.page}
            totalCount={contactList.totalCount}
            totalPages={contactList.totalPages}
            onPageChange={setPage}
          />
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
    <section className="grid gap-4 rounded-lg border bg-white p-4 lg:grid-cols-2">
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
        <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive lg:col-span-2">
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
    <div className="grid content-start gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <form className="flex gap-2" onSubmit={(e) => void onSubmit(e)}>
        <input
          className="h-9 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={inputPlaceholder}
          value={name}
        />
        <Button
          disabled={isMutating || name.trim().length === 0}
          size="sm"
          type="submit"
        >
          추가
        </Button>
      </form>
      <div className="flex min-h-10 flex-wrap gap-2">
        {isLoading ? (
          <span className="text-sm text-muted-foreground">불러오는 중</span>
        ) : items.length === 0 ? (
          <span className="text-sm text-muted-foreground">{emptyText}</span>
        ) : (
          items.map((item) => (
            <span
              className="inline-flex h-8 items-center gap-2 rounded-md border bg-muted px-2 text-sm"
              key={item.id}
            >
              <span className="max-w-52 truncate">{item.label}</span>
              <button
                aria-label={`${item.label} 삭제`}
                className="grid h-5 w-5 place-items-center rounded text-muted-foreground hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="hidden overflow-hidden rounded-lg border bg-white md:block">
        <div className="grid grid-cols-[1fr_1fr_0.9fr_0.9fr_1fr_0.8fr_0.7fr] border-b bg-muted px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>회사명</span>
          <span>이름</span>
          <span>핸드폰번호</span>
          <span>이메일</span>
          <span>부서</span>
          <span>직급</span>
          <span>등록일</span>
        </div>
        {contacts.map((contact) => (
          <div
            className="grid grid-cols-[1fr_1fr_0.9fr_0.9fr_1fr_0.8fr_0.7fr] items-center border-b px-4 py-4 text-sm last:border-b-0 hover:bg-muted/50"
            key={contact.id}
          >
            <span className="truncate text-slate-700">
              {contact.company.companyName}
            </span>
            <Link
              className="min-w-0 font-medium text-slate-950 hover:text-primary"
              to={`/contacts/${contact.id}`}
            >
              <span className="block truncate">{contact.username}</span>
            </Link>
            <span className="truncate text-slate-700">{contact.mobile}</span>
            <span className="truncate text-slate-700">{contact.email}</span>
            <span className="truncate text-slate-700">
              {contact.contactDepartment.departmentName}
            </span>
            <span className="truncate text-slate-700">
              {contact.contactJobGrade.jobGradeName}
            </span>
            <span className="text-slate-700">
              {formatDate(contact.createdAt, { year: "2-digit" })}
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:hidden">
        {contacts.map((contact) => (
          <article className="rounded-lg border bg-white p-4" key={contact.id}>
            <div className="min-w-0">
              <Link
                className="block truncate text-base font-semibold hover:text-primary"
                to={`/contacts/${contact.id}`}
              >
                {contact.username}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {contact.company.companyName}
              </p>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <MobileField label="부서" value={contact.contactDepartment.departmentName} />
              <MobileField label="직급" value={contact.contactJobGrade.jobGradeName} />
              <MobileField label="핸드폰번호" value={contact.mobile} />
              <MobileField label="이메일" value={contact.email} />
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}

// 기능 : 거래처 목록 로딩 상태를 렌더링합니다.
function ContactListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="h-16 animate-pulse rounded-lg border bg-muted"
          key={index}
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
    <div className="grid justify-items-start gap-3 rounded-lg border border-destructive/30 bg-red-50 p-5">
      <p className="text-sm font-medium text-destructive">
        {getApiErrorMessage(error)}
      </p>
      <Button onClick={onRetry} size="sm" type="button">
        다시 시도
      </Button>
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
    <div className="grid justify-items-center gap-3 rounded-lg border bg-white px-5 py-12 text-center">
      <IdCard className="h-8 w-8 text-muted-foreground" />
      <div>
        <h2 className="text-base font-semibold">
          {hasSearch ? "조건에 맞는 거래처가 없습니다." : "등록된 거래처가 없습니다."}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          거래처를 추가하면 회사와 딜 흐름을 연결할 수 있습니다.
        </p>
      </div>
      <Button onClick={onCreate} type="button" variant="primary">
        <Plus className="h-4 w-4" />
        거래처 추가
      </Button>
    </div>
  );
}

// 기능 : 모바일 카드의 라벨/값 쌍을 렌더링합니다.
function MobileField({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate font-medium">{value}</dd>
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
