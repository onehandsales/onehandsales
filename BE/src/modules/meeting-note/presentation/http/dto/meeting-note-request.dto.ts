import { Transform, Type, type TransformFnParams } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  Matches,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import {
  MeetingNoteSort,
  MeetingNoteSourceTypeValue,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";

// 기능 : 반복 query string과 단일 query string 값을 배열로 정규화합니다.
function toOptionalArray({ value }: TransformFnParams): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return Array.isArray(value) ? value : [value];
}

// 역할 : ListMeetingNotesQueryDto 회의록 목록 query 요청 값을 검증합니다.
export class ListMeetingNotesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsUUID(undefined, { each: true })
  companyIds?: string[];

  @IsOptional()
  @Transform(toOptionalArray)
  @IsArray()
  @IsUUID(undefined, { each: true })
  contactIds?: string[];

  @IsOptional()
  @IsEnum(MeetingNoteSort)
  sort?: MeetingNoteSort;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  meetingDate?: string;
}

// 역할 : MeetingNoteCompanyInputDto 회의록 회사 입력 값을 검증합니다.
export class MeetingNoteCompanyInputDto {
  @IsOptional()
  @IsUUID()
  companyId?: string | null;

  @IsOptional()
  @IsString()
  companyName?: string | null;

  @IsOptional()
  @IsString()
  companyField?: string | null;

  @IsOptional()
  @IsString()
  companyRegion?: string | null;
}

// 역할 : MeetingNoteContactInputDto 회의록 연락처 입력 값을 검증합니다.
export class MeetingNoteContactInputDto {
  @IsOptional()
  @IsUUID()
  contactId?: string | null;

  @IsOptional()
  @IsUUID()
  companyId?: string | null;

  @IsOptional()
  @IsString()
  contactUsername?: string | null;

  @IsOptional()
  @IsString()
  contactEmail?: string | null;

  @IsOptional()
  @IsString()
  contactMobile?: string | null;

  @IsOptional()
  @IsString()
  companyName?: string | null;

  @IsOptional()
  @IsString()
  department?: string | null;

  @IsOptional()
  @IsString()
  jobGrade?: string | null;
}

// 역할 : MeetingNoteProductInputDto 회의록 제품 입력 값을 검증합니다.
export class MeetingNoteProductInputDto {
  @IsOptional()
  @IsUUID()
  productId?: string | null;

  @IsOptional()
  @IsString()
  productName?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  productPrice?: number | null;

  @IsOptional()
  @IsString()
  productCategory?: string | null;

  @IsOptional()
  @IsString()
  productStatus?: string | null;
}

// 역할 : MeetingNoteDealInputDto 회의록 딜 입력 값을 검증합니다.
export class MeetingNoteDealInputDto {
  @IsUUID()
  dealId!: string;
}

// 역할 : CreateMeetingNoteDto 회의록 생성 request body 값을 검증합니다.
export class CreateMeetingNoteDto {
  @IsOptional()
  @IsEnum(MeetingNoteSourceTypeValue)
  sourceType?: MeetingNoteSourceTypeValue;

  @IsOptional()
  @IsString()
  meetingLocalDateTime?: string | null;

  @IsString()
  details!: string;

  @IsOptional()
  @IsString()
  nextPlan?: string | null;

  @IsOptional()
  @IsString()
  requiredAction?: string | null;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MeetingNoteCompanyInputDto)
  companies!: MeetingNoteCompanyInputDto[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MeetingNoteContactInputDto)
  contacts!: MeetingNoteContactInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingNoteProductInputDto)
  products?: MeetingNoteProductInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingNoteDealInputDto)
  deals?: MeetingNoteDealInputDto[];
}

// 역할 : UpdateMeetingNoteDto 회의록 수정 request body 값을 검증합니다.
export class UpdateMeetingNoteDto {
  @IsOptional()
  @IsEnum(MeetingNoteSourceTypeValue)
  sourceType?: MeetingNoteSourceTypeValue;

  @IsOptional()
  @IsString()
  meetingLocalDateTime?: string | null;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  nextPlan?: string | null;

  @IsOptional()
  @IsString()
  requiredAction?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingNoteCompanyInputDto)
  companies?: MeetingNoteCompanyInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingNoteContactInputDto)
  contacts?: MeetingNoteContactInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingNoteProductInputDto)
  products?: MeetingNoteProductInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeetingNoteDealInputDto)
  deals?: MeetingNoteDealInputDto[];
}
