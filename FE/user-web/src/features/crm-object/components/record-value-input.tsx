import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getRecordFormOptions, recordFormQueryKeys, type RecordFormAttribute, type RecordFormScope } from "../api/record-form-api";
import type { WorkspaceObjectRecordAttributeValuePatchValue as Value } from "../api/record-definition-api";

const inputClass = "min-h-9 w-full rounded-md border border-[#E4E2DC] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#4880EE] disabled:opacity-60";
const referenceField: Record<string, string> = { Select: "selectOptionId", Status: "statusOptionId", RecordReference: "targetRecordDefinitionId", ActorReference: "targetActorId" };
// 기능 : 객체 값에서 편집에 필요한 필드만 안전하게 읽습니다.
function objectValue(value: Value): Record<string, unknown> { return value && typeof value === "object" ? value : {}; }
// 기능 : 현재 속성 타입에 맞는 사용자 입력을 제공합니다.
export function RecordValueInput({ field, scope, value, onChange, disabled = false, currentLabel }: {
  field: RecordFormAttribute; scope: RecordFormScope; value: Value; onChange: (value: Value) => void; disabled?: boolean; currentLabel?: string | undefined;
}) {
  if (referenceField[field.type]) return <RecordOptionInput field={field} scope={scope} value={value} onChange={onChange} disabled={disabled} currentLabel={currentLabel} />;
  if (field.type === "Checkbox") return <select aria-label={field.title} className={inputClass} value={value === null ? "" : String(value)} disabled={disabled}
    onChange={event => onChange(event.target.value === "" ? null : event.target.value === "true")}><option value="">미지정</option><option value="true">예</option><option value="false">아니요</option></select>;
  if (["PersonalName", "Location", "Interaction"].includes(field.type)) {
    const data = objectValue(value);
    const fields = field.type === "PersonalName" ? [["displayName", "표시 이름"], ["givenName", "이름"], ["familyName", "성"]]
      : field.type === "Location" ? [["text", "주소"]] : [["summary", "내용"], ["type", "활동 종류"]];
    return <div className="space-y-2">{fields.map(([key, label]) => <input key={key} className={inputClass} aria-label={`${field.title} ${label}`} placeholder={label} disabled={disabled}
      value={String(data[key!] ?? "")} onChange={event => onChange({ ...data, [key!]: event.target.value })} />)}</div>;
  }
  const type = field.type === "Date" ? "date" : field.type === "Timestamp" ? "datetime-local" : field.type === "EmailAddress" ? "email" : "text";
  let shown = value == null ? "" : String(value);
  if (field.type === "Timestamp" && shown) { const date = new Date(shown); if (Number.isFinite(date.getTime())) shown = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
  return <input aria-label={field.title} className={inputClass} disabled={disabled} type={type} value={shown}
    inputMode={["Number", "Currency", "Rating"].includes(field.type) ? "decimal" : undefined}
    onChange={event => { const next = event.target.value; onChange(!next ? null : field.type === "Timestamp" ? new Date(next).toISOString() : next); }} />;
}
// 기능 : ID 입력 대신 이름 검색·후보 선택·추가 페이지를 제공합니다.
function RecordOptionInput({ field, scope, value, onChange, disabled, currentLabel }: {
  field: RecordFormAttribute; scope: RecordFormScope; value: Value; onChange: (value: Value) => void; disabled: boolean; currentLabel?: string | undefined;
}) {
  const [search, setSearch] = useState(""); const [q, setQ] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});
  useEffect(() => { const timer = window.setTimeout(() => setQ(search), 180); return () => window.clearTimeout(timer); }, [search]);
  const query = useInfiniteQuery({ queryKey: recordFormQueryKeys.options(scope, field.id, q),
    initialPageParam: null as string | null, queryFn: ({ pageParam }) => getRecordFormOptions(scope, field.id, q, pageParam),
    getNextPageParam: page => page.pageInfo.nextCursor ?? undefined, retry: false });
  const options = [...new Map((query.data?.pages.flatMap(page => page.items) ?? []).map(row => [row.id, row])).values()];
  const key = referenceField[field.type]!; const selected = String(objectValue(value)[key] ?? "");
  return <div className="space-y-2">
    <input className={inputClass} aria-label={`${field.title} 검색`} placeholder="이름으로 검색" value={search} disabled={disabled} onChange={event => setSearch(event.target.value)} />
    <select className={inputClass} aria-label={field.title} value={selected} disabled={disabled || query.isPending}
      onChange={event => { const id = event.target.value; const label = options.find(option => option.id === id)?.label; if (label) setSelectedLabels(current => ({ ...current, [id]: label })); onChange(id ? { [key]: id } : null); }}>
      <option value="">미지정</option>
      {selected && !options.some(option => option.id === selected) && <option value={selected}>{selectedLabels[selected] ?? currentLabel ?? "현재 선택"}</option>}
      {options.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
    {query.isPending && <p role="status" className="text-xs text-[#787774]">선택 항목을 불러오는 중…</p>}
    {query.isError && <p role="alert" className="text-xs text-red-600">선택 항목을 불러오지 못했습니다. <button type="button" disabled={disabled} onClick={() => { void query.refetch(); }}>다시 시도</button></p>}
    {query.hasNextPage && <button type="button" className="text-xs text-[#4880EE]" disabled={disabled || query.isFetchingNextPage} onClick={() => { void query.fetchNextPage(); }}>더 보기</button>}
  </div>;
}
