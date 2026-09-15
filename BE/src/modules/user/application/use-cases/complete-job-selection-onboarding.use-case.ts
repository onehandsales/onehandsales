import { Inject, Injectable } from "@nestjs/common";
import {
  USER_REPOSITORY,
  type UserJobSelectionOnboardingRecord,
  type UserRepository,
} from "@/modules/user/application/ports/user.repository";
import { InactiveUserError } from "@/modules/auth/domain/auth.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";

// 역할 : CompleteJobSelectionOnboardingUseCase 유스케이스의 application orchestration을 담당합니다.
@Injectable()
export class CompleteJobSelectionOnboardingUseCase {
  // 기능 : 사용자 저장소를 주입받습니다.
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  // 기능 : 현재 사용자의 직업 선택 완료와 OWNER 워크스페이스 멤버십을 보장합니다.
  async execute(
    currentUser: CurrentUserContext
  ): Promise<UserJobSelectionOnboardingRecord> {
    // 1. DB 저장용 현재 시각을 준비한다.
    const now = new Date();

    // 2. 온보딩 완료 처리와 기본 Workspace 생성을 하나의 transaction 안에서 실행한다.
    const result = await this.userRepository.runInTransaction((repository) =>
      repository.completeJobSelectionOnboarding(currentUser.id, now)
    );

    // 3. 사용자가 없거나 활성 상태가 아니면 기존 인증 오류로 차단한다.
    if (!result) {
      throw new InactiveUserError();
    }

    // 4. 완료 시각과 OWNER 워크스페이스 정보를 반환한다.
    return result;
  }
}
