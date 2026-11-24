import { useLocation } from "react-router-dom";
import { usePublicExperience } from "../data/public-context";
import { publicHistoryIndex } from "../model/public-origin";

// 기능 : 같은 탭의 현재 URL·이력 위치·메모리 수명을 공개 화면의 복귀 정보로 만든다.
export function usePublicOrigin() {
  const location = useLocation();
  const { scope } = usePublicExperience();
  const index = publicHistoryIndex();
  return index === undefined ? undefined : { path: location.pathname + location.search + location.hash, key: location.key, index, scope };
}
