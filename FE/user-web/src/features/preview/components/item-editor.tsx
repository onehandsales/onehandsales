import { useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import type { PreviewItem } from "../model/preview-types";
import { usePreviewEditor } from "../hooks/use-preview-editor";

// 기능 : 동일 ID 항목의 초안을 편집하고 닫을 때 미반영 입력과 진행 저장을 폐기한다.
export function ItemEditor({ item, onClose }: { item: PreviewItem; onClose: () => void }) {
  const editor = usePreviewEditor(item, onClose);
  const composing = useRef(false);
  // 기능 : 한글 조합 확정 Enter를 저장으로 해석하지 않게 한다.
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Enter" && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault();
  }
  // 기능 : 명시적 제출만 저장 hook에 전달해 중복 저장과 조합 중 제출을 막는다.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composing.current) void editor.handleSave();
  }
  // 기능 : 한글 조합 시작을 저장 제출의 차단 조건으로 기록한다.
  function handleCompositionStart() { composing.current = true; }
  // 기능 : 한글 조합 완료 뒤 명시적인 저장을 다시 허용한다.
  function handleCompositionEnd() { composing.current = false; }
  const error = editor.validation || (editor.error instanceof Error && editor.error.name !== "AbortError" ? editor.error.message : "");
  return <Dialog title="Edit preview item" onClose={onClose}
    description="Changes stay in this browser session."
    footer={<Button type="submit" form="preview-item-form" pending={editor.pending}>{editor.pending ? "Saving…" : "Save"}</Button>}>
    <form id="preview-item-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart} onCompositionEnd={handleCompositionEnd} noValidate>
      <Field label="Name" value={editor.name} error={error} required disabled={editor.pending}
        onChange={(event) => editor.setName(event.currentTarget.value)} />
      {error && <span className="sr-only" role="alert">{error}</span>}
    </form>
  </Dialog>;
}
