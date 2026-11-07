import { BadRequestException, type PipeTransform, ValidationPipe } from "@nestjs/common";
import { CreateWorkspaceListDefinitionDto } from "../dto/create-workspace-list-definition.dto";

// 역할 : DTO 변환이 버리는 예약 키까지 검사한 뒤 기존 목록 생성 DTO 검증을 수행합니다.
export class CreateWorkspaceListDefinitionBodyPipe implements PipeTransform<unknown, Promise<CreateWorkspaceListDefinitionDto>> {
  private readonly validation = new ValidationPipe({
    transform: true, whitelist: true, forbidNonWhitelisted: true,
  });

  // 기능 : 원본 입력의 예약 키를 검사하고 class-validator로 형식·중첩 DTO를 검증합니다.
  async transform(value: unknown): Promise<CreateWorkspaceListDefinitionDto> {
    // 1. 이 API의 객체 위치만 확인해 변환 과정에서 삭제될 키를 먼저 거부한다.
    this.rejectReservedKeys(value);
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const kanban: unknown = (value as Record<string, unknown>)["kanban"];
      this.rejectReservedKeys(kanban);
      if (kanban !== null && typeof kanban === "object" && !Array.isArray(kanban)) {
        this.rejectReservedKeys((kanban as Record<string, unknown>)["newStatus"]);
      }
    }
    // 2. 전역과 같은 whitelist·변환 정책으로 실제 필드형 DTO 검증을 유지한다.
    return this.validation.transform(value, { type: "body", metatype: CreateWorkspaceListDefinitionDto });
  }

  // 기능 : JSON 객체의 예약 키를 입력 원문 없이 안전한 400 오류로 거부합니다.
  private rejectReservedKeys(value: unknown): void {
    if (value !== null && typeof value === "object" &&
      (Object.hasOwn(value, "constructor") || Object.hasOwn(value, "__proto__"))) {
      throw new BadRequestException("Request contains an undeclared field");
    }
  }
}
