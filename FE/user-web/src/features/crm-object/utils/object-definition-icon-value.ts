import {
  createEmojiIconValue,
  createLucideIconValue as createCommonLucideIconValue,
  getEmojiIconValue,
  getLucideIconName,
  type DynamicLucideIconName,
} from "@/components/ui/icon-value";

export { createLucideIconValue } from "@/components/ui/icon-value";
export type { DynamicLucideIconName } from "@/components/ui/icon-value";

// 기능 : 선택한 이모지를 ObjectDefinition icon 컬럼에 저장할 문자열로 변환합니다.
export function createEmojiObjectIconValue(emoji: string) {
  return createEmojiIconValue(emoji);
}

// 기능 : 기존 ObjectDefinition icon picker 호출부를 위한 lucide icon 저장 문자열 별칭입니다.
export function createLucideObjectIconValue(iconName: DynamicLucideIconName) {
  return createCommonLucideIconValue(iconName);
}

// 기능 : ObjectDefinition icon 문자열에서 이모지 값을 추출합니다.
export function getEmojiObjectIconValue(iconValue: string | null | undefined) {
  return getEmojiIconValue(iconValue);
}

// 기능 : ObjectDefinition icon 문자열에서 lucide 아이콘 이름을 추출합니다.
export function getLucideObjectIconName(
  iconValue: string | null | undefined,
): DynamicLucideIconName | null {
  return getLucideIconName(iconValue);
}
