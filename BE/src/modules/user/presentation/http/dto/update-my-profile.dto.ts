import { IsString, MaxLength, ValidateIf } from "class-validator";

export class UpdateMyProfileDto {
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(80)
  name!: string | null;
}
