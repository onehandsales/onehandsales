import { Module } from "@nestjs/common";
import { ATTRIBUTE_DEFINITION_LIST_QUERY } from "@/modules/attribute-definition/application/ports/attribute-definition-list-query.port";
import { ListWorkspaceObjectAttributeDefinitionsUseCase } from "@/modules/attribute-definition/application/use-cases/list-workspace-object-attribute-definitions.use-case";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ObjectDefinitionModule } from "@/modules/object-definition/infrastructure/object-definition.module";
import { WorkspaceModule } from "@/modules/workspace/infrastructure/workspace.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAttributeDefinitionListQueryRepository } from "./persistence/prisma-attribute-definition-list-query.repository";
import { UserWorkspaceObjectAttributeDefinitionsController } from "../presentation/http/user-workspace-object-attribute-definitions.controller";

// 역할 : AttributeDefinitionModule이 AttributeDefinition API와 provider 의존성을 조립합니다.
@Module({
  imports: [
    AuthModule,
    WorkspaceModule,
    ObjectDefinitionModule,
    PrismaInfrastructureModule,
  ],
  controllers: [UserWorkspaceObjectAttributeDefinitionsController],
  providers: [
    ListWorkspaceObjectAttributeDefinitionsUseCase,
    {
      provide: ATTRIBUTE_DEFINITION_LIST_QUERY,
      // 기능 : Prisma 서비스로 AttributeDefinition 목록 조회 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAttributeDefinitionListQueryRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class AttributeDefinitionModule {}
