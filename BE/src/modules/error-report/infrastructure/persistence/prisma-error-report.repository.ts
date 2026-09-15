import { PlatformRole } from "@prisma/client";
import type {
  CreateErrorReportInput,
  ErrorReportRecord,
  ErrorReportRepository,
  ErrorReportUserSnapshot,
} from "@/modules/error-report/application/ports/error-report.repository";
import type { CurrentUserPlatformRole } from "@/shared/application/context/current-user.context";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaErrorReportRepository Prisma로 에러 신고 저장소 계약을 구현합니다.
export class PrismaErrorReportRepository implements ErrorReportRepository {
  // 기능 : PrismaService를 주입받아 에러 신고 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 사용자 ID로 신고 저장용 사용자 snapshot을 조회합니다.
  async findUserSnapshotById(
    userId: string
  ): Promise<ErrorReportUserSnapshot | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        platformRole: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      platformRole: this.fromPrismaPlatformRole(user.platformRole),
    };
  }

  // 기능 : 사용자 snapshot과 optional screenshot metadata를 에러 신고 row로 저장합니다.
  async createErrorReport(
    input: CreateErrorReportInput
  ): Promise<ErrorReportRecord> {
    const created = await this.prismaService.errorReport.create({
      data: {
        userId: input.user.id,
        userEmail: input.user.email,
        userDisplayName: input.user.displayName,
        userPlatformRole: this.toPrismaPlatformRole(input.user.platformRole),
        description: input.description,
        pageUrl: input.pageUrl,
        userAgent: input.userAgent,
        requestId: input.requestId,
        screenshotStorageProvider: input.screenshot?.storageProvider ?? null,
        screenshotStorageBucket: input.screenshot?.storageBucket ?? null,
        screenshotStorageKey: input.screenshot?.storageKey ?? null,
        screenshotFileName: input.screenshot?.fileName ?? null,
        screenshotMimeType: input.screenshot?.mimeType ?? null,
        screenshotSizeBytes: input.screenshot?.sizeBytes ?? null,
        screenshotChecksum: input.screenshot?.checksum ?? null,
      },
      select: {
        id: true,
      },
    });

    return { id: created.id };
  }

  // 기능 : Prisma PlatformRole enum을 application 계층 platformRole 타입으로 변환합니다.
  private fromPrismaPlatformRole(role: PlatformRole): CurrentUserPlatformRole {
    switch (role) {
      case PlatformRole.ADMIN:
        return "ADMIN";
      case PlatformRole.USER:
      default:
        return "USER";
    }
  }

  // 기능 : application 계층 platformRole 타입을 Prisma PlatformRole enum으로 변환합니다.
  private toPrismaPlatformRole(role: CurrentUserPlatformRole): PlatformRole {
    return role === "ADMIN" ? PlatformRole.ADMIN : PlatformRole.USER;
  }
}
