import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import { CompanyListSort } from "@/modules/company/application/ports/company-query.types";
import {
  COMPANY_REPOSITORY,
  type CompanyListRecord,
  type CompanyRecord,
  type CompanyRepository,
  type UpdateCompanyInput,
} from "@/modules/company/application/ports/company.repository";
import { normalizeCompanyRegionCodeInput } from "@/modules/company/application/services/company-region-code";
import {
  CompanyExportFailedError,
  CompanyFieldInUseError,
  CompanyFieldNotFoundError,
  CompanyNotFoundError,
  CompanyRegionInUseError,
  CompanyRegionNotFoundError,
  DuplicateCompanyFieldError,
  DuplicateCompanyRegionError,
} from "@/modules/company/domain/company.errors";
import {
  createTimestampedXlsxFileName,
  type ExportedXlsxFileResponse,
  XLSX_CONTENT_TYPE,
} from "@/shared/application/export/xlsx-export-file";
import {
  formatXlsxDateTime,
  getXlsxLocalizedText,
  resolveXlsxLocalizationContext,
  type XlsxLocalizationContext,
  type XlsxSupportedLocale,
} from "@/shared/application/export/xlsx-localization";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  XLSX_WORKBOOK_WRITER,
  type XlsxRow,
  type XlsxWorkbookWriter,
} from "@/shared/application/ports/xlsx-workbook.writer";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const COMPANY_PAGE_SIZE = 15;

const COMPANY_EXPORT_SHEET_NAMES: Readonly<
  Record<XlsxSupportedLocale, string>
> = {
  "ko-KR": "회사",
  en: "Companies",
};

const COMPANY_EXPORT_HEADERS: Readonly<
  Record<string, Readonly<Record<XlsxSupportedLocale, string>>>
> = {
  companyName: { "ko-KR": "회사명", en: "Company Name" },
  companyField: { "ko-KR": "회사 분야", en: "Industry" },
  companyRegion: { "ko-KR": "회사 지역", en: "Region" },
  companyRegionCountryCode: { "ko-KR": "지역 국가", en: "Region Country" },
  companyRegionCode: { "ko-KR": "지역 코드", en: "Region Code" },
  address: { "ko-KR": "주소", en: "Address" },
  createdAt: { "ko-KR": "등록일", en: "Created At" },
};

// 역할 : CompanyListQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyListQueryInput {
  readonly page?: number;
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyFieldIds?: readonly string[];
  readonly companyRegionId?: string;
  readonly companyRegionIds?: readonly string[];
  readonly sort?: CompanyListSort;
}

// 역할 : CompanyExportQueryInput 회사 export query 조건을 정의합니다.
export interface CompanyExportQueryInput {
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyFieldIds?: readonly string[];
  readonly companyRegionId?: string;
  readonly companyRegionIds?: readonly string[];
  readonly sort?: CompanyListSort;
  readonly locale?: string;
  readonly timeZone?: string;
}

// 역할 : CreateCompanyInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateCompanyInput {
  readonly companyName: string;
  readonly companyFieldId: string;
  readonly companyRegionId: string;
  readonly address?: string | null;
}

// 역할 : UpdateCompanyCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateCompanyCommand {
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
  readonly address?: string | null;
}

// 역할 : CompanyPageResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyPageResponse {
  readonly items: CompanyListItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

// 역할 : CompanyListItemResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyListItemResponse {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: {
    readonly id: string;
    readonly field: string;
  };
  readonly companyRegion: {
    readonly id: string;
    readonly region: string;
    readonly countryCode: string | null;
    readonly regionCode: string | null;
  };
  readonly address: string | null;
  readonly createdAt: string;
}

// 역할 : CompanyDetailResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyDetailResponse {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: {
    readonly id: string;
    readonly field: string;
  };
  readonly companyRegion: {
    readonly id: string;
    readonly region: string;
    readonly countryCode: string | null;
    readonly regionCode: string | null;
  };
  readonly address: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : CompanyFieldListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyFieldListResponse {
  readonly items: Array<{
    readonly id: string;
    readonly field: string;
  }>;
}

