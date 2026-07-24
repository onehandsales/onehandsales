import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { useRetryFollowUpMessageMutation } from "@/features/follow-up-delivery/hooks/use-follow-up-delivery-mutations";
import {
  useFollowUpMessageDetail,
  useFollowUpMessageList,
} from "@/features/follow-up-delivery/hooks/use-follow-up-delivery-queries";
import type {
  FollowUpMessage,
  FollowUpMessageListItem,
  FollowUpTargetType,
} from "@/features/follow-up-delivery/types/follow-up-delivery";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";

type FollowUpTimelinePanelProps = {
  readonly sourceReportId?: string;
  readonly targetType?: FollowUpTargetType;
  readonly targetId?: string;
  readonly title?: string;
  readonly className?: string;
};

export function FollowUpTimelinePanel({
  className,
  sourceReportId,
  targetId,
  targetType,
  title = "후속 연락 이력",
}: FollowUpTimelinePanelProps) {
  const [page, setPage] = useState(1);
  const params = useMemo(
    () => ({
      page,
      sourceReportId: sourceReportId ?? null,
      targetId: targetId ?? null,
      targetType: targetType ?? null,
    }),
    [page, sourceReportId, targetId, targetType]
  );
  const listQuery = useFollowUpMessageList(params, {
    enabled: Boolean(sourceReportId || (targetType && targetId)),
  });
  const pageData = listQuery.data;

  return (
    <section
      className={cn(
        "flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white",
        className
      )}
    >
      <div className="flex h-[48px] shrink-0 items-center gap-2 border-b border-[#E5E7EB] px-4">
        <MessageSquareText className="h-4 w-4 text-[#4880EE]" />
        <span className="text-[14px] font-extrabold text-[#111827]">
          {title}
        </span>
        <span className="text-[13px] font-semibold text-[#9CA3AF]">
          {(pageData?.totalCount ?? 0).toLocaleString("ko-KR")}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-3 pt-2">
        {listQuery.isLoading ? (
          <TimelineSkeleton />
        ) : listQuery.isError ? (
          <InlineError
            error={listQuery.error}
            onRetry={() => void listQuery.refetch()}
          />
        ) : !pageData || pageData.items.length === 0 ? (
          <p className="py-2 text-[13px] text-[#9CA3AF]">
            아직 후속 연락 이력이 없어요.
          </p>
        ) : (
          <div className="flex flex-col">
            {pageData.items.map((message, index) => (
              <FollowUpTimelineItem
                isFirst={index === 0}
                isLast={index === pageData.items.length - 1}
                key={message.id}
                message={message}
              />
            ))}
          </div>
        )}
      </div>

      {pageData && pageData.totalPages > 1 ? (
        <Pagination
          page={pageData.page}
          totalCount={pageData.totalCount}
          totalPages={pageData.totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </section>
  );
}

function FollowUpTimelineItem({
  isFirst,
  isLast,
  message,
}: {
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly message: FollowUpMessageListItem;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const detailQuery = useFollowUpMessageDetail(message.id, { enabled: isOpen });
  const retryMutation = useRetryFollowUpMessageMutation();

  const retry = async () => {
    setRetryError(null);

    try {
      await retryMutation.mutateAsync(message.id);
    } catch (error) {
      setRetryError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="group flex gap-3">
      <TimelineMarker isFirst={isFirst} isLast={isLast} />
      <article className="min-w-0 flex-1 border-b border-[#F3F4F6] py-2 last:border-b-0">
        <button
          aria-expanded={isOpen}
          className="flex min-h-[40px] w-full min-w-0 items-center gap-2 bg-white text-left"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <ChannelIcon channel={message.channel} />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate text-[13px] font-semibold text-[#111827]">
                {message.subject ?? message.bodyPreview}
              </span>
              <StatusBadge status={message.status} />
            </span>
            <span className="mt-0.5 block truncate text-[12px] text-[#64748B]">
              {toChannelLabel(message.channel)} · {message.recipient.name} ·{" "}
              {formatMessageTime(message)}
            </span>
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
          )}
        </button>

        {isOpen ? (
          <div className="grid gap-3 pb-2 pl-7 pt-2">
            <p className="whitespace-pre-wrap break-words text-[13px] leading-5 text-[#374151]">
              {detailQuery.isLoading
                ? "본문을 불러오고 있어요."
                : detailQuery.isError
                  ? "본문을 불러오지 못했어요."
                  : detailQuery.data?.body ?? message.bodyPreview}
            </p>
            <TargetLinks message={detailQuery.data ?? message} />
            {message.safeErrorMessage ? (
              <InlineAlert message={message.safeErrorMessage} />
            ) : null}
            {retryError ? <InlineAlert message={retryError} /> : null}
            {message.status === "FAILED" && message.retryable ? (
              <div className="flex justify-end">
                <Button
                  disabled={retryMutation.isPending}
                  isPending={retryMutation.isPending}
                  onClick={() => void retry()}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  재시도
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    </div>
  );
}

function TargetLinks({
  message,
}: {
  readonly message: FollowUpMessage | FollowUpMessageListItem;
}) {
  const visibleTargets = message.targets.filter(
    (target) => target.targetType !== "AI_WEEKLY_REPORT"
  );

  if (visibleTargets.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleTargets.map((target) => (
        <Link
          className="rounded border border-[#D7DCE5] bg-white px-2 py-1 text-[11px] font-semibold text-[#475569] transition hover:border-[#93C5FD] hover:text-[#1D4ED8]"
          key={`${target.targetType}-${target.targetId}`}
          to={normalizeTargetPath(target.targetPath)}
        >
          {target.targetLabel ?? toTargetTypeLabel(target.targetType)}
        </Link>
      ))}
    </div>
  );
}

function TimelineMarker({
  isFirst,
  isLast,
}: {
  readonly isFirst: boolean;
  readonly isLast: boolean;
}) {
  return (
    <div className="relative flex w-[8px] shrink-0 self-stretch items-start justify-center pt-[18px]">
      {!isFirst ? (
        <div className="absolute left-1/2 top-0 h-[22px] w-px -translate-x-1/2 bg-[#DBEAFE]" />
      ) : null}
      {!isLast ? (
        <div className="absolute bottom-0 left-1/2 top-[22px] w-px -translate-x-1/2 bg-[#DBEAFE]" />
      ) : null}
      <div className="relative h-[8px] w-[8px] rounded-full bg-[#4880EE]" />
    </div>
  );
}

function ChannelIcon({
  channel,
}: {
  readonly channel: FollowUpMessageListItem["channel"];
}) {
  const Icon = channel === "EMAIL" ? Mail : MessageSquareText;

  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#EEF2FF] text-[#2563EB]">
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

function StatusBadge({
  status,
}: {
  readonly status: FollowUpMessageListItem["status"];
}) {
  const className = {
    DRAFT: "bg-[#EFF6FF] text-[#1D4ED8]",
    FAILED: "bg-[#FEF2F2] text-[#B91C1C]",
    SENDING: "bg-[#FFFBEB] text-[#B45309]",
    SENT: "bg-[#F0FDF4] text-[#047857]",
  }[status];

  return (
    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${className}`}>
      {toStatusLabel(status)}
    </span>
  );
}

function TimelineSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="h-12 animate-pulse rounded-md bg-muted" key={index} />
      ))}
    </div>
  );
}

function InlineError({
  error,
  onRetry,
}: {
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <div className="grid justify-items-start gap-3 rounded-md border border-destructive/30 bg-red-50 px-3 py-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      </div>
      <Button onClick={onRetry} size="sm" type="button">
        다시 시도
      </Button>
    </div>
  );
}

function InlineAlert({ message }: { readonly message: string }) {
  return (
    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-700">
      {message}
    </p>
  );
}

function formatMessageTime(message: FollowUpMessageListItem) {
  return formatDateTime(message.sentAt ?? message.failedAt ?? message.createdAt, {
    includeYear: true,
  });
}

function toChannelLabel(channel: FollowUpMessageListItem["channel"]) {
  return channel === "EMAIL" ? "이메일" : "문자";
}

function toStatusLabel(status: FollowUpMessageListItem["status"]) {
  const labels = {
    DRAFT: "초안",
    FAILED: "실패",
    SENDING: "전송 중",
    SENT: "전송됨",
  } as const;

  return labels[status];
}

function toTargetTypeLabel(targetType: FollowUpTargetType) {
  const labels = {
    AI_WEEKLY_REPORT: "AI 리포트",
    CONTACT: "연락처",
    DEAL: "딜",
    MEETING_NOTE: "회의록",
    SCHEDULE: "일정",
  } as const;

  return labels[targetType];
}

function normalizeTargetPath(path: string) {
  if (path.startsWith("/app/")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `/app${path}`;
  }

  return "/app";
}
