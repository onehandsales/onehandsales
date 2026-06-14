import { DomainError } from "@/shared/domain/errors/domain-error";

// 역할 : ScheduleNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class ScheduleNotFoundError extends DomainError {
  // 기능 : 일정이 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("ScheduleNotFound", "Schedule was not found");
  }
}

// 역할 : RelatedDealNotFoundError 도메인 또는 애플리케이션 오류 상태를 표현합니다.
export class RelatedDealNotFoundError extends DomainError {
  // 기능 : 일정에 연결할 딜이 없거나 현재 사용자의 소유가 아닌 경우의 오류를 생성합니다.
  constructor() {
    super("RelatedDealNotFound", "Related deal was not found");
  }
}
