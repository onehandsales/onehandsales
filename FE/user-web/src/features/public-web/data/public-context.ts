import { createContext, useContext } from "react";

export type PublicIntent = { source: string; email: string; returnTo: "/" };
export type PublicExperience = {
  email: string;
  intent: PublicIntent | null;
  setEmail: (email: string) => void;
  start: (source: string, includeEmail?: boolean) => void;
  clear: () => void;
};
export const PublicContext = createContext<PublicExperience | null>(null);

// 기능 : 공개 입력과 가입 인계의 단일 메모리 상태를 소비한다.
export function usePublicExperience() {
  const value = useContext(PublicContext);
  if (!value) throw new Error("Public experience provider is missing");
  return value;
}
