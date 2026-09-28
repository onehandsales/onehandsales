import { IsOptional, IsString, MaxLength } from "class-validator";

// 역할 : ListWorkspaceObjectRecordDefinitionsQueryDto HTTP query 값을 검증하기 위한 DTO입니다.
export class ListWorkspaceObjectRecordDefinitionsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  cursor?: string;
}
