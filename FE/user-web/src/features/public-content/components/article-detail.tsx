import { Link, useLocation } from "react-router-dom";
import { SignupForm, SignupLink, PublicLink, readPublicOrigin, usePublicExperience } from "@/features/public-web";
import type { PublicIntentOptions } from "@/features/public-web";
import { allArticles, recommendedArticles } from "../data/article-catalog";
import { articleSections } from "../data/article-sections";
import { useArticleReading } from "../hooks/use-article-reading";
import { ArticleCard } from "./blog-list";
import { ArticleBackLink, ArticleLink } from "./article-links";
import { ArticleParagraph } from "./article-paragraph";

// 기능 : 기사 상하단의 관찰된 가입 문구를 같은 로컬 가입 인계에 연결한다.
function ArticleBanner({ intentOptions }: { intentOptions: PublicIntentOptions }) { return <aside className="article-banner"><p>Integrate your proposals, contracts, invoices,<br />and more with Bonsai.</p><SignupLink source="blog-article-banner" intentOptions={intentOptions}>Try it free</SignupLink></aside>; }

// 기능 : 확인된 기사 메타데이터와 본문 일부·목차·가입 CTA를 재현하고 미수록 본문을 구분한다.
export function ArticleDetail({ slug }: { slug: string }) {
  const location = useLocation();
  const { scope } = usePublicExperience();
  const intentOptions = { returnTo: location.pathname + location.search + location.hash, returnOrigin: readPublicOrigin(location.state?.articleOrigin, scope) };
  const article = allArticles.find(item => item.id === slug);
  const { active, showSignup } = useArticleReading();
  if (!article) return <section className="article-unavailable"><ArticleBackLink /><h1>Article not available</h1><p>This article is not included in the confirmed preview content.</p></section>;
  if (!article.hasObservedDetail) return <section className="article-unavailable"><ArticleBackLink /><p>{article.category}</p><h1>{article.title}</h1><p>{article.author}</p><img src={article.image} alt="" /><p>{article.summary}</p><p className="article-evidence-note">이 글의 목록 정보는 확인됐지만, 상세 본문은 이번 시안에 수록되지 않았습니다.</p></section>;
  return <article className="article-page">
    <header className="article-heading"><ArticleBackLink /><h1>{article.title}</h1><p className="article-tags"><Link to="/blog?category=Start+a+business">#Start a business</Link><PublicLink href="/software/agencies">#Agencies</PublicLink></p><p className="article-read-time">8 minute read</p><ArticleBanner intentOptions={intentOptions} />
      <div className="article-byline"><p><img src={article.portrait} alt="" />{article.author}</p><p>Updated on: &nbsp;December 11, 2022</p></div>
    </header>
    <div className="article-columns">
      <nav className="article-toc" aria-label="Table of contents"><h2>Table of contents</h2>{articleSections.map(section => <Link key={section.id} to={{ pathname: location.pathname, search: location.search, hash: `#${section.id}` }} state={location.state} replace aria-current={active === section.id ? "location" : undefined}>{section.title}</Link>)}</nav>
      <div id="article-body" className="article-body">
        <div className="article-intro"><p>Digital marketing is an ever-evolving industry, forcing businesses to stay agile in order to survive and constantly get new clients to sign <PublicLink href="/templates/contracts">contract templates</PublicLink> or <PublicLink href="/templates/agreements">agreement templates with</PublicLink>.</p><p>When you’re trying to figure out how to start a digital marketing agency, or <ArticleLink to="/blog/what-is-a-creative-agency">what is a creative agency</ArticleLink>, there are many pitfalls awaiting you. It’s easy to get lost in the storm, and many new ventures crash before they ever really get going.</p><p>You need a solid strategy for success from the very outset. Here are seven essential steps that you should take to get your agency off the ground and maybe be one day among the <ArticleLink to="/blog/top-digital-agencies">top digital agencies</ArticleLink>.</p></div>
        {articleSections.map(section => <section key={section.id} aria-labelledby={section.id}><h2 id={section.id} tabIndex={-1}>{section.title}</h2>{section.paragraphs.map(paragraph => <ArticleParagraph key={paragraph} text={paragraph} />)}{section.list && <ul>{section.list.map(item => <li key={item}>{item}</li>)}</ul>}{section.image && <img className="article-inline-image" src={section.image} alt="A small team working together in a library" width="424" height="282" />}{section.partial && <p className="article-evidence-note">이 구간은 캡처에서 본문 일부 또는 제목만 확인되어, 미수록 문단은 표시하지 않습니다.</p>}</section>)}
        <p><SignupLink source="blog-article-ending" className="article-inline-signup" intentOptions={intentOptions}>Sign-up with Bonsai</SignupLink> today to start your agency off on the right foot.</p><figure className="article-award"><img src="/bonsai-blog/softwareworld.png" alt="SoftwareWorld Top Rated Task Management Software" width="180" height="180" /><figcaption>Bonsai rated as Top Task<br />Management Software<br />by SoftwareWorld</figcaption></figure><ArticleBanner intentOptions={intentOptions} />
      </div>
      <aside className={`article-recommended ${active && active !== "personal-foundation" && active !== "next-level" ? "is-visible" : ""}`} aria-label="Recommended articles">{recommendedArticles.map(item => <ArticleCard key={item.id} article={item} />)}</aside>
    </div>
    {showSignup && <aside className="article-signup"><p>Integrate your proposals, contracts, invoices, and more<br />with Bonsai.</p><SignupForm source="blog-sticky-email" buttonLabel="Get started" intentOptions={intentOptions} /></aside>}
  </article>;
}
