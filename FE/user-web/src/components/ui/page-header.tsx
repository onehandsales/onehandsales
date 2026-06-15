import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

type PageHeaderProps = {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly backHref?: string;
  readonly backLabel?: string;
  readonly className?: string;
};

// 기능 : 목록/상세 페이지 상단 헤더 컴포넌트입니다.
export function PageHeader({
  title,
  actions,
  backHref,
  backLabel,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div>
        {backHref ? (
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            to={backHref}
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel ?? "뒤로"}
          </Link>
        ) : null}
        <h1 className={cn("text-2xl font-semibold", backHref ? "mt-3" : "")}>
          {title}
        </h1>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
