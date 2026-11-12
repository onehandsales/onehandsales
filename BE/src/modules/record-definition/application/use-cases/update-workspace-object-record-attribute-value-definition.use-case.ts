import { Injectable } from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { RecordWriteService } from "../record-write.service";
import { RecordAttributeValueDefinitionValidationError } from "../../domain/record-definition.errors";

// 역할 : 누락과 명시 null을 구분하는 기존 수정 입력입니다.
export interface UpdateWorkspaceObjectRecordAttributeValueDefinitionCommand { readonly hasValue: boolean; readonly value: unknown }
// 역할 : 기존 값 수정 응답을 유지합니다.
export interface UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse { readonly recordAttributeValueDefinitionId: string }
// 역할 : 단일 기록값 수정 요청을 공통 쓰기 application에 전달합니다.
@Injectable()
export class UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase {
  // 기능 : 공통 값 검증과 관계 저장 서비스를 주입받습니다.
  constructor(private readonly writes: RecordWriteService) {}
  // 기능 : 누락 입력을 거절하고 명시 null은 값 비우기로 전달합니다.
  async execute(user: CurrentUserContext, workspaceId: string, objectId: string, recordId: string, valueId: string,
    command: UpdateWorkspaceObjectRecordAttributeValueDefinitionCommand, requestId: string | null = null): Promise<UpdateWorkspaceObjectRecordAttributeValueDefinitionResponse> {
    if (!command.hasValue || command.value === undefined) throw new RecordAttributeValueDefinitionValidationError(
      "RECORD_ATTRIBUTE_VALUE_DEFINITION_VALUE_REQUIRED", "value", "Record attribute value definition value is required");
    return this.writes.update(user, workspaceId, objectId, recordId, valueId, command.value, requestId);
  }
}
