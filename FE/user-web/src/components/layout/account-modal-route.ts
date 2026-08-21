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
  const currentSearchParams =
    typeof currentSearch === "string"
      ? new URLSearchParams(currentSearch)
      : currentSearch;
  const nextSearchParams = createAccountModalSearchParams(
    currentSearchParams,
    ACCOUNT_MODAL_SETTINGS_QUERY_VALUE
  );
  const nextSearch = nextSearchParams.toString();

  return nextSearch ? `${pathname}?${nextSearch}` : pathname;
}
