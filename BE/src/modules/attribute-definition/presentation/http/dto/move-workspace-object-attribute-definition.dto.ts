import { Allow } from "class-validator";

// 역할 : MoveWorkspaceObjectAttributeDefinitionDto HTTP 위치 변경 요청 값을 검증하기 위한 DTO입니다.
export class MoveWorkspaceObjectAttributeDefinitionDto {
  @Allow()
  targetPlacementPosition?: unknown | null;
}
