import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ObjectDefinitionModule } from "@/modules/object-definition/infrastructure/object-definition.module";
import { RECORD_DEFINITION_LIST_QUERY } from "@/modules/record-definition/application/ports/record-definition-list-query.port";
import { ListWorkspaceObjectRecordDefinitionsUseCase } from "@/modules/record-definition/application/use-cases/list-workspace-object-record-definitions.use-case";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaRecordDefinitionListQueryRepository } from "./persistence/prisma-record-definition-list-query.repository";
import { UserWorkspaceObjectRecordDefinitionsController } from "../presentation/http/user-workspace-object-record-definitions.controller";

// 역할 : RecordDefinitionModule이 RecordDefinition API와 provider 의존성을 조립합니다.
@Module({
  imports: [
    AuthModule,
    WorkspaceModule,
    ObjectDefinitionModule,
    PrismaInfrastructureModule,
  ],
  controllers: [UserWorkspaceObjectRecordDefinitionsController],
  providers: [
    ListWorkspaceObjectRecordDefinitionsUseCase,
    {
      provide: RECORD_DEFINITION_LIST_QUERY,
      // 기능 : Prisma 서비스로 RecordDefinition 목록 조회 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaRecordDefinitionListQueryRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class RecordDefinitionModule {}
