import type {
  ChangeDealStageInput,
  CompleteDealNextActionInput,
  CreateDealActivityInput,
  CreateDealInput,
  DealActivityRecord,
  DealDetailRecord,
  DealListResult,
  DealRecord,
  DealRepository,
  DeleteResultRecord,
  ListDealActivitiesInput,
  ListDealsInput,
  PaginatedResult,
  SnoozeDealNextActionInput,
  UpdateDealActivityInput,
  UpdateDealInput,
  UpdateDealNextActionInput,
} from "@/modules/deal/application/ports/deal.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  DeletedResourceError,
  ValidationDomainError,
} from "@/shared/domain/errors/common.errors";
import { ChangeDealStageUseCase } from "./change-deal-stage.use-case";
import { CompleteDealNextActionUseCase } from "./complete-deal-next-action.use-case";
import { CreateDealUseCase } from "./create-deal.use-case";
import { DeleteDealUseCase } from "./delete-deal.use-case";
import { GetDealUseCase } from "./get-deal.use-case";
import { ListDealsUseCase } from "./list-deals.use-case";
import { UpdateDealNextActionUseCase } from "./update-deal-next-action.use-case";

class FakeDealRepository implements DealRepository {
  createInput: CreateDealInput | null = null;
  listInput: ListDealsInput | null = null;
  deleteInput: {
    readonly userId: string;
    readonly dealId: string;
  } | null = null;
  stageInput: ChangeDealStageInput | null = null;
  nextActionInput: UpdateDealNextActionInput | null = null;
  completeInput: CompleteDealNextActionInput | null = null;
  detail: DealDetailRecord | null = null;

