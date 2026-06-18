import { Buffer } from "node:buffer";
import {
  type MeetingNoteAiDraftProvider,
  type MeetingNoteDraftAudioFile,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-draft.provider";
import {
  MeetingNoteSourceTypeValue,
  type CompanySnapshotRecord,
  type ContactSnapshotRecord,
  type DealSnapshotRecord,
  type MeetingNoteRepository,
  type ProductSnapshotRecord,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import { RelatedCompanyNotFoundError } from "@/modules/meeting-note/domain/meeting-note.errors";
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
  readonly provider: jest.Mocked<MeetingNoteAiDraftProvider>;
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
  const provider: jest.Mocked<MeetingNoteAiDraftProvider> = {
    createTextDraft: jest.fn().mockResolvedValue({
      details: "회의 내용 초안",
      nextPlan: "다음 계획 초안",
      requiredAction: "필요 행동 초안",
    }),
    createAudioDraft: jest.fn().mockResolvedValue({
      transcript: "녹취 transcript",
      details: "회의 내용 초안",
      nextPlan: "다음 계획 초안",
      requiredAction: "필요 행동 초안",
    }),
  };
  const service = new MeetingNoteAiDraftApplicationService(
    repository as unknown as MeetingNoteRepository,
    provider
  );

  return { repository, provider, service };
}

describe("MeetingNoteAiDraftApplicationService", () => {
  it("사용자가 선택한 맥락을 검증하고 텍스트 AI 초안만 반환한다", async () => {
    const { provider, service } = createFixture();

    const result = await service.createTextAiDraft(CURRENT_USER, {
      text: "가격 조건과 다음 미팅을 논의했다.",
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
    expect(provider.createTextDraft).toHaveBeenCalledWith(
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
  });

  it("음성 파일은 provider에서 transcript와 초안으로 변환해 반환한다", async () => {
    const { provider, service } = createFixture();
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
    expect(provider.createAudioDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        audioFile,
        context: expect.objectContaining({
          companies: [expect.objectContaining({ id: "company-1" })],
          contacts: [expect.objectContaining({ id: "contact-1" })],
        }),
      })
    );
  });

  it("선택한 회사가 현재 사용자 소유가 아니면 provider를 호출하지 않는다", async () => {
    const { repository, provider, service } = createFixture();
    repository.findCompaniesByIds.mockResolvedValueOnce([]);

    await expect(
      service.createTextAiDraft(CURRENT_USER, {
        text: "회의 내용",
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: ["company-1"],
        contacts: ["contact-1"],
      })
    ).rejects.toBeInstanceOf(RelatedCompanyNotFoundError);
    expect(provider.createTextDraft).not.toHaveBeenCalled();
  });
});
