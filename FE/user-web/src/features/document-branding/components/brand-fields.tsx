import { Crown, ChevronDown } from "lucide-react";
import { BrandLogoPicker } from "./brand-logo-picker";
import { HeaderSelect } from "./header-select";
import type { BrandDraft, HeaderPreset } from "../model/branding-types";
// 기능 : 관찰된 브랜드 입력과 미수록 옵션을 구분하고 사용자 선택을 초안 소유자에게 전달한다.
export function BrandFields({ draft, disabled, onLogo, onBusy, onStart, onHeader, onUnavailable }: { draft: BrandDraft; disabled: boolean; onLogo: (logo: File | null) => void; onBusy: (busy: boolean) => void; onStart: () => void; onHeader: (header: HeaderPreset) => void; onUnavailable: (name: string) => void }) {
  return <div className="brand-fields"><BrandLogoPicker file={draft.logo} disabled={disabled} onChange={onLogo} onBusy={onBusy} onStart={onStart} />
    <button type="button" className="brand-select-look brand-logo-size" aria-label="Logo size: Small Square - 84 x 84" disabled={disabled} onClick={() => onUnavailable("Logo size")}>Small Square - 84 x 84<ChevronDown size={16} aria-hidden="true" /></button>
    <HeaderSelect value={draft.defaults.header} disabled={disabled} onChange={onHeader} onUnavailable={onUnavailable} />
    <div className="brand-field"><h3>Brand Font <Crown size={15} aria-hidden="true" /></h3><p>Custom font used on your documents, client portal, scheduling and other client-facing pages.</p><button type="button" className="brand-select-look is-unrecorded" aria-label="Brand Font: Select a font" disabled={disabled} onClick={() => onUnavailable("Brand Font")}>Select a font...<ChevronDown size={16} aria-hidden="true" /></button></div>
    <div className="brand-field"><h3>Brand Color <Crown size={15} aria-hidden="true" /></h3><p>Custom color used for client-facing buttons and links. Dark color recommended.</p><button type="button" className="brand-color" aria-label="Brand Color: #22AD01" disabled={disabled} onClick={() => onUnavailable("Brand Color")}><span />#22AD01</button></div>
    <fieldset className="brand-white-label" disabled={disabled}><legend>White Label Settings</legend><p>Remove Bonsai’s branding from emails and documents sent to the client.</p><label><input type="radio" name="white-label" checked readOnly />Show Bonsai branding</label>{["Hide Bonsai branding and show mine", "Remove all branding"].map(name => <label key={name}><input type="radio" name="white-label" checked={false} onChange={() => onUnavailable(name)} />{name}<Crown size={15} aria-hidden="true" /></label>)}</fieldset>
  </div>;
}
