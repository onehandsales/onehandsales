import { Buffer } from "node:buffer";
import {
  type CompanyContactRecord,
  type CompanyDealRecord,
  type CompanyFieldRecord,
  type CompanyListRecord,
  type CompanyMemoLogRecord,
  type CompanyPageRecord,
  type CompanyPrivateMemoLogRecord,
  type CompanyRecord,
  type CompanyRegionRecord,
  type CompanyRepository,
  type CreateCompanyInput,
  type CreateCompanyMemoLogInput,
  type CreateCompanyPrivateMemoLogInput,
  type CreateCompanyRegionInput,
  type DeleteCompanyMemoLogInput,
  type DeleteCompanyInput,
  type DeleteCompanyPrivateMemoLogInput,
  type ExportCompaniesInput,
  type ListCompaniesInput,
  type ListCompanyContactsInput,
  type ListCompanyDealsInput,
  type MemoLogCursor,
  type UpdateCompanyInput,
} from "@/modules/company/application/ports/company.repository";
import type { PrivateMemoEncryptionPort } from "@/modules/company/application/ports/private-memo-encryption.port";
import { CompanyFieldNotFoundError } from "@/modules/company/domain/company.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import type { XlsxWorkbookWriter } from "@/shared/application/ports/xlsx-workbook.writer";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";
import { CompanyApplicationService } from "./company-application.service";

const CURRENT_USER: CurrentUserContext = {
  id: "user-1",
  sessionId: "session-1",
  email: "user@example.com",
  displayName: "User",
  role: "USER",
  status: "ACTIVE",
  timeZone: "Asia/Seoul",
};

// 역할 : FakeCompanyRepository 테스트용 회사 저장소를 메모리에서 구현합니다.
class FakeCompanyRepository implements CompanyRepository {
  readonly fields = new Map<string, string>([
    ["field-1", CURRENT_USER.id],
    ["field-2", CURRENT_USER.id],
  ]);

  readonly regions = new Map<
    string,
    {
      readonly userId: string;
      readonly region: string;
      readonly countryCode: string | null;
      readonly regionCode: string | null;
    }
  >([
    [
      "region-1",
      {
        userId: CURRENT_USER.id,
        region: "서울",
        countryCode: "KR",
        regionCode: "KR-11",
      },
    ],
    [
      "region-2",
      {
        userId: CURRENT_USER.id,
        region: "California",
        countryCode: "US",
        regionCode: "US-CA",
      },
    ],
  ]);

  listCompaniesInputs: ListCompaniesInput[] = [];
  exportCompaniesInputs: ExportCompaniesInput[] = [];
  createdCompanies: CreateCompanyInput[] = [];
  updatedCompanies: UpdateCompanyInput[] = [];
  createdRegions: CreateCompanyRegionInput[] = [];

  // 기능 : fake transaction을 현재 저장소에서 즉시 실행합니다.
  async runInTransaction<T>(
    work: (repository: CompanyRepository) => Promise<T>
  ): Promise<T> {
    return work(this);
  }

  // 기능 : fake 회사 목록 조회 입력을 기록합니다.
  async listCompanies(input: ListCompaniesInput): Promise<CompanyPageRecord> {
    this.listCompaniesInputs.push(input);
    return {
      items: [],
      totalCount: 0,
    };
  }

  // 기능 : fake 회사 export 조회 입력을 기록합니다.
  async listCompaniesForExport(
    input: ExportCompaniesInput
  ): Promise<CompanyListRecord[]> {
    this.exportCompaniesInputs.push(input);
    return [];
  }

  // 기능 : fake 회사 연결 담당자 목록을 반환합니다.
  async listCompanyContacts(
    _input: ListCompanyContactsInput
  ): Promise<CompanyContactRecord[]> {
    void _input;
    return [];
  }

  // 기능 : fake 회사 연결 딜 목록을 반환합니다.
  async listCompanyDeals(
    _input: ListCompanyDealsInput
  ): Promise<CompanyDealRecord[]> {
    void _input;
    return [];
  }

  // 기능 : fake 회사 단건을 반환하지 않습니다.
  async findCompany(
    _userId: string,
    _companyId: string
  ): Promise<CompanyRecord | null> {
    void _userId;
    void _companyId;
    return null;
  }

  // 기능 : fake 회사 존재 여부를 반환하지 않습니다.
  async findCompanyLookup(
    _userId: string,
    _companyId: string
  ): Promise<{ readonly id: string; readonly userId: string } | null> {
    void _userId;
    void _companyId;
    return null;
  }

  // 기능 : fake 회사 생성을 처리합니다.
  async createCompany(
    input: CreateCompanyInput
  ): Promise<{ readonly id: string; readonly userId: string }> {
    this.createdCompanies.push(input);
    return { id: "company-1", userId: CURRENT_USER.id };
  }

