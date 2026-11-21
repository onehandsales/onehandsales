import { useEffect, useRef, useState } from "react";
import { clientImageError } from "../model/client-edits";
import type { ClientImage } from "../model/client-edits";
// 기능 : 파일 선택·실제 디코딩·미리보기를 저장과 분리하고 마지막 선택만 초안으로 반영한다.
export function useClientImageDraft(initial: ClientImage | null) {
  const [image, setImage] = useState(initial); const [changed, setChanged] = useState(false);
  const [reading, setReading] = useState(false); const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null); const lastFile = useRef<File | null>(null);
  // 기능 : 이미지 편집기를 떠난 뒤 디코딩된 파일이 다시 나타나지 않게 한다.
  useEffect(function bindReading() { return function dispose() { request.current?.abort(); }; }, []);
  // 기능 : 허용 파일의 디코딩 성공만 표시하고 잘못된 형식·손상 파일은 저장하지 않는다.
  async function select(file: File) {
    request.current?.abort(); const controller = new AbortController(); request.current = controller; lastFile.current = file; setReading(false); setError("");
    const invalid = clientImageError(file); if (invalid) { setError(invalid); return; }
    setReading(true);
    try { const bitmap = await createImageBitmap(file); bitmap.close(); controller.signal.throwIfAborted(); setImage({ file, name: file.name }); setChanged(true); }
    catch { if (!controller.signal.aborted) setError("Unable to read this image. Retry or choose another file."); }
    finally { if (request.current === controller) setReading(false); }
  }
  // 기능 : 실패한 파일을 보존해 재선택 없이 로컬 디코딩을 다시 시도한다.
  function retry() { if (lastFile.current) void select(lastFile.current); }
  return { image, changed, reading, error, select, retry };
}
