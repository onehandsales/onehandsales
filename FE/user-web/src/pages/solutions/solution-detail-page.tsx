import {
  CalendarClock,
  ListChecks,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  FinalSection,
  PublicContentContainer,
  PublicDocumentHero,
  PublicDocumentSection,
  PublicInfoCard,
  PublicPageSection,
  PublicSitePageShell,
  PublicTableOfContents,
} from "@/features/public-site";
import { publicSiteImages } from "@/features/public-site/constants/public-site-assets";
import { usePublicProductImage } from "@/features/public-site/use-public-product-image";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";

export type SolutionUseCaseId =
  | "personal"
  | "real-estate"
  | "insurance-auto"
  | "b2b-field";

type SolutionDetailCardCopy = {
  readonly description: string;
  readonly title: string;
};

type SolutionDetailSectionCopy = {
  readonly bullets: readonly string[];
  readonly id: string;
  readonly paragraphs: readonly string[];
  readonly title: string;
};

type SolutionDetailCopy = {
  readonly cards: readonly [
    SolutionDetailCardCopy,
    SolutionDetailCardCopy,
    SolutionDetailCardCopy,
  ];
  readonly contentsLabel: string;
  readonly ctaDescription: string;
  readonly ctaTitle: string;
  readonly description: string;
  readonly imageAlt: string;
  readonly imageCaption: string;
  readonly sections: readonly SolutionDetailSectionCopy[];
  readonly title: string;
};

type SolutionDetailPageProps = {
  readonly solutionId: SolutionUseCaseId;
};

const detailCardIcons: readonly [LucideIcon, LucideIcon, LucideIcon] = [
  UsersRound,
  CalendarClock,
  ListChecks,
];

const solutionImageById: Record<SolutionUseCaseId, string> = {
  personal: publicSiteImages.solutionPersonal,
  "real-estate": publicSiteImages.solutionRealEstate,
  "insurance-auto": publicSiteImages.solutionInsuranceAuto,
  "b2b-field": publicSiteImages.solutionB2bField,
};

const solutionDetailCopyByLanguage: Record<
  PublicSiteCopyLanguage,
  Record<SolutionUseCaseId, SolutionDetailCopy>
