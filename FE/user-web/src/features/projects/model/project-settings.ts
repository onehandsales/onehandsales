import type { Project, ProjectSettings } from "./project-types";
export type ProjectSettingsDraft = { name: string; rate: string; description: string; startDate: string; endDate: string; reminders: boolean };
// 기능 : 설정 검증 오류의 메시지와 해당 입력을 같은 검증 원본에서 전달한다.
export class ProjectSettingsError extends Error {
  readonly field: keyof ProjectSettingsDraft;
  // 기능 : 검증을 실패한 필드를 저장한다.
  constructor(field: keyof ProjectSettingsDraft, message: string) { super(message); this.field = field; }
}
// 기능 : 공용 값 검증 오류에 설정 입력 위치를 덧붙인다.
function validateField<T>(field: keyof ProjectSettingsDraft, validate: () => T): T { try { return validate(); } catch (reason) { throw new ProjectSettingsError(field, (reason as Error).message); } }
// 기능 : 관찰된 청구 기본값만 새 목 프로젝트에 제공하고 회사 설정 상속으로 단정하지 않는다.
export function defaultProjectSettings(): ProjectSettings { return { paymentType: "hourly", currency: "USD", rateMinor: 2000, description: "", endDate: null, reminders: true }; }
// 기능 : 저장된 설정을 독립적인 명시적 저장 초안으로 복사한다.
export function projectSettingsDraft(project: Project): ProjectSettingsDraft { return { name: project.name, rate: (project.settings.rateMinor / 100).toFixed(2), description: project.settings.description, startDate: project.startDate ?? "", endDate: project.settings.endDate ?? "", reminders: project.settings.reminders }; }
// 기능 : 금액 문자열을 부동소수 곱셈 없이 minor-unit으로 검증한다.
export function projectRate(value: string) { const text = value.trim(); if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) throw new Error("Enter an hourly rate from 0 to 9,999,999.99 with up to two decimals."); const [whole = "0", fraction = ""] = text.split("."); return Number(whole) * 100 + Number(fraction.padEnd(2, "0")); }
// 기능 : 빈 업무일과 실제 존재하는 ISO 날짜를 구분한다.
export function projectDay(value: string): string | null { if (!value) return null; if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "9999-12-31" || !Number.isFinite(Date.parse(value + "T00:00:00Z")) || new Date(value + "T00:00:00Z").toISOString().slice(0, 10) !== value) throw new Error("Choose a valid calendar date from 1900 onward."); return value; }
// 기능 : 제목의 목 한도를 적용하면서 같은 이름의 다른 프로젝트는 허용한다.
export function projectTitle(value: string) { const name = value.trim(); if (!name || name.length > 200) throw new Error("Enter a project title of 1–200 characters."); return name; }
// 기능 : 제목·요율·설명·기간·알림을 함께 검증해 부분 저장을 방지한다.
export function validateProjectSettings(draft: ProjectSettingsDraft) { const name = validateField("name", () => projectTitle(draft.name)); const rateMinor = validateField("rate", () => projectRate(draft.rate)); const startDate = validateField("startDate", () => projectDay(draft.startDate)); const endDate = validateField("endDate", () => projectDay(draft.endDate)); if (startDate && endDate && endDate < startDate) throw new ProjectSettingsError("endDate", "End date must be on or after the start date."); if (draft.description.length > 4000) throw new ProjectSettingsError("description", "Keep the description within 4,000 characters."); return { name, startDate, settings: { paymentType: "hourly" as const, currency: "USD" as const, rateMinor, description: draft.description, endDate, reminders: draft.reminders } }; }
// 기능 : 원본 초를 보존하고 표시된 소수 시간과 청구 금액을 별도로 집계한다.
export function projectTimeSummary(project: Pick<Project, "timeEntries">) { const seconds = project.timeEntries.reduce((sum, entry) => sum + entry.seconds, 0); const amountMinor = project.timeEntries.reduce((sum, entry) => sum + entry.amountMinor, 0); return { seconds, hours: (seconds / 3600).toFixed(2), amountMinor }; }
// 기능 : 초 단위 원본을 누락 없이 시·분·초 문자열로 표시한다.
export function projectDuration(seconds: number) { return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map(value => String(value).padStart(2, "0")).join(":"); }
