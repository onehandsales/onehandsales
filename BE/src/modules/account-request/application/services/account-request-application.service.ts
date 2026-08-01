import { Inject, Injectable } from "@nestjs/common";
import {
  ACCOUNT_REQUEST_REPOSITORY,
  type AccountRequestRepository,
  type UserDataExportFormat,
} from "@/modules/account-request/application/ports/account-request.repository";
import {
  AccountDeletionConfirmTextInvalidError,
  AccountDeletionRequestIdInvalidError,
  AccountDeletionRequestNotCancelableError,
  AccountDeletionRequestNotFoundError,
  DataExportFormatUnsupportedError,
  DataExportIncludeSensitiveUnsupportedError,
  DataExportRequestIdInvalidError,
  DataExportRequestNotFoundError,
} from "@/modules/account-request/domain/account-request.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  toAccountDeletionRequestResponse,
  toCancelAccountDeletionRequestResponse,
  toUserDataExportRequestResponse,
  type AccountDeletionRequestResponse,
  type CancelAccountDeletionRequestResponse,
  type UserDataExportRequestResponse,
} from "../../presentation/http/account-request-response.mapper";

const ACCOUNT_DELETION_CONFIRM_TEXT = "DELETE MY ACCOUNT";
const ACCOUNT_DELETION_GRACE_PERIOD_DAYS = 30;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// 기능 : 계정 삭제 job에서 실제 삭제/익명화해야 하는 사용자 연결 analytics source를 문서화합니다.
const ACCOUNT_DELETION_ANALYTICS_PURGE_TARGETS = [
  "ProductAnalyticsEvent",
  "UserActivationSnapshot",
] as const;

// 역할 : CreateMyDataExportRequestCommand 내 데이터 export 요청 입력을 정의합니다.
export interface CreateMyDataExportRequestCommand {
  readonly includeSensitive?: boolean;
  readonly format?: string;
}

// 역할 : CreateMyAccountDeletionRequestCommand 계정 삭제 요청 입력을 정의합니다.
export interface CreateMyAccountDeletionRequestCommand {
  readonly confirmText: string;
  readonly reasonCode?: string;
  readonly reasonMessage?: string;
}

// 역할 : AccountRequestApplicationService 계정 삭제와 데이터 export 요청 유스케이스를 제공합니다.
@Injectable()
export class AccountRequestApplicationService {
  // 기능 : 사용자 계정 데이터 요청 저장소 구현체를 주입받습니다.
  constructor(
    @Inject(ACCOUNT_REQUEST_REPOSITORY)
    private readonly accountRequestRepository: AccountRequestRepository
  ) {}

  // 기능 : 사용자 데이터 export 요청을 중복 없이 생성합니다.
  async createMyDataExportRequest(
    currentUser: CurrentUserContext,
    command: CreateMyDataExportRequestCommand
  ): Promise<UserDataExportRequestResponse> {
    // 1. G08에서 허용하는 export 옵션인지 검증합니다.
    const now = new Date();
    const includeSensitive = command.includeSensitive ?? false;
    const format = this.normalizeDataExportFormat(command.format);

    if (includeSensitive) {
      throw new DataExportIncludeSensitiveUnsupportedError();
    }

    // 2. 만료된 READY 요청 정리, 열린 요청 조회, 생성을 하나의 transaction으로 묶습니다.
    const request = await this.accountRequestRepository.runInTransaction(
      async (repository) => {
        await repository.expireReadyDataExportRequests(currentUser.id, now);
        const existingRequest = await repository.findOpenDataExportRequest(
          currentUser.id,
          now
        );

        if (existingRequest) {
          return existingRequest;
        }

        return repository.createDataExportRequest({
          userId: currentUser.id,
          includeSensitive,
          format,
          requestedAt: now,
        });
      }
    );

    // 3. provider raw/token/admin audit/internal note는 export 대상에서 제외되는 queue 응답만 반환합니다.
    return toUserDataExportRequestResponse(request, now);
  }

  // 기능 : 현재 사용자 소유 데이터 export 요청 상태를 조회합니다.
  async getMyDataExportRequest(
    currentUser: CurrentUserContext,
    requestId: string
  ): Promise<UserDataExportRequestResponse> {
    // 1. path param UUID 형식을 검증합니다.
    this.assertRequestId(requestId, "dataExport");
    const now = new Date();

    // 2. 현재 사용자 소유 요청만 조회합니다.
    const request =
      await this.accountRequestRepository.findDataExportRequestById(
        currentUser.id,
        requestId
      );

    if (!request) {
      throw new DataExportRequestNotFoundError();
    }

    // 3. READY 만료 여부를 응답 상태와 downloadUrl 계산에 반영합니다.
    return toUserDataExportRequestResponse(request, now);
  }

