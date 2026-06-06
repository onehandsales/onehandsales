import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminGuard } from "./admin.guard";

describe("AdminGuard", () => {
  it("allows admin users", () => {
    const guard = new AdminGuard();

    expect(guard.canActivate(createContext("ADMIN"))).toBe(true);
  });

  it("rejects non-admin users", () => {
    const guard = new AdminGuard();

    expect(() => guard.canActivate(createContext("USER"))).toThrow(
      ForbiddenException
    );
  });
});

function createContext(role: CurrentUserContext["role"]): ExecutionContext {
  const request = {
    currentUser: {
      id: "user-1",
      sessionId: "session-1",
      email: "user@example.com",
      displayName: "User",
      role,
      status: "ACTIVE",
    } satisfies CurrentUserContext,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}

