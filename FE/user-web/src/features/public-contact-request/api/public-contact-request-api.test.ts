import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPublicContactRequest } from "@/features/public-contact-request/api/public-contact-request-api";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

const apiClientMock = vi.mocked(apiClient);

// 기능 : 공개 문의 API client 요청 body를 검증합니다.
describe("createPublicContactRequest", () => {
  beforeEach(() => {
    apiClientMock.mockReset();
    apiClientMock.mockResolvedValue({
      id: "public-contact-1",
      message: "문의가 접수되었습니다.",
    });
  });

  it("posts public contact request values without auth refresh", async () => {
    await createPublicContactRequest({
      email: "sales@example.com",
      companySize: "10-49",
      firstName: "Jane",
      lastName: "Kim",
      company: "Example Inc.",
      title: "Sales Lead",
      region: "US",
      phone: "010-0000-0000",
      plan: "Field sales follow-up in one workspace.",
      source: "search",
      marketingAgreement: true,
      pageUrl: "https://onehand.app/en-us/contact",
      locale: "en-US",
    });

    expect(apiClientMock).toHaveBeenCalledWith("/api/public/contact-requests", {
      method: "POST",
      skipAuthRefresh: true,
      body: {
        email: "sales@example.com",
        companySize: "10-49",
        firstName: "Jane",
        lastName: "Kim",
        company: "Example Inc.",
        title: "Sales Lead",
        region: "US",
        phone: "010-0000-0000",
        plan: "Field sales follow-up in one workspace.",
        source: "search",
        marketingAgreement: true,
        pageUrl: "https://onehand.app/en-us/contact",
        locale: "en-US",
      },
    });
  });
});
