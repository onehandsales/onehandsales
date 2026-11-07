import { Inject, Injectable } from "@nestjs/common";
import type {
  CreateObjectTextAttributeInput,
  ObjectTextAttributeCreator,
} from "@/modules/attribute-definition/application/ports/object-text-attribute-creator.port";
import type { TransactionContext } from "@/shared/application/ports/transaction-manager.port";
import { resolvePrismaTransactionalClient } from "@/shared/infrastructure/prisma/prisma-transaction-manager";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : 새 Object의 Text 속성 생성 포트를 Attribute 소유 테이블로 구현합니다.
@Injectable()
export class PrismaObjectTextAttributeCreator implements ObjectTextAttributeCreator {
  // 기능 : 소유 모듈의 Prisma 서비스를 주입받습니다.
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // 기능 : Object 생성과 같은 transaction에서 초기 텍스트 속성을 저장합니다.
  async create(input: CreateObjectTextAttributeInput, context: TransactionContext): Promise<{ id: string }> {
    // 1. 호출자가 전달한 transaction client로만 쓰기를 실행한다.
    const client = resolvePrismaTransactionalClient(this.prisma, context);
    // 2. 임의의 기본값이나 필수 입력 제약 없이 단일 Text 속성을 생성한다.
    return client.attributeDefinition.create({
      data: { ...input, type: "Text", listDefinitionId: null, sortOrder: 0, isMultiselect: false },
      select: { id: true },
    });
  }
}
