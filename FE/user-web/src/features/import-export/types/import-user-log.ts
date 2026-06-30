import type {
  ImportTemplateColumn,
  ImportTemplateType,
} from "@/features/import-export/types/import-template";

export type ImportSubmittedDataValue = string | number | boolean | null;
export type ImportSubmittedData = Readonly<
  Record<string, ImportSubmittedDataValue>
>;

export type ImportUserLogListParams = {
  readonly page?: number;
  readonly targetTypes?: readonly ImportTemplateType[];
};

export type ImportUserLogListItem = {
  readonly id: string;
  readonly targetType: ImportTemplateType;
  readonly templateVersion: string;
  readonly contextLabel: string | null;
  readonly originalFileName: string;
  readonly fileSizeBytes: number;
  readonly totalRowCount: number;
  readonly importedRowCount: number;
  readonly createdAt: string;
};

export type ImportUserLogPageResponse = {
  readonly items: ImportUserLogListItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};

export type ImportUserLogRow = {
  readonly id: string;
  readonly rowNumber: number;
  readonly submittedData: ImportSubmittedData;
  readonly targetLabel: string;
  readonly createdAt: string;
};

export type ImportUserLogDetail = ImportUserLogListItem & {
  readonly templateColumns: ImportTemplateColumn[];
  readonly context: ImportSubmittedData | null;
  readonly rows: ImportUserLogRow[];
};