// 역할 : CompanyRegionListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyRegionListResponse {
  readonly items: Array<{
    readonly id: string;
    readonly region: string;
    readonly countryCode: string | null;
    readonly regionCode: string | null;
  }>;
}

// 역할 : CompanyApplicationService 공통 기능 또는 application 서비스를 제공합니다.
@Injectable()
export class CompanyApplicationService {
  // 기능 : 회사 저장소와 xlsx writer를 주입받습니다.
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(XLSX_WORKBOOK_WRITER)
    private readonly xlsxWriter: XlsxWorkbookWriter,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 현재 사용자의 회사 목록을 15개 단위 페이지로 조회합니다.
  async listCompanies(
    currentUser: CurrentUserContext,
    query: CompanyListQueryInput
  ): Promise<CompanyPageResponse> {
    // 1. 목록 조회 조건을 기본값과 검색 가능한 텍스트로 정규화한다.
    const page = query.page ?? 1;
    const companyName = this.normalizeOptionalText(query.companyName);
    const companyFieldIds = this.normalizeFilterIds(
      query.companyFieldId,
      query.companyFieldIds
    );
    const companyRegionIds = this.normalizeFilterIds(
      query.companyRegionId,
      query.companyRegionIds
    );

    // 2. 필터로 받은 회사 분야와 지역이 현재 사용자 소유인지 검증한다.
    await this.assertFieldsExist(currentUser.id, companyFieldIds);
    await this.assertRegionsExist(currentUser.id, companyRegionIds);

    // 3. 현재 사용자 ownership 기준으로 회사 목록을 조회한다.
    const result = await this.companyRepository.listCompanies({
      userId: currentUser.id,
      page,
      pageSize: COMPANY_PAGE_SIZE,
      ...(companyName ? { companyName } : {}),
      ...(companyFieldIds.length > 0 ? { companyFieldIds } : {}),
      ...(companyRegionIds.length > 0 ? { companyRegionIds } : {}),
      sort: query.sort ?? CompanyListSort.CREATED_AT_DESC,
    });

    // 4. 민감한 검색어 없이 회사 목록 조회 이벤트를 기록한다.
    this.logEvent("company.listed", {
      userId: currentUser.id,
      sort: query.sort ?? CompanyListSort.CREATED_AT_DESC,
      companyFieldFilterCount: companyFieldIds.length,
      companyRegionFilterCount: companyRegionIds.length,
    });

    // 5. repository 결과를 페이지 응답 DTO로 변환한다.
    return {
      items: result.items.map((company) => this.toCompanyListItem(company)),
      page,
      pageSize: COMPANY_PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / COMPANY_PAGE_SIZE),
    };
  }

  // 기능 : 검색과 필터가 반영된 회사 목록을 xlsx 파일로 생성합니다.
  async exportCompaniesXlsx(
    currentUser: CurrentUserContext,
    query: CompanyExportQueryInput
  ): Promise<ExportedXlsxFileResponse> {
    // 1. export 조회 조건을 저장소 입력에 맞게 정규화한다.
    const companyName = this.normalizeOptionalText(query.companyName);
    const companyFieldIds = this.normalizeFilterIds(
      query.companyFieldId,
      query.companyFieldIds
    );
    const companyRegionIds = this.normalizeFilterIds(
      query.companyRegionId,
      query.companyRegionIds
    );

    // 2. 필터로 받은 회사 분야와 지역이 현재 사용자 소유인지 검증한다.
    await this.assertFieldsExist(currentUser.id, companyFieldIds);
    await this.assertRegionsExist(currentUser.id, companyRegionIds);

    // 3. 페이지네이션 없이 현재 검색과 필터에 맞는 회사 전체 목록을 조회한다.
    const companies = await this.companyRepository.listCompaniesForExport({
      userId: currentUser.id,
      ...(companyName ? { companyName } : {}),
      ...(companyFieldIds.length > 0 ? { companyFieldIds } : {}),
      ...(companyRegionIds.length > 0 ? { companyRegionIds } : {}),
      sort: query.sort ?? CompanyListSort.CREATED_AT_DESC,
    });

    // 4. xlsx writer로 다운로드 파일 본문을 생성한다.
    const localization = resolveXlsxLocalizationContext({
      locale: query.locale,
      preferredLocale: currentUser.preferredLocale,
      timeZone: query.timeZone,
      userTimeZone: currentUser.timeZone,
      defaultCurrencyCode: currentUser.defaultCurrencyCode,
    });
    const content = await this.writeCompanyExportXlsx(companies, localization);

    // 5. 검색어 없이 회사 export 이벤트를 기록한다.
    this.logEvent("company.exported", {
      userId: currentUser.id,
      rowCount: companies.length,
      sort: query.sort ?? CompanyListSort.CREATED_AT_DESC,
      companyFieldFilterCount: companyFieldIds.length,
      companyRegionFilterCount: companyRegionIds.length,
    });

    // 6. controller가 다운로드 응답으로 변환할 파일 정보를 반환한다.
    return {
      fileName: createTimestampedXlsxFileName("companies"),
      contentType: XLSX_CONTENT_TYPE,
      content,
    };
  }

  // 기능 : 현재 사용자의 회사 분야 목록을 조회합니다.
  async listFields(
    currentUser: CurrentUserContext
  ): Promise<CompanyFieldListResponse> {
    // 1. 현재 사용자 소유의 회사 분야 목록을 조회한다.
    return {
      items: await this.companyRepository.listFields(currentUser.id),
    };
  }

  // 기능 : 현재 사용자의 회사 지역 목록을 조회합니다.
  async listRegions(
    currentUser: CurrentUserContext
  ): Promise<CompanyRegionListResponse> {
    // 1. 현재 사용자 소유의 회사 지역 목록을 조회한다.
    return {
      items: await this.companyRepository.listRegions(currentUser.id),
    };
  }

  // 기능 : 현재 사용자의 회사 단건 상세를 조회합니다.
  async getCompany(
    currentUser: CurrentUserContext,
    companyId: string
  ): Promise<CompanyDetailResponse> {
    // 1. 현재 사용자 ownership 기준으로 회사 단건을 조회한다.
    const company = await this.companyRepository.findCompany(
      currentUser.id,
      companyId
    );

    // 2. 회사가 없으면 domain 오류로 중단한다.
    if (!company) {
      throw new CompanyNotFoundError();
    }

    // 3. 회사 상세 응답 DTO로 변환한다.
    return this.toCompanyDetail(company);
  }

  // 기능 : 현재 사용자의 회사를 생성합니다.
  async createCompany(
    currentUser: CurrentUserContext,
    input: CreateCompanyInput
  ): Promise<void> {
    // 1. 회사명과 주소를 저장 가능한 형태로 정규화한다.
    const companyName = this.normalizeRequiredText(
      input.companyName,
      "companyName is required"
    );
    const address = this.normalizeOptionalText(input.address) ?? null;

    // 2. 소유권 검증과 회사 생성을 같은 transaction 안에서 실행한다.
    await this.companyRepository.runInTransaction(async (repository) => {
      // 3. 회사 분야와 회사 지역이 현재 사용자 소유인지 검증한다.
      await this.assertFieldExists(
        currentUser.id,
        input.companyFieldId,
        repository
      );
      await this.assertRegionExists(
        currentUser.id,
        input.companyRegionId,
        repository
      );

      // 4. 회사 본문 데이터를 생성한다.
      await repository.createCompany({
        userId: currentUser.id,
        companyName,
        companyFieldId: input.companyFieldId,
        companyRegionId: input.companyRegionId,
        address,
      });
    });
  }

  // 기능 : 회사명, 회사 분야, 회사 지역, 주소 중 요청에 포함된 값만 수정합니다.
  async updateCompany(
    currentUser: CurrentUserContext,
    companyId: string,
    input: UpdateCompanyCommand
  ): Promise<void> {
    // 1. 수정 요청에서 포함된 필드만 저장 입력으로 정규화한다.
    const updateInput = this.normalizeCompanyUpdateInput(input);

    // 2. 수정할 필드가 하나 이상 있는지 검증한다.
    if (Object.keys(updateInput).length === 0) {
      throw new ValidationDomainError("At least one company field is required");
    }

    // 3. 수정 대상 회사가 현재 사용자 소유인지 검증한다.
    await this.assertCompanyExists(currentUser.id, companyId);

    // 4. 변경할 회사 분야와 지역이 현재 사용자 소유인지 검증한다.
    if (updateInput.companyFieldId) {
      await this.assertFieldExists(currentUser.id, updateInput.companyFieldId);
    }

    if (updateInput.companyRegionId) {
      await this.assertRegionExists(currentUser.id, updateInput.companyRegionId);
    }

    // 5. 회사 기본 정보를 수정한다.
    const updated = await this.companyRepository.updateCompany(
      currentUser.id,
      companyId,
      updateInput
    );

    // 6. 수정 결과가 없으면 회사 없음 오류로 중단한다.
    if (!updated) {
      throw new CompanyNotFoundError();
    }
  }

  // 기능 : 현재 사용자의 회사 분야를 생성합니다.
  async createField(
    currentUser: CurrentUserContext,
    field: string
  ): Promise<void> {
    // 1. 분야명을 저장 가능한 필수 텍스트로 정규화한다.
    const normalizedField = this.normalizeRequiredText(
      field,
      "field is required"
    );

    // 2. 현재 사용자 안에서 같은 분야명이 이미 있는지 검증한다.
    if (
      await this.companyRepository.existsFieldByName(
        currentUser.id,
        normalizedField
      )
    ) {
      throw new DuplicateCompanyFieldError();
    }

    // 3. 현재 사용자 소유의 회사 분야를 생성한다.
    await this.companyRepository.createField(currentUser.id, normalizedField);
  }

  // 기능 : 사용 중이 아닌 현재 사용자의 회사 분야를 삭제합니다.
  async deleteField(
    currentUser: CurrentUserContext,
    fieldId: string
  ): Promise<void> {
    // 1. 삭제 대상 분야가 현재 사용자 소유인지 검증한다.
    await this.assertFieldExists(currentUser.id, fieldId);

    // 2. 회사에서 사용 중인 분야인지 검증한다.
    if (await this.companyRepository.isFieldInUse(currentUser.id, fieldId)) {
      throw new CompanyFieldInUseError();
    }

    // 3. 사용 중이 아닌 분야를 삭제한다.
    await this.companyRepository.deleteField(currentUser.id, fieldId);
  }

  // 기능 : 현재 사용자의 회사 지역을 생성합니다.
  async createRegion(
    currentUser: CurrentUserContext,
    input: {
      readonly region: string;
      readonly countryCode?: string | null;
      readonly regionCode?: string | null;
    }
  ): Promise<void> {
    // 1. 지역명과 선택 code를 저장 가능한 형태로 정규화한다.
    const normalizedRegion = normalizeCompanyRegionCodeInput(input);

    // 2. 현재 사용자 안에서 같은 표준 code 또는 지역명이 이미 있는지 검증한다.
    if (
      normalizedRegion.countryCode &&
      normalizedRegion.regionCode &&
      (await this.companyRepository.existsRegionByCode(
        currentUser.id,
        normalizedRegion.countryCode,
        normalizedRegion.regionCode
      ))
    ) {
      throw new DuplicateCompanyRegionError();
    }

    if (
      await this.companyRepository.existsRegionByName(
        currentUser.id,
        normalizedRegion.region
      )
    ) {
      throw new DuplicateCompanyRegionError();
    }

    // 3. 현재 사용자 소유의 회사 지역을 생성한다.
    await this.companyRepository.createRegion({
      userId: currentUser.id,
      region: normalizedRegion.region,
      countryCode: normalizedRegion.countryCode,
      regionCode: normalizedRegion.regionCode,
    });
  }

  // 기능 : 사용 중이 아닌 현재 사용자의 회사 지역을 삭제합니다.
  async deleteRegion(
    currentUser: CurrentUserContext,
    regionId: string
  ): Promise<void> {
    // 1. 삭제 대상 지역이 현재 사용자 소유인지 검증한다.
    await this.assertRegionExists(currentUser.id, regionId);

    // 2. 회사에서 사용 중인 지역인지 검증한다.
    if (await this.companyRepository.isRegionInUse(currentUser.id, regionId)) {
      throw new CompanyRegionInUseError();
    }

    // 3. 사용 중이 아닌 지역을 삭제한다.
    await this.companyRepository.deleteRegion(currentUser.id, regionId);
  }

  // 기능 : 회사 분야들이 현재 사용자의 소유인지 확인합니다.
  private async assertFieldsExist(
    userId: string,
    fieldIds: readonly string[]
  ): Promise<void> {
    for (const fieldId of fieldIds) {
      await this.assertFieldExists(userId, fieldId);
    }
  }

  // 기능 : 회사 분야가 현재 사용자의 소유인지 확인합니다.
  private async assertFieldExists(
    userId: string,
    fieldId: string,
    repository: CompanyRepository = this.companyRepository
  ): Promise<void> {
    if (!(await repository.findField(userId, fieldId))) {
      throw new CompanyFieldNotFoundError();
    }
  }

  // 기능 : 회사 지역들이 현재 사용자의 소유인지 확인합니다.
  private async assertRegionsExist(
    userId: string,
    regionIds: readonly string[]
  ): Promise<void> {
    for (const regionId of regionIds) {
      await this.assertRegionExists(userId, regionId);
    }
  }

  // 기능 : 회사 지역이 현재 사용자의 소유인지 확인합니다.
  private async assertRegionExists(
    userId: string,
    regionId: string,
    repository: CompanyRepository = this.companyRepository
  ): Promise<void> {
    if (!(await repository.findRegion(userId, regionId))) {
      throw new CompanyRegionNotFoundError();
    }
  }

  // 기능 : 회사가 현재 사용자의 소유인지 확인합니다.
  private async assertCompanyExists(
    userId: string,
    companyId: string
  ): Promise<void> {
    if (!(await this.companyRepository.findCompanyLookup(userId, companyId))) {
      throw new CompanyNotFoundError();
    }
  }

  // 기능 : 필수 텍스트 입력을 trim하고 비어 있으면 validation 오류를 던집니다.
  private normalizeRequiredText(value: string, message: string): string {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(message);
    }

    return normalized;
  }

  // 기능 : 선택 텍스트 입력을 trim하고 비어 있으면 undefined로 변환합니다.
  private normalizeOptionalText(value: string | null | undefined): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  // 기능 : 단일 필터 ID와 다중 필터 ID를 중복 없는 배열로 정규화합니다.
  private normalizeFilterIds(
    singleId: string | undefined,
    ids: readonly string[] | undefined
  ): string[] {
    const normalizedIds: string[] = [];

    for (const id of [singleId, ...(ids ?? [])]) {
      const normalizedId = this.normalizeOptionalText(id);

      if (normalizedId && !normalizedIds.includes(normalizedId)) {
        normalizedIds.push(normalizedId);
      }
    }

    return normalizedIds;
  }

  // 기능 : 회사 수정 요청에서 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeCompanyUpdateInput(
    input: UpdateCompanyCommand
  ): UpdateCompanyInput {
    return {
      ...(input.companyName !== undefined
        ? {
            companyName: this.normalizeRequiredText(
              input.companyName,
              "companyName is required"
            ),
          }
        : {}),
      ...(input.companyFieldId !== undefined
        ? { companyFieldId: input.companyFieldId }
        : {}),
      ...(input.companyRegionId !== undefined
        ? { companyRegionId: input.companyRegionId }
        : {}),
      ...(input.address !== undefined
        ? { address: this.normalizeOptionalText(input.address) ?? null }
        : {}),
    };
  }

  // 기능 : 회사 레코드를 목록 응답 항목으로 변환합니다.
  private toCompanyListItem(company: CompanyListRecord): CompanyListItemResponse {
    return {
      id: company.id,
      companyName: company.companyName,
      companyField: company.companyField,
      companyRegion: company.companyRegion,
      address: company.address,
      createdAt: company.createdAt.toISOString(),
    };
  }

  // 기능 : 회사 레코드를 단건 상세 응답으로 변환합니다.
  private toCompanyDetail(company: CompanyRecord): CompanyDetailResponse {
    return {
      id: company.id,
      companyName: company.companyName,
      companyField: company.companyField,
      companyRegion: company.companyRegion,
      address: company.address,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
    };
  }

  // 기능 : 회사 export 레코드를 xlsx Buffer로 변환합니다.
  private async writeCompanyExportXlsx(
    companies: CompanyListRecord[],
    localization: XlsxLocalizationContext
  ): Promise<Buffer> {
    try {
      return await this.xlsxWriter.writeWorksheet({
        sheetName: getXlsxLocalizedText(
          COMPANY_EXPORT_SHEET_NAMES,
          localization.locale
        ),
        columns: this.getCompanyExportColumns(localization.locale),
        rows: this.toCompanyExportRows(companies, localization),
      });
    } catch {
      throw new CompanyExportFailedError();
    }
  }

  // 기능 : 회사 export header를 사용자 locale에 맞게 구성합니다.
  private getCompanyExportColumns(locale: XlsxSupportedLocale) {
    return [
      { header: this.companyExportHeader("companyName", locale), key: "companyName", width: 28 },
      { header: this.companyExportHeader("companyField", locale), key: "companyField", width: 18 },
      { header: this.companyExportHeader("companyRegion", locale), key: "companyRegion", width: 18 },
      {
        header: this.companyExportHeader("companyRegionCountryCode", locale),
        key: "companyRegionCountryCode",
        width: 14,
      },
      { header: this.companyExportHeader("companyRegionCode", locale), key: "companyRegionCode", width: 14 },
      { header: this.companyExportHeader("address", locale), key: "address", width: 34 },
      { header: this.companyExportHeader("createdAt", locale), key: "createdAt", width: 22 },
    ];
  }

  // 기능 : 회사 export 컬럼 key에 대응하는 locale별 header를 반환합니다.
  private companyExportHeader(key: string, locale: XlsxSupportedLocale): string {
    return getXlsxLocalizedText(COMPANY_EXPORT_HEADERS[key], locale);
  }

  // 기능 : 회사 export 레코드를 ID 없는 xlsx 행 데이터로 변환합니다.
  private toCompanyExportRows(
    companies: CompanyListRecord[],
    localization: XlsxLocalizationContext
  ): XlsxRow[] {
    return companies.map((company) => ({
      companyName: company.companyName,
      companyField: company.companyField.field,
      companyRegion: company.companyRegion.region,
      companyRegionCountryCode: company.companyRegion.countryCode ?? "",
      companyRegionCode: company.companyRegion.regionCode ?? "",
      address: company.address ?? "",
      createdAt: formatXlsxDateTime(company.createdAt, localization),
    }));
  }

  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "CompanyApplicationService"
    );
  }
}
