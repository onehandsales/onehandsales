import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { readTemplateType, templateIndustries } from "../data/template-catalog";
import { createTemplateReader } from "../data/template-reader";

// 기능 : 검색 조합·유형·업종·페이지와 실제 브라우저 이력을 단일 URL 상태로 연결한다.
export function useTemplateSearch() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = usePreviewEnvironment();
  const type = readTemplateType(params.get("type") ?? location.pathname.split("/")[2] ?? null);
  const rawIndustry = params.get("industry") ?? "";
  const industry = templateIndustries.includes(rawIndustry) ? rawIndustry : "";
  const query = (params.get("q") ?? "").slice(0, 256);
  const rawPage = Number(params.get("page"));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [input, setInput] = useState({ key: location.key, revision: state.revision, value: query, composing: false });
  const currentInput = input.key === location.key && input.revision === state.revision;
  const draft = currentInput ? input.value : query;
  const composing = currentInput && input.composing;
  const [read] = useState(createTemplateReader);
  // 기능 : 떠난 이력의 미확정 입력과 조합을 폐기해 앞으로 이동해도 되살리지 않는다.
  useEffect(function discardDepartedInput() {
    setInput({ key: location.key, revision: state.revision, value: query, composing: false });
  }, [location.key, state.revision, query]);
  // 기능 : 현재 이력과 검증 범위에 속한 초안만 갱신한다.
  function setDraft(value: string) {
    // 기능 : 같은 프레임의 조합 시작을 보존하면서 마지막 입력을 기록한다.
    setInput(function updateDraft(previous) {
      const sameInput = previous.key === location.key && previous.revision === state.revision;
      return { key: location.key, revision: state.revision, value: value.slice(0, 256), composing: sameInput && previous.composing };
    });
  }
  // 기능 : 조합 확정이 최신 글자를 이전 초안으로 덮지 않도록 현재 입력에서 상태를 바꾼다.
  function setComposing(value: boolean) {
    // 기능 : 다른 이력에서 끝난 조합은 현재 URL의 확정 검색어를 사용한다.
    setInput(function updateComposition(previous) {
      const sameInput = previous.key === location.key && previous.revision === state.revision;
      return { key: location.key, revision: state.revision, value: sameInput ? previous.value : query, composing: value };
    });
  }
  // 기능 : 입력 조합 중 조회를 보류하고 마지막 검색 의도만 반영한다.
  useEffect(function debounceDraft() {
    if (composing || query === draft) return;
    // 기능 : 검색 변경에서 기존 유형·업종을 보존하고 첫 페이지로 이동한다.
    function commitDraft() {
      const next = new URLSearchParams(params); next.delete("page");
      if (draft) next.set("q", draft); else next.delete("q");
      void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, preventScrollReset: true, state: location.state });
    }
    const timer = window.setTimeout(commitDraft, 200);
    // 기능 : 이력·검증 범위가 바뀌면 이전 입력의 예약 반영을 취소한다.
    return function cancelDraft() { window.clearTimeout(timer); };
  }, [query, draft, composing, params, navigate, location, state.revision]);
  // 기능 : 검증 범위와 검색 조건에 해당하는 로컬 카탈로그만 조회한다.
  async function readCurrent({ signal }: { signal: AbortSignal }) { return read({ type, industry, query, page, scenario: state.scenario, revision: state.revision }, signal); }
  const result = useQuery({ queryKey: ["public-templates", state.revision, state.scenario, type, industry, query, page], queryFn: readCurrent, retry: false, staleTime: Infinity });
  // 기능 : 잘못된 필터와 페이지를 실제 표시값으로 정규화하며 다른 URL 조건을 보존한다.
  useEffect(function normalizeSearchUrl() {
    if (composing || draft !== query) return;
    const next = new URLSearchParams(params);
    if (params.has("type")) {
      if (type === "All" && !location.pathname.split("/")[2]) next.delete("type"); else next.set("type", type);
    }
    if (params.has("industry") && !industry) next.delete("industry");
    if (params.has("q") && params.get("q") !== query) next.set("q", query);
    if (params.has("page")) {
      const effectivePage = result.data?.page ?? page;
      if (effectivePage === 1) next.delete("page"); else next.set("page", String(effectivePage));
    }
    if (next.toString() !== params.toString()) void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, preventScrollReset: true, state: location.state });
  }, [type, industry, composing, draft, query, page, result.data?.page, params, navigate, location]);
  // 기능 : 새 선택은 미확정 조합을 제외하고 query·hash·출발 상태를 함께 보존한다.
  function select(key: "type" | "industry" | "page", value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page" || !composing && draft !== query || value === "1" && key === "page") next.delete("page");
    const selectedQuery = composing ? query : draft;
    if (selectedQuery) next.set("q", selectedQuery); else next.delete("q");
    void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { preventScrollReset: true, state: location.state });
  }
  // 기능 : 명시적인 검색 지우기는 조합·예약 입력·페이지를 함께 초기화한다.
  function clearSearch() {
    const next = new URLSearchParams(params); next.delete("q"); next.delete("page");
    void navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, preventScrollReset: true, state: location.state });
  }
  return { type, industry, draft, setDraft, setComposing, clearSearch, select, result };
}
