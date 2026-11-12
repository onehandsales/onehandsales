import { Prisma } from "@prisma/client";
import { lockSidebarOrder } from "@/shared/infrastructure/prisma/lock-sidebar-order";
import type {
  CreateObjectDefinitionInput,
  CreateObjectDefinitionResult,
  ObjectDefinitionApiSlugLookupInput,
  ObjectDefinitionCommandRepository,
} from "@/modules/object-definition/application/ports/object-definition-command.repository";
import { ObjectDefinitionApiSlugAlreadyExistsError } from "@/modules/object-definition/domain/object-definition.errors";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : PrismaObjectDefinitionCommandRepository가 ObjectDefinition 쓰기 저장소 계약을 Prisma로 구현합니다.
export class PrismaObjectDefinitionCommandRepository
  implements ObjectDefinitionCommandRepository
{
  // 기능 : PrismaService를 주입받아 ObjectDefinition 쓰기 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 생성 transaction 안에서 대표 이름 포인터를 저장합니다.
  async setRecordTitle(workspaceId: string, objectId: string, attributeId: string, context: TransactionContext): Promise<void> {
    // 1. 호출자는 같은 transaction에서 소유 모듈이 생성한 속성 ID만 전달한다.
    const client = resolvePrismaTransactionalClient(this.prismaService, context);
    await client.objectDefinition.update({ where: { id: objectId, workspaceId }, data: { recordTitleAttributeDefinitionId: attributeId } });
  }

  // 기능 : application이 생성 순서를 결정할 수 있도록 잠금 안의 마지막 값을 반환합니다.
  async lockAndGetLastSortOrder(workspaceId: string, context: TransactionContext): Promise<number | null> {
    // 1. application의 transaction에서 생성·재정렬이 공유하는 잠금을 얻는다.
    const client = resolvePrismaTransactionalClient(this.prismaService, context);
    await lockSidebarOrder(client, `onehandsales:sidebar:objects:${workspaceId}`);
    // 2. 잠금 획득 후 현재 마지막 값만 반환하고 다음 순서는 application이 결정한다.
    const last = await client.objectDefinition.aggregate({ where: { workspaceId }, _max: { sortOrder: true } });
    return last._max.sortOrder;
  }

  // 기능 : 같은 Workspace 안에 동일 apiSlug의 ObjectDefinition이 있는지 확인합니다.
  async hasObjectDefinitionApiSlug(
    input: ObjectDefinitionApiSlugLookupInput
  ): Promise<boolean> {
    // 1. Workspace 경계와 apiSlug 기준으로 기존 ObjectDefinition 존재 여부를 조회한다.
    const objectDefinition = await this.prismaService.objectDefinition.findFirst({
      where: {
        workspaceId: input.workspaceId,
        apiSlug: input.apiSlug,
      },
      select: {
        id: true,
      },
    });

    // 2. 조회 결과 존재 여부를 중복 여부로 반환한다.
    return objectDefinition !== null;
  }

  // 기능 : Workspace에 ObjectDefinition row를 생성합니다.
  async createObjectDefinition(
    input: CreateObjectDefinitionInput,
    context: TransactionContext
  ): Promise<CreateObjectDefinitionResult> {
    try {
      // 1. 초기 속성·View와 같은 transaction에서 ObjectDefinition을 생성한다.
      const client = resolvePrismaTransactionalClient(this.prismaService, context);
      const objectDefinition =
        await client.objectDefinition.create({
          data: {
            workspaceId: input.workspaceId,
            createdByActorId: input.createdByActorId,
            apiSlug: input.apiSlug,
            singularName: input.singularName,
            pluralName: input.pluralName,
            icon: input.icon,
            description: input.description,
            sortOrder: input.sortOrder,
          },
          select: {
            id: true,
          },
        });

      // 2. 생성 결과를 application 계층 응답 계약으로 반환한다.
      return {
        id: objectDefinition.id,
      };
    } catch (error) {
      // 3. 동시 요청 등으로 DB unique 제약에 걸리면 domain conflict로 변환한다.
      if (this.isUniqueConstraintError(error)) {
        throw new ObjectDefinitionApiSlugAlreadyExistsError();
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
}
