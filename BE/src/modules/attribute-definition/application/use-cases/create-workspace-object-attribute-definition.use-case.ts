import { Inject, Injectable } from "@nestjs/common";
import {
  isAttributeDefinitionType,
  type AttributeDefinitionType,
} from "@/modules/attribute-definition/application/attribute-definition-type";
import type {
  AttributeDefinitionConfig,
  AttributeDefinitionCurrencyDisplayType,
} from "@/modules/attribute-definition/application/attribute-definition-config";
import {
  ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY,
  type AttributeDefinitionCommandRepository,
} from "@/modules/attribute-definition/application/ports/attribute-definition-command.repository";
import {
  AttributeDefinitionApiSlugAlreadyExistsError,
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
  RECORD_ATTRIBUTE_VALUE_DEFINITION_MATERIALIZER,
  type RecordAttributeValueDefinitionMaterializer,
} from "@/modules/record-definition/application/ports/record-attribute-value-definition-materializer.port";
import {
  type WorkspaceAccessQuery,
  WORKSPACE_ACCESS_QUERY,
} from "@/modules/workspace/application/ports/workspace-access-query.port";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { resolveCurrencyCodeWithDefault } from "@/shared/application/currency/currency-code";
import {
  APPLICATION_LOGGER,
  type ApplicationLogger,
} from "@/shared/application/ports/application-logger.port";
import {
  TRANSACTION_MANAGER,
  type TransactionContext,
  type TransactionManager,
} from "@/shared/application/ports/transaction-manager.port";

const MAX_ATTRIBUTE_DEFINITION_NAME_LENGTH = 80;
const CURRENCY_DISPLAY_TYPE_SYMBOL: AttributeDefinitionCurrencyDisplayType =
  "symbol";
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSERT_POSITION_ALLOWED_KEYS = new Set([
  "referenceAttributeDefinitionId",
  "side",
]);

type JsonObject = Record<string, unknown>;

// 역할 : CreateWorkspaceObjectAttributeDefinitionInsertPositionSide가 기준 속성 대비 삽입 방향을 정의합니다.
export type CreateWorkspaceObjectAttributeDefinitionInsertPositionSide =
  | "before"
  | "after";

// 역할 : CreateWorkspaceObjectAttributeDefinitionCommand가 속성 생성 요청 값을 정의합니다.
export interface CreateWorkspaceObjectAttributeDefinitionCommand {
  readonly attributeDefinitionName: string;
  readonly attributeType: string;
  readonly icon?: string | null;
  readonly description?: string | null;
  readonly config?: unknown | null;
  readonly insertPosition?: unknown | null;
}

// 역할 : CreateWorkspaceObjectAttributeDefinitionResponse가 속성 생성 응답 값을 정의합니다.
export interface CreateWorkspaceObjectAttributeDefinitionResponse {
  readonly attributeDefinitionId: string;
}

// 역할 : CreatedAttributeDefinitionWithMaterializedCells가 AttributeDefinition 생성과 기존 record cell row 보강 결과를 정의합니다.
interface CreatedAttributeDefinitionWithMaterializedCells {
  readonly id: string;
  readonly recordAttributeValueDefinitionCount: number;
  readonly insertPositionSide: CreateWorkspaceObjectAttributeDefinitionInsertPositionSide | null;
  readonly referenceAttributeDefinitionId: string | null;
  readonly targetSortOrder: number;
  readonly shiftedAttributeDefinitionCount: number;
}

// 역할 : NormalizedCreateAttributeDefinitionInsertPosition이 검증된 생성 위치 입력을 정의합니다.
interface NormalizedCreateAttributeDefinitionInsertPosition {
  readonly referenceAttributeDefinitionId: string;
  readonly side: CreateWorkspaceObjectAttributeDefinitionInsertPositionSide;
}

