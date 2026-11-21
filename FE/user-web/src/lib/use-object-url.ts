import { useEffect, useState } from "react";
// 기능 : 로컬 이미지 표시 수명에만 Object URL을 만들고 교체·이탈 시 해제한다.
export function useObjectUrl(file: Blob | null) {
  const [preview, setPreview] = useState<{ file: Blob | null; url: string }>({ file: null, url: "" });
  useEffect(function bindFile() { if (!file) { setPreview({ file: null, url: "" }); return; } const value = URL.createObjectURL(file); setPreview({ file, url: value }); return function release() { URL.revokeObjectURL(value); }; }, [file]);
  return preview.file === file ? preview.url : "";
}
