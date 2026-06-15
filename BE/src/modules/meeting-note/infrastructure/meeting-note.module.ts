import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/infrastructure/auth.module";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { PrismaInfrastructureModule } from "@/shared/infrastructure/prisma/prisma-infrastructure.module";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { MEETING_NOTE_REPOSITORY } from "../application/ports/meeting-note.repository";
import { MeetingNoteApplicationService } from "../application/services/meeting-note-application.service";
import { MeetingNoteController } from "../presentation/http/meeting-note.controller";
import { PrismaMeetingNoteRepository } from "./persistence/prisma-meeting-note.repository";

// 역할 : MeetingNoteModule 회의록 controller와 provider 의존성을 조립합니다.
@Module({
  imports: [AuthModule, PrismaInfrastructureModule],
  controllers: [MeetingNoteController],
  providers: [
    MeetingNoteApplicationService,
    AppLogger,
    {
      provide: MEETING_NOTE_REPOSITORY,
      // 기능 : Prisma 서비스로 회의록 저장소 구현체를 생성합니다.
      useFactory: (prismaService: PrismaService) =>
        new PrismaMeetingNoteRepository(prismaService, prismaService),
      inject: [PrismaService],
    },
  ],
})
export class MeetingNoteModule {}