// 역할 : AttributeDefinitionSortOrderPlacement가 새 속성 생성 위치 계산 결과를 정의합니다.
interface AttributeDefinitionSortOrderPlacement {
  readonly insertPositionSide: CreateWorkspaceObjectAttributeDefinitionInsertPositionSide | null;
  readonly referenceAttributeDefinitionId: string | null;
  readonly sortOrder: number;
  readonly shiftedAttributeDefinitionCount: number;
}

// 역할 : CreateWorkspaceObjectAttributeDefinitionUseCase가 현재 ObjectDefinition의 AttributeDefinition 생성을 담당합니다.
@Injectable()
export class CreateWorkspaceObjectAttributeDefinitionUseCase {
  // 기능 : Workspace/ObjectDefinition 접근 포트, AttributeDefinition 저장소, cell materializer, transaction manager, logger를 주입받습니다.
  constructor(
    @Inject(WORKSPACE_ACCESS_QUERY)
    private readonly workspaceAccessQuery: WorkspaceAccessQuery,
    @Inject(OBJECT_DEFINITION_ACCESS_QUERY)
    private readonly objectDefinitionAccessQuery: ObjectDefinitionAccessQuery,
    @Inject(ATTRIBUTE_DEFINITION_COMMAND_REPOSITORY)
    private readonly attributeDefinitionCommandRepository: AttributeDefinitionCommandRepository,
    @Inject(RECORD_ATTRIBUTE_VALUE_DEFINITION_MATERIALIZER)
    private readonly recordAttributeValueDefinitionMaterializer: RecordAttributeValueDefinitionMaterializer,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    @Inject(APPLICATION_LOGGER)
    private readonly logger: ApplicationLogger
  ) {}

  // 기능 : 현재 사용자가 접근 가능한 Workspace ObjectDefinition에 AttributeDefinition을 생성합니다.
  async execute(
    currentUser: CurrentUserContext,
    workspaceId: string,
    objectDefinitionId: string,
    command: CreateWorkspaceObjectAttributeDefinitionCommand
  ): Promise<CreateWorkspaceObjectAttributeDefinitionResponse> {
    // 1. 사용자가 입력한 속성 이름, 타입, 선택값, 타입별 설정을 DB 조회 전에 먼저 검증하고 정규화한다.
    const attributeDefinitionName = this.normalizeAttributeDefinitionName(
      command.attributeDefinitionName
    );
    const attributeType = this.normalizeAttributeType(command.attributeType);
    const icon = this.normalizeOptionalText(command.icon);
    const description = this.normalizeOptionalText(command.description);
    const config = this.normalizeConfig(
      attributeType,
      command.config,
      currentUser.defaultCurrencyCode
    );
    const insertPosition = this.normalizeInsertPosition(
      command.insertPosition
    );

    // 2. 현재 사용자가 요청 Workspace의 멤버인지 확인하고 감사 주체 Actor를 조회한다.
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

    const createdByActorId = workspaceAccess.actorId;

    // 3. 요청 ObjectDefinition이 Workspace 경계 안에 있는지 확인한다.
    const hasObjectDefinition =
      await this.objectDefinitionAccessQuery.hasObjectDefinitionInWorkspace({
        workspaceId,
        objectDefinitionId,
      });

    if (!hasObjectDefinition) {
      throw new AttributeDefinitionObjectDefinitionNotFoundError();
    }

    // 4. 같은 ObjectDefinition 안에서 같은 apiSlug가 이미 있는지 확인한다.
    const hasSameApiSlug =
      await this.attributeDefinitionCommandRepository.hasAttributeDefinitionApiSlug(
        {
          workspaceId,
          objectDefinitionId,
          apiSlug: attributeDefinitionName,
        }
      );

    if (hasSameApiSlug) {
      throw new AttributeDefinitionApiSlugAlreadyExistsError();
    }

    // 5. AttributeDefinition과 기존 RecordDefinition의 null cell value row를 하나의 transaction 안에서 생성한다.
    const created = await this.transactionManager.runInTransaction((context) =>
      this.createAttributeDefinitionInTransaction({
        workspaceId,
        objectDefinitionId,
        createdByActorId,
        apiSlug: attributeDefinitionName,
        title: attributeDefinitionName,
        type: attributeType,
        icon,
        isMultiselect: false,
        description,
        config,
        insertPosition,
        transactionContext: context,
      })
    );

    // 6. 원문 이름과 설명 없이 생성 이벤트만 구조화 로그로 남긴다.
    this.logCreatedEvent({
      userId: currentUser.id,
      workspaceId,
      objectDefinitionId,
      attributeDefinitionId: created.id,
      insertPositionSide: created.insertPositionSide,
      referenceAttributeDefinitionId: created.referenceAttributeDefinitionId,
      targetSortOrder: created.targetSortOrder,
      shiftedAttributeDefinitionCount: created.shiftedAttributeDefinitionCount,
      recordAttributeValueDefinitionCount:
        created.recordAttributeValueDefinitionCount,
    });

    return {
      attributeDefinitionId: created.id,
    };
  }

