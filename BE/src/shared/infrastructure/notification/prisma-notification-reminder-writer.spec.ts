import { PrismaNotificationReminderWriter } from "./prisma-notification-reminder-writer";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const USER_ID = "00000000-0000-4000-8000-000000000101";
const SOURCE_ID = "00000000-0000-4000-8000-000000000201";
const NOTIFICATION_ID = "00000000-0000-4000-8000-000000000301";
const NOW = new Date("2026-07-26T05:00:00.000Z");

describe("PrismaNotificationReminderWriter", () => {
  it("creates a reminder notification with the provided transaction client", async () => {
    const client = createMockClient();
    client.notification.findFirst.mockResolvedValue(null);
    client.notification.create.mockResolvedValue(createNotificationRow());
    const writer = new PrismaNotificationReminderWriter(
      client as unknown as PrismaService
    );

    const notification = await writer.upsertReminderNotification({
      userId: USER_ID,
      type: "SCHEDULE_START_REMINDER",
      sourceType: "SCHEDULE",
      sourceId: SOURCE_ID,
      dedupeKey: "schedule:source:start",
      targetPath: `/app/schedules/${SOURCE_ID}`,
      title: "Schedule reminder",
      body: "Starts soon.",
      targetLabel: "Demo Meeting",
      scheduledAt: NOW,
      metadataJson: { reminderMinutes: 30 },
      now: NOW,
    });

    expect(notification.id).toBe(NOTIFICATION_ID);
    expect(client.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: USER_ID,
        sourceType: "SCHEDULE",
        sourceId: SOURCE_ID,
        dedupeKey: "schedule:source:start",
        metadataJson: { reminderMinutes: 30 },
      }),
    });
  });

  it("keeps sent reminders immutable during upsert", async () => {
    const client = createMockClient();
    client.notification.findFirst.mockResolvedValue(
      createNotificationRow({ status: "SENT" })
    );
    const writer = new PrismaNotificationReminderWriter(
      client as unknown as PrismaService
    );

    const notification = await writer.upsertReminderNotification({
      userId: USER_ID,
      type: "SCHEDULE_START_REMINDER",
      sourceType: "SCHEDULE",
      sourceId: SOURCE_ID,
      dedupeKey: "schedule:source:start",
      targetPath: `/app/schedules/${SOURCE_ID}`,
      title: "Updated title",
      scheduledAt: NOW,
      now: NOW,
    });

    expect(notification.status).toBe("SENT");
    expect(client.notification.update).not.toHaveBeenCalled();
  });

  it("cancels only pending reminders for the source", async () => {
    const client = createMockClient();
    client.notification.updateMany.mockResolvedValue({ count: 2 });
    const writer = new PrismaNotificationReminderWriter(
      client as unknown as PrismaService
    );

    const canceled = await writer.cancelPendingNotificationsBySource({
      userId: USER_ID,
      sourceType: "SCHEDULE",
      sourceId: SOURCE_ID,
      excludeDedupeKey: "schedule:source:start",
      cancelReason: "SOURCE_UPDATED",
      canceledAt: NOW,
    });

    expect(canceled).toBe(2);
    expect(client.notification.updateMany).toHaveBeenCalledWith({
      where: {
        userId: USER_ID,
        sourceType: "SCHEDULE",
        sourceId: SOURCE_ID,
        status: "PENDING",
        dedupeKey: { not: "schedule:source:start" },
      },
      data: {
        status: "CANCELED",
        canceledAt: NOW,
        cancelReason: "SOURCE_UPDATED",
      },
    });
  });
});

// 기능 : notification reminder writer 테스트에 필요한 Prisma client mock을 생성합니다.
function createMockClient() {
  return {
    userNotificationSetting: {
      findUnique: jest.fn(),
    },
    notification: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
}

// 기능 : 기본 알림 row fixture에 테스트별 override를 합성합니다.
function createNotificationRow(
  input: Partial<ReturnType<typeof createBaseNotificationRow>> = {}
) {
  return {
    ...createBaseNotificationRow(),
    ...input,
  };
}

// 기능 : reminder writer 테스트에 사용할 기본 알림 Prisma row fixture를 생성합니다.
function createBaseNotificationRow() {
  return {
    id: NOTIFICATION_ID,
    userId: USER_ID,
    type: "SCHEDULE_START_REMINDER",
    sourceType: "SCHEDULE",
    sourceId: SOURCE_ID,
    dedupeKey: "schedule:source:start",
    targetPath: `/app/schedules/${SOURCE_ID}`,
    title: "Schedule reminder",
    body: "Starts soon.",
    targetLabel: "Demo Meeting",
    status: "PENDING",
    scheduledAt: NOW,
    sentAt: null,
    readAt: null,
    canceledAt: null,
    cancelReason: null,
    metadataJson: { reminderMinutes: 30 },
    createdAt: NOW,
    updatedAt: NOW,
  };
}
