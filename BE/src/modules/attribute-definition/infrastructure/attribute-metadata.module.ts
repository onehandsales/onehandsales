import { Module } from "@nestjs/common";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY } from "../application/ports/attribute-definition-metadata-query.port";
import { PrismaAttributeDefinitionMetadataQueryRepository } from "./persistence/prisma-attribute-definition-metadata-query.repository";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : 다른 도메인에 속성 메타데이터 읽기만 순환 의존 없이 공개합니다.
@Module({
  imports: [PrismaInfrastructureModule],
  providers: [{
    provide: ATTRIBUTE_DEFINITION_METADATA_QUERY,
    // 기능 : 속성 소유 모듈 안에서 공개 조회 port와 저장소를 조립합니다.
    useFactory: (prisma: PrismaService) => new PrismaAttributeDefinitionMetadataQueryRepository(prisma),
    inject: [PrismaService],
  }],
  exports: [ATTRIBUTE_DEFINITION_METADATA_QUERY],
})
export class AttributeMetadataModule {}
