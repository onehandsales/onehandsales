import { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";
import { PrismaGoogleCalendarConnectionRepository } from "./prisma-google-calendar-connection.repository";

type MockPrismaClient = {
  readonly externalCalendarConnection: {
    readonly findUnique: jest.Mock;
    readonly update: jest.Mock;
    readonly upsert: jest.Mock;
  };
  readonly externalCalendarSource: {
    readonly updateMany: jest.Mock;
  };
  readonly schedule: {
    readonly findMany: jest.Mock;
    readonly updateMany: jest.Mock;
  };
};

function createClient(): MockPrismaClient {
  return {
    externalCalendarConnection: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    externalCalendarSource: {
      updateMany: jest.fn(),
    },
    schedule: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };
}

describe("PrismaGoogleCalendarConnectionRepository", () => {
  it("disconnects with TRASH by soft deleting active Google schedules and discarding tokens", async () => {
    const client = createClient();
    client.externalCalendarConnection.findUnique.mockResolvedValue({
      id: "connection-1",
    });
    client.schedule.findMany.mockResolvedValue([
      { id: "schedule-1" },
      { id: "schedule-2" },
    ]);
    client.schedule.updateMany.mockResolvedValue({ count: 2 });
    client.externalCalendarConnection.update.mockResolvedValue({});
    const repository = new PrismaGoogleCalendarConnectionRepository(
      client as unknown as PrismaService
    );
    const disconnectedAt = new Date("2026-07-23T02:00:00.000Z");
    const deletedAt = new Date("2026-07-23T02:00:00.000Z");
    const trashExpiresAt = new Date("2026-07-30T02:00:00.000Z");

    const result = await repository.disconnectConnection({
      userId: "user-1",
      scheduleAction: "TRASH",
      disconnectedAt,
      deletedAt,
      trashExpiresAt,
    });

    expect(client.schedule.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        id: {
          in: ["schedule-1", "schedule-2"],
        },
        deletedAt: null,
      },
      data: {
        deletedAt,
        deletedByUserId: "user-1",
        trashExpiresAt,
        externalSyncStatus: "LOCAL_DELETED",
      },
    });
    expect(client.externalCalendarConnection.update).toHaveBeenCalledWith({
      where: {
        id: "connection-1",
      },
      data: {
        encryptedAccessToken: null,
        encryptedRefreshToken: null,
        tokenExpiresAt: null,
        status: "DISCONNECTED",
        disconnectedAt,
        reconnectRequiredAt: null,
      },
    });
    expect(result).toMatchObject({
      connectionStatus: "DISCONNECTED",
      scheduleAction: "TRASH",
      affectedScheduleCount: 2,
      trashedScheduleCount: 2,
      trashedScheduleIds: ["schedule-1", "schedule-2"],
    });
  });
});
