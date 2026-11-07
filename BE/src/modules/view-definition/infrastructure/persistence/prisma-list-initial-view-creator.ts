import { Inject, Injectable } from "@nestjs/common";
import type { CreateListInitialViewInput, ListInitialViewCreator } from "../../application/ports/list-initial-view-creator.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";

// 역할 : List 첫 보기와 표시·그룹 설정을 View 소유 테이블에 저장합니다.
@Injectable()
export class PrismaListInitialViewCreator implements ListInitialViewCreator {
  // 기능 : View 저장에 사용할 Prisma 서비스를 주입받습니다.
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // 기능 : List 생성의 transaction에 참여해 완성된 첫 보기를 저장합니다.
  async create(input: CreateListInitialViewInput, context: TransactionContext): Promise<{ id: string }> {
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    const audit = { workspaceId: input.workspaceId, createdByActorId: input.createdByActorId };
    // 1. List만 소유자로 지정하고 타입별 초기 표시 설정을 저장한다.
    const view = await client.viewDefinition.create({
      data: { ...audit, listDefinitionId: input.listDefinitionId, objectDefinitionId: null,
        name: input.name, type: input.type, sortOrder: 0,
        configJson: input.type === "KANBAN" ? { cardDensity: "COMFORTABLE", showEmptyGroups: true }
          : { rowDensity: "COMFORTABLE" } },
      select: { id: true },
    });
    // 2. 원본 Record의 제목을 그대로 읽으며 레코드나 값을 복제하지 않는다.
    const binding = { ...audit, viewDefinitionId: view.id, referenceAttributeIdPathJson: [], isHidden: false };
    await client.viewAttributeSettingDefinition.create({
      data: { ...binding, attributeDefinitionId: input.titleAttributeDefinitionId,
        sourceScope: "RECORD", attributeDisplayRole: "TITLE", sortOrder: 0 },
    });
    // 3. 보드는 상태의 실제 소유 범위에 맞는 그룹과 카드 표시를 저장한다.
    if (input.group) {
      await client.viewGroupDefinition.create({
        data: { ...audit, viewDefinitionId: view.id, ...input.group, referenceAttributeIdPathJson: [],
          groupRole: "GROUP", sortDirection: "ASC", sortOrder: 0 },
      });
      if (input.group.attributeDefinitionId !== input.titleAttributeDefinitionId) {
        await client.viewAttributeSettingDefinition.create({
          data: { ...binding, ...input.group, attributeDisplayRole: "DISPLAY", sortOrder: 1 },
        });
      }
    }
    return view;
  }
}
