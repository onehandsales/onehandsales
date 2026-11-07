import { Module } from "@nestjs/common";
import { LIST_INITIAL_VIEW_CREATOR } from "../application/ports/list-initial-view-creator.port";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaListInitialViewCreator } from "./persistence/prisma-list-initial-view-creator";

// 역할 : List를 조회하는 전체 View 모듈과 독립적으로 초기 보기 생성만 공개합니다.
@Module({
  imports: [PrismaInfrastructureModule],
  providers: [{ provide: LIST_INITIAL_VIEW_CREATOR, useClass: PrismaListInitialViewCreator }],
  exports: [LIST_INITIAL_VIEW_CREATOR],
})
export class ListInitialViewModule {}
