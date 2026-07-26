import {
  AiProviderCallStatus as PrismaAiProviderCallStatus,
  AiProviderOperation as PrismaAiProviderOperation,
} from "@prisma/client";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaMeetingNoteAiProviderCallLogRepository } from "./prisma-meeting-note-ai-provider-call-log.repository";

const USER_ID = "00000000-0000-4000-8000-000000000101";
const LOG_ID = "00000000-0000-4000-8000-000000000201";
const MEETING_NOTE_ID = "00000000-0000-4000-8000-000000000301";
const STARTED_AT = new Date("2026-07-26T01:00:00.000Z");
const FINISHED_AT = new Date("2026-07-26T01:00:01.234Z");

describe("PrismaMeetingNoteAiProviderCallLogRepository", () => {
  it("회의록 AI provider 호출 시작 log를 원문 없는 metadata로 생성한다", async () => {
    const client = createMockClient();
    client.aiProviderCallLog.create.mockResolvedValue({ id: LOG_ID });
    const repository = new PrismaMeetingNoteAiProviderCallLogRepository(
      client as unknown as PrismaService
    );

    const result = await repository.createProviderCallLog({
      userId: USER_ID,
      operation: "MEETING_NOTE_TEXT_DRAFT",
      targetType: "MEETING_NOTE_DRAFT",
      targetId: null,
      provider: "openai",
      model: "gpt-test",
      startedAt: STARTED_AT,
      metadataJson: {
        inputKind: "text",
        textLength: 24,
        contextCounts: {
          companies: 1,
          contacts: 1,
          products: 0,
          deals: 0,
        },
      },
    });

    expect(result).toEqual({ id: LOG_ID });
    expect(client.aiProviderCallLog.create).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        operation: PrismaAiProviderOperation.MEETING_NOTE_TEXT_DRAFT,
        status: PrismaAiProviderCallStatus.PENDING,
        targetType: "MEETING_NOTE_DRAFT",
        targetId: null,
        provider: "openai",
        model: "gpt-test",
        startedAt: STARTED_AT,
        metadataJson: {
          inputKind: "text",
          textLength: 24,
          contextCounts: {
            companies: 1,
            contacts: 1,
            products: 0,
            deals: 0,
          },
        },
      },
      select: { id: true },
    });

    const serializedInput = JSON.stringify(
      client.aiProviderCallLog.create.mock.calls
    );
    expect(serializedInput).not.toContain("회의 원문");
    expect(serializedInput).not.toContain("kim@example.com");
    expect(serializedInput).not.toContain("raw provider response");
  });

  it("저장된 회의록 대상 AI 후속 작업 log를 MEETING_NOTE target으로 생성한다", async () => {
    const client = createMockClient();
    client.aiProviderCallLog.create.mockResolvedValue({ id: LOG_ID });
    const repository = new PrismaMeetingNoteAiProviderCallLogRepository(
      client as unknown as PrismaService
    );

    await repository.createProviderCallLog({
      userId: USER_ID,
      operation: "MEETING_NOTE_NEXT_ACTION_DRAFT",
      targetType: "MEETING_NOTE",
      targetId: MEETING_NOTE_ID,
      provider: "openai",
      model: "gpt-test",
      startedAt: STARTED_AT,
      metadataJson: {
        source: "detail-ai-panel",
        hasDealContext: true,
        detailsLength: 30,
      },
    });

    expect(client.aiProviderCallLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: USER_ID,
        operation: PrismaAiProviderOperation.MEETING_NOTE_NEXT_ACTION_DRAFT,
        status: PrismaAiProviderCallStatus.PENDING,
        targetType: "MEETING_NOTE",
        targetId: MEETING_NOTE_ID,
        metadataJson: {
          source: "detail-ai-panel",
          hasDealContext: true,
          detailsLength: 30,
        },
      }),
      select: { id: true },
    });
  });

  it("성공 log에는 provider request id와 usage metadata만 갱신한다", async () => {
    const client = createMockClient();
    const repository = new PrismaMeetingNoteAiProviderCallLogRepository(
      client as unknown as PrismaService
    );

    await repository.markProviderCallSucceeded({
      userId: USER_ID,
      providerCallLogId: LOG_ID,
      completedAt: FINISHED_AT,
      latencyMs: 1234,
      requestId: "req-1",
      inputTokenCount: 10,
      outputTokenCount: 5,
      totalTokenCount: 15,
      estimatedCostAmount: null,
      costCurrency: "USD",
    });

    expect(client.aiProviderCallLog.updateMany).toHaveBeenCalledWith({
      where: {
        id: LOG_ID,
        userId: USER_ID,
        status: PrismaAiProviderCallStatus.PENDING,
      },
      data: {
        status: PrismaAiProviderCallStatus.SUCCEEDED,
        requestId: "req-1",
        latencyMs: 1234,
        inputTokenCount: 10,
        outputTokenCount: 5,
        totalTokenCount: 15,
        estimatedCostAmount: null,
        costCurrency: "USD",
        safeErrorCode: null,
        safeErrorMessage: null,
        retryable: false,
        completedAt: FINISHED_AT,
        failedAt: null,
      },
    });
  });

  it("실패 log에는 안전한 오류 코드와 재시도 가능 여부만 갱신한다", async () => {
    const client = createMockClient();
    const repository = new PrismaMeetingNoteAiProviderCallLogRepository(
      client as unknown as PrismaService
    );

    await repository.markProviderCallFailed({
      userId: USER_ID,
      providerCallLogId: LOG_ID,
      failedAt: FINISHED_AT,
      latencyMs: 1234,
      safeErrorCode: "MeetingNoteAiDraftFailed",
      safeErrorMessage: "AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.",
      retryable: true,
    });

    expect(client.aiProviderCallLog.updateMany).toHaveBeenCalledWith({
      where: {
        id: LOG_ID,
        userId: USER_ID,
        status: PrismaAiProviderCallStatus.PENDING,
      },
      data: {
        status: PrismaAiProviderCallStatus.FAILED,
        latencyMs: 1234,
        safeErrorCode: "MeetingNoteAiDraftFailed",
        safeErrorMessage:
          "AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.",
        retryable: true,
        failedAt: FINISHED_AT,
        completedAt: null,
      },
    });

    const serializedInput = JSON.stringify(
      client.aiProviderCallLog.updateMany.mock.calls
    );
    expect(serializedInput).not.toContain("provider raw quota secret");
  });
});

// 기능 : AiProviderCallLog Prisma delegate mock을 생성합니다.
function createMockClient() {
  return {
    aiProviderCallLog: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };
}
