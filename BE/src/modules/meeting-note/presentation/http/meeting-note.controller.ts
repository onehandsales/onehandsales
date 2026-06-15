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
  UseGuards,
} from "@nestjs/common";
import { MeetingNoteApplicationService } from "@/modules/meeting-note/application/services/meeting-note-application.service";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { CurrentUser } from "@/shared/presentation/decorators/current-user.decorator";
import { AuthGuard } from "@/shared/presentation/guards/auth.guard";
import {
  CreateMeetingNoteDto,
  ListMeetingNotesQueryDto,
  UpdateMeetingNoteDto,
} from "./dto/meeting-note-request.dto";

// 역할 : MeetingNoteController 회의록 HTTP API 요청을 application 계층으로 위임합니다.
@UseGuards(AuthGuard)
@Controller("api/meeting-notes")
export class MeetingNoteController {
  // 기능 : 회의록 application service를 주입받습니다.
  constructor(
    private readonly meetingNoteApplicationService: MeetingNoteApplicationService
  ) {}

  // API : 회의록, 회사 필터 옵션 목록 조회
  @Get("filter-companies")
  listFilterCompanies(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자 정보를 application 계층으로 전달해 회사 필터 옵션 조회를 위임합니다.
    return this.meetingNoteApplicationService.listFilterCompanies(currentUser);
  }

  // API : 회의록, 연락처 필터 옵션 목록 조회
  @Get("filter-contacts")
  listFilterContacts(@CurrentUser() currentUser: CurrentUserContext) {
    // 1. 현재 사용자 정보를 application 계층으로 전달해 연락처 필터 옵션 조회를 위임합니다.
    return this.meetingNoteApplicationService.listFilterContacts(currentUser);
  }

  // API : 회의록, 목록 조회
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

  // API : 회의록, 단건 상세 조회
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

  // API : 회의록, 수동 생성
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

  // API : 회의록, 단건 수정
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
}
