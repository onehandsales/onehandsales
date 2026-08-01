import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  SensitiveRawAccessDialog,
  useAdminSensitiveRawAccessMutation,
  type AdminSensitiveRawAccessResponse,
} from "@/features/audit-log";
import { useAdminUserDomainRecords } from "../hooks/use-admin-users";
import type {
  AdminDomainRecordDomain,
  AdminDomainRecordItem,
  AdminDomainRecordSort,
  AdminDomainRecordsParams,
} from "../types/admin-user";

const domainRecordLimit = 30;

const domainTabs: readonly AdminDomainRecordDomain[] = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
  "BUSINESS_CARD_SCAN",
  "IMPORT_JOB",
];

const domainLabels: Record<AdminDomainRecordDomain, string> = {
  COMPANY: "회사",
  CONTACT: "담당자",
  PRODUCT: "제품",
  DEAL: "딜",
  SCHEDULE: "일정",
  MEETING_NOTE: "회의록",
  BUSINESS_CARD_SCAN: "명함",
  IMPORT_JOB: "Import",
};

const deletedSortDomains: readonly AdminDomainRecordDomain[] = [
  "COMPANY",
  "CONTACT",
  "PRODUCT",
  "DEAL",
  "SCHEDULE",
  "MEETING_NOTE",
];

type DomainColumn = {
  readonly key: string;
  readonly label: string;
  readonly render: (item: AdminDomainRecordItem) => string;
};

