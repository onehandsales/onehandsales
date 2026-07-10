import {
  BadgeCheck,
  Laptop,
  Link2,
  Save,
  ShieldCheck,
  Smartphone,
  Timer,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import {
  useMyDevices,
  useMyProfile,
  useUpdateMyProfileMutation,
} from "@/features/auth/hooks/use-user-settings";
import type {
  MyDevice,
  UserProfileOAuthAccount,
  UserProfileResponse,
} from "@/features/auth/types/auth";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDateTime } from "@/utils/format";

const DEFAULT_TIME_ZONE = "Asia/Seoul";
const localeOptions = [
  { value: "ko-KR", label: "한국어" },
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "en-SG", label: "English (Singapore)" },
  { value: "en-AU", label: "English (Australia)" },
  { value: "en-CA", label: "English (Canada)" },
  { value: "ja-JP", label: "日本語" },
  { value: "zh-TW", label: "繁體中文" },
] as const;

const timeZoneOptions = [
  "Asia/Seoul",
  "Asia/Tokyo",
  "Asia/Taipei",
  "Asia/Singapore",
  "America/New_York",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Australia/Sydney",
  "UTC",
] as const;

export function SettingsPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const profileQuery = useMyProfile();
  const devicesQuery = useMyDevices();

  return (
    <section className="flex min-h-full flex-col bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6">
        {notice ? (
          <Toast message={notice} onClose={() => setNotice(null)} variant="success" />
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ProfileSection
            error={profileQuery.error}
            isLoading={profileQuery.isLoading}
            onRetry={() => void profileQuery.refetch()}
            onSaved={() => setNotice("개인 정보를 저장했어요.")}
            profile={profileQuery.data ?? null}
          />
          <DeviceSection
            devices={devicesQuery.data?.devices ?? []}
            error={devicesQuery.error}
            isLoading={devicesQuery.isLoading}
            onRetry={() => void devicesQuery.refetch()}
          />
        </div>
      </div>
    </section>
  );
}

function ProfileSection({
  profile,
  isLoading,
  error,
  onRetry,
  onSaved,
}: {
  readonly profile: UserProfileResponse | null;
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [preferredLocale, setPreferredLocale] = useState("ko-KR");
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [formError, setFormError] = useState<string | null>(null);
  const updateProfileMutation = useUpdateMyProfileMutation();

  useEffect(() => {
    setName(profile?.name ?? "");
    setPreferredLocale(profile?.preferredLocale ?? "ko-KR");
    setTimeZone(profile?.timeZone ?? DEFAULT_TIME_ZONE);
  }, [profile?.name, profile?.preferredLocale, profile?.timeZone]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();

    if (nextName.length > 80) {
      setFormError("이름은 80자 이하로 입력해 주세요.");
      return;
    }

    setFormError(null);

    try {
      await updateProfileMutation.mutateAsync({
        name: nextName.length > 0 ? nextName : null,
        preferredLocale,
        timeZone,
      });
      onSaved();
    } catch (nextError) {
      setFormError(getApiErrorMessage(nextError));
    }
  };

  return (
    <section className="grid content-start gap-5">
      {isLoading ? (
        <section className="grid gap-3">
          <SettingsCardHeader
            icon={UserRound}
            description="개인 표시 정보와 시간대를 설정해요."
            title="프로필 설정"
          />
          <div className="rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
            <SettingsSkeleton rows={3} />
          </div>
        </section>
      ) : error ? (
        <section className="grid gap-3">
          <SettingsCardHeader
            icon={UserRound}
            description="개인 표시 정보와 시간대를 설정해요."
            title="프로필 설정"
          />
          <div className="rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
            <InlineError error={error} onRetry={onRetry} />
          </div>
        </section>
      ) : profile ? (
        <>
          <form onSubmit={onSubmit}>
            <div className="grid gap-4 rounded-lg border border-[#E2E5EC] bg-white px-5 py-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-[#374151]">이름</span>
                  <input
                    className="h-9 min-w-0 rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD] focus:bg-white"
                    maxLength={80}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="이름 없음"
                    value={name}
                  />
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-[#374151]">표시 언어</span>
                  <select
                    className="h-9 min-w-0 rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
                    onChange={(event) => setPreferredLocale(event.target.value)}
                    value={preferredLocale}
                  >
                    {localeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-[#374151]">시간대</span>
                  <select
                    className="h-9 min-w-0 rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
                    onChange={(event) => setTimeZone(event.target.value)}
                    value={timeZone}
                  >
                    {getTimeZoneOptions(timeZone).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={updateProfileMutation.isPending}
                  isPending={updateProfileMutation.isPending}
                  size="sm"
                  type="submit"
                  variant="primary"
                >
                  <Save className="h-3.5 w-3.5" />
                  저장
                </Button>
              </div>
              {formError ? (
                <p className="mt-2 text-sm text-destructive">{formError}</p>
              ) : null}
            </div>
          </form>

          <section className="grid gap-3">
            <SettingsCardHeader
              icon={ShieldCheck}
              description="로그인 계정, 권한, 연결 provider와 계정 이력을 확인해요."
              title="계정 정보"
            />
            <div className="grid gap-5 rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
              <dl className="grid gap-3 md:grid-cols-2">
                <ReadOnlyField icon={UserRound} label="이메일" value={profile.email} />
                <ReadOnlyField
                  icon={ShieldCheck}
                  label="권한"
                  value={toRoleLabel(profile.role)}
                />
                <ReadOnlyField
                  icon={BadgeCheck}
                  label="계정 상태"
                  value={toStatusLabel(profile.status)}
                />
                <ReadOnlyField
                  icon={Laptop}
                  label="마지막 로그인"
                  value={formatDateTime(profile.lastLoginAt, { includeYear: true })}
                />
                <ReadOnlyField
                  icon={UserRound}
                  label="가입일"
                  value={formatDateTime(profile.createdAt, { includeYear: true })}
                />
                <ReadOnlyField
                  icon={Timer}
                  label="최근 수정일"
                  value={formatDateTime(profile.updatedAt, { includeYear: true })}
                />
                <ReadOnlyField
                  icon={Timer}
                  label="가입 시간대"
                  value={profile.signupTimeZone ?? "-"}
                />
                <ReadOnlyField
                  icon={Timer}
                  label="마지막 로그인 시간대"
                  value={profile.lastLoginTimeZone ?? "-"}
                />
                <ReadOnlyField
                  icon={BadgeCheck}
                  label="가입 국가"
                  value={profile.signupCountryCode ?? "-"}
                />
                <ReadOnlyField
                  icon={BadgeCheck}
                  label="마지막 로그인 국가"
                  value={profile.lastLoginCountryCode ?? "-"}
                />
              </dl>

              <OAuthAccountList accounts={profile.oauthAccounts} />
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}

function DeviceSection({
  devices,
  isLoading,
  error,
  onRetry,
}: {
  readonly devices: MyDevice[];
  readonly isLoading: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
}) {
  return (
    <section className="grid content-start gap-3">
      <SettingsCardHeader
        icon={Laptop}
        description="로그인에 등록된 활성 기기만 표시해요."
        title="등록 기기"
      />
      <div className="rounded-lg border border-[#E2E5EC] bg-white p-4 shadow-sm">
        {isLoading ? (
          <SettingsSkeleton rows={4} />
        ) : error ? (
          <InlineError error={error} onRetry={onRetry} />
        ) : devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            활성 기기가 생기면 여기에서 볼 수 있어요.
          </p>
        ) : (
          <div className="grid gap-3">
            {devices.map((device) => (
              <DeviceItem device={device} key={device.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DeviceItem({ device }: { readonly device: MyDevice }) {
  const Icon = device.slot === "mobile" ? Smartphone : Laptop;

  return (
    <article className="grid gap-3 rounded-md border border-[#E2E5EC] bg-white px-3 py-3 transition hover:bg-blue-50/60">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#F1F5F9] text-[#64748B]">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold">
              {device.label || toDeviceSlotLabel(device.slot)}
            </h3>
            {device.isCurrentDevice ? (
              <span className="rounded-md bg-[#EAF2FF] px-2 py-0.5 text-xs font-semibold text-[#1D4ED8]">
                현재 기기
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {toDeviceSlotLabel(device.slot)} · 활성 세션{" "}
            {device.activeSessionCount.toLocaleString()}개
          </p>
        </div>
      </div>
      <dl className="grid gap-2 text-xs text-muted-foreground">
        <div className="flex justify-between gap-3">
          <dt>마지막 사용</dt>
          <dd className="text-right text-foreground">
            {formatDateTime(device.lastSeenAt, { includeYear: true })}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>등록일</dt>
          <dd className="text-right text-foreground">
            {formatDateTime(device.createdAt, { includeYear: true })}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function OAuthAccountList({
  accounts,
}: {
  readonly accounts: UserProfileOAuthAccount[];
}) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-[#64748B]" />
        <h3 className="text-sm font-semibold text-[#111827]">연결 provider</h3>
      </div>
      {accounts.length === 0 ? (
        <p className="rounded-md border border-[#E2E5EC] bg-white px-3 py-3 text-sm text-[#64748B]">
          연결된 provider가 생기면 여기에서 볼 수 있어요.
        </p>
      ) : (
        <div className="grid gap-2">
          {accounts.map((account) => (
            <article
              className="flex items-center justify-between gap-3 rounded-md border border-[#E2E5EC] px-3 py-2 transition hover:bg-blue-50/60"
              key={account.id}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {toProviderLabel(account.provider)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {account.providerEmail ?? "이메일 없음"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDateTime(account.createdAt, { includeYear: true })}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string | null | undefined;
}) {
  return (
    <div className="rounded-md border border-[#E2E5EC] bg-white px-3 py-3">
      <dt className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-[#111827]">{value || "-"}</dd>
    </div>
  );
}

function getTimeZoneOptions(currentTimeZone: string) {
  const browserTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;

  return Array.from(
    new Set([currentTimeZone, browserTimeZone, ...timeZoneOptions])
  ).filter(Boolean);
}

function SettingsCardHeader({
  description,
  icon: Icon,
  title,
}: {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EAF2FF] text-[#1D4ED8]">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-[#111827]">{title}</h2>
        <p className="mt-0.5 text-[12px] text-[#64748B]">{description}</p>
      </div>
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
    <div className="grid justify-items-start gap-3 rounded-md border border-destructive/30 bg-red-50 px-4 py-3">
      <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      <Button onClick={onRetry} size="sm" type="button">
        다시 시도
      </Button>
    </div>
  );
}

function SettingsSkeleton({ rows }: { readonly rows: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="h-12 animate-pulse rounded-md bg-muted" key={index} />
      ))}
    </div>
  );
}

function toProviderLabel(provider: string) {
  const labels: Record<string, string> = {
    apple: "Apple",
    google: "Google",
    kakao: "Kakao",
  };

  return labels[provider] ?? provider;
}

function toDeviceSlotLabel(slot: string) {
  const labels: Record<string, string> = {
    mobile: "모바일",
    personal_laptop: "개인 노트북",
    work_laptop: "회사 노트북",
  };

  return labels[slot] ?? slot;
}

function toRoleLabel(role: string) {
  return role === "ADMIN" ? "관리자" : "사용자";
}

function toStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "활성",
    DELETED: "삭제됨",
    SUSPENDED: "정지",
  };

  return labels[status] ?? status;
}

