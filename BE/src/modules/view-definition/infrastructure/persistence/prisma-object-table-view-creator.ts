import { Inject, Injectable } from "@nestjs/common";
import type {
  CreateObjectTableViewInput,
  ObjectTableViewCreator,
} from "@/modules/view-definition/application/ports/object-table-view-creator.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : 첫 TABLE과 표시 설정을 View 소유 테이블에 저장합니다.
@Injectable()
export class PrismaObjectTableViewCreator implements ObjectTableViewCreator {
  // 기능 : View 소유 모듈의 Prisma 서비스를 주입받습니다.
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // 기능 : 같은 transaction으로 TABLE과 초기 제목 열을 생성합니다.
  async create(input: CreateObjectTableViewInput, context: TransactionContext): Promise<{ id: string }> {
    // 1. 독립 transaction을 열지 않고 Object 생성의 transaction에 참여한다.
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    const audit = { workspaceId: input.workspaceId, createdByActorId: input.createdByActorId };
    // 2. Object에 소속된 첫 TABLE을 저장한다.
    const view = await client.viewDefinition.create({
      data: {
        ...audit,
        objectDefinitionId: input.objectDefinitionId,
        listDefinitionId: null,
        name: input.name,
        type: "TABLE",
        sortOrder: 0,
        configJson: { rowDensity: "COMFORTABLE" },
      },
      select: { id: true },
    });
    // 3. 초기 속성을 Record에서 직접 읽는 제목 열로 연결한다. 실패는 상위 transaction으로 전파한다.
    await client.viewAttributeSettingDefinition.create({
      data: {
        ...audit,
        viewDefinitionId: view.id,
        attributeDefinitionId: input.titleAttributeDefinitionId,
        sourceScope: "RECORD",
        referenceAttributeIdPathJson: [],
        attributeDisplayRole: "TITLE",
        sortOrder: 0,
        isHidden: false,
      },
      select: { id: true },
    });
    return view;
  }
}
