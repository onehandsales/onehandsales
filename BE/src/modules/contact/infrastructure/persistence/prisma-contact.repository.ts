import { Prisma } from "@prisma/client";
import {
  type ContactCompanyOptionRecord,
  type ContactDealRecord,
  type ContactDepartmentRecord,
  type ContactJobGradeRecord,
  type ContactLookupRecord,
  ContactListSort,
  type ContactMemoLogRecord,
  type ContactPageRecord,
  type ContactPrivateMemoLogRecord,
  type ContactRecord,
  type ContactRepository,
  type CreateContactInput,
  type CreateContactMemoLogInput,
  type CreateContactPrivateMemoLogInput,
  type DeleteContactMemoLogInput,
  type DeleteContactPrivateMemoLogInput,
  type ExportContactsInput,
  type ListContactsInput,
  type ListContactDealsInput,
  type MemoLogCursor,
  type UpdateContactInput,
  type UpdateContactMemoLogInput,
} from "@/modules/contact/application/ports/contact.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type ContactPrismaClient = PrismaService | Prisma.TransactionClient;

type ContactWithRelations = {
  readonly id: string;
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
  };
  readonly contactDepartment: {
    readonly id: string;
    readonly departmentName: string;
  };
  readonly contactJobGrade: {
    readonly id: string;
    readonly jobGradeName: string;
  };
};

