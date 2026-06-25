import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

// ── 브레드크럼 ──────────────────────────────────────────────
export type BreadcrumbItem = {
  readonly label: string;
  readonly to?: string;
  readonly icon?: LucideIcon; // 첫 번째 크럼에만 표시
};

// ── 헤더 액션 버튼 ──────────────────────────────────────────
export type HeaderAction = {
  readonly icon: LucideIcon;
  readonly tooltip: string;
  readonly onClick?: () => void;
  readonly href?: string;
  readonly disabled?: boolean;
  readonly variant?: "primary" | "default" | "danger";
};

type PageHeaderProps = {
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly actions?: readonly HeaderAction[];
  readonly className?: string;
};

export function PageHeader({ breadcrumbs, actions = [], className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-[var(--topbar-height)] shrink-0 items-center gap-2 px-5",
        className
      )}
    >
      {/* 브레드크럼 */}
      <nav className="flex min-w-0 items-center gap-1.5" aria-label="breadcrumb">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = crumb.icon;
          return (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="select-none text-[13px] text-[#D1D5DB]">/</span>
              )}
              {crumb.to && !isLast ? (
                <Link
                  className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#6B7280] transition hover:text-[#111827]"
                  to={crumb.to}
                >
                  {Icon && index === 0 && (
                    <Icon className="h-[15px] w-[15px] shrink-0 text-[#9CA3AF]" strokeWidth={1.75} />
                  )}
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[13px]",
                    isLast ? "font-semibold text-[#111827]" : "text-[#6B7280]"
                  )}
                >
                  {Icon && index === 0 && (
                    <Icon
                      className={cn(
                        "h-[15px] w-[15px] shrink-0",
                        isLast ? "text-[#4880EE]" : "text-[#9CA3AF]"
                      )}
                      strokeWidth={1.75}
                    />
                  )}
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* 액션 버튼 */}
      {actions.length > 0 && (
        <div className="flex items-center gap-1.5">
          {actions.map((action, index) => (
            <TooltipIconButton key={index} action={action} />
          ))}
        </div>
      )}
    </header>
  );
}

// ── 툴팁 아이콘 버튼 ────────────────────────────────────────
function TooltipIconButton({ action }: { readonly action: HeaderAction }) {
  const Icon = action.icon;

  // variant별 스타일 — 테두리 + 배경을 넣어 눈에 잘 띄게
  const variantClass = {
    primary:
      "border border-[#4880EE] bg-[#4880EE] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8]",
    default:
      "border border-[#E2E5EC] bg-white text-[#374151] hover:bg-[#F5F6F8] hover:border-[#C9CDD6]",
    danger:
      "border border-[#FECACA] bg-white text-[#DC2626] hover:bg-red-50 hover:border-red-300",
  }[action.variant ?? "default"];

  const inner = (
    <>
      <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
      {/* 툴팁 — 아래 방향 */}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2.5 py-1.5 text-[11px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100">
          {/* 위 꼬리 */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#111827]" />
          {action.tooltip}
      </span>
    </>
  );

  const commonClass = cn(
    "group relative inline-flex h-11 w-11 items-center justify-center rounded-md shadow-sm transition",
    variantClass,
    action.disabled && "pointer-events-none opacity-40"
  );

  if (action.href) {
    return (
      <Link
        aria-label={action.tooltip}
        className={commonClass}
        to={action.href}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      aria-label={action.tooltip}
      className={commonClass}
      disabled={action.disabled}
      type="button"
      onClick={action.onClick}
    >
      {inner}
    </button>
  );
}
