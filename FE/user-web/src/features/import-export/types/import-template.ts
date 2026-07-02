import type { ApiBlobResponse } from "@/lib/api-client";

export type ImportTemplateType = "COMPANY" | "CONTACT" | "PRODUCT" | "DEAL";

export type ImportTemplateColumnType = "text" | "number" | "email" | "phone";

export type ImportTemplateColumn = {
  readonly key: string;
  readonly label: string;
  readonly required: boolean;
  readonly type: ImportTemplateColumnType;
  readonly description?: string;
  readonly options?: readonly string[];
};

export type ImportTemplateSampleRow = Readonly<
  Record<string, string | number | null>
>;

export type ImportTemplateItem = {
  readonly id: string;
  readonly templateType: ImportTemplateType;
  readonly templateVersion: string;
  readonly templateName: string;
  readonly columns: ImportTemplateColumn[];
  readonly sampleRows: ImportTemplateSampleRow[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ImportTemplateListResponse = {
  readonly items: ImportTemplateItem[];
};

export type DownloadImportTemplateInput = {
  readonly templateId: string;
  readonly companyName?: string;
};

export type DownloadImportTemplateResponse = ApiBlobResponse;