  // 기능 : AttributeDefinition과 기존 record의 null cell value row 생성을 같은 transaction context로 저장합니다.
  private async createAttributeDefinitionInTransaction(input: {
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly createdByActorId: string;
    readonly apiSlug: string;
    readonly title: string;
    readonly type: AttributeDefinitionType;
    readonly icon: string | null;
    readonly isMultiselect: boolean;
    readonly description: string | null;
    readonly config: AttributeDefinitionConfig | null;
    readonly insertPosition: NormalizedCreateAttributeDefinitionInsertPosition | null;
    readonly transactionContext: TransactionContext;
  }): Promise<CreatedAttributeDefinitionWithMaterializedCells> {
    // 1. 요청 생성 위치에 맞는 sortOrder를 계산하고, 중간 삽입이면 기존 속성들을 뒤로 민다.
    const placement = await this.resolveSortOrderPlacement({
      workspaceId: input.workspaceId,
      objectDefinitionId: input.objectDefinitionId,
      createdByActorId: input.createdByActorId,
      insertPosition: input.insertPosition,
      transactionContext: input.transactionContext,
    });

    // 2. 새 AttributeDefinition row를 먼저 생성해 기존 record cell row의 FK 기준을 확보한다.
    const created =
      await this.attributeDefinitionCommandRepository.createAttributeDefinition(
        {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          createdByActorId: input.createdByActorId,
          apiSlug: input.apiSlug,
          title: input.title,
          sortOrder: placement.sortOrder,
          type: input.type,
          icon: input.icon,
          isMultiselect: input.isMultiselect,
          description: input.description,
          config: input.config,
          transactionContext: input.transactionContext,
        }
      );

    // 3. 이미 존재하는 RecordDefinition마다 새 AttributeDefinition에 대응하는 null cell value row를 생성한다.
    const materialized =
      await this.recordAttributeValueDefinitionMaterializer.materializeForAttributeDefinition(
        {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          attributeDefinitionId: created.id,
          attributeType: input.type,
          createdByActorId: input.createdByActorId,
          transactionContext: input.transactionContext,
        }
      );

    // 4. API 응답에 필요한 AttributeDefinition ID와 관측용 cell 생성 수를 함께 반환한다.
    return {
      id: created.id,
      insertPositionSide: placement.insertPositionSide,
      referenceAttributeDefinitionId: placement.referenceAttributeDefinitionId,
      targetSortOrder: placement.sortOrder,
      shiftedAttributeDefinitionCount:
        placement.shiftedAttributeDefinitionCount,
      recordAttributeValueDefinitionCount: materialized.createdCount,
    };
  }

