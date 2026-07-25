// 기능 : 딜 상세의 정본 activity timeline과 수동 activity form을 렌더링합니다.
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  AlertCircle,
  CalendarClock,
  CheckSquare,
  CircleDot,
  Edit3,
  FileText,
  GitBranch,
  Link2,
  Mail,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Plus,
  Save,
  Send,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  ModalFieldGroup,
  ModalFooterActions,
  ModalForm,
  ModalFormRow,
  ModalFormSection,
} from "@/components/ui/modal-form";
import { ModalShell } from "@/components/ui/modal-shell";
import { useToast } from "@/components/ui/use-toast";
import { useDealActivities } from "@/features/deal/hooks/use-deal-detail";
import {
  useCreateManualDealActivityMutation,
  useUpdateManualDealActivityMutation,
} from "@/features/deal/hooks/use-deal-mutations";
import {
  createEmptyManualDealActivityFormValues,
  manualDealActivityFormSchema,
  toCreateManualDealActivityInput,
  toLocalDateTimeInputValue,
  toUpdateManualDealActivityInput,
  type ManualDealActivityFormValues,
} from "@/features/deal/schemas/deal-schema";
import {
  MANUAL_DEAL_ACTIVITY_TYPE_LABEL,
  MANUAL_DEAL_ACTIVITY_TYPES,
  type DealActivity,
  type DealActivityLinkedRecord,
  type DealActivityLinkedRecordTargetType,
  type DealActivitySourceType,
  type DealActivityType,
  type ManualDealActivityType,
} from "@/features/deal/types/deal";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/format";
import { normalizeInternalAppPath } from "@/utils/target-path";

type DealActivityTimelineSectionProps = {
  readonly dealId: string;
  readonly className?: string;
};

const ACTIVITY_TYPE_LABEL: Record<DealActivityType, string> = {
  CALL: "통화",
  DEAL_CREATED: "딜 생성",
  EMAIL: "이메일",
  FOLLOW_UP_FAILED: "후속 연락 실패",
  FOLLOW_UP_SENT: "후속 연락",
  MEETING: "미팅",
  MEETING_NOTE_LINKED: "회의록 연결",
  MEETING_NOTE_UNLINKED: "회의록 해제",
  NEXT_ACTION_COMPLETION_CHANGED: "다음 행동 변경",
  NEXT_ACTION_CREATED: "다음 행동",
  NOTE: "기타",
  SCHEDULE_LINKED: "일정 연결",
  SCHEDULE_UNLINKED: "일정 해제",
  STAGE_CHANGED: "단계 변경",
  VISIT: "방문",
};

const SOURCE_TYPE_LABEL: Record<DealActivitySourceType, string> = {
  FOLLOW_UP: "후속 연락",
  MEETING_NOTE: "회의록",
  NEXT_ACTION: "다음 행동",
  SCHEDULE: "일정",
  SYSTEM: "자동",
  USER: "수동",
};

const LINKED_RECORD_LABEL: Record<DealActivityLinkedRecordTargetType, string> = {
  COMPANY: "회사",
  CONTACT: "담당자",
  DEAL: "딜",
  FOLLOW_UP_MESSAGE: "후속 연락",
  MEETING_NOTE: "회의록",
  PRODUCT: "제품",
  SCHEDULE: "일정",
};

