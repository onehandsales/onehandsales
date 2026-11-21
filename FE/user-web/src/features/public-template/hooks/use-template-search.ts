import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearchParams } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { readTemplateType } from "../data/template-catalog";
import { createTemplateReader } from "../data/template-reader";

// 기능 : 검색 조합·유형·업종·페이지와 실제 브라우저 이력을 단일 URL 상태로 연결한다.
export function useTemplateSearch() {
  const [params, setParams] = useSearchParams();
  const { pathname } = useLocation();
  const { state } = usePreviewEnvironment();
  const type = readTemplateType(params.get("type") ?? pathname.split("/")[2] ?? null);
  const industry = params.get("industry") ?? "";
  const query = (params.get("q") ?? "").slice(0, 256);
  const page = Number(params.get("page")) || 1;
  const [draft, setDraft] = useState(query);
  const [composing, setComposing] = useState(false);
  const [read] = useState(createTemplateReader);
  // 기능 : 뒤로 이동 시 해당 이력의 검색 초안을 복원한다.
  useEffect(function restoreDraft() { setDraft(query); }, [query]);
  // 기능 : 입력 조합 중 조회를 보류하고 마지막 검색 의도만 반영한다.
  useEffect(function debounceDraft() {
    if (composing || query === draft) return;
    // 기능 : 검색 변경에서 기존 유형·업종을 보존하고 첫 페이지로 이동한다.
    function commitDraft() { const next = new URLSearchParams(params); next.delete("page"); if (draft) next.set("q", draft); else next.delete("q"); setParams(next, { replace: true, preventScrollReset: true }); }
    const timer = window.setTimeout(commitDraft, 200);
    return () => window.clearTimeout(timer);
  }, [query, draft, composing, params, setParams]);
  // 기능 : 검증 범위와 검색 조건에 해당하는 로컬 카탈로그만 조회한다.
  async function readCurrent({ signal }: { signal: AbortSignal }) { return read({ type, industry, query, page, scenario: state.scenario, revision: state.revision }, signal); }
  const result = useQuery({ queryKey: ["public-templates", state.revision, state.scenario, type, industry, query, page], queryFn: readCurrent, retry: false, staleTime: Infinity });
  // 기능 : 다른 필터와 입력 초안을 유지하면서 선택한 조건만 변경한다.
  function select(key: "type" | "industry" | "page", value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); if (key !== "page") next.delete("page"); if (draft) next.set("q", draft); else next.delete("q"); setParams(next, { preventScrollReset: true }); }
  return { type, industry, draft, setDraft, setComposing, select, result };
}
