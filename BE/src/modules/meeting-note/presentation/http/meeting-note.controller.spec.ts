import { Buffer } from "node:buffer";
import {
  type ArgumentsHost,
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  PayloadTooLargeException,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { NextFunction, Request, Response } from "express";
import * as request from "supertest";
import {
  MeetingNoteFollowUpChannelValue,
  MeetingNoteFollowUpToneValue,
  MeetingNoteNextActionConfidenceValue,
} from "@/modules/meeting-note/application/ports/meeting-note-ai-action-draft.provider";
import { MeetingNoteAiActionDraftApplicationService } from "@/modules/meeting-note/application/services/meeting-note-ai-action-draft-application.service";
import { MeetingNoteAiDraftApplicationService } from "@/modules/meeting-note/application/services/meeting-note-ai-draft-application.service";
import { MeetingNoteApplicationService } from "@/modules/meeting-note/application/services/meeting-note-application.service";
import { MeetingNoteSourceTypeValue } from "@/modules/meeting-note/application/ports/meeting-note.types";
import {
  MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
  MEETING_NOTE_AUDIO_REQUIRED_SAFE_MESSAGE,
  MEETING_NOTE_AUDIO_TOO_LARGE_SAFE_MESSAGE,
  MeetingNoteAiDraftFailedError,
  MeetingNoteAudioValidationError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { HttpExceptionFilter } from "@/shared/presentation/filters/http-exception.filter";
import {
  MeetingNoteAudioUploadExceptionFilter,
  MeetingNoteController,
} from "./meeting-note.controller";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const COMPANY_ID = "00000000-0000-4000-8000-000000000001";
const CONTACT_ID = "00000000-0000-4000-8000-000000000002";
const DEAL_ID = "00000000-0000-4000-8000-000000000003";
const MEETING_NOTE_ID = "00000000-0000-4000-8000-000000000004";

type RequestWithCurrentUser = Request & {
  currentUser?: CurrentUserContext;
  requestId?: string;
};

// 기능 : Nest ArgumentsHost에서 response mock만 꺼낼 수 있는 테스트 대역을 생성합니다.
function createArgumentsHostFake(response: unknown): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getRequest: jest.fn(),
      getResponse: () => response,
      getNext: jest.fn(),
    }),
  } as unknown as ArgumentsHost;
}

type MeetingNoteServiceFake = Pick<
  MeetingNoteApplicationService,
  | "listFilterCompanies"
  | "listFilterContacts"
  | "listMeetingNotes"
  | "getMeetingNote"
  | "createMeetingNote"
  | "linkMeetingNoteDeals"
  | "updateMeetingNote"
  | "deleteMeetingNote"
>;

type MeetingNoteAiDraftServiceFake = Pick<
  MeetingNoteAiDraftApplicationService,
  "createTextAiDraft" | "createSttAiDraft"
>;

type MeetingNoteAiActionDraftServiceFake = Pick<
  MeetingNoteAiActionDraftApplicationService,
  "createNextActionDraft" | "createFollowUpDraft"
>;

// 역할 : FakeAuthGuard 회의록 controller 테스트 요청에 현재 사용자 context를 주입합니다.
class FakeAuthGuard implements CanActivate {
  // 기능 : 테스트 HTTP 요청을 인증된 사용자 요청으로 처리합니다.
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithCurrentUser>();
    request.currentUser = CURRENT_USER;

    return true;
  }
}

// 기능 : 회의록 수동 저장 controller 의존성 fake를 생성합니다.
function createMeetingNoteServiceFake(): jest.Mocked<MeetingNoteServiceFake> {
  return {
    listFilterCompanies: jest.fn().mockResolvedValue({ items: [] }),
    listFilterContacts: jest.fn().mockResolvedValue({ items: [] }),
    listMeetingNotes: jest.fn().mockResolvedValue({ items: [] }),
    getMeetingNote: jest.fn().mockResolvedValue({ id: "meeting-note-1" }),
    createMeetingNote: jest.fn().mockResolvedValue({ id: "meeting-note-1" }),
    linkMeetingNoteDeals: jest.fn().mockResolvedValue({ id: "meeting-note-1" }),
    updateMeetingNote: jest.fn().mockResolvedValue({ id: "meeting-note-1" }),
    deleteMeetingNote: jest.fn().mockResolvedValue(undefined),
  };
}

