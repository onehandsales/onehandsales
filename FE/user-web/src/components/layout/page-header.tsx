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
  readonly hidden?: boolean;
  readonly variant?: "primary" | "default" | "danger";
};

type PageHeaderProps = {
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly actions?: readonly HeaderAction[];
  readonly actionsPlacement?: "end" | "start";
  readonly className?: string;
};

export function PageHeader({
  breadcrumbs,
  actions = [],
  actionsPlacement = "end",
  className,
}: PageHeaderProps) {
  const actionsNode =
    actions.length > 0 ? (
      <div className="app-page-header-actions flex items-center">
        {actions.map((action, index) => {
          const hasVisibleActionBefore = actions
            .slice(0, index)
            .some((previousAction) => !previousAction.hidden);

          return (
            <div
              className={cn(
                "relative h-8 shrink-0 transition-[width,margin-left] duration-[500ms] ease-out",
                action.hidden ? "w-0" : "w-8",
                hasVisibleActionBefore && !action.hidden ? "ml-1.5" : "ml-0"
              )}
              key={index}
            >
              <div className="absolute right-0 top-0 h-8 w-8">
                <TooltipIconButton action={action} />
              </div>
            </div>
          );
        })}
      </div>
    ) : null;

  return (
    <header
      className={cn(
        "app-page-header flex h-[var(--topbar-height)] shrink-0 items-center gap-2 px-5",
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

      {actionsPlacement === "start" ? actionsNode : null}

      <div className="flex-1" />

      {/* 액션 버튼 */}
      {actionsPlacement === "end" ? actionsNode : null}
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
      <span className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-md bg-[#111827] px-2.5 py-1.5 text-[11px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100">
          {/* 위 꼬리 */}
          <span className="absolute bottom-full right-3 border-4 border-transparent border-b-[#111827]" />
          {action.tooltip}
      </span>
    </>
  );

  const commonClass = cn(
    "group relative inline-flex h-8 w-8 items-center justify-center rounded-md shadow-sm transition-[background-color,border-color,color,opacity] duration-[500ms]",
    variantClass,
    action.hidden
      ? "pointer-events-none opacity-0"
      : action.disabled
        ? "pointer-events-none opacity-40"
        : "opacity-100"
  );
  const hiddenProps = action.hidden
    ? {
        "aria-hidden": true,
        tabIndex: -1,
      }
    : {};

  if (action.href) {
    return (
      <Link
        aria-label={action.tooltip}
        className={commonClass}
        to={action.href}
        {...hiddenProps}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      aria-label={action.tooltip}
      className={commonClass}
      disabled={action.disabled || action.hidden}
      type="button"
      onClick={action.onClick}
      {...hiddenProps}
    >
      {inner}
    </button>
  );
}
