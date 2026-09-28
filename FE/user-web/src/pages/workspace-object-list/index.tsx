import {
  ArrowUpDown,
  Download,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { useAppI18n } from "@/features/app-i18n";

const OBJECT_LIST_TABLE_GRID_CLASS_NAME =
  "[grid-template-columns:44px_minmax(240px,1.45fr)_140px_156px_176px_132px_minmax(240px,1fr)]";

type MockObjectListRow = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly statusClassName: string;
  readonly owner: string;
  readonly updatedAt: string;
  readonly createdAt: string;
  readonly memo: string;
};

const MOCK_OBJECT_LIST_RECORD_NAMES = [
  "김민수",
  "라온상사",
  "프라임 오피스",
  "정기 계약",
  "박서연",
  "에이원 솔루션",
  "한빛테크",
  "윤도현",
  "더블유파트너스",
  "노바리빙",
  "스타트랩",
  "세종물류",
  "이서윤",
  "오션브릿지",
  "마루디자인",
  "강하늘",
  "브라이트웍스",
  "클라우드나인",
  "정우진",
  "리버스톤",
  "서린컴퍼니",
  "로컬푸드랩",
  "이지훈",
  "더케이상사",
  "모먼트스튜디오",
  "태성건설",
  "김하린",
  "펄스마켓",
  "비전오피스",
  "그린에너지랩",
  "오렌지팩토리",
  "박지우",
  "유니온메디",
  "다온교육",
  "코어플랜",
  "새봄렌탈",
  "마켓온",
  "블루핀",
  "케이브릿지",
  "스튜디오오름",
  "더나은세무",
  "리드컴퍼니",
  "오픈웨어",
  "라이트하우스",
  "포인트랩",
  "앤드파트너스",
  "아워스페이스",
  "넥스트샵",
  "정다은",
  "플랜비솔루션",
] as const;

