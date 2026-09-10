import {
  ArrowRight,
  Building2,
  Plus,
  RefreshCw,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";
import { useCompanyList } from "@/features/company/hooks/use-company-list";
import type { CompanyListItem } from "@/features/company";

type QuickAction = {
  readonly descriptionKey: AppI18nKey;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly labelKey: AppI18nKey;
};

const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    descriptionKey: "home.companyCreateDescription",
    href: "/app/companies/new",
    icon: Building2,
    labelKey: "home.companyCreate",
  },
];

export function HomePage() {
  const { formatDateTime, locale, t } = useAppI18n();
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(getIntlLocale(locale)),
    [locale],
  );
  const companiesQuery = useCompanyList({ page: 1, sort: "createdAtDesc" });
  const companies = companiesQuery.data?.items ?? [];
  const totalCount = companiesQuery.data?.totalCount ?? companies.length;

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-white px-5 pb-8 pt-2 md:px-8 md:pt-4">
      <div className="mx-auto grid w-full max-w-[1180px] gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            icon={Building2}
            label={t("navigation.companies")}
            value={t("home.countItems", {
              values: { count: numberFormatter.format(totalCount) },
            })}
          />
          <SummaryCard
            icon={Search}
            label={t("shell.integratedSearch")}
            value={t("navigation.companies")}
          />
          <SummaryCard
            icon={RefreshCw}
            label={t("home.recentScope")}
            value={t("home.countItems", {
              values: { count: numberFormatter.format(companies.length) },
            })}
          />
        </div>

        <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <DashboardSection
            actionHref="/app/companies"
            actionLabel={t("home.all")}
            icon={Building2}
            title={t("navigation.companies")}
          >
            <ListState
              emptyText={t("companyList.dataEmpty")}
              isLoading={companiesQuery.isLoading}
            >
              {companies.slice(0, 8).map((company) => (
                <CompanyActivityItem
                  company={company}
                  formatDateTime={formatDateTime}
                  key={company.id}
                  t={t}
                />
              ))}
            </ListState>
          </DashboardSection>

          <DashboardSection
            icon={Plus}
            title={t("home.quickActions")}
          >
            <div className="grid gap-3">
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard action={action} key={action.href} t={t} />
              ))}
            </div>
          </DashboardSection>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <article className="rounded-lg border border-[#EEF2F7] bg-[#FAFBFC] px-4 py-3">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#64748B]">
        <Icon className="h-4 w-4 text-[#3A83F7]" strokeWidth={1.8} />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-[24px] font-semibold leading-tight text-[#111827]">
        {value}
      </p>
    </article>
  );
}

function DashboardSection({
  actionHref,
  actionLabel,
  children,
  icon: Icon,
  title,
}: {
  readonly actionHref?: string;
  readonly actionLabel?: string;
  readonly children: ReactNode;
  readonly icon: LucideIcon;
  readonly title: string;
}) {
  return (
    <section className="rounded-lg border border-[#EEF2F7] bg-white">
      <div className="flex min-h-[52px] items-center justify-between gap-3 border-b border-[#EEF2F7] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-[#64748B]" strokeWidth={1.8} />
          <h2 className="truncate text-[15px] font-semibold text-[#111827]">
            {title}
          </h2>
        </div>
        {actionHref && actionLabel ? (
          <Link
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#EFF6FF] active:bg-[#DBEAFE]"
            to={actionHref}
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function ListState({
  children,
  emptyText,
  isLoading,
}: {
  readonly children: ReactNode;
  readonly emptyText: string;
  readonly isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="h-14 rounded-lg bg-[#F4F6F9]"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (!hasRenderableChildren(children)) {
    return (
      <p className="rounded-lg bg-[#F8FAFC] px-4 py-8 text-center text-[13px] text-[#64748B]">
        {emptyText}
      </p>
    );
  }

  return <div className="grid gap-2">{children}</div>;
}

function CompanyActivityItem({
  company,
  formatDateTime,
  t,
}: {
  readonly company: CompanyListItem;
  readonly formatDateTime: (value: string) => string;
  readonly t: (key: AppI18nKey, options?: { readonly values?: Record<string, string> }) => string;
}) {
  return (
    <Link
      className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-[#EEF2F7] px-3 py-2 transition hover:border-[#D8DEE8] hover:bg-[#FAFBFC] active:bg-[#F3F6FB]"
      to={`/app/companies/${company.id}`}
    >
      <div className="min-w-0">
        <p className="truncate text-[14px] font-semibold text-[#111827]">
          {company.companyName}
        </p>
        <p className="mt-0.5 truncate text-[12px] text-[#64748B]">
          {company.companyField.field} · {formatCompanyRegion(company)}
        </p>
      </div>
      <span className="shrink-0 text-[12px] text-[#94A3B8]">
        {t("companyList.registeredAt", {
          values: { date: formatDateTime(company.createdAt) },
        })}
      </span>
    </Link>
  );
}

function QuickActionCard({
  action,
  t,
}: {
  readonly action: QuickAction;
  readonly t: (key: AppI18nKey) => string;
}) {
  const Icon = action.icon;

  return (
    <Link
      className="flex items-center gap-3 rounded-lg border border-[#EEF2F7] bg-[#FAFBFC] px-3 py-3 transition hover:border-[#D8DEE8] hover:bg-white active:bg-[#F3F6FB]"
      to={action.href}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-[#3A83F7] shadow-sm">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-[#111827]">
          {t(action.labelKey)}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-[#64748B]">
          {t(action.descriptionKey)}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={2} />
    </Link>
  );
}

function formatCompanyRegion(company: CompanyListItem) {
  const code = company.companyRegion.regionCode
    ? ` (${company.companyRegion.regionCode})`
    : "";

  return `${company.companyRegion.region}${code}`;
}

function hasRenderableChildren(children: ReactNode) {
  return Array.isArray(children) ? children.length > 0 : Boolean(children);
}

function getIntlLocale(locale: string) {
  return locale === "ko-KR" ? "ko-KR" : "en-US";
}
