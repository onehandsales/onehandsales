import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { FormEvent, KeyboardEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { CompanyTools } from "@/features/company-settings/components/company-controls";
import { SettingsNavigation } from "@/features/company-settings/components/settings-navigation";
import { useBrandingEditor } from "@/features/document-branding/hooks/use-branding-editor";
import { BrandFields } from "@/features/document-branding/components/brand-fields";
import { SampleInvoice } from "@/features/document-branding/components/sample-invoice";
import "@/styles/company-settings.css";
import "@/styles/branding-settings.css";
// 기능 : 문서 브랜드 편집·미리보기·저장·미수록 안내를 기존 앱 설정 경로에 조합한다.
export function BrandingSettingsPage() {
  const location = useLocation();
  const editor = useBrandingEditor(); const [readingLogo, setReadingLogo] = useState(false); const [unavailable, setUnavailable] = useState("");
  // 기능 : 같은 설정 경로의 새 이력에서도 이전 옵션 안내를 닫는다.
  useEffect(function closePreviousNotice() { setUnavailable(""); }, [location.key]);
  // 기능 : 파일 읽기·한글 조합 중 제출을 제외하고 명시적 저장만 실행한다.
  function submit(event: FormEvent) { event.preventDefault(); if (!readingLogo) void editor.save(); }
  // 기능 : 한글 조합 확정용 Enter가 전체 저장으로 이어지지 않게 한다.
  function guardComposition(event: KeyboardEvent) { if (event.key === "Enter" && (event.nativeEvent.isComposing || editor.composing.current)) event.preventDefault(); }
  // 기능 : 로컬 파일 변경은 회사 저장 없이 브랜드 초안에만 전달한다.
  function editLogo(logo: File | null) { editor.edit({ logo }); }
  // 기능 : 파일 선택을 시작하면 이전 저장 의도와 성공 표시를 취소한다.
  function startLogo() { editor.cancel(); editor.setSaved(false); }
  return <section className="company-settings branding-settings"><SettingsNavigation /><div className="branding-layout"><section className="branding-panel"><header><div><h2>Brand Settings</h2><p>Look professional and save time with custom branding. Changes only affect newly created documents.</p></div><button className="company-save" type="submit" form="branding-form" disabled={!editor.draft || !editor.canEdit || editor.pending || readingLogo}>{editor.pending ? "Saving…" : "Save Changes"}</button></header>
    {editor.loading ? <p role="status" className="company-read-state">Loading branding…</p> : !editor.draft ? <div role="alert" className="company-read-state"><h3>{editor.readKind === "missing" ? "No company branding" : editor.readKind === "denied" ? "Branding access unavailable" : "Branding could not be loaded"}</h3><p>{editor.error}</p><button type="button" onClick={editor.reload}>Retry branding</button></div> : <form id="branding-form" noValidate onSubmit={submit} onCompositionStart={() => { editor.composing.current = true; }} onCompositionEnd={() => { editor.composing.current = false; }} onKeyDown={guardComposition}>
      {!editor.canEdit && <p role="status" className="company-readonly">This local member can view branding. Editing is reserved for the owner.</p>}
      <div className="brand-columns"><BrandFields key={location.key} draft={editor.draft} disabled={!editor.canEdit} onLogo={editLogo} onBusy={setReadingLogo} onStart={startLogo} onHeader={editor.selectHeader} onUnavailable={setUnavailable} /><SampleInvoice draft={editor.draft} /></div>
      {editor.error && <p role="alert" className="company-error">{editor.error}</p>}<div className="brand-edit-actions"><button type="button" onClick={editor.reload}>Discard changes</button>{editor.pending && <button type="button" onClick={editor.cancel}>Cancel save</button>}</div>
    </form>}
    </section></div>{editor.saved && <div role="status" className="company-save-notice"><span>✓</span>Your branding settings have been saved.<button type="button" aria-label="Dismiss saved message" onClick={() => editor.setSaved(false)}>×</button></div>}
    <CompanyTools />{unavailable && <Dialog title={unavailable} onClose={() => setUnavailable("")}><p>This option’s result is not available in the recorded preview. Your current settings are unchanged.</p><p>No plan or permission change has been made.</p><button type="button" onClick={() => setUnavailable("")}>Return to branding</button></Dialog>}
  </section>;
}
