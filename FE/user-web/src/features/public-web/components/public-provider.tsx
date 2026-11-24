import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { PublicContext } from "../data/public-context";
import type { PublicIntent, PublicIntentOptions } from "../data/public-context";

// 기능 : 새로고침과 검증 범위 초기화에서 폐기되는 공개 이메일·가입 인계를 제공한다.
export function PublicProvider({ children, resetRevision }: { children: ReactNode; resetRevision: number }) {
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [intents, setIntents] = useState<Record<string, PublicIntent>>({});
  // 기능 : 새로고침 전 history ID가 새 메모리 인계와 충돌하지 않도록 실행 범위를 만든다.
  const [memoryId] = useState(() => crypto.randomUUID());
  const sequence = useRef(0);
  // 기능 : 가상 사용자·시나리오·초기화 범위가 바뀌면 이전 공개 초안을 제거한다.
  useEffect(function clearPreviousScope() { setEmails({}); setIntents({}); }, [resetRevision]);
  // 기능 : 공개 페이지별 초안을 분리해 다른 소개의 입력과 섞이지 않게 한다.
  function setEmail(path: string, email: string) { setEmails(previous => ({ ...previous, [path]: email })); }
  // 기능 : 출처·이메일·가격·템플릿·공개 청구 초안을 이력별로 고정하며 실제 가입이나 문서 복제를 실행하지 않는다.
  function start(source: string, path: string, includeEmail = false, options: PublicIntentOptions = {}) {
    // 이유 : 브라우저 이력에는 ID만 두고 서로 다른 소개의 이전 인계를 덮어쓰지 않는다.
    const id = `${memoryId}:${++sequence.current}`;
    const snapshot: PublicIntent = { source, sourcePath: path, email: includeEmail ? (emails[path] ?? "").trim() : "",
      returnTo: options.returnTo ?? path, returnOrigin: options.returnOrigin ? { ...options.returnOrigin } : undefined, returnOriginKind: options.returnOriginKind, selection: options.selection ? { ...options.selection } : undefined,
      template: options.template ? { ...options.template } : undefined, invoice: options.invoice ? structuredClone(options.invoice) : undefined };
    setIntents(previous => ({ ...previous, [id]: snapshot }));
    return id;
  }
  // 기능 : 청구서 취소는 선택한 인계만 지우고 다른 공개 이메일 초안은 기존 출처별 취소 정책을 적용한다.
  function clear(intentId: string | undefined) {
    const intent = intentId === undefined ? undefined : intents[intentId];
    if (!intent) return;
    if (intent.invoice) {
      setIntents(previous => Object.fromEntries(Object.entries(previous).filter(([id]) => id !== intentId)));
      return;
    }
    setEmail(intent.sourcePath, "");
    setIntents(previous => Object.fromEntries(Object.entries(previous).filter(([, item]) => item.invoice || item.sourcePath !== intent.sourcePath)));
  }
  // 기능 : 현재 인증 범위에서 명시적으로 복귀한 선택만 새 이력 ID로 복원한다.
  function restore(intent: PublicIntent) {
    const id = `${memoryId}:${++sequence.current}`; const snapshot = structuredClone(intent);
    setIntents(previous => ({ ...previous, [id]: snapshot }));
    if (snapshot.email) setEmail(snapshot.sourcePath, snapshot.email);
    return id;
  }
  return <PublicContext.Provider value={{ scope: `${memoryId}:${resetRevision}`, emails, intents, setEmail, start, restore, clear }}>{children}</PublicContext.Provider>;
}
