import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string | null;
}
