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
const PARENT_DELETED_MESSAGE =
  "\uc0c1\uc704 \ub370\uc774\ud130\ub97c \uba3c\uc800 \ubcf5\uad6c\ud574\uc57c \ub85c\uadf8\ub97c \ubcf5\uad6c\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.";

// 기능 : TrashApplicationService 테스트용 repository mock을 생성합니다.
function createRepository(): jest.Mocked<TrashRepository> {
  return {
    listTrash: jest.fn(),
    getTrashDetail: jest.fn(),
    restoreTrashItem: jest.fn(),
  };
}

describe("TrashApplicationService", () => {
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

    let thrown: unknown;

    try {
      await service.restoreTrashItem(
        CURRENT_USER,
        "COMPANY_MEMO_LOG",
        TARGET_ID
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ConflictException);
    expect((thrown as ConflictException).message).toBe(
      PARENT_DELETED_MESSAGE
    );
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
