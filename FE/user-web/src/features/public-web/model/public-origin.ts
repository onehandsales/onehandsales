export type PublicOrigin = Readonly<{ path: string; key: string; index: number; scope: string }>;

// 기능 : 복귀 주소에 제어 문자가 포함되었는지 판별한다.
function isControlCharacter(character: string) { return character.charCodeAt(0) < 32; }

// 기능 : React Router가 관리하는 현재 브라우저 이력 위치만 읽고 임의 이력 값을 거부한다.
export function publicHistoryIndex(): number | undefined {
  const index: unknown = window.history.state?.idx;
  return typeof index === "number" && Number.isSafeInteger(index) && index >= 0 ? index : undefined;
}

// 기능 : 현재 메모리 수명에서 생성한 내부 출발 정보만 복귀 대상으로 인정한다.
export function readPublicOrigin(value: unknown, scope: string): PublicOrigin | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (!("path" in value && typeof value.path === "string" && value.path.startsWith("/") && !value.path.startsWith("//") && !value.path.includes("\\") && !Array.from(value.path).some(isControlCharacter))) return undefined;
  if (!("key" in value && typeof value.key === "string" && "index" in value && typeof value.index === "number" && Number.isSafeInteger(value.index) && value.index >= 0 && "scope" in value && value.scope === scope)) return undefined;
  return { path: value.path, key: value.key, index: value.index, scope };
}
