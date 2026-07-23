import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaTrashRepository } from "./prisma-trash.repository";

type MockPrismaClient = {
  readonly schedule: {
    readonly findFirst: jest.Mock;
  };
};

function createClient(): MockPrismaClient {
  return {
    schedule: {
      findFirst: jest.fn(),
    },
  };
}

describe("PrismaTrashRepository", () => {
  it("returns schedule trash detail fields with the API contract labels", async () => {
    const client = createClient();
    const deletedAt = new Date("2026-07-23T02:00:00.000Z");
    const trashExpiresAt = new Date("2026-07-30T02:00:00.000Z");
    client.schedule.findFirst.mockResolvedValue({
      id: "schedule-1",
      scheduleTitle: "Google demo",
      startAt: new Date("2026-07-24T01:00:00.000Z"),
      endAt: new Date("2026-07-24T02:00:00.000Z"),
      timeZone: "Asia/Seoul",
      location: "Demo room",
      meetingUrl: "https://meet.google.com/abc-defg-hij?authuser=0",
      memo: "memo body",
      sourceType: "GOOGLE",
      externalSyncStatus: "LOCAL_DELETED",
      deletedAt,
      trashExpiresAt,
      externalCalendarSource: {
        status: "SELECTED",
        calendarName: "sales@example.com",
        connection: {
          status: "CONNECTED",
        },
      },
      _count: {
        scheduleDeals: 2,
      },
    });
    const repository = new PrismaTrashRepository(
      client as unknown as PrismaService,
    );

    const detail = await repository.getTrashDetail({
      userId: "user-1",
      targetType: "SCHEDULE",
      targetId: "schedule-1",
      now: new Date("2026-07-24T00:00:00.000Z"),
    });

    expect(detail).toMatchObject({
      targetType: "SCHEDULE",
      targetId: "schedule-1",
      title: "Google demo",
      summary: "Google demo 일정 데이터",
      content: "memo body",
    });
    expect(detail?.fields.map((field) => field.label)).toEqual([
      "일정 시간",
      "장소",
      "출처",
      "미팅 링크",
      "연결 딜",
    ]);
    expect(detail?.fields).toEqual(
      expect.arrayContaining([
        { label: "출처", value: "Google · 로컬 삭제" },
        { label: "미팅 링크", value: "meet.google.com" },
        { label: "연결 딜", value: "2" },
      ]),
    );
    expect(client.schedule.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "schedule-1",
          userId: "user-1",
        }),
      }),
    );
  });

  it("uses a Korean source label for internal schedule trash detail", async () => {
    const client = createClient();
    const deletedAt = new Date("2026-07-23T02:00:00.000Z");
    const trashExpiresAt = new Date("2026-07-30T02:00:00.000Z");
    client.schedule.findFirst.mockResolvedValue({
      id: "schedule-1",
      scheduleTitle: "Internal demo",
      startAt: new Date("2026-07-24T01:00:00.000Z"),
      endAt: new Date("2026-07-24T02:00:00.000Z"),
      timeZone: "Asia/Seoul",
      location: null,
      meetingUrl: null,
      memo: null,
      sourceType: "INTERNAL",
      externalSyncStatus: null,
      deletedAt,
      trashExpiresAt,
      externalCalendarSource: null,
      _count: {
        scheduleDeals: 0,
      },
    });
    const repository = new PrismaTrashRepository(
      client as unknown as PrismaService,
    );

    const detail = await repository.getTrashDetail({
      userId: "user-1",
      targetType: "SCHEDULE",
      targetId: "schedule-1",
      now: new Date("2026-07-24T00:00:00.000Z"),
    });

    expect(detail?.fields).toEqual(
      expect.arrayContaining([{ label: "출처", value: "한손" }]),
    );
  });
});
