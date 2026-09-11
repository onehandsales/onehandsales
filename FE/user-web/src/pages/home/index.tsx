import { Link } from "react-router-dom";
import {
  Clock3,
  Settings,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { createAccountSettingsModalPath } from "@/components/layout/account-modal-route";
import { useAuthSession, useMyProfile } from "@/features/auth";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import { getApiErrorMessage } from "@/lib/api-client";

const HOME_SETTINGS_PATH = createAccountSettingsModalPath("/app");

type ProfileRow = {
  readonly labelKey: AppI18nKey;
  readonly value: string;
};

export function HomePage() {
  const { user } = useAuthSession();
  const { formatDateTime, t } = useAppI18n();
  const profileQuery = useMyProfile();
  const profile = profileQuery.data;
  const name = profile?.name ?? user?.name ?? t("settings.noName");
  const email = profile?.email ?? user?.email ?? t("settings.emailMissing");
  const role = profile?.role ?? user?.role ?? t("common.noRecord");
  const status = profile?.status ?? user?.status ?? t("common.noRecord");

  const accountRows: readonly ProfileRow[] = [
    { labelKey: "settings.name", value: name },
    { labelKey: "settings.email", value: email },
    { labelKey: "settings.role", value: role },
    { labelKey: "settings.accountStatus", value: status },
    { labelKey: "settings.userId", value: profile?.id ?? user?.id ?? t("common.noRecord") },
  ];
  const metadataRows: readonly ProfileRow[] = [
    {
      labelKey: "settings.lastLogin",
      value: formatDateTime(profile?.lastLoginAt, {
        fallback: t("common.noRecord"),
      }),
    },
    {
      labelKey: "settings.timeZone",
      value: profile?.timeZone ?? user?.timeZone ?? t("common.noRecord"),
    },
    {
      labelKey: "settings.defaultCountry",
      value: profile?.countryCode ?? user?.countryCode ?? t("common.noRecord"),
    },
    {
      labelKey: "settings.updatedAt",
      value: formatDateTime(profile?.updatedAt, {
        fallback: t("common.noRecord"),
      }),
    },
  ];

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-white px-5 pb-8 pt-2 md:px-8 md:pt-4">
      <div className="mx-auto grid w-full max-w-[920px] gap-5">
        <div className="rounded-lg border border-[#EEF2F7] bg-[#FAFBFC] px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#4880EE] shadow-sm">
                <UserRound className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-semibold leading-7 text-[#111827]">
                  {name}
                </h1>
                <p className="truncate text-[13px] text-[#64748B]">{email}</p>
              </div>
            </div>

            <Link
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[#D8DEE8] bg-white px-3 text-[13px] font-semibold text-[#374151] transition hover:bg-[#F8FAFC] active:bg-[#EEF2F7]"
              to={HOME_SETTINGS_PATH}
            >
              <Settings className="h-4 w-4" strokeWidth={1.8} />
              {t("settings.accountTitle")}
            </Link>
          </div>
        </div>

        {profileQuery.isLoading ? (
          <ProfileLoadingState />
        ) : profileQuery.error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
            {getApiErrorMessage(profileQuery.error)}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <ProfilePanel
              icon={ShieldCheck}
              rows={accountRows}
              title={t("settings.accountInformation")}
            />
            <ProfilePanel
              icon={Clock3}
              rows={metadataRows}
              title={t("settings.loginMetadata")}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ProfilePanel({
  icon: Icon,
  rows,
  title,
}: {
  readonly icon: LucideIcon;
  readonly rows: readonly ProfileRow[];
  readonly title: string;
}) {
  const { t } = useAppI18n();

  return (
    <section className="rounded-lg border border-[#EEF2F7] bg-white">
      <div className="flex min-h-[52px] items-center gap-2 border-b border-[#EEF2F7] px-4 py-3">
        <Icon className="h-4 w-4 shrink-0 text-[#64748B]" strokeWidth={1.8} />
        <h2 className="truncate text-[15px] font-semibold text-[#111827]">
          {title}
        </h2>
      </div>
      <dl className="grid">
        {rows.map((row) => (
          <div
            className="grid min-h-[54px] grid-cols-[132px_minmax(0,1fr)] items-center gap-3 border-b border-[#F4F6F9] px-4 py-2 last:border-b-0"
            key={row.labelKey}
          >
            <dt className="truncate text-[12px] font-medium text-[#64748B]">
              {t(row.labelKey)}
            </dt>
            <dd className="truncate text-right text-[13px] font-semibold text-[#111827]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ProfileLoadingState() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, panelIndex) => (
        <section
          className="rounded-lg border border-[#EEF2F7] bg-white"
          key={panelIndex}
        >
          <div className="h-[52px] border-b border-[#EEF2F7] px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-[#F4F6F9]" />
          </div>
          <div className="grid gap-3 p-4">
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <div
                className="h-8 animate-pulse rounded bg-[#F4F6F9]"
                key={rowIndex}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
