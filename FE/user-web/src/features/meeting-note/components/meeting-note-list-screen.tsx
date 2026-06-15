import {
  AlertCircle,
  Building2,
  FileText,
  Plus,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  useMeetingNoteFilterCompanies,
  useMeetingNoteFilterContacts,
  useMeetingNoteList,
} from "@/features/meeting-note/hooks/use-meeting-note-queries";
import type {
  MeetingNoteListItem,
  MeetingNoteSort,
} from "@/features/meeting-note/types/meeting-note";
import { Pagination } from "@/components/ui/pagination";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

// 기능 : 회의록 목록과 필터 화면을 렌더링합니다.
export function MeetingNoteListScreen() {
  const [page, setPage] = useState(1);
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [sort, setSort] = useState<MeetingNoteSort>("createdAtDesc");
  const params = useMemo(
    () => ({
      companyIds: companyId ? [companyId] : [],
      contactIds: contactId ? [contactId] : [],
      page,
      sort,
    }),
    [companyId, contactId, page, sort]
  );
  const meetingNotesQuery = useMeetingNoteList(params);
  const companiesQuery = useMeetingNoteFilterCompanies();
  const contactsQuery = useMeetingNoteFilterContacts();
  const meetingNotes = meetingNotesQuery.data?.items ?? [];

  // 기능 : 필터 값을 변경하고 목록 page를 첫 페이지로 되돌립니다.
  const updateCompanyId = (value: string) => {
    setCompanyId(value);
    setPage(1);
  };

  // 기능 : 연락처 필터 값을 변경하고 목록 page를 첫 페이지로 되돌립니다.
  const updateContactId = (value: string) => {
    setContactId(value);
    setPage(1);
  };

  // 기능 : 정렬 값을 변경하고 목록 page를 첫 페이지로 되돌립니다.
  const updateSort = (value: MeetingNoteSort) => {
    setSort(value);
    setPage(1);
  };

  // 기능 : 모든 목록 필터를 초기화합니다.
  const clearFilters = () => {
    setCompanyId("");
    setContactId("");
    setSort("createdAtDesc");
    setPage(1);
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">회의록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            수동으로 기록한 미팅 내용을 회사와 담당자 기준으로 다시 찾습니다.
          </p>
        </div>
        <Link
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          to="/meeting-notes/new"
        >
          <Plus className="h-4 w-4" />
          회의록 작성
        </Link>
      </header>

      <div className="grid gap-3 rounded-md border bg-white p-4 lg:grid-cols-[1fr_1fr_180px_auto_auto] lg:items-end">
        <SelectField
          icon={<Building2 className="h-4 w-4" />}
          id="meeting-note-company-filter"
          label="회사"
          onChange={updateCompanyId}
          options={(companiesQuery.data?.items ?? []).map((company) => ({
            label: company.companyName,
            value: company.id,
          }))}
          value={companyId}
        />
        <SelectField
          icon={<UserRound className="h-4 w-4" />}
          id="meeting-note-contact-filter"
          label="담당자"
          onChange={updateContactId}
          options={(contactsQuery.data?.items ?? []).map((contact) => ({
            label: contact.contactUsername,
            value: contact.id,
          }))}
          value={contactId}
        />
        <SelectField
          id="meeting-note-sort"
          label="정렬"
          onChange={(value) => updateSort(value as MeetingNoteSort)}
          options={[
            { label: "등록 최신순", value: "createdAtDesc" },
            { label: "미팅 최신순", value: "meetingAtDesc" },
          ]}
          value={sort}
        />
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
          onClick={clearFilters}
          type="button"
        >
          초기화
        </button>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
          onClick={() => void meetingNotesQuery.refetch()}
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          새로고침
        </button>
      </div>

      {meetingNotesQuery.isLoading ? (
        <MeetingNoteListSkeleton />
      ) : meetingNotesQuery.isError ? (
        <MeetingNoteListError
          error={meetingNotesQuery.error}
          onRetry={() => void meetingNotesQuery.refetch()}
        />
      ) : meetingNotes.length === 0 ? (
        <MeetingNoteEmptyState hasFilter={Boolean(companyId || contactId)} />
      ) : (
        <div className="grid gap-3">
          <div className="hidden grid-cols-[150px_1fr_1fr_1fr_1fr_120px] gap-3 rounded-md border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground lg:grid">
            <span>미팅 일시</span>
            <span>회사</span>
            <span>담당자</span>
            <span>제품</span>
            <span>딜</span>
            <span>등록</span>
          </div>
          {meetingNotes.map((meetingNote) => (
            <MeetingNoteListRow
              key={meetingNote.id}
              meetingNote={meetingNote}
            />
          ))}
        </div>
      )}

      {meetingNotesQuery.data &&
      (meetingNotesQuery.data.totalPages > 1 || page > 1) ? (
        <Pagination
          page={page}
          totalCount={meetingNotesQuery.data.totalCount}
          totalPages={meetingNotesQuery.data.totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </section>
  );
}

// 기능 : 목록 필터 select 필드를 렌더링합니다.
function SelectField({
  id,
  label,
  value,
  options,
  icon,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly { readonly label: string; readonly value: string }[];
  readonly icon?: ReactNode;
  readonly onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <select
          className={`h-10 w-full rounded-md border bg-white pr-8 text-sm outline-none focus:ring-2 focus:ring-ring ${
            icon ? "pl-9" : "pl-3"
          }`}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">전체</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// 기능 : 회의록 목록 row를 렌더링합니다.
function MeetingNoteListRow({
  meetingNote,
}: {
  readonly meetingNote: MeetingNoteListItem;
}) {
  return (
    <Link
      className="grid gap-3 rounded-md border bg-white p-4 transition hover:border-primary/40 hover:shadow-sm lg:grid-cols-[150px_1fr_1fr_1fr_1fr_120px] lg:items-center"
      to={`/meeting-notes/${meetingNote.id}`}
    >
      <span className="text-sm font-medium">
        {formatDateTime(meetingNote.meetingAt, { fallback: "미팅 일시 없음" })}
      </span>
      <SummaryCell fallback="회사 없음" summary={meetingNote.companies} />
      <SummaryCell fallback="담당자 없음" summary={meetingNote.contacts} />
      <SummaryCell fallback="제품 없음" summary={meetingNote.products} />
      <SummaryCell fallback="딜 없음" summary={meetingNote.deals} />
      <span className="text-xs text-muted-foreground">
        {formatDateTime(meetingNote.createdAt)}
      </span>
    </Link>
  );
}

// 기능 : 목록 summary label과 count를 표시합니다.
function SummaryCell({
  summary,
  fallback,
}: {
  readonly summary: { readonly label: string; readonly count: number };
  readonly fallback: string;
}) {
  return (
    <span className="min-w-0 text-sm">
      <span className="block truncate">{summary.label || fallback}</span>
      {summary.count > 1 ? (
        <span className="text-xs text-muted-foreground">총 {summary.count}개</span>
      ) : null}
    </span>
  );
}

// 기능 : 회의록 목록 empty 상태를 렌더링합니다.
function MeetingNoteEmptyState({ hasFilter }: { readonly hasFilter: boolean }) {
  return (
    <div className="grid place-items-center rounded-md border bg-white px-4 py-16 text-center">
      <div className="grid max-w-sm gap-3">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-muted">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">
          {hasFilter ? "조건에 맞는 회의록이 없습니다" : "저장된 회의록이 없습니다"}
        </h2>
        <p className="text-sm text-muted-foreground">
          회사와 담당자를 먼저 기록하면 이후 미팅 맥락을 빠르게 찾을 수 있습니다.
        </p>
        <Link
          className="mx-auto inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          to="/meeting-notes/new"
        >
          <Plus className="h-4 w-4" />
          회의록 작성
        </Link>
      </div>
    </div>
  );
}

// 기능 : 회의록 목록 error 상태를 렌더링합니다.
function MeetingNoteListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-destructive/30 bg-red-50 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>{getApiErrorMessage(error)}</span>
      </div>
      <button
        className="inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
        onClick={onRetry}
        type="button"
      >
        <RefreshCw className="h-4 w-4" />
        다시 시도
      </button>
    </div>
  );
}

// 기능 : 회의록 목록 loading skeleton을 렌더링합니다.
function MeetingNoteListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="grid gap-3 rounded-md border bg-white p-4 lg:grid-cols-[150px_1fr_1fr_1fr_1fr_120px]"
          key={index}
        >
          {Array.from({ length: 6 }, (__, cellIndex) => (
            <div
              className="h-8 animate-pulse rounded-md bg-muted"
              key={cellIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
