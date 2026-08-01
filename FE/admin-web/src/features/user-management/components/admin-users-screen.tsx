import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  UserRound,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers } from "../hooks/use-admin-users";
import type {
  AdminUserListItem,
  AdminUserListParams,
  AdminUserListSort,
  AdminUserStatus,
} from "../types/admin-user";

const userListLimit = 50;

type UserFilterFormState = {
  readonly q: string;
  readonly status: "" | AdminUserStatus;
  readonly countryCode: string;
  readonly preferredLocale: string;
  readonly sort: AdminUserListSort;
};

const emptyFilters: UserFilterFormState = {
  q: "",
  status: "",
  countryCode: "",
  preferredLocale: "",
  sort: "createdAt.desc",
};

// 기능 : Admin 사용자 목록, 필터, cursor 페이지 이동을 렌더링합니다.
export function AdminUsersScreen() {
  const navigate = useNavigate();
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const params = useMemo(
    () =>
      toUserListParams(appliedFilters, cursorStack[pageIndex], userListLimit),
    [appliedFilters, cursorStack, pageIndex]
  );
  const usersQuery = useAdminUsers(params);

  // 기능 : 필터 form submit 시 첫 페이지부터 다시 조회합니다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setCursorStack([]);
    setPageIndex(0);
  }

  // 기능 : 사용자 목록 필터를 초기 상태로 되돌립니다.
  function handleReset() {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCursorStack([]);
    setPageIndex(0);
  }

  // 기능 : 다음 cursor 페이지로 이동합니다.
  function handleNextPage() {
    const nextCursor = usersQuery.data?.nextCursor;

    if (!nextCursor) {
      return;
    }

    setCursorStack((current) => [
      ...current.slice(0, pageIndex + 1),
      nextCursor,
    ]);
    setPageIndex((current) => current + 1);
  }

  // 기능 : 이전 cursor 페이지로 이동합니다.
  function handlePrevPage() {
    setPageIndex((current) => Math.max(0, current - 1));
  }

  // 기능 : 선택한 사용자 상세 route로 이동합니다.
  function handleSelectUser(userId: string) {
    navigate(`/users/${userId}`);
  }

  return (
    <section className="grid min-w-0 gap-5 px-5 py-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">
            User overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">
            사용자 운영
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          페이지 {pageIndex + 1}
        </div>
      </header>

      <UserFilterForm
        filters={draftFilters}
        onChange={setDraftFilters}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />

      {usersQuery.isLoading ? <UserLoadingState /> : null}
      {usersQuery.isError ? (
        <UserErrorState onRetry={() => void usersQuery.refetch()} />
      ) : null}
      {usersQuery.data ? (
        <UserTable
          users={usersQuery.data.items}
          onSelectUser={handleSelectUser}
        />
      ) : null}
      {usersQuery.data && usersQuery.data.items.length === 0 ? (
        <UserEmptyState />
      ) : null}
      {usersQuery.data ? (
        <UserPagination
          pageIndex={pageIndex}
          hasNext={usersQuery.data.nextCursor !== null}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
        />
      ) : null}
    </section>
  );
}

// 기능 : Admin 사용자 목록 필터 form을 렌더링합니다.
function UserFilterForm({
  filters,
  onChange,
  onReset,
  onSubmit,
}: {
  readonly filters: UserFilterFormState;
  readonly onChange: (filters: UserFilterFormState) => void;
  readonly onReset: () => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="grid gap-3 rounded-lg border bg-white p-4 xl:grid-cols-[minmax(220px,1fr)_150px_110px_130px_170px_auto]"
      onSubmit={onSubmit}
    >
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>검색</span>
        <input
          className="h-9 rounded-md border bg-white px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          value={filters.q}
          onChange={(event) => onChange({ ...filters, q: event.target.value })}
        />
      </label>
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>상태</span>
        <select
          className="h-9 rounded-md border bg-white px-2 text-sm text-foreground"
          value={filters.status}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target.value as "" | AdminUserStatus,
            })
          }
        >
          <option value="">전체</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="DELETED">DELETED</option>
        </select>
      </label>
      <UserTextFilter
        label="국가"
        value={filters.countryCode}
        onChange={(value) => onChange({ ...filters, countryCode: value })}
      />
      <UserTextFilter
        label="Locale"
        value={filters.preferredLocale}
        onChange={(value) => onChange({ ...filters, preferredLocale: value })}
      />
      <label className="grid gap-1 text-xs font-medium text-muted-foreground">
        <span>정렬</span>
        <select
          className="h-9 rounded-md border bg-white px-2 text-sm text-foreground"
          value={filters.sort}
          onChange={(event) =>
            onChange({
              ...filters,
              sort: event.target.value as AdminUserListSort,
            })
          }
        >
          <option value="createdAt.desc">가입 최신순</option>
          <option value="lastLoginAt.desc">최근 로그인순</option>
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
          aria-label="검색"
          title="검색"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
          onClick={onReset}
          aria-label="초기화"
          title="초기화"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

