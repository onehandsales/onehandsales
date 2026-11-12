import { IsString, Matches, ValidateIf } from "class-validator";

// 역할 : 표시명은 필수이며 명시적 null만 원본 이름 복원으로 허용합니다.
export class UpdateWorkspaceViewColumnLabelDto {
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsString()
  @Matches(/\S/)
  labelOverride!: string | null;
}
