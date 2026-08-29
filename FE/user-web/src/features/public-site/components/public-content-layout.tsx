import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { cn } from "@/utils/cn";

type PublicContentContainerProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

type PublicPageSectionProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly tone?: "white" | "muted";
};

type PublicDocumentHeroProps = {
  readonly align?: "left" | "center";
  readonly children?: ReactNode;
  readonly className?: string;
  readonly description?: ReactNode;
  readonly descriptionClassName?: string;
  readonly eyebrow?: ReactNode;
  readonly title: ReactNode;
  readonly titleClassName?: string;
};

type PublicInfoCardProps = {
  readonly actionLabel?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly description?: ReactNode;
  readonly icon?: LucideIcon;
  readonly iconClassName?: string;
  readonly iconWrapClassName?: string;
  readonly title?: ReactNode;
  readonly titleAs?: "h2" | "h3" | "h4";
  readonly titleClassName?: string;
  readonly titleLayout?: "stacked" | "inline";
  readonly to?: string;
};

type PublicTableOfContentsItem = {
  readonly id: string;
  readonly title: string;
};

type PublicTableOfContentsProps = {
  readonly className?: string;
  readonly items: readonly PublicTableOfContentsItem[];
  readonly label?: ReactNode;
  readonly numbered?: boolean;
};

type PublicDocumentSectionProps = {
  readonly bullets?: readonly string[];
  readonly children?: ReactNode;
  readonly className?: string;
  readonly id?: string;
  readonly paragraphs?: readonly string[];
  readonly title: ReactNode;
};

type PublicCtaPanelAction = {
  readonly label: ReactNode;
  readonly to: string;
};

type PublicCtaPanelProps = {
  readonly align?: "left" | "center";
  readonly children?: ReactNode;
  readonly className?: string;
  readonly description?: ReactNode;
  readonly icon?: LucideIcon;
  readonly primaryAction?: PublicCtaPanelAction;
  readonly secondaryAction?: PublicCtaPanelAction;
  readonly title: ReactNode;
  readonly tone?: "blue" | "neutral";
};

