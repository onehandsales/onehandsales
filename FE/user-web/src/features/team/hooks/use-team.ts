import { useEffect, useMemo, useState } from "react";
import { usePreviewEnvironment } from "@/features/preview";
import { useTeamStore } from "../data/team-context";
import { TeamReadError } from "../model/team-types";
import type { TeamRow } from "../model/team-types";
// 기능 : 현재 작업공간 목록을 조회하고 이전 문맥의 늦은 결과를 취소한다.
export function useTeam() {
  const { state: preview } = usePreviewEnvironment(); const { store, state } = useTeamStore();
  const [rows, setRows] = useState<TeamRow[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [denied, setDenied] = useState(false); const [retry, setRetry] = useState(0);
  const scope = useMemo(() => preview.session && preview.workspaceId ? { actorId: preview.session.id, workspaceId: preview.workspaceId, revision: preview.revision } : null, [preview.session, preview.workspaceId, preview.revision]);
  // 기능 : 저장소 변경·재시도마다 현재 범위를 읽고 이탈 시 응답 반영을 멈춘다.
  useEffect(function readTeam() {
    if (!scope) return; const request = new AbortController(); setLoading(true); setError(""); setDenied(false);
    store.read(scope, request.signal).then(value => { if (!request.signal.aborted) { setRows(value); setLoading(false); } }).catch((reason: unknown) => { if (!request.signal.aborted && !(reason instanceof DOMException && reason.name === "AbortError")) { setError(reason instanceof Error ? reason.message : "Unable to load team."); setDenied(reason instanceof TeamReadError && reason.kind === "denied"); setLoading(false); } });
    return function cancelRead() { request.abort(); };
  }, [store, state.version, scope, retry]);
  // 기능 : 동일 문맥에서 실패한 목록 조회를 다시 시도한다.
  function reload() { setRetry(value => value + 1); }
  return { owner: preview.session?.role === "owner", store, state, scope, rows, loading, error, denied, reload, canEdit: preview.session?.role === "owner" && state.scenario !== "denied" && state.scenario !== "empty" };
}
