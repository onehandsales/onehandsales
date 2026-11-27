import type { PreviewScope, Scenario } from "@/features/preview";
import type { ClientEdit, ClientField, ClientFieldValue, ClientImage } from "./client-edits";
export type ClientContact = { id: string; workspaceId: string; name: string; email: string };
export type ClientCompany = { id: string; workspaceId: string; companyName: string; displayName: string; contactIds: string[]; defaultContactId: string; tagIds: string[]; status: "active"; revision: number; image: ClientImage | null; imageRevision: number };
export type ClientTag = { id: string; name: string };
export type ClientData = { clients: ClientCompany[]; contacts: ClientContact[]; tags: ClientTag[]; fields: ClientField[]; fieldValues: ClientFieldValue[] };
export type ClientDraft = { companyName: string; contactName: string; email: string; tagIds: string[] };
export type ClientState = { version: number; scenario: Scenario };
export interface ClientStore {
  getSnapshot(): ClientState;
  subscribe(listener: () => void): () => void;
  connect(): () => void;
  setScenario(scenario: Scenario): void;
  read(scope: PreviewScope, signal: AbortSignal): Promise<ClientData>;
  create(scope: PreviewScope, draft: ClientDraft, submissionId: string, signal: AbortSignal): Promise<ClientCompany>;
  edit(scope: PreviewScope, edit: ClientEdit, signal: AbortSignal): Promise<void>;
  client(workspaceId: string, id: string): ClientCompany | null;
}
// 기능 : 관찰된 필수 입력과 목 길이·이메일 검증의 오류를 해당 입력에 연결한다.
export function clientDraftIssue(draft: ClientDraft): { field: "contactName" | "email" | "companyName"; message: string } | null {
  if (!draft.contactName.trim()) return { field: "contactName", message: "Enter a contact name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return { field: "email", message: "Enter a valid email address." };
  if (draft.contactName.trim().length > 200) return { field: "contactName", message: "Use a shorter name or email." };
  if (draft.companyName.trim().length > 200) return { field: "companyName", message: "Use a shorter name or email." };
  if (draft.email.trim().length > 254) return { field: "email", message: "Use a shorter name or email." };
  return null;
}
// 기능 : 저장소에서도 폼과 같은 검증 문구로 잘못된 고객 생성을 거부한다.
export function clientDraftError(draft: ClientDraft) { return clientDraftIssue(draft)?.message ?? ""; }