  // 기능 : fake 회사 수정을 처리합니다.
  async updateCompany(
    _userId: string,
    _companyId: string,
    input: UpdateCompanyInput
  ): Promise<boolean> {
    void _userId;
    void _companyId;
    this.updatedCompanies.push(input);
    return true;
  }

  // 기능 : fake 회사 삭제를 처리합니다.
  async deleteCompany(_input: DeleteCompanyInput): Promise<boolean> {
    void _input;
    return true;
  }

  // 기능 : fake 회사 분야 목록을 반환합니다.
  async listFields(_userId: string): Promise<CompanyFieldRecord[]> {
    void _userId;
    return [];
  }

  // 기능 : fake 회사 분야 소유 여부를 반환합니다.
  async findField(
    userId: string,
    fieldId: string
  ): Promise<CompanyFieldRecord | null> {
    return this.fields.get(fieldId) === userId
      ? { id: fieldId, field: fieldId }
      : null;
  }

  // 기능 : fake 회사 분야 중복 여부를 반환합니다.
  async existsFieldByName(_userId: string, _field: string): Promise<boolean> {
    void _userId;
    void _field;
    return false;
  }

  // 기능 : fake 회사 분야를 생성합니다.
  async createField(_userId: string, _field: string): Promise<void> {
    void _userId;
    void _field;
  }

  // 기능 : fake 회사 분야 사용 여부를 반환합니다.
  async isFieldInUse(_userId: string, _fieldId: string): Promise<boolean> {
    void _userId;
    void _fieldId;
    return false;
  }

  // 기능 : fake 회사 분야를 삭제합니다.
  async deleteField(_userId: string, _fieldId: string): Promise<void> {
    void _userId;
    void _fieldId;
  }

  // 기능 : fake 회사 지역 목록을 반환합니다.
  async listRegions(_userId: string): Promise<CompanyRegionRecord[]> {
    return [...this.regions.entries()]
      .filter(([, region]) => region.userId === _userId)
      .map(([id, region]) => ({ id, ...region }));
  }

  // 기능 : fake 회사 지역 소유 여부를 반환합니다.
  async findRegion(
    userId: string,
    regionId: string
  ): Promise<CompanyRegionRecord | null> {
    const region = this.regions.get(regionId);

    return region?.userId === userId ? { id: regionId, ...region } : null;
  }

  // 기능 : fake 회사 지역 중복 여부를 반환합니다.
  async existsRegionByName(_userId: string, _region: string): Promise<boolean> {
    return [...this.regions.values()].some(
      (region) => region.userId === _userId && region.region === _region
    );
  }

  // 기능 : fake 회사 지역을 생성합니다.
  // 기능 : fake 회사 지역 표준 code 중복 여부를 확인합니다.
  async existsRegionByCode(
    userId: string,
    countryCode: string,
    regionCode: string
  ): Promise<boolean> {
    return [...this.regions.values()].some(
      (region) =>
        region.userId === userId &&
        region.countryCode === countryCode &&
        region.regionCode === regionCode
    );
  }

  // 기능 : fake 회사 지역 생성 입력을 기록합니다.
  async createRegion(input: CreateCompanyRegionInput): Promise<void> {
    this.createdRegions.push(input);
    this.regions.set(`region-${this.regions.size + 1}`, input);
  }

  // 기능 : fake 회사 지역 사용 여부를 반환합니다.
  async isRegionInUse(_userId: string, _regionId: string): Promise<boolean> {
    void _userId;
    void _regionId;
    return false;
  }

  // 기능 : fake 회사 지역을 삭제합니다.
  async deleteRegion(_userId: string, _regionId: string): Promise<void> {
    void _userId;
    void _regionId;
  }

  // 기능 : fake 회사 메모 로그를 생성합니다.
  async createMemoLog(_input: CreateCompanyMemoLogInput): Promise<void> {
    void _input;
  }

