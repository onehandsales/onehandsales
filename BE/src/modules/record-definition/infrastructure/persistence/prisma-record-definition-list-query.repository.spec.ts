import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaRecordDefinitionListQueryRepository } from "./prisma-record-definition-list-query.repository";

const RECORD_CREATED_AT = new Date("2026-10-02T00:00:00.000Z");
const RECORD_UPDATED_AT = new Date("2026-10-02T00:01:00.000Z");

// 기능 : RecordDefinition Prisma 목록 조회 저장소의 cell 정렬 조건과 응답 매핑을 검증합니다.
describe("PrismaRecordDefinitionListQueryRepository", () => {
  // 기능 : RecordAttributeValueDefinition을 AttributeDefinition sortOrder 기준으로 조회합니다.
  it("lists record attribute values by attribute definition sort order", async () => {
    const recordDefinitionFindMany = jest.fn().mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000701",
        createdAt: RECORD_CREATED_AT,
        updatedAt: RECORD_UPDATED_AT,
      },
    ]);
    const recordAttributeValueDefinitionFindMany = jest.fn().mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000801",
        recordDefinitionId: "00000000-0000-4000-8000-000000000701",
        attributeDefinitionId: "00000000-0000-4000-8000-000000000601",
        attributeType: "Text",
        textValue: "회사명",
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        timestampValue: null,
        jsonValue: null,
        selectOptionId: null,
        statusOptionId: null,
        targetRecordDefinitionId: null,
        targetObjectDefinitionId: null,
        targetActorId: null,
      },
    ]);
    const prismaService = {
      recordDefinition: {
        findMany: recordDefinitionFindMany,
      },
      recordAttributeValueDefinition: {
        findMany: recordAttributeValueDefinitionFindMany,
      },
    } as unknown as PrismaService;
    const repository = new PrismaRecordDefinitionListQueryRepository(
      prismaService
    );

    const result = await repository.listWorkspaceObjectRecordDefinitions({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      pageSize: 25,
      cursor: null,
    });

    expect(recordAttributeValueDefinitionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ attributeDefinition: { sortOrder: "asc" } }],
      })
    );
    expect(result).toEqual({
      items: [
        {
          id: "00000000-0000-4000-8000-000000000701",
          createdAt: RECORD_CREATED_AT.toISOString(),
          updatedAt: RECORD_UPDATED_AT.toISOString(),
          recordAttributeValues: [
            {
              id: "00000000-0000-4000-8000-000000000801",
              attributeDefinitionId:
                "00000000-0000-4000-8000-000000000601",
              attributeType: "Text",
              textValue: "회사명",
              numberValue: null,
              booleanValue: null,
              dateValue: null,
              timestampValue: null,
              jsonValue: null,
              selectOptionId: null,
              statusOptionId: null,
              targetRecordDefinitionId: null,
              targetObjectDefinitionId: null,
              targetActorId: null,
            },
          ],
        },
      ],
      hasNextPage: false,
    });
  });
});
