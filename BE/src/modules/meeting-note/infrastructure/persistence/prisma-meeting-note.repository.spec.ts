import { PrismaMeetingNoteRepository } from "./prisma-meeting-note.repository";
import type { PrismaService } from "@/shared/infrastructure/prisma/prisma.service";

const USER_ID = "00000000-0000-4000-8000-000000000101";
const MEETING_NOTE_ID = "00000000-0000-4000-8000-000000000201";
const EXISTING_MEETING_NOTE_DEAL_ID = "00000000-0000-4000-8000-000000000301";
const NEW_MEETING_NOTE_DEAL_ID = "00000000-0000-4000-8000-000000000302";
const DEAL_ID = "00000000-0000-4000-8000-000000000401";
const NEW_DEAL_ID = "00000000-0000-4000-8000-000000000402";
const MEETING_AT = new Date("2026-07-26T05:00:00.000Z");

describe("PrismaMeetingNoteRepository deal activity integration", () => {
  it("creates linked activity only for newly linked deals during replace", async () => {
    const client = createMockClient();
    client.meetingNoteDeal.findMany.mockResolvedValue([
      createExistingMeetingNoteDealRow(),
    ]);
    client.meetingNote.findFirst.mockResolvedValue(createMeetingNoteContext());
    client.meetingNoteDeal.deleteMany.mockResolvedValue({ count: 1 });
    client.meetingNoteDeal.create
      .mockResolvedValueOnce({ id: EXISTING_MEETING_NOTE_DEAL_ID })
      .mockResolvedValueOnce({ id: NEW_MEETING_NOTE_DEAL_ID });
    client.dealActivity.findFirst.mockResolvedValue(null);
    client.dealActivity.create.mockResolvedValue(createDealActivityRow());
    const repository = new PrismaMeetingNoteRepository(
      client as unknown as PrismaService
    );

    await repository.replaceMeetingNoteRelations({
      userId: USER_ID,
      meetingNoteId: MEETING_NOTE_ID,
      deals: [
        createDealInput(DEAL_ID, "Acme Renewal"),
        createDealInput(NEW_DEAL_ID, "Acme Upsell"),
      ],
    });

    expect(client.dealActivity.create).toHaveBeenCalledTimes(1);
    expect(client.dealActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: USER_ID,
        dealId: NEW_DEAL_ID,
        activityType: "MEETING_NOTE_LINKED",
        sourceType: "MEETING_NOTE",
        sourceId: NEW_MEETING_NOTE_DEAL_ID,
        title: "회의록을 연결했어요.",
        body: null,
      }),
      select: expect.objectContaining({
        id: true,
      }),
    });
  });

  it("creates unlinked activity for removed deals before relation recreation", async () => {
    const client = createMockClient();
    client.meetingNoteDeal.findMany.mockResolvedValue([
      createExistingMeetingNoteDealRow(),
    ]);
    client.meetingNote.findFirst.mockResolvedValue(createMeetingNoteContext());
    client.meetingNoteDeal.deleteMany.mockResolvedValue({ count: 1 });
    client.dealActivity.findFirst.mockResolvedValue(null);
    client.dealActivity.create.mockResolvedValue(createDealActivityRow());
    const repository = new PrismaMeetingNoteRepository(
      client as unknown as PrismaService
    );

    await repository.replaceMeetingNoteRelations({
      userId: USER_ID,
      meetingNoteId: MEETING_NOTE_ID,
      deals: [],
    });

    expect(client.dealActivity.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        dealId: DEAL_ID,
        activityType: "MEETING_NOTE_UNLINKED",
        sourceId: EXISTING_MEETING_NOTE_DEAL_ID,
        title: "회의록 연결을 해제했어요.",
      }),
      select: expect.objectContaining({
        id: true,
      }),
    });
  });
});

function createMockClient() {
  return {
    meetingNote: {
      findFirst: jest.fn(),
    },
    meetingNoteDeal: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    dealActivity: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };
}

function createMeetingNoteContext() {
  return {
    id: MEETING_NOTE_ID,
    title: "도입 검토 미팅",
    meetingAt: MEETING_AT,
  };
}

function createExistingMeetingNoteDealRow() {
  return {
    id: EXISTING_MEETING_NOTE_DEAL_ID,
    dealId: DEAL_ID,
    dealNameSnapshot: "Acme Renewal",
    meetingNote: {
      ...createMeetingNoteContext(),
      deletedAt: null,
    },
  };
}

function createDealInput(dealId: string, dealNameSnapshot: string) {
  return {
    dealId,
    dealNameSnapshot,
    dealStatusSnapshot: "NEGOTIATION",
    dealCostSnapshot: 5000,
    dealExpectedEndDateSnapshot: new Date("2026-07-31T00:00:00.000Z"),
  };
}

function createDealActivityRow() {
  return {
    id: "activity-1",
    userId: USER_ID,
    dealId: DEAL_ID,
    activityType: "MEETING_NOTE_LINKED",
    sourceType: "MEETING_NOTE",
    sourceId: NEW_MEETING_NOTE_DEAL_ID,
    title: "회의록을 연결했어요.",
    summary: "도입 검토 미팅",
    body: null,
    occurredAt: MEETING_AT,
    linkedRecordsJson: [],
    metadataJson: {},
    createdAt: MEETING_AT,
    updatedAt: MEETING_AT,
  };
}
