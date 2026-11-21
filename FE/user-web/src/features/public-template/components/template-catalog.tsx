import { SignupLink } from "@/features/public-web";
import { templateIndustries, templateTypes } from "../data/template-catalog";
import { useTemplateSearch } from "../hooks/use-template-search";
import { TemplateCard } from "./template-card";

// 기능 : 유형·업종·검색·페이지 결과와 로컬 조회의 빈 상태·실패·재시도를 표시한다.
export function TemplateCatalog() {
  const search = useTemplateSearch();
  const { result } = search;
  return <div className="template-catalog public-container">
    <section className="template-catalog-hero"><h1>Templates</h1><p>Ready-to-use contracts, briefs, proposals and more. Find one that suits your<br className="template-desktop-break" /> needs and your industry among 500+ templates.</p><SignupLink source="template-catalog">Start for Free</SignupLink></section>
    <div className="template-type-filters" aria-label="Template types">{templateTypes.map(type => <button key={type} type="button" aria-pressed={search.type === type} onClick={() => search.select("type", type)}>{type}</button>)}</div>
    <div className="template-catalog-layout"><aside className="template-industries" aria-label="Template industries"><h2 className="sr-only">Industry</h2><button type="button" aria-label="All industries" aria-pressed={!search.industry} onClick={() => search.select("industry", "")}>All</button>{templateIndustries.map(industry => <button type="button" key={industry} aria-pressed={search.industry === industry} onClick={() => search.select("industry", industry)}>{industry}</button>)}</aside>
      <section className="template-results" aria-label="Template results" aria-busy={result.isFetching}><label className="template-search">Search templates<input type="search" maxLength={256} value={search.draft} onChange={event => search.setDraft(event.currentTarget.value)} onCompositionStart={() => search.setComposing(true)} onCompositionEnd={() => search.setComposing(false)} /></label>
        {result.isPending ? <p role="status">Loading templates…</p> : result.isError ? <div role="alert"><p>{result.error.message}</p><button type="button" className="public-button" onClick={() => void result.refetch()}>Try again</button></div> : result.data.items.length ? <><div className="template-grid">{result.data.items.map(item => <TemplateCard key={item.id} item={item} />)}</div><nav className="template-pagination" aria-label="Template pages"><button type="button" disabled={result.data.page === 1} onClick={() => search.select("page", String(result.data.page - 1))}>‹ Previous</button><span>{result.data.page} / {result.data.pages}</span><button type="button" disabled={result.data.page === result.data.pages} onClick={() => search.select("page", String(result.data.page + 1))}>Next ›</button></nav></> : <div className="template-empty"><h2>{result.data.empty ? "No templates available" : "No matching templates"}</h2><p>{result.data.empty ? "The preview catalog is empty." : "Try another type, industry or search."}</p><button type="button" onClick={() => search.setDraft("")}>Clear search</button></div>}
      </section></div>
  </div>;
}
