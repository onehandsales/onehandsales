import { Buffer } from "node:buffer";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type {
  CompanyListRecord,
  CompanyPageRecord,
  CompanyRecord,
  CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { PrivateMemoEncryptionPort } from "@/modules/company/application/ports/private-memo-encryption.port";
import { CompanyApplicationService } from "@/modules/company/application/services/company-application.service";
import type {
  SearchGroupRecord,
  SearchRepository,
} from "@/modules/search/application/ports/search.repository";
import { SearchApplicationService } from "@/modules/search/application/services/search-application.service";
import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import type {
  TrashDetail,
  TrashItem,
  TrashListResult,
  TrashRepository,
  TrashRestoreRepositoryResult,
} from "@/modules/trash/application/ports/trash.repository";
import { TrashApplicationService } from "@/modules/trash/application/services/trash-application.service";
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
const TARGET_ID_B = "00000000-0000-4000-8000-000000000402";

type OwnedCompanyRecord = CompanyRecord & {
  readonly userId: string;
  deleted?: boolean;
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

const privateMemoEncryption: PrivateMemoEncryptionPort = {
  encrypt(plaintext: string) {
    return {
      ciphertext: plaintext,
      keyVersion: "test",
    };
  },
  decrypt(ciphertext: string) {
    return ciphertext;
  },
};

describe("G04 multi-account ownership isolation", () => {
  it("isolates company list, detail, export, update, and delete access", async () => {
    const writer = new RecordingXlsxWriter();
    const service = new CompanyApplicationService(
      createCompanyRepository(),
      privateMemoEncryption,
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
    await expectDomainNotFound(
      () => service.deleteCompany(CURRENT_USER_A, "rqa004-company-b"),
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

  it("isolates trash list, detail, and restore access", async () => {
    const service = new TrashApplicationService(createTrashRepository());

    const list = await service.listTrash(CURRENT_USER_A, {
      targetType: "ALL",
      page: 1,
      pageSize: 15,
    });

    assertNoBMarker(list);
    await expectHttpNotFound(
      () => service.getTrashDetail(CURRENT_USER_A, "COMPANY", TARGET_ID_B)
    );
    await expectHttpNotFound(
      () => service.restoreTrashItem(CURRENT_USER_A, "COMPANY", TARGET_ID_B)
    );
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
        (company) => company.userId === input.userId && !company.deleted
      );

      return { items, totalCount: items.length };
    },
    async listCompaniesForExport(input): Promise<CompanyListRecord[]> {
      return companies.filter(
        (company) => company.userId === input.userId && !company.deleted
      );
    },
    async findCompany(userId, companyId): Promise<CompanyRecord | null> {
      return (
        companies.find(
          (company) =>
            company.id === companyId &&
            company.userId === userId &&
            !company.deleted
        ) ?? null
      );
    },
    async findCompanyLookup(userId, companyId) {
      const company = companies.find(
        (item) => item.id === companyId && item.userId === userId && !item.deleted
      );

      return company ? { id: company.id, userId: company.userId } : null;
    },
    async updateCompany(userId, companyId): Promise<boolean> {
      return companies.some(
        (company) =>
          company.id === companyId &&
          company.userId === userId &&
          !company.deleted
      );
    },
    async deleteCompany(input): Promise<boolean> {
      const company = companies.find(
        (item) =>
          item.id === input.companyId &&
          item.userId === input.userId &&
          !item.deleted
      );

      if (!company) {
        return false;
      }

      company.deleted = true;
      return true;
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

function createTrashRepository(): TrashRepository {
  const deletedAt = new Date("2026-07-21T01:00:00.000Z");
  const trashExpiresAt = new Date("2026-08-20T01:00:00.000Z");
  const items: TrashItem[] = [
    {
      targetType: "COMPANY",
      targetId: "00000000-0000-4000-8000-000000000401",
      title: `${RQA004_A_MARKER} Company`,
      deletedAt,
      trashExpiresAt,
      restoreWindow: "ACTIVE",
      canRestore: true,
      hasPrivateMemo: false,
      privateMemoIncluded: false,
    },
    {
      targetType: "COMPANY",
      targetId: TARGET_ID_B,
      title: `${RQA004_B_MARKER} Company`,
      deletedAt,
      trashExpiresAt,
      restoreWindow: "ACTIVE",
      canRestore: true,
      hasPrivateMemo: false,
      privateMemoIncluded: false,
    },
  ];

  return {
    async runInTransaction<T>(
      work: (repository: TrashRepository) => Promise<T>
    ): Promise<T> {
      return work(this);
    },
    async listTrash(input): Promise<TrashListResult> {
      const scopedItems = items.filter((item) =>
        input.userId === CURRENT_USER_A.id
          ? item.title.includes(RQA004_A_MARKER)
          : item.title.includes(RQA004_B_MARKER)
      );

      return {
        items: scopedItems,
        page: 1,
        pageSize: 15,
        totalCount: scopedItems.length,
        totalPages: 1,
      };
    },
    async getTrashDetail(input): Promise<TrashDetail | null> {
      const item = items.find(
        (candidate) =>
          candidate.targetId === input.targetId &&
          ((input.userId === CURRENT_USER_A.id &&
            candidate.title.includes(RQA004_A_MARKER)) ||
            (input.userId === CURRENT_USER_B.id &&
              candidate.title.includes(RQA004_B_MARKER)))
      );

      return item
        ? {
            ...item,
            summary: item.title,
            fields: [],
          }
        : null;
    },
    async restoreTrashItem(
      input
    ): Promise<TrashRestoreRepositoryResult | null> {
      const item = await this.getTrashDetail(input);

      return item
        ? {
            targetType: item.targetType,
            targetId: item.targetId,
            restoredAt: input.now,
          }
        : null;
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

async function expectHttpNotFound(action: () => Promise<unknown>) {
  await expect(action()).rejects.toBeInstanceOf(NotFoundException);
}

function createExecutionContext(currentUser: CurrentUserContext): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ currentUser }),
    }),
  } as unknown as ExecutionContext;
}
