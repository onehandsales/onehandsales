import {
  PlatformRole,
  SupportRequestType as PrismaSupportRequestType,
} from "@prisma/client";
import type {
  CreateSupportRequestInput,
  SupportRequestRecord,
  SupportRequestRepository,
  SupportRequestType,
} from "@/modules/support-request/application/ports/support-request.repository";
import type { CurrentUserPlatformRole } from "@/shared/application/context/current-user.context";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaSupportRequestRepository Prisma로 지원 요청 저장소 계약을 구현합니다.
export class PrismaSupportRequestRepository implements SupportRequestRepository {
  // 기능 : PrismaService를 주입받아 지원 요청 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 사용자 ID로 지원 요청 저장용 사용자 snapshot을 조회합니다.
  // 기능 : 사용자 snapshot과 문의 유형, 본문을 지원 요청 row로 저장합니다.
  async createSupportRequest(
    input: CreateSupportRequestInput
  ): Promise<SupportRequestRecord> {
    const created = await this.prismaService.supportRequest.create({
      data: {
        userId: input.user.id,
        userEmail: input.user.email,
        userDisplayName: input.user.displayName,
        userPlatformRole: this.toPrismaPlatformRole(input.user.platformRole),
        type: this.toPrismaSupportRequestType(input.type),
        description: input.description,
        pageUrl: input.pageUrl,
        userAgent: input.userAgent,
        requestId: input.requestId,
      },
      select: {
        id: true,
      },
    });

    return { id: created.id };
  }

  // 기능 : Prisma PlatformRole enum을 application 계층 platformRole 타입으로 변환합니다.
  // 기능 : application 계층 platformRole 타입을 Prisma PlatformRole enum으로 변환합니다.
  private toPrismaPlatformRole(role: CurrentUserPlatformRole): PlatformRole {
    return role === "ADMIN" ? PlatformRole.ADMIN : PlatformRole.USER;
  }

  // 기능 : application 계층 지원 요청 유형을 Prisma enum으로 변환합니다.
  private toPrismaSupportRequestType(
    type: SupportRequestType
  ): PrismaSupportRequestType {
    switch (type) {
      case "FEATURE_QUESTION":
        return PrismaSupportRequestType.FEATURE_QUESTION;
      case "PRICING_QUESTION":
        return PrismaSupportRequestType.PRICING_QUESTION;
      case "PHONE_CONSULTATION":
        return PrismaSupportRequestType.PHONE_CONSULTATION;
      case "FEATURE_SUGGESTION":
        return PrismaSupportRequestType.FEATURE_SUGGESTION;
      case "OTHER":
        return PrismaSupportRequestType.OTHER;
    }
  }
}
