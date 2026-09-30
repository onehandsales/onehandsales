import { Inject, Injectable } from "@nestjs/common";
import {
  OBJECT_DEFINITION_ACCESS_QUERY,
  type ObjectDefinitionAccessQuery,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import {
  RECORD_DEFINITION_COMMAND_REPOSITORY,
  type RecordDefinitionCommandRepository,
} from "@/modules/record-definition/application/ports/record-definition-command.repository";
import {
  RecordDefinitionObjectDefinitionNotFoundError,
  RecordDefinitionWorkspaceNotFoundError,
} from "@/modules/record-definition/domain/record-definition.errors";
import {
  type WorkspaceAccessQuery,
  WORKSPACE_ACCESS_QUERY,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  APPLICATION_LOGGER,
  type ApplicationLogger,
} from "@/shared/application/ports/application-logger.port";
import {
  TRANSACTION_MANAGER,
  type TransactionContext,
  type TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";

// 역할 : CreateWorkspaceObjectRecordDefinitionResponse가 RecordDefinition 생성 응답 값을 정의합니다.
export interface CreateWorkspaceObjectRecordDefinitionResponse {
  readonly recordDefinitionId: string;
}

// 역할 : CreateWorkspaceObjectRecordDefinitionUseCase가 현재 ObjectDefinition의 빈 RecordDefinition과 cell value row 생성을 담당합니다.
@Injectable()
export class CreateWorkspaceObjectRecordDefinitionUseCase {
  // 기능 : Workspace 접근 포트, ObjectDefinition 접근 포트, RecordDefinition 쓰기 저장소, transaction manager, logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY)
    private readonly objectDefinitionAccessQuery: ObjectDefinitionAccessQuery,
    @Inject(RECORD_DEFINITION_COMMAND_REPOSITORY)
    private readonly recordDefinitionCommandRepository: RecordDefinitionCommandRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    @Inject(APPLICATION_LOGGER)
    private readonly logger: ApplicationLogger
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition에 빈 RecordDefinition과 null cell value row를 생성합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string
  ): Promise<CreateWorkspaceObjectRecordDefinitionResponse> {
    // 1. 현재 사용자가 요청 Workspace의 멤버인지 확인하고 감사 주체 Actor를 조회한다.
    const workspaceAccess =
      await this.workspaceAccessQuery.getWorkspaceMemberAccess(
        currentUser.id,
        workspaceId
      );

    if (!workspaceAccess) {
      throw new RecordDefinitionWorkspaceNotFoundError();
    }

    if (!workspaceAccess.actorId) {
      throw new Error("Workspace member actor is missing");
    }

    const createdByActorId = workspaceAccess.actorId;

    // 2. 요청 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
    const hasObjectDefinition =
      await this.objectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({
        workspaceId,
        objectDefinitionId,
      });

    if (!hasObjectDefinition) {
      throw new RecordDefinitionObjectDefinitionNotFoundError();
    }

    // 3. 빈 RecordDefinition과 현재 AttributeDefinition 기준 null cell value row를 생성하고 생성된 ID를 반환한다.
    const created = await this.transactionManager.runInTransaction((context) =>
      this.createRecordDefinitionInTransaction({
        workspaceId,
        objectDefinitionId,
        createdByActorId,
        transactionContext: context,
      })
    );

    // 4. 생성 이벤트를 사용자 입력 원문 없이 구조화 로그로 남긴다.
    this.logCreatedEvent({
      userId: currentUser.id,
      workspaceId,
      objectDefinitionId,
      recordDefinitionId: created.id,
    });

    return {
      recordDefinitionId: created.id,
    };
  }

  // 기능 : RecordDefinition과 하위 cell value row 생성을 같은 transaction context로 저장합니다.
  private createRecordDefinitionInTransaction(input: {
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly createdByActorId: string;
    readonly transactionContext: TransactionContext;
  }) {
    // 1. 저장소에 transaction context를 전달해 row와 null cell value들을 원자적으로 생성한다.
    return this.recordDefinitionCommandRepository.createRecordDefinition(input);
  }

  // 기능 : RecordDefinition 생성 이벤트를 사용자 입력 원문 없이 구조화 로그로 남깁니다.
  private logCreatedEvent(fields: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly recordDefinitionId: string;
  }): void {
    this.logger.log(
      JSON.stringify({
        event: "crm.recordDefinition.created",
        ...fields,
      }),
      "CreateWorkspaceObjectRecordDefinitionUseCase"
    );
  }
}
