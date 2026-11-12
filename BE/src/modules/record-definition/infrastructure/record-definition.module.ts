import { Module } from "@nestjs/common";
import { ObjectRecordTitleModule } from "@/modules/object-definition/infrastructure/object-record-title.module";
import { RECORD_OPTIONS_QUERY } from "../application/ports/record-options-query.port";
import { PrismaRecordOptionsQueryRepository } from "./persistence/prisma-record-options-query.repository";
import { GetRecordFormUseCase } from "../application/use-cases/get-record-form.use-case";
import { UserWorkspaceRecordFormController } from "../presentation/http/user-workspace-record-form.controller";
import { RecordAttributeSchemaModule } from "@/modules/attribute-definition/infrastructure/record-attribute-schema.module";
import { RecordWriteService } from "../application/record-write.service";
import { RECORD_WRITE_REPOSITORY } from "../application/ports/record-write.repository";
import { PrismaRecordWriteRepository } from "./persistence/prisma-record-write.repository";
import { RECORD_DATA_QUERY } from "../application/ports/record-data-query.port";
import { PrismaRecordDataQueryRepository } from "./persistence/prisma-record-data-query.repository";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ObjectDefinitionModule } from "@/modules/object-definition/infrastructure/object-definition.module";
import { RECORD_ATTRIBUTE_VALUE_DEFINITION_MATERIALIZER } from "@/modules/record-definition/application/ports/record-attribute-value-definition-materializer.port";
import { RECORD_DEFINITION_COMMAND_REPOSITORY } from "@/modules/record-definition/application/ports/record-definition-command.repository";
import { RECORD_DEFINITION_LIST_QUERY } from "@/modules/record-definition/application/ports/record-definition-list-query.port";
import { CreateWorkspaceObjectRecordDefinitionUseCase } from "@/modules/record-definition/application/use-cases/create-workspace-object-record-definition.use-case";
import { ListWorkspaceObjectRecordDefinitionsUseCase } from "@/modules/record-definition/application/use-cases/list-workspace-object-record-definitions.use-case";
import { UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase } from "@/modules/record-definition/application/use-cases/update-workspace-object-record-attribute-value-definition.use-case";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { APPLICATION_LOGGER } from "@/shared/application/ports/application-logger.port";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaRecordAttributeValueDefinitionMaterializer } from "./persistence/prisma-record-attribute-value-definition-materializer";
import { PrismaRecordDefinitionCommandRepository } from "./persistence/prisma-record-definition-command.repository";
import { PrismaRecordDefinitionListQueryRepository } from "./persistence/prisma-record-definition-list-query.repository";
import { UserWorkspaceObjectRecordDefinitionsController } from "../presentation/http/user-workspace-object-record-definitions.controller";

// 역할 : RecordDefinitionModule이 RecordDefinition API와 provider 의존성을 조립합니다.
@Module({
  imports: [
    RecordAttributeSchemaModule,
    ObjectRecordTitleModule,
    AuthModule,
    WorkspaceModule,
    ObjectDefinitionModule,
    PrismaInfrastructureModule,
  ],
  controllers: [UserWorkspaceObjectRecordDefinitionsController, UserWorkspaceRecordFormController],
  providers: [
    RecordWriteService,
    GetRecordFormUseCase,
    { provide: RECORD_OPTIONS_QUERY, useClass: PrismaRecordOptionsQueryRepository },
    { provide: RECORD_WRITE_REPOSITORY, useFactory: (prisma: PrismaService) => new PrismaRecordWriteRepository(prisma), inject: [PrismaService] },
    {
      provide: RECORD_DATA_QUERY,
      // 기능 : Record 소유 조회 구현체를 공개 batch Port에 연결합니다.
      useFactory: (prisma: PrismaService) => new PrismaRecordDataQueryRepository(prisma),
      inject: [PrismaService],
    },
    CreateWorkspaceObjectRecordDefinitionUseCase,
    ListWorkspaceObjectRecordDefinitionsUseCase,
    UpdateWorkspaceObjectRecordAttributeValueDefinitionUseCase,
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
      provide: RECORD_ATTRIBUTE_VALUE_DEFINITION_MATERIALIZER,
      // 기능 : Prisma 서비스로 RecordAttributeValueDefinition materializer 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaRecordAttributeValueDefinitionMaterializer(prismaService),
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
  exports: [RECORD_ATTRIBUTE_VALUE_DEFINITION_MATERIALIZER, RECORD_DATA_QUERY, RECORD_OPTIONS_QUERY],
})
export class RecordDefinitionModule {}
