import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { lockSidebarOrder } from "@/shared/infrastructure/prisma/lock-sidebar-order";
import type { CreateListDefinitionInput, ListDefinitionCommandRepository } from "../../application/ports/list-definition-command.repository";
import { ListDefinitionApiSlugAlreadyExistsError } from "../../domain/list-definition.errors";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : List 원장 생성과 기존 unique 충돌 변환만 담당합니다.
@Injectable()
export class PrismaListDefinitionCommandRepository implements ListDefinitionCommandRepository {
  // 기능 : 목록 소유 저장소에서 사용할 Prisma 서비스를 주입받습니다.
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // 기능 : application이 생성 순서를 결정할 수 있도록 잠금 안의 마지막 값을 반환합니다.
  async lockAndGetLastSortOrder(workspaceId: string, context: TransactionContext): Promise<number | null> {
    // 1. application의 transaction에서 생성·재정렬이 공유하는 잠금을 얻는다.
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    await lockSidebarOrder(client, `onehandsales:sidebar:lists:${workspaceId}`);
    // 2. 잠금 획득 후 현재 마지막 값만 반환하고 다음 순서는 application이 결정한다.
    const last = await client.listDefinition.aggregate({ where: { workspaceId }, _max: { sortOrder: true } });
    return last._max.sortOrder;
  }

  // 기능 : 상위 application의 transaction에 참여하여 List를 저장합니다.
  async create(input: CreateListDefinitionInput, context: TransactionContext): Promise<{ id: string }> {
    // 1. 초기 보기·속성과 같은 client로 목록 원장을 저장한다.
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    try {
      return await client.listDefinition.create({
        data: { ...input, apiSlug: input.name }, select: { id: true },
      });
    } catch (error) {
      // 2. 목록 이름의 동시 중복만 conflict로 바꾸고 다른 저장 오류는 전파한다.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ListDefinitionApiSlugAlreadyExistsError();
      }
      throw error;
    }
  }
}
