import { ChevronRight, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { IconValueGlyph } from "@/components/ui/icon-value-glyph";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import type { SidebarCrmListItem } from "@/features/crm-list";
import {
  SidebarCrmObjectIcon,
  type SidebarCrmObjectListItem,
} from "@/features/crm-object";
import { toWorkspaceObjectPath } from "@/features/workspace";
import { cn } from "@/utils/cn";

type SidebarNavProps = {
  readonly className?: string;
  readonly crmLists?: readonly SidebarCrmListItem[];
  readonly crmObjects?: readonly SidebarCrmObjectListItem[];
  readonly hasCrmListsError?: boolean;
  readonly isCrmListsLoading?: boolean;
  readonly isCrmObjectsLoading?: boolean;
  readonly onCreateObjectDefinition?: () => void;
  readonly onRetryCrmLists?: () => void;
  readonly workspaceId?: string | null;
};

// 기능 : 즐겨찾기, 업무 목록, 관리 대상 순서로 사이드바를 렌더링합니다.
export function SidebarNav({
  className,
  crmLists = [],
  crmObjects = [],
  hasCrmListsError = false,
  isCrmListsLoading = false,
  isCrmObjectsLoading = false,
  onCreateObjectDefinition,
  onRetryCrmLists,
  workspaceId = null,
}: SidebarNavProps) {
  const [isFavoritesOpen, setFavoritesOpen] = useState(true);
  const [isWorkListsOpen, setWorkListsOpen] = useState(true);
  const [isManagedItemsOpen, setManagedItemsOpen] = useState(true);
  // 1. 관리 대상 로딩 중에는 추가 버튼보다 skeleton row를 먼저 유지한다.
  const shouldShowManagedItemsAddAction = !isCrmObjectsLoading;

  return (
    <nav
      aria-label="Workspace navigation"
      className={cn("flex flex-col gap-3", className)}
    >
      <SidebarSection
        addLabelKey="navigation.quickWorkGroupAdd"
        closeLabelKey="navigation.quickWorkGroupClose"
        isOpen={isFavoritesOpen}
        labelKey="navigation.quickWorkGroup"
        openLabelKey="navigation.quickWorkGroupOpen"
        onToggle={() => setFavoritesOpen((current) => !current)}
      />
      <SidebarSection
        addLabelKey="navigation.workListsGroupAdd"
        closeLabelKey="navigation.workListsGroupClose"
        isOpen={isWorkListsOpen}
        labelKey="navigation.workListsGroup"
        openLabelKey="navigation.workListsGroupOpen"
        showAddAction={!isCrmListsLoading}
        onToggle={() => setWorkListsOpen((current) => !current)}
      >
        <SidebarCrmLists
          hasError={hasCrmListsError}
          isLoading={isCrmListsLoading}
          lists={crmLists}
          onRetry={onRetryCrmLists}
        />
      </SidebarSection>
      <SidebarSection
        addLabelKey="navigation.mainGroupAdd"
        closeLabelKey="navigation.mainGroupClose"
        isOpen={isManagedItemsOpen}
        labelKey="navigation.mainGroup"
        openLabelKey="navigation.mainGroupOpen"
        onAdd={onCreateObjectDefinition}
        showAddAction={shouldShowManagedItemsAddAction}
        onToggle={() => setManagedItemsOpen((current) => !current)}
      >
        {isCrmObjectsLoading ? (
          <SidebarItemSkeletonList />
        ) : (
          <SidebarCrmObjectList objects={crmObjects} workspaceId={workspaceId} />
        )}
      </SidebarSection>
    </nav>
  );
}

type SidebarSectionProps = {
  readonly addLabelKey: AppI18nKey;
  readonly closeLabelKey: AppI18nKey;
  readonly isOpen: boolean;
  readonly labelKey: AppI18nKey;
  readonly onAdd?: () => void;
  readonly openLabelKey: AppI18nKey;
  readonly showAddAction?: boolean;
  readonly onToggle: () => void;
  readonly children?: ReactNode;
};

// 기능 : 사이드바 섹션의 접힘 상태와 추가 버튼 영역을 렌더링합니다.
function SidebarSection({
  addLabelKey,
  children,
  closeLabelKey,
  isOpen,
  labelKey,
  onAdd,
  openLabelKey,
  showAddAction = true,
  onToggle,
}: SidebarSectionProps) {
  const { t } = useAppI18n();
  // 1. 로딩 중인 섹션에서는 추가 버튼이 먼저 노출되지 않도록 렌더링 여부를 고정한다.
  const shouldShowAddAction = showAddAction;
  const toggleLabelKey = isOpen ? closeLabelKey : openLabelKey;

  return (
    <div>
      <div className="group/sidebar-section relative mb-1 h-6 w-full rounded-md transition-colors hover:bg-[#E4E2DC]">
        <button
          aria-label={t(toggleLabelKey)}
          aria-expanded={isOpen}
          className="flex h-6 w-full min-w-0 items-center gap-1 rounded-md px-2 pr-8 text-left text-[12px] font-semibold tracking-[0.02em] text-[#9CA3AF] transition active:bg-[#D3D1CB] group-hover/sidebar-section:text-[#6B7280]"
          onClick={onToggle}
          type="button"
        >
          <span className="min-w-0 truncate">{t(labelKey)}</span>
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 transition-[transform,opacity]",
              isOpen
                ? "rotate-90 opacity-100"
                : "rotate-0 opacity-0 group-hover/sidebar-section:opacity-100"
            )}
            strokeWidth={2}
          />
        </button>
        {shouldShowAddAction ? (
          <button
            aria-label={t(addLabelKey)}
            className="pointer-events-none absolute right-1 top-1/2 z-10 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded-md text-[#9CA3AF] opacity-0 transition hover:bg-[#D3D1CB] focus:pointer-events-auto focus:opacity-100 active:bg-[#D3D1CB] group-hover/sidebar-section:pointer-events-auto group-hover/sidebar-section:text-[#6B7280] group-hover/sidebar-section:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              onAdd?.();
            }}
            type="button"
          >
            <Plus
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              strokeWidth={2}
            />
          </button>
        ) : null}
      </div>
      {isOpen ? (
        <div className="flex flex-col gap-px">
          {children}
          {shouldShowAddAction ? (
            <button
              aria-label={t(addLabelKey)}
              className="flex h-[30px] w-full items-center justify-center rounded-md px-2 text-[#4880EE] transition hover:bg-[#E4E2DC] active:bg-[#D3D1CB]"
              onClick={onAdd}
              type="button"
            >
              <Plus
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                strokeWidth={2}
              />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const SIDEBAR_ITEM_SKELETON_WIDTHS = ["w-20", "w-28", "w-24"] as const;

// 기능 : 업무 목록과 관리 대상에 공통으로 사용할 로딩 Skeleton을 렌더링합니다.
function SidebarItemSkeletonList() {
  return (
    <div aria-hidden="true" className="contents">
      {SIDEBAR_ITEM_SKELETON_WIDTHS.map((widthClassName) => (
        <SidebarItemSkeleton
          key={widthClassName}
          textWidthClassName={widthClassName}
        />
      ))}
    </div>
  );
}

// 기능 : 사이드바 데이터 행과 같은 크기의 Skeleton 한 줄을 렌더링합니다.
function SidebarItemSkeleton({
  textWidthClassName,
}: {
  readonly textWidthClassName: string;
}) {
  return (
    <div className="flex h-[30px] w-full items-center gap-2 rounded-md px-2">
      <span
        className="h-5 w-5 shrink-0 rounded-md bg-[#E4E2DC] opacity-80 animate-pulse"
      />
      <span
        className={cn(
          "h-2.5 rounded-full bg-[#E4E2DC] opacity-80 animate-pulse",
          textWidthClassName,
        )}
      />
    </div>
  );
}

// 기능 : 현재 Workspace의 업무 목록과 로딩·빈 목록·오류 상태를 표시합니다.
function SidebarCrmLists({
  hasError,
  isLoading,
  lists,
  onRetry,
}: {
  readonly hasError: boolean;
  readonly isLoading: boolean;
  readonly lists: readonly SidebarCrmListItem[];
  readonly onRetry: (() => void) | undefined;
}) {
  const { t } = useAppI18n();

  // 1. 조회 중에는 빈 목록 안내 대신 공통 Skeleton을 표시한다.
  if (isLoading) {
    return (
      <div aria-label={t("navigation.workListsLoading")} role="status">
        <SidebarItemSkeletonList />
      </div>
    );
  }

  // 2. 실패는 성공한 빈 배열과 구분하고 사용자가 재시도할 수 있게 한다.
  if (hasError) {
    return (
      <div className="px-2 py-1 text-[12px] leading-5 text-[#9CA3AF]" role="alert">
        <p>{t("navigation.workListsLoadFailed")}</p>
        <button
          className="rounded text-[#4880EE] hover:underline"
          onClick={onRetry}
          type="button"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <p className="px-2 py-1 text-[12px] leading-5 text-[#9CA3AF]">
        {t("navigation.workListsEmpty")}
      </p>
    );
  }

  // 3. 서버 정렬을 유지하고 공통 아이콘으로 업무 목록 이름을 표시한다.
  return (
    <div
      aria-label={t("navigation.workListsGroup")}
      className="flex flex-col gap-px"
      role="list"
    >
      {lists.map((list) => (
        <div
          className="flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-left text-[14px] font-medium text-[#4B5563]"
          key={list.id}
          role="listitem"
        >
          <IconValueGlyph
            className="h-5 w-5 shrink-0 text-[#9CA3AF]"
            name={list.icon}
            strokeWidth={2}
          />
          <span className="min-w-0 flex-1 truncate">{list.name}</span>
        </div>
      ))}
    </div>
  );
}

// 기능 : 현재 Workspace의 관리 대상 목록을 사이드바 섹션 안에 렌더링합니다.
function SidebarCrmObjectList({
  objects,
  workspaceId,
}: {
  readonly objects: readonly SidebarCrmObjectListItem[];
  readonly workspaceId: string | null;
}) {
  if (objects.length === 0) {
    return null;
  }

  return (
    <>
      {objects.map((object) => (
        <SidebarCrmObjectItem
          key={object.id}
          object={object}
          workspaceId={workspaceId}
        />
      ))}
    </>
  );
}

// 기능 : 사이드바 관리 대상 한 줄에 아이콘과 단수 이름을 표시합니다.
function SidebarCrmObjectItem({
  object,
  workspaceId,
}: {
  readonly object: SidebarCrmObjectListItem;
  readonly workspaceId: string | null;
}) {
  if (!workspaceId) {
    return (
      <div className="group/sidebar-object-row relative flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-left text-[14px] font-medium text-[#4B5563] transition-colors hover:bg-[#E4E2DC] hover:text-[#111827]">
        <SidebarCrmObjectIcon
          className="h-5 w-5 shrink-0 text-[#9CA3AF] group-hover/sidebar-object-row:text-[#6B7280]"
          name={object.icon}
          strokeWidth={2}
        />
        <span className="min-w-0 flex-1 truncate">{object.singularName}</span>
      </div>
    );
  }

  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "group/sidebar-object-row relative flex h-[30px] w-full items-center gap-2 rounded-md px-2 text-left text-[14px] font-medium transition-colors",
          isActive
            ? "bg-[#E4E2DC] text-[#111827] active:bg-[#D3D1CB]"
            : "text-[#4B5563] hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
        )
      }
      to={toWorkspaceObjectPath(workspaceId, object.id)}
    >
      {({ isActive }) => (
        <>
          <SidebarCrmObjectIcon
            className={cn(
              "h-5 w-5 shrink-0",
              isActive
                ? "text-[#6B7280]"
                : "text-[#9CA3AF] group-hover/sidebar-object-row:text-[#6B7280]"
            )}
            name={object.icon}
            strokeWidth={2}
          />
          <span className="min-w-0 flex-1 truncate">{object.singularName}</span>
        </>
      )}
    </NavLink>
  );
}
