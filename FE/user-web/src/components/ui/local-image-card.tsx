import { useState } from "react";
import { CloudDownload, X } from "lucide-react";
import { Dialog } from "./dialog";
import { useObjectUrl } from "@/lib/use-object-url";

// 기능 : 원본의 아래쪽 구름 아이콘과 파일 이름을 표시하고 로컬 Blob 미리보기 수명을 관리한다.
export function LocalImageCard({ entry, onRemove }: { entry: { name: string; file: Blob }; onRemove?: () => void }) {
  const url = useObjectUrl(entry.file); const [expanded, setExpanded] = useState(false); const [ready, setReady] = useState(false);
  return <div className="template-file-card">
    <button type="button" className="template-file-preview" aria-label={`Preview ${entry.name}`} onClick={() => setExpanded(true)}>
      {url && <img src={url} alt={entry.name} onLoad={() => setReady(true)} />}{!ready && <span>{entry.name}</span>}
      <CloudDownload size={17} aria-hidden="true" />
    </button>
    {onRemove && <button type="button" className="template-file-remove" aria-label={`Remove ${entry.name}`} onClick={onRemove}><X size={14} /></button>}
    {expanded && <Dialog title={entry.name} className="template-image-dialog" onClose={() => setExpanded(false)}><img src={url} alt={entry.name} /><button type="button" onClick={() => setExpanded(false)}>Return to task</button></Dialog>}
  </div>;
}
