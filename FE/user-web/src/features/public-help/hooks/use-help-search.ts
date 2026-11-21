import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { usePreviewEnvironment } from "@/features/preview";
import { createHelpReader } from "../data/help-reader";
// 기능 : 검색어·분류·언어·검증 범위를 캐시 키에 반영해 오래된 결과를 분리한다.
export function useHelpSearch() {
  const [params] = useSearchParams(); const { collectionId } = useParams(); const { state } = usePreviewEnvironment();
  const query = (params.get("q") ?? "").slice(0, 256).trim(); const locale = params.get("lang") ?? "en";
  const [readHelp] = useState(createHelpReader);
  const result = useQuery({ queryKey: ["public-help", state.revision, state.scenario, collectionId, query, locale], retry: false, staleTime: Infinity,
    // 기능 : 취소 신호를 가진 현재 조건만 로컬 공급자에 전달한다.
    queryFn: ({ signal }) => readHelp({ query, collectionId, scenario: state.scenario, revision: state.revision }, signal), enabled: locale === "en" });
  return { query, collectionId, locale, result, emptyScenario: state.scenario === "empty" };
}
