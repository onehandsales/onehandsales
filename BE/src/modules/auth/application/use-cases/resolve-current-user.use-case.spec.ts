import {
  type AuthDeviceRecord,
  type AuthMeRecord,
  type AuthOAuthAccountRecord,
  type AuthRepository,
  type AuthSessionRecord,
  type AuthUserRecord,
} from "@/modules/auth/application/ports/auth.repository";
import type { AppTokenIssuer } from "@/modules/auth/application/ports/app-token.port";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { UnauthorizedError } from "@/shared/domain/errors/common.errors";
import { ResolveCurrentUserUseCase } from "./resolve-current-user.use-case";

// 역할 : FakeTokenIssuer 클래스가 맡은 백엔드 책임을 구현합니다.
class FakeTokenIssuer implements AppTokenIssuer {
  // 기능 : 테스트에서 사용하지 않는 access token 발급 결과를 반환합니다.
  async issueAccessToken() {
    return {
      accessToken: "unused",
      accessTokenExpiresAt: new Date("2026-06-06T00:15:00.000Z"),
    };
  }

  // 기능 : 테스트용 고정 app token payload를 반환합니다.
  async verifyAccessToken() {
    return {
      userId: "user-1",
      sessionId: "session-1",
    };
  }
}

// 역할 : FakeRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
class FakeRepository implements AuthRepository {
  // 기능 : 테스트에 사용할 세션과 사용자 컨텍스트를 주입받습니다.
  constructor(
    private readonly session: AuthSessionRecord,
    private readonly user: CurrentUserContext
  ) {}

  // 기능 : 테스트용 세션과 사용자 컨텍스트를 반환합니다.
  async findSessionByIdWithUser() {
    return {
      session: this.session,
      user: this.user,
    };
  }

  // 기능 : 테스트 트랜잭션 작업을 현재 fake 저장소로 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: AuthRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  // 기능 : 현재 테스트에서 사용하지 않는 OAuth 계정 조회 호출을 차단합니다.
  async findOAuthAccount(): Promise<AuthOAuthAccountRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 OAuth 계정 식별자 갱신 호출을 차단합니다.
  async updateOAuthAccountProviderUserId(): Promise<AuthOAuthAccountRecord> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 사용자 생성 호출을 차단합니다.
  async createUserWithOAuthAccount(): Promise<AuthUserRecord> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 로그인 갱신 호출을 차단합니다.
  async updateUserAfterLogin(): Promise<AuthUserRecord> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 내 정보 조회 호출을 차단합니다.
  async getMe(): Promise<AuthMeRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 활성 기기 조회 호출을 차단합니다.
  async findActiveDeviceBySlot(): Promise<AuthDeviceRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 기기 생성 호출을 차단합니다.
  async createAuthDevice(): Promise<AuthDeviceRecord> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 기기 사용 시각 갱신 호출을 차단합니다.
  async updateAuthDeviceSeen(): Promise<AuthDeviceRecord> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 기기 교체 호출을 차단합니다.
  async replaceAuthDevice(): Promise<void> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 기기 세션 폐기 호출을 차단합니다.
  async revokeActiveSessionsByDevice(): Promise<void> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 세션 생성 호출을 차단합니다.
  async createAuthSession(): Promise<AuthSessionRecord> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 기기 활성 세션 조회 호출을 차단합니다.
  async findActiveSessionByDevice(): Promise<AuthSessionRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 refresh token 세션 조회 호출을 차단합니다.
  async findSessionByRefreshTokenHash(): Promise<{
    session: AuthSessionRecord;
    user: CurrentUserContext;
  } | null> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 refresh token 회전 호출을 차단합니다.
  async rotateRefreshToken(): Promise<void> {
    throw new Error("Not implemented in fake repository");
  }

  // 기능 : 현재 테스트에서 사용하지 않는 세션 폐기 호출을 차단합니다.
  async revokeSession(): Promise<void> {
    throw new Error("Not implemented in fake repository");
  }
}

// 기능 : ResolveCurrentUserUseCase의 세션 검증 시나리오를 테스트합니다.
describe("ResolveCurrentUserUseCase", () => {
  // 기능 : 활성 세션의 현재 사용자 해석 성공을 검증합니다.
  it("resolves an active session user", async () => {
    const useCase = createUseCase("ACTIVE", "ACTIVE", futureDate());

    await expect(useCase.resolveFromAccessToken("app-token")).resolves.toMatchObject({
      id: "user-1",
      sessionId: "session-1",
      role: "USER",
    });
  });

  // 기능 : 폐기된 세션의 인증 실패를 검증합니다.
  it("rejects a revoked session", async () => {
    const useCase = createUseCase("REVOKED", "ACTIVE", futureDate());

    await expect(useCase.resolveFromAccessToken("app-token")).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  // 기능 : 비활성 사용자의 인증 실패를 검증합니다.
  it("rejects an inactive user", async () => {
    const useCase = createUseCase("ACTIVE", "SUSPENDED", futureDate());

    await expect(useCase.resolveFromAccessToken("app-token")).rejects.toBeInstanceOf(
      InactiveUserError
    );
  });
});

// 기능 : ResolveCurrentUserUseCase 테스트 인스턴스를 생성합니다.
function createUseCase(
  sessionStatus: AuthSessionRecord["status"],
  userStatus: CurrentUserContext["status"],
  expiresAt: Date
): ResolveCurrentUserUseCase {
  const session: AuthSessionRecord = {
    id: "session-1",
    userId: "user-1",
    authDeviceId: "device-1",
    status: sessionStatus,
    refreshTokenHash: "hash",
    expiresAt,
    revokedAt: sessionStatus === "REVOKED" ? new Date() : null,
  };
  const user: CurrentUserContext = {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "User",
    role: "USER",
    status: userStatus,
    timeZone: "Asia/Seoul",
  };

  return new ResolveCurrentUserUseCase(
    new FakeTokenIssuer(),
    new FakeRepository(session, user)
  );
}

// 기능 : 현재 시점보다 미래인 테스트 만료 시각을 생성합니다.
function futureDate(): Date {
  return new Date(Date.now() + 60 * 1000);
}
