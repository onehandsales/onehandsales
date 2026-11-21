import type { ClientData } from "./client-types";
export type ClientField = { id: string; name: string; revision: number };
export type ClientFieldValue = { clientId: string; fieldId: string; value: string; revision: number };
export type ClientImage = { file: Blob; name: string };
export type ClientEdit =
  | { kind: "add-field"; id: string; name: string }
  | { kind: "rename-field"; id: string; name: string; revision: number }
  | { kind: "delete-field"; id: string; revision: number }
  | { kind: "field-value"; clientId: string; fieldId: string; fieldRevision: number; revision: number; value: string }
  | { kind: "image"; clientId: string; revision: number; image: ClientImage | null };
// 기능 : 선택 이미지의 명시한 로컬 한도만 검증하며 실제 업로드 정책으로 취급하지 않는다.
export function clientImageError(file: Blob) {
  return !["image/png", "image/jpeg", "image/webp"].includes(file.type) || !file.size || file.size > 2 * 1024 * 1024
    ? "Choose a PNG, JPEG or WebP image up to 2 MB (local preview limit)." : "";
}
// 기능 : 저장 직전 정의·고객·값의 최신 ID와 버전을 확인하고 복사본에만 변경을 적용한다.
export function applyClientEdit(data: ClientData, edit: ClientEdit): ClientData {
  const next = structuredClone(data);
  if (edit.kind === "add-field" || edit.kind === "rename-field") {
    const name = edit.name.trim();
    if (!name || name.length > 100) throw new Error("Enter a field name of 1–100 characters.");
    if (next.fields.some(field => field.id !== edit.id && field.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error("A field with this name already exists.");
    if (edit.kind === "add-field") {
      if (next.fields.some(field => field.id === edit.id)) return next;
      next.fields.unshift({ id: edit.id, name, revision: 0 });
    } else {
      const field = next.fields.find(field => field.id === edit.id);
      if (!field || field.revision !== edit.revision) throw new Error("This field changed or was removed. Cancel and reopen it.");
      field.name = name; field.revision++;
    }
  } else if (edit.kind === "delete-field") {
    const field = next.fields.find(field => field.id === edit.id);
    if (!field || field.revision !== edit.revision) throw new Error("This field changed or was removed. Cancel and reopen it.");
    next.fields = next.fields.filter(field => field.id !== edit.id);
    next.fieldValues = next.fieldValues.filter(value => value.fieldId !== edit.id);
  } else {
    const client = next.clients.find(client => client.id === edit.clientId);
    if (!client) throw new Error("Client not found in this workspace.");
    if (edit.kind === "image") {
      if (client.imageRevision !== edit.revision) throw new Error("The saved image changed. Cancel and select again.");
      const invalid = edit.image && clientImageError(edit.image.file); if (invalid) throw new Error(invalid);
      client.image = edit.image; client.imageRevision++;
    } else {
      const field = next.fields.find(field => field.id === edit.fieldId);
      if (!field || field.revision !== edit.fieldRevision) throw new Error("This field changed or was removed. Cancel and reopen it.");
      const current = next.fieldValues.find(value => value.clientId === client.id && value.fieldId === field.id);
      if ((current?.revision ?? 0) !== edit.revision) throw new Error("This value changed. Cancel and reopen it.");
      if (edit.value.length > 1000) throw new Error("Use no more than 1000 characters.");
      const saved = { clientId: client.id, fieldId: field.id, value: edit.value, revision: edit.revision + 1 };
      next.fieldValues = [...next.fieldValues.filter(value => value !== current), saved];
    }
    client.revision++;
  }
  return next;
}