// 기능 : 회의록 AI/STT 초안 생성 controller 의존성 fake를 생성합니다.
function createAiDraftServiceFake(): jest.Mocked<MeetingNoteAiDraftServiceFake> {
  return {
    createTextAiDraft: jest.fn().mockResolvedValue({
      sourceType: MeetingNoteSourceTypeValue.TEXT_AI,
      transcript: null,
      details: "회의 내용 초안",
      nextPlan: "다음 계획 초안",
      requiredAction: "필요 행동 초안",
    }),
    createSttAiDraft: jest.fn().mockResolvedValue({
      sourceType: MeetingNoteSourceTypeValue.STT_AI,
      transcript: "녹취 transcript",
      details: "회의 내용 초안",
      nextPlan: "다음 계획 초안",
      requiredAction: "필요 행동 초안",
    }),
  };
}

// 기능 : 회의록 AI 후속 작업 controller 의존성 fake를 생성합니다.
function createAiActionDraftServiceFake(): jest.Mocked<MeetingNoteAiActionDraftServiceFake> {
  return {
    createNextActionDraft: jest.fn().mockResolvedValue({
      items: [
        {
          clientSuggestionId: "na_01",
          title: "가격표 보내기",
          memo: "고객이 가격 자료를 요청했어요.",
          recommendedDueDate: "2026-06-17",
          dealId: DEAL_ID,
          confidence: MeetingNoteNextActionConfidenceValue.HIGH,
          reason: "회의록의 요청 사항에서 확인됐어요.",
        },
      ],
    }),
    createFollowUpDraft: jest.fn().mockResolvedValue({
      channel: MeetingNoteFollowUpChannelValue.EMAIL,
      subject: "오늘 미팅 내용 정리드립니다",
      body: "오늘 논의한 내용을 정리드립니다.",
      suggestedRecipient: {
        contactId: CONTACT_ID,
        displayName: "Kim",
      },
      copyableText: "오늘 논의한 내용을 정리드립니다.",
    }),
  };
}

