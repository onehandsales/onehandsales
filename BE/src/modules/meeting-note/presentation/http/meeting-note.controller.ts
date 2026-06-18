import type { Buffer } from "node:buffer";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { MeetingNoteDraftAudioFile } from "@/modules/meeting-note/application/ports/meeting-note-stt.provider";
import { MeetingNoteAiDraftApplicationService } from "@/modules/meeting-note/application/services/meeting-note-ai-draft-application.service";
import { MeetingNoteApplicationService } from "@/modules/meeting-note/application/services/meeting-note-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateMeetingNoteDto,
  CreateMeetingNoteSttAiDraftDto,
  CreateMeetingNoteTextAiDraftDto,
  ListMeetingNotesQueryDto,
  UpdateMeetingNoteDto,
} from "./dto/meeting-note-request.dto";

const MAX_AI_DRAFT_AUDIO_FILE_SIZE_BYTES = 25 * 1024 * 1024;

// 역할 : UploadedMeetingNoteAudioFile multipart 음성 파일에서 초안 생성에 필요한 필드만 표현합니다.
interface UploadedMeetingNoteAudioFile {
  readonly buffer: Buffer;
  readonly originalname: string;
  readonly mimetype: string;
  readonly size: number;
}

// 역할 : MeetingNoteController 회의록 HTTP API 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/meeting-notes")
export class MeetingNoteController {
  // 기능 : 회의록 수동 저장 서비스와 AI/STT 초안 생성 서비스를 주입받습니다.
  constructor(
    private readonly meetingNoteApplicationService: MeetingNoteApplicationService,
    private readonly meetingNoteAiDraftApplicationService: MeetingNoteAiDraftApplicationService
  ) {}

  // API : 회의록 회사 필터 옵션 목록 조회
  @Get("filter-companies")
  listFilterCompanies(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자 정보를 application 계층으로 전달해 회사 필터 옵션 조회를 위임합니다.
    return this.meetingNoteApplicationService.listFilterCompanies(currentUser);
  }

  // API : 회의록 담당자 필터 옵션 목록 조회
  @Get("filter-contacts")
  listFilterContacts(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자 정보를 application 계층으로 전달해 담당자 필터 옵션 조회를 위임합니다.
    return this.meetingNoteApplicationService.listFilterContacts(currentUser);
  }

  // API : 회의록 목록 조회
  @Get()
  listMeetingNotes(
    @CurrentUser() currentUser: CurrentUserContext,
    @Query() query: ListMeetingNotesQueryDto
  ) {
    // 1. query 조건과 현재 사용자 정보를 application 계층으로 전달합니다.
    return this.meetingNoteApplicationService.listMeetingNotes(
      currentUser,
      query
    );
  }

  // API : 회의록 텍스트 AI 초안 생성
  @Post("ai-draft")
  @HttpCode(HttpStatus.OK)
  createTextAiDraft(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMeetingNoteTextAiDraftDto
  ) {
    // 1. 사용자가 선택한 맥락과 회의 원문을 application 계층으로 전달합니다.
    return this.meetingNoteAiDraftApplicationService.createTextAiDraft(
      currentUser,
      body
    );
  }

  // API : 회의록 음성 STT+AI 초안 생성
  @Post("stt-draft")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor("audio", {
      limits: { fileSize: MAX_AI_DRAFT_AUDIO_FILE_SIZE_BYTES },
    })
  )
  createSttAiDraft(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMeetingNoteSttAiDraftDto,
    @UploadedFile() audioFile: UploadedMeetingNoteAudioFile | undefined
  ) {
    // 1. multipart 파일을 application 계층의 음성 파일 command로 변환합니다.
    return this.meetingNoteAiDraftApplicationService.createSttAiDraft(
      currentUser,
      {
        ...body,
        audioFile: this.toDraftAudioFile(audioFile),
      }
    );
  }

  // API : 회의록 단건 상세 조회
  @Get(":meetingNoteId")
  getMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("meetingNoteId", ParseUUIDPipe) meetingNoteId: string
  ) {
    // 1. path param과 현재 사용자 정보를 application 계층으로 전달합니다.
    return this.meetingNoteApplicationService.getMeetingNote(
      currentUser,
      meetingNoteId
    );
  }

  // API : 회의록 수동 생성
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Body() body: CreateMeetingNoteDto
  ) {
    // 1. request body와 현재 사용자 정보를 application 계층으로 전달합니다.
    return this.meetingNoteApplicationService.createMeetingNote(
      currentUser,
      body
    );
  }

  // API : 회의록 단건 수정
  @Patch(":meetingNoteId")
  updateMeetingNote(
    @CurrentUser() currentUser: CurrentUserContext,
    @Param("meetingNoteId", ParseUUIDPipe) meetingNoteId: string,
    @Body() body: UpdateMeetingNoteDto
  ) {
    // 1. path param, request body, 현재 사용자 정보를 application 계층으로 전달합니다.
    return this.meetingNoteApplicationService.updateMeetingNote(
      currentUser,
      meetingNoteId,
      body
    );
  }

  // 기능 : multipart 업로드 파일을 provider에 전달할 수 있는 application command로 변환합니다.
  private toDraftAudioFile(
    audioFile: UploadedMeetingNoteAudioFile | undefined
  ): MeetingNoteDraftAudioFile | undefined {
    if (!audioFile) {
      return undefined;
    }

    return {
      buffer: audioFile.buffer,
      fileName: audioFile.originalname,
      mimeType: audioFile.mimetype,
      size: audioFile.size,
    };
  }
}
