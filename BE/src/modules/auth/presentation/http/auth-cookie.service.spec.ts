import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Request, Response } from "express";
import { AuthCookieService } from "./auth-cookie.service";

type MockResponse = Response & {
  readonly cookie: jest.Mock;
  readonly clearCookie: jest.Mock;
};

// 기능 : AuthCookieService의 refresh cookie 옵션 계산을 검증합니다.
describe("AuthCookieService", () => {
  // 기능 : 앱 세션 TTL과 같은 maxAge로 refresh cookie를 설정하는지 확인합니다.
  // 1. 테스트 시나리오를 실행한다.
  it("sets refresh cookie maxAge from APP_SESSION_TTL_DAYS", () => {
    // 1. 이후 단계에서 사용할 response 값을 준비한다.
    const response = createResponse();
    // 2. 이후 단계에서 사용할 service 값을 준비한다.
    const service = createService({
      APP_SESSION_TTL_DAYS: "7",
    });

    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    service.setRefreshToken(response, "refresh-token");

    // 4. 테스트 기대 조건을 검증한다.
    expect(response.cookie).toHaveBeenCalledWith(
      "sales_b2c_refresh",
      "refresh-token",
      expect.objectContaining({
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/api/auth/refresh",
        sameSite: "lax",
        secure: false,
      })
    );
  });

  // 기능 : 잘못된 세션 TTL 설정은 기존 기본값인 7일로 대체합니다.
  // 2. 테스트 시나리오를 실행한다.
  it("falls back to seven days when APP_SESSION_TTL_DAYS is invalid", () => {
    // 1. 이후 단계에서 사용할 response 값을 준비한다.
    const response = createResponse();
    // 2. 이후 단계에서 사용할 service 값을 준비한다.
    const service = createService({
      APP_SESSION_TTL_DAYS: "invalid",
    });

    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    service.setRefreshToken(response, "refresh-token");

    // 4. 테스트 기대 조건을 검증한다.
    expect(getCookieOptions(response).maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });

  // 기능 : cookie domain이 설정된 경우 refresh cookie 옵션에 포함합니다.
  // 3. 테스트 시나리오를 실행한다.
  it("sets the configured refresh cookie domain", () => {
    // 1. 이후 단계에서 사용할 response 값을 준비한다.
    const response = createResponse();
    // 2. 이후 단계에서 사용할 service 값을 준비한다.
    const service = createService({
      APP_REFRESH_COOKIE_DOMAIN: ".onehand.sales",
    });

    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    service.setRefreshToken(response, "refresh-token");

    // 4. 테스트 기대 조건을 검증한다.
    expect(getCookieOptions(response).domain).toBe(".onehand.sales");
  });

  // 기능 : 빈 cookie domain 설정은 refresh cookie 옵션에서 제외합니다.
  // 4. 테스트 시나리오를 실행한다.
  it("omits an empty refresh cookie domain", () => {
    // 1. 이후 단계에서 사용할 response 값을 준비한다.
    const response = createResponse();
    // 2. 이후 단계에서 사용할 service 값을 준비한다.
    const service = createService({
      APP_REFRESH_COOKIE_DOMAIN: "   ",
    });

    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    service.setRefreshToken(response, "refresh-token");

    // 4. 테스트 기대 조건을 검증한다.
    expect(getCookieOptions(response)).not.toHaveProperty("domain");
  });

  // 기능 : HTTPS API origin 또는 production 환경에서는 secure cookie를 사용합니다.
  // 5. 테스트 시나리오를 실행한다.
  it("sets secure cookie for HTTPS API origin", () => {
    // 1. 이후 단계에서 사용할 response 값을 준비한다.
    const response = createResponse();
    // 2. 이후 단계에서 사용할 service 값을 준비한다.
    const service = createService({
      API_PUBLIC_ORIGIN: "https://api.onehand.sales",
    });

    // 3. 화면 상태를 현재 흐름에 맞게 갱신한다.
    service.setRefreshToken(response, "refresh-token");

    // 4. 테스트 기대 조건을 검증한다.
    expect(getCookieOptions(response).secure).toBe(true);
  });

  // 기능 : refresh cookie 삭제 옵션에는 maxAge를 포함하지 않습니다.
  // 6. 테스트 시나리오를 실행한다.
  it("clears refresh cookie without maxAge", () => {
    // 1. 이후 단계에서 사용할 response 값을 준비한다.
    const response = createResponse();
    // 2. 이후 단계에서 사용할 service 값을 준비한다.
    const service = createService({
      APP_SESSION_TTL_DAYS: "7",
    });

    // 3. 현재 단계에서 필요한 동작을 실행한다.
    service.clearRefreshToken(response);

    // 4. 테스트 기대 조건을 검증한다.
    expect(response.clearCookie).toHaveBeenCalledWith(
      "sales_b2c_refresh",
      expect.objectContaining({
        httpOnly: true,
        path: "/api/auth/refresh",
        sameSite: "lax",
        secure: false,
      })
    );
    // 5. 테스트 기대 조건을 검증한다.
    expect(getClearCookieOptions(response)).not.toHaveProperty("maxAge");
  });

  // 기능 : 설정된 cookie 이름으로 요청 Cookie header에서 refresh token을 읽습니다.
  // 7. 테스트 시나리오를 실행한다.
  it("reads refresh token from the configured cookie name", () => {
    const service = createService({
      APP_REFRESH_COOKIE_NAME: "onehand_refresh",
    });
    const request = createRequest(
      "other=value; onehand_refresh=encoded%20refresh; sales_b2c_refresh=old"
    );

    expect(service.readRefreshToken(request)).toBe("encoded refresh");
  });
});

// 기능 : AuthCookieService 테스트 인스턴스를 생성합니다.
function createService(config: Record<string, string>): AuthCookieService {
  return new AuthCookieService(new ConfigService(config));
}

// 기능 : cookie 호출을 기록하는 테스트 response를 생성합니다.
function createResponse(): MockResponse {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as MockResponse;
}

// 기능 : Cookie header를 반환하는 테스트 request를 생성합니다.
function createRequest(cookieHeader: string): Request {
  return {
    header: (name: string) => (name === "Cookie" ? cookieHeader : undefined),
  } as unknown as Request;
}

// 기능 : 마지막 cookie 호출의 옵션을 반환합니다.
function getCookieOptions(response: MockResponse): CookieOptions {
  return response.cookie.mock.calls[0]?.[2] as CookieOptions;
}

// 기능 : 마지막 clearCookie 호출의 옵션을 반환합니다.
function getClearCookieOptions(response: MockResponse): CookieOptions {
  return response.clearCookie.mock.calls[0]?.[1] as CookieOptions;
}
