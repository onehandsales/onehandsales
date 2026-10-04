import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAttributeDefinitionDetailQueryRepository } from "./prisma-attribute-definition-detail-query.repository";

// 기능 : AttributeDefinition Prisma 단건 조회 저장소의 응답 매핑과 조회 조건을 검증합니다.
describe("PrismaAttributeDefinitionDetailQueryRepository", () => {
  // 기능 : AttributeDefinition 단건을 Workspace/ObjectDefinition 경계 조건으로 조회하고 응답 계약으로 변환합니다.
  it("finds an attribute definition by workspace object boundary", async () => {
    const findFirst = jest.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000603",
      title: "금액",
      type: "Currency",
      isMultiselect: false,
      description: "계약 금액을 저장해요.",
      icon: "circle-dollar-sign",
      configJson: {
        currency: {
          defaultCurrencyCode: "KRW",
          displayType: "symbol",
        },
      },
      sortOrder: 2,
    });
    const prismaService = {
      attributeDefinition: {
        findFirst,
      },
    } as unknown as PrismaService;
    const repository = new PrismaAttributeDefinitionDetailQueryRepository(
      prismaService
    );

    const result = await repository.findWorkspaceObjectAttributeDefinition({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000603",
    });

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: "00000000-0000-4000-8000-000000000603",
        workspaceId: "00000000-0000-4000-8000-000000000301",
        objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      },
      select: {
        id: true,
        title: true,
        type: true,
        isMultiselect: true,
        description: true,
        icon: true,
        configJson: true,
        sortOrder: true,
      },
    });
    expect(result).toEqual({
      id: "00000000-0000-4000-8000-000000000603",
      title: "금액",
      type: "Currency",
      isMultiselect: false,
      description: "계약 금액을 저장해요.",
      icon: "circle-dollar-sign",
      config: {
        currency: {
          defaultCurrencyCode: "KRW",
          displayType: "symbol",
        },
      },
      sortOrder: 2,
    });
  });

  // 기능 : AttributeDefinition row가 없으면 null을 반환합니다.
  it("returns null when the attribute definition is missing", async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const prismaService = {
      attributeDefinition: {
        findFirst,
      },
    } as unknown as PrismaService;
    const repository = new PrismaAttributeDefinitionDetailQueryRepository(
      prismaService
    );

    const result = await repository.findWorkspaceObjectAttributeDefinition({
      workspaceId: "00000000-0000-4000-8000-000000000301",
      objectDefinitionId: "00000000-0000-4000-8000-000000000501",
      attributeDefinitionId: "00000000-0000-4000-8000-000000000699",
    });

    expect(result).toBeNull();
  });
});
