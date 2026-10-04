import { DEFAULT_ICON_VALUE } from "@/components/ui/icon-value";
import { IconValuePicker } from "@/components/ui/icon-value-picker";
import { type AppLocale } from "@/features/app-i18n";

type ObjectDefinitionIconPickerProps = {
  readonly emojiSearchClearButtonLabel: string;
  readonly emojiSearchPlaceholder: string;
  readonly emojiTabLabel: string;
  readonly iconNoResultsLabel: string;
  readonly iconSearchPlaceholder: string;
  readonly iconTabLabel: string;
  readonly label: string;
  readonly locale: AppLocale;
  readonly onChange: (value: string) => void;
  readonly value: string;
};

export const DEFAULT_OBJECT_DEFINITION_ICON = DEFAULT_ICON_VALUE;

// 기능 : 관리 항목 생성 흐름에서 공통 아이콘 picker를 관리 항목 문맥으로 렌더링합니다.
export function ObjectDefinitionIconPicker(
  props: ObjectDefinitionIconPickerProps,
) {
  return (
    <IconValuePicker
      {...props}
      searchInputName="objectDefinitionLucideIconSearch"
    />
  );
}
