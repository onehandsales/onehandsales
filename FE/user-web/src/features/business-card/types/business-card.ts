export type BusinessCardScanStatus =
  | "OCR_SUCCESS"
  | "OCR_FAILED"
  | "CONFIRMED";

export type BusinessCardResolution = "EXISTING" | "CREATED";

export type BusinessCardExtractedFields = {
  readonly companyName: string | null;
  readonly companyFieldName: string | null;
  readonly companyRegionName: string | null;
  readonly contactName: string | null;
  readonly contactMobile: string | null;
  readonly contactEmail: string | null;
  readonly contactDepartmentName: string | null;
  readonly contactJobGradeName: string | null;
};

export type BusinessCardScanLog = {
  readonly id: string;
  readonly status: BusinessCardScanStatus;
  readonly extracted: BusinessCardExtractedFields;
  readonly linked: {
    readonly companyId: string | null;
    readonly contactId: string | null;
    readonly companyResolution: BusinessCardResolution | null;
    readonly contactResolution: BusinessCardResolution | null;
    readonly confirmedAt: string | null;
  };
  readonly ai: {
    readonly provider: string;
    readonly model: string;
  };
  readonly usage: {
    readonly requestToken: number | null;
    readonly responseToken: number | null;
    readonly totalToken: number | null;
    readonly requestCost: number | null;
    readonly responseCost: number | null;
    readonly totalCost: number | null;
    readonly costCurrency: string;
    readonly pendingTimeMs: number | null;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type BusinessCardScanLogPage = {
  readonly items: BusinessCardScanLog[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};

export type ListBusinessCardScanLogsParams = {
  readonly page?: number;
  readonly status?: readonly BusinessCardScanStatus[];
};

export type ScanBusinessCardInput = {
  readonly imageFile: File;
};

export type ConfirmBusinessCardScanInput = {
  readonly scanLogId: string;
  readonly companyName: string;
  readonly companyFieldName?: string;
  readonly companyRegionName?: string;
  readonly contactName: string;
  readonly contactMobile: string;
  readonly contactEmail: string;
  readonly contactDepartmentName?: string;
  readonly contactJobGradeName?: string;
};

export type BusinessCardConfirmResponse = {
  readonly scanLog: BusinessCardScanLog;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
    readonly resolution: BusinessCardResolution;
  };
  readonly contact: {
    readonly id: string;
    readonly username: string;
    readonly resolution: BusinessCardResolution;
  };
};
