import type { CurrentUserPlatformRole } from "@/shared/application/context/current-user.context";

export const USER_QUERY = Symbol("USER_QUERY");

// 역할 : UserSnapshot이 다른 모듈에 공개되는 사용자 조회 전용 snapshot을 정의합니다.
export interface UserSnapshot {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly platformRole: CurrentUserPlatformRole;
}

// 역할 : UserQuery 포트가 User 모듈이 외부 모듈에 공개하는 조회 계약을 정의합니다.
export interface UserQuery {
  // 기능 : 사용자 ID로 저장용 사용자 snapshot을 조회합니다.
  findUserSnapshotById(userId: string): Promise<UserSnapshot | null>;
  // 기능 : 정규화된 이메일과 일치하는 삭제되지 않은 사용자가 있는지 조회합니다.
  existsActiveUserByEmail(normalizedEmail: string): Promise<boolean>;
}
