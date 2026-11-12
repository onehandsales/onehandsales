import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { ViewHeaderScope } from "../view-header-configuration";
import type { ViewDataConfiguration } from "./view-data-configuration-query.port";
import type { ViewConfigurationChanges } from "../view-configuration";

export const VIEW_CONFIGURATION_COMMAND = Symbol("VIEW_CONFIGURATION_COMMAND");
// 역할 : View 설정의 잠금과 원자적 변경을 소유하는 저장 계약입니다.
export interface ViewConfigurationCommandRepository {
  // 기능 : 기존 컬럼 쓰기와 동일한 View 행 잠금을 획득합니다.
  lock(scope: ViewHeaderScope, context: TransactionContext): Promise<boolean>;
  // 기능 : 전달한 section의 차이만 저장하고 기존 생성 감사 정보를 유지합니다.
  save(before: ViewDataConfiguration, after: ViewDataConfiguration, changes: ViewConfigurationChanges, actorId: string, context: TransactionContext): Promise<void>;
}
