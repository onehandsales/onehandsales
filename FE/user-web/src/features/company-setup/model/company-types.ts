import type { CompanySettings, SettingsScenario } from "@/features/company-settings/model/settings-types";
import type { PreviewScope } from "@/features/preview/model/preview-types";
import type { BrandDefaults, BrandSave, DocumentBrandSnapshot } from "@/features/document-branding/model/branding-types";
export type SetupStep = 0 | 1 | 2 | 3 | 4;
export type SetupDraft = { step: SetupStep; furthest: SetupStep; industry: string; name: string; country: string; businessType: string; currency: string; revenue: string; invites: string[]; purposes: string[] };
export type Company = Omit<SetupDraft, "step" | "furthest"> & { id: string; workspaceId: string; setupComplete: boolean; detailsComplete: boolean; settingsRevision: number; branding: BrandDefaults; brandingRevision: number } & CompanySettings;
export type CompanyScenario = "normal" | "slow" | "fail-once";
export type CompanyStore = {
  getSnapshot(): { version: number; scenario: CompanyScenario; settingsScenario: SettingsScenario };
  subscribe(listener: () => void): () => void;
  connect(): () => void;
  draft(scope: PreviewScope): SetupDraft;
  company(workspaceId: string): Company | undefined;
  readSettings(scope: PreviewScope, signal: AbortSignal): Promise<Company>;
  saveSettings(scope: PreviewScope, value: CompanySettings, expectedRevision: number, signal: AbortSignal): Promise<Company>;
  saveBranding(scope: PreviewScope, value: BrandSave, signal: AbortSignal): Promise<Company>;
  snapshotDocumentBranding(scope: PreviewScope): DocumentBrandSnapshot;
  publicCompany(slug: string): { name: string; country: string; logo: File | null; enabled: boolean } | undefined;
  setSettingsScenario(scenario: SettingsScenario): void;
  consumeLogoFailure(): boolean;
  edit(scope: PreviewScope, patch: Partial<SetupDraft>): void;
  setScenario(scenario: CompanyScenario): void;
  finish(scope: PreviewScope, signal: AbortSignal): Promise<Company>;
};
export const initialSetup: SetupDraft = { step: 0, furthest: 0, industry: "", name: "", country: "Malaysia", businessType: "", currency: "MYR", revenue: "", invites: ["", "", ""], purposes: ["Client billing"] };
export const industries = ["Accounting / Auditing", "Acting", "Analytics", "Animation", "Architecture", "Art Direction", "Dentist", "Design", "Digital Marketing", "E-Commerce", "Engineering", "Esports"];
export const purposes = ["Client billing", "Client and lead management", "Time tracking and reporting", "Bookkeeping and banking", "Project and task management", "Contractor management", "Other"];
// 기능 : 입력 오류와 중복 제안을 원래 이메일 칸에 대응시키며 빈 칸은 허용한다.
export function invalidInviteIndexes(invites: string[]) {
  const emails = invites.map(email => email.trim().toLowerCase());
  const malformed = emails.flatMap((email, index) => email && (email.length > 256 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? [index] : []);
  const duplicate = emails.flatMap((email, index) => email && emails.indexOf(email) !== index ? [index] : []);
  return { malformed, duplicate };
}
// 기능 : 확인된 설문의 필수값과 명시적 목 초대 검증을 단계별로 확인한다.
export function setupError(draft: SetupDraft, step: SetupStep) {
  if (step === 0 && (!industries.includes(draft.industry) || !draft.name.trim() || draft.name.length > 120 || !draft.country)) return "Choose a listed industry and enter a business name (up to 120 characters).";
  if (step === 1 && (!draft.businessType || !draft.currency || !draft.revenue)) return "Select a business type, currency and revenue range.";
  if (step === 3) {
    const invalid = invalidInviteIndexes(draft.invites);
    if (invalid.malformed.length) return "Enter a valid sample email or leave the field empty.";
    if (invalid.duplicate.length) return "Each sample teammate email must be different.";
  }
  if (step === 4 && !draft.purposes.length) return "Choose at least one purpose.";
  return "";
}
