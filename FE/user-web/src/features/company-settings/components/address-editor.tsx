import { useEffect, useId, useRef, useState } from "react";
import { companyCountries, companyCurrencies, countryCode, emptyAddress } from "../model/settings-types";
import type { CompanyAddress } from "../model/settings-types";
type AddressValue = { address: CompanyAddress | null; country: string; currency: string };
// 기능 : 주소 하위 초안을 별도로 편집하고 Save Address에서만 부모 회사 초안에 전달한다.
export function AddressEditor({ value, disabled, onSave, onEditing, fullCountry = false }: { value: AddressValue; disabled: boolean; onSave: (value: AddressValue) => void; onEditing?: (open: boolean) => void; fullCountry?: boolean }) {
  const [open, setOpen] = useState(false); const [local, setLocal] = useState({ address: value.address ?? { ...emptyAddress }, country: value.country, currency: value.currency }); const first = useRef<HTMLInputElement>(null); const trigger = useRef<HTMLButtonElement>(null); const id = useId(); const composing = useRef(false);
  const [parentSelection, setParentSelection] = useState({ country: value.country, currency: value.currency });
  const restoreTrigger = useRef(false);
  // 부모에서 바뀐 선택만 동기화해 주소·통화 초안을 보존하고 즉시 저장에서도 오래된 선택을 전달하지 않는다.
  if (parentSelection.country !== value.country || parentSelection.currency !== value.currency) {
    setParentSelection({ country: value.country, currency: value.currency });
    setLocal({ ...local, country: parentSelection.country !== value.country ? value.country : local.country, currency: parentSelection.currency !== value.currency ? value.currency : local.currency });
  }
  // 기능 : 전체 취소·재조회로 편집기가 사라져도 부모의 주소 편집 잠금을 해제한다.
  useEffect(function releaseEditingState() {
    // 기능 : 주소 편집기의 수명이 끝나면 부모 저장을 다시 허용한다.
    return function endEditing() { onEditing?.(false); };
  }, [onEditing]);
  // 기능 : 주소 확장 시 첫 입력으로 초점을 이동한다.
  useEffect(function focusAddress() { if (open) first.current?.focus(); else if (restoreTrigger.current) { restoreTrigger.current = false; trigger.current?.focus(); } }, [open]);
  // 기능 : 주소 하위 변경만 취소하거나 적용한 뒤 시작 위치로 초점을 복원한다.
  function close(save: boolean) { if (save) onSave({ ...local, address: Object.values(local.address).some(text => text.trim()) ? local.address : null }); restoreTrigger.current = true; setOpen(false); onEditing?.(false); }
  return <div className="company-address">{!open ? <button ref={trigger} type="button" className="company-address-summary" disabled={disabled} onClick={() => { setLocal({ address: value.address ?? { ...emptyAddress }, country: value.country, currency: value.currency }); setOpen(true); onEditing?.(true); }}>{value.address ? <><span>{value.address.line1}</span>{value.address.line2 && <span>{value.address.line2}</span>}<span>{[value.address.city, value.address.region, value.address.postal].filter(Boolean).join(", ")}</span><span>{fullCountry ? value.country : countryCode(value.country)}</span></> : "Add Address"}</button> : <div className="company-address-fields" onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(false); } if (event.key === "Enter" && event.target instanceof HTMLInputElement) { event.preventDefault(); if (!event.nativeEvent.isComposing && !composing.current) close(true); } }}>
    {([['line1', 'Address 1'], ['line2', 'Address 2'], ['city', 'City'], ['postal', 'Postal Code'], ['region', 'Region / State']] as const).map(([key, label], index) => <label className={key === "city" || key === "postal" ? "half" : ""} key={key} htmlFor={id + key}>{label}<input id={id + key} ref={index === 0 ? first : undefined} value={local.address[key]} maxLength={240} disabled={disabled} onChange={event => setLocal({ ...local, address: { ...local.address, [key]: event.target.value } })} /></label>)}
    <label className="half">Country<select value={local.country} disabled={disabled} onChange={event => setLocal({ ...local, country: event.target.value })}>{companyCountries.map(value => <option key={value}>{value}</option>)}</select></label><label className="half">Currency<select value={local.currency} disabled={disabled} onChange={event => setLocal({ ...local, currency: event.target.value })}>{companyCurrencies.map(value => <option key={value}>{value}</option>)}</select></label>
    <div className="company-address-actions"><button type="button" onClick={() => close(false)}>Cancel address</button><button type="button" disabled={disabled} onClick={() => { if (!composing.current) close(true); }}>Save Address</button></div>
  </div>}</div>;
}
