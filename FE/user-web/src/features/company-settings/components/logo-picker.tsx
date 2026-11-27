import { useEffect, useRef } from "react";
import { useCompanyLogo, useLogoUrl } from "../hooks/use-company-logo";
// 기능 : 실제 로컬 파일의 읽기·미리보기·제거·재시도를 저장 버튼과 별도로 표시한다.
export function LogoPicker({ file, disabled, onChange, onBusy }: { file: File | null; disabled: boolean; onChange: (file: File | null) => void; onBusy: (busy: boolean) => void }) {
  const input = useRef<HTMLInputElement>(null); const url = useLogoUrl(file); const logo = useCompanyLogo(onChange);
  // 기능 : 파일 읽기 중 회사 전체 저장을 막고 종료 시 잠금을 해제한다.
  useEffect(function notifyReading() { onBusy(logo.pending); return function clearReading() { onBusy(false); }; }, [logo.pending, onBusy]);
  return <div className="company-logo-picker"><p>Upload your company logo</p><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose company logo" hidden disabled={disabled} onChange={event => { const selected = event.target.files?.[0]; event.target.value = ""; if (selected) void logo.select(selected); }} />
    <div className="company-logo-tile">{logo.pending ? <span role="status" className="sr-only">Reading image…</span> : url ? <button type="button" aria-label="Change company logo" disabled={disabled} onClick={() => input.current?.click()}><img src={url} alt="Company logo preview" /></button> : <button type="button" disabled={disabled} onClick={() => input.current?.click()}>Add An<br />Image</button>}{(file || logo.pending) && <button type="button" aria-label="Remove company logo" className="company-logo-remove" disabled={disabled} onClick={logo.remove}>×</button>}</div>
    {logo.error && <div role="alert" className="company-error"><p>{logo.error}</p><button type="button" disabled={disabled} onClick={logo.retry}>Retry image</button><button type="button" disabled={disabled} onClick={() => input.current?.click()}>Choose another image</button></div>}
  </div>;
}
