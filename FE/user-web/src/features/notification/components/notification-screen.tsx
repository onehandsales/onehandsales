import {
  BellRing,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMarkNotificationReadMutation } from "@/features/notification/hooks/use-notification-mutations";
import { useNotificationList } from "@/features/notification/hooks/use-notification-queries";
import type {
  NotificationItem,
  NotificationReadFilter,
} from "@/features/notification/types/notification";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateWithOptions } from "@/utils/format";

const PAGE_SIZE = 15;

const filterOptions: readonly {
  readonly value: NotificationReadFilter;
  readonly label: string;
}[] = [
  { value: "ALL", label: "전체" },
  { value: "UNREAD", label: "안읽음" },
  { value: "READ", label: "읽음" },
];

// 기능 : 알림 목록을 렌더링합니다.
export function NotificationScreen() {
  const [read, setRead] = useState<NotificationReadFilter>("ALL");
  const [includeUpcoming, setIncludeUpcoming] = useState(false);
  const [page, setPage] = useState(1);
  const notificationListQuery = useNotificationList({
    page,
    pageSize: PAGE_SIZE,
    read,
    includeUpcoming,
  });
  const notificationTotalPages = Math.ceil(
    (notificationListQuery.data?.totalCount ?? 0) /
      (notificationListQuery.data?.pageSize ?? PAGE_SIZE)
  );
  const markReadMutation = useMarkNotificationReadMutation();
  const actionError =
    notificationListQuery.error ??
    markReadMutation.error ??
    null;

  useEffect(() => {
    setPage(1);
  }, [includeUpcoming, read]);

  // 기능 : 읽지 않은 알림을 읽음 상태로 변경합니다.
  const onMarkRead = async (notification: NotificationItem) => {
    if (notification.readAt) {
      return;
    }

    await markReadMutation.mutateAsync(notification.id);
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-2xl font-semibold">알림</h1>
        <p className="text-sm text-muted-foreground">
          일정 시작과 딜 마감 reminder를 확인하고 관련 기록으로 바로 이동해요.
        </p>
      </header>

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <section className="grid content-start gap-4 rounded-lg border bg-white p-4">
        <NotificationListHeader
          currentRead={read}
          includeUpcoming={includeUpcoming}
          isFetching={notificationListQuery.isFetching}
          onIncludeUpcomingChange={setIncludeUpcoming}
          onReadChange={setRead}
          unreadCount={notificationListQuery.data?.unreadCount ?? 0}
        />

        <NotificationList
          isLoading={notificationListQuery.isLoading}
          items={notificationListQuery.data?.items ?? []}
          onMarkRead={(notification) => void onMarkRead(notification)}
          pendingNotificationId={
            markReadMutation.isPending
              ? markReadMutation.variables ?? null
              : null
          }
        />

        <PaginationControls
          page={page}
          totalCount={notificationListQuery.data?.totalCount ?? 0}
          totalPages={notificationTotalPages}
          onNext={() => setPage((current) => current + 1)}
          onPrev={() => setPage((current) => Math.max(1, current - 1))}
        />
      </section>
    </section>
  );
}

type NotificationListHeaderProps = {
  readonly currentRead: NotificationReadFilter;
  readonly includeUpcoming: boolean;
  readonly isFetching: boolean;
  readonly unreadCount: number;
  readonly onIncludeUpcomingChange: (includeUpcoming: boolean) => void;
  readonly onReadChange: (read: NotificationReadFilter) => void;
};

