import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { ScheduleNotificationReminderUseCase } from "@/modules/notification/application/use-cases/notification-reminder-scheduling.use-cases";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import {
  TrashRecoveryRequestNotAllowedBeforeExpiryError,
  TrashRecordNotFoundError,
} from "@/modules/trash/domain/trash.errors";
import type { TrashTargetType } from "../ports/trash.types";
import {
  TRASH_REPOSITORY,
  type GetTrashDetailInput,
  type ListTrashInput,
  type RestoreTrashItemInput,
  type TrashRepository,
} from "../ports/trash.repository";

type ListTrashRequest = Omit<ListTrashInput, "userId" | "now">;

// 역할 : CreateTrashRecoveryRequestCommand 복구 문의 생성 입력을 정의합니다.
export interface CreateTrashRecoveryRequestCommand {
  readonly targetType: TrashTargetType;
  readonly targetId: string;
  readonly message: string;
}

// 역할 : TrashApplicationService 휴지통 조회와 복구 use case를 조율합니다.
@Injectable()
export class TrashApplicationService {
  // 기능 : 휴지통 저장소 구현체를 주입받습니다.
  constructor(
    @Inject(TRASH_REPOSITORY)
    private readonly trashRepository: TrashRepository,
    @Optional()
    private readonly scheduleNotificationReminder?: ScheduleNotificationReminderUseCase,
    @Optional()
    private readonly logger?: AppLogger
  ) {}

  // 기능 : 현재 사용자의 복구 가능 휴지통 목록을 조회합니다.
  listTrash(currentUser: CurrentUserContext, input: ListTrashRequest) {
    // 1. 현재 시각과 사용자 ID를 조회 조건에 추가한다.
    return this.trashRepository.listTrash({
      ...input,
      now: new Date(),
      userId: currentUser.id,
    });
  }

  // 기능 : 현재 사용자의 휴지통 단건 상세 정보를 조회합니다.
  async getTrashDetail(
    currentUser: CurrentUserContext,
    targetType: TrashTargetType,
    targetId: string
  ) {
    // 1. 현재 사용자와 대상 식별자로 휴지통 상세 조회 조건을 만든다.
    const input: GetTrashDetailInput = {
      now: new Date(),
      targetId,
      targetType,
      userId: currentUser.id,
    };

    // 2. 복구 가능 기간 안에 있는 삭제 항목을 조회한다.
    const detail = await this.trashRepository.getTrashDetail(input);

    if (!detail) {
      throw new NotFoundException("Trash item not found");
    }

    return detail;
  }

  // 기능 : 만료된 휴지통 row에 대한 복구 문의를 생성하거나 열린 요청을 반환합니다.
  async createRecoveryRequest(
    currentUser: CurrentUserContext,
    command: CreateTrashRecoveryRequestCommand
  ) {
    const now = new Date();
    const message = this.normalizeRecoveryMessage(command.message);

    // 1. 대상 조회, 만료 검증, 중복 확인, 생성을 하나의 transaction으로 묶는다.
    return this.trashRepository.runInTransaction(async (repository) => {
      const target = await repository.findRecoveryTarget({
        userId: currentUser.id,
        targetType: command.targetType,
        targetId: command.targetId,
        now,
      });

      if (!target) {
        throw new TrashRecordNotFoundError();
      }

      if (target.restoreWindow !== "EXPIRED") {
        throw new TrashRecoveryRequestNotAllowedBeforeExpiryError();
      }

      const existingRequest = await repository.findOpenRecoveryRequest({
        userId: currentUser.id,
        targetType: command.targetType,
        targetId: command.targetId,
      });

      if (existingRequest) {
        return existingRequest;
      }

      return repository.createRecoveryRequest({
        userId: currentUser.id,
        targetType: target.targetType,
        targetId: target.targetId,
        titleSnapshot: target.titleSnapshot,
        deletedAt: target.deletedAt,
        trashExpiresAt: target.trashExpiresAt,
        message,
      });
    });
  }

  // 기능 : 현재 사용자의 휴지통 단건을 복구합니다.
  async restoreTrashItem(
    currentUser: CurrentUserContext,
    targetType: TrashTargetType,
    targetId: string
  ) {
    // 1. 현재 사용자와 대상 식별자로 휴지통 복구 조건을 만든다.
    const input: RestoreTrashItemInput = {
      now: new Date(),
      targetId,
      targetType,
      userId: currentUser.id,
    };

    // 2. 삭제 상태 컬럼을 초기화해 항목을 일반 목록으로 되돌린다.
    const restored = await this.trashRepository.restoreTrashItem(input);

    if (!restored) {
      throw new NotFoundException("Trash item not found");
    }

    // 3. 상위 도메인 삭제 때문에 차단된 복구는 충돌 응답으로 변환합니다.
    if ("blockedReason" in restored) {
      throw new ConflictException(
        "상위 데이터를 먼저 복구해야 로그를 복구할 수 있습니다."
      );
    }

    if (restored.scheduleReminder && this.scheduleNotificationReminder) {
      await this.scheduleNotificationReminder.execute({
        userId: currentUser.id,
        scheduleId: restored.scheduleReminder.scheduleId,
        scheduleTitle: restored.scheduleReminder.scheduleTitle,
        startAt: restored.scheduleReminder.startAt,
        now: input.now,
      });

      this.logger?.log(
        JSON.stringify({
          event: "schedule.restored",
          userId: currentUser.id,
          scheduleId: restored.scheduleReminder.scheduleId,
        }),
        "TrashApplicationService"
      );
    }

    return restored;
  }

  // 기능 : 복구 문의 메시지를 공백 제거 후 저장 가능한 길이로 검증합니다.
  private normalizeRecoveryMessage(message: string): string {
    const normalized = message.trim();

    if (normalized.length === 0 || normalized.length > 1000) {
      throw new ValidationDomainError(
        "message must be between 1 and 1000 characters"
      );
    }

    return normalized;
  }
}
