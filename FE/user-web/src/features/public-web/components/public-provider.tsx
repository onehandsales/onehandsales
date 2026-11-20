import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PublicContext } from "../data/public-context";
import type { PublicIntent } from "../data/public-context";

// 기능 : 새로고침과 검증 범위 초기화에서 폐기되는 공개 이메일·가입 인계를 제공한다.
export function PublicProvider({ children, resetRevision }: { children: ReactNode; resetRevision: number }) {
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<PublicIntent | null>(null);
  // 기능 : 가상 사용자·시나리오·초기화 범위가 바뀌면 이전 공개 초안을 제거한다.
  useEffect(function clearPreviousScope() { setEmail(""); setIntent(null); }, [resetRevision]);
  // 기능 : 출처와 선택한 이메일을 로컬 인계로 고정하며 실제 가입을 실행하지 않는다.
  function start(source: string, includeEmail = false) {
    setIntent({ source, email: includeEmail ? email.trim() : "", returnTo: "/" });
  }
  // 기능 : 명시적인 취소에서 공개 초안과 인계를 함께 폐기한다.
  function clear() { setEmail(""); setIntent(null); }
  return <PublicContext.Provider value={{ email, intent, setEmail, start, clear }}>{children}</PublicContext.Provider>;
}
