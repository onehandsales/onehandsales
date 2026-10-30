import type { TransactionContext } from "./transaction-manager.port";

export const READ_SNAPSHOT_RUNNER = Symbol("READ_SNAPSHOT_RUNNER");

// 역할 : 여러 소유 모듈의 조회를 동일한 읽기 전용 snapshot으로 묶습니다.
export interface ReadSnapshotRunner {
  // 기능 : 한 요청의 설정·값·집계가 같은 시점을 읽도록 실행합니다.
  run<T>(work: (context: TransactionContext) => Promise<T>): Promise<T>;
}
