import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { MEETING_NOTE_AI_DRAFT_PROVIDER } from "../application/ports/meeting-note-ai-draft.provider";
import { MEETING_NOTE_STT_PROVIDER } from "../application/ports/meeting-note-stt.provider";
import { MEETING_NOTE_REPOSITORY } from "../application/ports/meeting-note.repository";
import { MeetingNoteAiDraftApplicationService } from "../application/services/meeting-note-ai-draft-application.service";
import { MeetingNoteApplicationService } from "../application/services/meeting-note-application.service";
import { MeetingNoteController } from "../presentation/http/meeting-note.controller";
import { PrismaMeetingNoteRepository } from "./persistence/prisma-meeting-note.repository";
import { OpenAiMeetingNoteAiDraftProvider } from "./providers/openai-meeting-note-ai-draft.provider";
import { OpenAiMeetingNoteSttProvider } from "./providers/openai-meeting-note-stt.provider";

// 역할 : MeetingNoteModule 회의록 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [MeetingNoteController],
  providers: [
    MeetingNoteApplicationService,
    MeetingNoteAiDraftApplicationService,
    AppLogger,
    {
      provide: MEETING_NOTE_REPOSITORY,
      // 기능 : Prisma 서비스로 회의록 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaMeetingNoteRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
    {
      provide: MEETING_NOTE_AI_DRAFT_PROVIDER,
      // 기능 : OpenAI 설정과 logger를 주입해 회의록 AI draft provider adapter를 생성합니다.
      useFactory: (configService: ConfigService, logger: AppLogger) =>
        new OpenAiMeetingNoteAiDraftProvider(configService, logger),
      inject: [ConfigService, AppLogger],
    },
    {
      provide: MEETING_NOTE_STT_PROVIDER,
      // 기능 : OpenAI 설정과 logger를 주입해 회의록 STT provider adapter를 생성합니다.
      useFactory: (configService: ConfigService, logger: AppLogger) =>
        new OpenAiMeetingNoteSttProvider(configService, logger),
      inject: [ConfigService, AppLogger],
    },
  ],
})
export class MeetingNoteModule {}