> = {
  ko: {
    personal: {
      title: "혼자 관리하는 고객과 업무 기록을 한곳에.",
      description:
        "기억에 의존하던 정보를 남기고, 필요할 때 다시 꺼내 확인하는 활용 예시예요.",
      imageAlt: "예시 데이터로 개인 고객 기록을 관리하는 실제 OneHand CRM 화면",
      imageCaption: "실제 OneHand CRM 화면에 예시 데이터를 표시했어요. 업종별 자동 설정 화면은 아니에요.",
      cards: [
        {
          title: "내 기록 모으기",
          description:
            "관리할 고객과 업무 정보를 기록해요.",
        },
        {
          title: "바뀐 정보 수정",
          description:
            "업무에서 새롭게 확인한 정보는 목록에서 수정해요.",
        },
        {
          title: "빠르게 다시 찾기",
          description:
            "현재 목록에서 검색하고 자주 보는 화면을 즐겨찾기에 모아둬요.",
        },
      ],
      contentsLabel: "개인 업무 활용 예시",
      sections: [
        {
          id: "customer-context",
          title: "내 기록 모으기",
          paragraphs: [
            "관리할 고객과 업무 정보를 기록해요.",
          ],
          bullets: [
            "고객 정보를 기록으로 남겨요.",
            "지원하는 정보 칸에 내용을 입력해요.",
            "등록한 내용을 목록에서 확인해요.",
          ],
        },
        {
          id: "follow-up",
          title: "바뀐 정보 수정",
          paragraphs: [
            "업무에서 새롭게 확인한 정보는 목록에서 수정해요.",
          ],
          bullets: [
            "변경된 내용을 확인해요.",
            "편집 가능한 셀에서 정보를 고쳐요.",
            "저장 결과를 확인해요.",
          ],
        },
        {
          id: "simple-pipeline",
          title: "빠르게 다시 찾기",
          paragraphs: [
            "현재 목록에서 검색하고 자주 보는 화면을 즐겨찾기에 모아둬요.",
          ],
          bullets: [
            "현재 목록의 기록을 검색해요.",
            "필요한 보기를 선택해요.",
            "즐겨찾기로 다시 접속해요.",
          ],
        },
      ],
      ctaTitle: "내 업무 기록부터 정리해 볼까요?",
      ctaDescription:
        "현재 기능으로 가능한 범위를 확인하고, 필요한 활용 방법을 데모 요청에서 알려주세요.",
    },
    "real-estate": {
      title: "고객과 매물 정보를 다시 찾기 쉽게.",
      description:
        "상담에서 확인할 고객·매물 정보를 기록으로 정리하는 활용 예시예요. 업종별 자동 설정 기능은 현재 제공하지 않아요.",
      imageAlt: "예시 매물명과 지역 정보를 표시한 실제 OneHand CRM 테이블",
      imageCaption: "실제 OneHand CRM 화면에 예시 데이터를 표시했어요. 업종별 자동 설정 화면은 아니에요.",
      cards: [
        {
          title: "고객 정보 정리",
          description:
            "고객별로 확인할 정보를 현재 지원하는 정보 칸에 기록해요.",
        },
        {
          title: "매물 정보 확인",
          description:
            "관리하는 매물의 정보를 목록에서 확인하는 활용 예시예요.",
        },
        {
          title: "상담 전에 다시 확인",
          description:
            "필요한 기록을 찾아 상담 전에 살펴보세요.",
        },
      ],
      contentsLabel: "부동산 중개 활용 예시",
      sections: [
        {
          id: "client-needs",
          title: "고객 정보 정리",
          paragraphs: [
            "고객별로 확인할 정보를 현재 지원하는 정보 칸에 기록해요.",
          ],
          bullets: [
            "확인할 고객을 기록해요.",
            "화면에서 지원하는 정보를 입력해요.",
            "변경된 내용을 수정해요.",
          ],
        },
        {
          id: "visits",
          title: "매물 정보 확인",
          paragraphs: [
            "관리하는 매물의 정보를 목록에서 확인하는 활용 예시예요.",
          ],
          bullets: [
            "매물 정보를 기록으로 정리해요.",
            "등록한 내용을 목록에서 살펴봐요.",
            "화면은 예시 데이터로 구성했어요.",
          ],
        },
        {
          id: "deal-readiness",
          title: "상담 전에 다시 확인",
          paragraphs: [
            "필요한 기록을 찾아 상담 전에 살펴보세요.",
          ],
          bullets: [
            "현재 목록에서 검색해요.",
            "자주 보는 화면을 즐겨찾기에 추가해요.",
            "방문 예약·계약 처리·매물 자동 추천은 미제공이에요.",
          ],
        },
      ],
      ctaTitle: "내 업무 기록부터 정리해 볼까요?",
      ctaDescription:
        "현재 기능으로 가능한 범위를 확인하고, 필요한 활용 방법을 데모 요청에서 알려주세요.",
    },
    "insurance-auto": {
      title: "고객별로 다시 확인할 상담 정보를 정리해요.",
      description:
        "반복되는 상담에서 필요한 정보를 남기고 다시 확인하는 활용 예시예요. 전용 업무 자동화는 현재 제공하지 않아요.",
      imageAlt: "예시 상담 기록을 상태별로 표시한 실제 OneHand CRM 칸반 화면",
      imageCaption: "실제 OneHand CRM 화면에 예시 데이터를 표시했어요. 업종별 자동 설정 화면은 아니에요.",
      cards: [
        {
          title: "고객 정보",
          description:
            "다음 상담에서 확인할 고객 정보를 기록해요.",
        },
        {
          title: "상담 내용",
          description:
            "새롭게 확인한 내용을 기록하고 변경된 정보를 수정해요.",
        },
        {
          title: "상태 확인",
          description:
            "칸반 보기가 마련된 목록에서 상태별로 기록을 확인해요.",
        },
      ],
      contentsLabel: "보험·자동차 상담 활용 예시",
      sections: [
        {
          id: "consultation",
          title: "고객 정보",
          paragraphs: [
            "다음 상담에서 확인할 고객 정보를 기록해요.",
          ],
          bullets: [
            "현재 지원하는 정보 칸을 사용해요.",
            "다음에 확인할 내용을 남겨요.",
            "예시 화면은 실제 고객 데이터가 아니에요.",
          ],
        },
        {
          id: "quotes",
          title: "상담 내용",
          paragraphs: [
            "새롭게 확인한 내용을 기록하고 변경된 정보를 수정해요.",
          ],
          bullets: [
            "관리할 기록을 추가해요.",
            "목록에서 정보를 수정해요.",
            "필요한 기록을 검색해요.",
          ],
        },
        {
          id: "relationship",
          title: "상태 확인",
          paragraphs: [
            "칸반 보기가 마련된 목록에서 상태별로 기록을 확인해요.",
          ],
          bullets: [
            "이용 가능한 보기를 선택해요.",
            "같은 상태의 기록을 살펴봐요.",
            "견적 자동 발송·보험료 산출·갱신 알림은 미제공이에요.",
          ],
        },
      ],
      ctaTitle: "내 업무 기록부터 정리해 볼까요?",
      ctaDescription:
        "현재 기능으로 가능한 범위를 확인하고, 필요한 활용 방법을 데모 요청에서 알려주세요.",
    },
    "b2b-field": {
      title: "회사와 담당자 정보를 한곳에서 정리해요.",
      description:
        "업무에서 만나는 회사와 담당자 정보를 기록하고 다시 확인하는 활용 예시예요.",
      imageAlt: "예시 회사와 담당자 정보를 표시한 실제 OneHand CRM 테이블",
      imageCaption: "실제 OneHand CRM 화면에 예시 데이터를 표시했어요. 업종별 자동 설정 화면은 아니에요.",
      cards: [
        {
          title: "회사 정보",
          description:
            "거래하거나 상담하는 회사의 정보를 기록해요.",
        },
        {
          title: "담당자 정보",
          description:
            "업무에서 확인한 담당자 정보를 남기고 변경된 내용을 수정해요.",
        },
        {
          title: "기록 검색",
          description:
            "다음 업무 전에 필요한 기록을 다시 찾아보세요.",
        },
      ],
      contentsLabel: "B2B 고객 관리 활용 예시",
      sections: [
        {
          id: "accounts",
          title: "회사 정보",
          paragraphs: [
            "거래하거나 상담하는 회사의 정보를 기록해요.",
          ],
          bullets: [
            "관리할 회사 정보를 남겨요.",
            "현재 지원하는 정보 칸을 채워요.",
            "등록한 기록을 목록에서 확인해요.",
          ],
        },
        {
          id: "meeting-notes",
          title: "담당자 정보",
          paragraphs: [
            "업무에서 확인한 담당자 정보를 남기고 변경된 내용을 수정해요.",
          ],
          bullets: [
            "확인한 정보를 기록해요.",
            "편집 가능한 값을 수정해요.",
            "예시 화면은 실제 고객 데이터가 아니에요.",
          ],
        },
        {
          id: "pipeline",
          title: "기록 검색",
          paragraphs: [
            "다음 업무 전에 필요한 기록을 다시 찾아보세요.",
          ],
          bullets: [
            "현재 목록에서 검색해요.",
            "즐겨찾기한 보기를 열어요.",
            "이메일·미팅 기록의 자동 수집은 미제공이에요.",
          ],
        },
      ],
      ctaTitle: "내 업무 기록부터 정리해 볼까요?",
      ctaDescription:
        "현재 기능으로 가능한 범위를 확인하고, 필요한 활용 방법을 데모 요청에서 알려주세요.",
    },
  },
  "en-US": {
    personal: {
      title: "Your customer and work records, together.",
      description:
        "Keep information you would otherwise rely on memory for, then find it when you need it.",
      imageAlt: "Actual OneHand CRM customer table using illustrative personal-work data",
      imageCaption: "Actual OneHand CRM interface with illustrative sample data, not an automatically configured industry workspace.",
      cards: [
        {
          title: "Keep your records together",
          description:
            "Record the customer and work information you manage.",
        },
        {
          title: "Update information",
          description:
            "Update supported details in the table as your work changes.",
        },
        {
          title: "Find it again",
          description:
            "Search the current collection and save useful views as favorites.",
        },
      ],
      contentsLabel: "Personal work example",
      sections: [
        {
          id: "customer-context",
          title: "Keep your records together",
          paragraphs: [
            "Record the customer and work information you manage.",
          ],
          bullets: [
            "Add customer records.",
            "Fill in supported information fields.",
            "Review the saved information.",
          ],
        },
        {
          id: "follow-up",
          title: "Update information",
          paragraphs: [
            "Update supported details in the table as your work changes.",
          ],
          bullets: [
            "Review what has changed.",
            "Edit supported values in their cells.",
            "Check the save result.",
          ],
        },
        {
          id: "simple-pipeline",
          title: "Find it again",
          paragraphs: [
            "Search the current collection and save useful views as favorites.",
          ],
          bullets: [
            "Search the current collection.",
            "Choose an available view.",
            "Return through favorites.",
          ],
        },
      ],
      ctaTitle: "Start with the records you manage.",
      ctaDescription:
        "Review the current feature scope and tell us about your workflow when requesting a demo.",
    },
    "real-estate": {
      title: "Keep customer and property details easy to find.",
      description:
        "An example of organizing information for property work. Automatic industry-specific setup is not currently available.",
      imageAlt: "Actual OneHand CRM table showing illustrative property names and areas",
      imageCaption: "Actual OneHand CRM interface with illustrative sample data, not an automatically configured industry workspace.",
      cards: [
        {
          title: "Customer information",
          description:
            "Keep customer information in the fields currently supported.",
        },
        {
          title: "Property information",
          description:
            "See an example of reviewing property information in a table.",
        },
        {
          title: "Review before a conversation",
          description:
            "Find the records you need before your next conversation.",
        },
      ],
      contentsLabel: "Real estate example",
      sections: [
        {
          id: "client-needs",
          title: "Customer information",
          paragraphs: [
            "Keep customer information in the fields currently supported.",
          ],
          bullets: [
            "Add the customers you manage.",
            "Fill in the available information fields.",
            "Update changed information.",
          ],
        },
        {
          id: "visits",
          title: "Property information",
          paragraphs: [
            "See an example of reviewing property information in a table.",
          ],
          bullets: [
            "Organize property information as records.",
            "Review the information in the table.",
            "The screen uses illustrative sample data.",
          ],
        },
        {
          id: "deal-readiness",
          title: "Review before a conversation",
          paragraphs: [
            "Find the records you need before your next conversation.",
          ],
          bullets: [
            "Search the current collection.",
            "Save useful views as favorites.",
            "Visit bookings, contract processing, and automatic property matching are not available.",
          ],
        },
      ],
      ctaTitle: "Start with the records you manage.",
      ctaDescription:
        "Review the current feature scope and tell us about your workflow when requesting a demo.",
    },
    "insurance-auto": {
      title: "Keep information for your next customer conversation.",
      description:
        "An example of recording and reviewing consultation information. Dedicated industry automation is not currently available.",
      imageAlt: "Actual OneHand CRM board showing illustrative consultation records by status",
      imageCaption: "Actual OneHand CRM interface with illustrative sample data, not an automatically configured industry workspace.",
      cards: [
        {
          title: "Customer information",
          description:
            "Keep the information you need for your next consultation.",
        },
        {
          title: "Consultation information",
          description:
            "Record what you learn and update changed information.",
        },
        {
          title: "Review by status",
          description:
            "Use an available board view to review records grouped by status.",
        },
      ],
      contentsLabel: "Insurance and auto example",
      sections: [
        {
          id: "consultation",
          title: "Customer information",
          paragraphs: [
            "Keep the information you need for your next consultation.",
          ],
          bullets: [
            "Use the information fields currently supported.",
            "Record what you need to review later.",
            "The screenshot does not contain real customer data.",
          ],
        },
        {
          id: "quotes",
          title: "Consultation information",
          paragraphs: [
            "Record what you learn and update changed information.",
          ],
          bullets: [
            "Add the records you manage.",
            "Edit supported information in the table.",
            "Search for the record you need.",
          ],
        },
        {
          id: "relationship",
          title: "Review by status",
          paragraphs: [
            "Use an available board view to review records grouped by status.",
          ],
          bullets: [
            "Choose an available view.",
            "Review records in each status.",
            "Automatic quotes, premium calculations, and renewal reminders are not available.",
          ],
        },
      ],
      ctaTitle: "Start with the records you manage.",
      ctaDescription:
        "Review the current feature scope and tell us about your workflow when requesting a demo.",
    },
    "b2b-field": {
      title: "Keep company and contact information together.",
      description:
        "An example of recording and reviewing the companies and contacts you work with.",
      imageAlt: "Actual OneHand CRM table with illustrative company and contact information",
      imageCaption: "Actual OneHand CRM interface with illustrative sample data, not an automatically configured industry workspace.",
      cards: [
        {
          title: "Company information",
          description:
            "Record information about the companies you work with.",
        },
        {
          title: "Contact information",
          description:
            "Keep contact information and update it when it changes.",
        },
        {
          title: "Find a record",
          description:
            "Review the information you need before your next task.",
        },
      ],
      contentsLabel: "B2B customer work example",
      sections: [
        {
          id: "accounts",
          title: "Company information",
          paragraphs: [
            "Record information about the companies you work with.",
          ],
          bullets: [
            "Add company information.",
            "Fill in the supported information fields.",
            "Review records in the table.",
          ],
        },
        {
          id: "meeting-notes",
          title: "Contact information",
          paragraphs: [
            "Keep contact information and update it when it changes.",
          ],
          bullets: [
            "Record the information you have confirmed.",
            "Edit supported values.",
            "The screenshot does not contain real customer data.",
          ],
        },
        {
          id: "pipeline",
          title: "Find a record",
          paragraphs: [
            "Review the information you need before your next task.",
          ],
          bullets: [
            "Search the current collection.",
            "Open a favorite view.",
            "Automatic email and meeting capture are not available.",
          ],
        },
      ],
      ctaTitle: "Start with the records you manage.",
      ctaDescription:
        "Review the current feature scope and tell us about your workflow when requesting a demo.",
    },
  },
};

