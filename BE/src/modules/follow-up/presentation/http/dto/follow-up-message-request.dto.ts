import { IsOptional, IsString } from "class-validator";

export class CreateFollowUpDraftDto {
  @IsString()
  sourceReportId!: string;

  @IsString()
  sourceSuggestionId!: string;

  @IsString()
  channel!: string;

  @IsString()
  languageTag!: string;

  @IsString()
  recipientContactId!: string;
}

export class UpdateFollowUpMessageDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  recipientContactId?: string;
}

export class ListFollowUpMessagesQueryDto {
  @IsOptional()
  @IsString()
  sourceReportId?: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  page?: string;
}
