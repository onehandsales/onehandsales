import { Module } from "@nestjs/common";
import { RECORD_ATTRIBUTE_SCHEMA_QUERY } from "../application/ports/record-attribute-schema-query.port";
import { PrismaRecordAttributeSchemaQueryRepository } from "./persistence/prisma-record-attribute-schema-query.repository";
import { ATTRIBUTE_DEFINITION_METADATA_QUERY } from "../application/ports/attribute-definition-metadata-query.port";
import { PrismaAttributeDefinitionMetadataQueryRepository } from "./persistence/prisma-attribute-definition-metadata-query.repository";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : 전체 Attribute API 모듈과 순환 의존 없이 입력 검증용 공개 port만 조립합니다.
@Module({ imports: [PrismaInfrastructureModule], providers: [
  { provide: RECORD_ATTRIBUTE_SCHEMA_QUERY, useClass: PrismaRecordAttributeSchemaQueryRepository },
  { provide: ATTRIBUTE_DEFINITION_METADATA_QUERY, useFactory: (prisma: PrismaService) => new PrismaAttributeDefinitionMetadataQueryRepository(prisma), inject: [PrismaService] },
], exports: [RECORD_ATTRIBUTE_SCHEMA_QUERY, ATTRIBUTE_DEFINITION_METADATA_QUERY] })
export class RecordAttributeSchemaModule {}
