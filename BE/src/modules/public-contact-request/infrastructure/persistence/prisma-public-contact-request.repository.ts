import type {
  CreatePublicContactRequestInput,
  PublicContactRequestRecord,
  PublicContactRequestRepository,
} from "@/modules/public-contact-request/application/ports/public-contact-request.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

// 역할 : PrismaPublicContactRequestRepository Prisma로 공개 문의 저장소 계약을 구현합니다.
export class PrismaPublicContactRequestRepository
  implements PublicContactRequestRepository
{
  // 기능 : PrismaService를 주입받아 공개 문의 DB 작업에 사용합니다.
  constructor(private readonly prismaService: PrismaService) {}

  // 기능 : 정규화 이메일과 일치하는 삭제되지 않은 회원이 있는지 조회합니다.
  async existsActiveUserByEmail(normalizedEmail: string): Promise<boolean> {
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

    return user !== null;
  }

  // 기능 : 공개 문의 row를 FK 없는 독립 테이블에 저장합니다.
  async createPublicContactRequest(
    input: CreatePublicContactRequestInput
  ): Promise<PublicContactRequestRecord> {
    const created = await this.prismaService.publicContactRequest.create({
      data: {
        email: input.email,
        normalizedEmail: input.normalizedEmail,
        companySize: input.companySize,
        firstName: input.firstName,
        lastName: input.lastName,
        companyName: input.companyName,
        jobTitle: input.jobTitle,
        region: input.region,
        phone: input.phone,
        plan: input.plan,
        source: input.source,
        marketingAgreement: input.marketingAgreement,
        wasExistingUserAtSubmission: input.wasExistingUserAtSubmission,
        pageUrl: input.pageUrl,
        locale: input.locale,
        userAgent: input.userAgent,
        requestId: input.requestId,
      },
      select: {
        id: true,
      },
    });

    return { id: created.id };
  }
}
