import { ConflictException, NotFoundException } from "@nestjs/common";
import type { TrashRepository } from "@/modules/trash/application/ports/trash.repository";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { TrashApplicationService } from "./trash-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const TARGET_ID = "00000000-0000-4000-8000-000000000301";

function createRepository(): jest.Mocked<TrashRepository> {
  const repository = {
    listTrash: jest.fn(),
    getTrashDetail: jest.fn(),
    restoreTrashItem: jest.fn(),
    runInTransaction: jest.fn(),
  };

  repository.runInTransaction.mockImplementation(
    async (work: (repository: TrashRepository) => Promise<unknown>) =>
      work(repository)
  );

  return repository;
}

describe("TrashApplicationService", () => {
  it("delegates list requests with the current user context", async () => {
    const repository = createRepository();
    const service = new TrashApplicationService(repository);

    repository.listTrash.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 15,
      totalCount: 0,
      totalPages: 0,
    });

    await service.listTrash(CURRENT_USER, {
      targetType: "ALL",
      page: 1,
      pageSize: 15,
    });

    expect(repository.listTrash).toHaveBeenCalledWith({
      targetType: "ALL",
      page: 1,
      pageSize: 15,
      now: expect.any(Date),
      userId: CURRENT_USER.id,
    });
  });

  it("returns a trash detail owned by the current user", async () => {
    const repository = createRepository();
    const service = new TrashApplicationService(repository);
    const deletedAt = new Date("2026-06-20T00:00:00.000Z");
    const trashExpiresAt = new Date("2026-06-27T00:00:00.000Z");

    repository.getTrashDetail.mockResolvedValue({
      targetType: "COMPANY",
      targetId: TARGET_ID,
      title: "Deleted company",
      deletedAt,
      trashExpiresAt,
      restoreWindow: "ACTIVE",
      canRestore: true,
      hasPrivateMemo: false,
      privateMemoIncluded: false,
      summary: "Deleted company",
      fields: [],
    });

    const response = await service.getTrashDetail(
      CURRENT_USER,
      "COMPANY",
      TARGET_ID
    );

    expect(response.targetId).toBe(TARGET_ID);
    expect(repository.getTrashDetail).toHaveBeenCalledWith({
      now: expect.any(Date),
      targetId: TARGET_ID,
      targetType: "COMPANY",
      userId: CURRENT_USER.id,
    });
  });

  it("throws not found when the trash item detail cannot be found", async () => {
    const repository = createRepository();
    const service = new TrashApplicationService(repository);

    repository.getTrashDetail.mockResolvedValue(null);

    await expect(
      service.getTrashDetail(CURRENT_USER, "COMPANY", TARGET_ID)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("delegates restore requests with the current user context", async () => {
    const repository = createRepository();
    const service = new TrashApplicationService(repository);
    const restoredAt = new Date("2026-06-26T00:00:00.000Z");

    repository.restoreTrashItem.mockResolvedValue({
      targetType: "COMPANY",
      targetId: TARGET_ID,
      restoredAt,
    });

    const response = await service.restoreTrashItem(
      CURRENT_USER,
      "COMPANY",
      TARGET_ID
    );

    expect(response).toEqual({
      targetType: "COMPANY",
      targetId: TARGET_ID,
      restoredAt,
    });
    expect(repository.restoreTrashItem).toHaveBeenCalledWith({
      now: expect.any(Date),
      targetId: TARGET_ID,
      targetType: "COMPANY",
      userId: CURRENT_USER.id,
    });
  });

  it("throws conflict when a log restore is blocked by a deleted parent", async () => {
    const repository = createRepository();
    const service = new TrashApplicationService(repository);

    repository.restoreTrashItem.mockResolvedValue({
      blockedReason: "PARENT_DELETED",
    });

    await expect(
      service.restoreTrashItem(CURRENT_USER, "COMPANY_MEMO_LOG", TARGET_ID)
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("throws not found when the trash item cannot be restored", async () => {
    const repository = createRepository();
    const service = new TrashApplicationService(repository);

    repository.restoreTrashItem.mockResolvedValue(null);

    await expect(
      service.restoreTrashItem(CURRENT_USER, "COMPANY", TARGET_ID)
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
