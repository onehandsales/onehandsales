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
import { cn } from "@/utils/cn";

const groups: Array<{
  readonly label: string;
  readonly items: ReadonlyArray<{
    readonly label: string;
    readonly to: string;
    readonly icon: LucideIcon;
    readonly end?: boolean;
  }>;
}> = [
  {
    label: "주요 메뉴",
    items: [
      // { label: "홈", to: "/app", icon: House, end: true },
      { label: "딜", to: "/app/deals", icon: BriefcaseBusiness },
      { label: "회사", to: "/app/companies", icon: Building2 },
      { label: "담당자", to: "/app/contacts", icon: IdCard },
      { label: "제품", to: "/app/products", icon: Package },
    ],
  },
  {
    label: "업무",
    items: [
      { label: "일정", to: "/app/schedules", icon: CalendarDays },
      { label: "회의록", to: "/app/meeting-notes", icon: NotebookPen },
      { label: "명함 스캔", to: "/app/business-cards", icon: Camera },
      { label: "데이터 업로드", to: "/app/import", icon: DataUploadIcon },
    ],
  },
];

type SidebarNavProps = {
  readonly className?: string;
};

export function SidebarNav({ className }: SidebarNavProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group) => [group.label, true]))
  );

  return (
    <nav className={cn("flex flex-col gap-3", className)}>
      {groups.map((group) => {
        const isOpen = openGroups[group.label] ?? true;

        return (
          <div key={group.label}>
            <button
              aria-expanded={isOpen}
              className="mb-1 flex h-6 w-full items-center gap-1 rounded-md px-2 text-left text-[11px] font-semibold tracking-[0.02em] text-[#9CA3AF] transition hover:bg-[#E9EBF0] hover:text-[#6B7280]"
              onClick={() =>
                setOpenGroups((current) => ({
                  ...current,
                  [group.label]: !(current[group.label] ?? true),
                }))
              }
              type="button"
            >
              <ChevronRight
                className={cn(
                  "h-3 w-3 shrink-0 transition-transform",
                  isOpen ? "rotate-90" : "rotate-0"
                )}
                strokeWidth={2}
              />
              <span>{group.label}</span>
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
                          : "text-[#4B5563] hover:bg-[#E9EBF0] hover:text-[#111827]"
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
                            "h-[15px] w-[15px] shrink-0",
                            isActive
                              ? "text-[#4880EE]"
                              : "text-[#9CA3AF] group-hover:text-[#6B7280]"
                          )}
                          strokeWidth={1.75}
                        />
                        <span>{item.label}</span>
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
