import { ApiClientError } from "@/lib/api-client";

// 기능 : is Deleted Resource Read Error 여부를 판별합니다.
export function isDeletedResourceReadError(error: unknown) {
  return (
    error instanceof ApiClientError &&
    error.statusCode === 410 &&
    error.isDeletedResource
  );
}
