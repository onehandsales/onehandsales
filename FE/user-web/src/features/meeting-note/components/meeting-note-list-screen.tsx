import {
  AlertCircle,
  CalendarClock,
  FileText,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { ListFilterSelect } from "@/components/ui/list-filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { MeetingNoteCreateDialog } from "@/features/meeting-note/components/meeting-note-create-dialog";
import {
  useMeetingNoteFilterCompanies,
  useMeetingNoteFilterContacts,
  useMeetingNoteList,
} from "@/features/meeting-note/hooks/use-meeting-note-queries";
import type {
  MeetingNoteListItem,
  MeetingNoteListParams,
  MeetingNoteSort,
} from "@/features/meeting-note/types/meeting-note";
import { getMeetingDateParts } from "@/features/meeting-note/utils/meeting-note-date";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { readLocationNotice } from "@/utils/location-state";

const MEETING_NOTE_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(180px,1.45fr) minmax(120px,0.85fr) minmax(112px,0.8fr) minmax(104px,0.75fr)",
};

const MEETING_NOTE_SORT_OPTIONS = [
  { value: "createdAtDesc", label: "최신순" },
  { value: "meetingAtDesc", label: "미팅일순" },
] satisfies readonly { readonly value: MeetingNoteSort; readonly label: string }[];

