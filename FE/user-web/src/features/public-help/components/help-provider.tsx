import { useState } from "react";
import type { ReactNode } from "react";
import { HelpContext } from "../data/help-context";
import type { HelpReaction } from "../data/help-context";
// 기능 : 도움말 방문 동안 기사별 피드백을 유지하고 레이아웃 이탈에서 폐기한다.
export function HelpProvider({ children }: { children: ReactNode }) {
  const [reactions, setReactions] = useState<Record<string, HelpReaction>>({});
  // 기능 : 마지막 성공한 선택만 해당 기사의 로컬 표시 상태에 반영한다.
  function save(id: string, value: HelpReaction) { setReactions(current => ({ ...current, [id]: value })); }
  return <HelpContext.Provider value={{ reactions, save }}>{children}</HelpContext.Provider>;
}
