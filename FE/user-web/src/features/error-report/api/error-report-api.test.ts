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
    // 1. 현재 단계에서 필요한 side effect를 실행한다.
    apiClientMock.mockResolvedValue({
      id: "error-report-1",
      message: "문제를 빠르게 해결할게요.",
    });
    // 2. 이후 처리에 사용할 screenshot을 계산한다.
    const screenshot = new Blob(["png"], { type: "image/png" });

    // 3. 필요한 비동기 작업을 실행한다.
    await createErrorReport({
      description: "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요.",
      pageUrl: "http://localhost:5173/app",
      screenshot,
    });

    // 4. 테스트 기대 조건을 검증한다.
    expect(apiClientMock).toHaveBeenCalledWith("/api/error-reports", {
      method: "POST",
      body: expect.any(FormData),
    });

    // 5. 이후 처리에 사용할 [, options]을 계산한다.
    const [, options] = apiClientMock.mock.calls[0] ?? [];
    // 6. 이후 처리에 사용할 body을 계산한다.
    const body = options?.body;
    // 7. 테스트 기대 조건을 검증한다.
    expect(body).toBeInstanceOf(FormData);
    // 8. 테스트 기대 조건을 검증한다.
    expect((body as FormData).get("description")).toBe(
      "홈 화면에서 카드가 겹쳐 보이고 버튼이 눌리지 않아요."
    );
    // 9. 테스트 기대 조건을 검증한다.
    expect((body as FormData).get("pageUrl")).toBe("http://localhost:5173/app");
    // 10. 테스트 기대 조건을 검증한다.
    expect((body as FormData).get("screenshot")).toBeInstanceOf(File);
  });
});
