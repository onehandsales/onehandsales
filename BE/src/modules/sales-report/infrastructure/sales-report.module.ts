import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { ScheduleModule } from "@/modules/schedule/infrastructure/schedule.module";
import { AI_WEEKLY_SALES_REPORT_PROVIDER } from "@/modules/sales-report/application/ports/ai-weekly-sales-report.provider";
import { AI_WEEKLY_SALES_REPORT_REPOSITORY } from "@/modules/sales-report/application/ports/ai-weekly-sales-report.repository";
import { AiWeeklySalesReportApplicationService } from "@/modules/sales-report/application/services/ai-weekly-sales-report-application.service";
import { ProcessAiWeeklySalesReportJobsUseCase } from "@/modules/sales-report/application/use-cases/process-ai-weekly-sales-report-jobs.use-case";
import { AiWeeklySalesReportController } from "@/modules/sales-report/presentation/http/ai-weekly-sales-report.controller";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaAiWeeklySalesReportRepository } from "./persistence/prisma-ai-weekly-sales-report.repository";
import { AiWeeklySalesReportProcessorRunner } from "./processor/ai-weekly-sales-report-processor.runner";
import { DeterministicAiWeeklySalesReportProvider } from "./providers/deterministic-ai-weekly-sales-report.provider";
import { OpenAiWeeklySalesReportProvider } from "./providers/openai-ai-weekly-sales-report.provider";

@Module({
  imports: [AuthModule, ConfigModule, PrismaInfrastructureModule, ScheduleModule],
  controllers: [AiWeeklySalesReportController],
  providers: [
    AiWeeklySalesReportApplicationService,
    ProcessAiWeeklySalesReportJobsUseCase,
    AiWeeklySalesReportProcessorRunner,
    DeterministicAiWeeklySalesReportProvider,
    OpenAiWeeklySalesReportProvider,
    AppLogger,
    {
      provide: AI_WEEKLY_SALES_REPORT_REPOSITORY,
      useFactory: (prismaService: PrismaService) =>
        new PrismaAiWeeklySalesReportRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: AI_WEEKLY_SALES_REPORT_PROVIDER,
      useFactory: (
        configService: ConfigService,
        openAiProvider: OpenAiWeeklySalesReportProvider,
        deterministicProvider: DeterministicAiWeeklySalesReportProvider
      ) => {
        const provider = configService
          .get<string>("AI_WEEKLY_REPORT_PROVIDER")
          ?.trim()
          .toLowerCase();

        return provider === "deterministic"
          ? deterministicProvider
          : openAiProvider;
      },
      inject: [
        ConfigService,
        OpenAiWeeklySalesReportProvider,
        DeterministicAiWeeklySalesReportProvider,
      ],
    },
  ],
  exports: [
    AiWeeklySalesReportApplicationService,
    ProcessAiWeeklySalesReportJobsUseCase,
    AI_WEEKLY_SALES_REPORT_REPOSITORY,
  ],
})
export class SalesReportModule {}
