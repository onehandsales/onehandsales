import { Search, Shield, UserRound } from "lucide-react";
import { useState } from "react";
import {
  useAdminUser,
  useAdminUserDomainList,
  useAdminUsers,
} from "@/features/admin-query/hooks/use-admin-query";
import type { AdminDomainType, AdminUser } from "@/features/admin-query/types/admin-query";
import { domainLabels, formatDate, getErrorMessage } from "../utils/admin-query-ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  PaginationControls,
} from "./admin-screen-shared";

const pageSize = 20;
const domainTabs: readonly AdminDomainType[] = [
  "companies",
  "contacts",
  "products",
  "deals",
];

export function AdminUsersScreen() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const usersQuery = useAdminUsers({
    page,
    pageSize,
    search: search || undefined,
    status: status || undefined,
    role: role || undefined,
  });
  const selectedUser =
    usersQuery.data?.items.find((user) => user.id === selectedUserId) ?? null;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchText.trim());
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="사용자 운영"
        description="관리자 권한으로 사용자 목록과 사용자별 데이터를 마스킹 상태로 조회합니다."
      />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_440px]">
        <section className="grid min-w-0 content-start gap-4">
          <form
            className="grid gap-3 rounded-lg border bg-white p-4 lg:grid-cols-[minmax(260px,1fr)_160px_140px_96px]"
            onSubmit={onSubmit}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="이름 또는 이메일 검색"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="">전체 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="SUSPENDED">정지</option>
              <option value="DELETED">삭제</option>
            </select>
            <select
              className="h-10 rounded-md border bg-white px-3 text-sm"
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
            >
              <option value="">전체 역할</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
            >
              <Search className="h-4 w-4" aria-hidden />
              검색
            </button>
          </form>

          {usersQuery.isLoading ? <LoadingState /> : null}
          {usersQuery.isError ? (
            <ErrorState
              message={getErrorMessage(usersQuery.error)}
              onRetry={() => void usersQuery.refetch()}
            />
          ) : null}
          {usersQuery.data ? (
            <UserTable
              users={usersQuery.data.items}
              selectedUserId={selectedUserId}
              onSelect={setSelectedUserId}
            />
          ) : null}
          {usersQuery.data && usersQuery.data.items.length === 0 ? (
            <EmptyState message="조건에 맞는 사용자가 없습니다." />
          ) : null}
          {usersQuery.data ? (
            <PaginationControls
              page={page}
              totalCount={usersQuery.data.totalCount}
              hasNext={usersQuery.data.hasNext}
              onPrev={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => current + 1)}
            />
          ) : null}
        </section>

        <UserDetailPanel userId={selectedUserId} fallbackUser={selectedUser} />
      </div>
    </section>
  );
}

function UserTable({
  users,
  selectedUserId,
  onSelect,
}: {
  readonly users: readonly AdminUser[];
  readonly selectedUserId: string;
  readonly onSelect: (userId: string) => void;
}) {
  if (users.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-[1fr_180px_120px_120px_140px] gap-3 border-b bg-muted/50 px-4 py-3 text-xs font-semibold text-muted-foreground">
          <span>사용자</span>
          <span>이메일</span>
          <span>상태</span>
          <span>역할</span>
          <span>가입일</span>
        </div>
        <div className="divide-y">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className={[
                "grid w-full grid-cols-[1fr_180px_120px_120px_140px] gap-3 px-4 py-3 text-left text-sm hover:bg-muted/60",
                selectedUserId === user.id ? "bg-primary/5" : "",
              ].join(" ")}
              onClick={() => onSelect(user.id)}
            >
              <span className="font-medium">{user.name ?? user.id}</span>
              <span className="text-muted-foreground">
                {user.emailMasked ?? "-"}
              </span>
              <span>{user.status}</span>
              <span>{user.role}</span>
              <span className="text-muted-foreground">
                {formatDate(user.createdAt)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserDetailPanel({
  userId,
  fallbackUser,
}: {
  readonly userId: string;
  readonly fallbackUser: AdminUser | null;
}) {
  const [domain, setDomain] = useState<AdminDomainType>("companies");
  const userQuery = useAdminUser(userId);
  const domainQuery = useAdminUserDomainList(userId, domain, {
    page: 1,
    pageSize: 5,
  });
  const user = userQuery.data?.user ?? fallbackUser;

  if (!userId) {
    return (
    <aside className="grid min-h-[420px] min-w-0 place-items-center rounded-lg border bg-white px-4 text-center text-sm text-muted-foreground">
        사용자를 선택하면 상세 정보와 사용자별 데이터를 확인할 수 있습니다.
      </aside>
    );
  }

  return (
    <aside className="grid min-w-0 content-start gap-4 rounded-lg border bg-white p-4">
      <div className="flex items-start gap-3 border-b pb-4">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10">
          <UserRound className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">
            {user?.name ?? userId}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.emailMasked ?? "-"}
          </p>
        </div>
      </div>

      {userQuery.isLoading ? <LoadingState /> : null}
      {userQuery.isError ? (
        <ErrorState
          message={getErrorMessage(userQuery.error)}
          onRetry={() => void userQuery.refetch()}
        />
      ) : null}

      {userQuery.data ? (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Info label="상태" value={userQuery.data.user.status} />
          <Info label="역할" value={userQuery.data.user.role} />
          <Info
            label="최근 로그인"
            value={formatDate(userQuery.data.user.lastLoginAt)}
          />
          <Info label="가입일" value={formatDate(userQuery.data.user.createdAt)} />
          <Info
            label="회사"
            value={String(userQuery.data.usageSummary.companyCount)}
          />
          <Info
            label="딜"
            value={String(userQuery.data.usageSummary.dealCount)}
          />
        </div>
      ) : null}

      <div className="grid gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {domainTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={[
                "h-9 rounded-md border px-3 text-sm font-medium",
                domain === tab
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-white hover:bg-muted",
              ].join(" ")}
              onClick={() => setDomain(tab)}
            >
              {domainLabels[tab]}
            </button>
          ))}
        </div>

        <div className="rounded-lg border">
          <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" aria-hidden />
            사용자별 {domainLabels[domain]}
          </div>
          {domainQuery.isLoading ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">조회 중</div>
          ) : null}
          {domainQuery.data?.items.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              데이터가 없습니다.
            </div>
          ) : null}
          {domainQuery.data?.items.map((item) => (
            <div key={item.id} className="border-b px-3 py-2 text-sm last:border-0">
              <div className="font-medium">{getDomainItemTitle(item)}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                삭제일 {formatDate(item.deletedAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function getDomainItemTitle(
  item: { readonly id: string; readonly name?: string; readonly title?: string }
) {
  return item.name ?? item.title ?? item.id;
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
