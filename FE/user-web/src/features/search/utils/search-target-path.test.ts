import { describe, expect, it } from "vitest";
import type {
  SearchItem,
  SearchTargetType,
} from "@/features/search/types/search";
import { getSearchFallbackTargetPath } from "./search-target-path";

// 역할 : fallback route 계산에 사용할 최소 검색 결과 fixture입니다.
const SEARCH_ITEM: SearchItem = {
  title: "검색 결과",
  subtitle: null,
  targetId: "record-001",
  targetPath: null,
};

// 역할 : 통합검색 대상별 보호 앱 route 기대값을 정의합니다.
const TARGET_PATH_CASES: ReadonlyArray<{
  readonly type: SearchTargetType;
  readonly targetPath: string;
}> = [
  { type: "COMPANY", targetPath: "/app/companies/record-001" },
  { type: "CONTACT", targetPath: "/app/contacts/record-001" },
  { type: "PRODUCT", targetPath: "/app/products/record-001" },
  { type: "DEAL", targetPath: "/app/deals/record-001" },
  { type: "SCHEDULE", targetPath: "/app/schedules/record-001" },
  { type: "MEETING_NOTE", targetPath: "/app/meeting-notes/record-001" },
];

// 기능 : 검색 fallback targetPath가 `/app/*` route 계약을 유지하는지 검증합니다.
describe("getSearchFallbackTargetPath", () => {
  it.each(TARGET_PATH_CASES)(
    "maps $type to $targetPath",
    ({ type, targetPath }) => {
      expect(getSearchFallbackTargetPath(type, SEARCH_ITEM)).toBe(targetPath);
    }
  );
});
