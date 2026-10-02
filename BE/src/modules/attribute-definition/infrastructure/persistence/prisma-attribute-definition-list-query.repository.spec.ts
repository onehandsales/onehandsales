import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAttributeDefinitionListQueryRepository } from "./prisma-attribute-definition-list-query.repository";

// 기능 : AttributeDefinition Prisma 목록 조회 저장소의 응답 매핑과 정렬 조건을 검증합니다.
describe("PrismaAttributeDefinitionListQueryRepository", () => {
  // 기능 : AttributeDefinition 목록을 sortOrder 기준으로 조회하고 응답 계약으로 변환합니다.
  it("lists attribute definitions by sort order", async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: "00000000-0000-4000-8000-000000000601",
        icon: "type",
        title: "company",
        sortOrder: 0,
        type: "Text",
        isMultiselect: false,
        configJson: null,
      },
      {
        id: "00000000-0000-4000-8000-000000000602",
        icon: "kanban",
        title: "상태",
        sortOrder: 1,
        type: "Status",
        isMultiselect: false,
        configJson: null,
      },
    ]);
    const prismaService = {
      attributeDefinition: {
        findMany,
      },
    } as unknown as PrismaService;
    const repository = new PrismaAttributeDefinitionListQueryRepository(
      prismaService
    );

    const result = await repository.listWorkspaceObjectAttributeDefinitions({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        workspaceId: "00000000-0000-4000-8000-000000000301",
        objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      },
      orderBy: [{ sortOrder: "asc" }],
      select: {
        id: true,
        icon: true,
        title: true,
        sortOrder: true,
        type: true,
        isMultiselect: true,
        configJson: true,
      },
    });
    expect(result).toEqual([
      {
        id: "00000000-0000-4000-8000-000000000601",
        icon: "type",
        title: "company",
        sortOrder: 0,
        type: "Text",
        isMultiselect: false,
        config: null,
      },
      {
        id: "00000000-0000-4000-8000-000000000602",
        icon: "kanban",
        title: "상태",
        sortOrder: 1,
        type: "Status",
        isMultiselect: false,
        config: null,
      },
    ]);
  });
});
