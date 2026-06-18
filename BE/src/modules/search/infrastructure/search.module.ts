import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { SEARCH_REPOSITORY } from "../application/ports/search.repository";
import { SearchApplicationService } from "../application/services/search-application.service";
import { SearchController } from "../presentation/http/search.controller";
import { PrismaSearchRepository } from "./persistence/prisma-search.repository";

// 역할 : SearchModule 통합검색 모듈의 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [SearchController],
  providers: [
    SearchApplicationService,
    AppLogger,
    {
      provide: SEARCH_REPOSITORY,
      // 기능 : Prisma 서비스로 통합검색 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaSearchRepository(prismaService),
      inject: [PrismaService],
    },
  ],
})
export class SearchModule {}
