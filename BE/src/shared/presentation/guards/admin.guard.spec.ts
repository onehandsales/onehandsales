import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminGuard } from "./admin.guard";

// 기능 : AdminGuard의 관리자 권한 검증 동작을 테스트합니다.
describe("AdminGuard", () => {
  // 기능 : 관리자 사용자의 요청 통과를 검증합니다.
  it("allows admin users", () => {
    const guard = new AdminGuard();

    expect(guard.canActivate(createContext("ADMIN"))).toBe(true);
  });

  // 기능 : 일반 사용자의 관리자 접근 거부를 검증합니다.
  it("rejects non-admin users", () => {
    const guard = new AdminGuard();

    // 기능 : 일반 사용자 권한 검증 호출을 예외 검증 콜백으로 감쌉니다.
    expect(() => guard.canActivate(createContext("USER"))).toThrow(
      ForbiddenException
    );

    try {
      guard.canActivate(createContext("USER"));
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getResponse()).toEqual({
        code: "ADMIN_FORBIDDEN",
        message: "관리자 권한이 필요해요",
      });
    }
  });
});

// 기능 : AdminGuard 테스트용 ExecutionContext를 생성합니다.
function createContext(role: CurrentUserContext["role"]): ExecutionContext {
  const request = {
    currentUser: {
      id: "user-1",
      sessionId: "session-1",
      email: "user@example.com",
      displayName: "User",
      role,
      status: "ACTIVE",
      timeZone: "Asia/Seoul",
    } satisfies CurrentUserContext,
  };

  return {
    // 기능 : HTTP 요청 객체를 반환하는 테스트용 context adapter를 제공합니다.
    switchToHttp: () => ({
      // 기능 : 테스트 요청 객체를 반환합니다.
      getRequest: () => request,
    }),
  } as ExecutionContext;
}
