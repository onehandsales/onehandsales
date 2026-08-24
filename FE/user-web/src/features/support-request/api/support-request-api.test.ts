import { describe, expect, it, vi } from "vitest";
import { createSupportRequest } from "@/features/support-request/api/support-request-api";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

// 기능 : 지원 요청 API client의 JSON 요청 생성을 검증합니다.
describe("createSupportRequest", () => {
  it("sends type, description, and pageUrl as JSON body", async () => {
    apiClientMock.mockResolvedValue({
      id: "support-request-1",
      message: "지원 요청을 보냈어요.",
    });

    await createSupportRequest({
      type: "FEATURE_QUESTION",
      description: "문의하고 싶은 기능:\n궁금한 점: 기능 동작을 알고 싶어요.",
      pageUrl: "http://localhost:5173/app",
    });

    expect(apiClientMock).toHaveBeenCalledWith("/api/support-requests", {
      method: "POST",
      body: {
        type: "FEATURE_QUESTION",
        description: "문의하고 싶은 기능:\n궁금한 점: 기능 동작을 알고 싶어요.",
        pageUrl: "http://localhost:5173/app",
      },
    });
  });
});
