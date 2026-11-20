import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePreviewEnvironment } from "../data/preview-context";
import { previewKeys } from "../data/preview-keys";
import type { PreviewItem } from "../model/preview-types";
import { usePreviewScope } from "./use-preview-items";

// 기능 : 편집 초안·저장 중복·취소·실패 후 재시도와 관련 캐시 갱신을 관리한다.
export function usePreviewEditor(item: PreviewItem, onSaved: () => void) {
  const [name, setName] = useState(item.name);
  const [validation, setValidation] = useState("");
  const { runtime } = usePreviewEnvironment();
  const scope = usePreviewScope();
  const client = useQueryClient();
  const active = useRef<AbortController | null>(null);
  const mutation = useMutation({
    mutationFn: ({ submittedName, controller }: { submittedName: string; controller: AbortController }) =>
      runtime.source.rename(scope, item.id, submittedName, controller.signal),
    retry: false,
  });
  // 기능 : 편집기 종료와 진행 저장의 취소 수명을 연결한다.
  useEffect(function registerEditorLifetime() {
    // 기능 : 닫힌 편집기의 늦은 저장과 완료 알림을 취소한다.
    return function cancelPendingSave() { active.current?.abort(); };
  }, []);

  // 기능 : 초안을 고정해 저장하고 현재 편집기가 살아 있을 때만 완료 화면으로 이동한다.
  async function handleSave() {
    if (active.current) return;
    if (!name.trim()) { setValidation("Enter a name."); return; }
    setValidation("");
    const controller = new AbortController();
    active.current = controller;
    try {
      // 1. 저장 시점의 입력과 대상은 mutation의 인자로 고정한다.
      const result = await mutation.mutateAsync({ submittedName: name, controller });
      if (controller.signal.aborted || runtime.getSnapshot().revision !== scope.revision) return;
      // 2. 실제 변경된 상세와 목록만 갱신하고 다른 작업공간 캐시는 건드리지 않는다.
      const keys = previewKeys(scope);
      client.setQueryData(keys.detail(item.id), result);
      await client.invalidateQueries({ queryKey: keys.list });
      onSaved();
    } catch (error) {
      // 이유 : 취소 외 오류는 mutation 상태로 표시해 입력을 유지하고 같은 폼에서 재시도한다.
      if (!(error instanceof DOMException && error.name === "AbortError")) return;
    } finally {
      active.current = null;
    }
  }
  return { name, setName, validation, error: mutation.error, pending: mutation.isPending, handleSave };
}
