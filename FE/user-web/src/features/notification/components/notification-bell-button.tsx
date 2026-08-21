import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotificationUnreadCount } from "@/features/notification/hooks/use-notification-queries";
import { cn } from "@/utils/cn";

type NotificationBellButtonProps = {
  readonly className?: string;
  readonly labelClassName?: string;
  readonly showLabel?: boolean;
  readonly tooltipLabel?: string;
};

export function NotificationBellButton({
  className,
  labelClassName,
  showLabel = false,
  tooltipLabel,
}: NotificationBellButtonProps) {
  const unreadCountQuery = useNotificationUnreadCount();
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <Link
      aria-label={
        unreadCount > 0 ? `알림, 안읽음 ${unreadCount}개` : "알림"
      }
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]",
        tooltipLabel ? "group/sidebar-tooltip" : undefined,
        className
      )}
      to="/app/notifications"
    >
      <Bell className="h-5 w-5 shrink-0" strokeWidth={2} />
      {showLabel ? (
        <span className={cn("truncate", labelClassName)}>알림</span>
      ) : null}
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[14px] font-bold leading-4 text-white">
          {badgeText}
        </span>
      ) : null}
      {tooltipLabel ? (
        <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/sidebar-tooltip:opacity-100">
          {tooltipLabel}
        </span>
      ) : null}
    </Link>
  );
}
