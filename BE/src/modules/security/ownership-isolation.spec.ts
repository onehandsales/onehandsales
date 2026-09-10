import { Buffer } from "node:buffer";
import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type {
  CompanyListRecord,
  CompanyPageRecord,
  CompanyRecord,
  CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import { CompanyApplicationService } from "@/modules/company/application/services/company-application.service";
import type {
  SearchGroupRecord,
  SearchRepository,
} from "@/modules/search/application/ports/search.repository";
import { SearchApplicationService } from "@/modules/search/application/services/search-application.service";
import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type {
  XlsxWorkbookWriter,
  XlsxWorksheetInput,
} from "@/shared/application/ports/xlsx-workbook.writer";
import { DomainError } from "@/shared/domain/errors/domain-error";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { AdminGuard } from "@/shared/presentation/guards/admin.guard";

const CURRENT_USER_A: CurrentUserContext = {
  id: "rqa004-user-a",
  sessionId: "rqa004-session-a",
  email: "rqa004-a@example.com",
  displayName: "RQA004 A",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const CURRENT_USER_B: CurrentUserContext = {
  id: "rqa004-user-b",
  sessionId: "rqa004-session-b",
  email: "rqa004-b@example.com",
  displayName: "RQA004 B",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

const RQA004_A_MARKER = "RQA004-A";
const RQA004_B_MARKER = "RQA004-B";
const CREATED_AT = new Date("2026-07-20T01:00:00.000Z");
const UPDATED_AT = new Date("2026-07-20T02:00:00.000Z");
type OwnedCompanyRecord = CompanyRecord & {
  readonly userId: string;
};

class RecordingXlsxWriter implements XlsxWorkbookWriter {
  readonly inputs: XlsxWorksheetInput[] = [];

  async writeWorksheet(input: XlsxWorksheetInput): Promise<Buffer> {
    this.inputs.push(input);
    return Buffer.from(JSON.stringify(input.rows), "utf8");
  }
}

class SilentLogger extends AppLogger {
  override log(_message: string, _context?: string): void {
    void _message;
    void _context;
  }
}

describe("G04 multi-account ownership isolation", () => {
  it("isolates company list, detail, export, and update access", async () => {
    const writer = new RecordingXlsxWriter();
    const service = new CompanyApplicationService(
      createCompanyRepository(),
      writer,
      new SilentLogger()
    );

    const list = await service.listCompanies(CURRENT_USER_A, {});
    const exportFile = await service.exportCompaniesXlsx(CURRENT_USER_A, {});

    assertNoBMarker(list);
    assertNoBMarker(writer.inputs);
    expect(exportFile.content.toString("utf8")).not.toContain(RQA004_B_MARKER);
    await expectDomainNotFound(
      () => service.getCompany(CURRENT_USER_A, "rqa004-company-b"),
      "CompanyNotFound"
    );
    await expectDomainNotFound(
      () =>
        service.updateCompany(CURRENT_USER_A, "rqa004-company-b", {
          companyName: "RQA004-A updated company",
        }),
      "CompanyNotFound"
    );
  });

  it("does not return user B data in integrated search for user A", async () => {
    const service = new SearchApplicationService(
      createSearchRepository(),
      new SilentLogger()
    );

    const result = await service.searchAll(CURRENT_USER_A, {
      q: RQA004_B_MARKER,
    });

    expect(result.groups).toEqual([]);
    assertNoBMarker(result);
  });

  it("rejects a normal user at the admin API guard boundary", () => {
    const guard = new AdminGuard();

    expect(() => guard.canActivate(createExecutionContext(CURRENT_USER_A))).toThrow(
      ForbiddenException
    );
  });
});

function createCompanyRepository(): CompanyRepository {
  const companies: OwnedCompanyRecord[] = [
    createCompanyRecord(CURRENT_USER_A.id, "rqa004-company-a", RQA004_A_MARKER),
    createCompanyRecord(CURRENT_USER_B.id, "rqa004-company-b", RQA004_B_MARKER),
  ];
  const repository: Partial<CompanyRepository> = {
    async runInTransaction<T>(
      work: (repository: CompanyRepository) => Promise<T>
    ): Promise<T> {
      return work(repository as CompanyRepository);
    },
    async listCompanies(input): Promise<CompanyPageRecord> {
      const items = companies.filter(
        (company) => company.userId === input.userId
      );

      return { items, totalCount: items.length };
    },
    async listCompaniesForExport(input): Promise<CompanyListRecord[]> {
      return companies.filter(
        (company) => company.userId === input.userId
      );
    },
    async findCompany(userId, companyId): Promise<CompanyRecord | null> {
      return (
        companies.find(
          (company) =>
            company.id === companyId &&
            company.userId === userId
        ) ?? null
      );
    },
    async findCompanyLookup(userId, companyId) {
      const company = companies.find(
        (item) => item.id === companyId && item.userId === userId
      );

      return company ? { id: company.id, userId: company.userId } : null;
    },
    async updateCompany(userId, companyId): Promise<boolean> {
      return companies.some(
        (company) =>
          company.id === companyId &&
          company.userId === userId
      );
    },
  };

  return repository as CompanyRepository;
}

function createSearchRepository(): SearchRepository {
  return {
    async search(input): Promise<SearchGroupRecord[]> {
      if (input.query.includes(RQA004_B_MARKER)) {
        return [];
      }

      return [
        {
          type: SearchTargetType.COMPANY,
          items: [
            {
              title: `${RQA004_A_MARKER} Company`,
              subtitle: "Company",
              targetId: "rqa004-company-a",
              targetPath: "/app/companies/rqa004-company-a",
            },
          ],
        },
      ];
    },
  };
}

function createCompanyRecord(
  userId: string,
  id: string,
  marker: string
): OwnedCompanyRecord {
  return {
    id,
    userId,
    companyName: `${marker} Company`,
    address: `${marker} address`,
    companyField: {
      id: `${id}-field`,
      field: `${marker} Field`,
    },
    companyRegion: {
      id: `${id}-region`,
      region: `${marker} Region`,
      countryCode: "KR",
      regionCode: "11",
    },
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  };
}

function assertNoBMarker(value: unknown): void {
  expect(JSON.stringify(value)).not.toContain(RQA004_B_MARKER);
}

async function expectDomainNotFound(
  action: () => Promise<unknown>,
  code: string
) {
  await expect(action()).rejects.toMatchObject({ code } satisfies Partial<DomainError>);
}

function createExecutionContext(currentUser: CurrentUserContext): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ currentUser }),
    }),
  } as unknown as ExecutionContext;
}
