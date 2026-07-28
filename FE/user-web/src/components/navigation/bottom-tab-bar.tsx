import { Briefcase, Calendar, House, MoreHorizontal, NotebookPen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";

const items: ReadonlyArray<{
  readonly labelKey: AppI18nKey;
  readonly to: string;
  readonly icon: typeof House;
  readonly end?: boolean;
  readonly activeColor: string;
}> = [
  { labelKey: "navigation.home", to: "/app", icon: House, end: true, activeColor: "#4880EE" },
  { labelKey: "navigation.deals", to: "/app/deals", icon: Briefcase, activeColor: "#4880EE" },
  { labelKey: "navigation.schedules", to: "/app/schedules", icon: Calendar, activeColor: "#4880EE" },
  {
    labelKey: "navigation.meetingNotes",
    to: "/app/meeting-notes",
    icon: NotebookPen,
    activeColor: "#4880EE",
  },
  { labelKey: "navigation.more", to: "/app/more", icon: MoreHorizontal, activeColor: "#4880EE" },
];

export function BottomTabBar() {
  const { t } = useAppI18n();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-1 pb-[max(env(safe-area-inset-bottom),8px)] pt-1 lg:hidden"
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
                    {t(item.labelKey)}
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
