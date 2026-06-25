import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  FileText,
  IdCard,
  Plus,
  RefreshCw,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { ListRowActions } from "@/components/ui/list-row-actions";
import { ListEmptyState } from "@/components/ui/state";
import { Toast } from "@/components/ui/toast";
import { MeetingNoteCreateDialog } from "@/features/meeting-note/components/meeting-note-create-dialog";
import {
  useMeetingNoteFilterCompanies,
  useMeetingNoteFilterContacts,
  useMeetingNoteDetail,
  useMeetingNoteList,
} from "@/features/meeting-note/hooks/use-meeting-note-queries";
import { useDeleteMeetingNoteMutation } from "@/features/meeting-note/hooks/use-meeting-note-mutations";
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
import { readLocationNotice } from "@/utils/location-state";

const MEETING_NOTE_TABLE_GRID_STYLE = {
  gridTemplateColumns:
    "minmax(100px,0.8fr) minmax(86px,0.85fr) minmax(78px,0.75fr) minmax(116px,1.1fr) minmax(74px,0.5fr)",
};

// 기능 : 회의록 목록과 필터 화면을 렌더링합니다.
export function MeetingNoteListScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [companyId, setCompanyId] = useState("");
  const [contactId, setContactId] = useState("");
  const [sort, setSort] = useState<MeetingNoteSort>("createdAtDesc");
  const [selectedMeetingNoteId, setSelectedMeetingNoteId] = useState("");
  const [pinnedMeetingNoteId, setPinnedMeetingNoteId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(
    () => ({
      companyIds: companyId ? [companyId] : [],
      contactIds: contactId ? [contactId] : [],
      page,
      sort,
    }),
    [companyId, contactId, page, sort],
  );
  const meetingNotesQuery = useMeetingNoteList(params);
  const companiesQuery = useMeetingNoteFilterCompanies();
  const contactsQuery = useMeetingNoteFilterContacts();
  const deleteMeetingNoteMutation = useDeleteMeetingNoteMutation();
  const meetingNotes = useMemo(
    () => meetingNotesQuery.data?.items ?? [],
    [meetingNotesQuery.data?.items],
  );

  useEffect(() => {
    const message = readLocationNotice(location.state);
    if (!message) {
      return;
    }

    setNotice(message);
    void navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const hasFilter = Boolean(companyId || contactId || sort !== "createdAtDesc");

  useEffect(() => {
    if (searchParams.get("create") !== "1") {
      return;
    }

    setIsCreateOpen(true);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("create");
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (
      selectedMeetingNoteId &&
      selectedMeetingNoteId !== pinnedMeetingNoteId &&
      !meetingNotes.some(
        (meetingNote) => meetingNote.id === selectedMeetingNoteId,
      )
    ) {
      setSelectedMeetingNoteId("");
    }
  }, [meetingNotes, pinnedMeetingNoteId, selectedMeetingNoteId]);

  const selectMeetingNote = (meetingNoteId: string) => {
    setPinnedMeetingNoteId("");
    setSelectedMeetingNoteId(meetingNoteId);
  };

  const closePreview = () => {
    setPinnedMeetingNoteId("");
    setSelectedMeetingNoteId("");
  };

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

  const onDeleteMeetingNote = async (meetingNote: MeetingNoteListItem) => {
    const title = getMeetingNoteListTitle(meetingNote);
    if (!window.confirm(`${title} 회의록을 삭제할까요?`)) {
      return;
    }

    setActionError(null);

    try {
      await deleteMeetingNoteMutation.mutateAsync(meetingNote.id);
      if (selectedMeetingNoteId === meetingNote.id) {
        setSelectedMeetingNoteId("");
      }
      if (pinnedMeetingNoteId === meetingNote.id) {
        setPinnedMeetingNoteId("");
      }
      setNotice("회의록이 삭제되었습니다.");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
      {/* 페이지 헤더 */}
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

      {/* 필터 툴바 (데스크톱) */}
      <div className="hidden min-h-10 shrink-0 items-center gap-1.5 overflow-x-auto px-5 py-1 md:flex lg:gap-2">
        {/* 전체(초기화) FilterChip */}
        <button
          className={
            hasFilter
              ? "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-[6px] border border-[#E6EAF0] bg-white px-3 text-[13px] font-medium text-[#475569] transition hover:bg-[#F9FAFB]"
              : "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-[6px] border border-[#C7D7FE] bg-[#EAF2FF] px-3 text-[13px] font-bold text-[#1D4ED8] transition"
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
              ? "h-8 w-[clamp(112px,12vw,140px)] shrink-0 appearance-none rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[13px] text-[#1D4ED8] outline-none transition"
              : "h-8 w-[clamp(112px,12vw,140px)] shrink-0 appearance-none rounded-md border border-[#E2E5EC] bg-transparent px-3 text-[13px] text-[#6B7280] outline-none transition hover:bg-[#FAFAF8]"
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
              ? "h-8 w-[clamp(112px,12vw,140px)] shrink-0 appearance-none rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[13px] text-[#1D4ED8] outline-none transition"
              : "h-8 w-[clamp(112px,12vw,140px)] shrink-0 appearance-none rounded-md border border-[#E2E5EC] bg-transparent px-3 text-[13px] text-[#6B7280] outline-none transition hover:bg-[#FAFAF8]"
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
              ? "h-8 w-[clamp(108px,11vw,128px)] shrink-0 appearance-none rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-3 text-[13px] text-[#1D4ED8] outline-none transition"
              : "h-8 w-[clamp(108px,11vw,128px)] shrink-0 appearance-none rounded-md border border-[#E2E5EC] bg-transparent px-3 text-[13px] text-[#6B7280] outline-none transition hover:bg-[#FAFAF8]"
          }
          onChange={(e) => updateSort(e.target.value as MeetingNoteSort)}
          value={sort}
        >
          <option value="createdAtDesc">최신순</option>
          <option value="meetingAtDesc">미팅일순</option>
        </select>
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
      {actionError ? (
        <div className="hidden px-5 pt-2 md:block">
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {actionError}
          </p>
        </div>
      ) : null}

      {/* 테이블 카드 (데스크톱) */}
      <div className="hidden gap-3 overflow-x-auto px-5 pb-3 pt-1 md:flex xl:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex w-full min-w-[500px] flex-col overflow-hidden rounded-lg border border-[#E2E5EC] bg-white shadow-sm">
            {/* 헤더 행 */}
            <div
              className="grid h-11 shrink-0 items-center border-b border-[#E2E5EC] bg-[#F9FAFB] px-3 md:px-4 xl:px-6"
              style={MEETING_NOTE_TABLE_GRID_STYLE}
            >
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                미팅 일시
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                회사
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                담당자
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                딜
              </span>
              <span className="min-w-0 truncate text-[12px] font-semibold text-[#64748B]">
                관리
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
                    deleteDisabled={deleteMeetingNoteMutation.isPending}
                    isActive={meetingNote.id === selectedMeetingNoteId}
                    key={meetingNote.id}
                    meetingNote={meetingNote}
                    onDelete={() => void onDeleteMeetingNote(meetingNote)}
                    onSelect={selectMeetingNote}
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
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#E6EAF0] px-4">
              <div className="flex items-center gap-2">
                <button
                  aria-label="미리보기 닫기"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#E2E5EC] text-[#64748B] transition hover:bg-blue-50/60 hover:text-[#4880EE]"
                  onClick={closePreview}
                  title="닫기"
                  type="button"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <span className="text-[12px] font-medium text-[#6B7280]">
                  미리보기
                </span>
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

      {/* 모바일 뷰 */}
      <section className="flex min-h-0 flex-1 flex-col md:hidden">
        {/* 모바일 알림 */}
        {notice ? (
          <div className="px-4 pt-2">
            <Toast
              message={notice}
              onClose={() => setNotice(null)}
              variant="success"
            />
          </div>
        ) : null}

        {/* 모바일 필터 칩 행 */}
        <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
          <button
            className={cn(
              "inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-[12px] font-medium transition",
              !hasFilter
                ? "border-[#5E5CE6] bg-[#EEEEFF] text-[#5E5CE6]"
                : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
            )}
            onClick={clearFilters}
            type="button"
          >
            전체
          </button>
          <select
            className={cn(
              "h-7 appearance-none rounded-full border px-3 text-[12px] outline-none transition",
              companyId
                ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
            )}
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
          <select
            className={cn(
              "h-7 appearance-none rounded-full border px-3 text-[12px] outline-none transition",
              contactId
                ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563]",
            )}
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
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">
            {meetingNotesQuery.data?.totalCount ?? 0}개
          </span>
        </div>

        {/* 모바일 카드 목록 */}
        <div className="bg-white">
          {meetingNotesQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-[80px] animate-pulse border-b border-[#E5E7EB] bg-[#F9FAFB]"
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

        {/* 모바일 페이지네이션 */}
        {meetingNotesQuery.data ? (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-2">
            <Pagination
              page={page}
              totalPages={meetingNotesQuery.data.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        {/* FAB */}
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
          onCreated={(meetingNote) => {
            setNotice("회의록이 추가되었습니다.");
            setPage(1);
            setPinnedMeetingNoteId(meetingNote.id);
            setSelectedMeetingNoteId(meetingNote.id);
            void meetingNotesQuery.refetch();
          }}
          onOpenChange={setIsCreateOpen}
          open={isCreateOpen}
        />
      ) : null}
    </section>
  );
}

function MeetingNoteMobileCard({
  meetingNote,
}: {
  readonly meetingNote: MeetingNoteListItem;
}) {
  const meetingDate = getMeetingDateParts(meetingNote.meetingAt);

  return (
    <Link
      className="flex w-full items-start gap-3 border-b border-[#E5E7EB] bg-white px-4 py-[14px] transition active:bg-[#F9FAFB]"
      to={`/meeting-notes/${meetingNote.id}`}
    >
      {/* 날짜 아이콘 */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7ED]">
        <CalendarClock className="h-4 w-4 text-[#EA580C]" strokeWidth={2} />
      </div>
      {/* 내용 */}
      <div className="min-w-0 flex-1">
        {/* Row1: 회사 · 담당자 */}
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate text-[14px] font-semibold text-[#111827]">
            {meetingNote.companies.label ||
              meetingNote.contacts.label ||
              "회의록"}
          </span>
          {meetingNote.companies.count > 1 || meetingNote.contacts.count > 1 ? (
            <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-[#F1F5F9] px-2 text-[11px] font-semibold text-[#475569]">
              외{" "}
              {Math.max(
                meetingNote.companies.count,
                meetingNote.contacts.count,
              ) - 1}
            </span>
          ) : null}
        </div>
        {/* Row2: 딜 */}
        <p className="mt-0.5 truncate text-[12px] text-[#6B7280]">
          {meetingNote.deals.label || "-"}
        </p>
        {/* Row3: 미팅 일시 */}
        <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
          {meetingDate.hasValue
            ? `${meetingDate.compactDate} ${meetingDate.time}`
            : meetingDate.full}
        </p>
      </div>
    </Link>
  );
}

// 기능 : 회의록 목록 row를 렌더링합니다.
function MeetingNoteListRow({
  deleteDisabled,
  isActive,
  meetingNote,
  onDelete,
  onSelect,
}: {
  readonly deleteDisabled: boolean;
  readonly isActive: boolean;
  readonly meetingNote: MeetingNoteListItem;
  readonly onDelete: () => void;
  readonly onSelect: (meetingNoteId: string) => void;
}) {
  return (
    <div
      className={cn(
        "grid h-[66px] w-full cursor-pointer items-center border-b border-[#E2E5EC] px-3 text-left transition-colors last:border-b-0 hover:bg-blue-50/60 md:px-4 xl:px-6",
        isActive ? "bg-blue-50" : "bg-white",
      )}
      onClick={() => onSelect(meetingNote.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(meetingNote.id);
        }
      }}
      role="button"
      style={MEETING_NOTE_TABLE_GRID_STYLE}
      tabIndex={0}
    >
      <MeetingDateCell value={meetingNote.meetingAt} />
      <SummaryCell summary={meetingNote.companies} />
      <SummaryCell summary={meetingNote.contacts} />
      <SummaryCell summary={meetingNote.deals} />
      <ListRowActions
        deleteLabel={`${getMeetingNoteListTitle(meetingNote)} 삭제`}
        detailTo={`/meeting-notes/${meetingNote.id}`}
        disabled={deleteDisabled}
        onDelete={onDelete}
      />
    </div>
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
          <PreviewMetric
            icon={Building2}
            label="회사"
            value={meetingNote.companies[0]?.companyNameSnapshot ?? "-"}
          />
          <PreviewMetric
            icon={IdCard}
            label="담당자"
            value={meetingNote.contacts[0]?.contactUsernameSnapshot ?? "-"}
          />
          <PreviewMetric
            icon={BriefcaseBusiness}
            label="딜"
            value={meetingNote.deals[0]?.dealNameSnapshot ?? "-"}
          />
          <PreviewMetric
            icon={CalendarClock}
            label="등록"
            value={formatDateTime(meetingNote.createdAt)}
          />
        </div>

        <PanelDivider />
        <PreviewTextSection title="회의 내용" value={meetingNote.details} />
        <PreviewTextSection
          title="다음 계획"
          value={meetingNote.nextPlan ?? ""}
        />
        <PreviewTextSection
          title="필요 조치"
          value={meetingNote.requiredAction ?? ""}
        />
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
      <CalendarClock
        className="h-4 w-4 shrink-0 text-[#EA580C]"
        strokeWidth={1.9}
      />
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
          <div
            className="h-16 animate-pulse rounded-lg bg-[#EEF2F7]"
            key={index}
          />
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

function getMeetingNoteListTitle(meetingNote: MeetingNoteListItem) {
  const companyName = meetingNote.companies.label;
  const contactName = meetingNote.contacts.label;

  if (companyName && contactName) {
    return `${companyName} · ${contactName}`;
  }

  return companyName || contactName || "회의록";
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
          className="grid h-[66px] items-center border-b border-[#E2E5EC] px-3 last:border-b-0 md:px-4 xl:px-6"
          key={index}
          style={MEETING_NOTE_TABLE_GRID_STYLE}
        >
          <div className="min-w-0 pr-3">
            <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-5 w-20 animate-pulse rounded-full bg-[#F3F4F6]" />
          </div>
          <div className="min-w-0 pr-3">
            <div className="h-4 w-24 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="min-w-0 pr-3">
            <div className="h-4 w-20 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
          <div className="min-w-0 pr-3">
            <div className="h-4 w-32 animate-pulse rounded bg-[#F3F4F6]" />
          </div>
        </div>
      ))}
    </>
  );
}
