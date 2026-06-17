import { Briefcase, Calendar, FileText, House, MoreHorizontal } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

const items: ReadonlyArray<{
  readonly label: string;
  readonly to: string;
  readonly icon: typeof House;
  readonly end?: boolean;
  readonly activeColor: string;
}> = [
  { label: "홈", to: "/", icon: House, end: true, activeColor: "#5E5CE6" },
  { label: "딜", to: "/deals", icon: Briefcase, activeColor: "#5E5CE6" },
  { label: "일정", to: "/schedules", icon: Calendar, activeColor: "#5E5CE6" },
  { label: "회의록", to: "/meeting-notes", icon: FileText, activeColor: "#5E5CE6" },
  { label: "더보기", to: "/more", icon: MoreHorizontal, activeColor: "#2563EB" },
];

export function BottomTabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-1 md:hidden"
      style={{ height: 72 }}
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] font-normal text-gray-400 transition"
              end={item.end ?? false}
              to={item.to}
              style={({ isActive }) =>
                isActive ? { color: item.activeColor } : undefined
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className="h-[22px] w-[22px]"
                    style={{ color: isActive ? item.activeColor : "#9CA3AF" }}
                  />
                  <span style={{ color: isActive ? item.activeColor : "#9CA3AF" }}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
