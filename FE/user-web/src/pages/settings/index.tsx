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
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountDataRequestsSettingsSection } from "@/features/account-request";
import { Toast } from "@/components/ui/toast";
import { type AppI18nKey, useAppI18n } from "@/features/app-i18n";
import {
  type MyDevice,
  type UserProfileOAuthAccount,
  type UserProfileResponse,
  useMyDevices,
  useMyProfile,
  useUpdateMyProfileMutation,
} from "@/features/auth";
import { FollowUpDeliverySettingsSection } from "@/features/follow-up-delivery";
import { GoogleCalendarSettingsSection } from "@/features/schedule";
import { getApiErrorMessage } from "@/lib/api-client";

const DEFAULT_TIME_ZONE = "Asia/Seoul";
const localeOptions = [
  { value: "ko-KR", labelKey: "settings.korean" },
  { value: "en", labelKey: "importExport.englishTemplate" },
] as const;

const countryOptions = [
  { value: "KR", labelKey: "settings.korea" },
  { value: "US", labelKey: "settings.unitedStates" },
] as const;

const currencyOptions = [
  { value: "KRW", label: "KRW" },
  { value: "USD", label: "USD" },
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

// 기능 : 사용자 글로벌 설정, 연동 설정, 기기 현황을 한 화면에 표시합니다.
export function SettingsPage() {
  const { t } = useAppI18n();
  const [notice, setNotice] = useState<SettingsNotice | null>(null);
  const profileQuery = useMyProfile();
  const devicesQuery = useMyDevices();
  const noticeMessage =
    notice?.type === "i18n" ? t(notice.key) : (notice?.message ?? null);
  // 기능 : 연동 섹션에서 공통 안내 모달을 열 때 effect 재실행으로 같은 안내가 반복되지 않게 합니다.
  const showTextNotice = useCallback((message: string) => {
    setNotice({ message, type: "text" });
  }, []);
  // 기능 : 프로필 저장 성공 안내를 app i18n key 기반으로 표시합니다.
  const showProfileSavedNotice = useCallback(() => {
    setNotice({ key: "settings.profileSaved", type: "i18n" });
  }, []);

  return (
    <section className="flex min-h-full flex-col bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6">
        {noticeMessage ? (
          <Toast
            message={noticeMessage}
            onClose={() => setNotice(null)}
            variant="success"
          />
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid content-start gap-5">
            <ProfileSection
              error={profileQuery.error}
              isLoading={profileQuery.isLoading}
              onRetry={() => void profileQuery.refetch()}
              onSaved={showProfileSavedNotice}
              profile={profileQuery.data ?? null}
            />
            <AccountDataRequestsSettingsSection onNotice={showTextNotice} />
            <GoogleCalendarSettingsSection onNotice={showTextNotice} />
            <FollowUpDeliverySettingsSection onNotice={showTextNotice} />
          </div>
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

// 기능 : 프로필과 글로벌 기본값을 조회하고 저장하는 설정 폼을 표시합니다.
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
  const { formatDateTime, t } = useAppI18n();
  const [name, setName] = useState("");
  const [preferredLocale, setPreferredLocale] = useState("ko-KR");
  const [timeZone, setTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [countryCode, setCountryCode] = useState("KR");
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState("KRW");
  const [formError, setFormError] = useState<string | null>(null);
  const updateProfileMutation = useUpdateMyProfileMutation();

  useEffect(() => {
    setName(profile?.name ?? "");
    setPreferredLocale(profile?.preferredLocale ?? "ko-KR");
    setTimeZone(profile?.timeZone ?? DEFAULT_TIME_ZONE);
    setCountryCode(profile?.countryCode ?? "KR");
    setDefaultCurrencyCode(profile?.defaultCurrencyCode ?? "KRW");
  }, [
    profile?.countryCode,
    profile?.defaultCurrencyCode,
    profile?.name,
    profile?.preferredLocale,
    profile?.timeZone,
  ]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = name.trim();

    if (nextName.length > 80) {
      setFormError(t("settings.nameTooLong"));
      return;
    }

    setFormError(null);

    try {
      await updateProfileMutation.mutateAsync({
        name: nextName.length > 0 ? nextName : null,
        preferredLocale,
        timeZone,
        countryCode,
        defaultCurrencyCode,
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
            description={t("settings.profileDescription")}
            title={t("settings.profileTitle")}
          />
          <div className="rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
            <SettingsSkeleton rows={5} />
          </div>
        </section>
      ) : error ? (
        <section className="grid gap-3">
          <SettingsCardHeader
            icon={UserRound}
            description={t("settings.profileDescription")}
            title={t("settings.profileTitle")}
          />
          <div className="rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
            <InlineError error={error} onRetry={onRetry} />
          </div>
        </section>
      ) : profile ? (
        <>
          <form onSubmit={onSubmit}>
            <div className="grid gap-4 rounded-lg border border-[#E2E5EC] bg-white px-5 py-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-[#374151]">
                    {t("settings.name")}
                  </span>
                  <input
                    className="h-9 min-w-0 rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD] focus:bg-white"
                    maxLength={80}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("settings.noName")}
                    value={name}
                  />
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-[#374151]">
                    {t("settings.displayLanguage")}
                  </span>
                  <select
                    className="h-9 min-w-0 rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
                    onChange={(event) => setPreferredLocale(event.target.value)}
                    value={preferredLocale}
                  >
                    {localeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-[#374151]">
                    {t("settings.timeZone")}
                  </span>
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
                {/* 기능 : 글로벌 기본값을 위해 사용자의 기본 국가를 선택합니다. */}
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-[#374151]">
                    {t("settings.defaultCountry")}
                  </span>
                  <select
                    className="h-9 min-w-0 rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
                    onChange={(event) => setCountryCode(event.target.value)}
                    value={countryCode}
                  >
                    {countryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                </label>
                {/* 기능 : 금액 입력 기본값을 위해 사용자의 기본 통화를 선택합니다. */}
                <label className="grid min-w-0 gap-1.5">
                  <span className="text-sm font-medium text-[#374151]">
                    {t("settings.defaultCurrency")}
                  </span>
                  <select
                    className="h-9 min-w-0 rounded-md border border-[#E2E5EC] bg-white px-3 text-sm outline-none focus:border-[#93C5FD]"
                    onChange={(event) => setDefaultCurrencyCode(event.target.value)}
                    value={defaultCurrencyCode}
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
                  {updateProfileMutation.isPending
                    ? t("common.saving")
                    : t("common.save")}
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
              description={t("settings.accountDescription")}
              title={t("settings.accountInformation")}
            />
            <div className="grid gap-5 rounded-lg border border-[#E2E5EC] bg-white p-5 shadow-sm">
              <dl className="grid gap-3 md:grid-cols-2">
                <ReadOnlyField icon={UserRound} label={t("settings.email")} value={profile.email} />
                <ReadOnlyField
                  icon={ShieldCheck}
                  label={t("settings.role")}
                  value={toRoleLabel(profile.role, t)}
                />
                <ReadOnlyField
                  icon={BadgeCheck}
                  label={t("settings.accountStatus")}
                  value={toStatusLabel(profile.status, t)}
                />
                <ReadOnlyField
                  icon={Laptop}
                  label={t("settings.lastLogin")}
                  value={formatDateTime(profile.lastLoginAt, { includeYear: true })}
                />
                <ReadOnlyField
                  icon={UserRound}
                  label={t("settings.createdAt")}
                  value={formatDateTime(profile.createdAt, { includeYear: true })}
                />
                <ReadOnlyField
                  icon={Timer}
                  label={t("settings.updatedAt")}
                  value={formatDateTime(profile.updatedAt, { includeYear: true })}
                />
                <ReadOnlyField
                  icon={BadgeCheck}
                  label={t("settings.defaultCountry")}
                  value={toCountryLabel(profile.countryCode, t)}
                />
                <ReadOnlyField
                  icon={BadgeCheck}
                  label={t("settings.defaultCurrency")}
                  value={profile.defaultCurrencyCode}
                />
                <ReadOnlyField
                  icon={Timer}
                  label={t("settings.joinedTimeZone")}
                  value={profile.signupTimeZone ?? t("common.noRecord")}
                />
                <ReadOnlyField
                  icon={Timer}
                  label={t("settings.lastLoginTimeZone")}
                  value={profile.lastLoginTimeZone ?? t("common.noRecord")}
                />
                <ReadOnlyField
                  icon={BadgeCheck}
                  label={t("settings.defaultCountryJoined")}
                  value={profile.signupCountryCode ?? t("common.noRecord")}
                />
                <ReadOnlyField
                  icon={BadgeCheck}
                  label={t("settings.defaultCountryLastLogin")}
                  value={profile.lastLoginCountryCode ?? t("common.noRecord")}
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
  const { t } = useAppI18n();

  return (
    <section className="grid content-start gap-3">
      <SettingsCardHeader
        icon={Laptop}
        description={t("settings.devicesDescription")}
        title={t("settings.devicesTitle")}
      />
      <div className="rounded-lg border border-[#E2E5EC] bg-white p-4 shadow-sm">
        {isLoading ? (
          <SettingsSkeleton rows={4} />
        ) : error ? (
          <InlineError error={error} onRetry={onRetry} />
        ) : devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("settings.devicesEmpty")}
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

// 기능 : 등록된 기기 항목을 사용자 locale/timezone 기준 날짜와 함께 표시합니다.
function DeviceItem({ device }: { readonly device: MyDevice }) {
  const { formatDateTime, t } = useAppI18n();
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
              {device.label || toDeviceSlotLabel(device.slot, t)}
            </h3>
            {device.isCurrentDevice ? (
              <span className="rounded-md bg-[#EAF2FF] px-2 py-0.5 text-xs font-semibold text-[#1D4ED8]">
                {t("settings.currentDevice")}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {toDeviceSlotLabel(device.slot, t)} · {t("settings.activeSessionCount")}{" "}
            {t("home.countItems", {
              values: { count: device.activeSessionCount.toLocaleString() },
            })}
          </p>
        </div>
      </div>
      <dl className="grid gap-2 text-xs text-muted-foreground">
        <div className="flex justify-between gap-3">
          <dt>{t("settings.lastSeenAt")}</dt>
          <dd className="text-right text-foreground">
            {formatDateTime(device.lastSeenAt, { includeYear: true })}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>{t("settings.createdAt")}</dt>
          <dd className="text-right text-foreground">
            {formatDateTime(device.createdAt, { includeYear: true })}
          </dd>
        </div>
      </dl>
    </article>
  );
}

// 기능 : 연결된 OAuth provider 계정 목록을 사용자 locale/timezone 기준 날짜와 함께 표시합니다.
function OAuthAccountList({
  accounts,
}: {
  readonly accounts: UserProfileOAuthAccount[];
}) {
  const { formatDateTime, t } = useAppI18n();

  return (
    <section className="grid gap-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-[#64748B]" />
        <h3 className="text-sm font-semibold text-[#111827]">{t("settings.providerAccounts")}</h3>
      </div>
      {accounts.length === 0 ? (
        <p className="rounded-md border border-[#E2E5EC] bg-white px-3 py-3 text-sm text-[#64748B]">
          {t("settings.noOAuthAccounts")}
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
                  {account.providerEmail ?? t("settings.emailMissing")}
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

type SettingsNotice =
  | {
      readonly key: AppI18nKey;
      readonly type: "i18n";
    }
  | {
      readonly message: string;
      readonly type: "text";
    };

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
  const { t } = useAppI18n();

  return (
    <div className="grid justify-items-start gap-3 rounded-md border border-destructive/30 bg-red-50 px-4 py-3">
      <p className="text-sm text-destructive">{getApiErrorMessage(error)}</p>
      <Button onClick={onRetry} size="sm" type="button">
        {t("common.retry")}
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
    google: "Google",
    legacy_oauth: "Legacy OAuth",
  };

  return labels[provider] ?? provider;
}

function toDeviceSlotLabel(slot: string, t: (key: AppI18nKey) => string) {
  const labels: Record<string, AppI18nKey> = {
    mobile: "settings.mobileSlot",
    personal_laptop: "settings.personalLaptopSlot",
    work_laptop: "settings.workLaptopSlot",
  };
  const labelKey = labels[slot];

  return labelKey ? t(labelKey) : slot;
}

function toRoleLabel(role: string, t: (key: AppI18nKey) => string) {
  return role === "ADMIN" ? t("settings.admin") : t("settings.user");
}

// 기능 : 저장된 국가 코드를 설정 화면 표시 이름으로 변환합니다.
function toCountryLabel(countryCode: string, t: (key: AppI18nKey) => string) {
  const labels: Record<string, AppI18nKey> = {
    KR: "settings.korea",
    US: "settings.unitedStates",
  };
  const labelKey = labels[countryCode];

  return labelKey ? t(labelKey) : countryCode;
}

function toStatusLabel(status: string, t: (key: AppI18nKey) => string) {
  const labels: Record<string, AppI18nKey> = {
    ACTIVE: "settings.active",
    DELETED: "settings.deleted",
    SUSPENDED: "settings.suspended",
  };
  const labelKey = labels[status];

  return labelKey ? t(labelKey) : status;
}
