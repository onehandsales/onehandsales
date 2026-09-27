import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/app-shell";

// 기능 : Workspace 관리 항목의 공통 목록 화면 UX를 렌더링합니다.
export function WorkspaceObjectListPage() {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { objectDefinitionId } = useParams<{
    readonly objectDefinitionId?: string;
  }>();
  const { selectedSidebarCrmObject, sidebarCrmObjects } =
    useOutletContext<AppShellOutletContext>();
  const object =
    selectedSidebarCrmObject ??
    sidebarCrmObjects.find((item) => item.id === objectDefinitionId) ??
    null;
  const objectLabel = object?.singularName ?? "관리 항목";
  const searchLabel = `${objectLabel} 검색`;

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <section
      className="flex min-h-[calc(100dvh-var(--topbar-height))] flex-col bg-white"
      data-testid="workspace-object-list-page"
    >
      <div className="flex h-11 shrink-0 items-center gap-2 bg-white px-5">
        {isSearchOpen ? (
          <label className="relative flex h-8 w-full max-w-[360px] items-center">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-2 h-5 w-5 text-[#9CA3AF]"
              strokeWidth={2}
            />
            <input
              aria-label={searchLabel}
              className="h-8 w-full rounded-md bg-[#F3F2EF] pl-9 pr-2 text-[14px] font-medium text-[#111827] outline-none transition placeholder:text-[#9CA3AF] hover:bg-[#EDEBE6] focus:bg-[#EDEBE6]"
              placeholder="검색할 내용을 입력해주세요."
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onBlur={() => {
                if (searchQuery.trim().length === 0) {
                  setSearchOpen(false);
                }
              }}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchQuery("");
                  setSearchOpen(false);
                }
              }}
            />
          </label>
        ) : (
          <button
            aria-label={searchLabel}
            className="group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
            type="button"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" strokeWidth={2} />
            <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
              검색창 열기
            </span>
          </button>
        )}
        <button
          aria-label="필터"
          className="group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
          type="button"
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
            필터 열기
          </span>
        </button>
        <button
          aria-label={`새 ${objectLabel}`}
          className="group/object-toolbar-tooltip relative ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#4880EE] text-white transition hover:bg-[#3B6FDA] active:bg-[#315FC0]"
          type="button"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          <span className="pointer-events-none absolute right-[calc(100%+6px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
            생성하기
          </span>
        </button>
      </div>
      <div className="min-h-0 flex-1 bg-white" />
    </section>
  );
}