// 기능 : Admin 사용자 상세의 도메인 read-only 탭 화면을 렌더링합니다.
export function AdminUserDomainScreen() {
  const { userId } = useParams<{ userId: string }>();
  const normalizedUserId = userId ?? "";
  const [domain, setDomain] = useState<AdminDomainRecordDomain>("COMPANY");
  const [draftSearch, setDraftSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [sort, setSort] = useState<AdminDomainRecordSort>("createdAt.desc");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedRecord, setSelectedRecord] =
    useState<AdminDomainRecordItem | null>(null);
  const [rawDialogOpen, setRawDialogOpen] = useState(false);
  const [rawResponse, setRawResponse] =
    useState<AdminSensitiveRawAccessResponse | null>(null);
  const rawAccessMutation = useAdminSensitiveRawAccessMutation();
  const params = useMemo(
    () =>
      toDomainRecordsParams({
        domain,
        q: appliedSearch,
        includeDeleted,
        cursor: cursorStack[pageIndex],
        limit: domainRecordLimit,
        sort,
      }),
    [appliedSearch, cursorStack, domain, includeDeleted, pageIndex, sort]
  );
  const recordsQuery = useAdminUserDomainRecords(normalizedUserId, params);
  const columns = useMemo(() => getDomainColumns(domain), [domain]);

  if (!normalizedUserId) {
    return (
      <section className="grid min-h-screen place-items-center px-5 text-sm text-muted-foreground">
        사용자 ID를 확인해 주세요
      </section>
    );
  }

  // 기능 : 도메인 검색 form submit 시 첫 cursor 페이지부터 다시 조회합니다.
  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(draftSearch.trim());
    resetPageState();
  }

  // 기능 : 선택 도메인을 바꾸고 해당 도메인에 맞는 필터 상태로 초기화합니다.
  function handleDomainChange(nextDomain: AdminDomainRecordDomain) {
    setDomain(nextDomain);
    setSelectedRecord(null);
    setDraftSearch("");
    setAppliedSearch("");
    setIncludeDeleted(false);
    setSort("createdAt.desc");
    resetPageState();
  }

  // 기능 : 삭제 row 포함 필터를 바꾸고 첫 페이지부터 다시 조회합니다.
  function handleIncludeDeletedChange(nextIncludeDeleted: boolean) {
    setIncludeDeleted(nextIncludeDeleted);
    setSelectedRecord(null);
    resetPageState();
  }

  // 기능 : 정렬 조건을 바꾸고 첫 페이지부터 다시 조회합니다.
  function handleSortChange(nextSort: AdminDomainRecordSort) {
    setSort(nextSort);
    setSelectedRecord(null);
    resetPageState();
  }

  // 기능 : 다음 cursor 페이지로 이동합니다.
  function handleNextPage() {
    const nextCursor = recordsQuery.data?.nextCursor;

    if (!nextCursor) {
      return;
    }

    setCursorStack((current) => [
      ...current.slice(0, pageIndex + 1),
      nextCursor,
    ]);
    setPageIndex((current) => current + 1);
    setSelectedRecord(null);
  }

  // 기능 : 이전 cursor 페이지로 이동합니다.
  function handlePrevPage() {
    setPageIndex((current) => Math.max(0, current - 1));
    setSelectedRecord(null);
  }

  // 기능 : cursor 페이지 상태를 첫 페이지로 초기화합니다.
  function resetPageState() {
    setCursorStack([]);
    setPageIndex(0);
  }

  // 기능 : 회의록 본문 원문 조회 사유를 G02 API로 제출합니다.
  function handleRawConfirm(reason: string) {
    if (!selectedRecord || domain !== "MEETING_NOTE") {
      return;
    }

    rawAccessMutation.mutate(
      {
        targetUserId: normalizedUserId,
        targetType: "MEETING_NOTE",
        targetId: selectedRecord.id,
        fieldSet: "MEETING_NOTE_BODY",
        reason,
      },
      {
        onSuccess: (response) => {
          setRawDialogOpen(false);
          setRawResponse(response);
        },
      }
    );
  }

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={`/users/${normalizedUserId}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
            aria-label="사용자 상세로"
            title="사용자 상세로"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary">
              Domain records
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-normal">
              도메인 탭
            </h1>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          페이지 {pageIndex + 1}
        </div>
      </header>

      <DomainTabBar domain={domain} onChange={handleDomainChange} />

      <DomainFilterForm
        domain={domain}
        draftSearch={draftSearch}
        includeDeleted={includeDeleted}
        sort={sort}
        onDraftSearchChange={setDraftSearch}
        onIncludeDeletedChange={handleIncludeDeletedChange}
        onSortChange={handleSortChange}
        onSubmit={handleSearchSubmit}
      />

      {recordsQuery.isLoading ? <DomainLoadingState /> : null}
      {recordsQuery.isError ? (
        <DomainErrorState onRetry={() => void recordsQuery.refetch()} />
      ) : null}
      {recordsQuery.data ? (
        <DomainRecordTable
          columns={columns}
          items={recordsQuery.data.items}
          selectedId={selectedRecord?.id ?? ""}
          onSelect={setSelectedRecord}
        />
      ) : null}
      {recordsQuery.data && recordsQuery.data.items.length === 0 ? (
        <DomainEmptyState />
      ) : null}
      {recordsQuery.data ? (
        <DomainPagination
          pageIndex={pageIndex}
          hasNext={recordsQuery.data.nextCursor !== null}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      ) : null}

      <DomainDetailDrawer
        domain={domain}
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onRequestMeetingNoteBody={() => setRawDialogOpen(true)}
      />

      <SensitiveRawAccessDialog
        open={rawDialogOpen}
        title="회의록 본문 원문 조회"
        targetLabel={selectedRecord?.displayTitle ?? "회의록"}
        isPending={rawAccessMutation.isPending}
        onClose={() => setRawDialogOpen(false)}
        onConfirm={handleRawConfirm}
      />

      <RawResultDialog
        response={rawResponse}
        onClose={() => setRawResponse(null)}
      />
    </section>
  );
}

// 기능 : Admin 사용자 도메인 segmented tab을 렌더링합니다.
function DomainTabBar({
  domain,
  onChange,
}: {
  readonly domain: AdminDomainRecordDomain;
  readonly onChange: (domain: AdminDomainRecordDomain) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {domainTabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={[
            "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold",
            domain === tab
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-white text-muted-foreground hover:bg-muted",
          ].join(" ")}
          onClick={() => onChange(tab)}
        >
          <Database className="h-4 w-4" />
          {domainLabels[tab]}
        </button>
      ))}
    </div>
  );
}

// 기능 : Admin 사용자 도메인 목록 filter form을 렌더링합니다.
function DomainFilterForm({
  domain,
  draftSearch,
  includeDeleted,
  sort,
  onDraftSearchChange,
  onIncludeDeletedChange,
  onSortChange,
  onSubmit,
}: {
  readonly domain: AdminDomainRecordDomain;
  readonly draftSearch: string;
  readonly includeDeleted: boolean;
  readonly sort: AdminDomainRecordSort;
  readonly onDraftSearchChange: (value: string) => void;
  readonly onIncludeDeletedChange: (value: boolean) => void;
  readonly onSortChange: (value: AdminDomainRecordSort) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const supportsDeleted = supportsDeletedRows(domain);

  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-4 lg:grid-cols-[minmax(260px,1fr)_150px_170px_auto]"
      onSubmit={onSubmit}
    >
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>검색</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-9 w-full rounded-md border bg-white pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            value={draftSearch}
            onChange={(event) => onDraftSearchChange(event.target.value)}
          />
        </div>
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>삭제 row</span>
        <span className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={includeDeleted}
            disabled={!supportsDeleted}
            onChange={(event) =>
              onIncludeDeletedChange(event.target.checked && supportsDeleted)
            }
          />
          포함
        </span>
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>정렬</span>
        <select
          className="h-9 rounded-md border bg-white px-2 text-sm text-foreground"
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as AdminDomainRecordSort)
          }
        >
          <option value="createdAt.desc">생성 최신순</option>
          <option value="updatedAt.desc">수정 최신순</option>
          {supportsDeleted ? (
            <option value="deletedAt.desc">삭제 최신순</option>
          ) : null}
        </select>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
          aria-label="검색"
          title="검색"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

// 기능 : Admin 사용자 도메인 목록 table을 렌더링합니다.
function DomainRecordTable({
  columns,
  items,
  selectedId,
  onSelect,
}: {
  readonly columns: readonly DomainColumn[];
  readonly items: readonly AdminDomainRecordItem[];
  readonly selectedId: string;
  readonly onSelect: (record: AdminDomainRecordItem) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <div className="min-w-[1120px]">
        <div
          className="grid gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground"
          style={{ gridTemplateColumns: createGridTemplate(columns.length) }}
        >
          <span>제목</span>
          <span>상태</span>
          {columns.map((column) => (
            <span key={column.key}>{column.label}</span>
          ))}
          <span>생성</span>
          <span>삭제</span>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                "grid w-full gap-3 px-4 py-3 text-left text-sm hover:bg-muted/60",
                selectedId === item.id ? "bg-primary/5" : "",
              ].join(" ")}
              style={{ gridTemplateColumns: createGridTemplate(columns.length) }}
              onClick={() => onSelect(item)}
            >
              <span className="truncate font-medium">{item.displayTitle}</span>
              <span>{item.status}</span>
              {columns.map((column) => (
                <span key={column.key} className="truncate text-muted-foreground">
                  {column.render(item)}
                </span>
              ))}
              <span className="text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </span>
              <span className="text-muted-foreground">
                {formatDateTime(item.deletedAt)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : Admin 사용자 도메인 detail drawer를 안전한 field만 표시하도록 렌더링합니다.
function DomainDetailDrawer({
  domain,
  record,
  onClose,
  onRequestMeetingNoteBody,
}: {
  readonly domain: AdminDomainRecordDomain;
  readonly record: AdminDomainRecordItem | null;
  readonly onClose: () => void;
  readonly onRequestMeetingNoteBody: () => void;
}) {
  if (!record) {
    return null;
  }

  const canRequestMeetingBody =
    domain === "MEETING_NOTE" &&
    record.status === "ACTIVE" &&
    record.sensitiveFlags["hasBody"] === true;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 grid w-full max-w-xl grid-rows-[auto_1fr] border-l bg-white shadow-xl">
      <header className="flex items-start justify-between gap-4 border-b p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-primary">
            {domainLabels[domain]}
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold">
            {record.displayTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{record.status}</p>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
          onClick={onClose}
          aria-label="닫기"
          title="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </header>
      <div className="grid content-start gap-5 overflow-y-auto p-5">
        <section className="grid gap-3">
          <h3 className="text-sm font-semibold">기본 정보</h3>
          <InfoGrid
            rows={[
              ["ID", record.id],
              ["생성", formatDateTime(record.createdAt)],
              ["수정", formatDateTime(record.updatedAt)],
              ["삭제", formatDateTime(record.deletedAt)],
              ["Trash 만료", formatDateTime(record.trashExpiresAt)],
            ]}
          />
        </section>

        <section className="grid gap-3">
          <h3 className="text-sm font-semibold">Safe summary</h3>
          <InfoGrid rows={toDisplayRows(record.summary)} />
        </section>

        <section className="grid gap-3">
          <h3 className="text-sm font-semibold">Sensitive flags</h3>
          <InfoGrid rows={toDisplayRows(record.sensitiveFlags)} />
        </section>

        {canRequestMeetingBody ? (
          <button
            type="button"
            className="inline-flex h-9 w-fit items-center gap-2 rounded-md border px-3 text-sm font-semibold hover:bg-muted"
            onClick={onRequestMeetingNoteBody}
          >
            <ShieldAlert className="h-4 w-4 text-destructive" />
            본문 원문 조회
          </button>
        ) : null}
      </div>
    </aside>
  );
}

// 기능 : 승인된 민감 원문 조회 결과를 drawer 밖 modal로 렌더링합니다.
function RawResultDialog({
  response,
  onClose,
}: {
  readonly response: AdminSensitiveRawAccessResponse | null;
  readonly onClose: () => void;
}) {
  if (!response) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="grid w-full max-w-2xl gap-4 rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">승인된 원문</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              accessId {response.accessId}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="닫기"
            title="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto">
          {Object.entries(response.data).map(([key, value]) => (
            <div key={key} className="grid gap-1 rounded-md border p-3">
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                {key}
              </div>
              <pre className="whitespace-pre-wrap break-words text-sm">
                {value ?? "원문이 비어 있어요"}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// 기능 : label/value row 목록을 compact grid로 렌더링합니다.
function InfoGrid({ rows }: { readonly rows: readonly (readonly [string, string])[] }) {
  return (
    <div className="grid gap-2">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 rounded-md border px-3 py-2">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            {label}
          </div>
          <div className="break-words text-sm">{value}</div>
        </div>
      ))}
    </div>
  );
}

// 기능 : 도메인 목록 loading 상태를 렌더링합니다.
function DomainLoadingState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      불러오고 있어요
    </div>
  );
}

// 기능 : 도메인 목록 empty 상태를 렌더링합니다.
function DomainEmptyState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white px-4 text-center text-sm text-muted-foreground">
      검색어나 필터를 바꾸면 더 많은 row를 찾을 수 있어요
    </div>
  );
}

// 기능 : 도메인 목록 error 상태를 렌더링합니다.
function DomainErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <p className="text-sm text-muted-foreground">
        도메인 row를 불러오지 못했어요
      </p>
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
}

// 기능 : cursor 기반 도메인 목록 페이지 이동 버튼을 렌더링합니다.
function DomainPagination({
  pageIndex,
  hasNext,
  onPrev,
  onNext,
}: {
  readonly pageIndex: number;
  readonly hasNext: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:opacity-40"
        onClick={onPrev}
        disabled={pageIndex === 0}
        aria-label="이전"
        title="이전"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:opacity-40"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="다음"
        title="다음"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// 기능 : domain별 table column 정의를 반환합니다.
function getDomainColumns(domain: AdminDomainRecordDomain): readonly DomainColumn[] {
  switch (domain) {
    case "COMPANY":
      return [
        createSummaryColumn("field", "분야"),
        createSummaryColumn("region", "지역"),
        createSummaryColumn("contacts", "담당자"),
        createSummaryColumn("deals", "딜"),
      ];
    case "CONTACT":
      return [
        createSummaryColumn("companyName", "회사"),
        createSummaryColumn("department", "부서"),
        createSummaryColumn("emailMasked", "이메일"),
        createSummaryColumn("mobileMasked", "전화"),
      ];
    case "PRODUCT":
      return [
        createSummaryColumn("category", "카테고리"),
        createSummaryColumn("productStatus", "상태"),
        createSummaryColumn("productPrice", "금액"),
        createSummaryColumn("deals", "딜"),
      ];
    case "DEAL":
      return [
        createSummaryColumn("dealStatus", "딜 상태"),
        createSummaryColumn("dealCost", "금액"),
        createSummaryColumn("expectedEndDate", "마감"),
        createSummaryColumn("companies", "회사"),
      ];
    case "SCHEDULE":
      return [
        createSummaryColumn("startAt", "시작"),
        createSummaryColumn("endAt", "종료"),
        createSummaryColumn("sourceType", "출처"),
        createSummaryColumn("linkedDeals", "딜"),
      ];
    case "MEETING_NOTE":
      return [
        createSummaryColumn("meetingAt", "회의"),
        createSummaryColumn("sourceType", "출처"),
        createSummaryColumn("linkedDeals", "딜"),
        createSummaryColumn("bodyPreview", "본문"),
      ];
    case "BUSINESS_CARD_SCAN":
      return [
        createSummaryColumn("scanStatus", "OCR"),
        createSummaryColumn("companyName", "회사"),
        createSummaryColumn("contactName", "담당자"),
        createSummaryColumn("safeErrorCode", "실패 코드"),
      ];
    case "IMPORT_JOB":
      return [
        createSummaryColumn("targetType", "대상"),
        createSummaryColumn("importStatus", "상태"),
        createSummaryColumn("totalRows", "전체"),
        createSummaryColumn("importedRows", "반영"),
      ];
  }
}

// 기능 : summary key 기반 table column 정의를 생성합니다.
function createSummaryColumn(key: string, label: string): DomainColumn {
  return {
    key,
    label,
    render: (item) => formatSummaryValue(item.summary[key] ?? null),
  };
}

// 기능 : API 조회 params에서 비어 있는 값을 제거합니다.
function toDomainRecordsParams(
  params: AdminDomainRecordsParams
): AdminDomainRecordsParams {
  const q = params.q?.trim();

  return {
    domain: params.domain,
    ...(params.limit !== undefined ? { limit: params.limit } : {}),
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.includeDeleted !== undefined
      ? { includeDeleted: params.includeDeleted }
      : {}),
    ...(params.cursor ? { cursor: params.cursor } : {}),
    ...(q ? { q } : {}),
  };
}

// 기능 : 도메인이 soft deleted row 필터를 지원하는지 확인합니다.
function supportsDeletedRows(domain: AdminDomainRecordDomain): boolean {
  return deletedSortDomains.some((item) => item === domain);
}

// 기능 : table grid column template 문자열을 생성합니다.
function createGridTemplate(domainColumnCount: number): string {
  return [
    "220px",
    "90px",
    ...Array.from({ length: domainColumnCount }, () => "140px"),
    "140px",
    "140px",
  ].join(" ");
}

// 기능 : 객체 key/value를 화면 표시 row로 변환합니다.
function toDisplayRows(
  valueMap: Record<string, string | number | boolean | null>
): Array<readonly [string, string]> {
  return Object.entries(valueMap).map(([key, value]) => [
    key,
    formatSummaryValue(value),
  ]);
}

// 기능 : summary 값을 table과 drawer 표시 문자열로 변환합니다.
function formatSummaryValue(value: string | number | boolean | null): string {
  if (value === null) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Y" : "N";
  }

  if (typeof value === "number") {
    return value.toLocaleString("ko-KR");
  }

  if (isIsoDateTime(value)) {
    return formatDateTime(value);
  }

  return value;
}

// 기능 : ISO 날짜 문자열 여부를 확인합니다.
function isIsoDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T/.test(value);
}

// 기능 : ISO 날짜 문자열을 Admin Web 표시용 날짜/시간으로 변환합니다.
function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
