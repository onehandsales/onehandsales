import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

export type FinalSectionCopy = {
  readonly title: string;
  readonly description: string;
  readonly primaryCta: string;
  readonly secondaryCta: string;
};

type FinalSectionProps = {
  readonly copy?: Partial<FinalSectionCopy>;
};

const landingFinalSectionHeightClassName = "landing-final-section-height";

// 기능 : 공개 랜딩의 마지막 섹션을 렌더링합니다.
export function FinalSection({ copy: copyOverride }: FinalSectionProps) {
  const publicSitePath = usePublicSitePath();
  const { copy: publicSiteCopy } = usePublicSiteLanguage();
  const copy = {
    title: publicSiteCopy.landing.finalCta,
    description: "",
    primaryCta: publicSiteCopy.landing.finalPrimary,
    secondaryCta: publicSiteCopy.landing.finalSecondary,
    ...copyOverride,
  };

  return (
    <>
      <FinalSectionStyles />
      <section
        className={`${landingFinalSectionHeightClassName} flex flex-col bg-white`}
      >
        <div className="flex flex-1 items-center justify-center text-center">
          <div className="landing-container">
            <h2 className="break-keep text-[36px] font-normal leading-tight text-[#0f0f0f] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[78px]">
              {copy.title}
            </h2>
            {copy.description ? (
              <p className="landing-final-copy mt-4 break-keep text-[16px] font-normal leading-7 text-[#555550]">
                {copy.description}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white hover:bg-[#336FE0]"
                to={publicSitePath("/signup")}
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center rounded-[6px] bg-white px-5 text-[15px] font-normal text-[#4880EE] hover:bg-[#EFF6FF]"
                to={publicSitePath("/contact")}
              >
                {copy.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FinalSectionStyles() {
  return (
    <style>
      {`
        .landing-container {
          width: calc(100% - 32px);
          max-width: 1100px;
          margin-inline: auto;
        }

        .landing-final-copy {
          max-width: 620px;
          margin-inline: auto;
        }

        .landing-final-section-height {
          box-sizing: border-box;
          min-height: 100vh;
          min-height: 100svh;
          min-height: 100dvh;
          min-height: var(--landing-viewport-height, 100dvh);
        }

        @media (min-width: 640px) {
          .landing-container {
            width: calc(100% - 48px);
          }
        }

        @media (min-width: 1024px) {
          .landing-container {
            width: calc(100% - 64px);
          }

          .landing-final-section-height {
            min-height: calc(100vh - 400px);
          }
        }
      `}
    </style>
  );
}