describe("MeetingNoteController", () => {
  let app: INestApplication;
  let meetingNoteService: jest.Mocked<MeetingNoteServiceFake>;
  let aiDraftService: jest.Mocked<MeetingNoteAiDraftServiceFake>;
  let aiActionDraftService: jest.Mocked<MeetingNoteAiActionDraftServiceFake>;

  beforeEach(async () => {
    meetingNoteService = createMeetingNoteServiceFake();
    aiDraftService = createAiDraftServiceFake();
    aiActionDraftService = createAiActionDraftServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [MeetingNoteController],
      providers: [
        { provide: MeetingNoteApplicationService, useValue: meetingNoteService },
        {
          provide: MeetingNoteAiDraftApplicationService,
          useValue: aiDraftService,
        },
        {
          provide: MeetingNoteAiActionDraftApplicationService,
          useValue: aiActionDraftService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(
      (req: RequestWithCurrentUser, _res: Response, next: NextFunction) => {
        // 기능 : request id middleware 없이도 controller의 requestId 전달 계약을 검증합니다.
        req.requestId = "request-meeting-note-1";
        next();
      }
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("텍스트 AI 초안 생성 요청을 application service로 전달한다", async () => {
    const body = {
      text: "회의 원문",
      meetingLocalDateTime: "2026-06-15T09:30",
      companies: [COMPANY_ID],
      contacts: [CONTACT_ID],
    };

    await request(app.getHttpServer())
      .post("/api/meeting-notes/ai-draft")
      .send(body)
      .expect(200);

    expect(aiDraftService.createTextAiDraft).toHaveBeenCalledWith(
      CURRENT_USER,
      body
    );
  });

  it("AI provider 실패 응답에는 safe message와 retryable만 노출한다", async () => {
    aiDraftService.createTextAiDraft.mockRejectedValueOnce(
      new MeetingNoteAiDraftFailedError("provider raw quota secret", true)
    );

    const response = await request(app.getHttpServer())
      .post("/api/meeting-notes/ai-draft")
      .send({
        text: "회의 원문",
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: [COMPANY_ID],
        contacts: [CONTACT_ID],
      })
      .expect(502);

    expect(response.body).toEqual({
      statusCode: 502,
      error: "MeetingNoteAiDraftFailed",
      message: MEETING_NOTE_AI_DRAFT_FAILED_SAFE_MESSAGE,
      retryable: true,
    });
    expect(JSON.stringify(response.body)).not.toContain("provider raw quota secret");
  });

  it("multipart 음성 STT+AI 초안 생성 요청을 application service로 전달한다", async () => {
    await request(app.getHttpServer())
      .post("/api/meeting-notes/stt-draft")
      .field("meetingLocalDateTime", "2026-06-15T09:30")
      .field("companies", COMPANY_ID)
      .field("contacts", CONTACT_ID)
      .attach("audio", Buffer.from("audio"), {
        filename: "meeting.webm",
        contentType: "audio/webm",
      })
      .expect(201);

    expect(aiDraftService.createSttAiDraft).toHaveBeenCalledWith(
      CURRENT_USER,
      expect.objectContaining({
        meetingLocalDateTime: "2026-06-15T09:30",
        companies: [COMPANY_ID],
        contacts: [CONTACT_ID],
        audioFile: expect.objectContaining({
          fileName: "meeting.webm",
          mimeType: "audio/webm",
          size: 5,
        }),
      })
    );
  });

  it("multipart 음성 누락을 AUDIO_REQUIRED safe response로 반환한다", async () => {
    aiDraftService.createSttAiDraft.mockRejectedValueOnce(
      new MeetingNoteAudioValidationError(
        "AUDIO_REQUIRED",
        MEETING_NOTE_AUDIO_REQUIRED_SAFE_MESSAGE
      )
    );

    const response = await request(app.getHttpServer())
      .post("/api/meeting-notes/stt-draft")
      .field("meetingLocalDateTime", "2026-06-15T09:30")
      .field("companies", COMPANY_ID)
      .field("contacts", CONTACT_ID)
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: "AUDIO_REQUIRED",
      code: "AUDIO_REQUIRED",
      message: MEETING_NOTE_AUDIO_REQUIRED_SAFE_MESSAGE,
      field: "audio",
      retryable: true,
    });
    expect(aiDraftService.createSttAiDraft).toHaveBeenCalledWith(
      CURRENT_USER,
      expect.objectContaining({
        audioFile: undefined,
      })
    );
  });

  it("회의록 다음 행동 후보 생성 요청을 application service로 전달한다", async () => {
    const body = {
      dealId: DEAL_ID,
      maxCandidates: 3,
    };

    await request(app.getHttpServer())
      .post(`/api/meeting-notes/${MEETING_NOTE_ID}/next-actions/draft`)
      .send(body)
      .expect(200);

    expect(aiActionDraftService.createNextActionDraft).toHaveBeenCalledWith(
      CURRENT_USER,
      MEETING_NOTE_ID,
      body
    );
  });

  it("회의록 follow-up 문안 생성 요청을 application service로 전달한다", async () => {
    const body = {
      channel: MeetingNoteFollowUpChannelValue.EMAIL,
      recipientContactId: CONTACT_ID,
      dealId: DEAL_ID,
      tone: MeetingNoteFollowUpToneValue.POLITE,
      language: "ko",
    };

    await request(app.getHttpServer())
      .post(`/api/meeting-notes/${MEETING_NOTE_ID}/follow-up-draft`)
      .send(body)
      .expect(200);

    expect(aiActionDraftService.createFollowUpDraft).toHaveBeenCalledWith(
      CURRENT_USER,
      MEETING_NOTE_ID,
      body
    );
  });

  it("회의록 딜 추가 연결 요청을 application service로 전달한다", async () => {
    await request(app.getHttpServer())
      .post(`/api/meeting-notes/${MEETING_NOTE_ID}/deals`)
      .send({ deals: [DEAL_ID] })
      .expect(200);

    expect(meetingNoteService.linkMeetingNoteDeals).toHaveBeenCalledWith(
      CURRENT_USER,
      MEETING_NOTE_ID,
      { deals: [DEAL_ID] },
      "request-meeting-note-1"
    );
  });

  it("회의록 삭제 요청을 application service로 전달하고 204를 반환한다", async () => {
    await request(app.getHttpServer())
      .delete(`/api/meeting-notes/${MEETING_NOTE_ID}`)
      .expect(204);

    expect(meetingNoteService.deleteMeetingNote).toHaveBeenCalledWith(
      CURRENT_USER,
      MEETING_NOTE_ID
    );
  });
});

describe("MeetingNoteAudioUploadExceptionFilter", () => {
  it("Multer file size error를 AUDIO_TOO_LARGE 413 응답으로 변환한다", () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const response = { status };
    const host = createArgumentsHostFake(response);

    new MeetingNoteAudioUploadExceptionFilter().catch(
      new PayloadTooLargeException("File too large"),
      host
    );

    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({
      statusCode: 413,
      error: "AUDIO_TOO_LARGE",
      code: "AUDIO_TOO_LARGE",
      message: MEETING_NOTE_AUDIO_TOO_LARGE_SAFE_MESSAGE,
      field: "audio",
      retryable: true,
    });
  });
});
