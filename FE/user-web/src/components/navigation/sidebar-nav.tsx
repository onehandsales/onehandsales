import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Download,
  FolderArchive,
  Handshake,
  LayoutGrid,
  ScanLine,
  Settings,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

const group1 = [
  { label: "홈", to: "/", icon: LayoutGrid, end: true },
  { label: "딜", to: "/deals", icon: Handshake },
  { label: "회사", to: "/companies", icon: Building2 },
  { label: "거래처", to: "/contacts", icon: Users },
  { label: "제품", to: "/products", icon: BriefcaseBusiness },
] as const;

const group2 = [
  { label: "일정", to: "/schedules", icon: CalendarDays },
  { label: "회의록", to: "/meeting-notes", icon: FolderArchive },
  { label: "가져오기", to: "/import", icon: Download },
] as const;

const group3 = [
  { label: "알림", to: "/notifications", icon: Bell },
  { label: "명함 스캔", to: "/business-cards", icon: ScanLine },
  { label: "내보내기", to: "/export", icon: Upload },
  { label: "휴지통", to: "/trash", icon: Trash2 },
  { label: "설정", to: "/settings", icon: Settings },
] as const;

type SidebarNavProps = {
  readonly className?: string;
};

export function SidebarNav({ className }: SidebarNavProps) {
  return (
    <nav className={cn("flex flex-col gap-6", className)}>
      <NavGroup items={group1} />
      <NavGroup items={group2} />
      <NavGroup items={group3} />
    </nav>
  );
}

type NavGroupProps = {
  readonly items: ReadonlyArray<{
    readonly label: string;
    readonly to: string;
    readonly icon: typeof LayoutGrid;
    readonly end?: boolean;
  }>;
};

function NavGroup({ items }: NavGroupProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => (
        <NavLink
          className={({ isActive }) =>
            cn(
              "group flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-normal text-sidebar-foreground/60 transition-colors hover:bg-sidebar-muted hover:text-sidebar-foreground",
              isActive &&
                "bg-sidebar-foreground/10 text-sidebar-foreground font-medium"
            )
          }
          end={item.end}
          key={item.to}
          to={item.to}
        >
          <item.icon
            className="h-[15px] w-[15px] shrink-0 text-sidebar-foreground/45 transition-colors group-hover:text-sidebar-foreground/80"
            strokeWidth={1.75}
          />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
