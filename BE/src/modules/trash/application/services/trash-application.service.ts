import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { ScheduleNotificationReminderUseCase } from "@/modules/notification/application/use-cases/notification-reminder-scheduling.use-cases";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import {
  TRASH_REPOSITORY,
  type GetTrashDetailInput,
  type ListTrashInput,
  type RestoreTrashItemInput,
  type TrashRepository,
  type TrashTargetType,
} from "../ports/trash.repository";

type ListTrashRequest = Omit<ListTrashInput, "userId" | "now">;

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
}
