import {
  Building2,
  CalendarDays,
  FileText,
  Handshake,
  Loader2,
  Package,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSearchAll } from "@/features/search/hooks/use-search-queries";
import type {
  SearchGroup,
  SearchItem,
  SearchTargetType,
} from "@/features/search/types/search";
import { getApiErrorMessage } from "@/lib/api-client";

const SEARCH_LIMIT = 5;
const EMPTY_SEARCH_GROUPS: readonly SearchGroup[] = [];

const targetMeta: Record<
  SearchTargetType,
  { readonly label: string; readonly icon: LucideIcon }
> = {
  COMPANY: { label: "회사", icon: Building2 },
  CONTACT: { label: "담당자", icon: UserRound },
  PRODUCT: { label: "제품", icon: Package },
  DEAL: { label: "딜", icon: Handshake },
  SCHEDULE: { label: "일정", icon: CalendarDays },
  MEETING_NOTE: { label: "회의록", icon: FileText },
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const normalizedQuery = query.trim();
  const deferredQuery = useDeferredValue(normalizedQuery);
  const canSearch = deferredQuery.length >= 2;
  const searchQuery = useSearchAll(
    { q: deferredQuery, limit: SEARCH_LIMIT },
    canSearch
  );
  const groups = searchQuery.data?.groups ?? EMPTY_SEARCH_GROUPS;
  const totalCount = useMemo(
    () => groups.reduce((total, group) => total + group.items.length, 0),
    [groups]
  );

  const onDesktopInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setDesktopOpen(true);
  };

  const onMobileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setDesktopOpen(false);
      setMobileOpen(false);
      inputRef.current?.blur();
    }
  };

  const onSelect = (group: SearchGroup, item: SearchItem) => {
    const targetPath = item.targetPath ?? getFallbackTargetPath(group.type, item);

    if (targetPath) {
      navigate(targetPath);
    }

    setDesktopOpen(false);
    setMobileOpen(false);
  };

  const onOpenMobile = () => {
    setMobileOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <>
      <div className="relative hidden w-full max-w-2xl md:block">
        <SearchInput
          inputRef={inputRef}
          query={query}
          onChange={onDesktopInputChange}
          onFocus={() => setDesktopOpen(true)}
          onKeyDown={onKeyDown}
        />

        {desktopOpen && !mobileOpen ? (
          <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-lg border bg-white shadow-lg">
            <SearchResultsPanel
              canSearch={normalizedQuery.length >= 2}
              error={searchQuery.error}
              groups={groups}
              isFetching={searchQuery.isFetching}
              totalCount={totalCount}
              onClose={() => setDesktopOpen(false)}
              onSelect={onSelect}
            />
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="inline-flex h-10 w-full items-center gap-2 rounded-md border bg-white px-3 text-left text-sm text-muted-foreground md:hidden"
        onClick={onOpenMobile}
      >
        <Search className="h-4 w-4" aria-hidden />
        <span>통합검색</span>
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex min-h-screen flex-col">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <SearchInput
                inputRef={inputRef}
                query={query}
                onChange={onMobileInputChange}
                onFocus={() => undefined}
                onKeyDown={onKeyDown}
              />
              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border hover:bg-muted"
                aria-label="검색 닫기"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <SearchResultsPanel
                canSearch={normalizedQuery.length >= 2}
                error={searchQuery.error}
                groups={groups}
                isFetching={searchQuery.isFetching}
                totalCount={totalCount}
                onClose={() => setMobileOpen(false)}
                onSelect={onSelect}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type SearchInputProps = {
  readonly inputRef: React.RefObject<HTMLInputElement | null>;
  readonly query: string;
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onFocus: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

function SearchInput({
  inputRef,
  query,
  onChange,
  onFocus,
  onKeyDown,
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        placeholder="회사, 담당자, 제품, 딜, 일정, 회의록 검색"
        value={query}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

type SearchResultsPanelProps = {
  readonly canSearch: boolean;
  readonly error: unknown;
  readonly groups: readonly SearchGroup[];
  readonly isFetching: boolean;
  readonly totalCount: number;
  readonly onClose: () => void;
  readonly onSelect: (group: SearchGroup, item: SearchItem) => void;
};

function SearchResultsPanel({
  canSearch,
  error,
  groups,
  isFetching,
  totalCount,
  onClose,
  onSelect,
}: SearchResultsPanelProps) {
  if (!canSearch) {
    return (
      <PanelShell onClose={onClose}>
        <EmptyPanel
        title="검색어를 입력해 주세요"
        description="두 글자 이상 입력하면 주요 데이터에서 검색해요."
        />
      </PanelShell>
    );
  }

  if (error) {
    return (
      <PanelShell onClose={onClose}>
        <EmptyPanel
          title="검색 실패"
          description={getApiErrorMessage(error)}
          tone="error"
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell isFetching={isFetching} totalCount={totalCount} onClose={onClose}>
      {isFetching && groups.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>검색하고 있어요.</span>
        </div>
      ) : totalCount === 0 ? (
        <EmptyPanel
              title="검색어를 바꾸면 결과를 찾을 수 있어요"
          description="다른 키워드로 다시 검색해 보세요."
        />
      ) : (
        <div className="grid gap-3">
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <SearchGroupSection
                key={group.type}
                group={group}
                onSelect={onSelect}
              />
            ))}
        </div>
      )}
    </PanelShell>
  );
}

type PanelShellProps = {
  readonly children: React.ReactNode;
  readonly isFetching?: boolean;
  readonly totalCount?: number;
  readonly onClose: () => void;
};

function PanelShell({
  children,
  isFetching = false,
  totalCount,
  onClose,
}: PanelShellProps) {
  return (
    <section className="grid max-h-[min(680px,calc(100vh-96px))] gap-3 overflow-y-auto p-3">
      <header className="flex items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Search className="h-4 w-4" aria-hidden />
          )}
          <span>
            {totalCount === undefined
              ? "통합검색"
              : `검색 결과 ${totalCount.toLocaleString()}개`}
          </span>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted"
          aria-label="검색 결과 닫기"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </header>
      {children}
    </section>
  );
}

type SearchGroupSectionProps = {
  readonly group: SearchGroup;
  readonly onSelect: (group: SearchGroup, item: SearchItem) => void;
};

function SearchGroupSection({ group, onSelect }: SearchGroupSectionProps) {
  const meta = targetMeta[group.type];
  const Icon = meta.icon;

  return (
    <section className="grid gap-1">
      <div className="flex items-center gap-2 px-1 py-1 text-xs font-semibold text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        <span>{meta.label}</span>
      </div>
      <div className="grid gap-1">
        {group.items.map((item) => (
          <button
            key={`${group.type}:${item.targetId}`}
            type="button"
            className="grid min-h-14 gap-1 rounded-md px-3 py-2 text-left hover:bg-muted"
            onClick={() => onSelect(group, item)}
          >
            <span className="truncate text-sm font-semibold">{item.title}</span>
            {item.subtitle ? (
              <span className="truncate text-xs text-muted-foreground">
                {item.subtitle}
              </span>
            ) : (
              <span className="truncate text-xs text-muted-foreground">
                {item.targetId}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function getFallbackTargetPath(type: SearchTargetType, item: SearchItem) {
  switch (type) {
    case "COMPANY":
      return `/companies/${item.targetId}`;
    case "CONTACT":
      return `/contacts/${item.targetId}`;
    case "PRODUCT":
      return `/products/${item.targetId}`;
    case "DEAL":
      return `/deals/${item.targetId}`;
    case "SCHEDULE":
      return `/schedules/${item.targetId}`;
    case "MEETING_NOTE":
      return `/meeting-notes/${item.targetId}`;
  }
}

type EmptyPanelProps = {
  readonly title: string;
  readonly description: string;
  readonly tone?: "default" | "error";
};

function EmptyPanel({ title, description, tone = "default" }: EmptyPanelProps) {
  return (
    <div
      className={[
        "grid min-h-40 place-items-center rounded-lg border border-dashed px-4 text-center",
        tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "",
      ].join(" ")}
    >
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