// 기능 : 공개 정보 페이지의 콘텐츠 폭을 1100px 기준으로 제한합니다.
export function PublicContentContainer({
  children,
  className,
}: PublicContentContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

// 기능 : 공개 정보 페이지의 기본 섹션 배경과 상하 여백을 렌더링합니다.
export function PublicPageSection({
  children,
  className,
  tone = "white",
}: PublicPageSectionProps) {
  return (
    <section
      className={cn(
        tone === "muted" ? "bg-[#FAFAF8]" : "bg-white",
        "py-16 sm:py-20 lg:py-24",
        className,
      )}
    >
      {children}
    </section>
  );
}

// 기능 : 공개 문서형 페이지의 상단 제목 영역을 렌더링합니다.
export function PublicDocumentHero({
  align = "left",
  children,
  className,
  description,
  descriptionClassName,
  eyebrow,
  title,
  titleClassName,
}: PublicDocumentHeroProps) {
  const isCentered = align === "center";

  return (
    <div className={cn(isCentered ? "text-center" : "", className)}>
      {eyebrow ? (
        <p className="text-[13px] font-normal text-[#777770]">{eyebrow}</p>
      ) : null}
      <h1
        className={cn(
          "mt-3 max-w-[760px] break-keep text-[40px] font-normal leading-[1.05] tracking-normal md:text-[58px]",
          isCentered ? "mx-auto" : "",
          titleClassName,
        )}
      >
        {title}
      </h1>
      {description ? (
        <div
          className={cn(
            "mt-4 max-w-[720px] break-keep text-[15px] leading-7 text-[#555550]",
            isCentered ? "mx-auto" : "",
            descriptionClassName,
          )}
        >
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      ) : null}
      {children}
    </div>
  );
}

// 기능 : 공개 정보 페이지에서 반복되는 정보 카드와 내부 링크 카드를 렌더링합니다.
export function PublicInfoCard({
  actionLabel,
  children,
  className,
  description,
  icon: Icon,
  iconClassName,
  iconWrapClassName,
  title,
  titleAs = "h3",
  titleClassName,
  titleLayout = "stacked",
  to,
}: PublicInfoCardProps) {
  const publicSitePath = usePublicSitePath();
  const TitleTag = titleAs;
  const shouldInlineTitle = titleLayout === "inline" && Boolean(Icon && title);
  const iconElement = Icon ? (
    <span
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#0075DE]",
        iconWrapClassName,
      )}
    >
      <Icon className={cn("h-5 w-5", iconClassName)} />
    </span>
  ) : null;
  const titleElement = title ? (
    <TitleTag
      className={cn(
        !shouldInlineTitle && Icon ? "mt-5" : "",
        "break-keep text-[18px] font-normal text-[#222220]",
        titleClassName,
      )}
    >
      {title}
    </TitleTag>
  ) : null;
  const content = (
    <>
      {shouldInlineTitle ? (
        <div className="flex items-center gap-3">
          {iconElement}
          {titleElement}
        </div>
      ) : (
        <>
          {iconElement}
          {titleElement}
        </>
      )}
      {description ? (
        <div className="mt-2 break-keep text-[13px] leading-6 text-[#555550]">
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      ) : null}
      {children}
      {actionLabel ? (
        <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-normal text-[#0075DE]">
          {actionLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      ) : null}
    </>
  );
  const cardClassName = cn(
    "group rounded-[8px] bg-[#FAFAF8] p-5 transition-colors",
    to ? "hover:bg-[#eeeeec]" : "",
    className,
  );

  if (to) {
    return (
      <Link className={cardClassName} to={publicSitePath(to)}>
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}

// 기능 : 공개 문서형 페이지의 섹션 목차 링크를 렌더링합니다.
export function PublicTableOfContents({
  className,
  items,
  label,
  numbered = false,
}: PublicTableOfContentsProps) {
  return (
    <nav className={cn("rounded-[8px] bg-[#FAFAF8] p-4", className)}>
      {label ? (
        <h3 className="break-keep text-[18px] font-normal leading-tight text-[#222220]">
          {label}
        </h3>
      ) : null}
      <div
        className={cn(
          "grid gap-2 text-[13px] font-normal text-[#555550] sm:grid-cols-2",
          label ? "mt-4" : "",
        )}
      >
        {items.map((item, index) => (
          <a
            className="rounded-[6px] px-2 py-1.5 hover:bg-white hover:text-[#111111]"
            href={`#${item.id}`}
            key={item.id}
          >
            {numbered ? `${index + 1}. ${item.title.replace(/^\d+\.\s*/, "")}` : item.title}
          </a>
        ))}
      </div>
    </nav>
  );
}

// 기능 : 공개 문서형 페이지의 본문 섹션과 문단 목록을 렌더링합니다.
export function PublicDocumentSection({
  bullets,
  children,
  className,
  id,
  paragraphs,
  title,
}: PublicDocumentSectionProps) {
  return (
    <section className={className} id={id}>
      <h2 className="break-keep text-[26px] font-normal leading-tight md:text-[28px]">
        {title}
      </h2>
      {paragraphs ? (
        <div className="mt-4 grid gap-4 break-keep text-[14px] leading-7 text-[#444440]">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {bullets ? (
        <ul className="mt-4 grid gap-2 break-keep text-[14px] leading-7 text-[#444440]">
          {bullets.map((bullet) => (
            <li className="flex gap-3" key={bullet}>
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {children}
    </section>
  );
}

// 기능 : 공개 정보 페이지의 마지막 행동 유도 패널을 렌더링합니다.
export function PublicCtaPanel({
  align = "left",
  children,
  className,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
  title,
  tone = "blue",
}: PublicCtaPanelProps) {
  const publicSitePath = usePublicSitePath();
  const isCentered = align === "center";

  return (
    <section
      className={cn(
        "rounded-[8px] p-6",
        tone === "blue" ? "bg-[#eef6ff]" : "bg-[#FAFAF8]",
        isCentered ? "text-center" : "",
        className,
      )}
    >
      <div
        className={cn(
          "flex gap-4",
          isCentered ? "flex-col items-center" : "items-start",
        )}
      >
        {Icon ? (
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#0075DE]",
              tone === "neutral" ? "bg-white" : "",
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <div className={cn("min-w-0", isCentered ? "mx-auto max-w-[720px]" : "")}>
          <h2 className="break-keep text-[20px] font-normal leading-tight md:text-[24px]">
            {title}
          </h2>
          {description ? (
            <div className="mt-3 break-keep text-[14px] leading-7 text-[#444440]">
              {typeof description === "string" ? <p>{description}</p> : description}
            </div>
          ) : null}
          {(primaryAction || secondaryAction) ? (
            <div
              className={cn(
                "mt-5 flex flex-wrap gap-3",
                isCentered ? "justify-center" : "",
              )}
            >
              {primaryAction ? (
                <Link
                  className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-[#0075DE] px-4 text-[13px] font-normal text-white hover:bg-[#006AC8]"
                  to={publicSitePath(primaryAction.to)}
                >
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link
                  className="inline-flex h-9 items-center rounded-[6px] bg-white px-4 text-[13px] font-normal text-[#0075DE] hover:bg-[#eeeeec]"
                  to={publicSitePath(secondaryAction.to)}
                >
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
