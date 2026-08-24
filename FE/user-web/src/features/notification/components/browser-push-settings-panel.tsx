import { Bell, Loader2, MonitorSmartphone, X } from "lucide-react";
import type { BrowserPushPermissionState } from "@/features/notification/types/notification";
import { getBrowserPushPermissionLabel } from "@/features/notification/utils/browser-push-permission";

export type BrowserPushSettingsPanelProps = {
  readonly browserPushEnabled: boolean;
  readonly hasPublicKeyError: boolean;
  readonly isPermissionFlowPending: boolean;
  readonly isRevoking: boolean;
  readonly permissionState: BrowserPushPermissionState;
  readonly pushSupported: boolean;
  readonly storedSubscriptionId: string;
  readonly onEnable: () => void;
  readonly onRevoke: () => void;
};

// 기능 : 브라우저 푸시 권한과 구독 상태를 렌더링합니다.
export function BrowserPushSettingsPanel({
  browserPushEnabled,
  hasPublicKeyError,
  isPermissionFlowPending,
  isRevoking,
  permissionState,
  pushSupported,
  storedSubscriptionId,
  onEnable,
  onRevoke,
}: BrowserPushSettingsPanelProps) {
  const isRegisteredOnThisDevice = Boolean(storedSubscriptionId);
  const canOpenPermissionDialog = pushSupported && permissionState !== "denied";
  const shouldShowMismatch =
    browserPushEnabled &&
    (!isRegisteredOnThisDevice || permissionState !== "granted");

  return (
    <div className="grid gap-4 border-t border-[#E5E7EB] pt-6">
      <div className="flex items-center gap-2">
        <MonitorSmartphone
          className="h-5 w-5 text-[#6B7280]"
          aria-hidden="true"
        />
        <h2 className="text-[20px] font-semibold text-[#111827]">브라우저 푸시</h2>
      </div>

      <div className="grid gap-2 text-[14px] sm:grid-cols-2">
        <BrowserPushInfoItem
          label="권한"
          value={getBrowserPushPermissionLabel(permissionState)}
        />
        <BrowserPushInfoItem
          label="이 기기"
          value={isRegisteredOnThisDevice ? "등록됨" : "미등록"}
        />
      </div>

      <div className="grid gap-2 rounded-md border border-[#E5E7EB] bg-[#FAFAF8] p-3 text-[14px] text-[#4B5563]">
        <span className="font-semibold text-[#111827]">서비스성 푸시 알림</span>
        <span className="text-[12px] leading-5">
          회의 리마인더와 딜 마감 알림을 이 브라우저로 받아요. 광고성
          알림은 별도 동의가 필요해요.
        </span>
      </div>

      {hasPublicKeyError ? (
        <p className="rounded-md bg-amber-50 p-3 text-[13px] leading-5 text-amber-800">
          브라우저 푸시 서버 설정을 가져오지 못했어요.
        </p>
      ) : null}

      {!pushSupported ? (
        <p className="rounded-md bg-amber-50 p-3 text-[13px] leading-5 text-amber-800">
          이 브라우저에서는 푸시 알림을 사용할 수 없어요.
        </p>
      ) : null}

      {permissionState === "denied" ? (
        <p className="rounded-md bg-amber-50 p-3 text-[13px] leading-5 text-amber-800">
          브라우저에서 알림이 차단되어 있어요. 기기 설정에서 권한을 바꾼
          뒤 다시 시도해 주세요.
        </p>
      ) : null}

      {permissionState === "default" ? (
        <p className="rounded-md bg-[#F3F4F6] p-3 text-[13px] leading-5 text-[#6B7280]">
          아직 이 브라우저에서 권한을 선택하지 않았어요.
        </p>
      ) : null}

      {permissionState === "granted" && !isRegisteredOnThisDevice ? (
        <p className="rounded-md bg-[#F3F4F6] p-3 text-[13px] leading-5 text-[#6B7280]">
          권한은 허용됐어요. 이 기기에 구독을 등록하면 알림을 받을 수
          있어요.
        </p>
      ) : null}

      {permissionState === "granted" && isRegisteredOnThisDevice ? (
        <p className="rounded-md bg-emerald-50 p-3 text-[13px] leading-5 text-emerald-800">
          이 기기에서 푸시 알림을 받을 수 있어요.
        </p>
      ) : null}

      {shouldShowMismatch ? (
        <p className="rounded-md bg-[#F3F4F6] p-3 text-[13px] leading-5 text-[#4B5563]">
          서비스 설정은 켜져 있지만 이 브라우저 권한이나 기기 구독은 아직
          준비되지 않았어요.
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#111827] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1F2937] active:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canOpenPermissionDialog || isPermissionFlowPending}
          type="button"
          onClick={onEnable}
        >
          {isPermissionFlowPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Bell className="h-4 w-4" aria-hidden="true" />
          )}
          푸시 알림 켜기
        </button>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-[14px] font-semibold text-red-700 transition hover:bg-red-50 active:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isRegisteredOnThisDevice || isRevoking}
          type="button"
          onClick={onRevoke}
        >
          {isRevoking ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <X className="h-4 w-4" aria-hidden="true" />
          )}
          구독 해제
        </button>
      </div>
    </div>
  );
}

// 기능 : 브라우저 푸시 상태의 label-value 정보를 렌더링합니다.
function BrowserPushInfoItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="grid gap-1 rounded-md bg-[#F3F4F6] p-3">
      <dt className="text-[12px] font-medium text-[#6B7280]">{label}</dt>
      <dd className="break-words text-[14px] font-semibold text-[#111827]">
        {value}
      </dd>
    </div>
  );
}
