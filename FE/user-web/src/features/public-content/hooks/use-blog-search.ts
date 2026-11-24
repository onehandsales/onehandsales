import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { readCategory } from "../data/article-catalog";
import { createArticleReader } from "../data/article-reader";
import type { BlogCategory } from "../data/article-catalog";

// 기능 : URL 검색과 로컬 지연 조회를 조정하고 취소된 응답이 최신 결과를 덮지 못하게 한다.
export function useBlogSearch() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = usePreviewEnvironment();
  const category = readCategory(params.get("category"));
  const query = (params.get("q") ?? "").slice(0, 256);
  const rawPage = Number(params.get("page"));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [input, setInput] = useState({ key: location.key, revision: state.revision, value: query, composing: false });
  const currentInput = input.key === location.key && input.revision === state.revision;
  const draft = currentInput ? input.value : query;
  const composing = currentInput && input.composing;
  const [readArticles] = useState(createArticleReader);
  // 기능 : 떠난 이력의 미확정 초안을 폐기해 앞으로 가기에서도 되살아나지 않게 한다.
  useEffect(function discardDepartedInput() {
    setInput({ key: location.key, revision: state.revision, value: query, composing: false });
  }, [location.key, state.revision, query]);
  // 기능 : 초안을 현재 방문 이력과 검증 범위에만 연결한다.
  function setDraft(value: string) {
    // 기능 : 같은 프레임에 먼저 시작한 조합 상태를 이전 입력에서 보존한다.
    setInput(function updateDraft(previous) {
      const sameInput = previous.key === location.key && previous.revision === state.revision;
      return { key: location.key, revision: state.revision, value: value.slice(0, 256), composing: sameInput && previous.composing };
    });
  }
  // 기능 : 다른 이력의 조합 상태를 이어받지 않고 현재 입력의 조합 여부만 바꾼다.
  function setComposing(value: boolean) {
    // 기능 : 조합 확정과 같은 프레임에 갱신된 최종 글자를 오래된 초안으로 덮지 않는다.
    setInput(function updateComposition(previous) {
      const sameInput = previous.key === location.key && previous.revision === state.revision;
      return { key: location.key, revision: state.revision, value: sameInput ? previous.value : query, composing: value };
    });
  }
  // 기능 : 입력 조합이 끝난 초안만 지연 반영하고 이전 예약을 취소한다.
  useEffect(function debounceSearchDraft() {
    if (composing || draft === query) return;
    const timer = window.setTimeout(commitDraft, 200);
    // 기능 : 분류는 유지하고 새 검색을 첫 페이지로 반영한다.
    function commitDraft() {
      const next = new URLSearchParams(params); next.delete("page");
      if (draft) next.set("q", draft); else next.delete("q");
      void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, preventScrollReset: true, state: location.state });
    }
    // 기능 : 이력·검증 범위 변경과 이탈에서 이전 검색 예약을 폐기한다.
    return function cancelDraft() { window.clearTimeout(timer); };
  }, [draft, query, composing, params, navigate, location, state.revision]);
  // 기능 : 현재 URL과 검증 범위의 스냅샷을 메모리 공급자에 전달한다.
  async function readLocalArticles({ signal }: { signal: AbortSignal }) {
    return readArticles({ category, query, page, scenario: state.scenario, revision: state.revision }, signal);
  }
  const result = useQuery({ queryKey: ["public-blog", state.revision, state.scenario, category, query, page], queryFn: readLocalArticles, retry: false, staleTime: Infinity });
  // 기능 : 입력 중이 아닐 때 잘못된 분류·페이지·검색 길이를 실제 표시값으로 정규화한다.
  useEffect(function normalizeSearchUrl() {
    if (composing || draft !== query) return;
    const next = new URLSearchParams(params);
    if (params.has("category") && !category) next.delete("category");
    if (params.has("q") && params.get("q") !== query) next.set("q", query);
    if (params.has("page")) {
      const effectivePage = result.data?.page ?? page;
      if (effectivePage === 1) next.delete("page"); else next.set("page", String(effectivePage));
    }
    if (next.toString() !== params.toString()) void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, preventScrollReset: true, state: location.state });
  }, [category, composing, draft, query, page, result.data?.page, params, navigate, location]);
  // 기능 : 새 의도의 확정 검색어·페이지를 기록하며 다른 query·hash·출발 상태를 유지한다.
  function commitSelection(next: URLSearchParams, value: string, replace = false) {
    if (value) next.set("q", value); else next.delete("q");
    void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace, preventScrollReset: true, state: location.state });
  }
  // 기능 : 분류 변경은 첫 페이지로 이동하며 조합 중 글자 대신 마지막 확정 검색어를 사용한다.
  function selectCategory(value: BlogCategory) {
    const next = new URLSearchParams(params); next.set("category", value); next.delete("page");
    commitSelection(next, composing ? query : draft);
  }
  // 기능 : 새 초안이 있으면 새 검색의 첫 페이지를 열고 그 외에는 선택 페이지를 유지한다.
  function selectPage(value: number) {
    const next = new URLSearchParams(params);
    if ((!composing && draft !== query) || value === 1) next.delete("page"); else next.set("page", String(value));
    commitSelection(next, composing ? query : draft);
  }
  // 기능 : 명시적인 초기화는 조합·지연 예약과 페이지를 함께 폐기한다.
  function clearSearch() { const next = new URLSearchParams(params); next.delete("page"); commitSelection(next, "", true); }
  return { draft, setDraft, setComposing, clearSearch, category, query, result, selectCategory, selectPage };
}
