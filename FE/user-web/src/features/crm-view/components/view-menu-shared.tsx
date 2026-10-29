import { useAppI18n } from "@/features/app-i18n";
import type { ViewAttribute, ViewAttributeCandidate, ViewReference } from "../types/view-menu";
import { MENU_INPUT, referenceLabel } from "../utils/view-menu";

// 기능 : 현재 저장 참조를 유지하면서 확인된 직접 속성 후보만 선택하게 합니다.
export function ViewReferenceSelect({ value, candidates, attributes, label, onChange }: {
  readonly value: ViewReference | null; readonly candidates: readonly ViewAttributeCandidate[];
  readonly attributes: readonly ViewAttribute[]; readonly label: string; readonly onChange: (value: ViewReference) => void;
}) {
  const { t } = useAppI18n();
  const direct = value?.sourceScope === "RECORD" && !value.referenceAttributeIdPathJson.length && candidates.some(item => item.id === value.attributeDefinitionId);
  return <select aria-label={label} className={`${MENU_INPUT} flex-1`} value={direct ? value?.attributeDefinitionId : value ? "__stored__" : ""}
    onChange={event => { if (candidates.some(item => item.id === event.target.value)) onChange({ sourceScope: "RECORD", attributeDefinitionId: event.target.value, referenceAttributeIdPathJson: [] }); }}>
    {!value && <option value="">{t("viewMenu.unset")}</option>}
    {value && !direct && <option value="__stored__">{referenceLabel(value, attributes)}{value.sourceScope === "LIST_ENTRY" ? ` · ${t("viewMenu.listValue")}` : ""}</option>}
    {candidates.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
  </select>;
}

// 기능 : 실제 본문 적용과 저장 전의 임시 편집임을 안내합니다.
export function ViewPreviewNote() {
  const { t } = useAppI18n();
  return <p className="mx-1 mt-2 border-t border-[#EEEDE9] px-1 pb-1 pt-2 text-[11px] leading-relaxed text-[#A4A39E]">{t("viewHeader.previewNote")}</p>;
}
