import type {
  RecordAttributeValueType,
  RecordDefinitionListQuery,
  WorkspaceObjectRecordAttributeValueListItem,
  WorkspaceObjectRecordDefinitionListInput,
  WorkspaceObjectRecordDefinitionListItem,
  WorkspaceObjectRecordDefinitionListPage,
} from "@/modules/record-definition/application/ports/record-definition-list-query.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaRecordDefinitionListQueryRepository가 RecordDefinition 목록 조회를 Prisma로 구현합니다.
export class PrismaRecordDefinitionListQueryRepository
  implements RecordDefinitionListQuery
{
  // 기능 : PrismaService를 주입받아 RecordDefinition 조회에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 특정 Workspace ObjectDefinition에 속한 RecordDefinition page와 연결 값을 조회합니다.
  async listWorkspaceObjectRecordDefinitions(
    input: WorkspaceObjectRecordDefinitionListInput
  ): Promise<WorkspaceObjectRecordDefinitionListPage> {
    // 1. Workspace와 ObjectDefinition 경계 안의 RecordDefinition을 cursor 기준으로 pageSize보다 1개 더 조회한다.
    const records = await this.prismaService.recordDefinition.findMany({
      where: {
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
        ...(input.cursor
          ? {
              OR: [
                {
                  createdAt: {
                    gt: input.cursor.createdAt,
                  },
                },
                {
                  createdAt: input.cursor.createdAt,
                  id: {
                    gt: input.cursor.id,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: input.pageSize + 1,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 2. 추가 조회한 row로 다음 page 존재 여부를 판단하고 응답 대상 row만 분리한다.
    const hasNextPage = records.length > input.pageSize;
    const pageRecords = records.slice(0, input.pageSize);

    if (pageRecords.length === 0) {
      return {
        items: [],
        hasNextPage: false,
      };
    }

    // 3. 현재 page의 RecordDefinition ID 목록으로 RecordAttributeValueDefinition을 일괄 조회한다.
    const recordIds = pageRecords.map((record) => record.id);
    const recordAttributeValues =
      await this.prismaService.recordAttributeValueDefinition.findMany({
        where: {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          recordDefinitionId: {
            in: recordIds,
          },
          attributeDefinition: {
            workspaceId: input.workspaceId,
            objectDefinitionId: input.objectDefinitionId,
          },
        },
        orderBy: [{ attributeDefinition: { sortOrder: "asc" } }],
        select: {
          id: true,
          recordDefinitionId: true,
          attributeDefinitionId: true,
          attributeType: true,
          textValue: true,
          numberValue: true,
          booleanValue: true,
          dateValue: true,
          timestampValue: true,
          jsonValue: true,
          selectOptionId: true,
          statusOptionId: true,
          targetRecordDefinitionId: true,
          targetObjectDefinitionId: true,
          targetActorId: true,
        },
      });

    // 4. RecordAttributeValueDefinition을 RecordDefinition ID 기준으로 그룹핑한다.
    const recordAttributeValuesByRecordId = new Map<
      string,
      WorkspaceObjectRecordAttributeValueListItem[]
    >();

    for (const recordAttributeValue of recordAttributeValues) {
      const values =
        recordAttributeValuesByRecordId.get(
          recordAttributeValue.recordDefinitionId
        ) ?? [];

      values.push({
        id: recordAttributeValue.id,
        attributeDefinitionId: recordAttributeValue.attributeDefinitionId,
        attributeType:
          recordAttributeValue.attributeType as RecordAttributeValueType,
        textValue: recordAttributeValue.textValue,
        numberValue: recordAttributeValue.numberValue?.toString() ?? null,
        booleanValue: recordAttributeValue.booleanValue,
        dateValue: this.formatDateValue(recordAttributeValue.dateValue),
        timestampValue:
          recordAttributeValue.timestampValue?.toISOString() ?? null,
        jsonValue: recordAttributeValue.jsonValue ?? null,
        selectOptionId: recordAttributeValue.selectOptionId,
        statusOptionId: recordAttributeValue.statusOptionId,
        targetRecordDefinitionId:
          recordAttributeValue.targetRecordDefinitionId,
        targetObjectDefinitionId: recordAttributeValue.targetObjectDefinitionId,
        targetActorId: recordAttributeValue.targetActorId,
      });
      recordAttributeValuesByRecordId.set(
        recordAttributeValue.recordDefinitionId,
        values
      );
    }

    // 5. RecordDefinition과 그룹핑된 cell 값을 body row 응답 형태로 변환한다.
    const items: WorkspaceObjectRecordDefinitionListItem[] = pageRecords.map(
      (record) => ({
        id: record.id,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        recordAttributeValues:
          recordAttributeValuesByRecordId.get(record.id) ?? [],
      })
    );

    return {
      items,
      hasNextPage,
    };
  }

  // 기능 : DB date 값을 API 날짜 문자열로 변환합니다.
  private formatDateValue(value: Date | null): string | null {
    return value?.toISOString().slice(0, 10) ?? null;
  }
}
