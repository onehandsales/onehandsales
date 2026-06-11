import { Bell, BriefcaseBusiness, Building2, CalendarDays, Download, FolderArchive, Handshake, LayoutGrid, ScanLine, Settings, Trash2, Upload, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

const primaryItems = [
  { label: "파이프라인", to: "/", icon: LayoutGrid, end: true },
  { label: "회사", to: "/companies", icon: Building2 },
  { label: "거래처", to: "/contacts", icon: Users },
  { label: "제품", to: "/products", icon: BriefcaseBusiness },
  { label: "딜", to: "/deals", icon: Handshake },
  { label: "일정", to: "/schedules", icon: CalendarDays },
  { label: "회의록", to: "/meeting-notes", icon: FolderArchive },
] as const;

const secondaryItems = [
  { label: "명함 스캔", to: "/business-cards", icon: ScanLine },
  { label: "알림", to: "/notifications", icon: Bell },
  { label: "가져오기", to: "/import", icon: Upload },
  { label: "내보내기", to: "/export", icon: Download },
  { label: "휴지통", to: "/trash", icon: Trash2 },
  { label: "설정", to: "/settings", icon: Settings },
] as const;

type SidebarNavProps = {
  readonly className?: string;
};

export function SidebarNav({ className }: SidebarNavProps) {
  return (
    <nav className={cn("grid gap-6", className)}>
      <NavSection items={primaryItems} title="Workspace" />
      <NavSection items={secondaryItems} title="Tools" />
    </nav>
  );
}

type NavSectionProps = {
  readonly items: ReadonlyArray<{
    readonly label: string;
    readonly to: string;
    readonly icon: typeof LayoutGrid;
    readonly end?: boolean;
  }>;
  readonly title: string;
};

function NavSection({ items, title }: NavSectionProps) {
  return (
    <div className="grid gap-2">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/45">
        {title}
      </p>
      <div className="grid gap-1">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/72 transition hover:bg-sidebar-muted hover:text-sidebar-foreground",
                isActive && "bg-sidebar-muted text-sidebar-foreground"
              )
            }
            end={item.end}
            key={item.to}
            to={item.to}
          >
            <item.icon className="h-4 w-4 text-sidebar-foreground/70 transition group-hover:text-sidebar-foreground" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
