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

class FakeTokenIssuer implements AppTokenIssuer {
  async issueAccessToken() {
    return {
      accessToken: "unused",
      accessTokenExpiresAt: new Date("2026-06-06T00:15:00.000Z"),
    };
  }

  async verifyAccessToken() {
    return {
      userId: "user-1",
      sessionId: "session-1",
    };
  }
}

class FakeRepository implements AuthRepository {
  constructor(
    private readonly session: AuthSessionRecord,
    private readonly user: CurrentUserContext
  ) {}

  async findSessionByIdWithUser() {
    return {
      session: this.session,
      user: this.user,
    };
  }

  async runInTransaction<T>(
    work: (repository: AuthRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  async findOAuthAccount(): Promise<AuthOAuthAccountRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  async createUserWithOAuthAccount(): Promise<AuthUserRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async updateUserAfterLogin(): Promise<AuthUserRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async getMe(): Promise<AuthMeRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  async findActiveDeviceBySlot(): Promise<AuthDeviceRecord | null> {
    throw new Error("Not implemented in fake repository");
  }

  async createAuthDevice(): Promise<AuthDeviceRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async updateAuthDeviceSeen(): Promise<AuthDeviceRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async replaceAuthDevice(): Promise<void> {
    throw new Error("Not implemented in fake repository");
  }

  async revokeActiveSessionsByDevice(): Promise<void> {
    throw new Error("Not implemented in fake repository");
  }

  async createAuthSession(): Promise<AuthSessionRecord> {
    throw new Error("Not implemented in fake repository");
  }

  async findSessionByRefreshTokenHash(): Promise<{
    session: AuthSessionRecord;
    user: CurrentUserContext;
  } | null> {
    throw new Error("Not implemented in fake repository");
  }

  async rotateRefreshToken(): Promise<void> {
    throw new Error("Not implemented in fake repository");
  }

  async revokeSession(): Promise<void> {
    throw new Error("Not implemented in fake repository");
  }
}

describe("ResolveCurrentUserUseCase", () => {
  it("resolves an active session user", async () => {
    const useCase = createUseCase("ACTIVE", "ACTIVE", futureDate());

    await expect(useCase.resolveFromAccessToken("app-token")).resolves.toMatchObject({
      id: "user-1",
      sessionId: "session-1",
      role: "USER",
    });
  });

  it("rejects a revoked session", async () => {
    const useCase = createUseCase("REVOKED", "ACTIVE", futureDate());

    await expect(useCase.resolveFromAccessToken("app-token")).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it("rejects an inactive user", async () => {
    const useCase = createUseCase("ACTIVE", "SUSPENDED", futureDate());

    await expect(useCase.resolveFromAccessToken("app-token")).rejects.toBeInstanceOf(
      InactiveUserError
    );
  });
});

function createUseCase(
  sessionStatus: AuthSessionRecord["status"],
  userStatus: CurrentUserContext["status"],
  expiresAt: Date
): ResolveCurrentUserUseCase {
  const session: AuthSessionRecord = {
    id: "session-1",
    userId: "user-1",
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
  };

  return new ResolveCurrentUserUseCase(
    new FakeTokenIssuer(),
    new FakeRepository(session, user)
  );
}

function futureDate(): Date {
  return new Date(Date.now() + 60 * 1000);
}
