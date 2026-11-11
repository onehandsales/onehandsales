import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { OrderedItem } from "@/shared/application/ordering/ordered-items";

export const SIDEBAR_LIST_ORDER_REPOSITORY = Symbol("SIDEBAR_LIST_ORDER_REPOSITORY");
// 역할 : 서버에서 검증한 사이드바 순서 변경 소유 범위입니다.
export interface SidebarListOrderScope {
  readonly workspaceId: string;
}
// 역할 : 소유 모듈의 순서 조회·잠금·저장을 한 transaction에서 수행합니다.
export interface SidebarListOrderRepository {
  // 기능 : 같은 소유 범위의 쓰기를 직렬화합니다.
  lock(scope: SidebarListOrderScope, context: TransactionContext): Promise<void>;
  // 기능 : 현재 범위의 전체 ID/순서를 잠금 안에서 조회합니다.
  list(scope: SidebarListOrderScope, context: TransactionContext): Promise<OrderedItem[]>;
  // 기능 : 범위를 재확인하며 변경된 행의 순서와 수정자를 저장합니다.
  save(scope: SidebarListOrderScope, items: readonly OrderedItem[], actorId: string, context: TransactionContext): Promise<void>;
}
