import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileText,
  House,
  IdCard,
  Package,
  Settings,
  // Trash2,
  // Upload,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

const groups: Array<{
  readonly label: string;
  readonly items: ReadonlyArray<{
    readonly label: string;
    readonly to: string;
    readonly icon: typeof House;
    readonly end?: boolean;
  }>;
}> = [
  {
    label: "주요 메뉴",
    items: [
      { label: "홈", to: "/", icon: House, end: true },
      { label: "딜", to: "/deals", icon: BriefcaseBusiness },
      { label: "회사", to: "/companies", icon: Building2 },
      { label: "담당자", to: "/contacts", icon: IdCard },
      { label: "제품", to: "/products", icon: Package },
    ],
  },
  {
    label: "업무",
    items: [
      { label: "일정", to: "/schedules", icon: CalendarDays },
      { label: "회의록", to: "/meeting-notes", icon: FileText },
      // 핵심 기능 UX 유지보수 이후 Import 기능을 다시 노출한다.
      // { label: "Import", to: "/import", icon: Upload },
    ],
  },
  {
    label: "관리",
    items: [
      // 핵심 기능 UX 유지보수 이후 휴지통 기능을 다시 노출한다.
      // { label: "휴지통", to: "/trash", icon: Trash2 },
      { label: "설정", to: "/settings", icon: Settings },
    ],
  },
];

type SidebarNavProps = {
  readonly className?: string;
};

export function SidebarNav({ className }: SidebarNavProps) {
  return (
    <nav className={cn("flex flex-col gap-5", className)}>
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#71717A]">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "group flex h-10 items-center gap-2.5 rounded-lg border px-3 text-[13px] transition-colors",
                    isActive
                      ? "border-[#2563EB30] bg-[#1D4ED822] font-bold text-[#BFDBFE]"
                      : "border-transparent font-medium text-[#A1A1AA] hover:bg-white/5 hover:text-[#D4D4D8]"
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
                        "h-4 w-4 shrink-0",
                        isActive ? "text-[#93C5FD]" : "text-[#71717A] group-hover:text-[#A1A1AA]"
                      )}
                      strokeWidth={1.75}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
