import {
  AccountDeletionRequestStatus,
  Prisma,
  UserDataExportRequestStatus,
} from "@prisma/client";
import type {
  AccountDeletionRequestRecord,
  AccountRequestRepository,
  CancelAccountDeletionRequestInput,
  CreateAccountDeletionRequestInput,
  CreateUserDataExportRequestInput,
  UserDataExportFormat,
  UserDataExportRequestRecord,
} from "@/modules/account-request/application/ports/account-request.repository";
import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

type AccountRequestPrismaClient = PrismaService | Prisma.TransactionClient;

const OPEN_DATA_EXPORT_STATUSES = [
  UserDataExportRequestStatus.REQUESTED,
  UserDataExportRequestStatus.PROCESSING,
  UserDataExportRequestStatus.READY,
];
const OPEN_ACCOUNT_DELETION_STATUSES = [
  AccountDeletionRequestStatus.REQUESTED,
  AccountDeletionRequestStatus.PROCESSING,
];

// 역할 : PrismaAccountRequestRepository 계정 데이터 요청 저장소를 Prisma로 구현합니다.
export class PrismaAccountRequestRepository implements AccountRequestRepository {
  // 기능 : Prisma client와 선택적 transaction runner를 주입받습니다.
  constructor(
    private readonly client: AccountRequestPrismaClient,
    private readonly transactionRunner: PrismaService | null = null
  ) {}

  // 기능 : 사용자 계정 데이터 요청 작업을 Prisma transaction 안에서 실행합니다.
  async runInTransaction<T>(
    work: (repository: AccountRequestRepository) => Promise<T>
  ): Promise<T> {
    if (!this.transactionRunner) {
      return work(this);
    }

    return this.transactionRunner.$transaction(async (transaction) => {
      return work(new PrismaAccountRequestRepository(transaction, null));
    });
  }

  // 기능 : 만료된 READY export 요청을 EXPIRED로 전환합니다.
  async expireReadyDataExportRequests(userId: string, now: Date): Promise<void> {
    await this.client.userDataExportRequest.updateMany({
      where: {
        userId,
        status: UserDataExportRequestStatus.READY,
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: UserDataExportRequestStatus.EXPIRED,
      },
    });
  }

