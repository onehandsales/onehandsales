import { RecordAttributeValueCell, updateWorkspaceObjectRecordAttributeValueDefinition, type RecordAttributeValueCellSaveInput } from "@/features/crm-object";
import { useAppI18n } from "@/features/app-i18n";
import { cn } from "@/utils/cn";
import type { ViewCell, ViewCellValue, ViewDataBinding, ViewDataItem } from "../types/view-data";
import { formatViewValue, toEditableRecordValue, viewValueObject } from "../utils/view-data-value";

export type ViewCellEditing = { readonly workspaceId: string; readonly onSaved: () => Promise<unknown> };

// 기능 : 값의 출처를 유지하며 직접 Record 값에는 기존 셀 편집 UX를 제공합니다.
function ViewDataValue({ binding, entry, item, editing, primary }: {
  readonly binding: ViewDataBinding; readonly entry: ViewCellValue; readonly item: ViewDataItem;
  readonly editing?: ViewCellEditing | undefined; readonly primary: boolean;
}) {
  const { t, locale, timeZone, formatCurrency, formatDate, formatDateTime } = useAppI18n();
  const text = formatViewValue(entry.value, binding, locale, timeZone, t("common.yes"), t("common.no"));
  const editable = editing && binding.sourceScope === "RECORD" && !binding.referenceAttributeIdPath.length &&
    entry.sourceEntity.kind === "RECORD" && entry.sourceEntity.id === item.recordDefinitionId;
  // 기능 : 선택한 원본 Record와 값 행을 기존 쓰기 API로 저장한 뒤 본문을 갱신합니다.
  async function save(input: RecordAttributeValueCellSaveInput) {
    if (!editing || !editable) return;
    // 1. ListEntry ID나 표시 occurrence를 Record ID로 사용하지 않는다.
    await updateWorkspaceObjectRecordAttributeValueDefinition({ workspaceId: editing.workspaceId,
      objectDefinitionId: item.objectDefinitionId, recordDefinitionId: item.recordDefinitionId, ...input });
    // 2. 같은 Record를 표시하는 여러 Entry·열과 필터 결과를 서버에서 다시 읽는다.
    await editing.onSaved();
  }
  if (editable) return <RecordAttributeValueCell attributeConfig={null} attributeTitle={binding.label}
    attributeType={toEditableRecordValue(binding, entry).attributeType} booleanLabels={{ trueLabel: t("common.yes"), falseLabel: t("common.no") }}
    formatCurrency={formatCurrency} formatDate={formatDate} formatDateTime={formatDateTime}
    isPrimary={primary} value={toEditableRecordValue(binding, entry)} displayTextOverride={text || "-"} onSave={save} />;
  const option = binding.attributeType === "Select" || binding.attributeType === "Status";
  const value = viewValueObject(entry.value);
  return <span className={cn("flex h-full min-w-0 items-center gap-1.5 px-3", primary && "font-medium")}
    title={text || t("viewData.emptyValue")}>
    {option && typeof value.label === "string" ? <span className="inline-flex min-w-0 items-center gap-1 rounded bg-[#F1F0EC] px-1.5 py-0.5 text-[12px]">
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9B9A97]" style={{ backgroundColor: typeof value.color === "string" ? value.color : undefined }} />
      <span className="truncate">{text}</span>
    </span> : <span className="truncate">{text || "—"}</span>}
  </span>;
}

// 기능 : 다중값을 덮어쓰지 않고 빈 값·손상·접근 불가를 구분해 표시합니다.
export function ViewDataCell({ binding, item, editing, primary = false }: {
  readonly binding: ViewDataBinding; readonly item: ViewDataItem; readonly editing?: ViewCellEditing | undefined; readonly primary?: boolean;
}) {
  const { t } = useAppI18n();
  const cell: ViewCell | undefined = item.cells.find(value => value.bindingId === binding.id);
  if (cell?.state === "INVALID" || cell?.state === "UNAVAILABLE")
    return <span className="truncate px-3 text-[#9B9A97]" title={t("viewData.unavailableValue")}>{t("viewData.unavailableValue")}</span>;
  if (!cell?.values.length) return <span aria-label={t("viewData.emptyValue")} className="px-3 text-[#C4C2BD]">—</span>;
  return <div className="flex h-full min-w-0 flex-1 items-center overflow-x-auto">
    {cell.values.map(value => <div className={cn("h-full min-w-0", cell.values.length === 1 ? "flex-1" : "shrink-0 max-w-full")}
      key={`${value.sourceEntity.kind}:${value.sourceEntity.id}:${value.valueDefinitionId}`}>
      <ViewDataValue binding={binding} entry={value} item={item} editing={editing} primary={primary} />
    </div>)}
  </div>;
}
