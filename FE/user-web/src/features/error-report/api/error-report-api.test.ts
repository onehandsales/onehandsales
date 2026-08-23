import { describe, expect, it, vi } from "vitest";
import { createErrorReport } from "@/features/error-report/api/error-report-api";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

// 기능 : 에러 신고 API client의 multipart 요청 생성을 검증합니다.
describe("createErrorReport", () => {
  it("sends description, pageUrl, and optional screenshot as FormData", async () => {
    apiClientMock.mockResolvedValue({
      id: "error-report-1",
      message: "신고가 접수되었어요. 문제를 빠르게 해결할게요.",
    });
    const screenshot = new Blob(["png"], { type: "image/png" });

    await createErrorReport({
      description: "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요.",
      pageUrl: "http://localhost:5173/app",
      screenshot,
    });

    expect(apiClientMock).toHaveBeenCalledWith("/api/error-reports", {
      method: "POST",
      body: expect.any(FormData),
    });

    const [, options] = apiClientMock.mock.calls[0] ?? [];
    const body = options?.body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("description")).toBe(
      "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요."
    );
    expect((body as FormData).get("pageUrl")).toBe("http://localhost:5173/app");
    expect((body as FormData).get("screenshot")).toBeInstanceOf(File);
  });
});
