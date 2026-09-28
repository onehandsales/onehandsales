import type {
  ObjectDefinitionAccessQuery,
  ObjectDefinitionWorkspaceLookupInput,
} from "@/modules/object-definition/application/ports/object-definition-access-query.port";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaObjectDefinitionAccessQueryRepository가 ObjectDefinition 접근 확인 계약을 Prisma로 구현합니다.
export class PrismaObjectDefinitionAccessQueryRepository
  implements ObjectDefinitionAccessQuery
{
  // 기능 : PrismaService를 주입받아 ObjectDefinition 소속 확인에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 특정 ObjectDefinition이 요청 Workspace에 속하는지 확인합니다.
  async hasObjectDefinitionInWorkspace(
    input: ObjectDefinitionWorkspaceLookupInput
  ): Promise<boolean> {
    // 1. ObjectDefinition ID와 Workspace ID를 함께 사용해 Workspace 경계 안의 row를 조회한다.
    const objectDefinition =
      await this.prismaService.objectDefinition.findFirst({
        where: {
          id: input.objectDefinitionId,
          workspaceId: input.workspaceId,
        },
        select: {
          id: true,
        },
      });

    // 2. 조회 결과 존재 여부를 ObjectDefinition 접근 가능 여부로 반환한다.
    return objectDefinition !== null;
  }
}
