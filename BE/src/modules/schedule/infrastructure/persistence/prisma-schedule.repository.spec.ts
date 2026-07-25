import { PrismaScheduleRepository } from "./prisma-schedule.repository";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const USER_ID = "00000000-0000-4000-8000-000000000101";
const SCHEDULE_ID = "00000000-0000-4000-8000-000000000201";
const SCHEDULE_DEAL_ID = "00000000-0000-4000-8000-000000000301";
const DEAL_ID = "00000000-0000-4000-8000-000000000401";
const START_AT = new Date("2026-07-26T05:00:00.000Z");

describe("PrismaScheduleRepository deal activity integration", () => {
  it("creates a schedule linked activity with ScheduleDeal source id", async () => {
    const client = createMockClient();
    client.schedule.findFirst.mockResolvedValue(createScheduleRow());
    client.deal.findMany.mockResolvedValue([{ id: DEAL_ID, dealName: "Acme Deal" }]);
    client.scheduleDeal.create.mockResolvedValue({ id: SCHEDULE_DEAL_ID });
    client.dealActivity.findFirst.mockResolvedValue(null);
    client.dealActivity.create.mockResolvedValue(createDealActivityRow());
    const repository = new PrismaScheduleRepository(
      client as unknown as PrismaService
    );

    await repository.createScheduleDeals({
      userId: USER_ID,
      scheduleId: SCHEDULE_ID,
      dealIds: [DEAL_ID],
    });

    expect(client.dealActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: USER_ID,
        dealId: DEAL_ID,
        activityType: "SCHEDULE_LINKED",
        sourceType: "SCHEDULE",
        sourceId: SCHEDULE_DEAL_ID,
        title: "일정을 연결했어요.",
        body: null,
      }),
      select: expect.objectContaining({
        id: true,
      }),
    });
  });

  it("creates a schedule unlinked activity before deleting relation rows", async () => {
    const client = createMockClient();
    client.scheduleDeal.findMany.mockResolvedValue([
      {
        id: SCHEDULE_DEAL_ID,
        dealId: DEAL_ID,
        deal: { id: DEAL_ID, dealName: "Acme Deal" },
        schedule: {
          ...createScheduleRow(),
          deletedAt: null,
        },
      },
    ]);
    client.scheduleDeal.deleteMany.mockResolvedValue({ count: 1 });
    client.dealActivity.findFirst.mockResolvedValue(null);
    client.dealActivity.create.mockResolvedValue(createDealActivityRow());
    const repository = new PrismaScheduleRepository(
      client as unknown as PrismaService
    );

    await repository.deleteScheduleDeals({
      userId: USER_ID,
      scheduleId: SCHEDULE_ID,
      dealIds: [DEAL_ID],
    });

    const readOrder = client.scheduleDeal.findMany.mock.invocationCallOrder[0] ?? 0;
    const deleteOrder =
      client.scheduleDeal.deleteMany.mock.invocationCallOrder[0] ?? 0;

    expect(readOrder).toBeGreaterThan(0);
    expect(readOrder).toBeLessThan(deleteOrder);
    expect(client.dealActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        activityType: "SCHEDULE_UNLINKED",
        sourceId: SCHEDULE_DEAL_ID,
        title: "일정 연결을 해제했어요.",
      }),
      select: expect.objectContaining({
        id: true,
      }),
    });
  });
});

function createMockClient() {
  return {
    schedule: {
      findFirst: jest.fn(),
    },
    deal: {
      findMany: jest.fn(),
    },
    scheduleDeal: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    dealActivity: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };
}

function createScheduleRow() {
  return {
    id: SCHEDULE_ID,
    scheduleTitle: "Demo Meeting",
    startAt: START_AT,
  };
}

function createDealActivityRow() {
  return {
    id: "activity-1",
    userId: USER_ID,
    dealId: DEAL_ID,
    activityType: "SCHEDULE_LINKED",
    sourceType: "SCHEDULE",
    sourceId: SCHEDULE_DEAL_ID,
    title: "일정을 연결했어요.",
    summary: "Demo Meeting",
    body: null,
    occurredAt: START_AT,
    linkedRecordsJson: [],
    metadataJson: {},
    createdAt: START_AT,
    updatedAt: START_AT,
  };
}
