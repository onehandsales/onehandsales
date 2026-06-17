import {
  Building2,
  ChevronRight,
  CreditCard,
  Download,
  Package,
  Settings,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthSession } from "@/features/auth";

type MenuRowProps = {
  readonly label: string;
  readonly to: string;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly icon: typeof Building2;
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
      {/* Icon box */}
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

      {/* Label */}
      <span className="flex-1 text-[14px] font-medium" style={{ color: "#1F2937" }}>
        {label}
      </span>

      {/* Chevron */}
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

export function MorePage() {
  const { user } = useAuthSession();
  const name = user?.name ?? "사용자";
  const role = user?.role ?? "";
  const initial = name.charAt(0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9FAFB" }}>
      {/* Profile Card */}
      <Link
        to="/settings"
        className="flex items-center gap-3 bg-white px-4 py-4"
        style={{ borderBottom: "1px solid #E5E7EB" }}
      >
        {/* Avatar */}
        <div
          className="inline-flex shrink-0 items-center justify-center rounded-full text-[17px] font-bold"
          style={{
            width: 48,
            height: 48,
            backgroundColor: "#EFF6FF",
            color: "#2563EB",
          }}
        >
          {initial}
        </div>

        {/* Name & role */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold truncate" style={{ color: "#111827" }}>
            {name}
          </p>
          <p className="text-[12px] truncate" style={{ color: "#6B7280" }}>
            {role}
          </p>
        </div>

        <ChevronRight style={{ width: 18, height: 18, color: "#D1D5DB", flexShrink: 0 }} />
      </Link>

      {/* Section: 영업 관리 */}
      <SectionHeader title="영업 관리" />
      <div style={{ borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
        <MenuRow
          label="회사"
          to="/companies"
          iconBg="#6D28D918"
          iconColor="#6D28D9"
          icon={Building2}
        />
        <MenuRow
          label="담당자"
          to="/contacts"
          iconBg="#04785718"
          iconColor="#047857"
          icon={Users}
        />
        <MenuRow
          label="제품"
          to="/products"
          iconBg="#B4530918"
          iconColor="#B45309"
          icon={Package}
          isLast
        />
      </div>

      {/* Section: 도구 */}
      <SectionHeader title="도구" />
      <div style={{ borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
        <MenuRow
          label="명함 스캔"
          to="/contacts/scan"
          iconBg="#0E749018"
          iconColor="#0E7490"
          icon={CreditCard}
        />
        <MenuRow
          label="Import"
          to="/import"
          iconBg="#2563EB18"
          iconColor="#2563EB"
          icon={Upload}
          isLast
        />
      </div>

      {/* Section: 관리 */}
      <SectionHeader title="관리" />
      <div style={{ borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }}>
        <MenuRow
          label="휴지통"
          to="/trash"
          iconBg="#B91C1C18"
          iconColor="#B91C1C"
          icon={Trash2}
        />
        <MenuRow
          label="설정"
          to="/settings"
          iconBg="#6B728018"
          iconColor="#6B7280"
          icon={Settings}
          isLast
        />
      </div>

      {/* Version */}
      <p
        className="py-6 text-center text-[11px]"
        style={{ color: "#D1D5DB" }}
      >
        Onehand Sales v1.0.0
      </p>
    </div>
  );
}
