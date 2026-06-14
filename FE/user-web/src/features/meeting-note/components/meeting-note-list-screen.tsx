import {
  AlertCircle,
  FileText,
  Link2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMeetingNoteList } from "@/features/meeting-note/hooks/use-meeting-note-queries";
import { Pagination } from "@/components/ui/pagination";
import type { MeetingNote } from "@/features/meeting-note/types/meeting-note";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

export function MeetingNoteListScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search.trim());
  const meetingNotesQuery = useMeetingNoteList({
    page,
    pageSize: 20,
    search: deferredSearch || undefined,
  });
  const meetingNotes = useMemo(
    () => meetingNotesQuery.data?.items ?? [],
    [meetingNotesQuery.data?.items]
  );

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">회의록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI로 정리한 회의 내용을 확인하고 딜 활동 이력과 연결합니다.
          </p>
        </div>
        <Link
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          to="/meeting-notes/new"
        >
          <Plus className="h-4 w-4" />
          AI 회의록 작성
        </Link>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="회사, 담당자, 품목, 상세내용 검색"
            value={search}
          />
        </div>
        <button
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border bg-white px-3 text-sm font-medium hover:bg-muted"
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

      {meetingNotesQuery.data && (meetingNotesQuery.data.hasNext || page > 1) ? (
        <Pagination
          hasNext={meetingNotesQuery.data.hasNext}
          page={page}
          totalCount={meetingNotesQuery.data.totalCount}
          onPageChange={setPage}
        />
      ) : null}
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
