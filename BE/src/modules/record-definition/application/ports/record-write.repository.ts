import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import type { RecordAttributeValueDefinitionValuePatch, RecordDefinitionCommandRepository } from "./record-definition-command.repository";
import type { RecordAttributeValueType } from "./record-definition-list-query.port";

export const RECORD_WRITE_REPOSITORY = Symbol("RECORD_WRITE_REPOSITORY");
// 역할 : 저장된 값과 원본 소속을 함께 다룹니다.
export interface StoredRecordValue extends RecordAttributeValueDefinitionValuePatch {
  id: string; attributeDefinitionId: string; attributeType: RecordAttributeValueType;
}
// 역할 : Record 소유 쓰기와 검증용 조회의 기술 중립 계약입니다.
export interface RecordWriteRepository extends RecordDefinitionCommandRepository {
  // 기능 : 양방향 관계와 생성 재시도를 Workspace 단위로 직렬화합니다.
  lock(workspaceId: string, context: TransactionContext): Promise<void>;
  // 기능 : 생성 ID 충돌 검사와 참조 대상 소속 확인에 필요한 최소 정보를 읽습니다.
  record(id: string, context: TransactionContext): Promise<{ id: string; workspaceId: string; objectDefinitionId: string; createdByActorId: string } | null>;
  // 기능 : 같은 Record의 현재 값들을 읽습니다.
  values(workspaceId: string, recordId: string, context: TransactionContext): Promise<StoredRecordValue[]>;
  // 기능 : 지정 행을 수정하거나 다중값 행을 추가하고 부모 audit도 갱신합니다.
  put(input: { workspaceId: string; objectDefinitionId: string; recordDefinitionId: string; attributeDefinitionId: string;
    attributeType: RecordAttributeValueType; id?: string; actorId: string; value: RecordAttributeValueDefinitionValuePatch }, context: TransactionContext): Promise<string>;
}
