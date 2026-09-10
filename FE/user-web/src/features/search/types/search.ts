export type SearchTargetType =
  | "COMPANY"
  | "CONTACT"
  | "PRODUCT"
  | "DEAL";

export interface SearchItem {
  readonly title: string;
  readonly subtitle: string | null;
  readonly targetId: string;
  readonly targetPath: string | null;
}

export interface SearchGroup {
  readonly type: SearchTargetType;
  readonly items: readonly SearchItem[];
}

export interface SearchAllResponse {
  readonly groups: readonly SearchGroup[];
}

export interface SearchAllInput {
  readonly q: string;
  readonly types?: readonly SearchTargetType[];
  readonly limit?: number;
}
