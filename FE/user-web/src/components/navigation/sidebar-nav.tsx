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
    items: [
      { labelKey: "navigation.deals", to: "/app/deals", icon: BriefcaseBusiness },
      {
        labelKey: "navigation.companies",
        to: "/app/companies",
        icon: Building2,
        iconClassName: "text-[#111827] group-hover:text-[#111827]",
      },
      { labelKey: "navigation.contacts", to: "/app/contacts", icon: IdCard },
      { labelKey: "navigation.products", to: "/app/products", icon: Package },
    ],
  },
  {
    id: "work",
    labelKey: "navigation.workGroup",
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
              aria-expanded={isOpen}
              className="mb-1 flex h-6 w-full items-center gap-1 rounded-md px-2 text-left text-[11px] font-semibold tracking-[0.02em] text-[#9CA3AF] transition hover:bg-[#F1F2F5] hover:text-[#6B7280]"
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
            </button>
            {isOpen ? (
              <div className="flex flex-col gap-px">
                {group.items.map((item) => (
                  <NavLink
                    className={({ isActive }) =>
                      cn(
                        "group flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
                          : "text-[#4B5563] hover:bg-[#F1F2F5] hover:text-[#111827]"
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
                                ? "text-[#4880EE]"
                                : "text-[#9CA3AF] group-hover:text-[#6B7280]")
                          )}
                          strokeWidth={1.75}
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
