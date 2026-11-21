import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { readCategory } from "../data/article-catalog";
import { createArticleReader } from "../data/article-reader";
import type { BlogCategory } from "../data/article-catalog";

// 기능 : URL 검색과 로컬 지연 조회를 조정하고 취소된 응답이 최신 결과를 덮지 못하게 한다.
export function useBlogSearch() {
  const [params, setParams] = useSearchParams();
  const { state } = usePreviewEnvironment();
  const category = readCategory(params.get("category"));
  const query = (params.get("q") ?? "").slice(0, 256);
  const rawPage = Number(params.get("page"));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [draft, setDraft] = useState(query);
  const [composing, setComposing] = useState(false);
  const [readArticles] = useState(createArticleReader);
  // 기능 : 뒤로·앞으로 이동에서 저장한 검색어를 입력 초안으로 복원한다.
  useEffect(function restoreSearchDraft() { setDraft(query); }, [query]);
  // 기능 : 입력 조합이 끝난 초안만 지연 반영하고 이전 예약을 취소한다.
  useEffect(function debounceSearchDraft() {
    if (composing || draft === query) return;
    const timer = window.setTimeout(commitDraft, 200);
    // 기능 : 분류는 유지하고 새 검색을 첫 페이지로 반영한다.
    function commitDraft() { const next = new URLSearchParams(params); next.delete("page"); if (draft) next.set("q", draft); else next.delete("q"); setParams(next, { replace: true, preventScrollReset: true }); }
    return () => window.clearTimeout(timer);
  }, [draft, query, composing, params, setParams]);
  // 기능 : 현재 URL과 검증 범위의 스냅샷을 메모리 공급자에 전달한다.
  async function readLocalArticles({ signal }: { signal: AbortSignal }) {
    return readArticles({ category, query, page, scenario: state.scenario, revision: state.revision }, signal);
  }
  const result = useQuery({ queryKey: ["public-blog", state.revision, state.scenario, category, query, page], queryFn: readLocalArticles, retry: false, staleTime: Infinity });
  // 기능 : 입력 중인 검색어도 함께 보존하면서 선택 분류의 첫 페이지로 이동한다.
  function selectCategory(value: BlogCategory) { const next = new URLSearchParams(); next.set("category", value); if (draft) next.set("q", draft); setParams(next, { preventScrollReset: true }); }
  // 기능 : 페이지 이동 이력을 만들고 검색·분류를 유지한다.
  function selectPage(value: number) { const next = new URLSearchParams(params); next.set("page", String(value)); setParams(next, { preventScrollReset: true }); }
  return { draft, setDraft, setComposing, category, query, result, selectCategory, selectPage };
}
