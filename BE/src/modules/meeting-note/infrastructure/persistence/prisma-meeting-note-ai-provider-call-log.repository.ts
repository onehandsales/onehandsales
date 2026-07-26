import {
  AiProviderCallStatus as PrismaAiProviderCallStatus,
  AiProviderOperation as PrismaAiProviderOperation,
  Prisma,
} from "@prisma/client";
import type {
  CreateMeetingNoteAiProviderCallLogInput,
  MarkMeetingNoteAiProviderCallFailedInput,
  MarkMeetingNoteAiProviderCallSucceededInput,
  MeetingNoteAiProviderCallLogRecord,
  MeetingNoteAiProviderCallLogRepository,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-provider-call-log.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type MeetingNoteAiProviderCallLogPrismaClient =
  | PrismaService
  | Prisma.TransactionClient;

// 역할 : PrismaMeetingNoteAiProviderCallLogRepository 회의록 AI provider 호출 로그를 Prisma로 저장합니다.
export class PrismaMeetingNoteAiProviderCallLogRepository
  implements MeetingNoteAiProviderCallLogRepository
{
  // 기능 : provider 호출 로그 전용 Prisma client를 주입받습니다.
  constructor(private readonly client: MeetingNoteAiProviderCallLogPrismaClient) {}

  // 기능 : 회의록 AI/STT provider 호출 전 PENDING 로그를 생성합니다.
  async createProviderCallLog(
    input: CreateMeetingNoteAiProviderCallLogInput
  ): Promise<MeetingNoteAiProviderCallLogRecord> {
    const row = await this.client.aiProviderCallLog.create({
      data: {
        userId: input.userId,
        operation: input.operation as PrismaAiProviderOperation,
        status: PrismaAiProviderCallStatus.PENDING,
        targetType: input.targetType,
        targetId: input.targetId,
        provider: input.provider,
        model: input.model,
        startedAt: input.startedAt,
        metadataJson: this.toInputJson(input.metadataJson),
      },
      select: { id: true },
    });

    return row;
  }

  // 기능 : provider 호출 성공 시 token/cost/requestId 같은 안전한 운영 metadata만 저장합니다.
  async markProviderCallSucceeded(
    input: MarkMeetingNoteAiProviderCallSucceededInput
  ): Promise<void> {
    await this.client.aiProviderCallLog.updateMany({
      where: {
        id: input.providerCallLogId,
        userId: input.userId,
        status: PrismaAiProviderCallStatus.PENDING,
      },
      data: {
        status: PrismaAiProviderCallStatus.SUCCEEDED,
        requestId: input.requestId ?? null,
        latencyMs: input.latencyMs,
        inputTokenCount: input.inputTokenCount ?? null,
        outputTokenCount: input.outputTokenCount ?? null,
        totalTokenCount: input.totalTokenCount ?? null,
        estimatedCostAmount: input.estimatedCostAmount ?? null,
        costCurrency: input.costCurrency ?? "USD",
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
        completedAt: input.completedAt,
        failedAt: null,
      },
    });
  }

  // 기능 : provider 호출 실패 시 사용자에게 노출 가능한 safe error 정보만 저장합니다.
  async markProviderCallFailed(
    input: MarkMeetingNoteAiProviderCallFailedInput
  ): Promise<void> {
    await this.client.aiProviderCallLog.updateMany({
      where: {
        id: input.providerCallLogId,
        userId: input.userId,
        status: PrismaAiProviderCallStatus.PENDING,
      },
      data: {
        status: PrismaAiProviderCallStatus.FAILED,
        latencyMs: input.latencyMs,
        safeErrorCode: input.safeErrorCode,
        safeErrorMessage: input.safeErrorMessage,
        retryable: input.retryable,
        failedAt: input.failedAt,
        completedAt: null,
      },
    });
  }

  // 기능 : Prisma JSON 입력으로 저장 가능한 안전한 metadata 객체로 변환합니다.
  private toInputJson(input: Record<string, unknown>): Prisma.InputJsonObject {
    return input as Prisma.InputJsonObject;
  }
}
