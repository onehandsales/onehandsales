import {
  AlertCircle,
  FileText,
  Link2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/page-header";
import { useMeetingNoteList } from "@/features/meeting-note/hooks/use-meeting-note-queries";
import { Pagination } from "@/components/ui/pagination";
import type { MeetingNote } from "@/features/meeting-note/types/meeting-note";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

export function MeetingNoteListScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const deferredSearch = useDeferredValue(search.trim());
  const meetingNotesQuery = useMeetingNoteList({
    page,
    pageSize,
    search: deferredSearch || undefined,
  });
  const meetingNotes = useMemo(
    () => meetingNotesQuery.data?.items ?? [],
    [meetingNotesQuery.data?.items]
  );
  const totalPages = meetingNotesQuery.data
    ? Math.max(1, Math.ceil(meetingNotesQuery.data.totalCount / pageSize))
    : 1;

  return (
    <section className="flex min-h-full flex-col bg-[#FAFAF8]">
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
            tooltip: "AI 회의록 작성",
            onClick: () => void navigate("/meeting-notes/new"),
            variant: "primary",
          },
        ]}
      />

      {/* 검색 툴바 */}
      <div className="flex h-10 shrink-0 items-center gap-2 px-5 pb-2">
        <div className="flex h-7 items-center gap-1.5 rounded-md border border-[#E2E5EC] bg-[#FAFAF8] px-2.5 transition focus-within:border-[#93C5FD] focus-within:bg-white">
          <Search className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <input
            className="w-[240px] bg-transparent text-[12px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="회사, 담당자, 품목, 상세내용 검색"
            value={search}
          />
        </div>
        <div className="flex-1" />
        <span className="text-[12px] text-[#9CA3AF]">
          {meetingNotesQuery.data?.totalCount ?? 0}건
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 py-3">
      {meetingNotesQuery.isLoading ? (
        <MeetingNoteListSkeleton />
      ) : meetingNotesQuery.isError ? (
        <MeetingNoteListError
          error={meetingNotesQuery.error}
          onRetry={() => void meetingNotesQuery.refetch()}
        />
      ) : meetingNotes.length === 0 ? (
        <MeetingNoteEmptyState hasSearch={deferredSearch.length > 0} />
      ) : (
        <div className="grid gap-3">
          <div className="hidden grid-cols-[140px_1.1fr_1fr_1fr_120px] gap-3 rounded-md border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground lg:grid">
            <span>날짜</span>
            <span>회사/담당자</span>
            <span>품목/단계</span>
            <span>상세내용</span>
            <span>딜 연결</span>
          </div>

          {meetingNotes.map((meetingNote) => (
            <MeetingNoteListItem
              key={meetingNote.id}
              meetingNote={meetingNote}
            />
          ))}
        </div>
      )}

      {meetingNotesQuery.data && (totalPages > 1 || page > 1) ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
      </div>
    </section>
  );
}

function MeetingNoteListItem({
  meetingNote,
}: {
  readonly meetingNote: MeetingNote;
}) {
  return (
    <Link
      className="grid gap-3 rounded-lg border bg-white p-4 transition hover:border-primary/40 hover:shadow-sm lg:grid-cols-[140px_1.1fr_1fr_1fr_120px] lg:items-center"
      to={`/meeting-notes/${meetingNote.id}`}
    >
      <div className="text-sm font-medium">
        {formatDateTime(meetingNote.meetingDate, { fallback: "날짜 없음" })}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {meetingNote.companyName || "회사 미입력"}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {meetingNote.contactName || "담당자 미입력"}
          {meetingNote.department ? ` · ${meetingNote.department}` : ""}
        </p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm">{meetingNote.productName || "품목 미입력"}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {meetingNote.stageText || "단계 미입력"}
        </p>
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">
        {meetingNote.details}
      </p>
      <div>
        {meetingNote.dealId ? (
          <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{meetingNote.dealTitle ?? "연결됨"}</span>
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            미연결
          </span>
        )}
      </div>
    </Link>
  );
}

function MeetingNoteEmptyState({ hasSearch }: { readonly hasSearch: boolean }) {
  return (
    <div className="grid place-items-center rounded-lg border bg-white px-4 py-16 text-center">
      <div className="grid max-w-sm gap-3">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-md bg-muted">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">
          {hasSearch ? "검색된 회의록이 없습니다" : "저장된 회의록이 없습니다"}
        </h2>
        <p className="text-sm text-muted-foreground">
          회의 내용을 입력하고 AI 결과를 수정해 첫 회의록을 저장하세요.
        </p>
        <Link
          className="mx-auto inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          to="/meeting-notes/new"
        >
          <Plus className="h-4 w-4" />
          AI 회의록 작성
        </Link>
      </div>
    </div>
  );
}

function MeetingNoteListError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-red-50 px-4 py-3">
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

function MeetingNoteListSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          className="grid gap-3 rounded-lg border bg-white p-4 lg:grid-cols-[140px_1.1fr_1fr_1fr_120px]"
          key={index}
        >
          {Array.from({ length: 5 }, (__, cellIndex) => (
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
