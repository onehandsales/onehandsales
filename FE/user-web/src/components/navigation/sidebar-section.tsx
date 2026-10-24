import { ChevronRight, Plus } from "lucide-react";
import type { ReactNode } from "react";
import {
  SidebarDataList,
  type SidebarDataItem,
} from "@/components/navigation/sidebar-data-list";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import { cn } from "@/utils/cn";

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

type SidebarDataSectionProps = Omit<
  SidebarSectionProps,
  "children" | "showAddAction"
> & {
  readonly items: readonly SidebarDataItem[];
  readonly isLoading: boolean;
};

// 기능 : 두 데이터 영역의 섹션·목록·추가 버튼·로딩 표시를 공통으로 구성합니다.
export function SidebarDataSection({
  items,
  isLoading,
  ...sectionProps
}: SidebarDataSectionProps) {
  const { t } = useAppI18n();

  // 1. 관리 항목 기준으로 로딩 중에는 추가 버튼을 숨기고 같은 목록을 렌더링한다.
  return (
    <SidebarSection {...sectionProps} showAddAction={!isLoading}>
      <SidebarDataList
        items={items}
        isLoading={isLoading}
        label={t(sectionProps.labelKey)}
      />
    </SidebarSection>
  );
}

// 기능 : 사이드바 섹션의 접힘 상태와 추가 버튼 영역을 렌더링합니다.
export function SidebarSection({
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
        {showAddAction ? (
          <button
            aria-label={t(addLabelKey)}
            className="pointer-events-none absolute right-1 top-1/2 z-10 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded-md text-[#9CA3AF] opacity-0 transition hover:bg-[#D3D1CB] focus:pointer-events-auto focus:opacity-100 active:bg-[#D3D1CB] group-hover/sidebar-section:pointer-events-auto group-hover/sidebar-section:text-[#6B7280] group-hover/sidebar-section:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              onAdd?.();
            }}
            type="button"
          >
            <Plus aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={2} />
          </button>
        ) : null}
      </div>
      {isOpen ? (
        <div className="flex flex-col gap-px">
          {children}
          {showAddAction ? (
            <button
              aria-label={t(addLabelKey)}
              className="flex h-[30px] w-full items-center justify-center rounded-md px-2 text-[#4880EE] transition hover:bg-[#E4E2DC] active:bg-[#D3D1CB]"
              onClick={onAdd}
              type="button"
            >
              <Plus aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
