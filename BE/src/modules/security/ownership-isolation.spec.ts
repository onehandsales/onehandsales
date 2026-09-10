import { Buffer } from "node:buffer";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import {
  type CompanyListRecord,
  type CompanyPageRecord,
  type CompanyRecord,
  type CompanyRepository,
} from "@/modules/company/application/ports/company.repository";
import type { PrivateMemoEncryptionPort } from "@/modules/company/application/ports/private-memo-encryption.port";
import { CompanyApplicationService } from "@/modules/company/application/services/company-application.service";
import { ContactApplicationService } from "@/modules/contact/application/services/contact-application.service";
import {
  type ContactPageRecord,
  type ContactRecord,
  type ContactRepository,
} from "@/modules/contact/application/ports/contact.repository";
import type { ContactPrivateMemoEncryptionPort } from "@/modules/contact/application/ports/contact-private-memo-encryption.port";
import {
  type DealDetailRecord,
  type DealListRecord,
  type DealPageRecord,
  type DealRepository,
} from "@/modules/deal/application/ports/deal.repository";
import { DealApplicationService } from "@/modules/deal/application/services/deal-application.service";
import { DealStatusCode } from "@/modules/deal/domain/deal-status";
import {
  type ProductListRecord,
  type ProductPageRecord,
  type ProductRecord,
  type ProductRepository,
} from "@/modules/product/application/ports/product.repository";
import type { ProductPrivateMemoEncryptionPort } from "@/modules/product/application/ports/product-private-memo-encryption.port";
import { ProductApplicationService } from "@/modules/product/application/services/product-application.service";
import type {
  SearchGroupRecord,
  SearchRepository,
} from "@/modules/search/application/ports/search.repository";
import { SearchApplicationService } from "@/modules/search/application/services/search-application.service";
import { SearchTargetType } from "@/modules/search/domain/search-target-type";
import {
  type TrashDetail,
  type TrashItem,
  type TrashListResult,
  type TrashRepository,
  type TrashRestoreRepositoryResult,
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

type OwnedRecord = {
  readonly userId: string;
};

type OwnedCompanyRecord = CompanyListRecord &
  CompanyRecord &
  OwnedRecord & {
    readonly deleted?: boolean;
  };

type OwnedContactRecord = ContactRecord &
  OwnedRecord & {
    readonly deleted?: boolean;
  };

type OwnedProductRecord = ProductListRecord &
  ProductRecord &
  OwnedRecord & {
    readonly deleted?: boolean;
  };

type OwnedDealRecord = DealDetailRecord &
  OwnedRecord & {
    readonly deleted?: boolean;
  };


// 역할 : G04 export 검증을 위해 workbook row와 생성된 binary payload를 기록합니다.
class RecordingXlsxWriter implements XlsxWorkbookWriter {
  readonly inputs: XlsxWorksheetInput[] = [];

  // 기능 : 테스트가 payload를 검사할 수 있도록 row JSON을 fake xlsx binary로 반환합니다.
  async writeWorksheet(input: XlsxWorksheetInput): Promise<Buffer> {
    this.inputs.push(input);
    return Buffer.from(JSON.stringify(input.rows), "utf8");
  }
}

// 역할 : 테스트 실행 중 application 로그 출력을 억제합니다.
class SilentLogger extends AppLogger {
  // 기능 : 로그 출력을 의도적으로 무시합니다.
  override log(_message: string, _context?: string): void {
    void _message;
    void _context;
  }
}

const privateMemoEncryption: PrivateMemoEncryptionPort &
  ContactPrivateMemoEncryptionPort &
  ProductPrivateMemoEncryptionPort = {
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

// 기능 : G04 다중 계정 보안 QA 핵심 matrix를 자동 테스트로 검증합니다.
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

  it("isolates contact list, detail, export, update, and delete access", async () => {
    const writer = new RecordingXlsxWriter();
    const service = new ContactApplicationService(
      createContactRepository(),
      privateMemoEncryption,
      writer,
      new SilentLogger()
    );

    const list = await service.listContacts(CURRENT_USER_A, {});
    const exportFile = await service.exportContactsXlsx(CURRENT_USER_A, {});

    assertNoBMarker(list);
    assertNoBMarker(writer.inputs);
    expect(exportFile.content.toString("utf8")).not.toContain(RQA004_B_MARKER);
    await expectDomainNotFound(
      () => service.getContact(CURRENT_USER_A, "rqa004-contact-b"),
      "ContactNotFound"
    );
    await expectDomainNotFound(
      () =>
        service.updateContact(CURRENT_USER_A, "rqa004-contact-b", {
          username: "RQA004-A updated contact",
        }),
      "ContactNotFound"
    );
    await expectDomainNotFound(
      () => service.deleteContact(CURRENT_USER_A, "rqa004-contact-b"),
      "ContactNotFound"
    );
  });

  it("isolates product list, detail, export, update, and delete access", async () => {
    const writer = new RecordingXlsxWriter();
    const service = new ProductApplicationService(
      createProductRepository(),
      privateMemoEncryption,
      writer,
      new SilentLogger()
    );

    const list = await service.listProducts(CURRENT_USER_A, {});
    const exportFile = await service.exportProductsXlsx(CURRENT_USER_A, {});

    assertNoBMarker(list);
    assertNoBMarker(writer.inputs);
    expect(exportFile.content.toString("utf8")).not.toContain(RQA004_B_MARKER);
    await expectDomainNotFound(
      () => service.getProduct(CURRENT_USER_A, "rqa004-product-b"),
      "ProductNotFound"
    );
    await expectDomainNotFound(
      () =>
        service.updateProduct(CURRENT_USER_A, "rqa004-product-b", {
          productName: "RQA004-A updated product",
        }),
      "ProductNotFound"
    );
    await expectDomainNotFound(
      () => service.deleteProduct(CURRENT_USER_A, "rqa004-product-b"),
      "ProductNotFound"
    );
  });

  it("isolates deal list, stage counts, detail, export, update, and delete access", async () => {
    const writer = new RecordingXlsxWriter();
    const service = new DealApplicationService(
      createDealRepository(),
      writer,
      new SilentLogger()
    );

    const list = await service.listDeals(CURRENT_USER_A, {
      search: "RQA004",
    });
    const counts = await service.countDealsByStatus(CURRENT_USER_A, {
      search: "RQA004",
    });
    const exportFile = await service.exportDealsXlsx(CURRENT_USER_A, {
      search: "RQA004",
    });

    assertNoBMarker(list);
    assertNoBMarker(counts);
    assertNoBMarker(writer.inputs);
    expect(list.totalCount).toBe(1);
    expect(
      counts.items.reduce((total, item) => total + item.count, 0)
    ).toBe(1);
    expect(exportFile.content.toString("utf8")).not.toContain(RQA004_B_MARKER);
    await expectDomainNotFound(
      () => service.getDeal(CURRENT_USER_A, "rqa004-deal-b"),
      "DealNotFound"
    );
    await expectDomainNotFound(
      () =>
        service.updateDeal(CURRENT_USER_A, "rqa004-deal-b", {
          dealName: "RQA004-A updated deal",
        }),
      "DealNotFound"
    );
    await expectDomainNotFound(
      () => service.deleteDeal(CURRENT_USER_A, "rqa004-deal-b"),
      "DealNotFound"
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
      return company ? { id: company.id, userId } : null;
    },
    async updateCompany(userId, companyId): Promise<boolean> {
      return companies.some(
        (company) =>
          company.id === companyId && company.userId === userId && !company.deleted
      );
    },
    async deleteCompany(input): Promise<boolean> {
      const index = companies.findIndex(
        (company) =>
          company.id === input.companyId &&
          company.userId === input.userId &&
          !company.deleted
      );

      if (index < 0) {
        return false;
      }

      const company = companies[index];

      if (!company) {
        return false;
      }

      companies[index] = { ...company, deleted: true };
      return true;
    },
    async findField(userId, fieldId) {
      return fieldId === `${userId}-field`
        ? { id: fieldId, field: `${userId} field` }
        : null;
    },
    async findRegion(userId, regionId) {
      return regionId === `${userId}-region`
        ? {
            id: regionId,
            region: `${userId} region`,
            // 기능 : legacy/custom 지역 fixture는 표준 code 없이 소유권만 검증합니다.
            countryCode: null,
            regionCode: null,
          }
        : null;
    },
  };

  return repository as CompanyRepository;
}

function createContactRepository(): ContactRepository {
  const contacts: OwnedContactRecord[] = [
    createContactRecord(CURRENT_USER_A.id, "rqa004-contact-a", RQA004_A_MARKER),
    createContactRecord(CURRENT_USER_B.id, "rqa004-contact-b", RQA004_B_MARKER),
  ];
  const repository: Partial<ContactRepository> = {
    async runInTransaction<T>(
      work: (repository: ContactRepository) => Promise<T>
    ): Promise<T> {
      return work(repository as ContactRepository);
    },
    async listContacts(input): Promise<ContactPageRecord> {
      const items = contacts.filter(
        (contact) => contact.userId === input.userId && !contact.deleted
      );
      return { items, totalCount: items.length };
    },
    async listContactsForExport(input): Promise<ContactRecord[]> {
      return contacts.filter(
        (contact) => contact.userId === input.userId && !contact.deleted
      );
    },
    async findContact(userId, contactId): Promise<ContactRecord | null> {
      return (
        contacts.find(
          (contact) =>
            contact.id === contactId &&
            contact.userId === userId &&
            !contact.deleted
        ) ?? null
      );
    },
    async findContactLookup(userId, contactId) {
      const contact = contacts.find(
        (item) => item.id === contactId && item.userId === userId && !item.deleted
      );
      return contact ? { id: contact.id, userId } : null;
    },
    async updateContact(userId, contactId): Promise<boolean> {
      return contacts.some(
        (contact) =>
          contact.id === contactId && contact.userId === userId && !contact.deleted
      );
    },
    async deleteContact(input): Promise<boolean> {
      const index = contacts.findIndex(
        (contact) =>
          contact.id === input.contactId &&
          contact.userId === input.userId &&
          !contact.deleted
      );

      if (index < 0) {
        return false;
      }

      const contact = contacts[index];

      if (!contact) {
        return false;
      }

      contacts[index] = { ...contact, deleted: true };
      return true;
    },
    async findCompanyOption(userId, companyId) {
      return companyId === `${userId}-company`
        ? { id: companyId, companyName: `${userId} company` }
        : null;
    },
    async findDepartment(userId, departmentId) {
      return departmentId === `${userId}-department`
        ? { id: departmentId, departmentName: `${userId} department` }
        : null;
    },
    async findJobGrade(userId, jobGradeId) {
      return jobGradeId === `${userId}-job-grade`
        ? { id: jobGradeId, jobGradeName: `${userId} job grade` }
        : null;
    },
  };

  return repository as ContactRepository;
}

function createProductRepository(): ProductRepository {
  const products: OwnedProductRecord[] = [
    createProductRecord(CURRENT_USER_A.id, "rqa004-product-a", RQA004_A_MARKER),
    createProductRecord(CURRENT_USER_B.id, "rqa004-product-b", RQA004_B_MARKER),
  ];
  const repository: Partial<ProductRepository> = {
    async runInTransaction<T>(
      work: (repository: ProductRepository) => Promise<T>
    ): Promise<T> {
      return work(repository as ProductRepository);
    },
    async listProducts(input): Promise<ProductPageRecord> {
      const items = products.filter(
        (product) => product.userId === input.userId && !product.deleted
      );
      return { items, totalCount: items.length };
    },
    async listProductsForExport(input): Promise<ProductListRecord[]> {
      return products.filter(
        (product) => product.userId === input.userId && !product.deleted
      );
    },
    async findProduct(userId, productId): Promise<ProductRecord | null> {
      return (
        products.find(
          (product) =>
            product.id === productId &&
            product.userId === userId &&
            !product.deleted
        ) ?? null
      );
    },
    async findProductLookup(userId, productId) {
      const product = products.find(
        (item) => item.id === productId && item.userId === userId && !item.deleted
      );
      return product ? { id: product.id, userId } : null;
    },
    async updateProduct(userId, productId): Promise<boolean> {
      return products.some(
        (product) =>
          product.id === productId && product.userId === userId && !product.deleted
      );
    },
    async deleteProduct(input): Promise<boolean> {
      const index = products.findIndex(
        (product) =>
          product.id === input.productId &&
          product.userId === input.userId &&
          !product.deleted
      );

      if (index < 0) {
        return false;
      }

      const product = products[index];

      if (!product) {
        return false;
      }

      products[index] = { ...product, deleted: true };
      return true;
    },
    async findCategory(userId, categoryId) {
      return categoryId === `${userId}-category`
        ? { id: categoryId, categoryName: `${userId} category` }
        : null;
    },
    async findStatus(userId, statusId) {
      return statusId === `${userId}-status`
        ? { id: statusId, statusName: `${userId} status` }
        : null;
    },
  };

  return repository as ProductRepository;
}

function createDealRepository(): DealRepository {
  const deals: OwnedDealRecord[] = [
    createDealRecord(CURRENT_USER_A.id, "rqa004-deal-a", RQA004_A_MARKER),
    createDealRecord(CURRENT_USER_B.id, "rqa004-deal-b", RQA004_B_MARKER),
  ];
  const repository: Partial<DealRepository> = {
    async runInTransaction<T>(
      work: (repository: DealRepository) => Promise<T>
    ): Promise<T> {
      return work(repository as DealRepository);
    },
    async countDealsByStatus(input) {
      const counts = new Map<DealStatusCode, number>();
      for (const deal of filterDeals(deals, input.userId, input.search)) {
        counts.set(deal.dealStatus, (counts.get(deal.dealStatus) ?? 0) + 1);
      }
      return counts;
    },
    async listDeals(input): Promise<DealPageRecord> {
      const items = filterDeals(deals, input.userId, input.search);
      return { items, totalCount: items.length };
    },
    async listDealsForExport(input): Promise<DealListRecord[]> {
      return filterDeals(deals, input.userId, input.search);
    },
    async findDeal(userId, dealId): Promise<DealDetailRecord | null> {
      return (
        deals.find(
          (deal) => deal.id === dealId && deal.userId === userId && !deal.deleted
        ) ?? null
      );
    },
    async existsDeal(userId, dealId): Promise<boolean> {
      return deals.some(
        (deal) => deal.id === dealId && deal.userId === userId && !deal.deleted
      );
    },
    async updateDeal(userId, dealId): Promise<boolean> {
      return deals.some(
        (deal) => deal.id === dealId && deal.userId === userId && !deal.deleted
      );
    },
    async deleteDeal(input): Promise<boolean> {
      const index = deals.findIndex(
        (deal) =>
          deal.id === input.dealId && deal.userId === input.userId && !deal.deleted
      );

      if (index < 0) {
        return false;
      }

      const deal = deals[index];

      if (!deal) {
        return false;
      }

      deals[index] = { ...deal, deleted: true };
      return true;
    },
  };

  return repository as DealRepository;
}

function createSearchRepository(): SearchRepository {
  const records = [
    {
      userId: CURRENT_USER_A.id,
      title: `${RQA004_A_MARKER} Company`,
      targetId: "rqa004-company-a",
    },
    {
      userId: CURRENT_USER_B.id,
      title: `${RQA004_B_MARKER} Company`,
      targetId: "rqa004-company-b",
    },
  ];

  return {
    async search(input): Promise<SearchGroupRecord[]> {
      const items = records
        .filter(
          (record) =>
            record.userId === input.userId && record.title.includes(input.query)
        )
        .map((record) => ({
          title: record.title,
          subtitle: null,
          targetId: record.targetId,
          targetPath: `/companies/${record.targetId}`,
        }));

      return items.length > 0
        ? [
            {
              type: SearchTargetType.COMPANY,
              items,
            },
          ]
        : [];
    },
  };
}

function createTrashRepository(): TrashRepository {
  const items: Array<TrashItem & OwnedRecord> = [
    {
      userId: CURRENT_USER_A.id,
      targetType: "COMPANY",
      targetId: "00000000-0000-4000-8000-000000000401",
      title: `${RQA004_A_MARKER} deleted company`,
      deletedAt: CREATED_AT,
      trashExpiresAt: UPDATED_AT,
      restoreWindow: "ACTIVE",
      canRestore: true,
      hasPrivateMemo: false,
      privateMemoIncluded: false,
    },
    {
      userId: CURRENT_USER_B.id,
      targetType: "COMPANY",
      targetId: TARGET_ID_B,
      title: `${RQA004_B_MARKER} deleted company`,
      deletedAt: CREATED_AT,
      trashExpiresAt: UPDATED_AT,
      restoreWindow: "ACTIVE",
      canRestore: true,
      hasPrivateMemo: false,
      privateMemoIncluded: false,
    },
  ];

  return {
    async listTrash(input): Promise<TrashListResult> {
      const filtered = items.filter((item) => item.userId === input.userId);
      return {
        items: filtered,
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 15,
        totalCount: filtered.length,
        totalPages: 1,
      };
    },
    async getTrashDetail(input): Promise<TrashDetail | null> {
      const item = items.find(
        (candidate) =>
          candidate.userId === input.userId &&
          candidate.targetType === input.targetType &&
          candidate.targetId === input.targetId
      );

      return item
        ? {
            targetType: item.targetType,
            targetId: item.targetId,
            title: item.title,
            deletedAt: item.deletedAt,
            trashExpiresAt: item.trashExpiresAt,
            restoreWindow: item.restoreWindow,
            canRestore: item.canRestore,
            hasPrivateMemo: item.hasPrivateMemo,
            privateMemoIncluded: item.privateMemoIncluded,
            summary: item.title,
            fields: [{ label: "title", value: item.title }],
          }
        : null;
    },
    async restoreTrashItem(
      input
    ): Promise<TrashRestoreRepositoryResult | null> {
      const item = items.find(
        (candidate) =>
          candidate.userId === input.userId &&
          candidate.targetType === input.targetType &&
          candidate.targetId === input.targetId
      );

      return item
        ? {
            targetType: item.targetType,
            targetId: item.targetId,
            restoredAt: input.now,
          }
        : null;
    },
    async runInTransaction(work) {
      return work(this);
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
    // 기능 : 회사 주소와 글로벌 지역 code 필드를 ownership 테스트 fixture에 포함합니다.
    address: null,
    companyField: { id: `${userId}-field`, field: `${marker} Field` },
    companyRegion: {
      id: `${userId}-region`,
      region: `${marker} Region`,
      countryCode: null,
      regionCode: null,
    },
    contactCount: 1,
    dealCount: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  };
}

function createContactRecord(
  userId: string,
  id: string,
  marker: string
): OwnedContactRecord {
  return {
    id,
    userId,
    company: { id: `${userId}-company`, companyName: `${marker} Company` },
    username: `${marker} Contact`,
    mobile: "010-0000-0000",
    phoneCountryCode: "KR",
    phoneNationalNumber: "01000000000",
    phoneE164: "+821000000000",
    email: `${marker.toLowerCase()}@example.com`,
    contactDepartment: {
      id: `${userId}-department`,
      departmentName: `${marker} Department`,
    },
    contactJobGrade: {
      id: `${userId}-job-grade`,
      jobGradeName: `${marker} JobGrade`,
    },
    dealCount: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  };
}

function createProductRecord(
  userId: string,
  id: string,
  marker: string
): OwnedProductRecord {
  return {
    id,
    userId,
    productName: `${marker} Product`,
    productPrice: 1000,
    currencyCode: "KRW",
    productCategory: {
      id: `${userId}-category`,
      categoryName: `${marker} Category`,
    },
    productStatus: {
      id: `${userId}-status`,
      statusName: `${marker} Status`,
    },
    dealCount: 1,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  };
}

function createDealRecord(
  userId: string,
  id: string,
  marker: string
): OwnedDealRecord {
  return {
    id,
    userId,
    dealName: `${marker} Deal`,
    dealCost: 100000,
    currencyCode: "KRW",
    dealStatus: DealStatusCode.INITIAL_CONTACT,
    expectedEndDate: new Date("2026-07-31T00:00:00.000Z"),
    companies: [
      {
        id: `${userId}-company`,
        companyName: `${marker} Company`,
        isDeleted: false,
        companyField: { id: `${userId}-field`, field: `${marker} Field` },
        companyRegion: {
          id: `${userId}-region`,
          region: `${marker} Region`,
          // 기능 : deal ownership fixture에서는 legacy 지역 fallback만 검증합니다.
          countryCode: null,
          regionCode: null,
        },
      },
    ],
    contacts: [
      {
        id: `${userId}-contact`,
        username: `${marker} Contact`,
        isDeleted: false,
        companyId: `${userId}-company`,
        company: {
          id: `${userId}-company`,
          companyName: `${marker} Company`,
          isDeleted: false,
        },
        mobile: "010-0000-0000",
        email: `${marker.toLowerCase()}@example.com`,
        contactJobGrade: {
          id: `${userId}-job-grade`,
          jobGradeName: `${marker} JobGrade`,
        },
        contactDepartment: {
          id: `${userId}-department`,
          departmentName: `${marker} Department`,
        },
      },
    ],
    products: [
      {
        id: `${userId}-product`,
        productName: `${marker} Product`,
        isDeleted: false,
        productPrice: 1000,
        currencyCode: "KRW",
        productCategory: {
          id: `${userId}-category`,
          categoryName: `${marker} Category`,
        },
        productStatus: {
          id: `${userId}-status`,
          statusName: `${marker} Status`,
        },
      },
    ],
    latestActivity: null,
    latestFollowingAction: null,
    nextFollowingAction: null,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  };
}

function filterDeals(
  deals: readonly OwnedDealRecord[],
  userId: string,
  search: string | undefined
): OwnedDealRecord[] {
  return deals.filter(
    (deal) =>
      deal.userId === userId &&
      !deal.deleted &&
      (!search || deal.dealName.includes(search))
  );
}

async function expectDomainNotFound(
  action: () => Promise<unknown>,
  expectedCode: string
): Promise<void> {
  let thrown: unknown;

  try {
    await action();
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(DomainError);
  expect(thrown instanceof DomainError ? thrown.code : null).toBe(expectedCode);
  assertNoBMarker(toErrorPayload(thrown));
}

async function expectHttpNotFound(action: () => Promise<unknown>): Promise<void> {
  let thrown: unknown;

  try {
    await action();
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(NotFoundException);
  assertNoBMarker(toErrorPayload(thrown));
}

function assertNoBMarker(value: unknown): void {
  expect(JSON.stringify(value)).not.toContain(RQA004_B_MARKER);
  expect(JSON.stringify(value)).not.toContain(CURRENT_USER_B.id);
  expect(JSON.stringify(value)).not.toContain(CURRENT_USER_B.email);
}

function toErrorPayload(error: unknown): unknown {
  if (error instanceof DomainError) {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof NotFoundException) {
    return {
      name: error.name,
      message: error.message,
      response: error.getResponse(),
    };
  }

  return error;
}

function createExecutionContext(
  currentUser: CurrentUserContext
): ExecutionContext {
  const request = { currentUser };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}
