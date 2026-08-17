import {
  Building2,
  CalendarDays,
  Handshake,
  Loader2,
  NotebookPen,
  Package,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  useDeferredValue,
  useEffect,
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
import { getSearchFallbackTargetPath } from "@/features/search/utils/search-target-path";
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
  MEETING_NOTE: { label: "회의록", icon: NotebookPen },
};

type SearchModalProps = {
  readonly open: boolean;
  readonly onClose: () => void;
};

// 기능 : 전체 화면 통합검색 모달을 렌더링합니다.
export function SearchModal({ open, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const deferredQuery = useDeferredValue(normalizedQuery);
  const canSearch = deferredQuery.length >= 2;
  const searchQuery = useSearchAll(
    { q: deferredQuery, limit: SEARCH_LIMIT },
    canSearch && open
  );
  const groups = searchQuery.data?.groups ?? EMPTY_SEARCH_GROUPS;
  const totalCount = useMemo(
    () => groups.reduce((total, group) => total + group.items.length, 0),
    [groups]
  );

  // 기능 : 모달이 열릴 때 검색어를 초기화하고 입력칸에 포커스합니다.
  useEffect(() => {
    if (open) {
      setQuery("");
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 기능 : Escape 키 입력 시 검색 모달을 닫습니다.
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  // 기능 : 검색 결과 선택 시 대상 상세 route로 이동하고 모달을 닫습니다.
  const onSelect = (group: SearchGroup, item: SearchItem) => {
    const targetPath =
      item.targetPath ?? getSearchFallbackTargetPath(group.type, item);

    if (targetPath) {
      navigate(targetPath);
    }
    onClose();
  };

  // 기능 : 모달 바깥 영역 클릭 시 검색 모달을 닫습니다.
  const onBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // 기능 : 검색어 입력 값을 갱신합니다.
  const onQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  // 기능 : 검색어 지우기 버튼 클릭 시 입력 값을 초기화합니다.
  const onClearQuery = () => {
    setQuery("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onMouseDown={onBackdropMouseDown}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* 모달 패널 */}
      <div className="relative z-10 flex w-full max-w-[560px] flex-col overflow-hidden rounded-xl border border-[#E2E5EC] bg-white shadow-2xl mx-4">
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 border-b border-[#F0F1F3] px-4 py-3.5">
          <Search className="h-[18px] w-[18px] shrink-0 text-[#9CA3AF]" strokeWidth={2} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            placeholder="회사, 담당자, 제품, 딜, 일정, 회의록 검색..."
            value={query}
            onChange={onQueryChange}
            onKeyDown={onKeyDown}
          />
          {query.length > 0 ? (
            <button
              type="button"
              className="shrink-0 text-[#9CA3AF] hover:text-[#374151]"
              onClick={onClearQuery}
              aria-label="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden shrink-0 rounded border border-[#E2E5EC] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#9CA3AF] sm:block">
              ESC
            </kbd>
          )}
        </div>

        {/* 결과 영역 */}
        <div className="max-h-[min(520px,calc(80vh-80px))] overflow-y-auto">
          <SearchResultsBody
            canSearch={normalizedQuery.length >= 2}
            error={searchQuery.error}
            groups={groups}
            isFetching={searchQuery.isFetching}
            totalCount={totalCount}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}

type SearchResultsBodyProps = {
  readonly canSearch: boolean;
  readonly error: unknown;
  readonly groups: readonly SearchGroup[];
  readonly isFetching: boolean;
  readonly totalCount: number;
  readonly onSelect: (group: SearchGroup, item: SearchItem) => void;
};

// 기능 : 검색 모달 안에서 검색 상태별 결과 본문을 렌더링합니다.
function SearchResultsBody({
  canSearch,
  error,
  groups,
  isFetching,
  totalCount,
  onSelect,
}: SearchResultsBodyProps) {
  if (!canSearch) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-[13px] text-[#9CA3AF]">두 글자 이상 입력하면 검색해요</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-[13px] text-red-500">{getApiErrorMessage(error)}</p>
      </div>
    );
  }

  if (isFetching && groups.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-10">
        <Loader2 className="h-4 w-4 animate-spin text-[#9CA3AF]" />
        <span className="text-[13px] text-[#9CA3AF]">검색 중...</span>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-[13px] font-medium text-[#374151]">
          검색어를 바꾸면 결과를 찾을 수 있어요
        </p>
        <p className="mt-1 text-[12px] text-[#9CA3AF]">다른 키워드로 다시 검색해 보세요</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <SearchGroupSection key={group.type} group={group} onSelect={onSelect} />
        ))}
      <div className="border-t border-[#F0F1F3] px-4 py-2.5">
        <span className="text-[11px] text-[#9CA3AF]">검색 결과 {totalCount}개</span>
      </div>
    </div>
  );
}

type SearchGroupSectionProps = {
  readonly group: SearchGroup;
  readonly onSelect: (group: SearchGroup, item: SearchItem) => void;
};

// 기능 : 검색 모달 안에서 대상 그룹별 검색 결과 목록을 렌더링합니다.
function SearchGroupSection({ group, onSelect }: SearchGroupSectionProps) {
  const meta = targetMeta[group.type];
  const Icon = meta.icon;

  return (
    <div className="px-2 py-1">
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <Icon className="h-3.5 w-3.5 text-[#4880EE]" strokeWidth={2} />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          {meta.label}
        </span>
      </div>
      <div>
        {group.items.map((item) => (
          <button
            key={`${group.type}:${item.targetId}`}
            type="button"
            className="flex w-full flex-col gap-0.5 rounded-md px-2 py-2 text-left transition hover:bg-white"
            onClick={() => onSelect(group, item)}
          >
            <span className="truncate text-[13px] font-medium text-[#111827]">
              {item.title}
            </span>
            {item.subtitle ? (
              <span className="truncate text-[11px] text-[#9CA3AF]">
                {item.subtitle}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