// 역할 : PrismaContactRepository 저장소 계약을 Prisma 기반 영속성 처리로 구현합니다.
export class PrismaContactRepository implements ContactRepository {
  // 기능 : Prisma 클라이언트와 선택적 트랜잭션 실행기를 주입받습니다.
  constructor(
    private readonly client: ContactPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 담당자 저장소 작업을 트랜잭션 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: ContactRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    // 기능 : Prisma 트랜잭션 클라이언트로 격리된 담당자 저장소 콜백을 실행합니다.
    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaContactRepository(transaction, null));
    });
  }

  // 기능 : 현재 사용자의 담당자 목록과 전체 개수를 조회합니다.
  async listContacts(input: ListContactsInput): Promise<ContactPageRecord> {
    const where = this.createContactWhere(input);

    const [items, totalCount] = await Promise.all([
      this.client.contact.findMany({
        where,
        include: {
          company: true,
          contactDepartment: true,
          contactJobGrade: true,
        },
        orderBy: this.createContactOrderBy(input.sort),
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.client.contact.count({ where }),
    ]);

    return {
      items: items.map((contact) => this.mapContact(contact)),
      totalCount,
    };
  }

  // 기능 : 현재 사용자의 담당자 export 대상 전체 목록을 조회합니다.
  async listContactsForExport(
    input: ExportContactsInput
  ): Promise<ContactRecord[]> {
    const items = await this.client.contact.findMany({
      where: this.createContactWhere(input),
      include: {
        company: true,
        contactDepartment: true,
        contactJobGrade: true,
      },
      orderBy: this.createContactOrderBy(input.sort),
    });

    return items.map((contact) => this.mapContact(contact));
  }

  // 기능 : 현재 사용자의 담당자에 연결된 딜 전체 목록을 조회합니다.
  async listContactDeals(
    input: ListContactDealsInput
  ): Promise<ContactDealRecord[]> {
    return this.client.deal.findMany({
      where: {
        userId: input.userId,
        dealContacts: {
          some: {
            userId: input.userId,
            contactId: input.contactId,
          },
        },
      },
      select: {
        id: true,
        dealName: true,
        dealCost: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  // 기능 : 현재 사용자의 담당자 단건을 relation과 함께 조회합니다.
  async findContact(
    userId: string,
    contactId: string
  ): Promise<ContactRecord | null> {
    const contact = await this.client.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
      include: {
        company: true,
        contactDepartment: true,
        contactJobGrade: true,
      },
    });

    return contact ? this.mapContact(contact) : null;
  }

  // 기능 : 현재 사용자의 담당자 존재 여부만 조회합니다.
  async findContactLookup(
    userId: string,
    contactId: string
  ): Promise<ContactLookupRecord | null> {
    const contact = await this.client.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    return contact;
  }

  // 기능 : 현재 사용자의 담당자 단건을 생성합니다.
  async createContact(input: CreateContactInput): Promise<ContactLookupRecord> {
    const contact = await this.client.contact.create({
      data: {
        userId: input.userId,
        companyId: input.companyId,
        username: input.username,
        mobile: input.mobile,
        email: input.email,
        contactDepartmentId: input.contactDepartmentId,
        contactJobGradeId: input.contactJobGradeId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    return contact;
  }

  // 기능 : 현재 사용자의 담당자 기본 정보를 수정합니다.
  async updateContact(
    userId: string,
    contactId: string,
    input: UpdateContactInput
  ): Promise<boolean> {
    const result = await this.client.contact.updateMany({
      where: {
        id: contactId,
        userId,
      },
      data: {
        ...(input.companyId !== undefined ? { companyId: input.companyId } : {}),
        ...(input.username !== undefined ? { username: input.username } : {}),
        ...(input.mobile !== undefined ? { mobile: input.mobile } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.contactDepartmentId !== undefined
          ? { contactDepartmentId: input.contactDepartmentId }
          : {}),
        ...(input.contactJobGradeId !== undefined
          ? { contactJobGradeId: input.contactJobGradeId }
          : {}),
      },
    });

    return result.count > 0;
  }

  // 기능 : 현재 사용자의 회사 옵션 목록을 정렬해 조회합니다.
  async listCompanyOptions(
    userId: string
  ): Promise<ContactCompanyOptionRecord[]> {
    return this.client.company.findMany({
      where: { userId },
      select: {
        id: true,
        companyName: true,
      },
      orderBy: [{ companyName: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 현재 사용자의 회사 옵션 단건을 조회합니다.
  async findCompanyOption(
    userId: string,
    companyId: string
  ): Promise<ContactCompanyOptionRecord | null> {
    return this.client.company.findFirst({
      where: {
        id: companyId,
        userId,
      },
      select: {
        id: true,
        companyName: true,
      },
    });
  }

  // 기능 : 현재 사용자의 담당자 직급 목록을 정렬해 조회합니다.
  async listJobGrades(userId: string): Promise<ContactJobGradeRecord[]> {
    return this.client.contactJobGrade.findMany({
      where: { userId },
      select: {
        id: true,
        jobGradeName: true,
      },
      orderBy: [{ jobGradeName: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 현재 사용자의 담당자 직급 단건을 조회합니다.
  async findJobGrade(
    userId: string,
    jobGradeId: string
  ): Promise<ContactJobGradeRecord | null> {
    return this.client.contactJobGrade.findFirst({
      where: {
        id: jobGradeId,
        userId,
      },
      select: {
        id: true,
        jobGradeName: true,
      },
    });
  }

  // 기능 : 현재 사용자 안에서 같은 담당자 직급 이름이 있는지 확인합니다.
  async existsJobGradeByName(
    userId: string,
    jobGradeName: string
  ): Promise<boolean> {
    const existing = await this.client.contactJobGrade.findUnique({
      where: {
        userId_jobGradeName: {
          userId,
          jobGradeName,
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(existing);
  }

  // 기능 : 현재 사용자의 담당자 직급을 생성합니다.
  async createJobGrade(userId: string, jobGradeName: string): Promise<void> {
    await this.client.contactJobGrade.create({
      data: {
        userId,
        jobGradeName,
      },
    });
  }

  // 기능 : 현재 사용자의 담당자 직급을 사용하는 담당자가 있는지 확인합니다.
  async isJobGradeInUse(userId: string, jobGradeId: string): Promise<boolean> {
    const contact = await this.client.contact.findFirst({
      where: {
        userId,
        contactJobGradeId: jobGradeId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(contact);
  }

  // 기능 : 현재 사용자의 담당자 직급을 삭제합니다.
  async deleteJobGrade(userId: string, jobGradeId: string): Promise<void> {
    await this.client.contactJobGrade.deleteMany({
      where: {
        id: jobGradeId,
        userId,
      },
    });
  }

  // 기능 : 현재 사용자의 담당자 부서 목록을 정렬해 조회합니다.
  async listDepartments(userId: string): Promise<ContactDepartmentRecord[]> {
    return this.client.contactDepartment.findMany({
      where: { userId },
      select: {
        id: true,
        departmentName: true,
      },
      orderBy: [{ departmentName: "asc" }, { id: "asc" }],
    });
  }

  // 기능 : 현재 사용자의 담당자 부서 단건을 조회합니다.
  async findDepartment(
    userId: string,
    departmentId: string
  ): Promise<ContactDepartmentRecord | null> {
    return this.client.contactDepartment.findFirst({
      where: {
        id: departmentId,
        userId,
      },
      select: {
        id: true,
        departmentName: true,
      },
    });
  }

  // 기능 : 현재 사용자 안에서 같은 담당자 부서 이름이 있는지 확인합니다.
  async existsDepartmentByName(
    userId: string,
    departmentName: string
  ): Promise<boolean> {
    const existing = await this.client.contactDepartment.findUnique({
      where: {
        userId_departmentName: {
          userId,
          departmentName,
        },
      },
      select: {
        id: true,
      },
    });

    return Boolean(existing);
  }

  // 기능 : 현재 사용자의 담당자 부서를 생성합니다.
  async createDepartment(userId: string, departmentName: string): Promise<void> {
    await this.client.contactDepartment.create({
      data: {
        userId,
        departmentName,
      },
    });
  }

  // 기능 : 현재 사용자의 담당자 부서를 사용하는 담당자가 있는지 확인합니다.
  async isDepartmentInUse(
    userId: string,
    departmentId: string
  ): Promise<boolean> {
    const contact = await this.client.contact.findFirst({
      where: {
        userId,
        contactDepartmentId: departmentId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(contact);
  }

  // 기능 : 현재 사용자의 담당자 부서를 삭제합니다.
  async deleteDepartment(userId: string, departmentId: string): Promise<void> {
    await this.client.contactDepartment.deleteMany({
      where: {
        id: departmentId,
        userId,
      },
    });
  }

  // 기능 : 담당자 일반 메모 로그를 생성합니다.
  async createMemoLog(input: CreateContactMemoLogInput): Promise<void> {
    await this.client.contactMemoLog.create({
      data: {
        contactId: input.contactId,
        userId: input.userId,
        memoType: input.memoType,
        memo: input.memo,
      },
    });
  }

  // 기능 : 담당자 일반 메모 로그를 cursor 조건으로 조회합니다.
  async listMemoLogs(input: {
    readonly userId: string;
    readonly contactId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<ContactMemoLogRecord[]> {
    return this.client.contactMemoLog.findMany({
      where: {
        userId: input.userId,
        contactId: input.contactId,
        deletedAt: null,
        ...this.createCursorWhere(input.cursor),
      },
      select: {
        id: true,
        memoType: true,
        memo: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    });
  }

  // 기능 : 담당자 일반 메모 로그의 memoType 또는 memo를 수정합니다.
  async updateMemoLog(input: UpdateContactMemoLogInput): Promise<boolean> {
    const result = await this.client.contactMemoLog.updateMany({
      where: {
        id: input.memoLogId,
        contactId: input.contactId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        ...(input.memoType !== undefined ? { memoType: input.memoType } : {}),
        ...(input.memo !== undefined ? { memo: input.memo } : {}),
      },
    });

    return result.count > 0;
  }

  // 기능 : 담당자 일반 메모 로그를 휴지통 상태로 전환합니다.
  async deleteMemoLog(input: DeleteContactMemoLogInput): Promise<boolean> {
    const result = await this.client.contactMemoLog.updateMany({
      where: {
        id: input.memoLogId,
        contactId: input.contactId,
        userId: input.userId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
      },
    });

    return result.count > 0;
  }

  // 기능 : 담당자 개인 비밀 메모 로그를 생성합니다.
  async createPrivateMemoLog(
    input: CreateContactPrivateMemoLogInput
  ): Promise<void> {
    await this.client.contactUserPrivateMemoLog.create({
      data: {
        contactId: input.contactId,
        userId: input.userId,
        memoCiphertext: input.memoCiphertext,
        memoKeyVersion: input.memoKeyVersion,
      },
    });
  }

  // 기능 : 작성자 본인의 담당자 개인 비밀 메모 로그를 cursor 조건으로 조회합니다.
  async listPrivateMemoLogs(input: {
    readonly userId: string;
    readonly contactId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<ContactPrivateMemoLogRecord[]> {
    return this.client.contactUserPrivateMemoLog.findMany({
      where: {
        userId: input.userId,
        contactId: input.contactId,
        deletedAt: null,
        ...this.createPrivateMemoCursorWhere(input.cursor),
      },
      select: {
        id: true,
        memoCiphertext: true,
        memoKeyVersion: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.take,
    });
  }

  // 기능 : 담당자 개인 비밀 메모 로그의 암호문과 key version만 수정합니다.
  async updatePrivateMemoLog(input: {
    readonly userId: string;
    readonly contactId: string;
    readonly privateMemoLogId: string;
    readonly memoCiphertext: string;
    readonly memoKeyVersion: string;
  }): Promise<boolean> {
    const result = await this.client.contactUserPrivateMemoLog.updateMany({
      where: {
        id: input.privateMemoLogId,
        userId: input.userId,
        contactId: input.contactId,
        deletedAt: null,
      },
      data: {
        memoCiphertext: input.memoCiphertext,
        memoKeyVersion: input.memoKeyVersion,
      },
    });

    return result.count > 0;
  }

  // 기능 : 담당자 개인 비밀 메모 로그를 휴지통 상태로 전환합니다.
  async deletePrivateMemoLog(
    input: DeleteContactPrivateMemoLogInput
  ): Promise<boolean> {
    const result = await this.client.contactUserPrivateMemoLog.updateMany({
      where: {
        id: input.privateMemoLogId,
        userId: input.userId,
        contactId: input.contactId,
        deletedAt: null,
      },
      data: {
        deletedAt: input.deletedAt,
        deletedByUserId: input.deletedByUserId,
        trashExpiresAt: input.trashExpiresAt,
      },
    });

    return result.count > 0;
  }

  // 기능 : cursor 기준보다 이전 데이터만 조회하는 Prisma 조건을 생성합니다.
  private createCursorWhere(
    cursor: MemoLogCursor | null
  ): Prisma.ContactMemoLogWhereInput {
    if (!cursor) {
      return {};
    }

    return {
      OR: [
        {
          createdAt: {
            lt: cursor.createdAt,
          },
        },
        {
          createdAt: cursor.createdAt,
          id: {
            lt: cursor.id,
          },
        },
      ],
    };
  }

  // 기능 : 개인 비밀 메모 cursor 기준보다 이전 데이터만 조회하는 Prisma 조건을 생성합니다.
  private createPrivateMemoCursorWhere(
    cursor: MemoLogCursor | null
  ): Prisma.ContactUserPrivateMemoLogWhereInput {
    if (!cursor) {
      return {};
    }

    return {
      OR: [
        {
          createdAt: {
            lt: cursor.createdAt,
          },
        },
        {
          createdAt: cursor.createdAt,
          id: {
            lt: cursor.id,
          },
        },
      ],
    };
  }

  // 기능 : 담당자 목록과 export에 공통으로 쓰는 Prisma 조회 조건을 생성합니다.
  private createContactWhere(
    input: ExportContactsInput
  ): Prisma.ContactWhereInput {
    return {
      userId: input.userId,
      ...(input.username
        ? {
            username: {
              contains: input.username,
            },
          }
        : {}),
      ...(input.companyIds && input.companyIds.length > 0
        ? { companyId: { in: [...input.companyIds] } }
        : input.companyId
          ? { companyId: input.companyId }
          : {}),
      ...(input.contactDepartmentId
        ? { contactDepartmentId: input.contactDepartmentId }
        : {}),
      ...(input.contactJobGradeId
        ? { contactJobGradeId: input.contactJobGradeId }
        : {}),
    };
  }

  // 기능 : 담당자 목록과 export의 정렬 조건을 생성합니다.
  private createContactOrderBy(
    sort: ContactListSort | undefined
  ): Prisma.ContactOrderByWithRelationInput[] {
    if (sort === ContactListSort.USERNAME_ASC) {
      return [{ username: "asc" }, { createdAt: "desc" }, { id: "desc" }];
    }

    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  // 기능 : Prisma 담당자 행을 application 레코드로 변환합니다.
  private mapContact(contact: ContactWithRelations): ContactRecord {
    return {
      id: contact.id,
      company: {
        id: contact.company.id,
        companyName: contact.company.companyName,
      },
      username: contact.username,
      mobile: contact.mobile,
      email: contact.email,
      contactDepartment: {
        id: contact.contactDepartment.id,
        departmentName: contact.contactDepartment.departmentName,
      },
      contactJobGrade: {
        id: contact.contactJobGrade.id,
        jobGradeName: contact.contactJobGrade.jobGradeName,
      },
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}