// 기능 : 회의록 목록과 필터 화면을 렌더링합니다.
export function MeetingNoteListScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [sort, setSort] = useState<MeetingNoteSort>("createdAtDesc");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo<MeetingNoteListParams>(
    () => ({
      companyIds: companyId ? [companyId] : [],
      contactIds: contactId ? [contactId] : [],
      page,
      ...(search ? { search } : {}),
      sort,
    }),
    [companyId, contactId, page, search, sort],
  );

  const meetingNotesQuery = useMeetingNoteList(params);
  const companiesQuery = useMeetingNoteFilterCompanies();
  const contactsQuery = useMeetingNoteFilterContacts();
  const meetingNotes = useMemo(
    () => meetingNotesQuery.data?.items ?? [],
    [meetingNotesQuery.data?.items],
  );
  const companyFilterOptions = useMemo(
    () => [
      { value: "", label: "회사" },
      ...(companiesQuery.data?.items ?? []).map((company) => ({
        value: company.id,
        label: company.companyName,
      })),
    ],
    [companiesQuery.data?.items],
  );
  const contactFilterOptions = useMemo(
    () => [
      { value: "", label: "담당자" },
      ...(contactsQuery.data?.items ?? []).map((contact) => ({
        value: contact.id,
        label: contact.contactUsername,
      })),
    ],
    [contactsQuery.data?.items],
  );
  const hasFilter = Boolean(
    search || companyId || contactId || sort !== "createdAtDesc",
  );

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (searchParams.get("create") !== "1") {
      return;
    }

    setIsCreateOpen(true);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("create");
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchText.trim());
    setPage(1);
  };

  const updateCompanyId = (value: string) => {
    setCompanyId(value);
    setPage(1);
  };

  const updateContactId = (value: string) => {
    setContactId(value);
    setPage(1);
  };

  const updateSort = (value: MeetingNoteSort) => {
    setSort(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchText("");
    setSearch("");
    setCompanyId("");
    setContactId("");
    setSort("createdAtDesc");
    setPage(1);
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      <PageHeader
        breadcrumbs={[{ label: "회의록", icon: FileText }]}
        actions={[
          {
            icon: Plus,
            tooltip: "회의록 추가",
            onClick: () => setIsCreateOpen(true),
            variant: "primary",
          },
        ]}
      />

      <div className="hidden min-h-10 shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-1 md:flex lg:gap-2">
        <form
          className="flex h-8 w-[clamp(150px,20vw,220px)] shrink-0 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-3 transition hover:border-[#93C5FD] hover:bg-white focus-within:border-[#4880EE] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#4880EE]"
          onSubmit={onSearchSubmit}
        >
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="회의록 제목 검색"
            value={searchText}
          />
        </form>
        <FilterChip
          active={!hasFilter}
          icon={RotateCcw}
          label="초기화"
          onClick={clearFilters}
        />
        <ListFilterSelect<string>
          active={companyId.length > 0}
          ariaLabel="회사 필터"
          className="w-[clamp(112px,12vw,140px)]"
          onChange={updateCompanyId}
          options={companyFilterOptions}
          value={companyId}
        />
        <ListFilterSelect<string>
          active={contactId.length > 0}
          ariaLabel="담당자 필터"
          className="w-[clamp(112px,12vw,140px)]"
          onChange={updateContactId}
          options={contactFilterOptions}
          value={contactId}
        />
        <ListFilterSelect<MeetingNoteSort>
          active={sort !== "createdAtDesc"}
          ariaLabel="정렬 조건"
          className="w-[clamp(108px,11vw,128px)]"
          onChange={updateSort}
          options={MEETING_NOTE_SORT_OPTIONS}
          value={sort}
        />
        <div className="flex-1" />
        <span className="shrink-0 text-[12px] text-[#9CA3AF]">
          {meetingNotesQuery.data?.totalCount ?? 0}개
        </span>
      </div>

      {notice ? (
        <div className="hidden px-5 pt-2 md:block">
          <Toast
            message={notice}
            onClose={() => setNotice(null)}
            variant="success"
          />
        </div>
      ) : null}

      <div className="hidden overflow-x-auto px-5 pb-3 pt-1 md:block">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex w-full min-w-[560px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            <div
              className="grid h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:px-4 xl:px-6"
              style={MEETING_NOTE_TABLE_GRID_STYLE}
            >
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                제목
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                미팅일
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                회사
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                담당자
              </span>
            </div>

            {meetingNotesQuery.isLoading ? (
              <MeetingNoteListSkeleton />
            ) : meetingNotesQuery.isError ? (
              <MeetingNoteListError
                error={meetingNotesQuery.error}
                onRetry={() => void meetingNotesQuery.refetch()}
              />
            ) : meetingNotes.length === 0 ? (
              <ListEmptyState
                actionIcon={Plus}
                actionLabel="회의록 추가"
                icon={FileText}
                onAction={() => setIsCreateOpen(true)}
                title={
                  hasFilter
                    ? "조건에 맞는 회의록이 없습니다"
                    : "등록된 회의록이 없습니다"
                }
              />
            ) : (
              <div className="min-w-0">
                {meetingNotes.map((meetingNote) => (
                  <MeetingNoteListRow
                    key={meetingNote.id}
                    meetingNote={meetingNote}
                  />
                ))}
              </div>
            )}
          </div>

          {meetingNotesQuery.data ? (
            <Pagination
              page={page}
              totalPages={meetingNotesQuery.data.totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        {notice ? (
          <div className="px-4 pt-2">
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
          </div>
        ) : null}

        <form
          className="flex h-11 shrink-0 items-center gap-2 border-b border-[#E5E7EB] bg-white px-4"
          onSubmit={onSearchSubmit}
        >
          <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
          <input
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="회의록 제목 검색"
            value={searchText}
          />
        </form>

        <div className="flex h-10 shrink-0 items-center gap-2 overflow-x-auto border-b border-[#E5E7EB] px-4">
          <button
            aria-label="초기화"
            aria-pressed={!hasFilter}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#4880EE] bg-[#4880EE] text-[12px] font-bold text-white transition focus:border-[#4880EE] focus:outline-none focus:ring-1 focus:ring-[#4880EE]"
            onClick={clearFilters}
            type="button"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <ListFilterSelect<string>
            active={companyId.length > 0}
            ariaLabel="회사 필터"
            className="w-[112px]"
            onChange={updateCompanyId}
            options={companyFilterOptions}
            value={companyId}
          />
          <ListFilterSelect<string>
            active={contactId.length > 0}
            ariaLabel="담당자 필터"
            className="w-[112px]"
            onChange={updateContactId}
            options={contactFilterOptions}
            value={contactId}
          />
          <ListFilterSelect<MeetingNoteSort>
            active={sort !== "createdAtDesc"}
            ariaLabel="정렬 조건"
            className="w-[104px]"
            onChange={updateSort}
            options={MEETING_NOTE_SORT_OPTIONS}
            value={sort}
          />
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {meetingNotesQuery.data?.totalCount ?? 0}개
          </span>
        </div>

        <div className="bg-white">
          {meetingNotesQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
                  key={index}
                />
              ))}
            </div>
          ) : meetingNotesQuery.isError ? (
            <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
              <p className="text-[13px] text-red-500">
                {getApiErrorMessage(meetingNotesQuery.error)}
              </p>
              <button
                className="mt-3 inline-flex h-8 items-center rounded-md border border-[#E2E5EC] bg-white px-3 text-[12px] text-[#6B7280]"
                onClick={() => void meetingNotesQuery.refetch()}
                type="button"
              >
                다시 시도
              </button>
            </div>
          ) : meetingNotes.length === 0 ? (
            <ListEmptyState
              actionIcon={Plus}
              actionLabel="회의록 추가"
              icon={FileText}
              onAction={() => setIsCreateOpen(true)}
              title={
                hasFilter
                  ? "조건에 맞는 회의록이 없습니다"
                  : "등록된 회의록이 없습니다"
              }
            />
          ) : (
            meetingNotes.map((meetingNote) => (
              <MeetingNoteMobileCard
                key={meetingNote.id}
                meetingNote={meetingNote}
              />
            ))
          )}
        </div>

        {meetingNotesQuery.data ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={page}
              totalPages={meetingNotesQuery.data.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        <button
          aria-label="회의록 추가"
          className="fixed bottom-24 right-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#5E5CE6] shadow-[0_4px_16px_rgba(59,130,246,0.27)] transition active:opacity-80"
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>
      </section>

      {isCreateOpen ? (
        <MeetingNoteCreateDialog
          onCreated={() => {
            setNotice("회의록이 추가되었습니다.");
            setPage(1);
            void meetingNotesQuery.refetch();
          }}
          onOpenChange={setIsCreateOpen}
          open={isCreateOpen}
        />
      ) : null}
    </section>
  );
}

// 기능 : 목록 필터 초기화 버튼을 렌더링합니다.
function FilterChip({
  active,
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
      aria-pressed={active}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#4880EE] bg-[#4880EE] text-[13px] font-bold text-white transition hover:bg-[#4880EE] focus:border-[#4880EE] focus:outline-none focus:ring-1 focus:ring-[#4880EE]"
      onClick={onClick}
      type="button"
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
    </button>
  );
}

// 기능 : 모바일 회의록 목록 카드를 렌더링합니다.
function MeetingNoteMobileCard({
  meetingNote,
}: {
  readonly meetingNote: MeetingNoteListItem;
}) {
  const meetingDate = getMeetingDateParts(meetingNote.meetingAt);
  const meetingDateLabel = meetingDate.hasValue
    ? `${meetingDate.compactDate} ${meetingDate.time}`
    : meetingDate.full;
  const relationLabel =
    [meetingNote.companies.label, meetingNote.contacts.label]
      .filter(Boolean)
      .join(" · ") || "-";
  const relationCount = Math.max(
    meetingNote.companies.count,
    meetingNote.contacts.count,
  );

  return (
    <Link
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] transition active:bg-[#F9FAFB]"
      to={`/meeting-notes/${meetingNote.id}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
        <CalendarClock className="h-4 w-4 text-[#EA580C]" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {meetingNote.title}
          </span>
          {relationCount > 1 ? (
            <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#F1F5F9] px-2 text-[11px] font-semibold text-[#475569]">
              외 {relationCount - 1}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
          {meetingDateLabel}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">
          {relationLabel}
        </p>
      </div>
    </Link>
  );
}

// 기능 : 회의록 목록 row를 클릭 가능한 상세 이동 항목으로 렌더링합니다.
function MeetingNoteListRow({
  meetingNote,
}: {
  readonly meetingNote: MeetingNoteListItem;
}) {
  const navigate = useNavigate();
  const detailPath = `/meeting-notes/${meetingNote.id}`;

  return (
    <div
      className={cn(
        "grid h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] bg-white px-3 text-left transition-colors last:border-b-0 hover:bg-blue-50/60 md:px-4 xl:px-6",
      )}
      onClick={() => void navigate(detailPath)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void navigate(detailPath);
        }
      }}
      role="button"
      style={MEETING_NOTE_TABLE_GRID_STYLE}
      tabIndex={0}
    >
      <TitleCell title={meetingNote.title} />
      <MeetingDateCell value={meetingNote.meetingAt} />
      <SummaryCell summary={meetingNote.companies} />
      <SummaryCell summary={meetingNote.contacts} />
    </div>
  );
}

function TitleCell({ title }: { readonly title: string }) {
  return (
    <span className="min-w-0 pr-3">
      <span className="block truncate text-[13px] font-semibold text-[#111827]">
        {title}
      </span>
    </span>
  );
}

function MeetingDateCell({ value }: { readonly value: string | null }) {
  const meetingDate = getMeetingDateParts(value);

  if (!meetingDate.hasValue) {
    return (
      <span className="min-w-0 pr-3 text-[13px] font-semibold text-[#111827]">
        {meetingDate.full}
      </span>
    );
  }

  return (
    <span className="min-w-0 pr-3">
      <span className="block truncate text-[13px] font-semibold text-[#111827]">
        {meetingDate.compactDate}
      </span>
      <span className="mt-0.5 block truncate text-[12px] font-medium text-[#64748B]">
        {meetingDate.time}
      </span>
    </span>
  );
}

// 기능 : 목록 summary label과 count를 표시합니다.
function SummaryCell({
  summary,
}: {
  readonly summary: { readonly label: string; readonly count: number };
}) {
  return (
    <span className="min-w-0 pr-3">
      <span className="block truncate text-[13px] font-semibold text-[#111827]">
        {summary.label || "-"}
      </span>
      {summary.count > 1 ? (
        <span className="mt-0.5 block text-[12px] font-medium text-[#64748B]">
          총 {summary.count}개
        </span>
      ) : null}
    </span>
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
      {Array.from({ length: 6 }, (_, rowIndex) => (
        <div
          className="grid h-[66px] items-center border-b border-[#E2E5EC] px-3 last:border-b-0 md:px-4 xl:px-6"
          key={rowIndex}
          style={MEETING_NOTE_TABLE_GRID_STYLE}
        >
          {Array.from({ length: 4 }, (_, cellIndex) => (
            <div className="min-w-0 pr-3" key={cellIndex}>
              <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
              {cellIndex === 1 ? (
                <div className="mt-2 h-3 w-16 animate-pulse rounded bg-[#F3F4F6]" />
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
