import {
  FileText,
  Info,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { PublicInfoCard } from "@/features/public-site/components/public-content-layout";
import type { PublicSiteLocalizedPath } from "@/features/public-site/i18n/public-site-locale-routes";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";
import { cn } from "@/utils/cn";

type RelatedPolicyPath = Extract<
  PublicSiteLocalizedPath,
  "/about" | "/security" | "/privacy" | "/terms"
>;

type RelatedPolicyLink = {
  readonly icon: LucideIcon;
  readonly iconClassName?: string;
  readonly title: string;
  readonly to: RelatedPolicyPath;
};

type PublicRelatedPolicyLinksProps = {
  readonly className?: string;
  readonly currentPath: RelatedPolicyPath;
};

const relatedPolicyLinksByLanguage: Record<
  PublicSiteCopyLanguage,
  readonly RelatedPolicyLink[]
> = {
  ko: [
    {
      title: "OneHand 소개",
      to: "/about",
      icon: Info,
      iconClassName: "text-[#9CA3AF]",
    },
    {
      title: "보안",
      to: "/security",
      icon: Shield,
      iconClassName: "text-[#9CA3AF]",
    },
    {
      title: "개인정보 처리방침",
      to: "/privacy",
      icon: ShieldCheck,
      iconClassName: "shrink-0 text-[#9CA3AF]",
    },
    {
      title: "서비스 이용약관",
      to: "/terms",
      icon: FileText,
      iconClassName: "shrink-0 text-[#9CA3AF]",
    },
  ],
  "en-US": [
    {
      title: "About OneHand",
      to: "/about",
      icon: Info,
      iconClassName: "text-[#9CA3AF]",
    },
    {
      title: "Security",
      to: "/security",
      icon: Shield,
      iconClassName: "text-[#9CA3AF]",
    },
    {
      title: "Privacy Policy",
      to: "/privacy",
      icon: ShieldCheck,
      iconClassName: "shrink-0 text-[#9CA3AF]",
    },
    {
      title: "Terms of Service",
      to: "/terms",
      icon: FileText,
      iconClassName: "shrink-0 text-[#9CA3AF]",
    },
  ],
};

const actionLabelByLanguage: Record<PublicSiteCopyLanguage, string> = {
  ko: "열기",
  "en-US": "Open",
};

// 기능 : 공개 문서 페이지에서 현재 페이지를 제외한 관련 페이지 링크 3개를 렌더링합니다.
export function PublicRelatedPolicyLinks({
  className,
  currentPath,
}: PublicRelatedPolicyLinksProps) {
  const { language } = usePublicSiteLanguage();
  const copyLanguage = getPublicSiteCopyLanguage(language);
  const relatedLinks = relatedPolicyLinksByLanguage[copyLanguage].filter(
    (link) => link.to !== currentPath
  );

  return (
    <div
      className={cn("grid gap-4 md:grid-cols-3", className)}
      data-section="public-related-policy-links"
    >
      {relatedLinks.map((item) => (
        <PublicInfoCard
          actionLabel={actionLabelByLanguage[copyLanguage]}
          className="min-h-[176px]"
          icon={item.icon}
          iconClassName={item.iconClassName}
          key={item.to}
          title={item.title}
          titleAs="h2"
          titleLayout="inline"
          to={item.to}
        />
      ))}
    </div>
  );
}
