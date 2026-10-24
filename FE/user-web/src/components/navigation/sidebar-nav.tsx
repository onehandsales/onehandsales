import { useState } from "react";
import type { SidebarDataItem } from "@/components/navigation/sidebar-data-list";
import {
  SidebarDataSection,
  SidebarSection,
} from "@/components/navigation/sidebar-section";
import type { SidebarCrmListItem } from "@/features/crm-list";
import type { SidebarCrmObjectListItem } from "@/features/crm-object";
import { toWorkspaceObjectPath } from "@/features/workspace";
import { cn } from "@/utils/cn";

type SidebarNavProps = {
  readonly className?: string;
  readonly crmLists?: readonly SidebarCrmListItem[];
  readonly crmObjects?: readonly SidebarCrmObjectListItem[];
  readonly isCrmListsLoading?: boolean;
  readonly isCrmObjectsLoading?: boolean;
  readonly onCreateObjectDefinition?: () => void;
  readonly workspaceId?: string | null;
};

// 기능 : 업무 목록과 관리 항목을 공통 데이터 형식과 같은 섹션 컴포넌트로 표시합니다.
export function SidebarNav({
  className,
  crmLists = [],
  crmObjects = [],
  isCrmListsLoading = false,
  isCrmObjectsLoading = false,
  onCreateObjectDefinition,
  workspaceId = null,
}: SidebarNavProps) {
  const [isFavoritesOpen, setFavoritesOpen] = useState(true);
  const [isWorkListsOpen, setWorkListsOpen] = useState(true);
  const [isManagedItemsOpen, setManagedItemsOpen] = useState(true);

  // 1. 각 API의 이름 필드만 공통 label로 변환하고 서버 순서를 유지한다.
  const workListItems: readonly SidebarDataItem[] = crmLists.map((list) => ({
    id: list.id,
    label: list.name,
    icon: list.icon,
  }));
  const managedItems: readonly SidebarDataItem[] = crmObjects.map((object) => ({
    id: object.id,
    label: object.singularName,
    icon: object.icon,
    ...(workspaceId ? { to: toWorkspaceObjectPath(workspaceId, object.id) } : {}),
  }));

  // 2. 두 데이터 영역은 같은 컴포넌트에 데이터·로딩·문구·동작만 전달한다.
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
      <SidebarDataSection
        addLabelKey="navigation.workListsGroupAdd"
        closeLabelKey="navigation.workListsGroupClose"
        isLoading={isCrmListsLoading}
        isOpen={isWorkListsOpen}
        items={workListItems}
        labelKey="navigation.workListsGroup"
        openLabelKey="navigation.workListsGroupOpen"
        onToggle={() => setWorkListsOpen((current) => !current)}
      />
      <SidebarDataSection
        addLabelKey="navigation.mainGroupAdd"
        closeLabelKey="navigation.mainGroupClose"
        isLoading={isCrmObjectsLoading}
        isOpen={isManagedItemsOpen}
        items={managedItems}
        labelKey="navigation.mainGroup"
        onAdd={onCreateObjectDefinition}
        openLabelKey="navigation.mainGroupOpen"
        onToggle={() => setManagedItemsOpen((current) => !current)}
      />
    </nav>
  );
}
