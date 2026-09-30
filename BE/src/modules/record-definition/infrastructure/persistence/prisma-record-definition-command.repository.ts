import type {
  CreateRecordDefinitionInput,
  CreateRecordDefinitionResult,
  RecordDefinitionCommandRepository,
} from "@/modules/record-definition/application/ports/record-definition-command.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaRecordDefinitionCommandRepository가 RecordDefinition 쓰기 저장소 계약을 Prisma로 구현합니다.
export class PrismaRecordDefinitionCommandRepository
  implements RecordDefinitionCommandRepository
{
  // 기능 : PrismaService를 주입받아 RecordDefinition 쓰기 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : ObjectDefinition에 빈 RecordDefinition row를 생성합니다.
  async createRecordDefinition(
    input: CreateRecordDefinitionInput
  ): Promise<CreateRecordDefinitionResult> {
    // 1. RecordDefinition row를 생성하고 생성된 ID만 조회한다.
    const recordDefinition =
      await this.prismaService.recordDefinition.create({
        data: {
          workspaceId: input.workspaceId,
          objectDefinitionId: input.objectDefinitionId,
          createdByActorId: input.createdByActorId,
        },
        select: {
          id: true,
        },
      });

    // 2. 생성 결과를 application 계층 응답 계약으로 반환한다.
    return {
      id: recordDefinition.id,
    };
  }
}
