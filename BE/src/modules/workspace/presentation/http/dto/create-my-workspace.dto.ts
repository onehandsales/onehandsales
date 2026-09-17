import { IsString } from "class-validator";

// 역할 : CreateMyWorkspaceDto HTTP 요청 값을 검증하기 위한 DTO입니다.
export class CreateMyWorkspaceDto {
  @IsString()
  workspaceName!: string;
}
