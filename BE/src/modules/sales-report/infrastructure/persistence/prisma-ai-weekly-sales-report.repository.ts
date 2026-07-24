import {
  AiJobStatus as PrismaAiJobStatus,
  AiProviderCallStatus as PrismaAiProviderCallStatus,
  AiProviderOperation as PrismaAiProviderOperation,
  AiSuggestionPriority as PrismaAiSuggestionPriority,
  AiWeeklySalesReportStatus as PrismaAiWeeklySalesReportStatus,
  AiWeeklySalesReportSuggestionType as PrismaAiWeeklySalesReportSuggestionType,
  Prisma,
} from "@prisma/client";
import {
  AiWeeklySalesReportAlreadyGeneratingError,
} from "@/modules/sales-report/domain/ai-weekly-sales-report.errors";
import type {
  AiJobRecord,
  AiProviderCallLogRecord,
  AiWeeklySalesReportRecord,
  AiWeeklySalesReportRepository,
  AiWeeklySnapshotCompanyRecord,
  AiWeeklySnapshotContactRecord,
  AiWeeklySnapshotDealRecord,
  AiWeeklySnapshotMeetingNoteRecord,
  AiWeeklySnapshotProductRecord,
  CompleteReportGenerationInput,
  CreateGeneratingReportInput,
  CreateGeneratingReportResult,
  CreateProviderCallLogInput,
  FailReportGenerationInput,
  WeeklyReportJobWorkItem,
} from "@/modules/sales-report/application/ports/ai-weekly-sales-report.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type SalesReportPrismaClient = PrismaService | Prisma.TransactionClient;

const WEEKLY_REPORT_TARGET_TYPE = "AI_WEEKLY_SALES_REPORT";

