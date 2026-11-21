import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useHelpSearch } from "../hooks/use-help-search";
import { findHelpArticle, helpArticlePath, helpCollections, helpPopularIds } from "../data/help-catalog";
// 기능 : 도움말 홈·분류·검색 결과·언어 미제공을 각각 구분해 같은 기사 ID로 연결한다.
export function HelpIndex() {
  const search = useHelpSearch(); const location = useLocation();
  const collection = helpCollections.find(item => item.id === search.collectionId);
  const collectionName = collection?.name ?? (search.collectionId === "2521928" ? "Business Plan Features" : "Collection not included");
  const home = !search.query && !search.collectionId; const StateHeading = home ? "h2" : "h1"; const available = search.result.data ?? [];
  return <div className="help-container help-index" aria-busy={search.result.isLoading}>
    {search.locale !== "en" ? <section><h1>Language unavailable</h1><p>Only English reference content is available in this preview.</p><Link to={location.pathname}>View English content</Link></section>
      : search.result.isLoading ? <p role="status">Loading help articles…</p>
      : search.result.isError ? <section role="alert"><StateHeading>Help could not be loaded</StateHeading><p>{search.result.error.message}</p><button type="button" onClick={() => void search.result.refetch()}>Try again</button></section>
      : search.emptyScenario ? <section><StateHeading>No help articles available</StateHeading><p>The local empty-data scenario contains no articles.</p></section>
      : home ? <><section className="help-popular"><h2>Popular Articles</h2><div>{helpPopularIds.map(id => <Link key={id} to={helpArticlePath(id)} state={{ helpOrigin: location.pathname + location.search }}>{findHelpArticle(id)?.title}<ChevronRight aria-hidden="true" size={15} /></Link>)}</div></section><div className="help-collections">{helpCollections.map(item => <Link key={item.id} className="help-collection" to={`/help/collections/${item.id}`}><span className="help-collection-icon"><img src={item.icon} alt="" /></span><h2>{item.name}</h2><p>{item.description}</p><small>{item.articleCount} articles</small></Link>)}</div></>
      : <><nav aria-label="Help breadcrumb"><Link to="/help">All Collections</Link>{search.collectionId && <> › {collectionName}</>}</nav><h1>{search.query ? `Search results for “${search.query}”` : collectionName}</h1>{collection && <p>{collection.description}</p>}<p className="help-reference-note">{available.length} article references in this preview. Historical collection counts include material not supplied here.</p>
        {available.length ? <div className="help-result-list">{available.map(article => <Link key={article.id} to={helpArticlePath(article.id)} state={{ helpOrigin: location.pathname + location.search }}>{article.title}<ChevronRight aria-hidden="true" size={16} /></Link>)}</div> : <p role="status">{search.query ? "No articles match this search." : "Article bodies for this collection are not included in the supplied reference."}</p>}
      </>}
  </div>;
}