  // 기능 : insertPosition 입력값을 지원하는 삽입 위치 계약으로 검증하고 정규화합니다.
  private normalizeInsertPosition(
    insertPosition: unknown | undefined
  ): NormalizedCreateAttributeDefinitionInsertPosition | null {
    // 1. 위치 입력이 없으면 기존처럼 마지막 추가 흐름으로 처리한다.
    if (insertPosition === undefined) {
      return null;
    }

    // 2. application 계층 호출자가 DTO를 우회하더라도 객체 형태가 아니면 차단한다.
    if (
      typeof insertPosition !== "object" ||
      insertPosition === null ||
      Array.isArray(insertPosition)
    ) {
      throw this.createInvalidInsertPositionError();
    }

    const insertPositionRecord = insertPosition as Record<string, unknown>;

    // 3. 생성 위치 객체는 계약에 포함된 key만 허용한다.
    if (
      Object.keys(insertPositionRecord).some(
        (key) => !INSERT_POSITION_ALLOWED_KEYS.has(key)
      )
    ) {
      throw this.createInvalidInsertPositionError();
    }

    const referenceAttributeDefinitionId =
      insertPositionRecord["referenceAttributeDefinitionId"];
    const side = insertPositionRecord["side"];

    // 4. 기준 AttributeDefinition ID가 현재 DB ID 정책에 맞는 UUID v4인지 확인한다.
    if (
      typeof referenceAttributeDefinitionId !== "string" ||
      !UUID_V4_PATTERN.test(referenceAttributeDefinitionId)
    ) {
      throw this.createInvalidInsertPositionError();
    }

    // 5. 지원하는 좌우 삽입 방향만 허용한다.
    if (side !== "before" && side !== "after") {
      throw this.createInvalidInsertPositionError();
    }

    return {
      referenceAttributeDefinitionId,
      side,
    };
  }

  // 기능 : 새 AttributeDefinition의 sortOrder를 계산하고 중간 삽입 시 기존 속성들을 뒤로 밉니다.
  private async resolveSortOrderPlacement(input: {
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly createdByActorId: string;
    readonly insertPosition: NormalizedCreateAttributeDefinitionInsertPosition | null;
    readonly transactionContext: TransactionContext;
  }): Promise<AttributeDefinitionSortOrderPlacement> {
    // 1. 위치 입력이 없으면 같은 ObjectDefinition 안의 마지막 다음 순서를 사용한다.
    if (!input.insertPosition) {
      const sortOrder =
        await this.attributeDefinitionCommandRepository.getNextAttributeDefinitionSortOrder(
          {
            workspaceId: input.workspaceId,
            objectDefinitionId: input.objectDefinitionId,
            transactionContext: input.transactionContext,
          }
        );

      return {
        insertPositionSide: null,
        referenceAttributeDefinitionId: null,
        sortOrder,
        shiftedAttributeDefinitionCount: 0,
      };
    }

    // 2. 기준 AttributeDefinition이 같은 Workspace/ObjectDefinition 안에 있는지 조회한다.
    const referenceSortOrder =
      await this.attributeDefinitionCommandRepository.findAttributeDefinitionSortOrder(
        {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          attributeDefinitionId:
            input.insertPosition.referenceAttributeDefinitionId,
          transactionContext: input.transactionContext,
        }
      );

    if (referenceSortOrder === null) {
      throw new AttributeDefinitionNotFoundError();
    }

    // 3. 왼쪽 삽입은 기준 순서, 오른쪽 삽입은 기준 다음 순서를 target으로 계산한다.
    const sortOrder =
      input.insertPosition.side === "before"
        ? referenceSortOrder
        : referenceSortOrder + 1;

    // 4. target sortOrder 이상인 기존 속성을 한 칸씩 뒤로 밀고 현재 사용자 Actor를 감사 컬럼에 남긴다.
    const shiftedAttributeDefinitionCount =
      await this.attributeDefinitionCommandRepository.incrementAttributeDefinitionSortOrdersFrom(
        {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          fromSortOrder: sortOrder,
          updatedByActorId: input.createdByActorId,
          transactionContext: input.transactionContext,
        }
      );

    return {
      insertPositionSide: input.insertPosition.side,
      referenceAttributeDefinitionId:
        input.insertPosition.referenceAttributeDefinitionId,
      sortOrder,
      shiftedAttributeDefinitionCount,
    };
  }

