import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  ChevronRight,
  IdCard,
  NotebookPen,
  Package,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { DataUploadIcon } from "@/components/icons/data-upload-icon";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import { cn } from "@/utils/cn";

const groups: Array<{
  readonly id: string;
  readonly labelKey: AppI18nKey;
  readonly closeTooltipKey: AppI18nKey;
  readonly openTooltipKey: AppI18nKey;
  readonly items: ReadonlyArray<{
    readonly labelKey: AppI18nKey;
    readonly to: string;
    readonly icon: LucideIcon;
    readonly iconClassName?: string;
    readonly end?: boolean;
  }>;
}> = [
  {
    id: "main",
    labelKey: "navigation.mainGroup",
    closeTooltipKey: "navigation.mainGroupClose",
    openTooltipKey: "navigation.mainGroupOpen",
    items: [
      { labelKey: "navigation.deals", to: "/app/deals", icon: BriefcaseBusiness },
      {
        labelKey: "navigation.companies",
        to: "/app/companies",
        icon: Building2,
      },
      { labelKey: "navigation.contacts", to: "/app/contacts", icon: IdCard },
      { labelKey: "navigation.products", to: "/app/products", icon: Package },
    ],
  },
  {
    id: "work",
    labelKey: "navigation.workGroup",
    closeTooltipKey: "navigation.workGroupClose",
    openTooltipKey: "navigation.workGroupOpen",
    items: [
      { labelKey: "navigation.schedules", to: "/app/schedules", icon: CalendarDays },
      { labelKey: "navigation.meetingNotes", to: "/app/meeting-notes", icon: NotebookPen },
      { labelKey: "navigation.businessCards", to: "/app/business-cards", icon: Camera },
      { labelKey: "navigation.import", to: "/app/import", icon: DataUploadIcon },
    ],
  },
];

type SidebarNavProps = {
  readonly className?: string;
};

export function SidebarNav({ className }: SidebarNavProps) {
  const { t } = useAppI18n();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group) => [group.id, true]))
  );

  return (
    <nav className={cn("flex flex-col gap-3", className)}>
      {groups.map((group) => {
        const isOpen = openGroups[group.id] ?? true;

        return (
          <div key={group.id}>
            <button
              aria-label={t(isOpen ? group.closeTooltipKey : group.openTooltipKey)}
              aria-expanded={isOpen}
              className="group/sidebar-tooltip relative mb-1 flex h-6 w-full items-center gap-1 rounded-md px-2 text-left text-[14px] font-semibold tracking-[0.02em] text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
              onClick={() =>
                setOpenGroups((current) => ({
                  ...current,
                  [group.id]: !(current[group.id] ?? true),
                }))
              }
              type="button"
            >
              <ChevronRight
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform",
                  isOpen ? "rotate-90" : "rotate-0"
                )}
                strokeWidth={2}
              />
              <span>{t(group.labelKey)}</span>
              <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/sidebar-tooltip:opacity-100">
                {t(isOpen ? group.closeTooltipKey : group.openTooltipKey)}
              </span>
            </button>
            {isOpen ? (
              <div className="flex flex-col gap-px">
                {group.items.map((item) => (
                  <NavLink
                    className={({ isActive }) =>
                      cn(
                        "group flex h-8 items-center gap-2.5 rounded-md px-2 text-[14px] font-medium transition-colors active:bg-[#D3D1CB]",
                        isActive
                          ? "bg-[#E4E2DC] font-semibold text-[#111827]"
                          : "text-[#4B5563] hover:bg-[#E4E2DC] hover:text-[#111827]"
                      )
                    }
                    end={item.end}
                    key={item.to}
                    to={item.to}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            item.iconClassName ??
                              (isActive
                                ? "text-[#6B7280]"
                                : "text-[#9CA3AF] group-hover:text-[#6B7280]")
                          )}
                          strokeWidth={2}
                        />
                        <span>{t(item.labelKey)}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
