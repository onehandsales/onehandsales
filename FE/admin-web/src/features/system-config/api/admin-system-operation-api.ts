import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AdminOperationCheckRun,
  CreateAdminOperationCheckRunInput,
} from "../types/admin-system-operation";

// 기능 : Admin 운영 gate 최신 점검 API를 호출합니다.
export function getLatestAdminOperationCheckRun() {
  return adminApiClient<AdminOperationCheckRun | null>(
    "/system/operation-checks/latest"
  );
}

// 기능 : Admin 운영 gate 점검 기록 생성 API를 호출합니다.
export function createAdminOperationCheckRun(
  input: CreateAdminOperationCheckRunInput
) {
  return adminApiClient<AdminOperationCheckRun>(
    "/system/operation-checks",
    {
      method: "POST",
      body: JSON.stringify({
        environment: input.environment,
        status: input.status,
        items: input.items,
        ...(input.notes ? { notes: input.notes } : {}),
      }),
    }
  );
}