// 기능 : 사용자 목록 텍스트 필터 입력을 렌더링합니다.
function UserTextFilter({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <input
        className="h-9 rounded-md border bg-white px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

// 기능 : Admin 사용자 목록 table을 렌더링합니다.
function UserTable({
  users,
  onSelectUser,
}: {
  readonly users: readonly AdminUserListItem[];
  readonly onSelectUser: (userId: string) => void;
}) {
  if (users.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <div className="min-w-[1120px]">
        <div className="grid grid-cols-[170px_180px_90px_90px_90px_80px_80px_80px_120px_130px] gap-3 border-b bg-muted/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
          <span>가입</span>
          <span>사용자</span>
          <span>상태</span>
          <span>국가</span>
          <span>Locale</span>
          <span>회사</span>
          <span>담당자</span>
          <span>딜</span>
          <span>휴지통</span>
          <span>최근 로그인</span>
        </div>
        <div className="divide-y">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className="grid w-full grid-cols-[170px_180px_90px_90px_90px_80px_80px_80px_120px_130px] gap-3 px-4 py-3 text-left text-sm hover:bg-muted/60"
              onClick={() => onSelectUser(user.id)}
            >
              <span className="text-muted-foreground">
                {formatDateTime(user.createdAt)}
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <UserRound className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {user.displayNameMasked ?? user.id}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.emailMasked ?? "-"}
                  </span>
                </span>
              </span>
              <span>{user.status}</span>
              <span>{user.countryCode}</span>
              <span>{user.preferredLocale}</span>
              <span>{user.domainCounts.companies}</span>
              <span>{user.domainCounts.contacts}</span>
              <span>{user.domainCounts.deals}</span>
              <span>
                {user.domainCounts.trashActive}/{user.domainCounts.trashExpired}
              </span>
              <span className="text-muted-foreground">
                {formatDateTime(user.lastLoginAt)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 기능 : 사용자 목록 loading 상태를 렌더링합니다.
function UserLoadingState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white text-sm text-muted-foreground">
      불러오는 중이에요
    </div>
  );
}

// 기능 : 사용자 목록 empty 상태를 렌더링합니다.
function UserEmptyState() {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border bg-white px-4 text-center text-sm text-muted-foreground">
      조건에 맞는 사용자가 없어요
    </div>
  );
}

// 기능 : 사용자 목록 error 상태를 렌더링합니다.
function UserErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-4 text-center">
      <p className="text-sm text-muted-foreground">
        사용자 목록을 불러오지 못했어요
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

// 기능 : cursor 기반 사용자 목록 페이지 이동 버튼을 렌더링합니다.
function UserPagination({
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

// 기능 : 사용자 목록 filter form state를 API params로 변환합니다.
function toUserListParams(
  filters: UserFilterFormState,
  cursor: string | undefined,
  limit: number
): AdminUserListParams {
  const q = filters.q.trim();
  const countryCode = filters.countryCode.trim();
  const preferredLocale = filters.preferredLocale.trim();

  return {
    limit,
    sort: filters.sort,
    ...(cursor ? { cursor } : {}),
    ...(q ? { q } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(countryCode ? { countryCode } : {}),
    ...(preferredLocale ? { preferredLocale } : {}),
  };
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
