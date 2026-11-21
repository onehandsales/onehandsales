import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { useCompanyLogo } from "@/features/company-settings/hooks/use-company-logo";
// 기능 : G15와 같은 파일 검증을 재사용하되 브랜드 화면의 파일명·제거 표시로 편집한다.
export function BrandLogoPicker({ file, disabled, onChange, onBusy, onStart }: { file: File | null; disabled: boolean; onChange: (file: File | null) => void; onBusy: (busy: boolean) => void; onStart: () => void }) {
  const input = useRef<HTMLInputElement>(null); const logo = useCompanyLogo(onChange);
  // 기능 : 파일 읽기 수명 동안 전체 저장을 잠그고 취소·이탈 시 해제한다.
  useEffect(function notifyBusy() { onBusy(logo.pending); return function clearBusy() { onBusy(false); }; }, [logo.pending, onBusy]);
  // 기능 : 새 파일 읽기가 시작되면 이전 브랜드 저장을 취소한다.
  function choose(event: ChangeEvent<HTMLInputElement>) { const selected = event.currentTarget.files?.[0]; event.currentTarget.value = ""; if (selected) { onStart(); void logo.select(selected); } }
  // 기능 : 실패한 파일을 다시 읽기 전에 진행 중인 이전 저장을 취소한다.
  function retry() { onStart(); logo.retry(); }
  return <div className="brand-logo-picker"><p>Company Logo</p><input hidden ref={input} type="file" aria-label="Choose company logo" accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={choose} />
    <div className="brand-file-name"><button type="button" disabled={disabled} onClick={() => input.current?.click()}>{file?.name ?? "Add An Image"}</button>{(file || logo.pending) && <button type="button" disabled={disabled} aria-label="Remove company logo" onClick={logo.remove}>×</button>}</div>
    {logo.pending && <p role="status">Reading image… <button type="button" onClick={logo.cancel}>Cancel image</button></p>}
    {logo.error && <div className="company-error" role="alert"><p>{logo.error}</p><button type="button" disabled={disabled} onClick={retry}>Retry image</button></div>}
  </div>;
}
