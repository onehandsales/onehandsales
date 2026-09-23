import { ChevronRight, Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import {
  SidebarCrmObjectIcon,
  type SidebarCrmObjectListItem,
} from "@/features/crm-object";
import { cn } from "@/utils/cn";

type SidebarNavProps = {
  readonly className?: string;
  readonly crmObjects?: readonly SidebarCrmObjectListItem[];
  readonly isCrmObjectsLoading?: boolean;
  readonly onCreateObjectDefinition?: () => void;
};

// 기능 : SidebarNav 컴포넌트를 렌더링합니다.
export function SidebarNav({
  className,
  crmObjects = [],
  isCrmObjectsLoading = false,
  onCreateObjectDefinition,
}: SidebarNavProps) {
  const [isQuickWorkOpen, setQuickWorkOpen] = useState(true);
  const [isMainGroupOpen, setMainGroupOpen] = useState(true);
  const [isWorkListsOpen, setWorkListsOpen] = useState(true);

  return (
    <nav
      aria-label="Workspace navigation"
      className={cn("flex flex-col gap-3", className)}
    >
      <SidebarSection
        addLabelKey="navigation.quickWorkGroupAdd"
        closeLabelKey="navigation.quickWorkGroupClose"
        isOpen={isQuickWorkOpen}
        labelKey="navigation.quickWorkGroup"
        openLabelKey="navigation.quickWorkGroupOpen"
        onToggle={() => setQuickWorkOpen((current) => !current)}
      />
      <SidebarSection
        addLabelKey="navigation.mainGroupAdd"
        closeLabelKey="navigation.mainGroupClose"
        isOpen={isMainGroupOpen}
        labelKey="navigation.mainGroup"
        openLabelKey="navigation.mainGroupOpen"
        onAdd={onCreateObjectDefinition}
        onToggle={() => setMainGroupOpen((current) => !current)}
      >
        {isCrmObjectsLoading ? (
          <SidebarCrmObjectSkeletonList />
        ) : (
          <SidebarCrmObjectList objects={crmObjects} />
        )}
      </SidebarSection>
      <SidebarSection
        addLabelKey="navigation.workListsGroupAdd"
        closeLabelKey="navigation.workListsGroupClose"
        isOpen={isWorkListsOpen}
        labelKey="navigation.workListsGroup"
        openLabelKey="navigation.workListsGroupOpen"
        onToggle={() => setWorkListsOpen((current) => !current)}
      />
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
  onToggle,
}: SidebarSectionProps) {
  const { t } = useAppI18n();
  const toggleLabelKey = isOpen ? closeLabelKey : openLabelKey;

  return (
    <div>
      <button
        aria-label={t(toggleLabelKey)}
        aria-expanded={isOpen}
        className="group/sidebar-tooltip relative mb-1 flex h-6 w-full items-center gap-1 rounded-md px-2 text-left text-[14px] font-semibold tracking-[0.02em] text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
        onClick={onToggle}
        type="button"
      >
        <ChevronRight
          className={cn(
            "h-5 w-5 shrink-0 transition-transform",
            isOpen ? "rotate-90" : "rotate-0"
          )}
          strokeWidth={2}
        />
        <span>{t(labelKey)}</span>
        <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/sidebar-tooltip:opacity-100">
          {t(toggleLabelKey)}
        </span>
      </button>
      {isOpen ? (
        <div className="flex flex-col gap-px">
          {children}
          <button
            aria-label={t(addLabelKey)}
            className="group/sidebar-add-tooltip relative flex h-8 w-full items-center justify-center rounded-md px-2 text-[#4880EE] transition hover:bg-[#E4E2DC] active:bg-[#D3D1CB]"
            onClick={onAdd}
            type="button"
          >
            <Plus
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
              strokeWidth={2}
            />
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/sidebar-add-tooltip:opacity-100">
              {t(addLabelKey)}
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

const SIDEBAR_CRM_OBJECT_SKELETON_WIDTHS = ["w-20", "w-28", "w-24"] as const;

// 기능 : 관리 항목 목록이 불러와지는 동안 사이드바 자리 표시 row를 렌더링합니다.
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

// 기능 : 관리 항목 데이터 row와 같은 크기의 skeleton 한 줄을 렌더링합니다.
function SidebarCrmObjectSkeletonItem({
  textWidthClassName,
}: {
  readonly textWidthClassName: string;
}) {
  return (
    <div className="flex h-8 w-full items-center gap-2 rounded-md px-2">
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

// 기능 : 현재 Workspace의 관리 항목 목록을 사이드바 섹션 안에 렌더링합니다.
function SidebarCrmObjectList({
  objects,
}: {
  readonly objects: readonly SidebarCrmObjectListItem[];
}) {
  if (objects.length === 0) {
    return null;
  }

  return (
    <>
      {objects.map((object) => (
        <SidebarCrmObjectItem key={object.id} object={object} />
      ))}
    </>
  );
}

// 기능 : 사이드바 관리 항목 한 줄에 아이콘과 단수 이름을 표시합니다.
function SidebarCrmObjectItem({
  object,
}: {
  readonly object: SidebarCrmObjectListItem;
}) {
  return (
    <div className="group/sidebar-object-tooltip relative flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[14px] font-medium text-[#4B5563] transition-colors hover:bg-[#E4E2DC] hover:text-[#111827]">
      <SidebarCrmObjectIcon
        className="h-5 w-5 shrink-0 text-[#9CA3AF] group-hover/sidebar-object-tooltip:text-[#6B7280]"
        name={object.icon}
        strokeWidth={2}
      />
      <span className="min-w-0 flex-1 truncate">{object.singularName}</span>
    </div>
  );
}
