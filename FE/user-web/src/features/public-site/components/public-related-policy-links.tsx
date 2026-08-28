import {
  Info,
  LockKeyhole,
  Scale,
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
  readonly description: string;
  readonly icon: LucideIcon;
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
      description: "OneHand가 고객 업무를 더 쉽게 관리하려는 이유입니다.",
      to: "/about",
      icon: Info,
    },
    {
      title: "보안",
      description: "고객 기록, 접근 권한, 인프라를 보호하는 기준입니다.",
      to: "/security",
      icon: ShieldCheck,
    },
    {
      title: "개인정보 처리방침",
      description: "OneHand가 정보를 수집, 사용, 보호하는 방법입니다.",
      to: "/privacy",
      icon: LockKeyhole,
    },
    {
      title: "서비스 이용약관",
      description: "OneHand 사용과 계정 관리에 관한 규칙입니다.",
      to: "/terms",
      icon: Scale,
    },
  ],
  "en-US": [
    {
      title: "About OneHand",
      description: "Why OneHand exists and how it supports customer work.",
      to: "/about",
      icon: Info,
    },
    {
      title: "Security",
      description: "How OneHand protects customer records, access, and infrastructure.",
      to: "/security",
      icon: ShieldCheck,
    },
    {
      title: "Privacy Policy",
      description: "How OneHand collects, uses, and protects information.",
      to: "/privacy",
      icon: LockKeyhole,
    },
    {
      title: "Terms of Service",
      description: "The rules for using OneHand and managing account access.",
      to: "/terms",
      icon: Scale,
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
          description={item.description}
          icon={item.icon}
          key={item.to}
          title={item.title}
          titleAs="h2"
          to={item.to}
        />
      ))}
    </div>
  );
}
