import type { ViewConfigurationChanges, ViewConfigurationResponse } from "../types/view-configuration";
// 기능 : 메뉴 메타데이터를 제외하고 저장 가능한 설정만 추출합니다.
export function configurationSections(value: ViewConfigurationResponse) {
  return {
    filters: { viewFilterGroupDefinitions: value.filters.viewFilterGroupDefinitions, viewFilterConditionDefinitions: value.filters.viewFilterConditionDefinitions },
    sorts: { viewSortDefinitions: value.sorts.viewSortDefinitions },
    settings: { configJson: value.settings.configJson, viewAttributeSettingDefinitions: value.settings.viewAttributeSettingDefinitions,
      viewGroupDefinitions: value.settings.viewGroupDefinitions, viewGroupSettingDefinitions: value.settings.viewGroupSettingDefinitions },
  };
}
// 기능 : 바뀌지 않은 section을 전송하지 않아 열린 메뉴와 무관한 값을 보존합니다.
export function configurationChanges(before: ViewConfigurationResponse, after: ViewConfigurationResponse): ViewConfigurationChanges {
  const a = configurationSections(before), b = configurationSections(after);
  return Object.fromEntries((Object.keys(a) as (keyof typeof a)[]).filter(key => JSON.stringify(a[key]) !== JSON.stringify(b[key])).map(key => [key, b[key]]));
}
