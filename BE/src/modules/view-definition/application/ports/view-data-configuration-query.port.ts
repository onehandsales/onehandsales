import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type {
  ViewAttributeSettingRow,
  ViewFilterRows,
  ViewHeaderDefinition,
  ViewHeaderScope,
  ViewSettingsRows,
  ViewSortRow,
} from "../view-header-configuration";
export const VIEW_DATA_CONFIGURATION_QUERY = Symbol(
  "VIEW_DATA_CONFIGURATION_QUERY",
);
export type ViewDataConfiguration = ViewFilterRows &
  ViewSettingsRows & {
    view: ViewHeaderDefinition;
    viewSortDefinitions: ViewSortRow[];
  };
export type WorkDependencySnapshot = {
  id: string;
  sourceRecordDefinitionId: string | null;
  sourceListEntryDefinitionId: string | null;
  targetRecordDefinitionId: string | null;
  targetListEntryDefinitionId: string | null;
  type:
    | "FINISH_TO_START"
    | "START_TO_START"
    | "FINISH_TO_FINISH"
    | "START_TO_FINISH";
  dependencyTimeOffsetValue: string;
  dependencyTimeOffsetUnit: "MINUTE" | "HOUR" | "DAY";
};
// 역할 : View 소유 설정·업무 연결의 읽기를 동일 snapshot으로 제공합니다.
export interface ViewDataConfigurationQuery {
  // 기능 : 선택 View와 실행에 필요한 설정만 제한하여 읽습니다.
  read(
    scope: ViewHeaderScope,
    context: TransactionContext,
  ): Promise<ViewDataConfiguration | null>;
  // 기능 : 참조 표시 이름에 사용할 명시 TITLE binding을 읽습니다.
  titles(
    workspaceId: string,
    context: TransactionContext,
  ): Promise<ViewAttributeSettingRow[]>;
  // 기능 : 접근 가능한 자식 View의 직접 구성 요약을 읽습니다.
  children(
    workspaceId: string,
    ids: string[],
    context: TransactionContext,
  ): Promise<ViewHeaderDefinition[]>;
  // 기능 : 필터 결과의 원본에 닿는 업무 관계를 읽습니다.
  dependencies(
    workspaceId: string,
    recordIds: string[],
    entryIds: string[],
    context: TransactionContext,
  ): Promise<WorkDependencySnapshot[]>;
}
