import { PublicLink, SignupLink } from "@/features/public-web";
import { introductionAssets } from "../data/introduction-data";
import type { IntroductionContent } from "../data/introduction-data";

// 기능 : 소개 이미지와 기능 요약을 실제 업무 조작 없이 표시한다.
export function IntroductionOverview({ page }: { page: IntroductionContent }) {
  return <section className="intro-overview public-container">
    <h2>{page.overviewTitle}</h2>
    {page.overviewImage && <img className="intro-overview-image" src={page.overviewImage} alt={`${page.title} dashboard illustration`} />}
    <div className={`intro-feature-grid ${page.id === "crm" ? "intro-feature-cards" : ""}`}>
      {page.features.map((feature, index) => <article key={`${feature.title}-${index}`}><img src={feature.icon} alt="" /><h3>{feature.title}</h3><p>{feature.text}</p></article>)}
    </div>
    {page.id !== "crm" && <SignupLink source={`${page.id}-overview`}>Try it for free</SignupLink>}
  </section>;
}

// 기능 : 원본 인물·인용·직함을 소개별 정적인 후기 카드로 표시한다.
export function IntroductionTestimonial({ page }: { page: IntroductionContent }) {
  const paragraphs = page.testimonial.paragraphs;
  return <section className={`intro-testimonial-section ${page.id === "crm" ? "has-contour" : ""}`}>
    <figure className="intro-testimonial public-container">
      <img src={page.testimonial.image} alt={paragraphs.at(-1)} />
      <figcaption><blockquote>{paragraphs.slice(0, -1).map((paragraph, index) => <p key={paragraph}>{index === 0 ? "“" : ""}{paragraph}{index === paragraphs.length - 2 ? "”" : ""}</p>)}</blockquote><p className="intro-attribution">{paragraphs.at(-1)}</p></figcaption>
    </figure>
  </section>;
}

// 기능 : 관찰 본문과 날짜가 확인된 보완 본문의 홍보 이미지·설명·가입 인계를 표시한다.
export function IntroductionBanners({ page }: { page: IntroductionContent }) {
  return <div className={`intro-banners ${page.id === "crm" ? "public-container intro-crm-banners" : "public-wide"}`}>
    {page.banners.map((banner, index) => <section className={`intro-banner intro-banner-${index} ${index % 2 === (page.id === "crm" ? 0 : 1) ? "is-reversed" : ""}`} key={banner.title}>
      <div className="intro-banner-art">
        {banner.leaf && <img className="intro-banner-leaf" src={introductionAssets.bannerLeaf} alt="" />}
        {banner.images.map((image, imageIndex) => <img key={image} className={`intro-banner-image intro-banner-image-${imageIndex}`} src={image} alt={imageIndex === 0 ? `${banner.title} illustration` : ""} />)}
      </div>
      <div className="intro-banner-copy"><h2>{banner.title}</h2>{banner.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<SignupLink source={`${page.id}-feature-${index}`}>Get started</SignupLink></div>
    </section>)}
  </div>;
}

// 기능 : 소개에 연결된 두 기능 카드를 제품 경계 또는 가입 경계로 인계한다.
export function IntroductionTiles({ page }: { page: IntroductionContent }) {
  return <section className={`${page.id === "crm" ? "public-container intro-explore" : "public-wide intro-stat-tiles"}`}>
    {page.id === "crm" && <h2>Keep exploring Bonsai’s<br />features</h2>}
    <div className="intro-tile-grid">{page.tiles.map((tile, index) => <article key={tile.title}>
      <img src={tile.image} alt={page.id === "crm" ? "" : `${tile.title} illustration`} />
      <h3>{tile.title}</h3><p>{tile.text}</p>
      {page.id === "crm" ? <PublicLink href={tile.href} className="public-button">View more</PublicLink> : <SignupLink source={`${page.id}-tile-${index}`}>Get started</SignupLink>}
      {index === 1 && <img className="intro-tile-leaf" src={introductionAssets.leaf} alt="" />}
    </article>)}</div>
  </section>;
}
