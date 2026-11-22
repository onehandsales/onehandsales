import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";
import { useTemplates } from "../hooks/use-templates";
import { useTemplateMutation } from "../hooks/use-template-mutation";
import type { TaskTemplate } from "../model/template-types";

// 기능 : 템플릿 컨테이너 이름의 생성·수정·취소를 구성 작업 저장과 분리한다.
export function TemplateNameDialog({ existing, onSaved, onClose }: { existing?: TaskTemplate; onSaved: (template: TaskTemplate) => void; onClose: () => void }) {
  const query = useTemplates(); const mutation = useTemplateMutation(); const [name, setName] = useState(existing?.name ?? "");
  const [submission] = useState(() => crypto.randomUUID()); const composing = useRef(false); const [revision] = useState(existing?.revision ?? 0);
  // 기능 : 제출 순간의 이름과 대상 revision을 고정하고 성공한 ID로만 이동한다.
  async function submit(event: FormEvent) {
    event.preventDefault(); if (composing.current || mutation.pending) return;
    const result = await mutation.run(signal => existing ? query.store.rename(query.scope, existing.id, revision, name, signal) : query.store.create(query.scope, name, submission, signal));
    if (result) onSaved(result);
  }
  // 기능 : 진행 중 저장을 취소하고 미저장 이름만 폐기한다.
  function close() { mutation.cancel(); onClose(); }
  return <Dialog className="template-name-dialog template-dialog" title={existing ? "Edit Task Template" : "New Task Template"} onClose={close}>
    <form onSubmit={submit} onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}><label>Template Name<input autoComplete="off" placeholder="Default Project Tasks" maxLength={120} value={name} disabled={mutation.pending || !query.editable} onChange={event => setName(event.currentTarget.value)} aria-invalid={!!mutation.error} aria-describedby={mutation.error ? "template-name-error" : undefined} /></label>
      {mutation.error && <p id="template-name-error" role="alert">{mutation.error}</p>}
      <button type="submit" className="task-primary" disabled={mutation.pending || !query.editable}>{mutation.pending ? "Saving…" : existing ? "Save Template" : "Create Template"}</button>
      {mutation.pending && <button type="button" onClick={mutation.cancel}>Cancel save</button>}
    </form><p className="template-dialog-support">Have questions? <Link to="/support">Contact Support</Link></p>
  </Dialog>;
}
