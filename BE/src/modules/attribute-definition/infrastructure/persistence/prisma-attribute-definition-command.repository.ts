import { Prisma } from "@prisma/client";
import type {
  AttributeDefinitionApiSlugLookupInput,
  AttributeDefinitionForUpdate,
  AttributeDefinitionSortOrderByIdLookupInput,
  AttributeDefinitionSortOrderLookupInput,
  AttributeDefinitionCommandRepository,
  AttributeDefinitionWorkspaceObjectLookupInput,
  CreateAttributeDefinitionInput,
  CreateAttributeDefinitionResult,
  IncrementAttributeDefinitionSortOrdersFromInput,
  UpdateAttributeDefinitionInput,
  UpdateAttributeDefinitionResult,
} from "@/modules/attribute-definition/application/ports/attribute-definition-command.repository";
import {
  AttributeDefinitionApiSlugAlreadyExistsError,
  AttributeDefinitionNotFoundError,
} from "@/modules/attribute-definition/domain/attribute-definition.errors";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaAttributeDefinitionCommandRepository가 AttributeDefinition 쓰기 저장소 계약을 Prisma로 구현합니다.
export class PrismaAttributeDefinitionCommandRepository
  implements AttributeDefinitionCommandRepository
{
  // 기능 : PrismaService를 주입받아 AttributeDefinition 쓰기 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 같은 ObjectDefinition 안에 동일 apiSlug의 AttributeDefinition이 있는지 확인합니다.
  async hasAttributeDefinitionApiSlug(
    input: AttributeDefinitionApiSlugLookupInput
  ): Promise<boolean> {
    // 1. Workspace, ObjectDefinition, apiSlug 기준으로 기존 AttributeDefinition 존재 여부를 조회한다.
    const attributeDefinition =
      await this.prismaService.attributeDefinition.findFirst({
        where: {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          apiSlug: input.apiSlug,
          ...(input.excludeAttributeDefinitionId !== undefined
            ? { id: { not: input.excludeAttributeDefinitionId } }
            : {}),
        },
        select: {
          id: true,
        },
      });

    // 2. 조회 결과 존재 여부를 중복 여부로 반환한다.
    return attributeDefinition !== null;
  }

  // 기능 : 같은 ObjectDefinition 안에서 다음 AttributeDefinition 정렬 순서를 조회합니다.
  async getNextAttributeDefinitionSortOrder(
    input: AttributeDefinitionSortOrderLookupInput
  ): Promise<number> {
    // 1. 현재 transaction context에 맞는 Prisma client를 준비한다.
    const client = resolvePrismaTransactionalClient(
      this.prismaService,
      input.transactionContext
    );

    // 2. Workspace/ObjectDefinition 경계 안의 가장 큰 sortOrder 값을 조회한다.
    const aggregate = await client.attributeDefinition.aggregate({
      where: {
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
      },
      _max: {
        sortOrder: true,
      },
    });

    // 3. 기존 AttributeDefinition이 없으면 첫 정렬 순서 0을 반환한다.
    return (aggregate._max.sortOrder ?? -1) + 1;
  }

  // 기능 : 기준 AttributeDefinition이 요청 Workspace/ObjectDefinition에 속하는지 확인하고 정렬 순서를 조회합니다.
  async findAttributeDefinitionSortOrder(
    input: AttributeDefinitionSortOrderByIdLookupInput
  ): Promise<number | null> {
    // 1. 현재 transaction context에 맞는 Prisma client를 준비한다.
    const client = resolvePrismaTransactionalClient(
      this.prismaService,
      input.transactionContext
    );

    // 2. Workspace/ObjectDefinition/AttributeDefinition 경계 기준으로 기준 속성을 조회한다.
    const attributeDefinition = await client.attributeDefinition.findFirst({
      where: {
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
        id: input.attributeDefinitionId,
      },
      select: {
        sortOrder: true,
      },
    });

    // 3. 기준 속성이 없으면 null을 반환해 application 계층에서 not found로 처리하게 한다.
    return attributeDefinition?.sortOrder ?? null;
  }

  // 기능 : 같은 ObjectDefinition 안에서 기준 정렬 순서 이상인 AttributeDefinition들을 뒤로 밉니다.
  async incrementAttributeDefinitionSortOrdersFrom(
    input: IncrementAttributeDefinitionSortOrdersFromInput
  ): Promise<number> {
    // 1. 현재 transaction context에 맞는 Prisma client를 준비한다.
    const client = resolvePrismaTransactionalClient(
      this.prismaService,
      input.transactionContext
    );

    // 2. target sortOrder 이상인 기존 AttributeDefinition을 한 칸 뒤로 밀고 감사 Actor를 기록한다.
    const result = await client.attributeDefinition.updateMany({
      where: {
        workspaceId: input.workspaceId,
        objectDefinitionId: input.objectDefinitionId,
        sortOrder: {
          gte: input.fromSortOrder,
        },
      },
      data: {
        sortOrder: {
          increment: 1,
        },
        updatedByActorId: input.updatedByActorId,
      },
    });

    // 3. 관측 로그에서 사용할 변경 row 수를 반환한다.
    return result.count;
  }

  // 기능 : ObjectDefinition에 AttributeDefinition row를 생성합니다.
  async createAttributeDefinition(
    input: CreateAttributeDefinitionInput
  ): Promise<CreateAttributeDefinitionResult> {
    try {
      // 1. 현재 transaction context에 맞는 Prisma client를 준비한다.
      const client = resolvePrismaTransactionalClient(
        this.prismaService,
        input.transactionContext
      );

      // 2. AttributeDefinition row를 생성하고 생성된 ID만 조회한다.
      const attributeDefinition =
        await client.attributeDefinition.create({
          data: {
            workspaceId: input.workspaceId,
            objectDefinitionId: input.objectDefinitionId,
            createdByActorId: input.createdByActorId,
            apiSlug: input.apiSlug,
            title: input.title,
            sortOrder: input.sortOrder,
            type: input.type,
            configJson: this.toPrismaNullableJson(input.config),
            icon: input.icon,
            isMultiselect: input.isMultiselect,
            description: input.description,
          },
          select: {
            id: true,
          },
        });

      // 3. 생성 결과를 application 계층 응답 계약으로 반환한다.
      return {
        id: attributeDefinition.id,
      };
    } catch (error) {
      // 4. 동시 요청 등으로 DB unique 제약에 걸리면 domain conflict로 변환한다.
      if (this.isUniqueConstraintError(error)) {
        throw new AttributeDefinitionApiSlugAlreadyExistsError();
      }

      throw error;
    }
  }

  // 기능 : 수정 대상 AttributeDefinition이 요청 Workspace/ObjectDefinition 경계 안에 있는지 조회합니다.
  async findAttributeDefinitionForUpdate(
    input: AttributeDefinitionWorkspaceObjectLookupInput
  ): Promise<AttributeDefinitionForUpdate | null> {
    // 1. Workspace/ObjectDefinition/AttributeDefinition 경계 기준으로 수정 대상을 조회한다.
    const attributeDefinition =
      await this.prismaService.attributeDefinition.findFirst({
        where: {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          id: input.attributeDefinitionId,
        },
        select: {
          id: true,
          apiSlug: true,
        },
      });

    // 2. 조회 결과를 application 계층 수정 기준 정보로 반환한다.
    return attributeDefinition;
  }

  // 기능 : AttributeDefinition row를 Workspace/ObjectDefinition 경계 안에서 부분 수정합니다.
  async updateAttributeDefinition(
    input: UpdateAttributeDefinitionInput
  ): Promise<UpdateAttributeDefinitionResult> {
    try {
      // 1. 포함된 patch 필드만 Prisma update data에 담는다.
      const data: Prisma.AttributeDefinitionUncheckedUpdateManyInput = {
        updatedByActorId: input.updatedByActorId,
        ...(input.patch.title !== undefined ? { title: input.patch.title } : {}),
        ...(input.patch.apiSlug !== undefined
          ? { apiSlug: input.patch.apiSlug }
          : {}),
        ...(input.patch.description !== undefined
          ? { description: input.patch.description }
          : {}),
        ...(input.patch.icon !== undefined ? { icon: input.patch.icon } : {}),
        ...(input.patch.isMultiselect !== undefined
          ? { isMultiselect: input.patch.isMultiselect }
          : {}),
      };

      // 2. Workspace/ObjectDefinition/AttributeDefinition 경계를 모두 걸어 row를 수정한다.
      const result = await this.prismaService.attributeDefinition.updateMany({
        where: {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          id: input.attributeDefinitionId,
        },
        data,
      });

      // 3. 경계 조건에 맞는 row가 사라졌으면 not found로 변환한다.
      if (result.count === 0) {
        throw new AttributeDefinitionNotFoundError();
      }

      // 4. API 응답에 필요한 AttributeDefinition ID를 반환한다.
      return {
        id: input.attributeDefinitionId,
      };
    } catch (error) {
      // 5. 동시 요청 등으로 DB unique 제약에 걸리면 domain conflict로 변환한다.
      if (this.isUniqueConstraintError(error)) {
        throw new AttributeDefinitionApiSlugAlreadyExistsError();
      }

      throw error;
    }
  }

  // 기능 : Prisma unique constraint 오류인지 판별합니다.
  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  // 기능 : application의 config 값을 Prisma nullable JSON 입력값으로 변환합니다.
  private toPrismaNullableJson(
    value: unknown | null
  ): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
    if (value === null) {
      return Prisma.DbNull;
    }

    return value as Prisma.InputJsonValue;
  }
}
