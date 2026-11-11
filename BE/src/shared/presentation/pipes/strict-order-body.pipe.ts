import { BadRequestException, ValidationPipe, type PipeTransform, type Type } from "@nestjs/common";

// 역할 : 변환 전 알 수 없는 키를 거부하고 소유 모듈 DTO로 순서 요청을 검증합니다.
export class StrictOrderBodyPipe implements PipeTransform {
  private readonly validation = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  // 기능 : 소유 모듈의 DTO class를 HTTP 검증 경계에 주입합니다.
  constructor(private readonly dto: Type<object>) {}
  // 기능 : 원본 객체 키를 보존해 검사한 뒤 필드형 DTO 검증을 수행합니다.
  async transform(value: unknown): Promise<unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some(key => key !== "orderedIds")) {
      throw new BadRequestException("Body must contain only orderedIds");
    }
    return this.validation.transform(value, { type: "body", metatype: this.dto });
  }
}
