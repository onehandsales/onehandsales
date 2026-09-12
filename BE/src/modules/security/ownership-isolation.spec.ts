import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";

const CURRENT_USER_A: CurrentUserContext = {
  id: "rqa004-user-a",
  sessionId: "rqa004-session-a",
  email: "rqa004-a@example.com",
  displayName: "RQA004 A",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

describe("G04 multi-account ownership isolation", () => {
  it("rejects a normal user at the admin API guard boundary", () => {
    const guard = new AdminGuard();

    expect(() => guard.canActivate(createExecutionContext(CURRENT_USER_A))).toThrow(
      ForbiddenException
    );
  });
});

// 기능 : create Execution Context 요청 또는 객체를 생성합니다.
function createExecutionContext(currentUser: CurrentUserContext): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ currentUser }),
    }),
  } as unknown as ExecutionContext;
}
