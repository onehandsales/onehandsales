import { IsOptional, IsString } from "class-validator";

// 역할 : CreateWorkspaceObjectAttributeDefinitionDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateWorkspaceObjectAttributeDefinitionDto {
  @IsString()
  attributeDefinitionName!: string;

  @IsString()
  attributeType!: string;

  @IsOptional()
  @IsString()
  icon?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  config?: unknown | null;
}
