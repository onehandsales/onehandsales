export type CompanyAddress = { line1: string; line2: string; city: string; postal: string; region: string };
export type CompanySettings = { name: string; country: string; currency: string; address: CompanyAddress | null; logo: File | null; publicProfile: boolean; slug: string; contactId: string };
export type SettingsScenario = "normal" | "slow" | "save-error" | "read-error" | "empty" | "denied" | "logo-error";
export const emptyAddress: CompanyAddress = { line1: "", line2: "", city: "", postal: "", region: "" };
export const companyCountries = ["Malaysia", "Singapore", "South Korea", "United States"];
export const companyCurrencies = ["MYR", "USD", "SGD", "KRW"];
// 기능 : 원본 미확인 제한을 명시적인 로컬 입력 검증으로 적용한다.
export function settingsError(value: CompanySettings) {
  if (value.name.length > 120) return "Use up to 120 characters for the company name.";
  if (!companyCountries.includes(value.country) || !companyCurrencies.includes(value.currency)) return "Choose an available country and currency.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) || value.slug.length > 60) return "Use 1–60 lowercase letters, numbers or separated hyphens for the profile URL.";
  if (value.address && Object.values(value.address).some(text => text.length > 240)) return "Use up to 240 characters in each address field.";
  return "";
}
// 기능 : 목 조회의 빈 상태·권한·실패를 사용자 화면에서 구분한다.
export class CompanyReadError extends Error {
  // 기능 : 화면 분기용 로컬 실패 종류를 보존한다.
  constructor(public readonly kind: "missing" | "denied" | "read", message: string) { super(message); this.name = "CompanyReadError"; }
}
// 기능 : 국가 표시는 원본 요약의 약어를 사용하되 입력 국가를 변경하지 않는다.
export function countryCode(country: string) { return ({ Malaysia: "MY", Singapore: "SG", "South Korea": "KR", "United States": "US" } as Record<string, string>)[country] ?? country; }