  // 기능 : 현재 사용자에게 열린 데이터 export 요청이 있는지 조회합니다.
  async findOpenDataExportRequest(
    userId: string,
    now: Date
  ): Promise<UserDataExportRequestRecord | null> {
    const request = await this.client.userDataExportRequest.findFirst({
      where: {
        userId,
        status: {
          in: OPEN_DATA_EXPORT_STATUSES,
        },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      select: this.getDataExportSelect(),
    });

    return request ? this.toDataExportRequestRecord(request) : null;
  }

  // 기능 : 사용자 데이터 export 요청 row를 생성합니다.
  async createDataExportRequest(
    input: CreateUserDataExportRequestInput
  ): Promise<UserDataExportRequestRecord> {
    const request = await this.client.userDataExportRequest.create({
      data: {
        userId: input.userId,
        includeSensitive: input.includeSensitive,
        format: input.format,
        requestedAt: input.requestedAt,
      },
      select: this.getDataExportSelect(),
    });

    return this.toDataExportRequestRecord(request);
  }

  // 기능 : 현재 사용자 소유 데이터 export 요청을 조회합니다.
  async findDataExportRequestById(
    userId: string,
    requestId: string
  ): Promise<UserDataExportRequestRecord | null> {
    const request = await this.client.userDataExportRequest.findFirst({
      where: {
        id: requestId,
        userId,
      },
      select: this.getDataExportSelect(),
    });

    return request ? this.toDataExportRequestRecord(request) : null;
  }

  // 기능 : 현재 사용자에게 열린 계정 삭제 요청이 있는지 조회합니다.
  async findOpenAccountDeletionRequest(
    userId: string
  ): Promise<AccountDeletionRequestRecord | null> {
    const request = await this.client.accountDeletionRequest.findFirst({
      where: {
        userId,
        status: {
          in: OPEN_ACCOUNT_DELETION_STATUSES,
        },
      },
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      select: this.getAccountDeletionSelect(),
    });

    return request ? this.toAccountDeletionRequestRecord(request) : null;
  }

  // 기능 : 계정 삭제 요청 row를 생성합니다.
  async createAccountDeletionRequest(
    input: CreateAccountDeletionRequestInput
  ): Promise<AccountDeletionRequestRecord> {
    const request = await this.client.accountDeletionRequest.create({
      data: {
        userId: input.userId,
        reasonCode: input.reasonCode,
        reasonMessage: input.reasonMessage,
        requestedAt: input.requestedAt,
        scheduledDeletionAt: input.scheduledDeletionAt,
        canCancelUntil: input.canCancelUntil,
      },
      select: this.getAccountDeletionSelect(),
    });

    return this.toAccountDeletionRequestRecord(request);
  }

  // 기능 : 현재 사용자 소유 계정 삭제 요청을 조회합니다.
  async findAccountDeletionRequestById(
    userId: string,
    requestId: string
  ): Promise<AccountDeletionRequestRecord | null> {
    const request = await this.client.accountDeletionRequest.findFirst({
      where: {
        id: requestId,
        userId,
      },
      select: this.getAccountDeletionSelect(),
    });

    return request ? this.toAccountDeletionRequestRecord(request) : null;
  }

  // 기능 : 취소 가능한 계정 삭제 요청을 CANCELLED로 변경합니다.
  async cancelAccountDeletionRequest(
    input: CancelAccountDeletionRequestInput
  ): Promise<AccountDeletionRequestRecord | null> {
    const result = await this.client.accountDeletionRequest.updateMany({
      where: {
        id: input.requestId,
        userId: input.userId,
        status: AccountDeletionRequestStatus.REQUESTED,
        canCancelUntil: {
          gt: input.cancelledAt,
        },
      },
      data: {
        status: AccountDeletionRequestStatus.CANCELLED,
        cancelledAt: input.cancelledAt,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findAccountDeletionRequestById(input.userId, input.requestId);
  }

  // 기능 : 사용자 데이터 export 요청 조회에 필요한 safe field만 select합니다.
  private getDataExportSelect() {
    return {
      id: true,
      userId: true,
      status: true,
      includeSensitive: true,
      format: true,
      artifactPath: true,
      requestedAt: true,
      expiresAt: true,
    } satisfies Prisma.UserDataExportRequestSelect;
  }

  // 기능 : 계정 삭제 요청 조회에 필요한 사용자 응답 field만 select합니다.
  private getAccountDeletionSelect() {
    return {
      id: true,
      userId: true,
      status: true,
      reasonCode: true,
      requestedAt: true,
      scheduledDeletionAt: true,
      canCancelUntil: true,
      cancelledAt: true,
    } satisfies Prisma.AccountDeletionRequestSelect;
  }

  // 기능 : Prisma 데이터 export row를 application record로 변환합니다.
  private toDataExportRequestRecord(row: {
    readonly id: string;
    readonly userId: string;
    readonly status: UserDataExportRequestStatus;
    readonly includeSensitive: boolean;
    readonly format: string;
    readonly artifactPath: string | null;
    readonly requestedAt: Date;
    readonly expiresAt: Date | null;
  }): UserDataExportRequestRecord {
    return {
      id: row.id,
      userId: row.userId,
      status: row.status,
      includeSensitive: row.includeSensitive,
      format: this.toDataExportFormat(row.format),
      artifactPath: row.artifactPath,
      requestedAt: row.requestedAt,
      expiresAt: row.expiresAt,
    };
  }

  // 기능 : Prisma 계정 삭제 row를 application record로 변환합니다.
  private toAccountDeletionRequestRecord(row: {
    readonly id: string;
    readonly userId: string;
    readonly status: AccountDeletionRequestStatus;
    readonly reasonCode: string | null;
    readonly requestedAt: Date;
    readonly scheduledDeletionAt: Date;
    readonly canCancelUntil: Date;
    readonly cancelledAt: Date | null;
  }): AccountDeletionRequestRecord {
    return {
      id: row.id,
      userId: row.userId,
      status: row.status,
      reasonCode: row.reasonCode,
      requestedAt: row.requestedAt,
      scheduledDeletionAt: row.scheduledDeletionAt,
      canCancelUntil: row.canCancelUntil,
      cancelledAt: row.cancelledAt,
    };
  }

  // 기능 : DB의 format 문자열을 현재 지원하는 export format으로 정규화합니다.
  private toDataExportFormat(value: string): UserDataExportFormat {
    return value === "ZIP_JSON_XLSX" ? value : "ZIP_JSON_XLSX";
  }
}