  // 기능 : fake 회사 메모 로그 목록을 반환합니다.
  async listMemoLogs(_input: {
    readonly companyId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<CompanyMemoLogRecord[]> {
    void _input;
    return [];
  }

  // 기능 : fake 회사 메모 로그를 수정합니다.
  async updateMemoLog(_input: {
    readonly userId: string;
    readonly companyId: string;
    readonly memoLogId: string;
    readonly memoType: string;
    readonly memo: string;
  }): Promise<boolean> {
    void _input;
    return true;
  }

  // 기능 : fake 회사 메모 로그 삭제를 처리합니다.
  async deleteMemoLog(_input: DeleteCompanyMemoLogInput): Promise<boolean> {
    void _input;
    return true;
  }

  // 기능 : fake 회사 개인 비밀 메모 로그를 생성합니다.
  async createPrivateMemoLog(
    _input: CreateCompanyPrivateMemoLogInput
  ): Promise<void> {
    void _input;
  }

  // 기능 : fake 회사 개인 비밀 메모 로그 목록을 반환합니다.
  async listPrivateMemoLogs(_input: {
    readonly userId: string;
    readonly companyId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<CompanyPrivateMemoLogRecord[]> {
    void _input;
    return [];
  }

  // 기능 : fake 회사 개인 비밀 메모 로그를 수정합니다.
  async updatePrivateMemoLog(_input: {
    readonly userId: string;
    readonly companyId: string;
    readonly privateMemoLogId: string;
    readonly memoCiphertext: string;
    readonly memoKeyVersion: string;
  }): Promise<boolean> {
    void _input;
    return true;
  }

  // 기능 : fake 회사 개인 비밀 메모 로그 삭제를 처리합니다.
  async deletePrivateMemoLog(
    _input: DeleteCompanyPrivateMemoLogInput
  ): Promise<boolean> {
    void _input;
    return true;
  }
}

// 역할 : SilentLogger 테스트 중 로그 출력을 막는 logger입니다.
class SilentLogger extends AppLogger {
  // 기능 : 테스트 로그를 무시합니다.
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

const xlsxWriter: XlsxWorkbookWriter = {
  async writeWorksheet() {
    return Buffer.from("xlsx");
  },
};

function createService(repository: FakeCompanyRepository): CompanyApplicationService {
  return new CompanyApplicationService(
    repository,
    privateMemoEncryption,
    xlsxWriter,
    new SilentLogger()
  );
}

describe("CompanyApplicationService", () => {
  it("normalizes company list field and region filters into unique id arrays", async () => {
    const repository = new FakeCompanyRepository();
    const service = createService(repository);

    await service.listCompanies(CURRENT_USER, {
      companyFieldId: "field-1",
      companyFieldIds: ["field-2", "field-1"],
      companyRegionIds: ["region-1", "region-2", "region-1"],
    });

    expect(repository.listCompaniesInputs[0]).toMatchObject({
      companyFieldIds: ["field-1", "field-2"],
      companyRegionIds: ["region-1", "region-2"],
    });
  });

  it("passes multiple company filters to export queries", async () => {
    const repository = new FakeCompanyRepository();
    const service = createService(repository);

    await service.exportCompaniesXlsx(CURRENT_USER, {
      companyFieldIds: ["field-1", "field-2"],
      companyRegionId: "region-1",
    });

    expect(repository.exportCompaniesInputs[0]).toMatchObject({
      companyFieldIds: ["field-1", "field-2"],
      companyRegionIds: ["region-1"],
    });
  });

  // 기능 : 회사 주소와 표준 지역 code가 application 계층에서 정규화되는지 검증합니다.
  it("normalizes optional company address when creating a company", async () => {
    const repository = new FakeCompanyRepository();
    const service = createService(repository);

    await service.createCompany(CURRENT_USER, {
      companyName: " Global Account ",
      companyFieldId: "field-1",
      companyRegionId: "region-1",
      address: "  123 Seoul-ro  ",
    });

    expect(repository.createdCompanies[0]).toMatchObject({
      companyName: "Global Account",
      address: "123 Seoul-ro",
    });
  });

  it("creates a standard company region with country and region codes", async () => {
    const repository = new FakeCompanyRepository();
    const service = createService(repository);

    await service.createRegion(CURRENT_USER, {
      region: "New York",
      countryCode: "us",
      regionCode: "us-ny",
    });

    expect(repository.createdRegions[0]).toEqual({
      userId: CURRENT_USER.id,
      region: "New York",
      countryCode: "US",
      regionCode: "US-NY",
    });
  });

  it("rejects unsupported company region codes", async () => {
    const repository = new FakeCompanyRepository();
    const service = createService(repository);

    await expect(
      service.createRegion(CURRENT_USER, {
        region: "Unknown State",
        countryCode: "US",
        regionCode: "US-ZZ",
      })
    ).rejects.toMatchObject({
      code: "COMPANY_REGION_UNSUPPORTED",
      details: { field: "regionCode" },
    });
  });

  it("rejects unknown field ids before querying companies", async () => {
    const repository = new FakeCompanyRepository();
    const service = createService(repository);

    await expect(
      service.listCompanies(CURRENT_USER, {
        companyFieldIds: ["field-1", "missing-field"],
      })
    ).rejects.toBeInstanceOf(CompanyFieldNotFoundError);

    expect(repository.listCompaniesInputs).toHaveLength(0);
  });
});
