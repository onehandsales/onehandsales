import type {
  CreateRecordDefinitionInput,
  CreateRecordDefinitionResult,
  RecordDefinitionCommandRepository,
} from "@/modules/record-definition/application/ports/record-definition-command.repository";
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
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        type: true,
      },
    });
  }
}