  // 기능 : AttributeDefinition 이름 입력값을 trim하고 필수/길이 조건을 검증합니다.
  private normalizeAttributeDefinitionName(
    attributeDefinitionName: string
  ): string {
    // 1. 앞뒤 공백을 제거해 실제 저장 기준 입력값을 만든다.
    const normalized = attributeDefinitionName.trim();

    // 2. 공백만 입력한 이름은 생성할 수 없도록 차단한다.
    if (normalized.length === 0) {
      throw new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_NAME_REQUIRED",
        "attributeDefinitionName",
        "Attribute definition name is required"
      );
    }

    // 3. 사용자 입력 기준 최대 길이를 초과하면 저장하지 않는다.
    if (Array.from(normalized).length > MAX_ATTRIBUTE_DEFINITION_NAME_LENGTH) {
      throw new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_NAME_TOO_LONG",
        "attributeDefinitionName",
        "Attribute definition name must be 80 characters or fewer"
      );
    }

    // 4. 정규화된 이름을 호출자에게 반환한다.
    return normalized;
  }

  // 기능 : AttributeDefinition type 입력값이 지원 enum 값인지 검증합니다.
  private normalizeAttributeType(attributeType: string): AttributeDefinitionType {
    const normalized = attributeType.trim();

    if (!isAttributeDefinitionType(normalized)) {
      throw new AttributeDefinitionValidationError(
        "ATTRIBUTE_DEFINITION_TYPE_UNKNOWN",
        "attributeType",
        "Attribute definition type is unknown"
      );
    }

    return normalized;
  }

  // 기능 : 선택 입력값을 trim 없이 저장 가능한 문자열 또는 null로 정규화합니다.
  private normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === undefined || value === null || value.length === 0) {
      return null;
    }

    return value;
  }

  // 기능 : AttributeType별 config 입력값을 검증하고 저장 가능한 canonical config로 정규화합니다.
  private normalizeConfig(
    attributeType: AttributeDefinitionType,
    config: unknown | null | undefined,
    defaultCurrencyCode: string | null | undefined
  ): AttributeDefinitionConfig | null {
    // 1. Currency 타입은 통화 설정을 기본값과 함께 정규화한다.
    if (attributeType === "Currency") {
      return this.normalizeCurrencyConfig(config, defaultCurrencyCode);
    }

    // 2. 설정을 지원하지 않는 타입은 config 입력을 받지 않는다.
    if (config === undefined || config === null) {
      return null;
    }

    throw this.createInvalidConfigError();
  }

  // 기능 : Currency AttributeDefinition config를 통화 코드와 표시 방식 기준으로 정규화합니다.
  private normalizeCurrencyConfig(
    config: unknown | null | undefined,
    defaultCurrencyCode: string | null | undefined
  ): AttributeDefinitionConfig {
    // 1. config가 없으면 현재 사용자 기본 통화와 symbol 표시 방식을 사용한다.
    if (config === undefined || config === null) {
      return this.createCurrencyConfig(null, undefined, defaultCurrencyCode);
    }

    // 2. Currency config root는 currency 키만 허용한다.
    const configObject = this.assertConfigObject(config);
    this.assertOnlyConfigKeys(configObject, ["currency"]);

    const currencyConfig = configObject["currency"];

    if (currencyConfig === undefined || currencyConfig === null) {
      throw this.createInvalidConfigError();
    }

    // 3. currency 설정 안에서는 defaultCurrencyCode와 displayType만 허용한다.
    const currencyConfigObject = this.assertConfigObject(currencyConfig);
    this.assertOnlyConfigKeys(currencyConfigObject, [
      "defaultCurrencyCode",
      "displayType",
    ]);

    // 4. 입력값을 canonical Currency config로 변환한다.
    return this.createCurrencyConfig(
      currencyConfigObject["defaultCurrencyCode"],
      currencyConfigObject["displayType"],
      defaultCurrencyCode
    );
  }

  // 기능 : Currency config 입력 조각을 저장 가능한 canonical Currency config로 만듭니다.
  private createCurrencyConfig(
    defaultCurrencyCodeInput: unknown,
    displayTypeInput: unknown,
    defaultCurrencyCode: string | null | undefined
  ): AttributeDefinitionConfig {
    const normalizedDefaultCurrencyCode =
      this.normalizeCurrencyConfigDefaultCurrencyCode(
        defaultCurrencyCodeInput,
        defaultCurrencyCode
      );
    const displayType = this.normalizeCurrencyDisplayType(displayTypeInput);

    return {
      currency: {
        defaultCurrencyCode: normalizedDefaultCurrencyCode,
        displayType,
      },
    };
  }

  // 기능 : Currency config의 기본 통화 코드를 서비스 지원 통화 코드로 정규화합니다.
  private normalizeCurrencyConfigDefaultCurrencyCode(
    value: unknown,
    defaultCurrencyCode: string | null | undefined
  ): string {
    if (value !== undefined && value !== null && typeof value !== "string") {
      throw this.createInvalidConfigError();
    }

    try {
      return resolveCurrencyCodeWithDefault(
        value === undefined || value === null ? null : value,
        defaultCurrencyCode
      );
    } catch {
      throw this.createInvalidConfigError();
    }
  }

  // 기능 : Currency config의 표시 방식을 현재 지원하는 symbol 값으로 정규화합니다.
  private normalizeCurrencyDisplayType(
    value: unknown
  ): AttributeDefinitionCurrencyDisplayType {
    if (value === undefined || value === null) {
      return CURRENCY_DISPLAY_TYPE_SYMBOL;
    }

    if (
      typeof value !== "string" ||
      value.trim() !== CURRENCY_DISPLAY_TYPE_SYMBOL
    ) {
      throw this.createInvalidConfigError();
    }

    return CURRENCY_DISPLAY_TYPE_SYMBOL;
  }

  // 기능 : config 입력값이 plain JSON object인지 확인합니다.
  private assertConfigObject(value: unknown): JsonObject {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw this.createInvalidConfigError();
    }

    return value as JsonObject;
  }

  // 기능 : config object에 허용된 key만 포함되어 있는지 확인합니다.
  private assertOnlyConfigKeys(
    value: JsonObject,
    allowedKeys: readonly string[]
  ): void {
    const allowedKeySet = new Set<string>(allowedKeys);

    for (const key of Object.keys(value)) {
      if (!allowedKeySet.has(key)) {
        throw this.createInvalidConfigError();
      }
    }
  }

  // 기능 : AttributeDefinition config 검증 실패 오류를 생성합니다.
  private createInvalidConfigError(): AttributeDefinitionValidationError {
    return new AttributeDefinitionValidationError(
      "ATTRIBUTE_DEFINITION_CONFIG_INVALID",
      "config",
      "Attribute definition config is invalid"
    );
  }

  // 기능 : insertPosition 입력값 검증 실패 오류를 생성합니다.
  private createInvalidInsertPositionError(): AttributeDefinitionValidationError {
    return new AttributeDefinitionValidationError(
      "ATTRIBUTE_DEFINITION_INSERT_POSITION_INVALID",
      "insertPosition",
      "Attribute definition insert position is invalid"
    );
  }

  // 기능 : AttributeDefinition 생성 이벤트를 사용자 입력 원문 없이 구조화 로그로 남깁니다.
  private logCreatedEvent(fields: {
    readonly userId: string;
    readonly workspaceId: string;
    readonly objectDefinitionId: string;
    readonly attributeDefinitionId: string;
    readonly insertPositionSide: CreateWorkspaceObjectAttributeDefinitionInsertPositionSide | null;
    readonly referenceAttributeDefinitionId: string | null;
    readonly targetSortOrder: number;
    readonly shiftedAttributeDefinitionCount: number;
    readonly recordAttributeValueDefinitionCount: number;
  }): void {
    this.logger.log(
      JSON.stringify({
        event: "crm.attributeDefinition.created",
        ...fields,
      }),
      "CreateWorkspaceObjectAttributeDefinitionUseCase"
    );
  }
}
