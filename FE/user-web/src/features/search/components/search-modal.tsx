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
const SEARCH_MODAL_TRANSITION_MS = 300;
const SEARCH_MODAL_FOCUS_DELAY_MS = 180;
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
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
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
      const focusTimerId = window.setTimeout(
        () => inputRef.current?.focus(),
        SEARCH_MODAL_FOCUS_DELAY_MS
      );

      return () => window.clearTimeout(focusTimerId);
    }
  }, [open]);

  // 기능 : 검색 모달을 닫을 때 exit transition이 끝날 때까지 DOM 렌더를 유지합니다.
  useEffect(() => {
    let openTimerId: number | null = null;
    let closeTimerId: number | null = null;

    if (open) {
      setShouldRender(true);
      setIsVisible(false);
      openTimerId = window.setTimeout(() => setIsVisible(true), 20);
    } else {
      setIsVisible(false);
      closeTimerId = window.setTimeout(
        () => setShouldRender(false),
        SEARCH_MODAL_TRANSITION_MS
      );
    }

    return () => {
      if (openTimerId !== null) {
        window.clearTimeout(openTimerId);
      }

      if (closeTimerId !== null) {
        window.clearTimeout(closeTimerId);
      }
    };
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

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onMouseDown={onBackdropMouseDown}
    >
      {/* 배경 오버레이 */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 모달 패널 */}
      <div
        className={`relative z-10 mx-4 flex w-full max-w-[560px] origin-top flex-col overflow-hidden rounded-xl border border-[#E2E5EC] bg-white shadow-2xl transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-[0.96] opacity-0"
        }`}
      >
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 border-b border-[#F0F1F3] px-4 py-3.5">
          <Search className="h-5 w-5 shrink-0 text-[#9CA3AF]" strokeWidth={2} />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            placeholder="찾고 싶은 것을 검색하세요."
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
          ) : null}
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
        <p className="text-[13px] text-[#9CA3AF]">
          필요한 기록을 빠르게 찾을 수 있어요.
        </p>
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
      <div className="flex items-center justify-center px-4 py-10">
        <Loader2 className="h-8 w-8 animate-spin text-[#9CA3AF]" />
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
