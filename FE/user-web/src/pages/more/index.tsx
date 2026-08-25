import {
  Building2,
  Camera,
  ChevronRight,
  Package,
  Settings,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createAccountSettingsModalPath } from "@/components/layout/account-modal-route";
import { useAuthSession } from "@/features/auth";
import { useAppI18n, type AppI18nKey } from "@/features/app-i18n";

type MenuRowProps = {
  readonly label: string;
  readonly to: string;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly icon: LucideIcon;
  readonly isLast?: boolean;
};

function MenuRow({ label, to, iconBg, iconColor, icon: Icon, isLast }: MenuRowProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-[14px] bg-white px-4"
      style={{
        height: 52,
        borderBottom: isLast ? "none" : "1px solid #F3F4F6",
      }}
    >
      <div
        className="inline-flex shrink-0 items-center justify-center"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: iconBg,
        }}
      >
        <Icon style={{ width: 18, height: 18, color: iconColor }} />
      </div>

      <span className="flex-1 text-[14px] font-medium" style={{ color: "#1F2937" }}>
        {label}
      </span>

      <ChevronRight style={{ width: 16, height: 16, color: "#D1D5DB" }} />
    </Link>
  );
}

type SectionHeaderProps = {
  readonly title: string;
};

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div
      className="flex items-center px-4"
      style={{ height: 36, backgroundColor: "#F9FAFB" }}
    >
      <span
        className="text-[11px] font-bold uppercase tracking-wide"
        style={{ color: "#6B7280" }}
      >
        {title}
      </span>
    </div>
  );
}

const salesRows: ReadonlyArray<{
  readonly labelKey: AppI18nKey;
  readonly to: string;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly icon: LucideIcon;
}> = [
  {
    labelKey: "navigation.companies",
    to: "/app/companies",
    iconBg: "#4880EE18",
    iconColor: "#4880EE",
    icon: Building2,
  },
  {
    labelKey: "navigation.contacts",
    to: "/app/contacts",
    iconBg: "#4880EE18",
    iconColor: "#4880EE",
    icon: Users,
  },
  {
    labelKey: "navigation.businessCards",
    to: "/app/business-cards",
    iconBg: "#05966918",
    iconColor: "#059669",
    icon: Camera,
  },
  {
    labelKey: "navigation.products",
    to: "/app/products",
    iconBg: "#B4530918",
    iconColor: "#B45309",
    icon: Package,
  },
];

const MORE_SETTINGS_MODAL_PATH = createAccountSettingsModalPath("/app/more");

const managementRows: ReadonlyArray<{
  readonly labelKey: AppI18nKey;
  readonly to: string;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly icon: LucideIcon;
}> = [
  {
    labelKey: "navigation.trash",
    to: "/app/trash",
    iconBg: "#B91C1C18",
    iconColor: "#B91C1C",
    icon: Trash2,
  },
  {
    labelKey: "navigation.settings",
    to: MORE_SETTINGS_MODAL_PATH,
    iconBg: "#6B728018",
    iconColor: "#6B7280",
    icon: Settings,
  },
];

// 기능 : 모바일 더보기 메뉴와 계정 Settings 모달 진입점을 렌더링합니다.
export function MorePage() {
  const { user } = useAuthSession();
  const { t } = useAppI18n();
  const name = user?.name ?? t("more.user");
  const role = user?.role ?? "";
  const initial = name.charAt(0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-0 py-0 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[760px] overflow-hidden bg-white lg:rounded-lg lg:border lg:border-[#E5E7EB]">
        {/* 기능 : 사용자 프로필 진입 row는 계정 데이터와 locale 문구를 함께 표시합니다. */}
        <Link
          to={MORE_SETTINGS_MODAL_PATH}
          className="flex items-center gap-3 bg-white px-4 py-4"
          style={{ borderBottom: "1px solid #E5E7EB" }}
        >
          <div
            className="inline-flex shrink-0 items-center justify-center rounded-full text-[17px] font-bold"
            style={{
              width: 48,
              height: 48,
              backgroundColor: "#EFF6FF",
              color: "#4880EE",
            }}
          >
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold" style={{ color: "#111827" }}>
              {name}
            </p>
            <p className="truncate text-[12px]" style={{ color: "#6B7280" }}>
              {role}
            </p>
          </div>

          <ChevronRight style={{ width: 18, height: 18, color: "#D1D5DB", flexShrink: 0 }} />
        </Link>

        <SectionHeader title={t("more.salesManagement")} />
        <div style={{ borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
          {salesRows.map((row, index) => (
            <MenuRow
              key={row.to}
              label={t(row.labelKey)}
              to={row.to}
              iconBg={row.iconBg}
              iconColor={row.iconColor}
              icon={row.icon}
              isLast={index === salesRows.length - 1}
            />
          ))}
        </div>

        <SectionHeader title={t("more.management")} />
        <div style={{ borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
          {managementRows.map((row, index) => (
            <MenuRow
              key={row.to}
              label={t(row.labelKey)}
              to={row.to}
              iconBg={row.iconBg}
              iconColor={row.iconColor}
              icon={row.icon}
              isLast={index === managementRows.length - 1}
            />
          ))}
        </div>
      </div>

      <p
        className="py-6 text-center text-[11px]"
        style={{ color: "#D1D5DB" }}
      >
        OneHand v1.0.0
      </p>
    </div>
  );
}
