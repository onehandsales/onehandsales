import { Inject, Injectable } from "@nestjs/common";
import { WORKSPACE_ACCESS_QUERY, type WorkspaceAccessQuery } from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { APPLICATION_LOGGER, type ApplicationLogger } from "@/shared/application/ports/application-logger.port";
import { TRANSACTION_MANAGER, type TransactionManager } from "@/shared/application/ports/transaction-manager.port";
import { ViewColumnError } from "../../domain/view-column.errors";
import { VIEW_COLUMN_COMMAND_REPOSITORY, type ViewColumnCommandRepository, type ViewColumnScope } from "../ports/view-column-command.repository";

// 역할 : 현재 View의 별도 표시명 또는 원본 이름 복원 의도를 전달합니다.
export interface UpdateWorkspaceViewColumnLabelCommand {
  readonly labelOverride: string | null;
}

// 역할 : 저장한 설정의 소속과 정규화된 표시명을 반환합니다.
export interface UpdateWorkspaceViewColumnLabelResponse {
  readonly viewDefinitionId: string;
  readonly viewAttributeSettingDefinitionId: string;
  readonly labelOverride: string | null;
}

// 역할 : 원본 속성·기록값을 보존하며 선택한 View의 표시명 하나를 수정합니다.
@Injectable()
export class UpdateWorkspaceViewColumnLabelUseCase {
  // 기능 : Workspace 공개 접근 계약과 View 쓰기·트랜잭션·로그 계약을 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY) private readonly workspace: WorkspaceAccessQuery,
    @Inject(VIEW_COLUMN_COMMAND_REPOSITORY) private readonly columns: ViewColumnCommandRepository,
    @Inject(TRANSACTION_MANAGER) private readonly transactions: TransactionManager,
    @Inject(APPLICATION_LOGGER) private readonly logger: ApplicationLogger,
  ) {}

  // 기능 : 같은 설정의 재요청을 멱등 처리하고 null이면 원본 이름 사용으로 되돌립니다.
  async execute(user: CurrentUserContext, workspaceId: string, viewId: string, columnId: string,
    command: UpdateWorkspaceViewColumnLabelCommand, requestId: string | null = null): Promise<UpdateWorkspaceViewColumnLabelResponse> {
    // 1. HTTP 외 호출에서도 입력을 검증하고 서버의 멤버·Actor를 확인한다.
    const value = command.labelOverride;
    if (value !== null && (typeof value !== "string" || !value.trim())) throw new ViewColumnError("ViewColumnLabelInvalid");
    const labelOverride = value === null ? null : value.trim();
    const scope: ViewColumnScope = { workspaceId: workspaceId.toLowerCase(), viewDefinitionId: viewId.toLowerCase(), viewAttributeSettingDefinitionId: columnId.toLowerCase() };
    const member = await this.workspace.getWorkspaceMemberAccess(user.id, scope.workspaceId);
    if (!member) throw new ViewColumnError("ViewColumnNotFound");
    const actorId = member.actorId;
    if (!actorId) throw new Error("Workspace member actor is missing");

    try {
      const changed = await this.transactions.runInTransaction(async context => {
        // 2. 기존 컬럼 생성과 같은 View 잠금 순서를 사용하고 설정의 소속을 확인한다.
        const view = await this.columns.lockView(scope.workspaceId, scope.viewDefinitionId, context);
        if (!view) throw new ViewColumnError("ViewColumnNotFound");
        if (!["TABLE", "KANBAN", "LIST"].includes(view.type)) throw new ViewColumnError("ViewColumnLabelTargetUnsupported");
        const column = await this.columns.findColumnLabel(scope, context);
        if (!column) throw new ViewColumnError("ViewColumnNotFound");
        // 3. 동일 값은 감사 정보를 보존하며 실제 변경만 해당 설정 한 건에 저장한다.
        if (column.labelOverride === labelOverride) return false;
        await this.columns.updateColumnLabel(scope, labelOverride, actorId, context);
        return true;
      });
      if (changed) this.logger.log(JSON.stringify({ event: "crm.viewColumn.labelUpdated", requestId, userId: user.id, ...scope }), "UpdateWorkspaceViewColumnLabelUseCase");
      return { viewDefinitionId: scope.viewDefinitionId, viewAttributeSettingDefinitionId: scope.viewAttributeSettingDefinitionId, labelOverride };
    } catch (error) {
      if (!(error instanceof ViewColumnError)) this.logger.warn(JSON.stringify({ event: "crm.viewColumn.labelUpdateFailed", requestId, userId: user.id, ...scope }), "UpdateWorkspaceViewColumnLabelUseCase");
      throw error;
    }
  }
}