// 기능 : 딜 활동 timeline의 loading/error/empty/success 상태를 한곳에서 처리합니다.
export function DealActivityTimelineSection({
  className,
  dealId,
}: DealActivityTimelineSectionProps) {
  const activityQuery = useDealActivities(dealId);
  const createMutation = useCreateManualDealActivityMutation();
  const updateMutation = useUpdateManualDealActivityMutation();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DealActivity | null>(null);
  const { toast, node: toastNode } = useToast();
  const activities =
    activityQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const openCreate = () => {
    createMutation.reset();
    setCreateOpen(true);
  };

  const openEdit = (activity: DealActivity) => {
    updateMutation.reset();
    setEditingActivity(activity);
  };

  const createActivity = async (values: ManualDealActivityFormValues) => {
    try {
      await createMutation.mutateAsync(
        toCreateManualDealActivityInput(dealId, values)
      );
      setCreateOpen(false);
      toast({ message: "활동을 남겼어요.", variant: "success" });
    } catch {
      return;
    }
  };

  const updateActivity = async (values: ManualDealActivityFormValues) => {
    if (!editingActivity) {
      return;
    }

    try {
      await updateMutation.mutateAsync(
        toUpdateManualDealActivityInput(dealId, editingActivity.id, values)
      );
      setEditingActivity(null);
      toast({ message: "활동을 저장했어요.", variant: "success" });
    } catch {
      return;
    }
  };

  return (
    <>
      {toastNode}
      <section
        aria-label="딜 활동"
        className={cn(
          "flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white",
          className
        )}
      >
        <div className="flex min-h-[52px] shrink-0 flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-4 py-2">
          <Activity className="h-4 w-4 shrink-0 text-[#4880EE]" />
          <span className="text-[15px] font-extrabold text-[#111827]">
            딜 활동
          </span>
          <span className="text-[13px] font-semibold text-[#9CA3AF]">
            {activities.length.toLocaleString("ko-KR")}
          </span>
          <div className="min-w-0 flex-1" />
          <button
            aria-label="활동 추가"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#4880EE] px-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
            onClick={openCreate}
            type="button"
          >
            <Plus className="h-3.5 w-3.5" />
            활동 추가
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-2">
          {activityQuery.isLoading ? (
            <DealActivityLoadingState />
          ) : activityQuery.isError ? (
            <DealActivityErrorState onRetry={() => void activityQuery.refetch()} />
          ) : activities.length === 0 ? (
            <p className="py-2 text-[13px] text-[#9CA3AF]">
              활동을 남기면 딜 진행 흐름을 여기에서 볼 수 있어요.
            </p>
          ) : (
            <div className="flex flex-col">
              {activities.map((activity, index) => (
                <DealActivityItem
                  activity={activity}
                  isFirst={index === 0}
                  isLast={index === activities.length - 1}
                  key={activity.id}
                  onEdit={openEdit}
                />
              ))}
            </div>
          )}

          {!activityQuery.isLoading && activityQuery.hasNextPage ? (
            <button
              className="mt-2 inline-flex h-8 w-full items-center justify-center rounded-md border border-[#E5EAF0] bg-white text-[12px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={activityQuery.isFetchingNextPage}
              onClick={() => void activityQuery.fetchNextPage()}
              type="button"
            >
              {activityQuery.isFetchingNextPage ? "불러오는 중" : "더 보기"}
            </button>
          ) : null}
        </div>
      </section>

      <DealActivityFormDialog
        mode="create"
        open={createOpen}
        submitError={
          createMutation.error ? getApiErrorMessage(createMutation.error) : null
        }
        isSubmitting={createMutation.isPending}
        onOpenChange={setCreateOpen}
        onSubmit={createActivity}
      />

      <DealActivityFormDialog
        activity={editingActivity}
        mode="edit"
        open={editingActivity !== null}
        submitError={
          updateMutation.error ? getApiErrorMessage(updateMutation.error) : null
        }
        isSubmitting={updateMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setEditingActivity(null);
          }
        }}
        onSubmit={updateActivity}
      />
    </>
  );
}

