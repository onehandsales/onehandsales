import type { PreviewScope, Scenario } from "@/features/preview";
export type ClientContact = { id: string; workspaceId: string; name: string; email: string };
export type ClientCompany = { id: string; workspaceId: string; companyName: string; displayName: string; contactIds: string[]; defaultContactId: string; tagIds: string[]; status: "active"; revision: number };
export type ClientTag = { id: string; name: string };
export type ClientData = { clients: ClientCompany[]; contacts: ClientContact[]; tags: ClientTag[] };
export type ClientDraft = { companyName: string; contactName: string; email: string; tagIds: string[] };
export type ClientState = { version: number; scenario: Scenario };
export interface ClientStore {
  getSnapshot(): ClientState;
  subscribe(listener: () => void): () => void;
  connect(): () => void;
  setScenario(scenario: Scenario): void;
  read(scope: PreviewScope, signal: AbortSignal): Promise<ClientData>;
  create(scope: PreviewScope, draft: ClientDraft, submissionId: string, signal: AbortSignal): Promise<ClientCompany>;
}
// 기능 : 고객 폼의 관찰된 필수 입력과 명시한 목 길이·이메일 형식을 검증한다.
export function clientDraftError(draft: ClientDraft) {
  if (!draft.contactName.trim()) return "Enter a contact name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return "Enter a valid email address.";
  if (draft.contactName.trim().length > 200 || draft.companyName.trim().length > 200 || draft.email.trim().length > 254) return "Use a shorter name or email.";
  return "";
}
