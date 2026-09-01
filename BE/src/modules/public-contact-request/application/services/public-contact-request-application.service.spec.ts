import type { PublicContactRequestRepository } from "@/modules/public-contact-request/application/ports/public-contact-request.repository";
import { PublicContactRequestApplicationService } from "@/modules/public-contact-request/application/services/public-contact-request-application.service";
import { PublicContactRequestValidationError } from "@/modules/public-contact-request/domain/public-contact-request.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const VALID_COMMAND = {
  email: " Sales@Example.COM ",
  companySize: " 10-49 ",
  firstName: " Jane ",
  lastName: " Kim ",
  company: " Example Inc. ",
  title: " Sales Lead ",
  region: " US ",
  phone: " 010-0000-0000 ",
  plan: " Field sales follow-up in one workspace. ",
  source: " search ",
  marketingAgreement: true,
  pageUrl: " https://onehand.app/en-us/contact ",
  locale: " en-US ",
  requestId: " request-public-contact-1 ",
  userAgent: " playwright ",
} as const;

// 기능 : PublicContactRequestApplicationService 테스트용 fixture를 생성합니다.
function createFixture() {
  const repository: jest.Mocked<PublicContactRequestRepository> = {
    createPublicContactRequest: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000401",
    }),
    existsActiveUserByEmail: jest.fn().mockResolvedValue(true),
  };
  const logger = new AppLogger();
  const logSpy = jest.spyOn(logger, "log").mockImplementation(() => undefined);

  return {
    logger,
    logSpy,
    repository,
    service: new PublicContactRequestApplicationService(repository, logger),
  };
}

// 기능 : 공개 문의 접수 use case 검증을 수행합니다.
describe("PublicContactRequestApplicationService", () => {
  it("rejects invalid email addresses", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createPublicContactRequest({
        ...VALID_COMMAND,
        email: "sales.example.com",
      })
    ).rejects.toMatchObject({
      code: "PUBLIC_CONTACT_REQUEST_VALIDATION_FAILED",
      details: { field: "email" },
    } satisfies Partial<PublicContactRequestValidationError>);

    expect(fixture.repository.existsActiveUserByEmail).not.toHaveBeenCalled();
    expect(fixture.repository.createPublicContactRequest).not.toHaveBeenCalled();
  });

  it("rejects unsupported company sizes", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createPublicContactRequest({
        ...VALID_COMMAND,
        companySize: "500+",
      })
    ).rejects.toMatchObject({
      code: "PUBLIC_CONTACT_REQUEST_VALIDATION_FAILED",
      details: { field: "companySize" },
    } satisfies Partial<PublicContactRequestValidationError>);

    expect(fixture.repository.createPublicContactRequest).not.toHaveBeenCalled();
  });

  it("rejects non-boolean marketing agreement values", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createPublicContactRequest({
        ...VALID_COMMAND,
        marketingAgreement: "true",
      })
    ).rejects.toMatchObject({
      code: "PUBLIC_CONTACT_REQUEST_VALIDATION_FAILED",
      details: { field: "marketingAgreement" },
    } satisfies Partial<PublicContactRequestValidationError>);

    expect(fixture.repository.createPublicContactRequest).not.toHaveBeenCalled();
  });

  it("creates a public contact request with normalized email and safe logging", async () => {
    const fixture = createFixture();

    const response = await fixture.service.createPublicContactRequest(
      VALID_COMMAND
    );

    expect(fixture.repository.existsActiveUserByEmail).toHaveBeenCalledWith(
      "sales@example.com"
    );
    expect(fixture.repository.createPublicContactRequest).toHaveBeenCalledWith({
      email: "Sales@Example.COM",
      normalizedEmail: "sales@example.com",
      companySize: "10-49",
      firstName: "Jane",
      lastName: "Kim",
      companyName: "Example Inc.",
      jobTitle: "Sales Lead",
      region: "US",
      phone: "010-0000-0000",
      plan: "Field sales follow-up in one workspace.",
      source: "search",
      marketingAgreement: true,
      wasExistingUserAtSubmission: true,
      pageUrl: "https://onehand.app/en-us/contact",
      locale: "en-US",
      requestId: "request-public-contact-1",
      userAgent: "playwright",
    });
    expect(response).toEqual({
      id: "00000000-0000-4000-8000-000000000401",
      message: "문의가 접수되었습니다.",
    });

    const logPayload = String(fixture.logSpy.mock.calls[0]?.[0] ?? "");
    expect(logPayload).toContain("publicContactRequest.created");
    expect(logPayload).toContain("10-49");
    expect(logPayload).not.toContain("Sales@Example.COM");
    expect(logPayload).not.toContain("sales@example.com");
    expect(logPayload).not.toContain("010-0000-0000");
    expect(logPayload).not.toContain("Example Inc.");
    expect(logPayload).not.toContain("Field sales follow-up");
  });
});
