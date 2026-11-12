import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ApiClientError } from "@/lib/api-client";
import { createWorkspaceObjectRecordDefinition, type WorkspaceObjectRecordAttributeValuePatchValue as Value } from "../api/record-definition-api";
import { getRecordForm, recordFormQueryKeys, type RecordFormScope } from "../api/record-form-api";
import { RecordValueInput } from "./record-value-input";

// 기능 : 입력창을 여는 동안에는 생성하지 않고 저장 시 하나의 기록을 생성합니다.
export function CreateRecordDialog({ scope, objectName, onClose, onCreated }: {
  scope: RecordFormScope; objectName: string; onClose: () => void; onCreated: (recordId: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null); const busy = useRef(false);
  const [creationId] = useState(() => crypto.randomUUID());
  const [draft, setDraft] = useState<Record<string, Value[]>>({});
  const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const query = useQuery({ queryKey: recordFormQueryKeys.fields(scope), queryFn: () => getRecordForm(scope), retry: false });
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  // 기능 : 입력값과 생성 키를 보존해 실패 후 재시도가 중복 기록을 만들지 않게 합니다.
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy.current || !query.data) return;
    busy.current = true; setSaving(true); setError(null);
    try {
      const result = await createWorkspaceObjectRecordDefinition({ ...scope, creationId,
        values: Object.entries(draft).map(([attributeDefinitionId, values]) => ({ attributeDefinitionId, values })) });
      onCreated(result.recordDefinitionId);
    } catch (cause) {
      setError(cause instanceof ApiClientError && cause.statusCode === 409
        ? "이전 저장 결과 또는 연결된 기록과 충돌했습니다. 화면을 새로 확인한 뒤 다시 시도해 주세요."
        : "저장하지 못했습니다. 입력값과 연결 대상을 확인하고 다시 시도해 주세요.");
    } finally { busy.current = false; setSaving(false); }
  }
  return createPortal(<dialog ref={dialog} aria-labelledby="create-record-title" className="m-auto max-h-[85dvh] w-[calc(100vw_-_2rem)] max-w-[560px] rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/30"
    onCancel={event => { event.preventDefault(); if (!busy.current) onClose(); }}>
    <form onSubmit={event => { void save(event); }}>
      <div className="flex items-center justify-between border-b border-[#E4E2DC] px-5 py-4"><h2 id="create-record-title" className="font-semibold">{objectName} 기록 추가</h2><button type="button" aria-label="닫기" disabled={saving} onClick={onClose}>×</button></div>
      <fieldset disabled={saving} className="max-h-[60dvh] space-y-4 overflow-y-auto p-5">
        {query.isPending && <p role="status">입력 항목을 불러오는 중…</p>}
        {query.isError && <p role="alert">입력 항목을 불러오지 못했습니다. <button type="button" onClick={() => { void query.refetch(); }}>다시 시도</button></p>}
        {query.data?.attributes.map(field => <div key={field.id} className="space-y-1.5"><p className="text-sm font-medium">{field.title}</p>
          {(draft[field.id]?.length ? draft[field.id]! : [null]).map((value, index) => <div key={index} className="flex items-start gap-2"><div className="min-w-0 flex-1">
            <RecordValueInput field={field} scope={scope} value={value} disabled={saving} onChange={next => setDraft(current => { const values = [...(current[field.id]?.length ? current[field.id]! : [null])]; values[index] = next; return { ...current, [field.id]: values }; })} />
          </div>{field.isMultiselect && (draft[field.id]?.length ?? 0) > 1 && <button type="button" aria-label={`${field.title} 값 제거`} onClick={() => setDraft(current => ({ ...current, [field.id]: current[field.id]!.filter((_value, position) => position !== index) }))}>×</button>}</div>)}
          {field.isMultiselect && <button type="button" className="text-xs text-[#4880EE]" disabled={(draft[field.id]?.length ?? 1) >= 100}
            onClick={() => setDraft(current => ({ ...current, [field.id]: [...(current[field.id]?.length ? current[field.id]! : [null]), null] }))}>값 추가</button>}
        </div>)}
      </fieldset>
      {error && <p role="alert" className="px-5 pb-3 text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-[#E4E2DC] px-5 py-3"><button type="button" disabled={saving} className="rounded px-3 py-2 text-sm" onClick={onClose}>취소</button>
        <button type="submit" disabled={saving || !query.data} className="rounded bg-[#4880EE] px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? "저장 중…" : "저장"}</button></div>
    </form>
  </dialog>, document.body);
}
