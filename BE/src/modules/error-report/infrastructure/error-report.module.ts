import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ERROR_REPORT_REPOSITORY } from "@/modules/error-report/application/ports/error-report.repository";
import { ERROR_REPORT_SCREENSHOT_STORAGE } from "@/modules/error-report/application/ports/error-report-screenshot-storage.port";
import { ErrorReportApplicationService } from "@/modules/error-report/application/services/error-report-application.service";
import { ErrorReportController } from "@/modules/error-report/presentation/http/error-report.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaErrorReportRepository } from "./persistence/prisma-error-report.repository";
import { SupabaseErrorReportScreenshotStorage } from "./storage/supabase-error-report-screenshot.storage";

// 역할 : ErrorReportModule 에러 신고 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [ErrorReportController],
  providers: [
    ErrorReportApplicationService,
    AppLogger,
    {
      provide: ERROR_REPORT_REPOSITORY,
      // 기능 : Prisma 서비스로 에러 신고 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaErrorReportRepository(prismaService),
      inject: [PrismaService],
    },
    {
      provide: ERROR_REPORT_SCREENSHOT_STORAGE,
      // 기능 : ConfigService와 logger로 Supabase screenshot 저장소 구현체를 생성합니다.
      useFactory: (configService: ConfigService, logger: AppLogger) =>
        new SupabaseErrorReportScreenshotStorage(configService, logger),
      inject: [ConfigService, AppLogger],
    },
  ],
})
export class ErrorReportModule {}
