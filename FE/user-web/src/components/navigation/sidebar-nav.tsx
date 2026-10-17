import { ChevronRight, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import {
  SidebarCrmObjectIcon,
  type SidebarCrmObjectListItem,
} from "@/features/crm-object";
import { toWorkspaceObjectPath } from "@/features/workspace";
import { cn } from "@/utils/cn";

type SidebarNavProps = {
  readonly className?: string;
  readonly crmObjects?: readonly SidebarCrmObjectListItem[];
  readonly isCrmObjectsLoading?: boolean;
  readonly onCreateObjectDefinition?: () => void;
  readonly workspaceId?: string | null;
};

// 기능 : 즐겨찾기, 업무 목록, 관리 대상 순서로 사이드바를 렌더링합니다.
export function SidebarNav({
  className,
  crmObjects = [],
  isCrmObjectsLoading = false,
  onCreateObjectDefinition,
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
        onToggle={() => setWorkListsOpen((current) => !current)}
      />
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
          <SidebarCrmObjectSkeletonList />
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
      <div className="group/sidebar-section relative mb-1 h-6 w-full">
        <button
          aria-label={t(toggleLabelKey)}
          aria-expanded={isOpen}
          className="flex h-6 w-full min-w-0 items-center gap-1 rounded-md px-2 pr-8 text-left text-[14px] font-semibold tracking-[0.02em] text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
          onClick={onToggle}
          type="button"
        >
          <span className="min-w-0 truncate">{t(labelKey)}</span>
          <ChevronRight
            className={cn(
              "h-5 w-5 shrink-0 transition-[transform,opacity]",
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
            className="pointer-events-none absolute right-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#9CA3AF] opacity-0 transition hover:bg-[#E4E2DC] hover:text-[#6B7280] focus:pointer-events-auto focus:opacity-100 active:bg-[#D3D1CB] group-hover/sidebar-section:pointer-events-auto group-hover/sidebar-section:opacity-100"
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

const SIDEBAR_CRM_OBJECT_SKELETON_WIDTHS = ["w-20", "w-28", "w-24"] as const;

// 기능 : 관리 대상 목록이 불러와지는 동안 사이드바 자리 표시 row를 렌더링합니다.
function SidebarCrmObjectSkeletonList() {
  return (
    <div aria-hidden="true" className="contents">
      {SIDEBAR_CRM_OBJECT_SKELETON_WIDTHS.map((widthClassName) => (
        <SidebarCrmObjectSkeletonItem
          key={widthClassName}
          textWidthClassName={widthClassName}
        />
      ))}
    </div>
  );
}

// 기능 : 관리 대상 데이터 row와 같은 크기의 skeleton 한 줄을 렌더링합니다.
function SidebarCrmObjectSkeletonItem({
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
