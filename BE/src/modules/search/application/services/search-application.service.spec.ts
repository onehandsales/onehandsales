import type { SearchRepository } from "@/modules/search/application/ports/search.repository";
import { SearchApplicationService } from "@/modules/search/application/services/search-application.service";
import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import type { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const CURRENT_USER: CurrentUserContext = {
  id: "00000000-0000-4000-8000-000000000101",
  sessionId: "00000000-0000-4000-8000-000000000201",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

function createRepository(): jest.Mocked<SearchRepository> {
  return {
    search: jest.fn().mockResolvedValue([
      {
        type: SearchTargetType.COMPANY,
        items: [
          {
            title: "OneHand",
            subtitle: "SaaS / Seoul",
            targetId: "00000000-0000-4000-8000-000000000001",
            targetPath: "/app/companies/00000000-0000-4000-8000-000000000001",
          },
        ],
      },
    ]),
  };
}

function createLogger(): jest.Mocked<Pick<AppLogger, "log">> {
  return {
    log: jest.fn(),
  };
}

describe("SearchApplicationService", () => {
  it("normalizes default search input and delegates to repository", async () => {
    const repository = createRepository();
    const logger = createLogger();
    const service = new SearchApplicationService(
      repository,
      logger as unknown as AppLogger
    );

    const response = await service.searchAll(CURRENT_USER, {
      q: "  OneHand  ",
    });

    expect(response.groups).toHaveLength(1);
    expect(repository.search).toHaveBeenCalledWith({
      userId: CURRENT_USER.id,
      query: "OneHand",
      types: [SearchTargetType.COMPANY],
      limit: 5,
    });
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining('"event":"search.executed"'),
      "SearchApplicationService"
    );
  });

  it("returns empty groups without repository call for short query", async () => {
    const repository = createRepository();
    const logger = createLogger();
    const service = new SearchApplicationService(
      repository,
      logger as unknown as AppLogger
    );

    const response = await service.searchAll(CURRENT_USER, { q: "A" });

    expect(response).toEqual({ groups: [] });
    expect(repository.search).not.toHaveBeenCalled();
    expect(logger.log).not.toHaveBeenCalled();
  });

  it("deduplicates requested types and caps limit", async () => {
    const repository = createRepository();
    const logger = createLogger();
    const service = new SearchApplicationService(
      repository,
      logger as unknown as AppLogger
    );

    await service.searchAll(CURRENT_USER, {
      q: "OneHand",
      types: "COMPANY,COMPANY",
      limit: 99,
    });

    expect(repository.search).toHaveBeenCalledWith(
      expect.objectContaining({
        types: [SearchTargetType.COMPANY],
        limit: 20,
      })
    );
  });

  it("throws validation error for invalid search target type", async () => {
    const repository = createRepository();
    const logger = createLogger();
    const service = new SearchApplicationService(
      repository,
      logger as unknown as AppLogger
    );

    await expect(
      service.searchAll(CURRENT_USER, {
        q: "OneHand",
        types: "COMPANY,DEAL",
      })
    ).rejects.toBeInstanceOf(ValidationDomainError);
    expect(repository.search).not.toHaveBeenCalled();
  });
});