// 기능 : SolutionDetailPage 화면을 렌더링합니다.
export function SolutionDetailPage({ solutionId }: SolutionDetailPageProps) {
  // 1. 처리 흐름에 필요한 { language } 값을 준비한다.
  const { language } = usePublicSiteLanguage();
  const productImage = usePublicProductImage(solutionImageById[solutionId], language);
  // 2. 이후 단계에서 사용할 copy 값을 준비한다.
  const copy =
    solutionDetailCopyByLanguage[getPublicSiteCopyLanguage(language)][solutionId];
  // 3. 이후 단계에서 사용할 tocItems 값을 준비한다.
  const tocItems = copy.sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  // 4. 계산된 결과를 호출자에게 반환한다.
  return (
    <PublicSitePageShell>
      <PublicPageSection>
        <PublicContentContainer>
          <PublicDocumentHero title={copy.title} />

          <div className="mt-16">
            <p className="max-w-[720px] break-keep text-[15px] leading-7 text-[#555550]">
              {copy.description}
            </p>

            <figure className="mt-10 overflow-hidden rounded-[10px] border border-[#eeeeec] bg-white p-2 shadow-sm">
              <img
                alt={copy.imageAlt}
                className="h-[260px] w-full rounded-[8px] object-cover sm:h-[340px] lg:h-[420px]"
                decoding="async"
                loading="eager"
                src={productImage}
              />
              <figcaption className="px-2 pb-1 pt-3 break-keep text-[12px] font-normal leading-5 text-[#777770]">
                {copy.imageCaption}
              </figcaption>
            </figure>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {copy.cards.map((card, cardIndex) => {
                const Icon = detailCardIcons[cardIndex];

                return (
                  <PublicInfoCard
                    description={card.description}
                    icon={Icon}
                    key={card.title}
                    title={card.title}
                  />
                );
              })}
            </div>
          </div>

          <PublicTableOfContents
            className="mt-12"
            items={tocItems}
            label={copy.contentsLabel}
          />

          <div className="mt-12 grid gap-12">
            {copy.sections.map((section) => (
              <PublicDocumentSection
                bullets={section.bullets}
                id={section.id}
                key={section.id}
                paragraphs={section.paragraphs}
                title={section.title}
              />
            ))}
          </div>
        </PublicContentContainer>
      </PublicPageSection>
      <FinalSection
        copy={{
          description: copy.ctaDescription,
          title: copy.ctaTitle,
        }}
      />
    </PublicSitePageShell>
  );
}