function DealActivityItem({
  activity,
  isFirst,
  isLast,
  onEdit,
}: {
  readonly activity: DealActivity;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly onEdit: (activity: DealActivity) => void;
}) {
  const Icon = getActivityIcon(activity.activityType);
  const body = activity.sourceType === "USER" ? activity.body : null;
  const canEdit = activity.sourceType === "USER" && activity.isEditable;

  return (
    <div className="group flex gap-3">
      <DealActivityTimelineMarker isFirst={isFirst} isLast={isLast} />
      <article className="min-w-0 flex-1 border-b border-[#F3F4F6] py-3 last:border-b-0">
        <div className="flex min-w-0 items-start gap-3">
          <span className={getActivityIconClassName(activity.activityType)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1">
              <h3 className="min-w-[180px] flex-1 break-words text-[13px] font-semibold leading-5 text-[#111827]">
                {activity.title}
              </h3>
              <span className="shrink-0 pt-0.5 text-[11px] font-bold text-[#9CA3AF]">
                {formatDateTime(activity.occurredAt, { includeYear: true })}
              </span>
              {canEdit ? (
                <button
                  aria-label="활동 수정"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#64748B] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
                  onClick={() => onEdit(activity)}
                  title="활동 수정"
                  type="button"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
              <ActivityBadge label={ACTIVITY_TYPE_LABEL[activity.activityType]} />
              <ActivityBadge label={SOURCE_TYPE_LABEL[activity.sourceType]} />
            </div>

            {activity.summary ? (
              <p className="mt-2 break-words text-[13px] leading-5 text-[#475569]">
                {activity.summary}
              </p>
            ) : null}
            {body ? (
              <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-[#F9FAFB] px-3 py-2 text-[13px] leading-5 text-[#374151]">
                {body}
              </p>
            ) : null}
            <LinkedRecordLinks records={activity.linkedRecords} />
          </div>
        </div>
      </article>
    </div>
  );
}

function DealActivityFormDialog({
  activity,
  isSubmitting,
  mode,
  open,
  submitError,
  onOpenChange,
  onSubmit,
}: {
  readonly activity?: DealActivity | null;
  readonly isSubmitting: boolean;
  readonly mode: "create" | "edit";
  readonly open: boolean;
  readonly submitError: string | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit: (values: ManualDealActivityFormValues) => Promise<void>;
}) {
  const formId =
    mode === "create"
      ? "deal-activity-create-form"
      : "deal-activity-edit-form";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualDealActivityFormValues>({
    resolver: zodResolver(manualDealActivityFormSchema),
    defaultValues: createManualDealActivityFormValues(activity),
  });

  useEffect(() => {
    if (open) {
      reset(createManualDealActivityFormValues(activity));
    }
  }, [activity, open, reset]);

  return (
    <ModalShell
      footer={
        <ModalFooterActions
          formId={formId}
          isSubmitting={isSubmitting}
          pendingLabel="저장 중"
          submitIcon={<Save className="h-4 w-4" />}
          submitLabel="저장"
          onCancel={() => onOpenChange(false)}
        />
      }
      open={open}
      placement="bottom"
      size="md"
      title={mode === "create" ? "활동 추가" : "활동 수정"}
      onOpenChange={onOpenChange}
    >
      <ModalForm id={formId} onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <ModalFormSection title="딜 활동">
          <ModalFormRow columns={2}>
            <ModalFieldGroup
              error={errors.activityType?.message}
              id={`${formId}-activity-type`}
              label="유형"
            >
              <select
                className="h-10 w-full rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-ring"
                id={`${formId}-activity-type`}
                {...register("activityType")}
              >
                {MANUAL_DEAL_ACTIVITY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {MANUAL_DEAL_ACTIVITY_TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
            </ModalFieldGroup>
            <ModalFieldGroup
              error={errors.occurredAt?.message}
              id={`${formId}-occurred-at`}
              label="발생 시각"
            >
              <input
                className="h-10 w-full rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-ring"
                id={`${formId}-occurred-at`}
                max={toLocalDateTimeInputValue()}
                type="datetime-local"
                {...register("occurredAt")}
              />
            </ModalFieldGroup>
          </ModalFormRow>
          <ModalFieldGroup
            error={errors.title?.message}
            id={`${formId}-title`}
            label="제목"
          >
            <input
              className="h-10 w-full rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-ring"
              id={`${formId}-title`}
              maxLength={120}
              placeholder="제목"
              {...register("title")}
            />
          </ModalFieldGroup>
          <ModalFieldGroup
            error={errors.body?.message}
            id={`${formId}-body`}
            label="내용"
          >
            <textarea
              className="min-h-28 w-full resize-y rounded-md border border-[#E2E5EC] bg-white px-3 py-2 text-sm outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-ring"
              id={`${formId}-body`}
              maxLength={2000}
              placeholder="내용"
              rows={5}
              {...register("body")}
            />
          </ModalFieldGroup>
        </ModalFormSection>
        {submitError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-[#B91C1C]">
            {submitError}
          </p>
        ) : null}
      </ModalForm>
    </ModalShell>
  );
}

function LinkedRecordLinks({
  records,
}: {
  readonly records: readonly DealActivityLinkedRecord[];
}) {
  if (records.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
      {records.map((record) => (
        <Link
          className="inline-flex max-w-full items-center gap-1 rounded-md border border-[#D7DCE5] bg-white px-2 py-1 text-[11px] font-semibold text-[#475569] transition hover:border-[#93C5FD] hover:text-[#1D4ED8]"
          key={`${record.targetType}-${record.targetId}`}
          to={normalizeInternalAppPath(record.targetPath)}
        >
          <Link2 className="h-3 w-3 shrink-0" />
          <span className="min-w-0 truncate">
            {record.targetLabel ?? LINKED_RECORD_LABEL[record.targetType]}
          </span>
        </Link>
      ))}
    </div>
  );
}

function DealActivityTimelineMarker({
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

function ActivityBadge({ label }: { readonly label: string }) {
  return (
    <span className="inline-flex h-5 max-w-full items-center rounded-md bg-[#F3F4F6] px-1.5 text-[11px] font-semibold text-[#64748B]">
      <span className="truncate">{label}</span>
    </span>
  );
}

function DealActivityLoadingState() {
  return (
    <div className="grid gap-3 py-2">
      <p className="text-[13px] text-[#9CA3AF]">딜 활동을 불러오고 있어요.</p>
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="h-14 animate-pulse rounded-md bg-muted" key={index} />
      ))}
    </div>
  );
}

function DealActivityErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="grid justify-items-start gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]" />
        <p className="text-[13px] font-medium text-[#B91C1C]">
          딜 활동을 불러오지 못했어요. 다시 시도해 주세요.
        </p>
      </div>
      <button
        className="inline-flex h-8 items-center rounded-md border border-red-200 bg-white px-3 text-[12px] font-semibold text-[#B91C1C] transition-colors hover:bg-red-50"
        onClick={onRetry}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}

function createManualDealActivityFormValues(
  activity?: DealActivity | null
): ManualDealActivityFormValues {
  if (!activity) {
    return createEmptyManualDealActivityFormValues();
  }

  return {
    activityType: toManualActivityType(activity.activityType),
    body: activity.body ?? "",
    occurredAt: toLocalDateTimeInputValue(activity.occurredAt),
    title: activity.title,
  };
}

function toManualActivityType(activityType: DealActivityType): ManualDealActivityType {
  return MANUAL_DEAL_ACTIVITY_TYPES.includes(
    activityType as ManualDealActivityType
  )
    ? (activityType as ManualDealActivityType)
    : "NOTE";
}

function getActivityIcon(activityType: DealActivityType): LucideIcon {
  switch (activityType) {
    case "CALL":
      return PhoneCall;
    case "MEETING":
      return UsersRound;
    case "EMAIL":
      return Mail;
    case "VISIT":
      return MapPin;
    case "NOTE":
      return FileText;
    case "STAGE_CHANGED":
      return GitBranch;
    case "NEXT_ACTION_CREATED":
    case "NEXT_ACTION_COMPLETION_CHANGED":
      return CheckSquare;
    case "SCHEDULE_LINKED":
    case "SCHEDULE_UNLINKED":
      return CalendarClock;
    case "MEETING_NOTE_LINKED":
    case "MEETING_NOTE_UNLINKED":
      return MessageSquareText;
    case "FOLLOW_UP_SENT":
    case "FOLLOW_UP_FAILED":
      return Send;
    case "DEAL_CREATED":
      return CircleDot;
  }
}

function getActivityIconClassName(activityType: DealActivityType) {
  const baseClassName =
    "grid h-7 w-7 shrink-0 place-items-center rounded-md";

  switch (activityType) {
    case "CALL":
    case "MEETING":
    case "EMAIL":
    case "VISIT":
    case "NOTE":
      return cn(baseClassName, "bg-[#EEF4FF] text-[#1F4EF5]");
    case "FOLLOW_UP_FAILED":
      return cn(baseClassName, "bg-[#FEF2F2] text-[#B91C1C]");
    case "FOLLOW_UP_SENT":
      return cn(baseClassName, "bg-[#F0FDF4] text-[#047857]");
    case "STAGE_CHANGED":
      return cn(baseClassName, "bg-[#FFF7ED] text-[#C2410C]");
    default:
      return cn(baseClassName, "bg-[#F8FAFC] text-[#475569]");
  }
}
