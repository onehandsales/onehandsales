// 기능 : 허용된 내부 상대 경로만 가상 로그인 후 복귀 목적지로 사용한다.
export function previewReturnPath(value: string | null) {
  return value === "/app" || value?.startsWith("/app/") ? value : "/app";
}
