import { IsBoolean, IsIn, IsObject } from "class-validator";
import {
  importTargetTypes,
  type ImportTargetType,
} from "@/modules/import-export/application/import-target-fields";

export class CreateImportJobDto {
  @IsIn(importTargetTypes)
  targetType!: ImportTargetType;
}

export class UpdateImportMappingDto {
  @IsObject()
  mapping!: Record<string, string | null>;
}

export class ConfirmImportJobDto {
  @IsBoolean()
  confirm!: boolean;
}
