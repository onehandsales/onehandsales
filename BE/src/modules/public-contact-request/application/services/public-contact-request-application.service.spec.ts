import type { PublicContactRequestRepository } from "@/modules/public-contact-request/application/ports/public-contact-request.repository";
import { PublicContactRequestApplicationService } from "@/modules/public-contact-request/application/services/public-contact-request-application.service";
import { PublicContactRequestValidationError } from "@/modules/public-contact-request/domain/public-contact-request.errors";
import type { UserQuery } from "@/modules/user/application/ports/user-query.port";
import type { ApplicationLogger } from "@/shared/application/ports/application-logger.port";

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
  // 1. 이후 단계에서 사용할 repository 값을 준비한다.
  const repository: jest.Mocked<PublicContactRequestRepository> = {
    createPublicContactRequest: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000401",
    }),
  };
  // 2. 이후 단계에서 사용할 logger 값을 준비한다.
  const userQuery: jest.Mocked<UserQuery> = {
    findUserSnapshotById: jest.fn().mockResolvedValue(null),
    existsActiveUserByEmail: jest.fn().mockResolvedValue(true),
  };
  const logger: jest.Mocked<ApplicationLogger> = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  };
  // 3. 이후 단계에서 사용할 logSpy 값을 준비한다.

  // 4. 계산된 결과를 호출자에게 반환한다.
  return {
    logger,
    repository,
    userQuery,
    service: new PublicContactRequestApplicationService(
      repository,
      userQuery,
      logger
    ),
  };
}

// 기능 : 공개 문의 접수 use case 검증을 수행합니다.
describe("PublicContactRequestApplicationService", () => {
  // 1. 필요한 비동기 작업을 실행한다.
  it("rejects invalid email addresses", async () => {
    // 1. 이후 단계에서 사용할 fixture 값을 준비한다.
    const fixture = createFixture();

    // 2. 필요한 비동기 작업을 실행한다.
    await expect(
      fixture.service.createPublicContactRequest({
        ...VALID_COMMAND,
        email: "sales.example.com",
      })
    ).rejects.toMatchObject({
      code: "PUBLIC_CONTACT_REQUEST_VALIDATION_FAILED",
      details: { field: "email" },
    } satisfies Partial<PublicContactRequestValidationError>);

    // 3. 테스트 기대 조건을 검증한다.
    expect(fixture.userQuery.existsActiveUserByEmail).not.toHaveBeenCalled();
    // 4. 테스트 기대 조건을 검증한다.
    expect(fixture.repository.createPublicContactRequest).not.toHaveBeenCalled();
  });

  // 2. 필요한 비동기 작업을 실행한다.
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

  // 3. 필요한 비동기 작업을 실행한다.
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

  // 4. 필요한 비동기 작업을 실행한다.
  it("creates a public contact request with normalized email and safe logging", async () => {
    // 1. 이후 단계에서 사용할 fixture 값을 준비한다.
    const fixture = createFixture();

    // 2. 비동기 결과를 받아 response에 저장한다.
    const response = await fixture.service.createPublicContactRequest(
      VALID_COMMAND
    );

    // 3. 테스트 기대 조건을 검증한다.
    expect(fixture.userQuery.existsActiveUserByEmail).toHaveBeenCalledWith(
      "sales@example.com"
    );
    // 4. 테스트 기대 조건을 검증한다.
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
    // 5. 테스트 기대 조건을 검증한다.
    expect(response).toEqual({
      id: "00000000-0000-4000-8000-000000000401",
      message: "문의가 접수되었습니다.",
    });

    // 6. 이후 단계에서 사용할 logPayload 값을 준비한다.
    const logPayload = String(fixture.logger.log.mock.calls[0]?.[0] ?? "");
    // 7. 테스트 기대 조건을 검증한다.
    expect(logPayload).toContain("publicContactRequest.created");
    // 8. 테스트 기대 조건을 검증한다.
    expect(logPayload).toContain("10-49");
    // 9. 테스트 기대 조건을 검증한다.
    expect(logPayload).not.toContain("Sales@Example.COM");
    // 10. 테스트 기대 조건을 검증한다.
    expect(logPayload).not.toContain("sales@example.com");
    // 11. 테스트 기대 조건을 검증한다.
    expect(logPayload).not.toContain("010-0000-0000");
    // 12. 테스트 기대 조건을 검증한다.
    expect(logPayload).not.toContain("Example Inc.");
    // 13. 테스트 기대 조건을 검증한다.
    expect(logPayload).not.toContain("Field sales follow-up");
  });
});
