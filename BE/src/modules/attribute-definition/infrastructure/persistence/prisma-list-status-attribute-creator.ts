import { Inject, Injectable } from "@nestjs/common";
import type { CreateListStatusAttributeInput, ListStatusAttributeCreator } from "../../application/ports/list-status-attribute-creator.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : 목록 전용 상태 속성과 단계 옵션을 Attribute 소유 영역에 저장합니다.
@Injectable()
export class PrismaListStatusAttributeCreator implements ListStatusAttributeCreator {
  // 기능 : 속성 저장에 사용할 Prisma 서비스를 주입받습니다.
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // 기능 : 독립 transaction 없이 전달받은 context로 상태와 옵션을 함께 저장합니다.
  async create(input: CreateListStatusAttributeInput, context: TransactionContext): Promise<{ id: string }> {
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    const audit = { workspaceId: input.workspaceId, createdByActorId: input.createdByActorId };
    // 1. 새 List 소속의 단일 상태 속성을 생성한다.
    const attribute = await client.attributeDefinition.create({
      data: { ...audit, listDefinitionId: input.listDefinitionId, objectDefinitionId: null,
        apiSlug: "status", title: input.title, type: "Status", isMultiselect: false, sortOrder: 0 },
      select: { id: true },
    });
    // 2. 사용자 입력 순서로 단계들을 저장하며 실패는 상위 transaction으로 전파한다.
    await client.statusOption.createMany({
      data: input.options.map((title, sortOrder) => ({
        ...audit, attributeDefinitionId: attribute.id, title, sortOrder, color: null,
      })),
    });
    return attribute;
  }
}
