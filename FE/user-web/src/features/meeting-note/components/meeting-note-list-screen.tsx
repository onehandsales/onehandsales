import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  FileText,
  IdCard,
  Plus,
  RefreshCw,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import {
  useMeetingNoteFilterCompanies,
  useMeetingNoteFilterContacts,
  useMeetingNoteDetail,
  useMeetingNoteList,
} from "@/features/meeting-note/hooks/use-meeting-note-queries";
import type {
  MeetingNote,
  MeetingNoteListItem,
  MeetingNoteSort,
} from "@/features/meeting-note/types/meeting-note";
import { Pagination } from "@/components/ui/pagination";
import { getApiErrorMessage } from "@/lib/api-client";
import { getMeetingDateParts } from "@/features/meeting-note/utils/meeting-note-date";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";

// 기능 : 회의록 목록과 필터 화면을 렌더링합니다.
export function MeetingNoteListScreen() {
  const [page, setPage] = useState(1);
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [sort, setSort] = useState<MeetingNoteSort>("createdAtDesc");
  const [meetingDateText, setMeetingDateText] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [selectedMeetingNoteId, setSelectedMeetingNoteId] = useState("");
  const params = useMemo(
    () => ({
      companyIds: companyId ? [companyId] : [],
      contactIds: contactId ? [contactId] : [],
      meetingDate: meetingDate || undefined,
      page,
      sort,
    }),
    [companyId, contactId, meetingDate, page, sort]
  );
  const meetingNotesQuery = useMeetingNoteList(params);
  const companiesQuery = useMeetingNoteFilterCompanies();
  const contactsQuery = useMeetingNoteFilterContacts();
  const meetingNotes = useMemo(
    () => meetingNotesQuery.data?.items ?? [],
    [meetingNotesQuery.data?.items]
  );

  const hasFilter = Boolean(companyId || contactId || meetingDate || sort !== "createdAtDesc");

  useEffect(() => {
    if (
      selectedMeetingNoteId &&
      !meetingNotes.some((meetingNote) => meetingNote.id === selectedMeetingNoteId)
    ) {
      setSelectedMeetingNoteId("");
    }
  }, [meetingNotes, selectedMeetingNoteId]);

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

  const onDateSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMeetingDate(meetingDateText);
    setPage(1);
  };

  const clearMeetingDate = () => {
    setMeetingDate("");
    setMeetingDateText("");
    setPage(1);
  };

  // 기능 : 모든 목록 필터를 초기화합니다.
  const clearFilters = () => {
    setCompanyId("");
    setContactId("");
    setMeetingDate("");
    setMeetingDateText("");
    setSort("createdAtDesc");
    setPage(1);
  };

  return (
    <section className="flex flex-1 flex-col overflow-hidden bg-[#FAFAF8]">
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
              ? "inline-flex h-8 items-center rounded-[6px] border border-[#E6EAF0] bg-white px-3 text-[13px] font-medium text-[#475569] transition hover:bg-[#F9FAFB]"
              : "inline-flex h-8 items-center rounded-[6px] border border-[#C7D7FE] bg-[#EAF2FF] px-3 text-[13px] font-bold text-[#1D4ED8] transition"
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
              ? "h-8 min-w-[140px] appearance-none rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[13px] text-[#1D4ED8] outline-none transition"
              : "h-8 min-w-[140px] appearance-none rounded-md border border-[#E2E5EC] bg-transparent px-3 text-[13px] text-[#6B7280] outline-none transition hover:bg-[#FAFAF8]"
          }
          onChange={(e) => updateCompanyId(e.target.value)}
          value={companyId}
        >
          <option value="">회사</option>
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
              ? "h-8 min-w-[140px] appearance-none rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[13px] text-[#1D4ED8] outline-none transition"
              : "h-8 min-w-[140px] appearance-none rounded-md border border-[#E2E5EC] bg-transparent px-3 text-[13px] text-[#6B7280] outline-none transition hover:bg-[#FAFAF8]"
          }
          onChange={(e) => updateContactId(e.target.value)}
          value={contactId}
        >
          <option value="">담당자</option>
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
              ? "h-8 min-w-[128px] appearance-none rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[13px] text-[#1D4ED8] outline-none transition"
              : "h-8 min-w-[128px] appearance-none rounded-md border border-[#E2E5EC] bg-transparent px-3 text-[13px] text-[#6B7280] outline-none transition hover:bg-[#FAFAF8]"
          }
          onChange={(e) => updateSort(e.target.value as MeetingNoteSort)}
          value={sort}
        >
          <option value="createdAtDesc">최신순</option>
          <option value="meetingAtDesc">미팅일순</option>
        </select>

        <form
          className="flex h-8 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-white px-2 transition focus-within:border-[#93C5FD]"
          onSubmit={onDateSearchSubmit}
        >
          <CalendarClock className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
          <input
            aria-label="회의 날짜"
            className="h-7 w-[130px] bg-transparent text-[13px] text-[#111827] outline-none"
            onChange={(event) => setMeetingDateText(event.target.value)}
            type="date"
            value={meetingDateText}
          />
          {meetingDate ? (
            <button
              aria-label="회의 날짜 검색 해제"
              className="grid h-6 w-6 place-items-center rounded-md text-[#9CA3AF] transition hover:bg-[#F3F4F6] hover:text-[#374151]"
              onClick={clearMeetingDate}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            className="inline-flex h-6 items-center gap-1 rounded-md bg-[#374151] px-2 text-[12px] font-medium text-white transition hover:bg-[#111827] disabled:opacity-50"
            disabled={!meetingDateText}
            type="submit"
          >
            <Search className="h-3 w-3" />
            검색
          </button>
        </form>
      </div>

      {/* 테이블 카드 */}
      <div className="flex min-h-0 flex-1 gap-5 overflow-hidden px-5 pb-3 pt-1">
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            {/* 헤더 행 */}
            <div className="flex h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-6">
              <span className="w-[180px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                미팅 일시
              </span>
              <span className="w-[190px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                회사
              </span>
              <span className="w-[160px] shrink-0 text-[12px] font-semibold text-[#64748B]">
                담당자
              </span>
              <span className="min-w-0 flex-1 text-[12px] font-semibold text-[#64748B]">
                딜
              </span>
            </div>

            {/* 목록 내용 */}
            {meetingNotesQuery.isLoading ? (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <MeetingNoteListSkeleton />
              </div>
            ) : meetingNotesQuery.isError ? (
              <MeetingNoteListError
                error={meetingNotesQuery.error}
                onRetry={() => void meetingNotesQuery.refetch()}
              />
            ) : meetingNotes.length === 0 ? (
              <MeetingNoteEmptyState hasFilter={hasFilter} />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">
                {meetingNotes.map((meetingNote) => (
                  <MeetingNoteListRow
                    isActive={meetingNote.id === selectedMeetingNoteId}
                    key={meetingNote.id}
                    meetingNote={meetingNote}
                    onSelect={setSelectedMeetingNoteId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 페이지네이션 (테이블 div 밖) */}
          {meetingNotesQuery.data ? (
            <Pagination
              page={page}
              totalPages={meetingNotesQuery.data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>

        {selectedMeetingNoteId ? (
          <div className="flex w-[380px] shrink-0 flex-col overflow-hidden rounded-lg border border-[#E5EAF0] bg-white">
            <div className="flex shrink-0 items-center justify-between border-b border-[#E6EAF0] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  aria-label="미리보기 닫기"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E5EC] text-[#64748B] transition hover:bg-blue-50/60 hover:text-[#2563EB]"
                  onClick={() => setSelectedMeetingNoteId("")}
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
                  to={`/meeting-notes/${selectedMeetingNoteId}`}
                >
                  상세보기
                </Link>
              </div>
            </div>
            <MeetingNotePreviewPanel meetingNoteId={selectedMeetingNoteId} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

// 기능 : 회의록 목록 row를 렌더링합니다.
function MeetingNoteListRow({
  isActive,
  meetingNote,
  onSelect,
}: {
  readonly isActive: boolean;
  readonly meetingNote: MeetingNoteListItem;
  readonly onSelect: (meetingNoteId: string) => void;
}) {
  return (
    <button
      className={cn(
        "flex h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] px-6 text-left transition-colors last:border-b-0 hover:bg-blue-50/60",
        isActive ? "bg-blue-50" : "bg-white"
      )}
      onClick={() => onSelect(meetingNote.id)}
      type="button"
    >
      <MeetingDateCell value={meetingNote.meetingAt} />
      <SummaryCell
        className="w-[190px] shrink-0"
        summary={meetingNote.companies}
      />
      <SummaryCell
        className="w-[160px] shrink-0"
        summary={meetingNote.contacts}
      />
      <SummaryCell
        className="min-w-0 flex-1"
        summary={meetingNote.deals}
      />
    </button>
  );
}

function MeetingDateCell({ value }: { readonly value: string | null }) {
  const meetingDate = getMeetingDateParts(value);

  if (!meetingDate.hasValue) {
    return (
      <span className="w-[180px] shrink-0 pr-4 text-[13px] font-semibold text-[#111827]">
        {meetingDate.full}
      </span>
    );
  }

  return (
    <span className="w-[180px] shrink-0 pr-4">
      <span className="block truncate text-[13px] font-semibold text-[#111827]">
        {meetingDate.compactDate}
      </span>
      <span className="mt-0.5 block truncate text-[12px] font-medium text-[#64748B]">
        {meetingDate.time}
      </span>
    </span>
  );
}

function MeetingNotePreviewPanel({
  meetingNoteId,
}: {
  readonly meetingNoteId: string;
}) {
  const detailQuery = useMeetingNoteDetail(meetingNoteId);
  const meetingNote = detailQuery.data;

  if (detailQuery.isLoading) {
    return <MeetingNotePreviewSkeleton />;
  }

  if (detailQuery.isError || !meetingNote) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center text-[13px] text-red-500">
        회의록 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-[18px]">
      <div className="grid gap-4">
        <header className="min-w-0">
          <MeetingDatePreviewBadge value={meetingNote.meetingAt} />
          <h2 className="mt-1 truncate text-[15px] font-semibold text-[#111827]">
            {getMeetingNoteTitle(meetingNote)}
          </h2>
        </header>

        <div className="grid grid-cols-2 gap-2.5">
          <PreviewMetric icon={Building2} label="회사" value={meetingNote.companies[0]?.companyNameSnapshot ?? "-"} />
          <PreviewMetric icon={IdCard} label="담당자" value={meetingNote.contacts[0]?.contactUsernameSnapshot ?? "-"} />
          <PreviewMetric icon={BriefcaseBusiness} label="딜" value={meetingNote.deals[0]?.dealNameSnapshot ?? "-"} />
          <PreviewMetric icon={CalendarClock} label="등록" value={formatDateTime(meetingNote.createdAt)} />
        </div>

        <PanelDivider />
        <PreviewTextSection title="회의 내용" value={meetingNote.details} />
        <PreviewTextSection title="다음 계획" value={meetingNote.nextPlan ?? ""} />
        <PreviewTextSection title="필요 조치" value={meetingNote.requiredAction ?? ""} />
      </div>
    </div>
  );
}

function MeetingDatePreviewBadge({ value }: { readonly value: string | null }) {
  const meetingDate = getMeetingDateParts(value, "미팅 일시 없음");

  if (!meetingDate.hasValue) {
    return (
      <p className="text-[12px] font-medium text-[#94A3B8]">
        {meetingDate.full}
      </p>
    );
  }

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-1.5">
      <CalendarClock className="h-4 w-4 shrink-0 text-[#EA580C]" strokeWidth={1.9} />
      <div className="min-w-0">
        <p className="truncate text-[12px] font-semibold text-[#9A3412]">
          {meetingDate.date}
        </p>
        <p className="mt-0.5 text-[12px] font-bold text-[#111827]">
          {meetingDate.time}
        </p>
      </div>
    </div>
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
      <span className="block truncate text-[13px] font-semibold text-[#111827]">
        {summary.label || "-"}
      </span>
      {summary.count > 1 ? (
        <span className="mt-0.5 block text-[12px] font-medium text-[#64748B]">총 {summary.count}개</span>
      ) : null}
    </span>
  );
}

function PreviewMetric({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-[#F9FAFB] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
        {label}
      </div>
      <p className="mt-1 truncate text-[13px] font-semibold text-[#111827]">
        {value || "-"}
      </p>
    </div>
  );
}

function PreviewTextSection({
  title,
  value,
}: {
  readonly title: string;
  readonly value: string;
}) {
  return (
    <section>
      <h3 className="text-[12px] font-semibold text-[#475569]">{title}</h3>
      <p className="mt-2 line-clamp-5 whitespace-pre-wrap rounded-lg bg-[#F9FAFB] px-3 py-2.5 text-[13px] leading-6 text-[#374151]">
        {value.trim() || "-"}
      </p>
    </section>
  );
}

function PanelDivider() {
  return <div className="h-px bg-[#EEF2F7]" />;
}

function MeetingNotePreviewSkeleton() {
  return (
    <div className="flex-1 space-y-4 overflow-hidden px-5 py-[18px]">
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-[#EEF2F7]" />
        <div className="h-4 w-44 animate-pulse rounded bg-[#EEF2F7]" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-16 animate-pulse rounded-lg bg-[#EEF2F7]" key={index} />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-lg bg-[#EEF2F7]" />
      <div className="h-20 animate-pulse rounded-lg bg-[#EEF2F7]" />
    </div>
  );
}

function getMeetingNoteTitle(meetingNote: MeetingNote) {
  const companyName = meetingNote.companies[0]?.companyNameSnapshot;
  const contactName = meetingNote.contacts[0]?.contactUsernameSnapshot;

  if (companyName && contactName) {
    return `${companyName} · ${contactName}`;
  }

  return companyName || contactName || "회의록";
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
          className="flex h-[66px] items-center border-b border-[#E2E5EC] px-6 last:border-b-0"
          key={index}
        >
          <div className="w-[180px] shrink-0 pr-4">
            <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-5 w-20 animate-pulse rounded-full bg-[#F3F4F6]" />
          </div>
          <div className="w-[190px] shrink-0 pr-3">
            <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="w-[160px] shrink-0 pr-3">
            <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="min-w-0 flex-1 pr-3">
            <div className="h-4 w-32 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </>
  );
}
