import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { publicHistoryIndex, readPublicOrigin, usePublicExperience } from "@/features/public-web";

// 의미 : 현재 앱에서 직접 관찰한 이력만 보관하며 새 공급자·Reset 때 이전 탭 수명의 기록을 폐기한다.
let historyScope = "";
const entries = new Map<number, { key: string; path: string }>();

// 기능 : 공통 라우트에서 방문·교체·분기된 이력을 기록해 외부 안내의 오래된 출발 정보를 거부한다.
export function useCompanyHistory() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { scope } = usePublicExperience();
  // 기능 : 현재 이력 위치를 갱신하고 새 이동으로 잘린 앞으로 이력을 제거한다.
  useLayoutEffect(function recordCompanyHistory() {
    if (historyScope !== scope) { entries.clear(); historyScope = scope; }
    const index = publicHistoryIndex();
    if (index === undefined) return;
    if (navigationType === "PUSH") {
      for (const entryIndex of entries.keys()) if (entryIndex >= index) entries.delete(entryIndex);
    }
    entries.set(index, { key: location.key, path: location.pathname + location.search + location.hash });
  }, [location, navigationType, scope]);
}

// 기능 : 같은 메모리 수명에서 아직 존재하는 출발 주소·키·이력 위치가 모두 일치할 때만 복귀를 허용한다.
export function readCompanyOrigin(value: unknown, scope: string) {
  const origin = readPublicOrigin(value, scope);
  const observed = origin && historyScope === scope ? entries.get(origin.index) : undefined;
  return observed?.key === origin?.key && observed?.path === origin?.path ? origin : undefined;
}