const MOCK_OBJECT_LIST_STATUS_OPTIONS = [
  {
    label: "진행 중",
    statusClassName: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  {
    label: "검토 중",
    statusClassName: "bg-[#FEF3C7] text-[#92400E]",
  },
  {
    label: "대기",
    statusClassName: "bg-[#F3F4F6] text-[#4B5563]",
  },
  {
    label: "완료",
    statusClassName: "bg-[#DCFCE7] text-[#166534]",
  },
] as const;

const MOCK_OBJECT_LIST_OWNERS = [
  "이재희",
  "송재근",
  "박서연",
  "김도윤",
  "정유진",
  "최민재",
] as const;

const MOCK_OBJECT_LIST_MEMOS = [
  "견적 범위 확인 후 회신 예정",
  "의사결정자 정보 보강 필요",
  "초기 상담 일정을 조율 중",
  "계약서 전달 완료",
  "다음 주 재연락",
  "제품 소개 자료 전달 필요",
  "요청 사항을 내부 검토 중",
  "추가 자료 수신 대기",
] as const;

// 기능 : mock 목록에서 index에 맞는 반복 값을 안전하게 가져옵니다.
function getRepeatingMockValue<T>(items: readonly T[], index: number): T {
  const item = items[index % items.length];

  if (item === undefined) {
    throw new Error("Missing mock list value");
  }

  return item;
}

// 기능 : 관리 항목 목록 UX 확인용 mock row를 생성합니다.
function createMockObjectListRow(
  name: string,
  index: number,
): MockObjectListRow {
  const status = getRepeatingMockValue(MOCK_OBJECT_LIST_STATUS_OPTIONS, index);
  const updatedDay = 27 - (index % 24);
  const createdDay = Math.max(1, updatedDay - 3);

  return {
    id: `mock-${String(index + 1).padStart(3, "0")}`,
    name,
    status: status.label,
    statusClassName: status.statusClassName,
    owner: getRepeatingMockValue(MOCK_OBJECT_LIST_OWNERS, index),
    updatedAt:
      index === 0 ? "오늘 14:20" : index === 1 ? "어제 18:05" : `9월 ${updatedDay}일`,
    createdAt: `9월 ${createdDay}일`,
    memo: getRepeatingMockValue(MOCK_OBJECT_LIST_MEMOS, index),
  };
}

const MOCK_OBJECT_LIST_ROWS = MOCK_OBJECT_LIST_RECORD_NAMES.map(
  createMockObjectListRow,
);

// 기능 : Workspace 관리 항목의 공통 목록 화면 UX를 렌더링합니다.
export function WorkspaceObjectListPage() {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMoreActionsOpen, setMoreActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const moreActionsRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useAppI18n();
  const { objectDefinitionId } = useParams<{
    readonly objectDefinitionId?: string;
  }>();
  const { selectedSidebarCrmObject, sidebarCrmObjects } =
    useOutletContext<AppShellOutletContext>();
  const object =
    selectedSidebarCrmObject ??
    sidebarCrmObjects.find((item) => item.id === objectDefinitionId) ??
    null;
  const objectLabel = object?.singularName ?? t("objectList.fallbackObjectLabel");
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchLabel = t("common.searchName", { values: { name: objectLabel } });
  const visibleRows = useMemo(() => {
    if (normalizedSearchQuery.length === 0) {
      return MOCK_OBJECT_LIST_ROWS;
    }

    return MOCK_OBJECT_LIST_ROWS.filter((row) =>
      [
        row.name,
        row.status,
        row.owner,
        row.updatedAt,
        row.createdAt,
        row.memo,
      ].some((value) => value.toLowerCase().includes(normalizedSearchQuery)),
    );
  }, [normalizedSearchQuery]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  // 기능 : 더보기 메뉴 바깥 입력과 Escape 키로 메뉴를 닫습니다.
  useEffect(() => {
    if (!isMoreActionsOpen) {
      return;
    }

    // 기능 : 더보기 메뉴 바깥 pointer 입력을 처리합니다.
    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        moreActionsRef.current?.contains(target)
      ) {
        return;
      }

      setMoreActionsOpen(false);
    };

    // 기능 : 더보기 메뉴 닫기 키 입력을 처리합니다.
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreActionsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isMoreActionsOpen]);

  return (
    <section
      className="flex h-[calc(100dvh-var(--topbar-height))] min-h-0 flex-col overflow-hidden bg-white"
      data-testid="workspace-object-list-page"
    >
      <div className="flex h-11 shrink-0 items-center gap-2 bg-white px-3">
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
              placeholder={t("objectList.searchPlaceholder")}
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
            <span className="pointer-events-none absolute left-0 top-[calc(100%+6px)] z-50 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
              {t("objectList.openSearchTooltip")}
            </span>
          </button>
        )}
        <button
          aria-label={t("common.filter")}
          className="group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
          type="button"
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
            {t("objectList.openFilterTooltip")}
          </span>
        </button>
        <button
          aria-label={t("objectList.viewSortTooltip")}
          className="group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
          type="button"
        >
          <ArrowUpDown className="h-5 w-5" strokeWidth={2} />
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
            {t("objectList.viewSortTooltip")}
          </span>
        </button>
        <button
          aria-label={`새 ${objectLabel}`}
          className="group/object-toolbar-tooltip relative ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#4880EE] text-white transition hover:bg-[#3B6FDA] active:bg-[#315FC0]"
          type="button"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
            {t("objectList.createTooltip")}
          </span>
        </button>
        <div className="relative" ref={moreActionsRef}>
          <button
            aria-expanded={isMoreActionsOpen}
            aria-haspopup="menu"
            aria-label={t("objectList.moreActionsTooltip")}
            className={`group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition ${
              isMoreActionsOpen
                ? "bg-[#E4E2DC] text-[#6B7280] active:bg-[#D3D1CB]"
                : "text-[#9CA3AF] hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
            }`}
            type="button"
            onClick={() => setMoreActionsOpen((open) => !open)}
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
            {!isMoreActionsOpen ? (
              <span className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-50 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
                {t("objectList.moreActionsTooltip")}
              </span>
            ) : null}
          </button>
          <div
            aria-hidden={!isMoreActionsOpen}
            className={`absolute right-0 top-[calc(100%+6px)] z-50 w-40 origin-top-right transition-all duration-150 ease-out ${
              isMoreActionsOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
            }`}
          >
            <div
              className="overflow-hidden rounded-xl bg-white p-2 text-[#111827] shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
              role="menu"
            >
              <div className="grid gap-px">
                <button
                  className="group flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
                  role="menuitem"
                  tabIndex={isMoreActionsOpen ? undefined : -1}
                  type="button"
                  onClick={() => setMoreActionsOpen(false)}
                >
                  <Download
                    className="h-5 w-5 shrink-0 text-[#9CA3AF] group-hover:text-[#6B7280]"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {t("objectList.exportDataAction")}
                  </span>
                </button>
                <button
                  className="group flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
                  role="menuitem"
                  tabIndex={isMoreActionsOpen ? undefined : -1}
                  type="button"
                  onClick={() => setMoreActionsOpen(false)}
                >
                  <Upload
                    className="h-5 w-5 shrink-0 text-[#9CA3AF] group-hover:text-[#6B7280]"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {t("objectList.importDataAction")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        <div className="notion-scrollbar h-full overflow-auto">
          <div
            aria-label={objectLabel}
            className="min-w-[1080px]"
            role="table"
          >
            <div
              className={`${OBJECT_LIST_TABLE_GRID_CLASS_NAME} grid h-9 items-stretch border-b border-[#EEEDEA] bg-[#E4E2DC] text-[14px] font-medium text-[#111827]`}
              role="row"
            >
              <div
                className="flex h-full items-center justify-center border-r border-[#E4E2DC]"
                role="columnheader"
              >
                <input
                  aria-label={t("objectList.selectAllRowsLabel")}
                  className="h-4 w-4 rounded border-[#D6D3CD] accent-[#4880EE]"
                  type="checkbox"
                />
              </div>
              <div
                className="flex h-full min-w-0 items-center border-r border-[#E4E2DC] px-3"
                role="columnheader"
              >
                <span className="min-w-0 truncate">{objectLabel}</span>
              </div>
              <div
                className="flex h-full min-w-0 items-center border-r border-[#E4E2DC] px-3"
                role="columnheader"
              >
                <span className="min-w-0 truncate">
                  {t("objectList.statusColumn")}
                </span>
              </div>
              <div
                className="flex h-full min-w-0 items-center border-r border-[#E4E2DC] px-3"
                role="columnheader"
              >
                <span className="min-w-0 truncate">
                  {t("objectList.ownerColumn")}
                </span>
              </div>
              <div
                className="flex h-full min-w-0 items-center border-r border-[#E4E2DC] px-3"
                role="columnheader"
              >
                <span className="min-w-0 truncate">
                  {t("objectList.updatedColumn")}
                </span>
              </div>
              <div
                className="flex h-full min-w-0 items-center border-r border-[#E4E2DC] px-3"
                role="columnheader"
              >
                <span className="min-w-0 truncate">
                  {t("objectList.createdAtColumn")}
                </span>
              </div>
              <div
                className="flex h-full min-w-0 items-center px-3"
                role="columnheader"
              >
                <span className="min-w-0 truncate">
                  {t("objectList.memoColumn")}
                </span>
              </div>
            </div>
            <div role="rowgroup">
              {visibleRows.map((row) => (
                <div
                  className={`${OBJECT_LIST_TABLE_GRID_CLASS_NAME} grid h-10 items-stretch border-b border-[#F1F0EC] bg-white text-[14px] text-[#374151] transition hover:bg-[#FAFAF8]`}
                  key={row.id}
                  role="row"
                >
                  <div
                    className="flex h-full items-center justify-center border-r border-[#F1F0EC]"
                    role="cell"
                  >
                    <input
                      aria-label={t("objectList.selectRowLabel", {
                        values: { name: row.name },
                      })}
                      className="h-4 w-4 rounded border-[#D6D3CD] accent-[#4880EE]"
                      type="checkbox"
                    />
                  </div>
                  <div
                    className="flex h-full min-w-0 items-center border-r border-[#F1F0EC] px-3"
                    role="cell"
                  >
                    <span className="min-w-0 truncate font-medium text-[#111827]">
                      {row.name}
                    </span>
                  </div>
                  <div
                    className="flex h-full min-w-0 items-center border-r border-[#F1F0EC] px-3"
                    role="cell"
                  >
                    <span
                      className={`${row.statusClassName} inline-flex h-6 max-w-full items-center rounded-md px-2 text-[12px] font-semibold leading-none`}
                    >
                      <span className="truncate">{row.status}</span>
                    </span>
                  </div>
                  <div
                    className="flex h-full min-w-0 items-center border-r border-[#F1F0EC] px-3"
                    role="cell"
                  >
                    <span className="truncate font-medium text-[#4B5563]">
                      {row.owner}
                    </span>
                  </div>
                  <div
                    className="flex h-full min-w-0 items-center border-r border-[#F1F0EC] px-3"
                    role="cell"
                  >
                    <span className="truncate text-[#6B7280]">
                      {row.updatedAt}
                    </span>
                  </div>
                  <div
                    className="flex h-full min-w-0 items-center border-r border-[#F1F0EC] px-3"
                    role="cell"
                  >
                    <span className="truncate text-[#6B7280]">
                      {row.createdAt}
                    </span>
                  </div>
                  <div
                    className="flex h-full min-w-0 items-center px-3"
                    role="cell"
                  >
                    <span className="truncate text-[#6B7280]">{row.memo}</span>
                  </div>
                </div>
              ))}
              {visibleRows.length === 0 ? (
                <div className="flex h-20 items-center px-4 text-[14px] font-medium text-[#6B7280]">
                  {t("common.searchEmpty")}
                </div>
              ) : null}
              <div
                className="flex h-10 items-center justify-center bg-white"
                role="row"
              >
                <div
                  className="flex h-full items-center justify-center"
                  role="cell"
                >
                  <button
                    aria-label={`새 ${objectLabel}`}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#4880EE] px-2.5 text-[14px] font-medium text-white transition hover:bg-[#3B6FDA] active:bg-[#315FC0]"
                    type="button"
                  >
                    <Plus
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0"
                      strokeWidth={2}
                    />
                    <span className="truncate">{t("objectList.addDataAction")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
