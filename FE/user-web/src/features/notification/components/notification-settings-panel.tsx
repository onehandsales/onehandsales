import { Loader2, Save, Settings, ShieldCheck } from "lucide-react";
import type { UserNotificationSetting } from "@/features/notification/types/notification";

export type NotificationSettingsPanelProps = {
  readonly isPending: boolean;
  readonly settings: UserNotificationSetting | null;
  readonly onChange: (settings: UserNotificationSetting) => void;
  readonly onSave: () => void;
};

// 기능 : 서비스 알림 설정과 마케팅 알림 분리 안내를 렌더링합니다.
export function NotificationSettingsPanel({
  isPending,
  settings,
  onChange,
  onSave,
}: NotificationSettingsPanelProps) {
  const controlsDisabled = isPending || settings === null;
  const resolvedSettings: UserNotificationSetting = {
    scheduleReminderEnabled: settings?.scheduleReminderEnabled ?? true,
    dealDueReminderEnabled: settings?.dealDueReminderEnabled ?? true,
    emailNotificationEnabled: settings?.emailNotificationEnabled ?? true,
    browserPushEnabled: settings?.browserPushEnabled ?? false,
    scheduleReminderMinutes: settings?.scheduleReminderMinutes ?? 30,
    dealDueReminderDaysBefore: settings?.dealDueReminderDaysBefore ?? 1,
    dealDueReminderLocalTime: settings?.dealDueReminderLocalTime ?? "09:00",
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-[#6B7280]" aria-hidden="true" />
        <h2 className="text-[16px] font-semibold text-[#111827]">서비스 알림</h2>
      </div>

      <div className="grid gap-2 rounded-md border border-[#E5E7EB] bg-[#FAFAF8] p-3 text-[14px]">
        <span className="font-medium text-[#111827]">기본 reminder 시간</span>
        <span className="text-[12px] leading-5 text-[#6B7280]">
          일정은 시작 {resolvedSettings.scheduleReminderMinutes}분 전, 딜은 마감{" "}
          {resolvedSettings.dealDueReminderDaysBefore}일 전{" "}
          {resolvedSettings.dealDueReminderLocalTime}에 알려줘요.
        </span>
      </div>

      <label className="flex items-start gap-3 rounded-md border border-[#E5E7EB] bg-[#FAFAF8] p-3">
        <input
          checked={resolvedSettings.scheduleReminderEnabled}
          className="mt-1 h-4 w-4 accent-[#111827]"
          disabled={controlsDisabled}
          type="checkbox"
          onChange={(event) =>
            onChange({
              ...resolvedSettings,
              scheduleReminderEnabled: event.target.checked,
            })
          }
        />
        <span className="grid gap-1">
          <span className="text-[14px] font-semibold text-[#111827]">일정 시작 알림</span>
          <span className="text-[12px] leading-5 text-[#6B7280]">
            일정 시작 전에 앱 안 알림을 만들어요.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-md border border-[#E5E7EB] bg-[#FAFAF8] p-3">
        <input
          checked={resolvedSettings.dealDueReminderEnabled}
          className="mt-1 h-4 w-4 accent-[#111827]"
          disabled={controlsDisabled}
          type="checkbox"
          onChange={(event) =>
            onChange({
              ...resolvedSettings,
              dealDueReminderEnabled: event.target.checked,
            })
          }
        />
        <span className="grid gap-1">
          <span className="text-[14px] font-semibold text-[#111827]">딜 마감 알림</span>
          <span className="text-[12px] leading-5 text-[#6B7280]">
            마감일이 가까운 딜을 업무 reminder로 보여줘요.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 rounded-md border border-[#E5E7EB] bg-[#FAFAF8] p-3">
        <input
          checked={resolvedSettings.emailNotificationEnabled}
          className="mt-1 h-4 w-4 accent-[#111827]"
          disabled={controlsDisabled}
          type="checkbox"
          onChange={(event) =>
            onChange({
              ...resolvedSettings,
              emailNotificationEnabled: event.target.checked,
            })
          }
        />
        <span className="grid gap-1">
          <span className="text-[14px] font-semibold text-[#111827]">이메일 알림</span>
          <span className="text-[12px] leading-5 text-[#6B7280]">
            이메일 발송 대상에 포함해요.
          </span>
        </span>
      </label>

      <div className="flex items-start gap-3 rounded-md border border-[#E5E7EB] bg-white p-3">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-[#6B7280]"
          aria-hidden="true"
        />
        <span className="grid gap-1">
          <span className="text-[14px] font-semibold text-[#111827]">마케팅 알림</span>
          <span className="text-[12px] leading-5 text-[#6B7280]">
            광고성 알림은 별도 동의가 필요해요. 여기서는 회의와 딜 같은
            서비스 알림만 설정해요.
          </span>
        </span>
      </div>

      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1F2937] active:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        disabled={controlsDisabled}
        type="button"
        onClick={onSave}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="h-4 w-4" aria-hidden="true" />
        )}
        저장
      </button>
    </div>
  );
}
