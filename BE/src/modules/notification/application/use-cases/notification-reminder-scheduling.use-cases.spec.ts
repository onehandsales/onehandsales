import type {
  NotificationRecord,
  NotificationRepository,
} from "@/modules/notification/application/ports/notification.repository";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import {
  ScheduleDealDueReminderUseCase,
  ScheduleNotificationReminderUseCase,
} from "./notification-reminder-scheduling.use-cases";

const NOW = new Date("2026-07-22T00:00:00.000Z");
const USER_ID = "00000000-0000-4000-8000-000000000101";

describe("Notification reminder scheduling use cases", () => {
  it("creates an immediately due schedule reminder when reminder time is past but schedule is still valid", async () => {
    const repository = createRepositoryMock();
    repository.findSettingsForUser.mockResolvedValue(null);
    repository.upsertReminderNotification.mockImplementation(async (input) =>
      createNotificationFixture({
        userId: input.userId,
        type: input.type,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        dedupeKey: input.dedupeKey,
        scheduledAt: input.scheduledAt,
      })
    );
    const useCase = new ScheduleNotificationReminderUseCase(
      repository,
      createLogger()
    );

    const result = await useCase.execute({
      userId: USER_ID,
      scheduleId: "00000000-0000-4000-8000-000000000301",
      scheduleTitle: "Sales call",
      startAt: new Date("2026-07-22T00:20:00.000Z"),
      now: NOW,
    });

    expect(result.scheduled).toBe(true);
    expect(repository.cancelPendingNotificationsBySource).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_ID,
        sourceType: "SCHEDULE",
        sourceId: "00000000-0000-4000-8000-000000000301",
        excludeDedupeKey:
          "schedule:00000000-0000-4000-8000-000000000301:start:2026-07-22T00:20:00.000Z:m30",
      })
    );
    expect(repository.upsertReminderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SCHEDULE_START_REMINDER",
        scheduledAt: NOW,
        targetPath: "/app/schedules/00000000-0000-4000-8000-000000000301",
      })
    );
  });

  it("does not create schedule reminders for already past schedules", async () => {
    const repository = createRepositoryMock();
    repository.findSettingsForUser.mockResolvedValue(null);
    const useCase = new ScheduleNotificationReminderUseCase(
      repository,
      createLogger()
    );

    const result = await useCase.execute({
      userId: USER_ID,
      scheduleId: "00000000-0000-4000-8000-000000000301",
      scheduleTitle: "Sales call",
      startAt: new Date("2026-07-21T23:59:59.000Z"),
      now: NOW,
    });

    expect(result.scheduled).toBe(false);
    expect(repository.cancelPendingNotificationsBySource).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: "SCHEDULE",
        cancelReason: "SOURCE_NOT_REMINDABLE",
      })
    );
    expect(repository.upsertReminderNotification).not.toHaveBeenCalled();
  });

  it("schedules deal due reminders at user timezone local 09:00 one day before expected end date", async () => {
    const repository = createRepositoryMock();
    repository.findSettingsForUser.mockResolvedValue(null);
    repository.upsertReminderNotification.mockImplementation(async (input) =>
      createNotificationFixture({
        userId: input.userId,
        type: input.type,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        dedupeKey: input.dedupeKey,
        scheduledAt: input.scheduledAt,
      })
    );
    const useCase = new ScheduleDealDueReminderUseCase(
      repository,
      createLogger()
    );

    const result = await useCase.execute({
      userId: USER_ID,
      dealId: "00000000-0000-4000-8000-000000000401",
      dealName: "Renewal deal",
      expectedEndDate: new Date("2026-07-24T00:00:00.000Z"),
      userTimeZone: "Asia/Seoul",
      now: NOW,
    });

    expect(result.scheduled).toBe(true);
    expect(repository.upsertReminderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "DEAL_DUE_REMINDER",
        scheduledAt: new Date("2026-07-23T00:00:00.000Z"),
        targetPath: "/app/deals/00000000-0000-4000-8000-000000000401",
      })
    );
  });
});

function createRepositoryMock(): jest.Mocked<NotificationRepository> {
  const repository: Partial<jest.Mocked<NotificationRepository>> = {
    findSettingsForUser: jest.fn(),
    upsertSettings: jest.fn(),
    createNotification: jest.fn(),
    upsertReminderNotification: jest.fn(),
    findNotificationByIdForUser: jest.fn(),
    listNotificationsForUser: jest.fn(),
    countUnreadNotificationsForUser: jest.fn(),
    markNotificationReadForUser: jest.fn(),
    cancelPendingNotificationsBySource: jest.fn().mockResolvedValue(0),
    listDueNotifications: jest.fn(),
    markNotificationSent: jest.fn(),
    createDeliveryAttempt: jest.fn(),
    markDeliveryAttemptSent: jest.fn(),
    markDeliveryAttemptFailed: jest.fn(),
    markDeliveryAttemptRetryConsumed: jest.fn(),
    listRetryableDeliveryAttempts: jest.fn(),
    findUserForNotification: jest.fn(),
    upsertBrowserPushSubscription: jest.fn(),
    findBrowserPushSubscriptionForUser: jest.fn(),
    findBrowserPushSubscriptionByEndpointHash: jest.fn(),
    listActiveBrowserPushSubscriptionsForUser: jest.fn(),
    revokeBrowserPushSubscriptionForUser: jest.fn(),
  };
  repository.runInTransaction = jest.fn(
    (work: (repository: NotificationRepository) => Promise<unknown>) =>
      work(repository as jest.Mocked<NotificationRepository>)
  ) as unknown as jest.Mocked<NotificationRepository>["runInTransaction"];

  return repository as jest.Mocked<NotificationRepository>;
}

function createLogger(): AppLogger {
  return {
    log: jest.fn(),
  } as unknown as AppLogger;
}

function createNotificationFixture(
  input: Partial<NotificationRecord> = {}
): NotificationRecord {
  return {
    id: "notification-1",
    userId: USER_ID,
    type: "SCHEDULE_START_REMINDER",
    sourceType: "SCHEDULE",
    sourceId: "source-1",
    dedupeKey: "dedupe",
    targetPath: "/app/schedules/source-1",
    title: "Reminder",
    body: "Reminder body",
    targetLabel: "Target",
    status: "PENDING",
    scheduledAt: NOW,
    sentAt: null,
    readAt: null,
    canceledAt: null,
    cancelReason: null,
    metadataJson: {},
    createdAt: NOW,
    updatedAt: NOW,
    ...input,
  };
}