const meetingNoteSnapshotInclude = {
  companies: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
  contacts: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
  products: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
  deals: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.MeetingNoteInclude;

type AiWeeklySalesReportRow = Prisma.AiWeeklySalesReportGetPayload<object>;
type AiJobRow = Prisma.AiJobGetPayload<object>;
type AiProviderCallLogRow = Prisma.AiProviderCallLogGetPayload<object>;
type MeetingNoteSnapshotRow = Prisma.MeetingNoteGetPayload<{
  include: typeof meetingNoteSnapshotInclude;
}>;

type DealSnapshotRow = {
  readonly id: string;
  readonly dealName: string;
  readonly dealStatus: string;
  readonly dealCost: number;
  readonly expectedEndDate: Date;
  readonly dealCompanies: readonly {
    readonly company: {
      readonly id: string;
      readonly companyName: string;
      readonly companyField: { readonly field: string };
      readonly companyRegion: { readonly region: string };
    };
  }[];
  readonly dealContacts: readonly {
    readonly contact: {
      readonly id: string;
      readonly companyId: string;
      readonly username: string;
      readonly email: string;
      readonly mobile: string;
      readonly company: { readonly companyName: string };
      readonly contactDepartment: { readonly departmentName: string };
      readonly contactJobGrade: { readonly jobGradeName: string };
    };
  }[];
  readonly dealProducts: readonly {
    readonly product: {
      readonly id: string;
      readonly productName: string;
      readonly productPrice: number;
      readonly productCategory: { readonly categoryName: string };
      readonly productStatus: { readonly statusName: string };
    };
  }[];
  readonly followingActionLogs: readonly {
    readonly id: string;
    readonly followingAction: string;
    readonly checkComplete: boolean;
    readonly createdAt: Date;
  }[];
  readonly _count: {
    readonly followingActionLogs: number;
  };
};

export class PrismaAiWeeklySalesReportRepository
  implements AiWeeklySalesReportRepository
{
  constructor(
    private readonly client: SalesReportPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  async runInTransaction<T>(
    work: (repository: AiWeeklySalesReportRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) =>
      work(new PrismaAiWeeklySalesReportRepository(transaction, null))
    );
  }

  async findUserPreferences(userId: string) {
    const user = await this.client.user.findUnique({
      where: { id: userId },
      select: {
        timeZone: true,
        preferredLocale: true,
      },
    });

    return user
      ? {
          timeZone: user.timeZone,
          preferredLocale: user.preferredLocale,
        }
      : null;
  }

  async findGenerationRequestByIdempotencyKey(
    userId: string,
    idempotencyKey: string
  ): Promise<CreateGeneratingReportResult | null> {
    const job = await this.client.aiJob.findFirst({
      where: {
        userId,
        operation: PrismaAiProviderOperation.WEEKLY_SALES_REPORT,
        targetType: WEEKLY_REPORT_TARGET_TYPE,
        idempotencyKey,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    if (!job) {
      return null;
    }

    const report = await this.client.aiWeeklySalesReport.findFirst({
      where: {
        id: job.targetId,
        userId,
      },
    });

    return report
      ? {
          report: this.mapReport(report),
          job: this.mapJob(job),
        }
      : null;
  }

  async findGeneratingReport(
    userId: string,
    weekStart: Date,
    timeZone: string
  ): Promise<AiWeeklySalesReportRecord | null> {
    const report = await this.client.aiWeeklySalesReport.findFirst({
      where: {
        userId,
        weekStart,
        timeZone,
        status: PrismaAiWeeklySalesReportStatus.GENERATING,
      },
      orderBy: [{ version: "desc" }, { id: "desc" }],
    });

    return report ? this.mapReport(report) : null;
  }

  async createGeneratingReportWithJob(
    input: CreateGeneratingReportInput
  ): Promise<CreateGeneratingReportResult> {
    try {
      return await this.runInTransaction(async (repository) => {
        const existing = await repository.findGeneratingReport(
          input.userId,
          input.weekStart,
          input.timeZone
        );

        if (existing) {
          throw new AiWeeklySalesReportAlreadyGeneratingError();
        }

        if (!(repository instanceof PrismaAiWeeklySalesReportRepository)) {
          throw new Error("Unsupported sales report repository transaction");
        }

        return repository.createGeneratingReportWithJobInsideTransaction(input);
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new AiWeeklySalesReportAlreadyGeneratingError();
      }

      throw error;
    }
  }

  async listReportsForWeek(input: {
    readonly userId: string;
    readonly weekStart: Date;
    readonly timeZone: string;
  }): Promise<AiWeeklySalesReportRecord[]> {
    const reports = await this.client.aiWeeklySalesReport.findMany({
      where: {
        userId: input.userId,
        weekStart: input.weekStart,
        timeZone: input.timeZone,
      },
      orderBy: [{ version: "desc" }, { id: "desc" }],
    });

    return reports.map((report) => this.mapReport(report));
  }

  async findReportById(
    userId: string,
    reportId: string
  ): Promise<AiWeeklySalesReportRecord | null> {
    const report = await this.client.aiWeeklySalesReport.findFirst({
      where: {
        id: reportId,
        userId,
      },
    });

    return report ? this.mapReport(report) : null;
  }

  async listMeetingNotesForSnapshot(input: {
    readonly userId: string;
    readonly rangeStartAt: Date;
    readonly rangeEndAt: Date;
    readonly limit: number;
  }): Promise<AiWeeklySnapshotMeetingNoteRecord[]> {
    const meetingNotes = await this.client.meetingNote.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        meetingAt: {
          gte: input.rangeStartAt,
          lt: input.rangeEndAt,
        },
      },
      include: meetingNoteSnapshotInclude,
      orderBy: [{ meetingAt: "asc" }, { id: "asc" }],
      take: input.limit,
    });

    return meetingNotes.map((meetingNote) =>
      this.mapMeetingNoteSnapshot(meetingNote)
    );
  }

  async listDealsForSnapshot(input: {
    readonly userId: string;
    readonly weekStart: Date;
    readonly weekEnd: Date;
    readonly limit: number;
  }): Promise<AiWeeklySnapshotDealRecord[]> {
    const deals = await this.client.deal.findMany({
      where: {
        userId: input.userId,
        deletedAt: null,
        OR: [
          {
            dealStatus: {
              notIn: ["WON", "LOST"],
            },
          },
          {
            expectedEndDate: {
              gte: input.weekStart,
              lte: input.weekEnd,
            },
          },
        ],
      },
      select: this.createDealSnapshotSelect(input.userId),
      orderBy: [{ expectedEndDate: "asc" }, { updatedAt: "desc" }, { id: "asc" }],
      take: input.limit,
    });

    return deals.map((deal) =>
      this.mapDealSnapshot(deal as unknown as DealSnapshotRow)
    );
  }

  async listPendingWeeklyReportJobs(input: {
    readonly limit: number;
  }): Promise<AiJobRecord[]> {
    const jobs = await this.client.aiJob.findMany({
      where: {
        operation: PrismaAiProviderOperation.WEEKLY_SALES_REPORT,
        targetType: WEEKLY_REPORT_TARGET_TYPE,
        status: PrismaAiJobStatus.PENDING,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: input.limit,
    });

    return jobs.map((job) => this.mapJob(job));
  }

  async startWeeklyReportJob(
    jobId: string,
    startedAt: Date
  ): Promise<WeeklyReportJobWorkItem | null> {
    return this.runInTransaction(async (repository) => {
      if (!(repository instanceof PrismaAiWeeklySalesReportRepository)) {
        throw new Error("Unsupported sales report repository transaction");
      }

      const job = await repository.client.aiJob.findFirst({
        where: {
          id: jobId,
          operation: PrismaAiProviderOperation.WEEKLY_SALES_REPORT,
          targetType: WEEKLY_REPORT_TARGET_TYPE,
          status: PrismaAiJobStatus.PENDING,
        },
      });

      if (!job) {
        return null;
      }

      const updated = await repository.client.aiJob.updateMany({
        where: {
          id: jobId,
          status: PrismaAiJobStatus.PENDING,
        },
        data: {
          status: PrismaAiJobStatus.RUNNING,
          startedAt,
          attemptCount: { increment: 1 },
        },
      });

      if (updated.count !== 1) {
        return null;
      }

      await repository.client.aiWeeklySalesReport.updateMany({
        where: {
          id: job.targetId,
          userId: job.userId,
          status: PrismaAiWeeklySalesReportStatus.GENERATING,
        },
        data: {
          startedAt,
        },
      });

      const [updatedJob, report] = await Promise.all([
        repository.client.aiJob.findUnique({ where: { id: jobId } }),
        repository.client.aiWeeklySalesReport.findFirst({
          where: {
            id: job.targetId,
            userId: job.userId,
            status: PrismaAiWeeklySalesReportStatus.GENERATING,
          },
        }),
      ]);

      if (!updatedJob || !report) {
        return null;
      }

      return {
        job: repository.mapJob(updatedJob),
        report: repository.mapReport(report),
      };
    });
  }

  async createProviderCallLog(
    input: CreateProviderCallLogInput
  ): Promise<AiProviderCallLogRecord> {
    const row = await this.client.aiProviderCallLog.create({
      data: {
        userId: input.userId,
        operation: PrismaAiProviderOperation.WEEKLY_SALES_REPORT,
        status: PrismaAiProviderCallStatus.PENDING,
        reportId: input.reportId,
        jobId: input.jobId,
        provider: input.provider,
        model: input.model,
        startedAt: input.startedAt,
        metadataJson: {},
      },
    });

    return this.mapProviderCallLog(row);
  }

  async completeReportGeneration(
    input: CompleteReportGenerationInput
  ): Promise<void> {
    await this.runInTransaction(async (repository) => {
      if (!(repository instanceof PrismaAiWeeklySalesReportRepository)) {
        throw new Error("Unsupported sales report repository transaction");
      }

      await repository.client.aiProviderCallLog.updateMany({
        where: {
          id: input.providerCallLogId,
          status: PrismaAiProviderCallStatus.PENDING,
          userId: input.userId,
        },
        data: {
          status: PrismaAiProviderCallStatus.SUCCEEDED,
          requestId: input.providerCall.requestId,
          latencyMs: input.providerCall.latencyMs,
          inputTokenCount: input.providerCall.inputTokenCount,
          outputTokenCount: input.providerCall.outputTokenCount,
          totalTokenCount: input.providerCall.totalTokenCount,
          estimatedCostAmount: input.providerCall.estimatedCostAmount,
          costCurrency: input.providerCall.costCurrency ?? "USD",
          safeErrorCode: null,
          safeErrorMessage: null,
          retryable: false,
          completedAt: input.completedAt,
          failedAt: null,
        },
      });

      await repository.client.aiWeeklySalesReport.updateMany({
        where: {
          id: input.reportId,
          userId: input.userId,
          status: PrismaAiWeeklySalesReportStatus.GENERATING,
        },
        data: {
          status: PrismaAiWeeklySalesReportStatus.READY,
          provider: input.provider,
          model: input.model,
          outputJson: repository.toInputJson(input.output),
          dataCoverageJson: repository.toInputJson(input.dataCoverageJson),
          safeErrorCode: null,
          safeErrorMessage: null,
          generatedAt: input.completedAt,
          failedAt: null,
        },
      });

      await repository.client.aiWeeklySalesReportSuggestion.deleteMany({
        where: {
          reportId: input.reportId,
          userId: input.userId,
        },
      });

      if (input.suggestions.length > 0) {
        await repository.client.aiWeeklySalesReportSuggestion.createMany({
          data: input.suggestions.map((suggestion) => ({
            userId: suggestion.userId,
            reportId: suggestion.reportId,
            type: suggestion.type as PrismaAiWeeklySalesReportSuggestionType,
            suggestionKey: suggestion.suggestionKey,
            priority: suggestion.priority as PrismaAiSuggestionPriority,
            title: suggestion.title,
            body: suggestion.body,
            reason: suggestion.reason,
            targetType: suggestion.targetType,
            targetId: suggestion.targetId,
            targetPath: suggestion.targetPath,
            targetLabel: suggestion.targetLabel,
            payloadJson: repository.toInputJson(suggestion.payloadJson),
          })),
        });
      }

      await repository.client.aiJob.updateMany({
        where: {
          id: input.jobId,
          userId: input.userId,
          status: PrismaAiJobStatus.RUNNING,
        },
        data: {
          status: PrismaAiJobStatus.SUCCEEDED,
          completedAt: input.completedAt,
          failedAt: null,
          safeErrorCode: null,
          safeErrorMessage: null,
        },
      });
    });
  }

  async failReportGeneration(input: FailReportGenerationInput): Promise<void> {
    await this.runInTransaction(async (repository) => {
      if (!(repository instanceof PrismaAiWeeklySalesReportRepository)) {
        throw new Error("Unsupported sales report repository transaction");
      }

      if (input.providerCall && input.providerCallLogId) {
        await repository.client.aiProviderCallLog.updateMany({
          where: {
            id: input.providerCallLogId,
            userId: input.userId,
            status: PrismaAiProviderCallStatus.PENDING,
          },
          data: {
            status: PrismaAiProviderCallStatus.FAILED,
            latencyMs: input.providerCall.latencyMs,
            safeErrorCode: input.providerCall.safeErrorCode,
            safeErrorMessage: input.providerCall.safeErrorMessage,
            retryable: input.providerCall.retryable,
            failedAt: input.providerCall.failedAt,
            completedAt: null,
          },
        });
      }

      await repository.client.aiWeeklySalesReport.updateMany({
        where: {
          id: input.reportId,
          userId: input.userId,
          status: PrismaAiWeeklySalesReportStatus.GENERATING,
        },
        data: {
          status: PrismaAiWeeklySalesReportStatus.FAILED,
          safeErrorCode: input.safeErrorCode,
          safeErrorMessage: input.safeErrorMessage,
          failedAt: input.failedAt,
        },
      });

      await repository.client.aiJob.updateMany({
        where: {
          id: input.jobId,
          userId: input.userId,
          status: PrismaAiJobStatus.RUNNING,
        },
        data: {
          status: PrismaAiJobStatus.FAILED,
          safeErrorCode: input.safeErrorCode,
          safeErrorMessage: input.safeErrorMessage,
          failedAt: input.failedAt,
        },
      });
    });
  }

  private async createGeneratingReportWithJobInsideTransaction(
    input: CreateGeneratingReportInput
  ): Promise<CreateGeneratingReportResult> {
    const aggregate = await this.client.aiWeeklySalesReport.aggregate({
      where: {
        userId: input.userId,
        weekStart: input.weekStart,
        timeZone: input.timeZone,
      },
      _max: {
        version: true,
      },
    });
    const version = (aggregate._max.version ?? 0) + 1;
    const report = await this.client.aiWeeklySalesReport.create({
      data: {
        userId: input.userId,
        weekStart: input.weekStart,
        weekEnd: input.weekEnd,
        timeZone: input.timeZone,
        locale: input.locale,
        version,
        status: PrismaAiWeeklySalesReportStatus.GENERATING,
        inputSnapshotJson: this.toInputJson(input.inputSnapshotJson),
        inputMetadataJson: this.toInputJson(input.inputMetadataJson),
        dataCoverageJson: this.toInputJson(input.dataCoverageJson),
        requestedAt: input.now,
      },
    });
    const job = await this.client.aiJob.create({
      data: {
        userId: input.userId,
        operation: PrismaAiProviderOperation.WEEKLY_SALES_REPORT,
        status: PrismaAiJobStatus.PENDING,
        targetType: WEEKLY_REPORT_TARGET_TYPE,
        targetId: report.id,
        idempotencyKey: input.idempotencyKey,
        requestedAt: input.now,
        metadataJson: this.toInputJson({
          reportId: report.id,
          weekStart: this.formatDateOnly(input.weekStart),
          weekEnd: this.formatDateOnly(input.weekEnd),
          timeZone: input.timeZone,
          locale: input.locale,
          version,
        }),
      },
    });

    return {
      report: this.mapReport(report),
      job: this.mapJob(job),
    };
  }

  private createDealSnapshotSelect(userId: string) {
    return {
      id: true,
      dealName: true,
      dealStatus: true,
      dealCost: true,
      expectedEndDate: true,
      dealCompanies: {
        where: {
          userId,
          company: { deletedAt: null },
        },
        select: {
          company: {
            select: {
              id: true,
              companyName: true,
              companyField: { select: { field: true } },
              companyRegion: { select: { region: true } },
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      dealContacts: {
        where: {
          userId,
          contact: { deletedAt: null },
        },
        select: {
          contact: {
            select: {
              id: true,
              companyId: true,
              username: true,
              email: true,
              mobile: true,
              company: { select: { companyName: true } },
              contactDepartment: { select: { departmentName: true } },
              contactJobGrade: { select: { jobGradeName: true } },
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      dealProducts: {
        where: {
          userId,
          product: { deletedAt: null },
        },
        select: {
          product: {
            select: {
              id: true,
              productName: true,
              productPrice: true,
              productCategory: { select: { categoryName: true } },
              productStatus: { select: { statusName: true } },
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      followingActionLogs: {
        where: {
          userId,
          checkComplete: false,
          deletedAt: null,
        },
        select: {
          id: true,
          followingAction: true,
          checkComplete: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: 3,
      },
      _count: {
        select: {
          followingActionLogs: {
            where: {
              userId,
              checkComplete: false,
              deletedAt: null,
            },
          },
        },
      },
    } satisfies Prisma.DealSelect;
  }

  private mapReport(row: AiWeeklySalesReportRow): AiWeeklySalesReportRecord {
    return {
      id: row.id,
      userId: row.userId,
      weekStart: row.weekStart,
      weekEnd: row.weekEnd,
      timeZone: row.timeZone,
      locale: row.locale,
      version: row.version,
      status: row.status,
      provider: row.provider,
      model: row.model,
      inputSnapshotJson: this.toRecordJson(row.inputSnapshotJson),
      inputMetadataJson: this.toRecordJson(row.inputMetadataJson),
      outputJson: row.outputJson ? this.toRecordJson(row.outputJson) : null,
      dataCoverageJson: this.toRecordJson(row.dataCoverageJson),
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      requestedAt: row.requestedAt,
      startedAt: row.startedAt,
      generatedAt: row.generatedAt,
      failedAt: row.failedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapJob(row: AiJobRow): AiJobRecord {
    return {
      id: row.id,
      userId: row.userId,
      operation: "WEEKLY_SALES_REPORT",
      status: row.status,
      targetType: row.targetType,
      targetId: row.targetId,
      idempotencyKey: row.idempotencyKey,
      attemptCount: row.attemptCount,
      maxAttemptCount: row.maxAttemptCount,
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      requestedAt: row.requestedAt,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      failedAt: row.failedAt,
      metadataJson: this.toRecordJson(row.metadataJson),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapProviderCallLog(
    row: AiProviderCallLogRow
  ): AiProviderCallLogRecord {
    return {
      id: row.id,
      userId: row.userId,
      status: row.status,
      reportId: row.reportId,
      jobId: row.jobId,
      provider: row.provider,
      model: row.model,
      requestId: row.requestId,
      latencyMs: row.latencyMs,
      inputTokenCount: row.inputTokenCount,
      outputTokenCount: row.outputTokenCount,
      totalTokenCount: row.totalTokenCount,
      estimatedCostAmount: row.estimatedCostAmount?.toString() ?? null,
      costCurrency: row.costCurrency,
      safeErrorCode: row.safeErrorCode,
      safeErrorMessage: row.safeErrorMessage,
      retryable: row.retryable,
      retryCount: row.retryCount,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      failedAt: row.failedAt,
      metadataJson: this.toRecordJson(row.metadataJson),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapMeetingNoteSnapshot(
    row: MeetingNoteSnapshotRow
  ): AiWeeklySnapshotMeetingNoteRecord {
    return {
      id: row.id,
      sourceType: row.sourceType,
      title: row.title,
      meetingAt: row.meetingAt,
      timeZone: row.timeZone,
      details: row.details,
      nextPlan: row.nextPlan,
      requiredAction: row.requiredAction,
      companies: row.companies.map((company) => ({
        id: company.companyId,
        companyName: company.companyNameSnapshot,
        companyField: company.companyFieldSnapshot,
        companyRegion: company.companyRegionSnapshot,
      })),
      contacts: row.contacts.map((contact) => ({
        id: contact.contactId,
        companyId: contact.companyId,
        username: contact.contactUsernameSnapshot,
        email: contact.contactEmailSnapshot,
        mobile: contact.contactMobileSnapshot,
        companyName: contact.contactCompanyNameSnapshot,
        department: contact.contactDepartmentSnapshot,
        jobGrade: contact.contactJobGradeSnapshot,
      })),
      products: row.products.map((product) => ({
        id: product.productId,
        productName: product.productNameSnapshot,
        productPrice: product.productPriceSnapshot,
        category: product.productCategorySnapshot,
        status: product.productStatusSnapshot,
      })),
      deals: row.deals.map((deal) => ({
        id: deal.id,
        dealId: deal.dealId,
        dealName: deal.dealNameSnapshot,
        dealStatus: deal.dealStatusSnapshot,
        dealCost: deal.dealCostSnapshot,
        expectedEndDate: deal.dealExpectedEndDateSnapshot,
      })),
    };
  }

  private mapDealSnapshot(row: DealSnapshotRow): AiWeeklySnapshotDealRecord {
    return {
      id: row.id,
      dealName: row.dealName,
      dealStatus: row.dealStatus,
      dealCost: row.dealCost,
      expectedEndDate: row.expectedEndDate,
      companies: row.dealCompanies.map((item): AiWeeklySnapshotCompanyRecord => ({
        id: item.company.id,
        companyName: item.company.companyName,
        companyField: item.company.companyField.field,
        companyRegion: item.company.companyRegion.region,
      })),
      contacts: row.dealContacts.map((item): AiWeeklySnapshotContactRecord => ({
        id: item.contact.id,
        companyId: item.contact.companyId,
        username: item.contact.username,
        email: item.contact.email,
        mobile: item.contact.mobile,
        companyName: item.contact.company.companyName,
        department: item.contact.contactDepartment.departmentName,
        jobGrade: item.contact.contactJobGrade.jobGradeName,
      })),
      products: row.dealProducts.map((item): AiWeeklySnapshotProductRecord => ({
        id: item.product.id,
        productName: item.product.productName,
        productPrice: item.product.productPrice,
        category: item.product.productCategory.categoryName,
        status: item.product.productStatus.statusName,
      })),
      nextFollowingActions: row.followingActionLogs.map((action) => ({
        id: action.id,
        followingAction: action.followingAction,
        checkComplete: action.checkComplete,
        createdAt: action.createdAt,
      })),
      openFollowingActionCount: row._count.followingActionLogs,
    };
  }

  private toRecordJson(value: unknown): Record<string, unknown> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return {};
  }

  private toInputJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }

  private formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }
}
