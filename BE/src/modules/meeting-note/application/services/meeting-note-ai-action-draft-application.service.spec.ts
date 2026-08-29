import {
  MeetingNoteFollowUpChannelValue,
  MeetingNoteFollowUpToneValue,
  MeetingNoteNextActionConfidenceValue,
  type MeetingNoteAiActionDraftProvider,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-action-draft.provider";
import type {
  MeetingNoteAiProviderCallLogRepository,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-provider-call-log.repository";
import { MeetingNoteSourceTypeValue } from "@/modules/meeting-note/application/ports/meeting-note.types";
import {
  type MeetingNoteRecord,
  type MeetingNoteRepository,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import {
  MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
  MeetingNoteAiDraftFailedError,
  RelatedDealNotFoundError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { MeetingNoteAiActionDraftApplicationService } from "./meeting-note-ai-action-draft-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const MEETING_NOTE_ID = "00000000-0000-4000-8000-000000000004";
const COMPANY_ID = "00000000-0000-4000-8000-000000000001";
const CONTACT_ID = "00000000-0000-4000-8000-000000000002";
const DEAL_ID = "00000000-0000-4000-8000-000000000003";
const NOW = new Date("2026-07-26T01:00:00.000Z");

type ActionRepositoryFake = Pick<MeetingNoteRepository, "findMeetingNote">;

// 역할 : FakeMeetingNoteAiActionDraftFixture AI 후속 작업 테스트 의존성을 구성합니다.
interface FakeMeetingNoteAiActionDraftFixture {
  readonly repository: jest.Mocked<ActionRepositoryFake>;
  readonly provider: jest.Mocked<MeetingNoteAiActionDraftProvider>;
  readonly providerCallLogRepository: jest.Mocked<MeetingNoteAiProviderCallLogRepository>;
  readonly service: MeetingNoteAiActionDraftApplicationService;
}

// 기능 : 회의록 AI 후속 작업 application service와 fake provider/repository를 생성합니다.
function createFixture(): FakeMeetingNoteAiActionDraftFixture {
  const repository: jest.Mocked<ActionRepositoryFake> = {
    findMeetingNote: jest.fn().mockResolvedValue(createMeetingNote()),
  };
  const provider: jest.Mocked<MeetingNoteAiActionDraftProvider> = {
    getMetadata: jest.fn().mockReturnValue({
      provider: "openai",
      model: "gpt-test",
    }),
    createNextActionDraft: jest.fn().mockResolvedValue({
      items: [
        {
          title: " 가격표와 보안 자료 보내기 ",
          memo: "고객이 8월 초 도입을 검토한다고 했어요.",
          recommendedDueDate: "2026-07-28",
          dealId: DEAL_ID,
          confidence: MeetingNoteNextActionConfidenceValue.HIGH,
          reason: "회의록의 요청 사항에서 확인됐어요.",
        },
        {
          title: "",
          memo: "비어 있는 제목 후보는 제거됩니다.",
          recommendedDueDate: null,
          dealId: null,
          confidence: MeetingNoteNextActionConfidenceValue.LOW,
          reason: null,
        },
      ],
      providerCall: {
        requestId: "next-action-req-1",
        inputTokenCount: 100,
        outputTokenCount: 40,
        totalTokenCount: 140,
        estimatedCostAmount: null,
        costCurrency: "USD",
      },
    }),
    createFollowUpDraft: jest.fn().mockResolvedValue({
      draft: {
        subject: " 오늘 미팅 내용 정리드립니다 ",
        body: " 오늘 논의한 내용을 정리드립니다. ",
        copyableText: " 오늘 논의한 내용을 정리드립니다. ",
      },
      providerCall: {
        requestId: "follow-up-req-1",
        inputTokenCount: 120,
        outputTokenCount: 60,
        totalTokenCount: 180,
        estimatedCostAmount: null,
        costCurrency: "USD",
      },
    }),
  };
  const providerCallLogRepository: jest.Mocked<MeetingNoteAiProviderCallLogRepository> =
    {
      createProviderCallLog: jest.fn().mockResolvedValue({ id: "provider-log-1" }),
      markProviderCallSucceeded: jest.fn().mockResolvedValue(undefined),
      markProviderCallFailed: jest.fn().mockResolvedValue(undefined),
    };
  const service = new MeetingNoteAiActionDraftApplicationService(
    repository as unknown as MeetingNoteRepository,
    provider,
    providerCallLogRepository
  );

  return {
    repository,
    provider,
    providerCallLogRepository,
    service,
  };
}

describe("MeetingNoteAiActionDraftApplicationService", () => {
  it("회의록 기반 다음 행동 후보를 반환하고 provider log에는 원문을 남기지 않는다", async () => {
    const { provider, providerCallLogRepository, service } = createFixture();

    const result = await service.createNextActionDraft(
      CURRENT_USER,
      MEETING_NOTE_ID,
      {
        dealId: DEAL_ID,
        maxCandidates: 3,
      }
    );

    expect(result).toEqual({
      items: [
        {
          clientSuggestionId: "na_01",
          title: "가격표와 보안 자료 보내기",
          memo: "고객이 8월 초 도입을 검토한다고 했어요.",
          recommendedDueDate: "2026-07-28",
          dealId: DEAL_ID,
          confidence: MeetingNoteNextActionConfidenceValue.HIGH,
          reason: "회의록의 요청 사항에서 확인됐어요.",
        },
      ],
    });
    expect(provider.createNextActionDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        targetDealId: DEAL_ID,
        maxCandidates: 3,
        context: expect.objectContaining({
          meetingNoteId: MEETING_NOTE_ID,
          details: "고객이 가격표와 보안 자료를 요청했다.",
          contacts: [
            expect.not.objectContaining({
              contactEmailSnapshot: "kim@example.com",
              contactMobileSnapshot: "010-0000-0000",
            }),
          ],
        }),
      })
    );
    expect(providerCallLogRepository.createProviderCallLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: CURRENT_USER.id,
        operation: "MEETING_NOTE_NEXT_ACTION_DRAFT",
        targetType: "MEETING_NOTE",
        targetId: MEETING_NOTE_ID,
        provider: "openai",
        model: "gpt-test",
        metadataJson: expect.objectContaining({
          source: "detail-ai-panel",
          maxCandidates: 3,
          hasDealContext: true,
          detailsLength: "고객이 가격표와 보안 자료를 요청했다.".length,
          relationCounts: {
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
        providerCallLogId: "provider-log-1",
        requestId: "next-action-req-1",
        inputTokenCount: 100,
        outputTokenCount: 40,
      })
    );

    const serializedLogInputs = JSON.stringify(
      providerCallLogRepository.createProviderCallLog.mock.calls
    );
    expect(serializedLogInputs).not.toContain("고객이 가격표와 보안 자료를 요청했다.");
    expect(serializedLogInputs).not.toContain("kim@example.com");
    expect(serializedLogInputs).not.toContain("010-0000-0000");
  });

  it("회의록 기반 follow-up 문안을 반환하고 본문 전문은 log에 남기지 않는다", async () => {
    const { provider, providerCallLogRepository, service } = createFixture();

    const result = await service.createFollowUpDraft(
      CURRENT_USER,
      MEETING_NOTE_ID,
      {
        channel: MeetingNoteFollowUpChannelValue.EMAIL,
        recipientContactId: CONTACT_ID,
        dealId: DEAL_ID,
        tone: MeetingNoteFollowUpToneValue.POLITE,
        language: "ko",
      }
    );

    expect(result).toEqual({
      channel: MeetingNoteFollowUpChannelValue.EMAIL,
      subject: "오늘 미팅 내용 정리드립니다",
      body: "오늘 논의한 내용을 정리드립니다.",
      suggestedRecipient: {
        contactId: CONTACT_ID,
        displayName: "Kim",
      },
      copyableText: "오늘 논의한 내용을 정리드립니다.",
    });
    expect(provider.createFollowUpDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: MeetingNoteFollowUpChannelValue.EMAIL,
        recipientContactId: CONTACT_ID,
        dealId: DEAL_ID,
        tone: MeetingNoteFollowUpToneValue.POLITE,
        language: "ko",
      })
    );
    expect(providerCallLogRepository.createProviderCallLog).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "MEETING_NOTE_FOLLOW_UP_DRAFT",
        targetType: "MEETING_NOTE",
        targetId: MEETING_NOTE_ID,
        metadataJson: expect.objectContaining({
          channel: MeetingNoteFollowUpChannelValue.EMAIL,
          language: "ko",
          hasRecipient: true,
          hasDealContext: true,
        }),
      })
    );

    const serializedLogInputs = JSON.stringify(
      providerCallLogRepository.createProviderCallLog.mock.calls
    );
    expect(serializedLogInputs).not.toContain("오늘 논의한 내용을 정리드립니다.");
    expect(serializedLogInputs).not.toContain("kim@example.com");
  });

  it("선택한 딜이 회의록에 연결되어 있지 않으면 provider를 호출하지 않는다", async () => {
    const { provider, providerCallLogRepository, service } = createFixture();

    await expect(
      service.createNextActionDraft(CURRENT_USER, MEETING_NOTE_ID, {
        dealId: "00000000-0000-4000-8000-000000009999",
        maxCandidates: 3,
      })
    ).rejects.toBeInstanceOf(RelatedDealNotFoundError);
    expect(provider.createNextActionDraft).not.toHaveBeenCalled();
    expect(providerCallLogRepository.createProviderCallLog).not.toHaveBeenCalled();
  });

  it("provider 실패를 safe error로 반환하고 실패 log에 raw 오류를 남기지 않는다", async () => {
    const { provider, providerCallLogRepository, service } = createFixture();
    provider.createNextActionDraft.mockRejectedValueOnce(
      new MeetingNoteAiDraftFailedError("provider raw follow-up secret", true)
    );

    await expect(
      service.createNextActionDraft(CURRENT_USER, MEETING_NOTE_ID, {
        maxCandidates: 3,
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
    expect(serializedLogInputs).not.toContain("provider raw follow-up secret");
  });
});

// 기능 : 저장된 회의록과 연결 snapshot fixture를 생성합니다.
function createMeetingNote(): MeetingNoteRecord {
  return {
    id: MEETING_NOTE_ID,
    sourceType: MeetingNoteSourceTypeValue.MANUAL,
    title: "Acme 미팅",
    meetingAt: new Date("2026-07-26T05:00:00.000Z"),
    timeZone: "Asia/Seoul",
    details: "고객이 가격표와 보안 자료를 요청했다.",
    nextPlan: "자료 전달 후 다음 미팅 일정을 잡는다.",
    requiredAction: "가격표와 보안 자료 보내기",
    rawText: null,
    companies: [
      {
        id: "meeting-note-company-1",
        companyId: COMPANY_ID,
        isDeleted: false,
        companyNameSnapshot: "Acme",
        companyFieldSnapshot: "Software",
        companyRegionSnapshot: "Global",
        createdAt: NOW,
      },
    ],
    contacts: [
      {
        id: "meeting-note-contact-1",
        contactId: CONTACT_ID,
        companyId: COMPANY_ID,
        isDeleted: false,
        contactUsernameSnapshot: "Kim",
        contactEmailSnapshot: "kim@example.com",
        contactMobileSnapshot: "010-0000-0000",
        contactCompanyNameSnapshot: "Acme",
        contactDepartmentSnapshot: "Sales",
        contactJobGradeSnapshot: "Manager",
        createdAt: NOW,
      },
    ],
    products: [
      {
        id: "meeting-note-product-1",
        productId: "00000000-0000-4000-8000-000000000005",
        isDeleted: false,
        productNameSnapshot: "CRM",
        productPriceSnapshot: 1000,
        productCategorySnapshot: "SaaS",
        productStatusSnapshot: "Active",
        createdAt: NOW,
      },
    ],
    deals: [
      {
        id: "meeting-note-deal-1",
        dealId: DEAL_ID,
        isDeleted: false,
        dealNameSnapshot: "Acme Renewal",
        dealStatusSnapshot: "NEGOTIATION",
        dealCostSnapshot: 5000,
        dealExpectedEndDateSnapshot: new Date("2026-08-30T00:00:00.000Z"),
        createdAt: NOW,
      },
    ],
    createdAt: NOW,
    updatedAt: NOW,
  };
}