  async listDeals(input: ListDealsInput): Promise<DealListResult> {
    this.listInput = input;

    return {
      items: [],
      stageSummary: {
        INITIAL_CONTACT: 0,
        IN_DISCUSSION: 0,
        WON: 0,
        LOST: 0,
      },
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async createDeal(input: CreateDealInput): Promise<DealRecord> {
    this.createInput = input;

    return createDealRecord({
      id: "deal-1",
      userId: input.userId,
      title: input.title,
      amount: input.amount,
      stage: input.stage,
      nextActionText: input.nextActionText,
      deletedAt: null,
    });
  }

  async getDealDetail(): Promise<DealDetailRecord | null> {
    return this.detail;
  }

  async updateDeal(input: UpdateDealInput): Promise<DealRecord> {
    return createDealRecord({
      id: input.dealId,
      userId: input.userId,
      title: input.title ?? "딜",
      amount: input.amount ?? 0,
      stage: input.stage ?? "INITIAL_CONTACT",
      nextActionText: input.nextActionText ?? null,
      deletedAt: null,
    });
  }

  async changeDealStage(input: ChangeDealStageInput): Promise<DealRecord> {
    this.stageInput = input;

    return createDealRecord({
      id: input.dealId,
      userId: input.userId,
      title: "딜",
      amount: 1000,
      stage: input.stage,
      nextActionText: null,
      deletedAt: null,
    });
  }

  async updateDealNextAction(
    input: UpdateDealNextActionInput
  ): Promise<DealRecord> {
    this.nextActionInput = input;

    return createDealRecord({
      id: input.dealId,
      userId: input.userId,
      title: "딜",
      amount: 1000,
      stage: "INITIAL_CONTACT",
      nextActionText: input.nextActionText ?? null,
      deletedAt: null,
    });
  }

  async completeDealNextAction(
    input: CompleteDealNextActionInput
  ): Promise<DealRecord> {
    this.completeInput = input;

    return createDealRecord({
      id: input.dealId,
      userId: input.userId,
      title: "딜",
      amount: 1000,
      stage: "INITIAL_CONTACT",
      nextActionText: "제안서 전달",
      deletedAt: null,
      nextActionStatus: "DONE",
    });
  }

  async snoozeDealNextAction(
    input: SnoozeDealNextActionInput
  ): Promise<DealRecord> {
    return createDealRecord({
      id: input.dealId,
      userId: input.userId,
      title: "딜",
      amount: 1000,
      stage: "INITIAL_CONTACT",
      nextActionText: "제안서 전달",
      deletedAt: null,
    });
  }

  async deleteDeal(
    userId: string,
    dealId: string,
    now: Date,
    permanentDeleteAt: Date
  ): Promise<DeleteResultRecord> {
    this.deleteInput = { userId, dealId };

    return {
      id: dealId,
      deletedAt: now,
      permanentDeleteAt,
    };
  }

  async restoreDeal(userId: string, dealId: string): Promise<DealRecord> {
    return createDealRecord({
      id: dealId,
      userId,
      title: "딜",
      amount: 1000,
      stage: "INITIAL_CONTACT",
      nextActionText: null,
      deletedAt: null,
    });
  }

  async listDealActivities(
    input: ListDealActivitiesInput
  ): Promise<PaginatedResult<DealActivityRecord>> {
    return {
      items: [],
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 0,
      hasNext: false,
    };
  }

  async createDealActivity(
    input: CreateDealActivityInput
  ): Promise<DealActivityRecord> {
    return createDealActivityRecord(input.dealId, input.title);
  }

  async updateDealActivity(
    input: UpdateDealActivityInput
  ): Promise<DealActivityRecord> {
    return createDealActivityRecord(input.dealId, input.title ?? "딜 활동");
  }

  async deleteDealActivity(): Promise<DeleteResultRecord> {
    throw new Error("Not implemented in fake repository");
  }
}

describe("Deal use cases", () => {
  it("normalizes create input and passes current user ownership", async () => {
    const repository = new FakeDealRepository();
    const useCase = new CreateDealUseCase(repository);

    await useCase.execute(currentUser(), {
      title: "  1차 도입 딜  ",
      companyId: "  company-1  ",
      contactId: "  contact-1  ",
      amount: 1200000,
      currency: " usd ",
      stage: "IN_DISCUSSION",
      likelihoodStatus: "POSITIVE",
      likelihoodPercent: 70,
      expectedCloseDate: "2026-06-30T00:00:00.000Z",
      nextActionText: "  제안서 전달  ",
      nextActionDueAt: "2026-06-07T00:00:00.000Z",
      productIds: [" product-1 ", "product-1", "product-2"],
      initialMemo: "  예산 확인 필요  ",
    });

    expect(repository.createInput).toMatchObject({
      userId: "user-1",
      title: "1차 도입 딜",
      companyId: "company-1",
      contactId: "contact-1",
      amount: 1200000,
      currency: "USD",
      stage: "IN_DISCUSSION",
      likelihoodStatus: "POSITIVE",
      likelihoodPercent: 70,
      nextActionText: "제안서 전달",
      productIds: ["product-1", "product-2"],
      initialMemo: "예산 확인 필요",
    });
  });

  it("rejects missing titles and invalid amounts", async () => {
    const repository = new FakeDealRepository();
    const useCase = new CreateDealUseCase(repository);

    await expect(
      useCase.execute(currentUser(), {
        title: "   ",
        amount: 1000,
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);

    await expect(
      useCase.execute(currentUser(), {
        title: "딜",
        amount: -1,
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
  });

  it("normalizes list filters and pagination", async () => {
    const repository = new FakeDealRepository();
    const useCase = new ListDealsUseCase(repository);

    await useCase.execute(currentUser(), {
      page: -1,
      pageSize: 500,
      stage: "WON",
      likelihood: "POSITIVE",
      companyId: "  company-1  ",
      search: "  도입  ",
      nextActionStatus: "SCHEDULED",
      includeDeleted: true,
    });

    expect(repository.listInput).toEqual({
      userId: "user-1",
      page: 1,
      pageSize: 100,
      stage: "WON",
      likelihoodStatus: "POSITIVE",
      companyId: "company-1",
      contactId: null,
      search: "도입",
      nextActionStatus: "SCHEDULED",
      includeDeleted: true,
    });
  });

  it("returns DeletedResource for deleted deal detail reads", async () => {
    const repository = new FakeDealRepository();
    repository.detail = {
      deal: createDealRecord({
        id: "deal-1",
        userId: "user-1",
        title: "삭제된 딜",
        amount: 1000,
        stage: "INITIAL_CONTACT",
        nextActionText: null,
        deletedAt: new Date("2026-06-06T00:00:00.000Z"),
      }),
      products: [],
      activities: [],
      memos: [],
      schedulesSummary: { totalCount: 0, upcomingCount: 0 },
      meetingNotesSummary: { totalCount: 0, latestMeetingAt: null },
    };
    const useCase = new GetDealUseCase(repository);

    await expect(
      useCase.execute(currentUser(), "deal-1")
    ).rejects.toBeInstanceOf(DeletedResourceError);
  });

  it("normalizes stage change input", async () => {
    const repository = new FakeDealRepository();
    const useCase = new ChangeDealStageUseCase(repository);

    await useCase.execute(currentUser(), "deal-1", {
      stage: "WON",
      activityTitle: "  수주 확정  ",
      activityContent: "  계약 완료  ",
    });

    expect(repository.stageInput).toMatchObject({
      userId: "user-1",
      dealId: "deal-1",
      stage: "WON",
      activityTitle: "수주 확정",
      activityContent: "계약 완료",
    });
  });

  it("normalizes next action commands", async () => {
    const repository = new FakeDealRepository();
    const updateUseCase = new UpdateDealNextActionUseCase(repository);
    const completeUseCase = new CompleteDealNextActionUseCase(repository);

    await updateUseCase.execute(currentUser(), "deal-1", {
      nextActionText: "  제안서 전달  ",
      nextActionDueAt: "2026-06-07T00:00:00.000Z",
      nextActionStatus: "SCHEDULED",
    });
    await completeUseCase.execute(currentUser(), "deal-1", {
      completedAt: "2026-06-06T01:00:00.000Z",
      activityContent: "  완료 확인  ",
    });

    expect(repository.nextActionInput).toMatchObject({
      userId: "user-1",
      dealId: "deal-1",
      nextActionText: "제안서 전달",
      nextActionStatus: "SCHEDULED",
    });
    expect(repository.completeInput).toMatchObject({
      userId: "user-1",
      dealId: "deal-1",
      activityContent: "완료 확인",
    });
  });

  it("passes current user ownership to delete", async () => {
    const repository = new FakeDealRepository();
    const useCase = new DeleteDealUseCase(repository);

    const response = await useCase.execute(currentUser(), "deal-1");

    expect(repository.deleteInput).toEqual({
      userId: "user-1",
      dealId: "deal-1",
    });
    expect(response.id).toBe("deal-1");
  });
});

function currentUser(): CurrentUserContext {
  return {
    id: "user-1",
    sessionId: "session-1",
    email: "user@example.com",
    displayName: "User",
    role: "USER",
    status: "ACTIVE",
  };
}

function createDealRecord(input: {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly amount: number;
  readonly stage: DealRecord["stage"];
  readonly nextActionText: string | null;
  readonly deletedAt: Date | null;
  readonly nextActionStatus?: DealRecord["nextActionStatus"];
}): DealRecord {
  const now = new Date("2026-06-06T00:00:00.000Z");

  return {
    id: input.id,
    userId: input.userId,
    title: input.title,
    companyId: null,
    companyName: null,
    contactId: null,
    contactName: null,
    amount: input.amount,
    currency: "KRW",
    stage: input.stage,
    likelihoodStatus: "NEUTRAL",
    likelihoodPercent: null,
    expectedCloseDate: null,
    nextActionText: input.nextActionText,
    nextActionDueAt: null,
    nextActionStatus: input.nextActionStatus ?? "NONE",
    memoSummary: {
      hasMemo: false,
      memoCount: 0,
      latestMemoAt: null,
    },
    createdAt: now,
    updatedAt: now,
    deletedAt: input.deletedAt,
    permanentDeleteAt: null,
  };
}

function createDealActivityRecord(
  dealId: string,
  title: string
): DealActivityRecord {
  const now = new Date("2026-06-06T00:00:00.000Z");

  return {
    id: "activity-1",
    dealId,
    typeId: "type-1",
    typeName: "기타 기록",
    occurredAt: now,
    title,
    content: null,
    isAutoGenerated: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    permanentDeleteAt: null,
  };
}
