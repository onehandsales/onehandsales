import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { ObjectRecordTitle } from "./object-record-title-query.port";

export const OBJECT_RECORD_TITLE_REPOSITORY = Symbol("OBJECT_RECORD_TITLE_REPOSITORY");

// 역할 : Object 소유 데이터에 저장된 대표 이름 포인터만 읽습니다.
export interface ObjectRecordTitleRepository {
  // 기능 : 속성 모듈 검증 전의 명시적 포인터를 조회합니다.
  titles(workspaceId: string, context: TransactionContext): Promise<ObjectRecordTitle[]>;
}
