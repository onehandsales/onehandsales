import type {
  MaterializeRecordAttributeValuesForAttributeDefinitionInput,
  MaterializeRecordAttributeValuesForAttributeDefinitionResult,
  RecordAttributeValueDefinitionMaterializer,
} from "@/modules/record-definition/application/ports/record-attribute-value-definition-materializer.port";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type RecordAttributeValueDefinitionMaterializerClient = ReturnType<
  typeof resolvePrismaTransactionalClient
>;

// 역할 : PrismaRecordAttributeValueDefinitionMaterializer가 새 AttributeDefinition에 필요한 기존 RecordDefinition cell row 생성을 Prisma로 구현합니다.
export class PrismaRecordAttributeValueDefinitionMaterializer
  implements RecordAttributeValueDefinitionMaterializer
{
  // 기능 : PrismaService를 주입받아 RecordAttributeValueDefinition materialize DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 새 AttributeDefinition 기준으로 기존 RecordDefinition마다 null cell value row를 생성합니다.
  async materializeForAttributeDefinition(
    input: MaterializeRecordAttributeValuesForAttributeDefinitionInput
  ): Promise<MaterializeRecordAttributeValuesForAttributeDefinitionResult> {
    // 1. 현재 transaction context에 맞는 Prisma client를 준비한다.
    const client = resolvePrismaTransactionalClient(
      this.prismaService,
      input.transactionContext
    );

    // 2. 현재 ObjectDefinition에 이미 존재하는 RecordDefinition 목록을 cell value 생성 기준으로 조회한다.
    const recordDefinitions = await this.listRecordDefinitions(client, {
      workspaceId: input.workspaceId,
      objectDefinitionId: input.objectDefinitionId,
    });

    // 3. 기존 실제 데이터가 없으면 AttributeDefinition 생성만 성공시키고 cell 생성 수 0을 반환한다.
    if (recordDefinitions.length === 0) {
      return {
        createdCount: 0,
      };
    }

    // 4. 기존 RecordDefinition마다 새 AttributeDefinition에 대응하는 null cell value row를 생성한다.
    const created = await client.recordAttributeValueDefinition.createMany({
      data: recordDefinitions.map((recordDefinition) => ({
        workspaceId: input.workspaceId,
        recordDefinitionId: recordDefinition.id,
        objectDefinitionId: input.objectDefinitionId,
        attributeDefinitionId: input.attributeDefinitionId,
        createdByActorId: input.createdByActorId,
        attributeType: input.attributeType,
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

    // 5. 생성된 cell value row 수를 application 계층 응답 계약으로 반환한다.
    return {
      createdCount: created.count,
    };
  }

  // 기능 : 현재 ObjectDefinition에 속한 기존 RecordDefinition 목록을 조회합니다.
  private listRecordDefinitions(
    client: RecordAttributeValueDefinitionMaterializerClient,
    input: {
      readonly workspaceId: string;
      readonly objectDefinitionId: string;
    }
  ) {
    // 1. Workspace/ObjectDefinition 경계 안의 RecordDefinition ID를 생성 순서로 조회한다.
    return client.recordDefinition.findMany({
      where: {
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
      },
    });
  }
}
