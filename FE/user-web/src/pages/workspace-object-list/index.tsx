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
import { useAuthSession } from "@/features/auth";
import {
  type WorkspaceObjectAttributeDefinitionListItem,
  type WorkspaceObjectRecordAttributeValueListItem,
  type WorkspaceObjectRecordDefinitionListItem,
  useWorkspaceObjectAttributeDefinitionsQuery,
  useWorkspaceObjectRecordDefinitionsQuery,
} from "@/features/crm-object";

const OBJECT_LIST_SELECT_COLUMN_WIDTH_PX = 44;
const OBJECT_LIST_ADD_ATTRIBUTE_COLUMN_WIDTH_PX = 44;
const OBJECT_LIST_DATA_COLUMN_TEMPLATES = [
  "minmax(240px,1.45fr)",
  "140px",
  "156px",
  "176px",
  "132px",
  "minmax(240px,1fr)",
] as const;

type RenderedObjectListAttributeColumn =
  Pick<WorkspaceObjectAttributeDefinitionListItem, "id" | "title"> & {
    readonly isLoadingPlaceholder: boolean;
  };

// 기능 : AttributeDefinition 컬럼 개수에 맞는 Object 목록 grid template을 생성합니다.
function buildObjectListTableGridTemplate(columnCount: number) {
  const dataColumns = Array.from({ length: columnCount }, (_, index) => {
    return OBJECT_LIST_DATA_COLUMN_TEMPLATES[index] ?? "minmax(160px,1fr)";
  });

  const fixedColumns = `${OBJECT_LIST_SELECT_COLUMN_WIDTH_PX}px`;
  const addAttributeColumn = `${OBJECT_LIST_ADD_ATTRIBUTE_COLUMN_WIDTH_PX}px`;

  if (dataColumns.length === 0) {
    return `${fixedColumns} ${addAttributeColumn}`;
  }

  return `${fixedColumns} ${dataColumns.join(" ")} ${addAttributeColumn}`;
}

// 기능 : API 로딩 중에도 header row 높이와 column 구조를 유지할 임시 컬럼을 생성합니다.
function createLoadingAttributeColumn(): RenderedObjectListAttributeColumn {
  return {
    id: "attribute-definition-loading",
    title: "",
    isLoadingPlaceholder: true,
  };
}

// 기능 : AttributeDefinition API 응답을 header row 렌더링용 컬럼 값으로 변환합니다.
function toRenderedAttributeColumns(
  attributeDefinitions: readonly WorkspaceObjectAttributeDefinitionListItem[],
  isLoading: boolean,
): readonly RenderedObjectListAttributeColumn[] {
  if (attributeDefinitions.length > 0) {
    return attributeDefinitions.map((attributeDefinition) => ({
      id: attributeDefinition.id,
      title: attributeDefinition.title,
      isLoadingPlaceholder: false,
    }));
  }

  if (isLoading) {
    return [createLoadingAttributeColumn()];
  }

  return [];
}

type RecordAttributeBooleanLabels = {
  readonly falseLabel: string;
  readonly trueLabel: string;
};

// 기능 : RecordAttributeValue 응답에서 화면에 표시할 문자열을 계산합니다.
function getRecordAttributeValueDisplayText(
  value: WorkspaceObjectRecordAttributeValueListItem | null | undefined,
  booleanLabels: RecordAttributeBooleanLabels,
) {
  if (!value) {
    return "";
  }

  if (value.textValue) {
    return value.textValue;
  }

  if (value.numberValue) {
    return value.numberValue;
  }

  if (value.booleanValue !== null) {
    return value.booleanValue ? booleanLabels.trueLabel : booleanLabels.falseLabel;
  }

  if (value.dateValue) {
    return value.dateValue;
  }

  if (value.timestampValue) {
    return value.timestampValue;
  }

  if (value.jsonValue !== null) {
    return typeof value.jsonValue === "string"
      ? value.jsonValue
      : JSON.stringify(value.jsonValue);
  }

  return (
    value.selectOptionId ??
    value.statusOptionId ??
    value.targetRecordDefinitionId ??
    value.targetObjectDefinitionId ??
    value.targetActorId ??
    ""
  );
}

// 기능 : RecordDefinition row의 attribute 값을 attributeDefinitionId 기준 Map으로 변환합니다.
function getRecordAttributeValueMap(
  row: WorkspaceObjectRecordDefinitionListItem,
) {
  return new Map(
    row.recordAttributeValues.map((value) => [
      value.attributeDefinitionId,
      value,
    ]),
  );
}

// 기능 : RecordDefinition row에서 선택 checkbox 접근성 이름으로 사용할 대표 값을 찾습니다.
function getRecordRowLabel(
  row: WorkspaceObjectRecordDefinitionListItem,
  attributeColumns: readonly RenderedObjectListAttributeColumn[],
  booleanLabels: RecordAttributeBooleanLabels,
) {
  const valuesByAttributeId = getRecordAttributeValueMap(row);

  for (const column of attributeColumns) {
    const displayText = getRecordAttributeValueDisplayText(
      valuesByAttributeId.get(column.id),
      booleanLabels,
    ).trim();

    if (displayText.length > 0) {
      return displayText;
    }
  }

  return row.id;
}

