import { Link, useLocation } from "react-router-dom";
import { blogCategories } from "../data/article-catalog";
import type { BlogArticle } from "../data/article-catalog";
import { useBlogSearch } from "../hooks/use-blog-search";

// 기능 : 목록·추천에서 같은 기사 ID와 출발 이력으로 상세를 연다.
export function ArticleCard({ article }: { article: BlogArticle }) {
  const location = useLocation();
  return <article className="blog-card"><Link to={article.path} state={{ articleReturnTo: location.pathname + location.search, articleFromKey: location.key }}>
    <img className="blog-card-image" src={article.image} alt="" width="310" height="180" /><p className="blog-card-category">{article.category}</p><h2>{article.title}</h2></Link>
    {article.summary && <p className="blog-card-summary">{article.summary}</p>}
    {article.author && <p className="blog-card-author">{article.portrait && <img src={article.portrait} alt="" width="30" height="30" />}{article.author}</p>}</article>;
}

// 기능 : 공개 글 검색·분류·페이지·재시도와 자료 부재 상태를 연결한다.
export function BlogList() {
  const search = useBlogSearch();
  const data = search.result.data;
  return <><section className="blog-hero"><h1>Bonsai Business Software Blog</h1><p>Insights from thousands of business owners<br />on growing your business.</p></section>
    <section className="blog-list" aria-label="Blog articles">
      <label className="sr-only" htmlFor="blog-search">Search articles</label>
      <input className="blog-search" id="blog-search" type="search" placeholder="Search" maxLength={256} value={search.draft} onChange={event => search.setDraft(event.currentTarget.value)} onCompositionStart={() => search.setComposing(true)} onCompositionEnd={() => search.setComposing(false)} />
      <nav className="blog-categories" aria-label="Article categories">{blogCategories.map(category => <button key={category} type="button" aria-pressed={search.category === category} onClick={() => search.selectCategory(category)}>{category}</button>)}</nav>
      <div className="blog-results" aria-busy={search.result.isFetching}>
        {search.result.isPending ? <p className="blog-status" role="status">Loading articles…</p> : search.result.isError ? <div className="blog-status" role="alert"><p>{search.result.error.message}</p><button className="public-button" type="button" onClick={() => void search.result.refetch()}>Try again</button></div>
          : data && <>{data.items.length ? <div className="blog-grid">{data.items.map(article => <ArticleCard key={article.id} article={article} />)}</div> : <div className="blog-status" role="status"><h2>{data.categoryEmpty ? "No articles available" : "No matching articles"}</h2><p>{data.categoryEmpty ? "This preview has no confirmed articles for this category." : "Try a different search or clear your search."}</p>{search.draft && <button className="public-button" type="button" onClick={() => search.setDraft("")}>Clear search</button>}</div>}
          <nav className="blog-pagination" aria-label="Article pages">{data.page > 1 && <button type="button" onClick={() => search.selectPage(data.page - 1)}>‹ Previous</button>}<span aria-live="polite">{data.page} / {data.pages}</span>{data.page < data.pages && <button type="button" onClick={() => search.selectPage(data.page + 1)}>Next ›</button>}</nav></>}
      </div>
    </section></>;
}
