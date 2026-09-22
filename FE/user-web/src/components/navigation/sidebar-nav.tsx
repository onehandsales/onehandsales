import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import { cn } from "@/utils/cn";

type SidebarNavProps = {
  readonly className?: string;
};

// 기능 : SidebarNav 컴포넌트를 렌더링합니다.
export function SidebarNav({ className }: SidebarNavProps) {
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
        onToggle={() => setMainGroupOpen((current) => !current)}
      />
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
  readonly openLabelKey: AppI18nKey;
  readonly onToggle: () => void;
};

function SidebarSection({
  addLabelKey,
  closeLabelKey,
  isOpen,
  labelKey,
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
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/sidebar-tooltip:opacity-100">
          {t(toggleLabelKey)}
        </span>
      </button>
      {isOpen ? (
        <div className="flex flex-col gap-px">
          <button
            aria-label={t(addLabelKey)}
            className="group/sidebar-add-tooltip relative flex h-6 w-full items-center justify-center rounded-md px-2 text-[#4880EE] transition hover:bg-[#E4E2DC] active:bg-[#D3D1CB]"
            type="button"
          >
            <Plus
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
              strokeWidth={2}
            />
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/sidebar-add-tooltip:opacity-100">
              {t(addLabelKey)}
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