// 기능 : RecordDefinition row가 현재 검색어와 일치하는지 확인합니다.
function doesRecordRowMatchSearch(
  row: WorkspaceObjectRecordDefinitionListItem,
  searchQuery: string,
  booleanLabels: RecordAttributeBooleanLabels,
) {
  if (searchQuery.length === 0) {
    return true;
  }

  return [
    row.createdAt,
    row.updatedAt,
    ...row.recordAttributeValues.map((value) =>
      getRecordAttributeValueDisplayText(value, booleanLabels),
    ),
  ].some((value) => value.toLowerCase().includes(searchQuery));
}

// 기능 : Workspace 관리 항목의 공통 목록 화면 UX를 렌더링합니다.
export function WorkspaceObjectListPage() {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMoreActionsOpen, setMoreActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const moreActionsRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { t, formatDate, formatDateTime } = useAppI18n();
  const { user } = useAuthSession();
  const { objectDefinitionId, workspaceId } = useParams<{
    readonly objectDefinitionId?: string;
    readonly workspaceId?: string;
  }>();
  const { selectedSidebarCrmObject, sidebarCrmObjects } =
    useOutletContext<AppShellOutletContext>();

  // 1. 현재 관리 항목의 header AttributeDefinition 목록을 조회한다.
  const attributeDefinitionsQuery = useWorkspaceObjectAttributeDefinitionsQuery({
    userId: user?.id ?? null,
    workspaceId: workspaceId ?? null,
    objectDefinitionId: objectDefinitionId ?? null,
  });

  // 2. 현재 관리 항목의 body row RecordDefinition 목록을 조회한다.
  const recordDefinitionsQuery = useWorkspaceObjectRecordDefinitionsQuery({
    userId: user?.id ?? null,
    workspaceId: workspaceId ?? null,
    objectDefinitionId: objectDefinitionId ?? null,
  });
  const object =
    selectedSidebarCrmObject ??
    sidebarCrmObjects.find((item) => item.id === objectDefinitionId) ??
    null;
  const objectLabel = object?.singularName ?? t("objectList.fallbackObjectLabel");
  const renderedAttributeColumns = useMemo(
    () =>
      toRenderedAttributeColumns(
        attributeDefinitionsQuery.data ?? [],
        attributeDefinitionsQuery.isLoading ||
          (attributeDefinitionsQuery.isFetching &&
            !attributeDefinitionsQuery.data),
      ),
    [
      attributeDefinitionsQuery.data,
      attributeDefinitionsQuery.isFetching,
      attributeDefinitionsQuery.isLoading,
    ],
  );
  const tableGridTemplateColumns = useMemo(
    () => buildObjectListTableGridTemplate(renderedAttributeColumns.length),
    [renderedAttributeColumns.length],
  );
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchLabel = t("common.searchName", { values: { name: objectLabel } });
  const booleanLabels = useMemo(
    () => ({
      falseLabel: t("common.no"),
      trueLabel: t("common.yes"),
    }),
    [t],
  );

  // 3. cursor pagination으로 받은 RecordDefinition page들을 화면 row 목록으로 합친다.
  const recordRows = useMemo(
    () => recordDefinitionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [recordDefinitionsQuery.data?.pages],
  );

  // 4. 현재 검색어와 일치하는 RecordDefinition row만 화면에 남긴다.
  const visibleRows = useMemo(() => {
    return recordRows.filter((row) =>
      doesRecordRowMatchSearch(row, normalizedSearchQuery, booleanLabels),
    );
  }, [booleanLabels, normalizedSearchQuery, recordRows]);

  // 5. 초기 로딩과 background refetch를 분리해 빈 화면 깜빡임을 막는다.
  const isRecordDefinitionsLoading =
    recordDefinitionsQuery.isLoading ||
    (recordDefinitionsQuery.isFetching && !recordDefinitionsQuery.data);

  // 기능 : 실패한 RecordDefinition 목록 조회를 다시 요청합니다.
  function handleRetryLoadRecords() {
    // 1. 현재 query key 기준으로 RecordDefinition 목록을 다시 가져온다.
    void recordDefinitionsQuery.refetch();
  }

  // 기능 : RecordDefinition 목록의 다음 page를 이어서 불러옵니다.
  function handleLoadMoreRecords() {
    // 1. Backend가 내려준 cursor를 사용해 다음 RecordDefinition page를 요청한다.
    void recordDefinitionsQuery.fetchNextPage();
  }

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
              className="sticky top-0 z-10 grid h-9 items-stretch border-b border-[#EEEDEA] bg-white text-[14px] font-medium text-[#111827]"
              role="row"
              style={{ gridTemplateColumns: tableGridTemplateColumns }}
            >
              <div
                className="flex h-full items-center justify-center border-r border-white"
                role="columnheader"
              >
                <input
                  aria-label={t("objectList.selectAllRowsLabel")}
                  className="h-4 w-4 rounded border-[#D6D3CD] accent-[#4880EE]"
                  type="checkbox"
                />
              </div>
              {renderedAttributeColumns.map((column) => (
                <div
                  className="flex h-full min-w-0 items-center border-r border-white px-3"
                  key={column.id}
                  role="columnheader"
                >
                  {column.isLoadingPlaceholder ? (
                    <span
                      aria-hidden="true"
                      className="h-3 w-20 rounded bg-[#F3F2EF]"
                    />
                  ) : (
                    <span className="min-w-0 truncate">{column.title}</span>
                  )}
                </div>
              ))}
              <div
                className="flex h-full items-center justify-center"
                role="columnheader"
              >
                <button
                  aria-label={t("objectList.addAttributeDefinitionTooltip")}
                  className="group/object-add-attribute-tooltip relative inline-flex h-7 w-7 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
                  type="button"
                >
                  <Plus className="h-5 w-5" strokeWidth={2} />
                  <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-add-attribute-tooltip:opacity-100">
                    {t("objectList.addAttributeDefinitionTooltip")}
                  </span>
                </button>
              </div>
            </div>
            <div role="rowgroup">
              {visibleRows.map((row) => {
                const valuesByAttributeId = getRecordAttributeValueMap(row);
                const rowLabel = getRecordRowLabel(
                  row,
                  renderedAttributeColumns,
                  booleanLabels,
                );

                return (
                  <div
                    className="grid h-10 items-stretch border-b border-[#F1F0EC] bg-white text-[14px] text-[#374151] transition hover:bg-[#FAFAF8]"
                    key={row.id}
                    role="row"
                    style={{ gridTemplateColumns: tableGridTemplateColumns }}
                  >
                    <div
                      className="flex h-full items-center justify-center border-r border-[#F1F0EC]"
                      role="cell"
                    >
                      <input
                        aria-label={t("objectList.selectRowLabel", {
                          values: { name: rowLabel },
                        })}
                        className="h-4 w-4 rounded border-[#D6D3CD] accent-[#4880EE]"
                        type="checkbox"
                      />
                    </div>
                    {renderedAttributeColumns.map((column, index) => {
                      const cellValue = valuesByAttributeId.get(column.id);
                      const displayText = getRecordAttributeValueDisplayText(
                        cellValue,
                        booleanLabels,
                      );

                      return (
                        <div
                          className="flex h-full min-w-0 items-center border-r border-[#F1F0EC] px-3"
                          key={column.id}
                          role="cell"
                        >
                          <span
                            className={`min-w-0 truncate ${
                              index === 0
                                ? "font-medium text-[#111827]"
                                : "text-[#6B7280]"
                            }`}
                          >
                            {cellValue?.timestampValue
                              ? formatDateTime(cellValue.timestampValue)
                              : cellValue?.dateValue
                                ? formatDate(cellValue.dateValue)
                                : displayText}
                          </span>
                        </div>
                      );
                    })}
                    <div
                      aria-hidden="true"
                      className="flex h-full items-center justify-center"
                      role="cell"
                    />
                  </div>
                );
              })}
              {isRecordDefinitionsLoading ? (
                <div className="flex h-20 items-center px-4 text-[14px] font-medium text-[#6B7280]">
                  {t("objectList.loadingRecords")}
                </div>
              ) : null}
              {!isRecordDefinitionsLoading && recordDefinitionsQuery.isError ? (
                <div className="flex h-20 items-center gap-3 px-4 text-[14px] font-medium text-[#6B7280]">
                  <span>{t("objectList.loadRecordsFailed")}</span>
                  <button
                    className="h-8 rounded-md bg-[#F3F2EF] px-2.5 text-[14px] font-medium text-[#374151] transition hover:bg-[#EDEBE6] active:bg-[#D3D1CB]"
                    type="button"
                    onClick={handleRetryLoadRecords}
                  >
                    {t("common.retry")}
                  </button>
                </div>
              ) : null}
              {!isRecordDefinitionsLoading &&
              !recordDefinitionsQuery.isError &&
              visibleRows.length === 0 ? (
                <div className="flex h-20 items-center px-4 text-[14px] font-medium text-[#6B7280]">
                  {normalizedSearchQuery.length > 0
                    ? t("common.searchEmpty")
                    : t("objectList.emptyRecords")}
                </div>
              ) : null}
              {!isRecordDefinitionsLoading &&
              !recordDefinitionsQuery.isError &&
              recordDefinitionsQuery.hasNextPage ? (
                <div
                  className="flex h-12 items-center justify-center bg-white"
                  role="row"
                >
                  <div
                    className="flex h-full items-center justify-center"
                    role="cell"
                  >
                    <button
                      className="h-8 rounded-md bg-[#F3F2EF] px-2.5 text-[14px] font-medium text-[#374151] transition hover:bg-[#EDEBE6] active:bg-[#D3D1CB] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={recordDefinitionsQuery.isFetchingNextPage}
                      type="button"
                      onClick={handleLoadMoreRecords}
                    >
                      {recordDefinitionsQuery.isFetchingNextPage
                        ? t("common.loading")
                        : t("common.loadMore")}
                    </button>
                  </div>
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