// 기능 : 알림 목록 필터와 안읽음 개수 요약을 렌더링합니다.
function NotificationListHeader({
  currentRead,
  includeUpcoming,
  isFetching,
  unreadCount,
  onIncludeUpcomingChange,
  onReadChange,
}: NotificationListHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <BellRing className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold">알림 목록</h2>
          <p className="text-sm text-muted-foreground">안읽음 {unreadCount}개</p>
        </div>
        {isFetching ? (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:items-end">
        <div className="grid grid-cols-3 rounded-lg border bg-slate-50 p-1 text-sm">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`min-h-9 rounded-md px-3 font-semibold ${
                currentRead === option.value
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              type="button"
              onClick={() => onReadChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            checked={includeUpcoming}
            className="h-4 w-4"
            type="checkbox"
            onChange={(event) =>
              onIncludeUpcomingChange(event.target.checked)
            }
          />
          예정 알림 포함
        </label>
      </div>
    </div>
  );
}

type NotificationListProps = {
  readonly isLoading: boolean;
  readonly items: readonly NotificationItem[];
  readonly pendingNotificationId: string | null;
  readonly onMarkRead: (notification: NotificationItem) => void;
};

// 기능 : 알림 목록의 loading, empty, row 상태를 렌더링합니다.
function NotificationList({
  isLoading,
  items,
  pendingNotificationId,
  onMarkRead,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          불러오는 중
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        새 알림이 생기면 여기에서 볼 수 있어요.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {items.map((notification) => (
        <NotificationRow
          key={notification.id}
          isPending={pendingNotificationId === notification.id}
          notification={notification}
          onMarkRead={() => onMarkRead(notification)}
        />
      ))}
    </div>
  );
}

type NotificationRowProps = {
  readonly isPending: boolean;
  readonly notification: NotificationItem;
  readonly onMarkRead: () => void;
};

// 기능 : 단일 알림 row와 관련 기록 이동/읽음 action을 렌더링합니다.
function NotificationRow({
  isPending,
  notification,
  onMarkRead,
}: NotificationRowProps) {
  const isUnread = notification.readAt === null;

  return (
    <article
      className={`grid gap-3 rounded-lg border p-4 ${
        isUnread ? "border-primary/40 bg-primary/5" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-sm font-semibold">
              {notification.title}
            </h3>
            <TypeBadge type={notification.type} />
            <SourceBadge sourceType={notification.sourceType} />
            <StatusBadge notification={notification} />
          </div>
          {notification.body ? (
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {notification.body}
            </p>
          ) : null}
          {notification.targetLabel ? (
            <p className="mt-1 text-xs font-medium text-slate-500">
              관련 기록: {notification.targetLabel}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            className="inline-flex min-h-9 items-center justify-center rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-muted"
            to={notification.targetPath}
          >
            관련 기록 열기
          </Link>
          <button
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isUnread || isPending}
            type="button"
            onClick={onMarkRead}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            읽음
          </button>
        </div>
      </div>

      <dl className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
        <InfoItem
          label="예정"
          value={formatDateWithOptions(notification.scheduledAt, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />
        <InfoItem
          label="발송"
          value={
            notification.sentAt
              ? formatDateWithOptions(notification.sentAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "-"
          }
        />
        <InfoItem
          label="읽음"
          value={
            notification.readAt
              ? formatDateWithOptions(notification.readAt, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "-"
          }
        />
      </dl>
    </article>
  );
}

type PaginationControlsProps = {
  readonly page: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly onNext: () => void;
  readonly onPrev: () => void;
};

// 기능 : 알림 목록 page 이동 버튼과 현재 page 정보를 렌더링합니다.
function PaginationControls({
  page,
  totalCount,
  totalPages,
  onNext,
  onPrev,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">
        {totalCount}개 · {page} / {safeTotalPages}페이지
      </span>
      <div className="flex gap-2">
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={page <= 1}
          type="button"
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          이전
        </button>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          disabled={page >= safeTotalPages}
          type="button"
          onClick={onNext}
        >
          다음
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

type InfoItemProps = {
  readonly label: string;
  readonly value: string;
};

// 기능 : 알림 화면의 짧은 label-value 상태 정보를 렌더링합니다.
function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="grid gap-1 rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

// 기능 : 알림 읽음 상태 badge를 렌더링합니다.
function StatusBadge({
  notification,
}: {
  readonly notification: NotificationItem;
}) {
  const read = notification.readAt !== null;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${
        read
          ? "border-slate-200 bg-slate-50 text-slate-600"
          : "border-primary/30 bg-primary/10 text-primary"
      }`}
    >
      {read ? "읽음" : "안읽음"}
    </span>
  );
}

// 기능 : 알림 type code를 사용자용 badge로 렌더링합니다.
function TypeBadge({ type }: { readonly type: NotificationItem["type"] }) {
  return (
    <span className="inline-flex items-center rounded-md border bg-white px-2 py-1 text-xs font-semibold text-slate-700">
      {getNotificationTypeLabel(type)}
    </span>
  );
}

// 기능 : 알림 source type code를 사용자용 badge로 렌더링합니다.
function SourceBadge({
  sourceType,
}: {
  readonly sourceType: NotificationItem["sourceType"];
}) {
  return (
    <span className="inline-flex items-center rounded-md border bg-white px-2 py-1 text-xs font-semibold text-slate-700">
      {getSourceTypeLabel(sourceType)}
    </span>
  );
}

// 기능 : 알림 type code를 화면 label로 변환합니다.
function getNotificationTypeLabel(type: NotificationItem["type"]) {
  switch (type) {
    case "SCHEDULE_START_REMINDER":
      return "일정 reminder";
    case "DEAL_DUE_REMINDER":
      return "딜 마감 reminder";
    default:
      return "알림";
  }
}

// 기능 : 알림 source type code를 화면 label로 변환합니다.
function getSourceTypeLabel(sourceType: NotificationItem["sourceType"]) {
  switch (sourceType) {
    case "SCHEDULE":
      return "일정";
    case "DEAL":
      return "딜";
    default:
      return "기록";
  }
}

// 기능 : 알림 화면 상단의 오류 메시지를 렌더링합니다.
function ErrorMessage({ message }: { readonly message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}
