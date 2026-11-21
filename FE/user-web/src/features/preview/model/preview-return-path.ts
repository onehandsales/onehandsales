// 기능 : 정규화 후에도 내부 앱 경계에 남는 상대 URL만 인증 후 복귀에 사용한다.
export function previewReturnPath(value: string | null) {
  if (!value || !value.startsWith("/app") || value.includes("\\")) return "/app";
  try {
    const parsed = new URL(value, "https://preview.invalid");
    if (parsed.origin !== "https://preview.invalid" || !(parsed.pathname === "/app" || parsed.pathname.startsWith("/app/"))) return "/app";
    return parsed.pathname + parsed.search + parsed.hash;
  } catch { return "/app"; }
}

// 기능 : 인증·온보딩 단계 사이에서 검증된 내부 복귀 경로만 query로 전달한다.
export function authReturnQuery(search: string) {
  const returnTo = previewReturnPath(new URLSearchParams(search).get("returnTo"));
  return returnTo === "/app" ? "" : "?returnTo=" + encodeURIComponent(returnTo);
}
