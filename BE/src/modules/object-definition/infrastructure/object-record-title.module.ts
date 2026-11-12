import { Module } from "@nestjs/common";
import { OBJECT_RECORD_TITLE_QUERY } from "../application/ports/object-record-title-query.port";
import { OBJECT_RECORD_TITLE_REPOSITORY } from "../application/ports/object-record-title.repository";
import { ObjectRecordTitleReader } from "../application/object-record-title-reader";
import { AttributeMetadataModule } from "@/modules/attribute-definition/infrastructure/attribute-metadata.module";
import { PrismaObjectRecordTitleQueryRepository } from "./persistence/prisma-object-record-title-query.repository";
// 역할 : 대표 이름 읽기를 순환 의존 없이 다른 모듈에 공개합니다.
@Module({
  imports: [AttributeMetadataModule],
  providers: [
    { provide: OBJECT_RECORD_TITLE_REPOSITORY, useClass: PrismaObjectRecordTitleQueryRepository },
    { provide: OBJECT_RECORD_TITLE_QUERY, useClass: ObjectRecordTitleReader },
  ],
  exports: [OBJECT_RECORD_TITLE_QUERY],
})
export class ObjectRecordTitleModule {}
