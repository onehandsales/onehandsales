import { describe, expect, it, vi } from "vitest";
import { listSidebarCrmObjects } from "@/features/crm-object/api/sidebar-crm-object-api";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

// 기능 : 사이드바 CRM Object API client의 요청 경로 생성을 검증합니다.
describe("listSidebarCrmObjects", () => {
  it("requests sidebar objects for the selected workspace", async () => {
    apiClientMock.mockResolvedValue([
      {
        id: "object-definition-1",
        icon: "building-2",
        pluralName: "Companies",
        singularName: "Company",
      },
    ]);

    const result = await listSidebarCrmObjects("workspace/1");

    expect(result).toEqual([
      {
        id: "object-definition-1",
        icon: "building-2",
        pluralName: "Companies",
        singularName: "Company",
      },
    ]);
    expect(apiClientMock).toHaveBeenCalledWith(
      "/api/users/me/sidebar/workspaces/workspace%2F1/objects"
    );
  });
});
