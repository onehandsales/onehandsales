import { useEffect, useRef, useState } from "react";
import { LocalImageCard as TemplateFileCard } from "@/components/ui/local-image-card";
export { LocalImageCard as TemplateFileCard } from "@/components/ui/local-image-card";
import { templateFileError } from "../model/template-values";
import type { TemplateFile } from "../model/template-types";

// 기능 : 파일 선택·실제 로컬 디코딩·재시도·취소를 상위 편집 초안에만 반영한다.
export function TemplateFiles({ files, disabled, onChange, onReading }: { files: TemplateFile[]; disabled: boolean; onChange: (files: TemplateFile[]) => void; onReading: (reading: boolean) => void }) {
  const input = useRef<HTMLInputElement>(null); const request = useRef<AbortController | null>(null); const last = useRef<File | null>(null);
  const section = useRef<HTMLElement>(null); const add = useRef<HTMLButtonElement>(null); const retry = useRef<HTMLButtonElement>(null); const previousFocus = useRef<Element | null>(null);
  const [error, setError] = useState(""); const [reading, setReading] = useState(false);
  // 기능 : 편집기 이탈 이후의 파일 디코딩 결과를 폐기한다.
  useEffect(function bindReading() { return function cleanup() { request.current?.abort(); }; }, []);
  // 기능 : 사라진 첨부 제어의 초점을 복구하되 읽는 동안 사용자가 옮긴 초점은 유지한다.
  useEffect(function restoreAttachmentFocus() {
    if (reading || disabled || !previousFocus.current) return;
    const previous = previousFocus.current; previousFocus.current = null;
    if (document.activeElement === document.body || document.activeElement === previous) (error ? retry.current : add.current)?.focus();
  }, [reading, disabled, error, files]);
  // 기능 : 새 파일 의도만 처리하고 손상 파일을 성공 첨부로 표시하지 않는다.
  async function select(file: File) {
    previousFocus.current = section.current?.contains(document.activeElement) ? document.activeElement : null;
    request.current?.abort(); const controller = new AbortController(); request.current = controller; last.current = file;
    const invalid = templateFileError(file); setError(invalid); setReading(false); onReading(false); if (invalid) return;
    setReading(true); onReading(true);
    try {
      const bitmap = await createImageBitmap(file); bitmap.close(); controller.signal.throwIfAborted();
      onChange([...files, { id: crypto.randomUUID(), file, name: file.name }]); setError("");
    } catch { if (!controller.signal.aborted) setError("Unable to read this image. Retry or choose another file."); }
    finally { if (request.current === controller) { request.current = null; setReading(false); onReading(false); } }
  }
  // 기능 : 파일 읽기만 취소하며 이미 확정된 편집 초안의 파일은 보존한다.
  function cancelRead() { previousFocus.current = section.current?.contains(document.activeElement) ? document.activeElement : null; request.current?.abort(); request.current = null; setReading(false); onReading(false); setError(""); }
  // 기능 : 선택 대화상자의 취소는 유지하고 유효한 새 선택만 디코딩한다.
  function handleSelection() { const file = input.current?.files?.[0]; if (input.current) input.current.value = ""; if (file) void select(file); }
  // 기능 : 해당 첨부 ID만 초안에서 제거하고 늦은 읽기 결과를 막는다.
  function remove(id: string) { cancelRead(); onChange(files.filter(entry => entry.id !== id)); }
  return <section ref={section} className="template-files"><h3>Files</h3><div className="template-file-list">{files.map(entry => <TemplateFileCard key={entry.id} entry={entry} onRemove={disabled ? undefined : () => remove(entry.id)} />)}</div>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" aria-label="Template task file" className="sr-only" disabled={disabled} onChange={handleSelection} />
    <button ref={add} className="template-text-button" type="button" disabled={disabled || reading} onClick={() => input.current?.click()}>＋ Add File</button>
    {reading && <p role="status">Reading local image… <button type="button" onClick={cancelRead}>Cancel reading</button></p>}
    {error && <div role="alert"><p>{error}</p><button ref={retry} type="button" disabled={disabled || reading} onClick={() => last.current && void select(last.current)}>Retry image</button></div>}
  </section>;
}
