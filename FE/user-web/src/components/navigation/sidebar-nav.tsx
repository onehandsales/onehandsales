import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  IdCard,
  LogIn,
  LogOut,
  NotebookPen,
  Package,
  Settings,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthSession } from "@/features/auth";
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
      // { label: "홈", to: "/", icon: House, end: true },
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
      { label: "회의록", to: "/meeting-notes", icon: NotebookPen },
      { label: "명함 스캔", to: "/business-cards", icon: Camera },
      { label: "데이터 업로드", to: "/import", icon: DataUploadIcon },
    ],
  },
  {
    label: "관리",
    items: [
      // 핵심 기능 UX 유지보수 이후 휴지통 기능을 다시 노출한다.
      { label: "휴지통", to: "/trash", icon: Trash2 },
      { label: "설정", to: "/settings", icon: Settings },
    ],
  },
];

type SidebarNavProps = {
  readonly className?: string;
};

export function SidebarNav({ className }: SidebarNavProps) {
  const { isAuthenticated, logout } = useAuthSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className={cn("flex flex-col gap-4", className)}>
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#9CA3AF]">
            {group.label}
          </p>
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
        </div>
      ))}
      <div className="mt-auto">
        {isAuthenticated ? (
          <button
            className="group flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-[13px] font-medium text-[#4B5563] transition-colors hover:bg-[#E9EBF0] hover:text-[#111827]"
            onClick={() => void handleLogout()}
          >
            <LogOut
              className="h-[15px] w-[15px] shrink-0 text-[#9CA3AF] group-hover:text-[#6B7280]"
              strokeWidth={1.75}
            />
            <span>로그아웃</span>
          </button>
        ) : (
          <NavLink
            className="group flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium text-[#4B5563] transition-colors hover:bg-[#E9EBF0] hover:text-[#111827]"
            to="/login"
          >
            <LogIn
              className="h-[15px] w-[15px] shrink-0 text-[#9CA3AF] group-hover:text-[#6B7280]"
              strokeWidth={1.75}
            />
            <span>로그인</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
