import { Inject, Injectable } from "@nestjs/common";
import {
  ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY,
  type AttributeDefinitionCommandRepository,
} from "@/modules/attribute-definition/application/ports/attribute-definition-command.repository";
import {
  AttributeDefinitionNotFoundError,
  AttributeDefinitionObjectDefinitionNotFoundError,
  AttributeDefinitionValidationError,
  AttributeDefinitionWorkspaceNotFoundError,
} from "@/modules/attribute-definition/domain/attribute-definition.errors";
import {
  OBJECT_DEFINITION_ACCESS_QUERY,
  type ObjectDefinitionAccessQuery,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
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

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TARGET_PLACEMENT_POSITION_ALLOWED_KEYS = new Set([
  "referenceAttributeDefinitionId",
  "side",
]);

// 역할 : MoveWorkspaceObjectAttributeDefinitionTargetPlacementSide가 기준 속성 대비 이동 방향을 정의합니다.
export type MoveWorkspaceObjectAttributeDefinitionTargetPlacementSide =
  | "before"
  | "after";

// 역할 : MoveWorkspaceObjectAttributeDefinitionCommand가 속성 위치 변경 요청 값을 정의합니다.
export interface MoveWorkspaceObjectAttributeDefinitionCommand {
  // 기능 : 기준 AttributeDefinition과 앞/뒤 방향으로 목표 위치를 지정합니다.
  readonly targetPlacementPosition?: unknown | null;
}

// 역할 : MoveWorkspaceObjectAttributeDefinitionResponse가 속성 위치 변경 응답 값을 정의합니다.
export interface MoveWorkspaceObjectAttributeDefinitionResponse {
  // 기능 : 위치를 변경한 AttributeDefinition 식별자만 응답합니다.
  readonly attributeDefinitionId: string;
}

// 역할 : NormalizedMoveAttributeDefinitionTargetPlacementPosition이 검증된 위치 변경 입력을 정의합니다.
interface NormalizedMoveAttributeDefinitionTargetPlacementPosition {
  readonly referenceAttributeDefinitionId: string;
  readonly side: MoveWorkspaceObjectAttributeDefinitionTargetPlacementSide;
}

// 역할 : MovedAttributeDefinitionResult가 위치 변경 처리 결과와 관측 값을 정의합니다.
interface MovedAttributeDefinitionResult {
  readonly id: string;
  readonly fromSortOrder: number;
  readonly toSortOrder: number;
  readonly shiftedAttributeDefinitionCount: number;
  readonly isNoop: boolean;
}

// 역할 : AttributeDefinitionMovedLogFields가 AttributeDefinition 위치 변경 이벤트 로그 필드를 정의합니다.
interface AttributeDefinitionMovedLogFields {
  readonly userId: string;
  readonly workspaceId: string;
  readonly objectDefinitionId: string;
  readonly attributeDefinitionId: string;
  readonly referenceAttributeDefinitionId: string;
  readonly side: MoveWorkspaceObjectAttributeDefinitionTargetPlacementSide;
  readonly actorId: string;
  readonly fromSortOrder: number;
  readonly toSortOrder: number;
  readonly shiftedAttributeDefinitionCount: number;
  readonly isNoop: boolean;
}

// 역할 : MoveWorkspaceObjectAttributeDefinitionUseCase가 현재 ObjectDefinition의 AttributeDefinition 위치 변경을 담당합니다.
@Injectable()
export class MoveWorkspaceObjectAttributeDefinitionUseCase {
  // 기능 : Workspace/ObjectDefinition 접근 포트, AttributeDefinition 저장소, transaction manager, logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY)
    private readonly objectDefinitionAccessQuery: ObjectDefinitionAccessQuery,
    @Inject(ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY)
    private readonly attributeDefinitionCommandRepository: AttributeDefinitionCommandRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    @Inject(APPLICATION_LOGGER)
    private readonly logger: ApplicationLogger
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition의 AttributeDefinition 위치를 변경합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string,
    attributeDefinitionId: string,
    command: MoveWorkspaceObjectAttributeDefinitionCommand
  ): Promise<MoveWorkspaceObjectAttributeDefinitionResponse> {
    // 1. targetPlacementPosition 요청 구조를 DB 조회 전에 검증하고 정규화한다.
    const targetPlacementPosition = this.normalizeTargetPlacementPosition(
      command.targetPlacementPosition
    );

    // 2. 자기 자신을 기준으로 위치를 변경하는 요청은 정렬 계산 전에 차단한다.
    if (
      attributeDefinitionId ===
      targetPlacementPosition.referenceAttributeDefinitionId
    ) {
      throw this.createInvalidTargetPlacementPositionError();
    }

    // 3. 현재 사용자가 요청 Workspace의 멤버인지 확인하고 수정 감사 주체 Actor를 조회한다.
    const workspaceAccess =
      await this.workspaceAccessQuery.getWorkspaceMemberAccess(
        currentUser.id,
        workspaceId
      );

    if (!workspaceAccess) {
      throw new AttributeDefinitionWorkspaceNotFoundError();
    }

    if (!workspaceAccess.actorId) {
      throw new Error("Workspace member actor is missing");
    }

    const updatedByActorId = workspaceAccess.actorId;

    // 4. 요청 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
    const hasObjectDefinition =
      await this.objectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({
        workspaceId,
        objectDefinitionId,
      });

    if (!hasObjectDefinition) {
      throw new AttributeDefinitionObjectDefinitionNotFoundError();
    }

    // 5. sortOrder 조회와 bounded range 이동을 하나의 transaction 안에서 처리한다.
    const moved = await this.transactionManager.runInTransaction((context) =>
      this.moveAttributeDefinitionInTransaction({
        workspaceId,
        objectDefinitionId,
        attributeDefinitionId,
        targetPlacementPosition,
        updatedByActorId,
        transactionContext: context,
      })
    );

    // 6. 사용자 입력 원문 없이 위치 변경 이벤트만 구조화 로그로 남긴다.
    this.logMovedEvent({
      userId: currentUser.id,
      workspaceId,
      objectDefinitionId,
      attributeDefinitionId: moved.id,
      referenceAttributeDefinitionId:
        targetPlacementPosition.referenceAttributeDefinitionId,
      side: targetPlacementPosition.side,
      actorId: updatedByActorId,
      fromSortOrder: moved.fromSortOrder,
      toSortOrder: moved.toSortOrder,
      shiftedAttributeDefinitionCount: moved.shiftedAttributeDefinitionCount,
      isNoop: moved.isNoop,
    });

    return {
      attributeDefinitionId: moved.id,
    };
  }

  // 기능 : AttributeDefinition 위치 변경 입력값을 지원하는 이동 위치 계약으로 검증하고 정규화합니다.
  private normalizeTargetPlacementPosition(
    targetPlacementPosition: unknown | undefined
  ): NormalizedMoveAttributeDefinitionTargetPlacementPosition {
    // 1. application 계층 호출자가 DTO를 우회하더라도 객체 형태가 아니면 차단한다.
    if (
      typeof targetPlacementPosition !== "object" ||
      targetPlacementPosition === null ||
      Array.isArray(targetPlacementPosition)
    ) {
      throw this.createInvalidTargetPlacementPositionError();
    }

    const targetPlacementPositionRecord = targetPlacementPosition as Record<
      string,
      unknown
    >;

    // 2. 이동 위치 객체는 계약에 포함된 key만 허용한다.
    if (
      Object.keys(targetPlacementPositionRecord).some(
        (key) => !TARGET_PLACEMENT_POSITION_ALLOWED_KEYS.has(key)
      )
    ) {
      throw this.createInvalidTargetPlacementPositionError();
    }

    const referenceAttributeDefinitionId =
      targetPlacementPositionRecord["referenceAttributeDefinitionId"];
    const side = targetPlacementPositionRecord["side"];

    // 3. 기준 AttributeDefinition ID가 현재 DB ID 정책에 맞는 UUID v4인지 확인한다.
    if (
      typeof referenceAttributeDefinitionId !== "string" ||
      !UUID_V4_PATTERN.test(referenceAttributeDefinitionId)
    ) {
      throw this.createInvalidTargetPlacementPositionError();
    }

    // 4. 지원하는 좌우 이동 방향만 허용한다.
    if (side !== "before" && side !== "after") {
      throw this.createInvalidTargetPlacementPositionError();
    }

    return {
      referenceAttributeDefinitionId,
      side,
    };
  }

  // 기능 : 같은 transaction context 안에서 현재 순서를 조회하고 목표 순서로 이동합니다.
  private async moveAttributeDefinitionInTransaction(input: {
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly attributeDefinitionId: string;
    readonly targetPlacementPosition: NormalizedMoveAttributeDefinitionTargetPlacementPosition;
    readonly updatedByActorId: string;
    readonly transactionContext: TransactionContext;
  }): Promise<MovedAttributeDefinitionResult> {
    // 1. 이동 대상 AttributeDefinition이 같은 Workspace/ObjectDefinition 안에 있는지 조회한다.
    const sourceSortOrder =
      await this.attributeDefinitionCommandRepository.findAttributeDefinitionSortOrder(
        {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          attributeDefinitionId: input.attributeDefinitionId,
          transactionContext: input.transactionContext,
        }
      );

    if (sourceSortOrder === null) {
      throw new AttributeDefinitionNotFoundError();
    }

    // 2. 기준 AttributeDefinition이 같은 Workspace/ObjectDefinition 안에 있는지 조회한다.
    const referenceSortOrder =
      await this.attributeDefinitionCommandRepository.findAttributeDefinitionSortOrder(
        {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          attributeDefinitionId:
            input.targetPlacementPosition.referenceAttributeDefinitionId,
          transactionContext: input.transactionContext,
        }
      );

    if (referenceSortOrder === null) {
      throw new AttributeDefinitionNotFoundError();
    }

    // 3. 기준 위치와 이동 방향으로 최종 sortOrder를 계산한다.
    const targetSortOrder = this.resolveTargetSortOrder({
      sourceSortOrder,
      referenceSortOrder,
      side: input.targetPlacementPosition.side,
    });

    // 4. 최종 위치가 같으면 DB 변경 없이 no-op 성공으로 처리한다.
    if (targetSortOrder === sourceSortOrder) {
      return {
        id: input.attributeDefinitionId,
        fromSortOrder: sourceSortOrder,
        toSortOrder: targetSortOrder,
        shiftedAttributeDefinitionCount: 0,
        isNoop: true,
      };
    }

    // 5. bounded range shift와 이동 대상 update를 같은 transaction client로 처리한다.
    const moved =
      await this.attributeDefinitionCommandRepository.moveAttributeDefinitionSortOrder(
        {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          attributeDefinitionId: input.attributeDefinitionId,
          fromSortOrder: sourceSortOrder,
          toSortOrder: targetSortOrder,
          updatedByActorId: input.updatedByActorId,
          transactionContext: input.transactionContext,
        }
      );

    return {
      id: moved.id,
      fromSortOrder: sourceSortOrder,
      toSortOrder: targetSortOrder,
      shiftedAttributeDefinitionCount: moved.shiftedAttributeDefinitionCount,
      isNoop: false,
    };
  }

  // 기능 : 기준 AttributeDefinition의 앞/뒤 요청을 이동 후 최종 sortOrder로 변환합니다.
  private resolveTargetSortOrder(input: {
    readonly sourceSortOrder: number;
    readonly referenceSortOrder: number;
    readonly side: MoveWorkspaceObjectAttributeDefinitionTargetPlacementSide;
  }): number {
    let targetSortOrder =
      input.side === "before"
        ? input.referenceSortOrder
        : input.referenceSortOrder + 1;

    if (input.sourceSortOrder < targetSortOrder) {
      targetSortOrder -= 1;
    }

    return targetSortOrder;
  }

  // 기능 : targetPlacementPosition 입력값 검증 실패 오류를 생성합니다.
  private createInvalidTargetPlacementPositionError(): AttributeDefinitionValidationError {
    return new AttributeDefinitionValidationError(
      "ATTRIBUTE_DEFINITION_POSITION_INVALID",
      "targetPlacementPosition",
      "Attribute definition target placement position is invalid"
    );
  }

  // 기능 : AttributeDefinition 위치 변경 이벤트를 사용자 입력 원문 없이 구조화 로그로 남깁니다.
  private logMovedEvent(fields: AttributeDefinitionMovedLogFields): void {
    this.logger.log(
      JSON.stringify({
        event: "crm.attributeDefinition.moved",
        ...fields,
      }),
      "MoveWorkspaceObjectAttributeDefinitionUseCase"
    );
  }
}
