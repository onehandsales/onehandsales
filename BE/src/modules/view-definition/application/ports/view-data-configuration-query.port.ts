import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { ViewAttributeSettingRow, ViewFilterRows, ViewHeaderDefinition, ViewHeaderScope, ViewSettingsRows, ViewSortRow } from "../view-header-configuration";

export const VIEW_DATA_CONFIGURATION_QUERY = Symbol("VIEW_DATA_CONFIGURATION_QUERY");
export type ViewDataConfiguration = ViewFilterRows & Omit<ViewSettingsRows, "viewWidgetDefinitions"> & {
  view: ViewHeaderDefinition; viewSortDefinitions: ViewSortRow[];
};
// 역할 : View 소유 설정을 동일한 읽기 snapshot으로 제공합니다.
export interface ViewDataConfigurationQuery {
  // 기능 : 세 타입의 본문에 필요한 설정만 제한하여 읽습니다.
  read(scope: ViewHeaderScope, context: TransactionContext): Promise<ViewDataConfiguration | null>;
  // 기능 : 참조 표시 이름에 사용할 명시적 직접 TITLE 후보를 읽습니다.
  titles(workspaceId: string, context: TransactionContext): Promise<ViewAttributeSettingRow[]>;
}