  // 기능 : 계정 삭제 요청의 30일 유예 만료 시각을 계산합니다.
  async createMyAccountDeletionRequest(
    currentUser: CurrentUserContext,
    command: CreateMyAccountDeletionRequestCommand
  ): Promise<AccountDeletionRequestResponse> {
    // 1. 위험 요청 확인 문구를 정확히 검증합니다.
    if (command.confirmText !== ACCOUNT_DELETION_CONFIRM_TEXT) {
      throw new AccountDeletionConfirmTextInvalidError();
    }

    const now = new Date();
    const scheduledDeletionAt = this.addGracePeriod(now);
    const reasonCode = this.normalizeOptionalText(command.reasonCode);
    const reasonMessage = this.normalizeOptionalText(command.reasonMessage);

    // 2. 계정 삭제는 일반 Trash soft delete와 섞지 않고 요청 queue row만 생성합니다.
    const request = await this.accountRequestRepository.runInTransaction(
      async (repository) => {
        const existingRequest =
          await repository.findOpenAccountDeletionRequest(currentUser.id);

        if (existingRequest) {
          return existingRequest;
        }

        return repository.createAccountDeletionRequest({
          userId: currentUser.id,
          reasonCode,
          reasonMessage,
          requestedAt: now,
          scheduledDeletionAt,
          canCancelUntil: scheduledDeletionAt,
        });
      }
    );

    // 3. 실제 삭제 job은 ProductAnalyticsEvent/UserActivationSnapshot 삭제 대상을 참고하도록 남깁니다.
    void ACCOUNT_DELETION_ANALYTICS_PURGE_TARGETS;

    return toAccountDeletionRequestResponse(request);
  }

  // 기능 : 현재 사용자 소유 계정 삭제 요청을 유예 기간 안에서 취소합니다.
  async cancelMyAccountDeletionRequest(
    currentUser: CurrentUserContext,
    requestId: string
  ): Promise<CancelAccountDeletionRequestResponse> {
    // 1. path param UUID 형식을 검증합니다.
    this.assertRequestId(requestId, "accountDeletion");
    const now = new Date();

    // 2. 현재 사용자 소유 요청인지 확인한 뒤 취소 가능한 상태만 변경합니다.
    const request = await this.accountRequestRepository.runInTransaction(
      async (repository) => {
        const existingRequest =
          await repository.findAccountDeletionRequestById(
            currentUser.id,
            requestId
          );

        if (!existingRequest) {
          throw new AccountDeletionRequestNotFoundError();
        }

        const cancelledRequest = await repository.cancelAccountDeletionRequest({
          userId: currentUser.id,
          requestId,
          cancelledAt: now,
        });

        if (!cancelledRequest) {
          throw new AccountDeletionRequestNotCancelableError();
        }

        return cancelledRequest;
      }
    );

    return toCancelAccountDeletionRequestResponse(request);
  }

  // 기능 : data export format을 G08 allowlist 기준으로 정규화합니다.
  private normalizeDataExportFormat(
    value: string | undefined
  ): UserDataExportFormat {
    const format = this.normalizeOptionalText(value) ?? "ZIP_JSON_XLSX";

    if (format === "ZIP_JSON_XLSX") {
      return format;
    }

    throw new DataExportFormatUnsupportedError();
  }

  // 기능 : 요청 ID가 UUID 형식인지 검사하고 API별 오류로 변환합니다.
  private assertRequestId(
    requestId: string,
    target: "dataExport" | "accountDeletion"
  ): void {
    if (UUID_PATTERN.test(requestId)) {
      return;
    }

    if (target === "dataExport") {
      throw new DataExportRequestIdInvalidError();
    }

    throw new AccountDeletionRequestIdInvalidError();
  }

  // 기능 : 계정 삭제 요청의 30일 유예 만료 시각을 계산합니다.
  private addGracePeriod(value: Date): Date {
    const nextDate = new Date(value);

    nextDate.setUTCDate(nextDate.getUTCDate() + ACCOUNT_DELETION_GRACE_PERIOD_DAYS);

    return nextDate;
  }

  // 기능 : 공백 문자열을 제거하고 빈 값은 null로 변환합니다.
  private normalizeOptionalText(value: string | undefined): string | null {
    const normalized = value?.trim();

    return normalized ? normalized : null;
  }
}
