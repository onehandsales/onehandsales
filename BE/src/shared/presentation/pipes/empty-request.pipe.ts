import { BadRequestException, type PipeTransform } from "@nestjs/common";

// 역할 : 추가 입력이 없는 API의 Query·Body를 공통 검증합니다.
export class EmptyRequestPipe implements PipeTransform<unknown, void> {
  // 기능 : 미전송 또는 빈 객체만 허용하고 입력 키의 이름과 관계없이 추가 필드를 거부합니다.
  transform(value: unknown): void {
    // 1. Controller는 unknown으로 받아 전역 DTO 변환이 검사 전에 원본 키를 제거하지 않게 한다.
    if (value !== undefined && (
      value === null || typeof value !== "object" ||
      Array.isArray(value) || Object.keys(value).length > 0
    )) {
      throw new BadRequestException("Request must be an empty object");
    }
  }
}
