import { Inject, Injectable } from "@nestjs/common";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import {
  USER_REPOSITORY,
  type UserJobSelectionOnboardingRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import {
  WORKSPACE_ONBOARDING,
  type WorkspaceOnboardingPort,
} from "@/modules/workspace/application/ports/workspace-onboarding.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  TRANSACTION_MANAGER,
  type TransactionContext,
  type TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";

// 역할 : CompleteJobSelectionOnboardingUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class CompleteJobSelectionOnboardingUseCase {
  // 기능 : 사용자 저장소, Workspace onboarding 포트, transaction manager를 주입받습니다.
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(WORKSPACE_ONBOARDING)
    private readonly workspaceOnboarding: WorkspaceOnboardingPort,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager
  ) {}

  // 기능 : 현재 사용자의 직업 선택 완료와 OWNER Workspace 멤버십을 보장합니다.
  async execute(
    currentUser: CurrentUserContext
  ): Promise<UserJobSelectionOnboardingRecord> {
    // 1. DB 저장용 현재 시각을 준비한다.
    const now = new Date();

    // 2. 온보딩 완료 처리와 기본 Workspace 보장을 하나의 transaction 안에서 실행한다.
    const result = await this.transactionManager.runInTransaction((context) =>
      this.completeInTransaction(currentUser.id, now, context)
    );

    // 3. 사용자가 없거나 활성 상태가 아니면 기존 인증 오류로 차단한다.
    if (!result) {
      throw new InactiveUserError();
    }

    // 4. 완료 시각만 반환한다.
    return result;
  }

  // 기능 : 직업 선택 온보딩 완료와 온보딩용 OWNER Workspace 보장을 같은 transaction 안에서 처리합니다.
  private async completeInTransaction(
    userId: string,
    now: Date,
    context: TransactionContext
  ): Promise<UserJobSelectionOnboardingRecord | null> {
    // 1. 온보딩 완료에 필요한 사용자 상태를 User 모듈에서 조회한다.
    const user = await this.userRepository.findJobSelectionOnboardingUser(
      userId,
      context
    );

    // 2. 존재하지 않거나 활성 사용자가 아니면 호출자가 인증 오류로 변환할 수 있게 null을 반환한다.
    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    // 3. Workspace 모듈에 온보딩용 OWNER Workspace 보장을 위임한다.
    await this.workspaceOnboarding.ensureOwnerWorkspaceForOnboarding({
      userId,
      displayName: user.displayName,
      now,
      transactionContext: context,
    });

    // 4. 완료 시각이 없으면 저장하고, 있으면 기존 값을 유지한다.
    const jobSelectOnboardingCompletedAt =
      user.jobSelectOnboardingCompletedAt ??
      (await this.userRepository.completeJobSelectionForUser(
        userId,
        now,
        context
      ));

    // 5. User API 응답 record 형태로 변환해 반환한다.
    return {
      jobSelectOnboardingCompletedAt,
    };
  }
}
