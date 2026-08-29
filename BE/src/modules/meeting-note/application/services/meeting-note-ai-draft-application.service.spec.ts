import { Buffer } from "node:buffer";
import {
  type MeetingNoteAiDraftProvider,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-draft.provider";
import type {
  MeetingNoteAiProviderCallLogRepository,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-provider-call-log.repository";
import {
  type MeetingNoteDraftAudioFile,
  type MeetingNoteSttProvider,
} from "@/modules/meeting-note/application/ports/meeting-note-stt.provider";
import { MeetingNoteSourceTypeValue } from "@/modules/meeting-note/application/ports/meeting-note.types";
import {
  type CompanySnapshotRecord,
  type ContactSnapshotRecord,
  type DealSnapshotRecord,
  type MeetingNoteRepository,
  type ProductSnapshotRecord,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import {
  MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
  MEETING_NOTE_AUDIO_REQUIRED_SAFE_MESSAGE,
  MEETING_NOTE_AUDIO_TOO_LARGE_SAFE_MESSAGE,
  MEETING_NOTE_AUDIO_TYPE_UNSUPPORTED_SAFE_MESSAGE,
  MEETING_NOTE_STT_AI_DRAFT_FAILED_SAFE_MESSAGE,
  MEETING_NOTE_STT_PROVIDER_UNAVAILABLE_SAFE_MESSAGE,
  MEETING_NOTE_STT_TRANSCRIPTION_FAILED_SAFE_MESSAGE,
  MeetingNoteAiDraftFailedError,
  MeetingNoteAiDraftProviderUnavailableError,
  RelatedCompanyNotFoundError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { MeetingNoteAiDraftApplicationService } from "./meeting-note-ai-draft-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const COMPANY: CompanySnapshotRecord = {
  id: "company-1",
  companyName: "Acme",
  companyField: "Software",
  companyRegion: "Seoul",
};

const CONTACT: ContactSnapshotRecord = {
  id: "contact-1",
  companyId: "company-1",
  username: "Kim",
  email: "kim@example.com",
  mobile: "010-0000-0000",
  companyName: "Acme",
  departmentName: "Sales",
  jobGradeName: "Manager",
};

const PRODUCT: ProductSnapshotRecord = {
  id: "product-1",
  productName: "CRM",
  productPrice: 1000,
  categoryName: "SaaS",
  statusName: "Active",
};

const DEAL: DealSnapshotRecord = {
  id: "deal-1",
  dealName: "Acme Renewal",
  dealStatus: "NEGOTIATION",
  dealCost: 5000,
  expectedEndDate: new Date("2026-06-30T00:00:00.000Z"),
};

type DraftRepositoryFake = Pick<
  MeetingNoteRepository,
  | "findCompaniesByIds"
  | "findContactsByIds"
  | "findProductsByIds"
  | "findDealsByIds"
>;

// 역할 : FakeMeetingNoteDraftFixture 회의록 AI/STT 초안 생성 테스트 의존성을 구성합니다.
interface FakeMeetingNoteDraftFixture {
  readonly repository: jest.Mocked<DraftRepositoryFake>;
  readonly aiDraftProvider: jest.Mocked<MeetingNoteAiDraftProvider>;
  readonly sttProvider: jest.Mocked<MeetingNoteSttProvider>;
  readonly providerCallLogRepository: jest.Mocked<MeetingNoteAiProviderCallLogRepository>;
  readonly service: MeetingNoteAiDraftApplicationService;
}

// 기능 : 회의록 AI/STT 초안 생성 application service와 fake provider/repository를 생성합니다.
function createFixture(): FakeMeetingNoteDraftFixture {
  const repository: jest.Mocked<DraftRepositoryFake> = {
    findCompaniesByIds: jest.fn().mockResolvedValue([COMPANY]),
    findContactsByIds: jest.fn().mockResolvedValue([CONTACT]),
    findProductsByIds: jest.fn().mockResolvedValue([PRODUCT]),
    findDealsByIds: jest.fn().mockResolvedValue([DEAL]),
  };
  const aiDraftProvider: jest.Mocked<MeetingNoteAiDraftProvider> = {
    getMetadata: jest.fn().mockReturnValue({
      provider: "openai",
      model: "gpt-test",
    }),
    createTextDraft: jest.fn().mockResolvedValue({
      draft: {
        details: "회의 내용 초안",
        nextPlan: "다음 계획 초안",
        requiredAction: "필요 행동 초안",
      },
      providerCall: {
        requestId: "resp-1",
        inputTokenCount: 10,
        outputTokenCount: 5,
        totalTokenCount: 15,
        estimatedCostAmount: null,
        costCurrency: "USD",
      },
    }),
  };
  const sttProvider: jest.Mocked<MeetingNoteSttProvider> = {
    getMetadata: jest.fn().mockReturnValue({
      provider: "openai",
      model: "gpt-4o-mini-transcribe",
    }),
    transcribe: jest.fn().mockResolvedValue({
      transcript: "녹취 transcript",
      providerCall: {
        requestId: "stt-1",
        inputTokenCount: null,
        outputTokenCount: null,
        totalTokenCount: null,
        estimatedCostAmount: null,
        costCurrency: "USD",
      },
    }),
  };
  const providerCallLogRepository: jest.Mocked<MeetingNoteAiProviderCallLogRepository> =
    {
      createProviderCallLog: jest
        .fn()
        .mockResolvedValueOnce({ id: "provider-log-1" })
        .mockResolvedValueOnce({ id: "provider-log-2" })
        .mockResolvedValueOnce({ id: "provider-log-3" }),
      markProviderCallSucceeded: jest.fn().mockResolvedValue(undefined),
      markProviderCallFailed: jest.fn().mockResolvedValue(undefined),
    };
  const service = new MeetingNoteAiDraftApplicationService(
    repository as unknown as MeetingNoteRepository,
    aiDraftProvider,
    sttProvider,
    providerCallLogRepository
  );

  return {
    repository,
    aiDraftProvider,
    sttProvider,
    providerCallLogRepository,
    service,
  };
}

describe("MeetingNoteAiDraftApplicationService", () => {
  it("사용자가 선택한 맥락을 검증하고 텍스트 AI 초안만 반환한다", async () => {
    const { aiDraftProvider, providerCallLogRepository, service } =
      createFixture();
    const rawText = "가격 조건과 다음 미팅을 논의했다.";

    const result = await service.createTextAiDraft(CURRENT_USER, {
      text: rawText,
      meetingLocalDateTime: "2026-06-15T09:30",
      companies: ["company-1"],
      contacts: ["contact-1"],
      products: ["product-1"],
      deals: ["deal-1"],
    });

    expect(result).toEqual({
      sourceType: MeetingNoteSourceTypeValue.TEXT_AI,
      transcript: null,
      details: "회의 내용 초안",
      nextPlan: "다음 계획 초안",
      requiredAction: "필요 행동 초안",
    });
    expect(aiDraftProvider.createTextDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        rawText: "가격 조건과 다음 미팅을 논의했다.",
        context: expect.objectContaining({
          meetingLocalDateTime: "2026-06-15T09:30:00",
          companies: [expect.objectContaining({ id: "company-1", name: "Acme" })],
          contacts: [expect.objectContaining({ id: "contact-1", name: "Kim" })],
          products: [expect.objectContaining({ id: "product-1", name: "CRM" })],
          deals: [expect.objectContaining({ id: "deal-1", name: "Acme Renewal" })],
        }),
      })
    );
    expect(providerCallLogRepository.createProviderCallLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        operation: "MEETING_NOTE_TEXT_DRAFT",
        targetType: "MEETING_NOTE_DRAFT",
        targetId: null,
        provider: "openai",
        model: "gpt-test",
        metadataJson: expect.objectContaining({
          inputKind: "text",
          textLength: rawText.length,
          contextCounts: {
            companies: 1,
            contacts: 1,
            products: 1,
            deals: 1,
          },
        }),
      })
    );
    expect(providerCallLogRepository.markProviderCallSucceeded).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        providerCallLogId: "provider-log-1",
        requestId: "resp-1",
        inputTokenCount: 10,
        outputTokenCount: 5,
        totalTokenCount: 15,
        costCurrency: "USD",
      })
    );

    const metadataJson =
      providerCallLogRepository.createProviderCallLog.mock.calls[0]?.[0]
        .metadataJson;
    expect(JSON.stringify(metadataJson)).not.toContain(rawText);
    expect(JSON.stringify(metadataJson)).not.toContain("kim@example.com");
  });

  it("음성 파일은 STT provider transcript와 AI draft provider 초안으로 변환해 반환한다", async () => {
    const { aiDraftProvider, providerCallLogRepository, sttProvider, service } =
      createFixture();
    const audioFile: MeetingNoteDraftAudioFile = {
      buffer: Buffer.from("audio"),
      fileName: "meeting.webm",
      mimeType: "audio/webm",
      size: 5,
    };

    const result = await service.createSttAiDraft(CURRENT_USER, {
      audioFile,
      meetingLocalDateTime: "2026-06-15T09:30",
      companies: ["company-1"],
      contacts: ["contact-1"],
    });

    expect(result.sourceType).toBe(MeetingNoteSourceTypeValue.STT_AI);
    expect(result.transcript).toBe("녹취 transcript");
    expect(sttProvider.transcribe).toHaveBeenCalledWith(
      expect.objectContaining({
        audioFile,
      })
    );
    expect(aiDraftProvider.createTextDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        rawText: "녹취 transcript",
        context: expect.objectContaining({
          companies: [expect.objectContaining({ id: "company-1" })],
          contacts: [expect.objectContaining({ id: "contact-1" })],
        }),
      })
    );
    expect(providerCallLogRepository.createProviderCallLog).toHaveBeenCalledTimes(
      2
    );
    expect(providerCallLogRepository.createProviderCallLog).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        operation: "MEETING_NOTE_STT_TRANSCRIPTION",
        provider: "openai",
        model: "gpt-4o-mini-transcribe",
        metadataJson: expect.objectContaining({
          inputKind: "audio",
          audio: {
            mimeType: "audio/webm",
            sizeBucket: "0mb_1mb",
          },
        }),
      })
    );
    expect(providerCallLogRepository.createProviderCallLog).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        operation: "MEETING_NOTE_STT_DRAFT",
        provider: "openai",
        model: "gpt-test",
        metadataJson: expect.objectContaining({
          inputKind: "stt_transcript",
          transcriptLength: "녹취 transcript".length,
        }),
      })
    );
    expect(providerCallLogRepository.markProviderCallSucceeded).toHaveBeenCalledTimes(
      2
    );

    const serializedLogInputs = JSON.stringify(
      providerCallLogRepository.createProviderCallLog.mock.calls
    );
    expect(serializedLogInputs).not.toContain("녹취 transcript");
    expect(serializedLogInputs).not.toContain("kim@example.com");
  });

  it("음성 파일 누락, 미지원 형식, 초과 크기를 G03 safe code로 거절한다", async () => {
    const cases = [
      {
        audioFile: undefined,
        code: "AUDIO_REQUIRED",
        message: MEETING_NOTE_AUDIO_REQUIRED_SAFE_MESSAGE,
      },
      {
        audioFile: {
          buffer: Buffer.from("audio"),
          fileName: "meeting.txt",
          mimeType: "text/plain",
          size: 5,
        },
        code: "AUDIO_TYPE_UNSUPPORTED",
        message: MEETING_NOTE_AUDIO_TYPE_UNSUPPORTED_SAFE_MESSAGE,
      },
      {
        audioFile: {
          buffer: Buffer.from("audio"),
          fileName: "meeting.webm",
          mimeType: "audio/webm",
          size: 25 * 1024 * 1024 + 1,
        },
        code: "AUDIO_TOO_LARGE",
        message: MEETING_NOTE_AUDIO_TOO_LARGE_SAFE_MESSAGE,
      },
    ] satisfies readonly {
      readonly audioFile: MeetingNoteDraftAudioFile | undefined;
      readonly code: string;
      readonly message: string;
    }[];

    for (const scenario of cases) {
      const { aiDraftProvider, providerCallLogRepository, sttProvider, service } =
        createFixture();

      await expect(
        service.createSttAiDraft(CURRENT_USER, {
          audioFile: scenario.audioFile,
          meetingLocalDateTime: "2026-06-15T09:30",
          companies: ["company-1"],
          contacts: ["contact-1"],
        })
      ).rejects.toMatchObject({
        code: scenario.code,
        message: scenario.message,
        details: {
          field: "audio",
          retryable: true,
        },
      });
      expect(sttProvider.transcribe).not.toHaveBeenCalled();
      expect(aiDraftProvider.createTextDraft).not.toHaveBeenCalled();
      expect(providerCallLogRepository.createProviderCallLog).not.toHaveBeenCalled();
    }
  });

  it("선택한 회사가 현재 사용자 소유가 아니면 provider를 호출하지 않는다", async () => {
    const {
      repository,
      aiDraftProvider,
      providerCallLogRepository,
      sttProvider,
      service,
    } = createFixture();
    repository.findCompaniesByIds.mockResolvedValueOnce([]);

    await expect(
      service.createTextAiDraft(CURRENT_USER, {
        text: "회의 내용",
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: ["company-1"],
        contacts: ["contact-1"],
      })
    ).rejects.toBeInstanceOf(RelatedCompanyNotFoundError);
    expect(aiDraftProvider.createTextDraft).not.toHaveBeenCalled();
    expect(sttProvider.transcribe).not.toHaveBeenCalled();
    expect(providerCallLogRepository.createProviderCallLog).not.toHaveBeenCalled();
  });

  it("텍스트 AI provider 실패를 safe error로 반환하고 실패 log에 원문을 남기지 않는다", async () => {
    const { aiDraftProvider, providerCallLogRepository, service } =
      createFixture();
    const rawText = "고객이 보안자료와 가격표를 요청했다.";
    aiDraftProvider.createTextDraft.mockRejectedValueOnce(
      new MeetingNoteAiDraftFailedError(
        "provider quota secret raw response",
        true
      )
    );

    await expect(
      service.createTextAiDraft(CURRENT_USER, {
        text: rawText,
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: ["company-1"],
        contacts: ["contact-1"],
      })
    ).rejects.toMatchObject({
      code: "MeetingNoteAiDraftFailed",
      message: MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
    });
    expect(providerCallLogRepository.markProviderCallFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        providerCallLogId: "provider-log-1",
        safeErrorCode: "MeetingNoteAiDraftFailed",
        safeErrorMessage: MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
        retryable: true,
      })
    );

    const serializedLogInputs = JSON.stringify([
      providerCallLogRepository.createProviderCallLog.mock.calls,
      providerCallLogRepository.markProviderCallFailed.mock.calls,
    ]);
    expect(serializedLogInputs).not.toContain(rawText);
    expect(serializedLogInputs).not.toContain("provider quota secret raw response");
  });

  it("STT provider 실패 시 STT 실패 log만 남기고 AI draft provider를 호출하지 않는다", async () => {
    const { aiDraftProvider, providerCallLogRepository, sttProvider, service } =
      createFixture();
    sttProvider.transcribe.mockRejectedValueOnce(
      new MeetingNoteAiDraftFailedError("provider timeout", true)
    );

    await expect(
      service.createSttAiDraft(CURRENT_USER, {
        audioFile: {
          buffer: Buffer.from("audio"),
          fileName: "meeting.webm",
          mimeType: "audio/webm",
          size: 5,
        },
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: ["company-1"],
        contacts: ["contact-1"],
      })
    ).rejects.toMatchObject({
      code: "STT_TRANSCRIPTION_FAILED",
      message: MEETING_NOTE_STT_TRANSCRIPTION_FAILED_SAFE_MESSAGE,
    });
    expect(providerCallLogRepository.createProviderCallLog).toHaveBeenCalledTimes(
      1
    );
    expect(providerCallLogRepository.createProviderCallLog).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "MEETING_NOTE_STT_TRANSCRIPTION",
      })
    );
    expect(providerCallLogRepository.markProviderCallFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        providerCallLogId: "provider-log-1",
        safeErrorCode: "STT_TRANSCRIPTION_FAILED",
        safeErrorMessage: MEETING_NOTE_STT_TRANSCRIPTION_FAILED_SAFE_MESSAGE,
        retryable: true,
      })
    );
    expect(aiDraftProvider.createTextDraft).not.toHaveBeenCalled();
  });

  it("STT provider 사용 불가를 STT_PROVIDER_UNAVAILABLE safe error로 기록한다", async () => {
    const { aiDraftProvider, providerCallLogRepository, sttProvider, service } =
      createFixture();
    sttProvider.transcribe.mockRejectedValueOnce(
      new MeetingNoteAiDraftProviderUnavailableError("api key secret")
    );

    await expect(
      service.createSttAiDraft(CURRENT_USER, {
        audioFile: {
          buffer: Buffer.from("audio"),
          fileName: "meeting.webm",
          mimeType: "audio/webm",
          size: 5,
        },
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: ["company-1"],
        contacts: ["contact-1"],
      })
    ).rejects.toMatchObject({
      code: "STT_PROVIDER_UNAVAILABLE",
      message: MEETING_NOTE_STT_PROVIDER_UNAVAILABLE_SAFE_MESSAGE,
    });
    expect(providerCallLogRepository.markProviderCallFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        providerCallLogId: "provider-log-1",
        safeErrorCode: "STT_PROVIDER_UNAVAILABLE",
        safeErrorMessage: MEETING_NOTE_STT_PROVIDER_UNAVAILABLE_SAFE_MESSAGE,
        retryable: true,
      })
    );

    const serializedLogInputs = JSON.stringify([
      providerCallLogRepository.createProviderCallLog.mock.calls,
      providerCallLogRepository.markProviderCallFailed.mock.calls,
    ]);
    expect(serializedLogInputs).not.toContain("api key secret");
    expect(aiDraftProvider.createTextDraft).not.toHaveBeenCalled();
  });

  it("STT transcript 기반 AI draft 실패를 AI_DRAFT_FAILED safe error로 기록한다", async () => {
    const { aiDraftProvider, providerCallLogRepository, service } =
      createFixture();
    aiDraftProvider.createTextDraft.mockRejectedValueOnce(
      new MeetingNoteAiDraftFailedError("provider raw transcript secret", true)
    );

    await expect(
      service.createSttAiDraft(CURRENT_USER, {
        audioFile: {
          buffer: Buffer.from("audio"),
          fileName: "meeting.webm",
          mimeType: "audio/webm",
          size: 5,
        },
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: ["company-1"],
        contacts: ["contact-1"],
      })
    ).rejects.toMatchObject({
      code: "AI_DRAFT_FAILED",
      message: MEETING_NOTE_STT_AI_DRAFT_FAILED_SAFE_MESSAGE,
    });
    expect(providerCallLogRepository.markProviderCallSucceeded).toHaveBeenCalledWith(
      expect.objectContaining({
        providerCallLogId: "provider-log-1",
        requestId: "stt-1",
      })
    );
    expect(providerCallLogRepository.markProviderCallFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        providerCallLogId: "provider-log-2",
        safeErrorCode: "AI_DRAFT_FAILED",
        safeErrorMessage: MEETING_NOTE_STT_AI_DRAFT_FAILED_SAFE_MESSAGE,
        retryable: true,
      })
    );

    const serializedLogInputs = JSON.stringify([
      providerCallLogRepository.createProviderCallLog.mock.calls,
      providerCallLogRepository.markProviderCallFailed.mock.calls,
    ]);
    expect(serializedLogInputs).not.toContain("녹취 transcript");
    expect(serializedLogInputs).not.toContain("provider raw transcript secret");
  });
});
