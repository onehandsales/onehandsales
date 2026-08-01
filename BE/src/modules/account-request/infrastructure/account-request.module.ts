import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { ACCOUNT_REQUEST_REPOSITORY } from "../application/ports/account-request.repository";
import { AccountRequestApplicationService } from "../application/services/account-request-application.service";
import { AccountRequestController } from "../presentation/http/account-request.controller";
import { PrismaAccountRequestRepository } from "./persistence/prisma-account-request.repository";

// 역할 : AccountRequestModule 사용자 데이터 export와 계정 삭제 요청 API 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [AccountRequestController],
  providers: [
    AccountRequestApplicationService,
    {
      provide: ACCOUNT_REQUEST_REPOSITORY,
      // 기능 : Prisma 서비스로 transaction 가능한 계정 데이터 요청 저장소를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaAccountRequestRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
  ],
})
export class AccountRequestModule {}
