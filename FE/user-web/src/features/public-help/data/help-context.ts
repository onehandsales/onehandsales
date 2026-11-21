import { createContext, useContext } from "react";
export type HelpReaction = "negative" | "neutral" | "positive";
type HelpContextValue = { reactions: Record<string, HelpReaction>; save: (id: string, value: HelpReaction) => void };
export const HelpContext = createContext<HelpContextValue | null>(null);
// 기능 : 현재 도움말 방문 범위의 기사별 피드백 메모리를 읽는다.
export function useHelpExperience() { const value = useContext(HelpContext); if (!value) throw new Error("Help provider required"); return value; }
