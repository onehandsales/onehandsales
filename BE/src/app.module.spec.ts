import { Test } from "@nestjs/testing";

// 기능 : jose 라이브러리를 테스트용 fake 구현으로 대체합니다.
jest.mock("jose", () => {
  // 역할 : FakeSignJWT 클래스가 맡은 백엔드 책임을 구현합니다.
  class FakeSignJWT {
    // 기능 : 테스트 JWT 헤더 설정 호출을 체이닝 가능하게 처리합니다.
    setProtectedHeader(): this {
      return this;
    }

    // 기능 : 테스트 JWT subject 설정 호출을 체이닝 가능하게 처리합니다.
    setSubject(): this {
      return this;
    }

    // 기능 : 테스트 JWT issuer 설정 호출을 체이닝 가능하게 처리합니다.
    setIssuer(): this {
      return this;
    }

    // 기능 : 테스트 JWT audience 설정 호출을 체이닝 가능하게 처리합니다.
    setAudience(): this {
      return this;
    }

    // 기능 : 테스트 JWT issuedAt 설정 호출을 체이닝 가능하게 처리합니다.
    setIssuedAt(): this {
      return this;
    }

    // 기능 : 테스트 JWT expiration 설정 호출을 체이닝 가능하게 처리합니다.
    setExpirationTime(): this {
      return this;
    }

    // 기능 : 테스트용 고정 JWT 문자열을 반환합니다.
    async sign(): Promise<string> {
      return "mock-token";
    }
  }

  return {
    SignJWT: FakeSignJWT,
    // 기능 : 테스트용 JWKS factory 함수를 반환합니다.
    createRemoteJWKSet: jest.fn(() => jest.fn()),
    jwtVerify: jest.fn(),
  };
});

// 기능 : AppModule의 Nest 모듈 그래프 컴파일을 검증합니다.
describe("AppModule", () => {
  // 기능 : AppModule을 테스트 모듈로 컴파일할 수 있는지 확인합니다.
  it("compiles the Nest module graph", async () => {
    // 1. 비동기 결과를 받아 { AppModule }에 저장한다.
    const { AppModule } = await import("./app.module");
    // 2. 비동기 결과를 받아 moduleRef에 저장한다.
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // 3. 테스트 기대 조건을 검증한다.
    expect(moduleRef).toBeDefined();

    // 4. 필요한 비동기 작업을 실행한다.
    await moduleRef.close();
  });
});
