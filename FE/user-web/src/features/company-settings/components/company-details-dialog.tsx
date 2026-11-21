import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useCompanyEditor } from "../hooks/use-company-editor";
import { AddressEditor } from "./address-editor";
import { LogoPicker } from "./logo-picker";
import "@/styles/company-settings.css";
// 기능 : 주소·로고 하위 변경을 모달 초안에 모으고 바깥 Save에서만 같은 회사에 저장한다.
export function CompanyDetailsDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const editor = useCompanyEditor(onSaved); const [addressOpen, setAddressOpen] = useState(false); const [readingLogo, setReadingLogo] = useState(false);
  return <Dialog title="Company Details" className="company-details-dialog" onClose={onClose} footer={editor.draft ? <><button type="submit" form="company-details-form" className="company-save" disabled={!editor.canEdit || editor.pending || readingLogo || addressOpen}>{editor.pending ? "Saving…" : "Save"}</button>{editor.pending && <button type="button" onClick={editor.cancel}>Cancel save</button>}</> : undefined}>
    {editor.loading ? <p role="status">Loading company…</p> : !editor.draft ? <div role="alert"><p>{editor.error}</p><button type="button" onClick={editor.reload}>Retry company</button></div> : <form id="company-details-form" noValidate onSubmit={event => { event.preventDefault(); if (!addressOpen && !readingLogo) void editor.save(); }} onCompositionStart={() => { editor.composing.current = true; }} onCompositionEnd={() => { editor.composing.current = false; }} onKeyDown={event => { if (event.key === "Enter" && (event.nativeEvent.isComposing || editor.composing.current)) event.preventDefault(); }}>
      <label>What is the name of your company?<input value={editor.draft.name} maxLength={120} disabled={!editor.canEdit || editor.pending} onChange={event => editor.edit({ name: event.target.value })} /></label>
      <p className="company-field-title">What is your address?</p><AddressEditor value={editor.draft} disabled={!editor.canEdit || editor.pending} onSave={editor.edit} onEditing={setAddressOpen} />
      <LogoPicker file={editor.draft.logo} disabled={!editor.canEdit || editor.pending} onChange={logo => editor.edit({ logo })} onBusy={setReadingLogo} />
      {!editor.canEdit && <p role="status">This local member can view company details. Editing is reserved for the owner.</p>}{editor.error && <p role="alert" className="company-error">{editor.error}</p>}
    </form>}
  </Dialog>;
}
