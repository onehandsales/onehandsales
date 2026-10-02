import { Prisma } from "@prisma/client";
import type {
  CreateRecordDefinitionInput,
  CreateRecordDefinitionResult,
  RecordAttributeValueDefinitionForUpdate,
  RecordAttributeValueDefinitionLookupInput,
  RecordDefinitionCommandRepository,
  RecordDefinitionWorkspaceObjectLookupInput,
  UpdateRecordAttributeValueDefinitionInput,
  UpdateRecordAttributeValueDefinitionResult,
} from "@/modules/record-definition/application/ports/record-definition-command.repository";
import {
  RecordAttributeValueDefinitionNotFoundError,
  RecordDefinitionRecordNotFoundError,
} from "@/modules/record-definition/domain/record-definition.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

type RecordDefinitionCommandClient = ReturnType<
  typeof resolvePrismaTransactionalClient
>;

// 역할 : PrismaRecordDefinitionCommandRepository가 RecordDefinition 쓰기 저장소 계약을 Prisma로 구현합니다.
export class PrismaRecordDefinitionCommandRepository
  implements RecordDefinitionCommandRepository
{
  // 기능 : PrismaService를 주입받아 RecordDefinition 쓰기 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : ObjectDefinition에 빈 RecordDefinition row와 현재 AttributeDefinition 기준 null cell value row를 생성합니다.
  async createRecordDefinition(
    input: CreateRecordDefinitionInput
  ): Promise<CreateRecordDefinitionResult> {
    // 1. 현재 transaction context에 맞는 Prisma client를 준비한다.
    const client = resolvePrismaTransactionalClient(
      this.prismaService,
      input.transactionContext
    );

    // 2. 현재 ObjectDefinition에 속한 AttributeDefinition 목록을 cell value 생성 기준으로 조회한다.
    const attributeDefinitions = await this.listAttributeDefinitions(client, {
      workspaceId: input.workspaceId,
      objectDefinitionId: input.objectDefinitionId,
    });

    // 3. RecordDefinition row를 생성하고 생성된 ID만 조회한다.
    const recordDefinition = await client.recordDefinition.create({
      data: {
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
        createdByActorId: input.createdByActorId,
      },
      select: {
        id: true,
      },
    });

    // 4. AttributeDefinition이 있으면 각 AttributeDefinition마다 null cell value row를 생성한다.
    if (attributeDefinitions.length > 0) {
      await client.recordAttributeValueDefinition.createMany({
        data: attributeDefinitions.map((attributeDefinition) => ({
          workspaceId: input.workspaceId,
          recordDefinitionId: recordDefinition.id,
          objectDefinitionId: input.objectDefinitionId,
          attributeDefinitionId: attributeDefinition.id,
          createdByActorId: input.createdByActorId,
          attributeType: attributeDefinition.type,
          textValue: null,
          numberValue: null,
          booleanValue: null,
          dateValue: null,
          timestampValue: null,
          selectOptionId: null,
          statusOptionId: null,
          targetRecordDefinitionId: null,
          targetObjectDefinitionId: null,
          targetActorId: null,
        })),
      });
    }

    // 5. 생성 결과를 application 계층 응답 계약으로 반환한다.
    return {
      id: recordDefinition.id,
    };
  }

  // 기능 : 특정 RecordDefinition이 요청 Workspace와 ObjectDefinition에 속하는지 확인합니다.
  async hasRecordDefinitionInWorkspaceObject(
    input: RecordDefinitionWorkspaceObjectLookupInput
  ): Promise<boolean> {
    // 1. Workspace/ObjectDefinition/RecordDefinition 경계 안의 row 존재 여부를 조회한다.
    const recordDefinition = await this.prismaService.recordDefinition.findFirst({
      where: {
        id: input.recordDefinitionId,
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
      },
      select: {
        id: true,
      },
    });

    // 2. 조회 결과 존재 여부를 RecordDefinition 접근 가능 여부로 반환한다.
    return recordDefinition !== null;
  }

  // 기능 : 수정 대상 cell value row와 AttributeDefinition 정합성을 조회합니다.
  async findRecordAttributeValueDefinitionForUpdate(
    input: RecordAttributeValueDefinitionLookupInput
  ): Promise<RecordAttributeValueDefinitionForUpdate | null> {
    // 1. 요청 경계와 AttributeDefinition 소속 조건을 함께 사용해 cell value row를 조회한다.
    const recordAttributeValueDefinition =
      await this.prismaService.recordAttributeValueDefinition.findFirst({
        where: {
          id: input.recordAttributeValueDefinitionId,
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          recordDefinitionId: input.recordDefinitionId,
          attributeDefinition: {
            workspaceId: input.workspaceId,
            objectDefinitionId: input.objectDefinitionId,
          },
        },
        select: {
          id: true,
          attributeDefinitionId: true,
          attributeType: true,
        },
      });

    // 2. Prisma row가 없으면 호출자가 not found로 변환할 수 있게 null을 반환한다.
    if (!recordAttributeValueDefinition) {
      return null;
    }

    // 3. 수정 값 매핑에 필요한 AttributeDefinition ID와 type snapshot을 반환한다.
    return {
      id: recordAttributeValueDefinition.id,
      attributeDefinitionId:
        recordAttributeValueDefinition.attributeDefinitionId,
      attributeType: recordAttributeValueDefinition.attributeType,
    };
  }

  // 기능 : cell value row와 부모 RecordDefinition 수정 감사 정보를 같은 작업으로 저장합니다.
  async updateRecordAttributeValueDefinition(
    input: UpdateRecordAttributeValueDefinitionInput
  ): Promise<UpdateRecordAttributeValueDefinitionResult> {
    // 1. 현재 transaction context에 맞는 Prisma client를 준비한다.
    const client = resolvePrismaTransactionalClient(
      this.prismaService,
      input.transactionContext
    );

    // 2. 요청 경계 안의 cell value row만 수정하고 감사 Actor를 기록한다.
    const updatedCell = await client.recordAttributeValueDefinition.updateMany({
      where: {
        id: input.recordAttributeValueDefinitionId,
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
        recordDefinitionId: input.recordDefinitionId,
      },
      data: {
        updatedByActorId: input.updatedByActorId,
        jsonValue: this.toPrismaNullableJson(input.values.jsonValue),
        textValue: input.values.textValue,
        numberValue: input.values.numberValue,
        booleanValue: input.values.booleanValue,
        dateValue: input.values.dateValue,
        timestampValue: input.values.timestampValue,
        selectOptionId: input.values.selectOptionId,
        statusOptionId: input.values.statusOptionId,
        targetRecordDefinitionId: input.values.targetRecordDefinitionId,
        targetObjectDefinitionId: input.values.targetObjectDefinitionId,
        targetActorId: input.values.targetActorId,
      },
    });

    if (updatedCell.count !== 1) {
      throw new RecordAttributeValueDefinitionNotFoundError();
    }

    // 3. 부모 RecordDefinition도 같은 사용자 행동으로 수정된 row로 보고 updatedAt을 갱신한다.
    const updatedRecord = await client.recordDefinition.updateMany({
      where: {
        id: input.recordDefinitionId,
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
      },
      data: {
        updatedByActorId: input.updatedByActorId,
      },
    });

    if (updatedRecord.count !== 1) {
      throw new RecordDefinitionRecordNotFoundError();
    }

    // 4. 수정 결과를 application 계층 응답 계약으로 반환한다.
    return {
      id: input.recordAttributeValueDefinitionId,
    };
  }

  // 기능 : 현재 ObjectDefinition에 속한 AttributeDefinition 목록을 조회합니다.
  private listAttributeDefinitions(
    client: RecordDefinitionCommandClient,
    input: {
      readonly workspaceId: string;
      readonly objectDefinitionId: string;
    }
  ) {
    // 1. Workspace/ObjectDefinition 경계 안의 AttributeDefinition ID와 type snapshot 값을 조회한다.
    return client.attributeDefinition.findMany({
      where: {
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
      },
      orderBy: [{ sortOrder: "asc" }],
      select: {
        id: true,
        type: true,
      },
    });
  }

  // 기능 : application의 JSON 값을 Prisma nullable JSON 입력값으로 변환합니다.
  private toPrismaNullableJson(
    value: unknown | null
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
    if (value === null) {
      return Prisma.DbNull;
    }

    return value as Prisma.InputJsonValue;
  }
}
