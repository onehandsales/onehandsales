import { ApiClientError, getApiErrorMessage } from "@/lib/api-client";

// 기능 : follow-up safe error code를 사용자에게 보여줄 해요체 문구로 변환합니다.
export function getFollowUpSafeErrorMessage(input: {
  readonly safeErrorCode: string | null | undefined;
  readonly fallbackMessage?: string | null;
}): string {
  switch (input.safeErrorCode) {
    case "FollowUpEmailReconnectRequired":
      return "이메일 연결이 만료됐어요. 다시 연결한 뒤 재시도해 주세요.";
    case "FollowUpEmailScopeInsufficient":
      return "메일 발송 권한이 부족해요. 이메일 계정을 다시 연결해 주세요.";
    case "FollowUpEmailSmokeRecipientNotAllowed":
      return "Smoke 검증 수신자로 등록된 이메일에만 보낼 수 있어요.";
    case "FollowUpInvalidRecipient":
      return "수신자 이메일 주소를 확인한 뒤 다시 보내 주세요.";
    case "FollowUpProviderTemporaryFailure":
    case "FollowUpProviderRateLimited":
    case "FollowUpProviderTimeout":
      return "메일 provider 응답이 지연되고 있어요. 잠시 뒤 다시 시도해 주세요.";
    case "FollowUpProviderUnavailable":
      return "이메일 provider 설정을 확인해 주세요.";
    default:
      return (
        input.fallbackMessage ??
        "후속 연락을 보내지 못했어요. 잠시 후 다시 시도해 주세요."
      );
  }
}

// 기능 : API error와 message safe error를 follow-up 화면용 문구로 통일합니다.
export function getFollowUpApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return getFollowUpSafeErrorMessage({
      safeErrorCode: error.code,
      fallbackMessage: getApiErrorMessage(error),
    });
  }

  return getApiErrorMessage(error);
}

// 기능 : safe error code가 이메일 재연결 CTA를 노출해야 하는지 판단합니다.
export function isFollowUpEmailReconnectSafeError(
  safeErrorCode: string | null | undefined
): boolean {
  return (
    safeErrorCode === "FollowUpEmailReconnectRequired" ||
    safeErrorCode === "FollowUpEmailScopeInsufficient"
  );
}
