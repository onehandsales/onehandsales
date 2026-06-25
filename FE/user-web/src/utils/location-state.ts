// 기능 : router location state에서 안내 문구를 안전하게 읽습니다.
export function readLocationNotice(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return null;
  }

  const value = (state as Record<string, unknown>).notice;

  return typeof value === "string" ? value : null;
}

export function readLocationNoticeDescription(state: unknown) {
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return null;
  }

  const value = (state as Record<string, unknown>).noticeDescription;

  return typeof value === "string" ? value : null;
}
