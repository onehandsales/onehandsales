import { Buffer } from "node:buffer";
import {
  type CanActivate,
  type ExecutionContext,
  type INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request } from "express";
import * as request from "supertest";
import { MeetingNoteAiDraftApplicationService } from "@/modules/meeting-note/application/services/meeting-note-ai-draft-application.service";
import { MeetingNoteApplicationService } from "@/modules/meeting-note/application/services/meeting-note-application.service";
import { MeetingNoteSourceTypeValue } from "@/modules/meeting-note/application/ports/meeting-note.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import { MeetingNoteController } from "./meeting-note.controller";

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
};

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

describe("MeetingNoteController", () => {
  let app: INestApplication;
  let meetingNoteService: jest.Mocked<MeetingNoteServiceFake>;
  let aiDraftService: jest.Mocked<MeetingNoteAiDraftServiceFake>;

  beforeEach(async () => {
    meetingNoteService = createMeetingNoteServiceFake();
    aiDraftService = createAiDraftServiceFake();

    const moduleRef = await Test.createTestingModule({
      controllers: [MeetingNoteController],
      providers: [
        { provide: MeetingNoteApplicationService, useValue: meetingNoteService },
        {
          provide: MeetingNoteAiDraftApplicationService,
          useValue: aiDraftService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(FakeAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
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
      .expect(200);

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

  it("회의록 딜 추가 연결 요청을 application service로 전달한다", async () => {
    await request(app.getHttpServer())
      .post(`/api/meeting-notes/${MEETING_NOTE_ID}/deals`)
      .send({ deals: [DEAL_ID] })
      .expect(200);

    expect(meetingNoteService.linkMeetingNoteDeals).toHaveBeenCalledWith(
      CURRENT_USER,
      MEETING_NOTE_ID,
      { deals: [DEAL_ID] }
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
