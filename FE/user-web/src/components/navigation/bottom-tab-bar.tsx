import { Bell, FolderArchive, LayoutGrid, Plus, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";

const items: ReadonlyArray<{
  readonly label: string;
  readonly to: string;
  readonly icon: typeof LayoutGrid;
  readonly end?: boolean;
}> = [
  { label: "홈", to: "/", icon: LayoutGrid, end: true },
  { label: "거래처", to: "/contacts", icon: Users },
  { label: "회의록", to: "/meeting-notes", icon: FolderArchive },
  { label: "알림", to: "/notifications", icon: Bell },
  { label: "설정", to: "/settings", icon: Settings },
];

type BottomTabBarProps = {
  readonly action?: {
    readonly label: string;
    readonly onClick: () => void;
  };
};

export function BottomTabBar({ action }: BottomTabBarProps) {
  return (
    <>
      {action ? (
        <button
          aria-label={action.label}
          className="fixed bottom-24 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-fab text-fab-foreground shadow-fab transition hover:scale-[1.02] md:hidden"
          onClick={action.onClick}
          type="button"
        >
          <Plus className="h-6 w-6" />
        </button>
      ) : null}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-panel/95 px-2 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 backdrop-blur md:hidden">
        <ul className="grid grid-cols-5 gap-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium text-muted-foreground transition",
                    isActive && "bg-chip text-foreground"
                  )
                }
                end={item.end ?? false}
                to={item.to}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
