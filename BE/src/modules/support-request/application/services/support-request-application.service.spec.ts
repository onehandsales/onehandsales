import type {
  SupportRequestRepository,
  SupportRequestUserSnapshot,
} from "@/modules/support-request/application/ports/support-request.repository";
import { SupportRequestApplicationService } from "@/modules/support-request/application/services/support-request-application.service";
import { SupportRequestValidationError } from "@/modules/support-request/domain/support-request.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const USER_SNAPSHOT: SupportRequestUserSnapshot = {
  id: CURRENT_USER.id,
  email: "snapshot@example.com",
  displayName: "Snapshot User",
  role: "USER",
};

// 기능 : SupportRequestApplicationService 테스트용 fixture를 생성합니다.
function createFixture() {
  // 1. 이후 처리에 사용할 repository을 계산한다.
  const repository: jest.Mocked<SupportRequestRepository> = {
    createSupportRequest: jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000301",
    }),
    findUserSnapshotById: jest.fn().mockResolvedValue(USER_SNAPSHOT),
  };
  // 2. 이후 처리에 사용할 logger을 계산한다.
  const logger = new AppLogger();
  // 3. 이후 처리에 사용할 logSpy을 계산한다.
  const logSpy = jest.spyOn(logger, "log").mockImplementation(() => undefined);

  // 4. 계산된 결과를 호출자에게 반환한다.
  return {
    logger,
    logSpy,
    repository,
    service: new SupportRequestApplicationService(repository, logger),
  };
}

// 기능 : 지원 요청 접수 use case 검증을 수행합니다.
describe("SupportRequestApplicationService", () => {
  // 1. 필요한 비동기 작업을 실행한다.
  it("rejects blank support request types", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createSupportRequest({
        currentUser: CURRENT_USER,
        type: "   ",
        description: "기능 문의 내용을 확인해 주세요.",
        pageUrl: "http://localhost:5173/app",
        requestId: "request-1",
        userAgent: "playwright",
      })
    ).rejects.toMatchObject({
      code: "SUPPORT_REQUEST_TYPE_REQUIRED",
    } satisfies Partial<SupportRequestValidationError>);

    expect(fixture.repository.createSupportRequest).not.toHaveBeenCalled();
  });

  // 2. 필요한 비동기 작업을 실행한다.
  it("rejects unsupported support request types", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createSupportRequest({
        currentUser: CURRENT_USER,
        type: "USAGE_QUESTION",
        description: "기능 문의 내용을 확인해 주세요.",
        pageUrl: "http://localhost:5173/app",
        requestId: "request-2",
        userAgent: "playwright",
      })
    ).rejects.toMatchObject({
      code: "SUPPORT_REQUEST_TYPE_INVALID",
    } satisfies Partial<SupportRequestValidationError>);

    expect(fixture.repository.createSupportRequest).not.toHaveBeenCalled();
  });

  // 3. 필요한 비동기 작업을 실행한다.
  it("rejects blank descriptions after trimming whitespace", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createSupportRequest({
        currentUser: CURRENT_USER,
        type: "FEATURE_QUESTION",
        description: "   ",
        pageUrl: "http://localhost:5173/app",
        requestId: "request-3",
        userAgent: "playwright",
      })
    ).rejects.toMatchObject({
      code: "SUPPORT_REQUEST_DESCRIPTION_REQUIRED",
    } satisfies Partial<SupportRequestValidationError>);

    expect(fixture.repository.createSupportRequest).not.toHaveBeenCalled();
  });

  // 4. 필요한 비동기 작업을 실행한다.
  it("rejects descriptions longer than 1000 characters", async () => {
    const fixture = createFixture();

    await expect(
      fixture.service.createSupportRequest({
        currentUser: CURRENT_USER,
        type: "FEATURE_QUESTION",
        description: "가".repeat(1001),
        pageUrl: "http://localhost:5173/app",
        requestId: "request-4",
        userAgent: "playwright",
      })
    ).rejects.toMatchObject({
      code: "SUPPORT_REQUEST_DESCRIPTION_TOO_LONG",
    } satisfies Partial<SupportRequestValidationError>);

    expect(fixture.repository.createSupportRequest).not.toHaveBeenCalled();
  });

  // 5. 필요한 비동기 작업을 실행한다.
  it("creates a support request with user snapshot and safe logging", async () => {
    // 1. 이후 처리에 사용할 fixture을 계산한다.
    const fixture = createFixture();

    // 2. 비동기 결과를 받아 response에 저장한다.
    const response = await fixture.service.createSupportRequest({
      currentUser: CURRENT_USER,
      type: " PHONE_CONSULTATION ",
      description: " 연락 가능한 전화번호: 010-0000-0000\n상담 내용을 확인해 주세요. ",
      pageUrl: " http://localhost:5173/app/settings ",
      requestId: " request-support-1 ",
      userAgent: " playwright ",
    });

    // 3. 테스트 기대 조건을 검증한다.
    expect(fixture.repository.findUserSnapshotById).toHaveBeenCalledWith(
      CURRENT_USER.id
    );
    // 4. 테스트 기대 조건을 검증한다.
    expect(fixture.repository.createSupportRequest).toHaveBeenCalledWith({
      user: USER_SNAPSHOT,
      type: "PHONE_CONSULTATION",
      description:
        "연락 가능한 전화번호: 010-0000-0000\n상담 내용을 확인해 주세요.",
      pageUrl: "http://localhost:5173/app/settings",
      requestId: "request-support-1",
      userAgent: "playwright",
    });
    // 5. 테스트 기대 조건을 검증한다.
    expect(response).toEqual({
      id: "00000000-0000-4000-8000-000000000301",
      message: "지원 요청을 보냈어요.",
    });

    // 6. 이후 처리에 사용할 logPayload을 계산한다.
    const logPayload = String(fixture.logSpy.mock.calls[0]?.[0] ?? "");
    // 7. 테스트 기대 조건을 검증한다.
    expect(logPayload).toContain("supportRequest.created");
    // 8. 테스트 기대 조건을 검증한다.
    expect(logPayload).toContain("PHONE_CONSULTATION");
    // 9. 테스트 기대 조건을 검증한다.
    expect(logPayload).not.toContain("010-0000-0000");
    // 10. 테스트 기대 조건을 검증한다.
    expect(logPayload).not.toContain("snapshot@example.com");
  });
});
