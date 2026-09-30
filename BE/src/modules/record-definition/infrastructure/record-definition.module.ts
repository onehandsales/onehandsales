import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ObjectDefinitionModule } from "@/modules/object-definition/infrastructure/object-definition.module";
import { RECORD_DEFINITION_COMMAND_REPOSITORY } from "@/modules/record-definition/application/ports/record-definition-command.repository";
import { RECORD_DEFINITION_LIST_QUERY } from "@/modules/record-definition/application/ports/record-definition-list-query.port";
import { CreateWorkspaceObjectRecordDefinitionUseCase } from "@/modules/record-definition/application/use-cases/create-workspace-object-record-definition.use-case";
import { ListWorkspaceObjectRecordDefinitionsUseCase } from "@/modules/record-definition/application/use-cases/list-workspace-object-record-definitions.use-case";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaRecordDefinitionCommandRepository } from "./persistence/prisma-record-definition-command.repository";
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
    CreateWorkspaceObjectRecordDefinitionUseCase,
    ListWorkspaceObjectRecordDefinitionsUseCase,
    AppLogger,
    {
      provide: APPLICATION_LOGGER,
      useExisting: AppLogger,
    },
    {
      provide: RECORD_DEFINITION_COMMAND_REPOSITORY,
      // 기능 : Prisma 서비스로 RecordDefinition 쓰기 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaRecordDefinitionCommandRepository(prismaService),
      inject: [PrismaService],
    },
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
