import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotificationUnreadCount } from "@/features/notification/hooks/use-notification-queries";
import { cn } from "@/utils/cn";

type NotificationBellButtonProps = {
  readonly className?: string;
  readonly labelClassName?: string;
  readonly showLabel?: boolean;
};

export function NotificationBellButton({
  className,
  labelClassName,
  showLabel = false,
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
        "relative inline-flex items-center justify-center gap-2 rounded-md text-[#6B7280] transition hover:bg-[#F1F2F5] hover:text-[#111827]",
        className
      )}
      to="/app/notifications"
    >
      <Bell className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      {showLabel ? (
        <span className={cn("truncate", labelClassName)}>알림</span>
      ) : null}
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">
          {badgeText}
        </span>
      ) : null}
    </Link>
  );
}
