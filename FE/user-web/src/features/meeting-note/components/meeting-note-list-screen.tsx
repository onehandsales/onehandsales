import {
  AlertCircle,
  FileText,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
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

  const hasFilter = Boolean(companyId || contactId || sort !== "createdAtDesc");

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
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      {/* 페이지 헤더 */}
      <PageHeader
        breadcrumbs={[{ label: "회의록", icon: FileText }]}
        actions={[
          {
            icon: RefreshCw,
            tooltip: "새로고침",
            onClick: () => void meetingNotesQuery.refetch(),
          },
          {
            icon: Plus,
            tooltip: "회의록 작성",
            href: "/meeting-notes/new",
            variant: "primary",
          },
        ]}
      />

      {/* 필터 툴바 */}
      <div className="flex h-10 shrink-0 items-center gap-2 px-5">
        {/* 전체(초기화) FilterChip */}
        <button
          className={
            hasFilter
              ? "border border-[#E6EAF0] bg-white font-medium text-[#475569] hover:bg-[#F9FAFB] inline-flex h-7 items-center rounded-md px-2.5 text-[12px] transition"
              : "border border-[#C7D7FE] bg-[#EAF2FF] font-bold text-[#1D4ED8] inline-flex h-7 items-center rounded-md px-2.5 text-[12px] transition"
          }
          onClick={clearFilters}
          type="button"
        >
          전체
        </button>

        {/* 회사 필터 */}
        <select
          className={
            companyId
              ? "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          }
          onChange={(e) => updateCompanyId(e.target.value)}
          value={companyId}
        >
          <option value="">회사 전체</option>
          {(companiesQuery.data?.items ?? []).map((company) => (
            <option key={company.id} value={company.id}>
              {company.companyName}
            </option>
          ))}
        </select>

        {/* 담당자 필터 */}
        <select
          className={
            contactId
              ? "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          }
          onChange={(e) => updateContactId(e.target.value)}
          value={contactId}
        >
          <option value="">담당자 전체</option>
          {(contactsQuery.data?.items ?? []).map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.contactUsername}
            </option>
          ))}
        </select>

        {/* 정렬 필터 */}
        <select
          className={
            sort !== "createdAtDesc"
              ? "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
              : "h-7 appearance-none rounded-md border px-2.5 text-[12px] outline-none transition border-[#E2E5EC] bg-transparent text-[#6B7280] hover:bg-[#FAFAF8]"
          }
          onChange={(e) => updateSort(e.target.value as MeetingNoteSort)}
          value={sort}
        >
          <option value="createdAtDesc">등록 최신순</option>
          <option value="meetingAtDesc">미팅 최신순</option>
        </select>
      </div>

      {/* 테이블 카드 */}
      <div className="px-5 pb-1 pt-3 flex flex-1 flex-col min-h-0">
        <div className="overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
          {/* 헤더 행 */}
          <div className="flex h-9 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-4">
            <span className="w-[140px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              미팅 일시
            </span>
            <span className="w-[180px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              회사
            </span>
            <span className="w-[150px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              담당자
            </span>
            <span className="w-[150px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              제품
            </span>
            <span className="min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              딜
            </span>
            <span className="w-[80px] shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              등록일
            </span>
          </div>

          {/* 목록 내용 */}
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
            meetingNotes.map((meetingNote) => (
              <MeetingNoteListRow
                key={meetingNote.id}
                meetingNote={meetingNote}
              />
            ))
          )}
        </div>

        {/* 페이지네이션 (테이블 div 밖) */}
        {meetingNotesQuery.data ? (
          <Pagination
            page={page}
            totalPages={meetingNotesQuery.data.totalPages}
            totalCount={meetingNotesQuery.data.totalCount}
            onPageChange={setPage}
            className="py-3"
          />
        ) : null}
      </div>
    </section>
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
      className="flex h-[52px] items-center border-b border-[#E2E5EC] px-4 last:border-b-0 hover:bg-[#FAFAF8]"
      to={`/meeting-notes/${meetingNote.id}`}
    >
      <span className="w-[140px] shrink-0 text-[13px] font-medium text-[#111827]">
        {formatDateTime(meetingNote.meetingAt, { fallback: "-" })}
      </span>
      <SummaryCell
        className="w-[180px] shrink-0"
        summary={meetingNote.companies}
      />
      <SummaryCell
        className="w-[150px] shrink-0"
        summary={meetingNote.contacts}
      />
      <SummaryCell
        className="w-[150px] shrink-0"
        summary={meetingNote.products}
      />
      <SummaryCell
        className="min-w-0 flex-1"
        summary={meetingNote.deals}
      />
      <span className="w-[80px] shrink-0 text-[12px] text-[#6B7280]">
        {formatDateTime(meetingNote.createdAt)}
      </span>
    </Link>
  );
}

// 기능 : 목록 summary label과 count를 표시합니다.
function SummaryCell({
  summary,
  className,
}: {
  readonly summary: { readonly label: string; readonly count: number };
  readonly className?: string;
}) {
  return (
    <span className={`min-w-0 pr-3 ${className ?? ""}`}>
      <span className="block truncate text-[13px] font-medium text-[#111827]">
        {summary.label || "-"}
      </span>
      {summary.count > 1 ? (
        <span className="text-[12px] text-[#6B7280]">총 {summary.count}개</span>
      ) : null}
    </span>
  );
}

// 기능 : 회의록 목록 empty 상태를 렌더링합니다.
function MeetingNoteEmptyState({ hasFilter }: { readonly hasFilter: boolean }) {
  return (
    <div className="grid place-items-center px-4 py-16 text-center">
      <div className="grid max-w-sm gap-3">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-[#F3F4F6]">
          <FileText className="h-5 w-5 text-[#9CA3AF]" />
        </div>
        <h2 className="text-[14px] font-semibold text-[#111827]">
          {hasFilter ? "조건에 맞는 회의록이 없습니다" : "저장된 회의록이 없습니다"}
        </h2>
        <p className="text-[13px] text-[#6B7280]">
          회사와 담당자를 먼저 기록하면 이후 미팅 맥락을 빠르게 찾을 수 있습니다.
        </p>
        <Link
          className="mx-auto inline-flex h-9 items-center gap-2 rounded-md bg-[#2563EB] px-4 text-[13px] font-medium text-white hover:bg-[#1D4ED8]"
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
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-2 text-[13px] text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{getApiErrorMessage(error)}</span>
      </div>
      <button
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F5F6F8]"
        onClick={onRetry}
        type="button"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        다시 시도
      </button>
    </div>
  );
}

// 기능 : 회의록 목록 loading skeleton을 렌더링합니다.
function MeetingNoteListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="flex h-[52px] items-center border-b border-[#E2E5EC] px-4 last:border-b-0"
          key={index}
        >
          <div className="w-[140px] shrink-0 pr-3">
            <div className="h-4 w-28 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="w-[180px] shrink-0 pr-3">
            <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="w-[150px] shrink-0 pr-3">
            <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="w-[150px] shrink-0 pr-3">
            <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="min-w-0 flex-1 pr-3">
            <div className="h-4 w-32 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="w-[80px] shrink-0">
            <div className="h-4 w-16 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </>
  );
}
