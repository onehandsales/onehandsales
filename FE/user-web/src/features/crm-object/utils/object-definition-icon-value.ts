import dynamicIconImports from "lucide-react/dynamicIconImports";

export type DynamicLucideIconName = keyof typeof dynamicIconImports;

const EMOJI_ICON_VALUE_PREFIX = "emoji:";
const LUCIDE_ICON_VALUE_PREFIX = "lucide:";

// 기능 : 선택한 이모지를 ObjectDefinition icon 컬럼에 저장할 문자열로 변환합니다.
export function createEmojiObjectIconValue(emoji: string) {
  return `${EMOJI_ICON_VALUE_PREFIX}${emoji}`;
}

// 기능 : 선택한 lucide 아이콘을 ObjectDefinition icon 컬럼에 저장할 문자열로 변환합니다.
export function createLucideObjectIconValue(iconName: DynamicLucideIconName) {
  return `${LUCIDE_ICON_VALUE_PREFIX}${iconName}`;
}

// 기능 : ObjectDefinition icon 문자열에서 이모지 값을 추출합니다.
export function getEmojiObjectIconValue(iconValue: string | null | undefined) {
  const normalizedIconValue = normalizeIconValue(iconValue);

  if (!normalizedIconValue?.startsWith(EMOJI_ICON_VALUE_PREFIX)) {
    return null;
  }

  const emoji = normalizedIconValue.slice(EMOJI_ICON_VALUE_PREFIX.length);

  return emoji.length > 0 ? emoji : null;
}

// 기능 : ObjectDefinition icon 문자열에서 lucide 아이콘 이름을 추출합니다.
export function getLucideObjectIconName(
  iconValue: string | null | undefined,
): DynamicLucideIconName | null {
  const normalizedIconValue = normalizeIconValue(iconValue);

  if (!normalizedIconValue) {
    return null;
  }

  const iconName = normalizedIconValue.startsWith(LUCIDE_ICON_VALUE_PREFIX)
    ? normalizedIconValue.slice(LUCIDE_ICON_VALUE_PREFIX.length)
    : normalizedIconValue;

  if (Object.prototype.hasOwnProperty.call(dynamicIconImports, iconName)) {
    return iconName as DynamicLucideIconName;
  }

  return null;
}

// 기능 : icon 컬럼 값 비교에 사용할 문자열을 정리합니다.
function normalizeIconValue(iconValue: string | null | undefined) {
  return typeof iconValue === "string" ? iconValue.trim() : null;
}
