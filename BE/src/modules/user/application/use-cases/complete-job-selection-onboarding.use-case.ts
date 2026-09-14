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

  // 기능 : 현재 사용자의 직업 선택 온보딩 완료 시각을 저장합니다.
  async execute(
    currentUser: CurrentUserContext
  ): Promise<UserJobSelectionOnboardingRecord> {
    // 1. DB 저장용 현재 시각을 준비한다.
    const now = new Date();

    // 2. 현재 사용자 ID로 직업 선택 온보딩 완료 시각을 저장한다.
    const result = await this.userRepository.completeJobSelectionOnboarding(
      currentUser.id,
      now
    );

    // 3. 사용자 존재 여부와 활성 상태를 검증한다.
    if (!result) {
      throw new InactiveUserError();
    }

    // 4. 완료 시각 응답 레코드를 반환한다.
    return result;
  }
}
