import { describe, expect, it, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import fixtures from "../../../../tests/fixtures/view-data.json";
import { getWorkspaceViewData, parseViewDataResponse } from "./view-data-api";
vi.mock("@/lib/api-client", () => ({ apiClient: vi.fn() }));

// 기능 : 서버 계산기로 만든 가상 응답의 11개 타입 계약과 요청 격리를 검사합니다.
describe("View data API contract", () => {
  beforeEach(() => vi.mocked(apiClient).mockReset());
  it.each(Object.entries(fixtures))("validates %s", (type, fixture) => {
    expect(parseViewDataResponse(fixture).viewType).toBe(type);
  });
  it("rejects malformed cells and payloads from another view", async () => {
    const malformed = structuredClone(fixtures.TABLE);
    (malformed.data.items[0]!.cells[0]!.values as unknown) = "invalid";
    expect(() => parseViewDataResponse(malformed)).toThrow();
    vi.mocked(apiClient).mockResolvedValue(fixtures.TABLE);
    await expect(
      getWorkspaceViewData("space", "view-list", {}),
    ).rejects.toThrow("does not match request");
  });
  it("sends every map context field and the cancellation signal using GET", async () => {
    vi.mocked(apiClient).mockResolvedValue(fixtures.MAP);
    const signal = new AbortController().signal;
    await getWorkspaceViewData(
      "space",
      "view-map",
      {
        sourceType: "LIST",
        q: "Company + Partners",
        bounds: [170, -10, -170, 10],
      },
      signal,
    );
    const [path, options] = vi.mocked(apiClient).mock.calls[0]!;
    const url = new URL(path, "https://example.test");
    expect(url.searchParams.get("q")).toBe("Company + Partners");
    expect(JSON.parse(url.searchParams.get("bounds")!)).toEqual([
      170, -10, -170, 10,
    ]);
    expect(options).toEqual({ signal });
  });
});
