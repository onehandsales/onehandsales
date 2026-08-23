import { UserRole } from "@prisma/client";
import type {
  CreateErrorReportInput,
  ErrorReportRecord,
  ErrorReportRepository,
  ErrorReportUserSnapshot,
} from "@/modules/error-report/application/ports/error-report.repository";
import type { CurrentUserRole } from "@/shared/application/context/current-user.context";
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
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: this.fromPrismaUserRole(user.role),
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
        userRole: this.toPrismaUserRole(input.user.role),
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

  // 기능 : Prisma UserRole enum을 application 계층 role 타입으로 변환합니다.
  private fromPrismaUserRole(role: UserRole): CurrentUserRole {
    switch (role) {
      case UserRole.ADMIN:
        return "ADMIN";
      case UserRole.USER:
      default:
        return "USER";
    }
  }

  // 기능 : application 계층 role 타입을 Prisma UserRole enum으로 변환합니다.
  private toPrismaUserRole(role: CurrentUserRole): UserRole {
    return role === "ADMIN" ? UserRole.ADMIN : UserRole.USER;
  }
}
