import { Module } from "@nestjs/common";
import { OBJECT_TABLE_VIEW_CREATOR } from "@/modules/view-definition/application/ports/object-table-view-creator.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaObjectTableViewCreator } from "./persistence/prisma-object-table-view-creator";

// 역할 : 전체 View 조회 모듈과 독립적으로 첫 TABLE 생성 포트만 공개합니다.
@Module({
  imports: [PrismaInfrastructureModule],
  providers: [{ provide: OBJECT_TABLE_VIEW_CREATOR, useClass: PrismaObjectTableViewCreator }],
  exports: [OBJECT_TABLE_VIEW_CREATOR],
})
export class ObjectTableViewModule {}
