import { PlatformRole } from "@prisma/client";
import type {
  UserQuery,
  UserSnapshot,
} from "@/modules/user/application/ports/user-query.port";
import type { CurrentUserPlatformRole } from "@/shared/application/context/current-user.context";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaUserQueryRepository가 User 모듈의 공개 조회 포트를 Prisma로 구현합니다.
export class PrismaUserQueryRepository implements UserQuery {
  // 기능 : PrismaService를 주입받아 User 조회 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 사용자 ID로 저장용 사용자 snapshot을 조회합니다.
  async findUserSnapshotById(userId: string): Promise<UserSnapshot | null> {
    // 1. User 모듈 소유 테이블에서 snapshot에 필요한 필드만 조회한다.
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        platformRole: true,
      },
    });

    // 2. 사용자가 없으면 외부 모듈이 도메인 오류로 변환할 수 있게 null을 반환한다.
    if (!user) {
      return null;
    }

    // 3. Prisma enum을 application 계층 타입으로 변환해 반환한다.
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      platformRole: this.fromPrismaPlatformRole(user.platformRole),
    };
  }

  // 기능 : 정규화된 이메일과 일치하는 삭제되지 않은 사용자가 있는지 조회합니다.
  async existsActiveUserByEmail(normalizedEmail: string): Promise<boolean> {
    // 1. 공개 문의 snapshot 용도로 삭제되지 않은 사용자 존재 여부만 조회한다.
    const user = await this.prismaService.user.findFirst({
      where: {
        email: normalizedEmail,
        deletedAt: null,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
      },
    });

    // 2. row 존재 여부만 boolean으로 반환해 외부 모듈에 User 구조를 노출하지 않는다.
    return user !== null;
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
}
