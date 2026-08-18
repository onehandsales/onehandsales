import type { NavigateFunction } from "react-router-dom";
import { ApiClientError } from "@/lib/api-client";

// 기능 : 삭제되었거나 존재하지 않는 상세 URL 접근 오류를 판별합니다.
export function isInvalidDetailPathError(
  error: unknown,
  notFoundCodes: readonly string[],
) {
  if (!(error instanceof ApiClientError)) {
    return false;
  }

  return (
    error.statusCode === 404 ||
    notFoundCodes.includes(error.code) ||
    (error.statusCode === 410 && error.isDeletedResource)
  );
}

// 기능 : 앱 내부 이동 이력이 있으면 이전 화면으로, 직접 접근이면 지정된 목록으로 이동합니다.
export function navigateFromInvalidDetailPath(
  navigate: NavigateFunction,
  fallbackPath: string,
) {
  const historyState = window.history.state as { readonly idx?: unknown } | null;

  // 브라우저 히스토리가 없는 직접 접근은 목록으로 보내 빈 뒤로가기를 방지합니다.
  if (typeof historyState?.idx === "number" && historyState.idx > 0) {
    void navigate(-1);
    return;
  }

  void navigate(fallbackPath, { replace: true });
}
