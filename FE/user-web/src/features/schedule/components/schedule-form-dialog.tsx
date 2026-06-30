import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  Check,
  Globe2,
  MapPin,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useCreateScheduleMutation,
  useDeleteScheduleMutation,
  useUpdateScheduleMutation,
} from "@/features/schedule/hooks/use-schedule-mutations";
import {
  useScheduleDealOptions,
  useScheduleDetail,
} from "@/features/schedule/hooks/use-schedule-queries";
import {
  emptyScheduleFormValues,
  getDefaultScheduleTimeZone,
  scheduleFormSchema,
  toCreateScheduleInput,
  toDateTimeLocalValue,
  toScheduleFormValues,
  toUpdateScheduleInput,
  type ScheduleFormValues,
} from "@/features/schedule/schemas/schedule-schema";
import type {
  Schedule,
  ScheduleDealOption,
} from "@/features/schedule/types/schedule";
import { getApiErrorMessage } from "@/lib/api-client";

type ScheduleFormDialogProps = {
  readonly open: boolean;
  readonly schedule: Schedule | null;
  readonly initialStartAt: Date | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSaved: (message: string) => void;
};

const fixedTimeZoneOptions = [
  "Asia/Seoul",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Asia/Singapore",
  "UTC",
];

export function ScheduleFormDialog({
  open,
  schedule,
  initialStartAt,
  onOpenChange,
  onSaved,
}: ScheduleFormDialogProps) {
  const scheduleId = schedule?.id ?? "";
  const detailQuery = useScheduleDetail(scheduleId, open && Boolean(schedule));
  const dealOptionsQuery = useScheduleDealOptions();
  const createScheduleMutation = useCreateScheduleMutation();
  const updateScheduleMutation = useUpdateScheduleMutation();
  const deleteScheduleMutation = useDeleteScheduleMutation();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: emptyScheduleFormValues,
  });
  const watchedDealIds = useWatch({ control, name: "dealIds" });
  const dealIds = useMemo(() => watchedDealIds ?? [], [watchedDealIds]);
  const dealSearch = useWatch({ control, name: "dealSearch" }) ?? "";
  const timeZone = useWatch({ control, name: "timeZone" }) ?? "";
  const isEdit = Boolean(schedule);
  const mergedDealOptions = useMergedDealOptions(
    dealOptionsQuery.data?.items ?? [],
    detailQuery.data ?? schedule
  );
  const selectedDealIds = useMemo(() => new Set(dealIds), [dealIds]);
  const filteredDealOptions = useMemo(
    () => filterDealOptions(mergedDealOptions, dealSearch),
    [dealSearch, mergedDealOptions]
  );
  const selectedDeals = useMemo(
    () => mergedDealOptions.filter((deal) => selectedDealIds.has(deal.id)),
    [mergedDealOptions, selectedDealIds]
  );
  const timeZoneOptions = useMemo(
    () => getTimeZoneOptions(timeZone, schedule?.timeZone),
    [schedule?.timeZone, timeZone]
  );
  const actionError =
    createScheduleMutation.error ??
    updateScheduleMutation.error ??
    deleteScheduleMutation.error ??
    detailQuery.error ??
    null;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEdit) {
      reset(toScheduleFormValues(detailQuery.data ?? null, schedule));
      return;
    }

    reset(getCreateDefaults(initialStartAt));
  }, [detailQuery.data, initialStartAt, isEdit, open, reset, schedule]);

  if (!open) {
    return null;
  }

  const onSubmit = handleSubmit(async (values) => {
    if (schedule) {
      const updated = await updateScheduleMutation.mutateAsync(
        toUpdateScheduleInput(schedule.id, values)
      );
      onSaved(`${updated.scheduleTitle} 일정을 수정했어요.`);
    } else {
      const created = await createScheduleMutation.mutateAsync(
        toCreateScheduleInput(values)
      );
      onSaved(`${created.scheduleTitle} 일정을 만들었어요.`);
    }

    onOpenChange(false);
  });

  const onDelete = async () => {
    if (!schedule) {
      return;
    }

    try {
      await deleteScheduleMutation.mutateAsync(schedule.id);
      setDeleteConfirmOpen(false);
      onSaved(`${schedule.scheduleTitle} 일정을 삭제했어요.`);
      onOpenChange(false);
    } catch {
      // React Query keeps the mutation error for the dialog message.
    }
  };

  const toggleDeal = (dealId: string) => {
    const next = selectedDealIds.has(dealId)
      ? dealIds.filter((item) => item !== dealId)
      : [...dealIds, dealId];

    setValue("dealIds", next, { shouldDirty: true, shouldValidate: true });
  };

  const removeDeal = (dealId: string) => {
    setValue(
      "dealIds",
      dealIds.filter((item) => item !== dealId),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-6">
        <section
          aria-modal="true"
          className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-white shadow-xl"
          role="dialog"
        >
          <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">
                {isEdit ? "일정 수정" : "일정 생성"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                일정 시간과 연결 딜을 저장해요.
              </p>
            </div>
            <button
              aria-label="닫기"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md border text-muted-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

        <form className="overflow-y-auto px-5 py-5" onSubmit={onSubmit}>
          <div className="grid gap-5">
            {actionError ? (
              <p className="rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
                {getApiErrorMessage(actionError)}
              </p>
            ) : null}

            <TextField
              errorMessage={errors.scheduleTitle?.message}
              id="schedule-title"
              label="제목"
              register={register("scheduleTitle")}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <DateTimeField
                errorMessage={errors.startAt?.message}
                id="schedule-start"
                label="시작일시"
                register={register("startAt")}
              />
              <DateTimeField
                errorMessage={errors.endAt?.message}
                id="schedule-end"
                label="종료일시"
                register={register("endAt")}
              />
            </div>

            <TimeZoneField
              errorMessage={errors.timeZone?.message}
              options={timeZoneOptions}
              register={register("timeZone")}
            />

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="schedule-location">
                장소
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  id="schedule-location"
                  {...register("location")}
                />
              </div>
            </div>

            <DealMultiSelect
              errorMessage={errors.dealIds?.message}
              isLoading={dealOptionsQuery.isFetching}
              onRemove={removeDeal}
              onSearchChange={(value) =>
                setValue("dealSearch", value, { shouldDirty: true })
              }
              onToggle={toggleDeal}
              options={filteredDealOptions}
              search={dealSearch}
              selectedDealIds={selectedDealIds}
              selectedDeals={selectedDeals}
            />

            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="schedule-memo">
                메모
              </label>
              <textarea
                aria-describedby={errors.memo ? "schedule-memo-error" : undefined}
                aria-invalid={Boolean(errors.memo)}
                className="min-h-28 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id="schedule-memo"
                {...register("memo")}
              />
              {errors.memo ? (
                <p className="text-xs text-destructive" id="schedule-memo-error">
                  {errors.memo.message}
                </p>
              ) : null}
            </div>
          </div>

          <footer className="mt-6 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            {schedule ? (
              <button
                className="inline-flex h-11 w-fit items-center gap-2 rounded-md border border-destructive/40 px-4 text-sm font-medium text-destructive hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleteScheduleMutation.isPending}
                onClick={() => setDeleteConfirmOpen(true)}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                삭제
              </button>
            ) : (
              <span />
            )}
            <div className="flex justify-end gap-2">
              <button
                className="h-11 rounded-md border px-4 text-sm font-medium hover:bg-muted"
                onClick={() => onOpenChange(false)}
                type="button"
              >
              닫기
              </button>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  createScheduleMutation.isPending ||
                  updateScheduleMutation.isPending
                }
                type="submit"
              >
                <CalendarClock className="h-4 w-4" />
                저장
              </button>
            </div>
          </footer>
        </form>
        </section>
      </div>
      <ConfirmDialog
        cancelLabel="닫기"
        confirmLabel="삭제"
        errorMessage={
          deleteScheduleMutation.error
            ? getApiErrorMessage(deleteScheduleMutation.error)
            : null
        }
        isPending={deleteScheduleMutation.isPending}
        onCancel={() => {
          if (!deleteScheduleMutation.isPending) {
            setDeleteConfirmOpen(false);
          }
        }}
        onConfirm={() => void onDelete()}
        open={deleteConfirmOpen}
        title={`${schedule?.scheduleTitle ?? "일정"} 일정을 삭제할까요?`}
      />
    </>
  );
}

type TextFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly errorMessage?: string;
  readonly register: UseFormRegisterReturn;
};

function TextField({ id, label, errorMessage, register }: TextFieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        {...register}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

type DateTimeFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly errorMessage?: string;
  readonly register: UseFormRegisterReturn;
};

function DateTimeField({
  id,
  label,
  errorMessage,
  register,
}: DateTimeFieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        type="datetime-local"
        {...register}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function TimeZoneField({
  errorMessage,
  options,
  register,
}: {
  readonly errorMessage?: string;
  readonly options: string[];
  readonly register: UseFormRegisterReturn;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor="schedule-timezone">
        시간대
      </label>
      <div className="relative">
        <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          aria-describedby={errorMessage ? "schedule-timezone-error" : undefined}
          aria-invalid={Boolean(errorMessage)}
          className="h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="schedule-timezone"
          {...register}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {errorMessage ? (
        <p className="text-xs text-destructive" id="schedule-timezone-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function DealMultiSelect({
  errorMessage,
  isLoading,
  onRemove,
  onSearchChange,
  onToggle,
  options,
  search,
  selectedDealIds,
  selectedDeals,
}: {
  readonly errorMessage?: string;
  readonly isLoading: boolean;
  readonly onRemove: (dealId: string) => void;
  readonly onSearchChange: (value: string) => void;
  readonly onToggle: (dealId: string) => void;
  readonly options: ScheduleDealOption[];
  readonly search: string;
  readonly selectedDealIds: ReadonlySet<string>;
  readonly selectedDeals: ScheduleDealOption[];
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor="schedule-deal-search">
        연결 딜
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          id="schedule-deal-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="딜 제목 검색"
          value={search}
        />
      </div>

      {selectedDeals.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedDeals.map((deal) => (
            <span
              className="inline-flex h-8 items-center gap-2 rounded-md bg-sky-50 px-2 text-xs font-medium text-sky-900"
              key={deal.id}
            >
              {deal.dealName}
              <button
                aria-label={`${deal.dealName} 연결 해제`}
                className="grid h-5 w-5 place-items-center rounded hover:bg-sky-100"
                onClick={() => onRemove(deal.id)}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="max-h-48 overflow-y-auto rounded-md border">
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            딜을 불러오고 있어요.
          </p>
        ) : options.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            딜을 만들면 연결할 수 있어요.
          </p>
        ) : (
          options.map((deal) => {
            const selected = selectedDealIds.has(deal.id);

            return (
              <button
                className={`flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted ${
                  selected ? "bg-sky-50" : "bg-white"
                }`}
                key={deal.id}
                onClick={() => onToggle(deal.id)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {deal.dealName}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatDealCreatedAt(deal)}
                  </span>
                </span>
                {selected ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
            );
          })
        )}
      </div>
      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function useMergedDealOptions(
  options: ScheduleDealOption[],
  schedule: Schedule | null
) {
  return useMemo(() => {
    const byId = new Map<string, ScheduleDealOption>();

    for (const option of options) {
      byId.set(option.id, option);
    }

    for (const deal of schedule?.deals ?? []) {
      if (!byId.has(deal.id)) {
        byId.set(deal.id, {
          id: deal.id,
          dealName: deal.dealName,
          createdAt: "",
        });
      }
    }

    return [...byId.values()];
  }, [options, schedule?.deals]);
}

function filterDealOptions(options: ScheduleDealOption[], search: string) {
  const normalized = search.trim().toLowerCase();

  if (!normalized) {
    return options;
  }

  return options.filter((deal) =>
    deal.dealName.toLowerCase().includes(normalized)
  );
}

function getCreateDefaults(initialStartAt: Date | null): ScheduleFormValues {
  const timeZone = getDefaultScheduleTimeZone();
  const startAt = initialStartAt ?? getNextHour();
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

  return {
    ...emptyScheduleFormValues,
    timeZone,
    startAt: toDateTimeLocalValue(startAt, timeZone),
    endAt: toDateTimeLocalValue(endAt, timeZone),
  };
}

function getNextHour() {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);

  return date;
}

function getTimeZoneOptions(currentTimeZone: string, scheduleTimeZone?: string) {
  return [
    currentTimeZone || getDefaultScheduleTimeZone(),
    scheduleTimeZone ?? "",
    ...fixedTimeZoneOptions,
  ].filter((option, index, options) => option && options.indexOf(option) === index);
}

function formatDealCreatedAt(deal: ScheduleDealOption) {
  return deal.createdAt ? `등록일 ${deal.createdAt.slice(0, 10)}` : "연결된 딜";
}
