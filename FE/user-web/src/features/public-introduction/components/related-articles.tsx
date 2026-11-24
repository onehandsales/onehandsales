import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePublicOrigin } from "@/features/public-web";
import articles from "../data/related-articles.json";

// 기능 : 관련 글과 미수록 둘째 페이지를 탐색하며 기존 query와 기사 복귀 hash를 보존한다.
export function RelatedArticles() {
  const origin = usePublicOrigin();
  const [params] = useSearchParams();
  const secondPage = params.get("contentPage") === "2";
  const nextParams = new URLSearchParams(params);
  nextParams.set("contentPage", secondPage ? "1" : "2");
  const heading = useRef<HTMLHeadingElement>(null);
  // 기능 : 목록 페이지 이동에서 제목을 읽고 직접 URL 진입에서도 해당 영역을 찾게 한다.
  useEffect(function focusRequestedPage() {
    if (params.has("contentPage")) heading.current?.focus({ preventScroll: true });
  }, [params]);
  return <section className="intro-articles public-container" id="related-content">
    <h2 ref={heading} tabIndex={-1}>More Small businesses content</h2>
    {secondPage ? <div className="intro-content-unavailable"><p>2페이지의 원본 콘텐츠는 아직 확인되지 않았습니다.</p><p>확인된 관련 글은 1페이지에서 볼 수 있습니다.</p></div>
      : <div className="intro-article-grid">{articles.map(article => <article key={article.id}>
        <Link to={article.path} state={{ articleOrigin: origin }}><img className="intro-article-image" src={article.image} alt="" /><p className="intro-article-category">{article.category}</p><h3>{article.title}</h3></Link>
        {article.author && <p className="intro-article-author">{article.portrait && <img src={article.portrait} alt="" />}{article.author}</p>}
      </article>)}</div>}
    <nav className="intro-pagination" aria-label="Related content pages">
      <Link className="public-button" to={`?${nextParams.toString()}#related-content`}>{secondPage ? "Previous ‹" : "Next ›"}</Link>
      <p aria-live="polite">{secondPage ? "2" : "1"} / 2</p>
    </nav>
  </section>;
}
