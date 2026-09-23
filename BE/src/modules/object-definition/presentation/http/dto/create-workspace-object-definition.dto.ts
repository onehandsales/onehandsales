import { IsOptional, IsString } from "class-validator";

// 역할 : CreateWorkspaceObjectDefinitionDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateWorkspaceObjectDefinitionDto {
  @IsString()
  objectDefinitionName!: string;

  @IsOptional()
  @IsString()
  icon?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;
}
