import type {
  ListTrashInput,
  PurgeExpiredTrashResult,
  TrashListResult,
  TrashRepository,
  TrashRestoreRecord,
} from "@/modules/trash/application/ports/trash.repository";
import { PermanentDeleteNotAllowedError } from "@/modules/trash/domain/trash.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ListTrashUseCase } from "./list-trash.use-case";
import { PermanentlyDeleteTrashItemUseCase } from "./permanently-delete-trash-item.use-case";
import { PurgeExpiredTrashUseCase } from "./purge-expired-trash.use-case";
import { RestoreTrashItemUseCase } from "./restore-trash-item.use-case";

class FakeTrashRepository implements TrashRepository {
  listInput: ListTrashInput | null = null;
  restoreInput: Parameters<TrashRepository["restoreTrashItem"]>[0] | null =
    null;
  purgeInput: Parameters<TrashRepository["purgeExpiredTrash"]>[0] | null = null;

  async listTrash(input: ListTrashInput): Promise<TrashListResult> {
    this.listInput = input;

    return {
      items: [
        {
          targetType: "COMPANY",
          targetId: "company-1",
          title: "테스트 회사",
          deletedAt: new Date("2026-06-01T00:00:00.000Z"),
          permanentDeleteAt: new Date("2026-07-01T00:00:00.000Z"),
        },
      ],
      page: input.page,
      pageSize: input.pageSize,
      totalCount: 1,
      hasNext: false,
    };
  }

  async restoreTrashItem(
    input: Parameters<TrashRepository["restoreTrashItem"]>[0]
  ): Promise<TrashRestoreRecord> {
    this.restoreInput = input;

    return {
      targetType: input.targetType,
      targetId: input.targetId,
      restoredAt: input.now,
      resource: { id: input.targetId, title: "복구 항목" },
    };
  }

  async purgeExpiredTrash(
    input: Parameters<TrashRepository["purgeExpiredTrash"]>[0]
  ): Promise<PurgeExpiredTrashResult> {
    this.purgeInput = input;

    return {
      deletedCountByTargetType: {
        COMPANY: 2,
        CONTACT: 1,
      },
    };
  }
}

const currentUser: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "테스트 사용자",
  role: "USER",
  status: "ACTIVE",
};

describe("Trash use cases", () => {
  it("lists trash items with normalized filters and ISO dates", async () => {
    const repository = new FakeTrashRepository();
    const useCase = new ListTrashUseCase(repository);

    const result = await useCase.execute(currentUser, {
      targetType: "company",
      page: 2,
      pageSize: 10,
    });

    expect(repository.listInput).toEqual({
      userId: "user-1",
      targetType: "COMPANY",
      page: 2,
      pageSize: 10,
    });
    expect(result).toEqual({
      items: [
        {
          targetType: "COMPANY",
          targetId: "company-1",
          title: "테스트 회사",
          deletedAt: "2026-06-01T00:00:00.000Z",
          permanentDeleteAt: "2026-07-01T00:00:00.000Z",
        },
      ],
      page: 2,
      pageSize: 10,
      totalCount: 1,
      hasNext: false,
    });
  });

  it("uses the primary entity list when targetType is omitted", async () => {
    const repository = new FakeTrashRepository();
    const useCase = new ListTrashUseCase(repository);

    await useCase.execute(currentUser, {});

    expect(repository.listInput).toMatchObject({
      userId: "user-1",
      targetType: null,
      page: 1,
      pageSize: 20,
    });
  });

  it("restores a supported trash target for the current user", async () => {
    const repository = new FakeTrashRepository();
    const useCase = new RestoreTrashItemUseCase(repository);

    const before = Date.now();
    const result = await useCase.execute(currentUser, "deal", "deal-1");
    const after = Date.now();

    expect(repository.restoreInput).toMatchObject({
      userId: "user-1",
      targetType: "DEAL",
      targetId: "deal-1",
    });
    expect(repository.restoreInput?.now.getTime()).toBeGreaterThanOrEqual(
      before
    );
    expect(repository.restoreInput?.now.getTime()).toBeLessThanOrEqual(after);
    expect(result.targetType).toBe("DEAL");
    expect(result.targetId).toBe("deal-1");
    expect(result.resource).toEqual({ id: "deal-1", title: "복구 항목" });
  });

  it("blocks user-initiated permanent deletes in MVP", () => {
    const useCase = new PermanentlyDeleteTrashItemUseCase();

    expect(() => useCase.execute()).toThrow(PermanentDeleteNotAllowedError);
  });

  it("purges expired trash with a default batch limit", async () => {
    const repository = new FakeTrashRepository();
    const useCase = new PurgeExpiredTrashUseCase(repository);
    const now = new Date("2026-06-07T00:00:00.000Z");

    const result = await useCase.execute({ now });

    expect(repository.purgeInput).toEqual({
      now,
      limit: 500,
    });
    expect(result).toEqual({
      deletedCountByTargetType: {
        COMPANY: 2,
        CONTACT: 1,
      },
    });
  });
});
