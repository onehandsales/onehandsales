import { Injectable } from "@nestjs/common";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { RecordWriteService, type CreateRecordCommand } from "../record-write.service";

// 역할 : 기존 기록 생성 응답을 유지합니다.
export interface CreateWorkspaceObjectRecordDefinitionResponse { readonly recordDefinitionId: string }
// 역할 : Object 기록 생성 요청을 공통 쓰기 application에 전달합니다.
@Injectable()
export class CreateWorkspaceObjectRecordDefinitionUseCase {
  // 기능 : 생성/수정 공통 검증과 transaction 서비스를 주입받습니다.
  constructor(private readonly writes: RecordWriteService) {}
  // 기능 : 초기값 포함 생성 또는 기존 빈 기록 생성을 실행합니다.
  execute(user: CurrentUserContext, workspaceId: string, objectId: string, command: CreateRecordCommand = {}, requestId: string | null = null): Promise<CreateWorkspaceObjectRecordDefinitionResponse> {
    return this.writes.create(user, workspaceId, objectId, command, requestId);
  }
}
