import { BadRequestException, type PipeTransform } from "@nestjs/common";
import { EmptyViewFavoriteRequestDto } from "../dto/empty-view-favorite-request.dto";

// 역할 : 빈 DTO의 기본 검증이 통과시키는 빈 배열도 요청 계약에서 제외합니다.
export class EmptyViewFavoriteRequestPipe
  implements PipeTransform<unknown, EmptyViewFavoriteRequestDto> {
  // 기능 : 생략 또는 빈 객체만 허용해 즐겨찾기 요청의 무입력 계약을 지킵니다.
  transform(value: unknown): EmptyViewFavoriteRequestDto {
    // 1. 배열·원시 값·추가 필드가 있는 객체는 유스케이스 호출 전에 차단한다.
    if (value !== undefined && (
      value === null || typeof value !== "object" ||
      Array.isArray(value) || Object.keys(value).length > 0
    )) {
      throw new BadRequestException("Request must be an empty object");
    }
    return new EmptyViewFavoriteRequestDto();
  }
}
