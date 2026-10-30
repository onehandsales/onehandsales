import type { JsonValue } from "@/shared/application/types/json-value";
import { ViewDataConfigurationError } from "./view-data.errors";

// 기능 : JSON object만 안전하게 읽고 primitive/배열은 빈 object로 구분합니다.
export function jsonObject(value: JsonValue | undefined): {
  [key: string]: JsonValue;
} {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as { [key: string]: JsonValue })
    : {};
}
// 기능 : 저장 참조 경로의 UUID와 실행 깊이를 확인합니다.
export function referencePath(value: JsonValue): string[] {
  if (
    !Array.isArray(value) ||
    value.length > 3 ||
    value.some((id) => typeof id !== "string" || !UUID.test(id))
  )
    throw new ViewDataConfigurationError();
  return (value as string[]).map((id) => id.toLowerCase());
}
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// 기능 : typed FK와 과거 JSON alias의 충돌을 확인한 뒤 식별자를 읽습니다.
export function valueId(
  typed: string | null,
  json: { [key: string]: JsonValue },
  ...keys: string[]
): string | null {
  const ids = [typed, ...keys.map((key) => json[key])]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => (typeof value === "string" ? value.toLowerCase() : value));
  if (
    ids.some((value) => typeof value !== "string" || !UUID.test(value)) ||
    new Set(ids).size > 1
  )
    throw new ViewDataConfigurationError();
  return (ids[0] as string | undefined) ?? null;
}
// 기능 : 소속별 값을 혼동하지 않도록 조회 인덱스 키를 생성합니다.
export function valueKey(
  kind: "RECORD" | "LIST_ENTRY",
  ownerId: string,
  attributeId: string,
): string {
  return `${kind}:${ownerId}:${attributeId}`;
}
