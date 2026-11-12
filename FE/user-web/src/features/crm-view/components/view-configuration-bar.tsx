import type { ViewMenusModel } from "../hooks/use-view-menus";
import { useAppI18n } from "@/features/app-i18n";
// 기능 : 저장·되돌리기와 충돌·실패를 같은 위치에서 안내합니다.
export function ViewConfigurationBar({ menus }: { readonly menus: ViewMenusModel }) {
  const { t } = useAppI18n();
  if (!menus.supportsSaving || !menus.isDirty && !menus.error && !menus.isSaved && !menus.isSaving) return null;
  return <div className="shrink-0 border-b border-[#E7E6E2] bg-[#FAFAF9] px-4 py-2 text-[12px] text-[#65645F]" aria-busy={menus.isSaving} data-testid="view-configuration-bar">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p role="status">{t(menus.isSaving ? "common.saving" : menus.isDirty ? "viewConfiguration.unsaved" : "viewConfiguration.saved")}</p>
      {menus.isDirty && <div className="flex gap-2">
        <button type="button" disabled={menus.isSaving} onClick={menus.discard} className="rounded px-2 py-1 hover:bg-[#EDEDEB] disabled:opacity-50">{t("viewConfiguration.discard")}</button>
        <button type="button" disabled={menus.isSaving || menus.isConflict} onClick={() => { void menus.save(); }} className="rounded bg-[#37352F] px-3 py-1 text-white disabled:opacity-50">{t(menus.isSaving ? "common.saving" : "viewConfiguration.save")}</button>
      </div>}
    </div>
    {menus.isDirty && <p className="mt-1 text-[11px] text-[#787774]">{t("viewConfiguration.shared")}</p>}
    {Boolean(menus.error) && <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 text-[#B42318]">
      <span>{t(menus.isConflict ? "viewConfiguration.conflict" : "viewConfiguration.failed")}</span>
      {menus.isConflict && <button type="button" onClick={() => { void menus.useLatest(); }} className="underline">{t("viewConfiguration.latest")}</button>}
    </div>}
  </div>;
}
