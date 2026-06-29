import type {
  BusinessCardConfirmResponse,
  BusinessCardScanLog,
  BusinessCardScanLogPage,
  ConfirmBusinessCardScanInput,
  ListBusinessCardScanLogsParams,
  ScanBusinessCardInput,
} from "@/features/business-card/types/business-card";
import { apiClient } from "@/lib/api-client";

export function listBusinessCardScanLogs(params: ListBusinessCardScanLogsParams) {
  return apiClient<BusinessCardScanLogPage>(
    `/api/business-card-scans${toQueryString(params)}`
  );
}

export function scanBusinessCard(input: ScanBusinessCardInput) {
  const formData = new FormData();
  formData.append("image", input.imageFile);

  return apiClient<BusinessCardScanLog>("/api/business-card-scans", {
    method: "POST",
    body: formData,
  });
}

export function getBusinessCardScanLog(scanLogId: string) {
  return apiClient<BusinessCardScanLog>(
    `/api/business-card-scans/${scanLogId}`
  );
}

export function confirmBusinessCardScan(input: ConfirmBusinessCardScanInput) {
  const { scanLogId, ...body } = input;

  return apiClient<BusinessCardConfirmResponse>(
    `/api/business-card-scans/${scanLogId}/confirm`,
    {
      method: "POST",
      body: compactBody(body),
    }
  );
}

function toQueryString(params: ListBusinessCardScanLogsParams) {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.status) {
    params.status.forEach((status) => {
      searchParams.append("status", status);
    });
  }

  const value = searchParams.toString();
  return value ? `?${value}` : "";
}

function compactBody(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      return typeof value !== "string" || value.trim().length > 0;
    })
  );
}
