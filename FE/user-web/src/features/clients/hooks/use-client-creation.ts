import { useEffect, useRef, useState } from "react";
import type { PreviewScope } from "@/features/preview";
import { clientDraftIssue } from "../model/client-types";
import type { ClientDraft, ClientStore, ClientCompany } from "../model/client-types";
// 기능 : 한 번 열린 생성 폼의 입력·제출 ID·취소 신호를 저장 원본과 분리한다.
export function useClientCreation(store: ClientStore, scope: PreviewScope, onCreated: (client: ClientCompany) => void) {
  const [draft, setDraft] = useState<ClientDraft>({ companyName: "", contactName: "", email: "", tagIds: [] }); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  const request = useRef<AbortController | null>(null); const [submissionId] = useState(() => crypto.randomUUID());
  // 기능 : 폼 이탈 시 진행 중 생성이 뒤늦게 저장되지 않게 취소한다.
  useEffect(function cancelOnLeave() { return function cancel() { request.current?.abort(); request.current = null; }; }, []);
  // 기능 : 같은 폼의 중복 실행을 막고 실패한 입력을 보존한 채 재시도한다.
  async function submit() { if (request.current) return; const invalid = clientDraftIssue(draft); if (invalid) { setError(invalid.message); return; } const current = new AbortController(); request.current = current; setPending(true);
    try { const created = await store.create(scope, draft, submissionId, current.signal); if (!current.signal.aborted && request.current === current) onCreated(created); }
    catch (reason) { if (!current.signal.aborted && !(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Unable to add client."); }
    finally { if (request.current === current) { request.current = null; setPending(false); } }
  }
  return { draft, setDraft, error, pending, submit };
}
