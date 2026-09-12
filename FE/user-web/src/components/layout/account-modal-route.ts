export const ACCOUNT_MODAL_QUERY_KEY = "account";
export const ACCOUNT_MODAL_SETTINGS_QUERY_VALUE = "settings";

export type AccountModalQuerySection = typeof ACCOUNT_MODAL_SETTINGS_QUERY_VALUE;

// 기능 : URL query에서 열어야 하는 계정 모달 섹션을 해석합니다.
export function getAccountModalSectionFromSearchParams(
  searchParams: URLSearchParams
): AccountModalQuerySection | null {
  return searchParams.get(ACCOUNT_MODAL_QUERY_KEY) ===
    ACCOUNT_MODAL_SETTINGS_QUERY_VALUE
    ? ACCOUNT_MODAL_SETTINGS_QUERY_VALUE
    : null;
}

// 기능 : 계정 Settings 모달 URL query를 추가하거나 제거한 search params를 만듭니다.
export function createAccountModalSearchParams(
  currentSearchParams: URLSearchParams,
  section: AccountModalQuerySection | null
): URLSearchParams {
  const nextSearchParams = new URLSearchParams(currentSearchParams);

  if (section) {
    nextSearchParams.set(ACCOUNT_MODAL_QUERY_KEY, section);
  } else {
    nextSearchParams.delete(ACCOUNT_MODAL_QUERY_KEY);
  }

  return nextSearchParams;
}

// 기능 : 지정한 app path 위에 Settings 계정 모달 query를 얹은 URL을 만듭니다.
export function createAccountSettingsModalPath(
  pathname: string,
  currentSearch: string | URLSearchParams = ""
): string {
  // 1. 이후 단계에서 사용할 currentSearchParams 값을 준비한다.
  const currentSearchParams =
    typeof currentSearch === "string"
      ? new URLSearchParams(currentSearch)
      : currentSearch;
  // 2. 이후 단계에서 사용할 nextSearchParams 값을 준비한다.
  const nextSearchParams = createAccountModalSearchParams(
    currentSearchParams,
    ACCOUNT_MODAL_SETTINGS_QUERY_VALUE
  );
  // 3. 이후 단계에서 사용할 nextSearch 값을 준비한다.
  const nextSearch = nextSearchParams.toString();

  // 4. 계산된 결과를 호출자에게 반환한다.
  return nextSearch ? `${pathname}?${nextSearch}` : pathname;
}
