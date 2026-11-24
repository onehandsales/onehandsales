import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { findHelpArticle, helpArticlePath, helpRelatedIds } from "../data/help-catalog";
import { portalSections } from "../data/portal-sections";
import { useHelpReading } from "../hooks/use-help-reading";
import { HelpFeedback } from "./help-feedback";
import { HelpOutbound } from "./help-outbound";
import type { HelpOutboundKind } from "./help-outbound";
import { PortalArticleBody } from "./portal-article-body";
// 기능 : 확인된 포털 기사와 다른 기사 참조의 미수록 상태를 같은 로컬 경로 체계에서 표시한다.
export function HelpArticle({ id }: { id: string }) {
  const article = findHelpArticle(id); const location = useLocation(); const active = useHelpReading();
  const [outbound, setOutbound] = useState<HelpOutboundKind | null>(null);
  const supportOrigin: unknown = location.state?.supportOrigin; const helpOrigin: unknown = location.state?.helpOrigin;
  const origin = typeof supportOrigin === "string" && /^\/support(?:[?#]|$)/.test(supportOrigin) ? supportOrigin : typeof helpOrigin === "string" && /^\/help(?:[/?#]|$)/.test(helpOrigin) ? helpOrigin : "/help";
  // 기능 : 같은 기사에서도 이력이 바뀌면 이전 위치의 영상·브랜딩 안내를 닫는다.
  useEffect(function closeOnNavigation() { setOutbound(null); }, [location.key]);
  if (!article) return <section className="help-container help-index"><h1>Article not found</h1><p>This article ID is not included in the local reference.</p><Link to="/help">Back to Help Center</Link></section>;
  return <div className="help-container help-detail"><nav className="help-breadcrumb" aria-label="Help breadcrumb"><Link to="/help">All Collections</Link> › <Link to={`/help/collections/${article.collectionId}`}>{article.collectionId === "96965" ? "General Questions & Overview" : "Invoicing & Getting Paid"}</Link>{article.bodyAvailable && <> › <Link to="/help/collections/2521928">Business Plan Features</Link></>} ›<span>{article.title}</span></nav>
    <div className="help-article-grid"><article><h1>{article.title}</h1>{article.bodyAvailable ? <><p className="help-subtitle">What is my branded client portal and how can I use it with my clients?</p><p className="help-updated">Updated over a week ago</p><PortalArticleBody open={setOutbound} /><section className="help-related"><h2>Related Articles</h2><div>{helpRelatedIds.map(relatedId => <Link key={relatedId} to={helpArticlePath(relatedId)} state={{ helpOrigin: location.pathname + location.search + location.hash, helpReturnState: location.state }}>{findHelpArticle(relatedId)?.title}<ChevronRight aria-hidden="true" size={15} /></Link>)}</div></section><HelpFeedback key={article.id} articleId={article.id} /><p className="help-reference-note">Historical reference content. The update label is copied from the capture, not today's date. Account access, plans and messages are not changed by this article.</p></> : <section className="help-missing"><h2>Article body not provided</h2><p>The reference confirms this title and article ID, but does not include its body. No answer or support result has been invented.</p><p>Reference destination: <span className="help-source-url">{article.sourceHref}</span></p></section>}<Link className="help-back" to={origin} state={location.state?.helpReturnState ?? null}>Back to previous help page</Link></article>
      {article.bodyAvailable && <aside className="help-toc" aria-label="On this page">{portalSections.map(section => <Link key={section.id} to={{ pathname: location.pathname, search: location.search, hash: `#${section.id}` }} state={location.state} replace preventScrollReset aria-current={active === section.id ? "location" : undefined} onClick={() => document.getElementById(section.id)?.scrollIntoView()}>{section.title}</Link>)}</aside>}
    </div>{outbound && <HelpOutbound kind={outbound} onClose={() => setOutbound(null)} />}</div>;
}
