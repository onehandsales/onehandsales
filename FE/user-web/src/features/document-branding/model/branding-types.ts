export type HeaderPreset = "none" | "abstract" | "plant";
// 의미 : 미관찰 왕관 옵션은 확정 정책으로 저장하지 않는 이번 목의 지원 범위다.
export type BrandDefaults = { header: HeaderPreset; logoSize: "small-square"; font: null; color: "#22AD01"; whiteLabel: "bonsai" };
export type BrandDraft = { defaults: BrandDefaults; logo: File | null };
export type BrandSave = BrandDraft & { brandRevision: number; companyRevision: number; logoChanged: boolean };
export type DocumentBrandSnapshot = { companyId: string; defaultsRevision: number; defaults: BrandDefaults; logo: File | null };
// 기능 : 관찰된 초기 문서 브랜드 선택을 독립 객체로 만든다.
export function initialBrandDefaults(): BrandDefaults { return { header: "none", logoSize: "small-square", font: null, color: "#22AD01", whiteLabel: "bonsai" }; }
// 기능 : 미관찰 옵션이 목 저장소의 확정 기본값으로 유입되지 않게 검사한다.
export function brandingError(value: BrandDefaults) {
  return !["none", "abstract", "plant"].includes(value.header) || value.logoSize !== "small-square" || value.font !== null || value.color !== "#22AD01" || value.whiteLabel !== "bonsai" ? "This option is not available in the recorded preview." : "";
}
