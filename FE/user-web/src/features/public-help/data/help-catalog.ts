import content from "./help-content.json";
export const helpCollections = content.collections;
export const helpArticles = content.articles;
export const helpPopularIds = content.popular;
export const helpFaqLinks = content.faq;
export const helpRelatedIds = content.related;
export type HelpArticleRecord = (typeof helpArticles)[number];
// 기능 : 제목이 달라진 과거 slug도 숫자 기사 ID 하나로 찾아 동일 문서에 연결한다.
export function findHelpArticle(value = "") { return helpArticles.find(article => article.id === value.split("-")[0]); }
// 기능 : 제목·확인된 alias의 검색과 분류 조건을 함께 적용하며 미수록 본문은 검색하지 않는다.
export function selectHelpArticles(query: string, collectionId?: string, empty = false) {
  const term = query.trim().toLocaleLowerCase();
  return empty ? [] : helpArticles.filter(article => (!collectionId || article.collectionId === collectionId || collectionId === "2521928" && article.id === "4409019") && article.aliases.some(title => title.toLocaleLowerCase().includes(term)));
}
// 기능 : 공개 도움말 ID를 일관된 로컬 기사 경로로 바꾼다.
export function helpArticlePath(id: string) { return `/help/articles/${id}`; }
