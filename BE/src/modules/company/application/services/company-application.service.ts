import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  type CompanyMemoLogRecord,
  COMPANY_REPOSITORY,
  type CompanyPrivateMemoLogRecord,
  type CompanyRecord,
  type CompanyRepository,
  type MemoLogCursor,
  type UpdateCompanyInput,
} from "@/modules/company/application/ports/company.repository";
import {
  PRIVATE_MEMO_ENCRYPTION_PORT,
  type PrivateMemoEncryptionPort,
} from "@/modules/company/application/ports/private-memo-encryption.port";
import {
  CompanyFieldInUseError,
  CompanyFieldNotFoundError,
  CompanyMemoLogNotFoundError,
  CompanyNotFoundError,
  CompanyPrivateMemoLogNotFoundError,
  CompanyRegionInUseError,
  CompanyRegionNotFoundError,
  DuplicateCompanyFieldError,
  DuplicateCompanyRegionError,
} from "@/modules/company/domain/company.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";

const COMPANY_PAGE_SIZE = 20;
const MEMO_LOG_PAGE_SIZE = 10;
const INITIAL_COMPANY_MEMO_TYPE = "초기 메모";

// 역할 : CompanyListQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyListQueryInput {
  readonly page?: number;
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
}

// 역할 : CreateCompanyInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateCompanyInput {
  readonly companyName: string;
  readonly companyFieldId: string;
  readonly companyRegionId: string;
  readonly companyMemo?: string | null;
}

// 역할 : UpdateCompanyCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateCompanyCommand {
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
}

// 역할 : CursorQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CursorQueryInput {
  readonly cursor?: string;
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
  };
  readonly createdAt: string;
}

// 역할 : CompanyDetailResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyDetailResponse extends CompanyListItemResponse {
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
  }>;
}

// 역할 : CompanyMemoLogConnectionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyMemoLogConnectionResponse {
  readonly items: Array<{
    readonly id: string;
    readonly memoType: string;
    readonly memo: string;
    readonly createdAt: string;
  }>;
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

// 역할 : CompanyPrivateMemoLogConnectionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyPrivateMemoLogConnectionResponse {
  readonly items: Array<{
    readonly id: string;
    readonly memo: string;
    readonly createdAt: string;
  }>;
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

// 역할 : CompanyApplicationService 공통 기능 또는 application 서비스를 제공합니다.
@Injectable()
export class CompanyApplicationService {
  // 기능 : 회사 저장소와 개인 비밀 메모 암호화 포트를 주입받습니다.
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(PRIVATE_MEMO_ENCRYPTION_PORT)
    private readonly privateMemoEncryption: PrivateMemoEncryptionPort
  ) {}

  // 기능 : 현재 사용자의 회사 목록을 20개 단위 페이지로 조회합니다.
  async listCompanies(
    currentUser: CurrentUserContext,
    query: CompanyListQueryInput
  ): Promise<CompanyPageResponse> {
    // 1. 목록 조회 조건을 기본값과 검색 가능한 텍스트로 정규화한다.
    const page = query.page ?? 1;
    const companyName = this.normalizeOptionalText(query.companyName);

    // 2. 필터로 받은 회사 분야와 지역이 현재 사용자 소유인지 검증한다.
    if (query.companyFieldId) {
      await this.assertFieldExists(currentUser.id, query.companyFieldId);
    }

    if (query.companyRegionId) {
      await this.assertRegionExists(currentUser.id, query.companyRegionId);
    }

    // 3. 현재 사용자 ownership 기준으로 회사 목록을 조회한다.
    const result = await this.companyRepository.listCompanies({
      userId: currentUser.id,
      page,
      pageSize: COMPANY_PAGE_SIZE,
      ...(companyName ? { companyName } : {}),
      ...(query.companyFieldId ? { companyFieldId: query.companyFieldId } : {}),
      ...(query.companyRegionId ? { companyRegionId: query.companyRegionId } : {}),
    });

    // 4. repository 결과를 페이지 응답 DTO로 변환한다.
    return {
      items: result.items.map((company) => this.toCompanyListItem(company)),
      page,
      pageSize: COMPANY_PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / COMPANY_PAGE_SIZE),
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

  // 기능 : 회사를 생성하고 선택 메모가 있으면 같은 트랜잭션에서 첫 메모 로그를 생성합니다.
  async createCompany(
    currentUser: CurrentUserContext,
    input: CreateCompanyInput
  ): Promise<void> {
    // 1. 회사명과 초기 메모 입력값을 저장 가능한 형태로 정규화한다.
    const companyName = this.normalizeRequiredText(
      input.companyName,
      "companyName is required"
    );
    const companyMemo = this.normalizeOptionalText(input.companyMemo);

    // 2. 회사 생성과 초기 메모 생성을 같은 transaction 안에서 실행한다.
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
      const company = await repository.createCompany({
        userId: currentUser.id,
        companyName,
        companyFieldId: input.companyFieldId,
        companyRegionId: input.companyRegionId,
      });

      // 5. 초기 메모가 있으면 일반 메모 로그 첫 데이터로 저장한다.
      if (companyMemo) {
        await repository.createMemoLog({
          companyId: company.id,
          userId: currentUser.id,
          memoType: INITIAL_COMPANY_MEMO_TYPE,
          memo: companyMemo,
        });
      }
    });
  }

  // 기능 : 회사명, 회사 분야, 회사 지역 중 요청에 포함된 값만 수정합니다.
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
    region: string
  ): Promise<void> {
    // 1. 지역명을 저장 가능한 필수 텍스트로 정규화한다.
    const normalizedRegion = this.normalizeRequiredText(
      region,
      "region is required"
    );

    // 2. 현재 사용자 안에서 같은 지역명이 이미 있는지 검증한다.
    if (
      await this.companyRepository.existsRegionByName(
        currentUser.id,
        normalizedRegion
      )
    ) {
      throw new DuplicateCompanyRegionError();
    }

    // 3. 현재 사용자 소유의 회사 지역을 생성한다.
    await this.companyRepository.createRegion(currentUser.id, normalizedRegion);
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

  // 기능 : 현재 사용자의 회사에 일반 메모 로그를 생성합니다.
  async createMemoLog(
    currentUser: CurrentUserContext,
    companyId: string,
    input: { readonly memoType: string; readonly memo: string }
  ): Promise<void> {
    // 1. 메모 대상 회사가 현재 사용자 소유인지 검증한다.
    await this.assertCompanyExists(currentUser.id, companyId);

    // 2. 메모 유형과 본문을 정규화해 일반 메모 로그로 저장한다.
    await this.companyRepository.createMemoLog({
      companyId,
      userId: currentUser.id,
      memoType: this.normalizeRequiredText(input.memoType, "memoType is required"),
      memo: this.normalizeRequiredText(input.memo, "memo is required"),
    });
  }

  // 기능 : 현재 사용자의 회사 일반 메모 로그를 10개 단위 cursor 방식으로 조회합니다.
  async listMemoLogs(
    currentUser: CurrentUserContext,
    companyId: string,
    query: CursorQueryInput
  ): Promise<CompanyMemoLogConnectionResponse> {
    // 1. 조회 대상 회사가 현재 사용자 소유인지 검증한다.
    await this.assertCompanyExists(currentUser.id, companyId);

    // 2. cursor 조건으로 일반 메모 로그를 페이지 크기보다 1개 더 조회한다.
    const records = await this.companyRepository.listMemoLogs({
      companyId,
      cursor: this.parseCursor(query.cursor),
      take: MEMO_LOG_PAGE_SIZE + 1,
    });

    // 3. 조회 결과를 cursor connection 응답으로 변환한다.
    return this.toMemoLogConnection(records);
  }

  // 기능 : 현재 사용자의 회사 일반 메모 로그 유형과 본문을 수정합니다.
  async updateMemoLog(
    currentUser: CurrentUserContext,
    companyId: string,
    memoLogId: string,
    input: { readonly memoType: string; readonly memo: string }
  ): Promise<void> {
    // 1. 메모 대상 회사가 현재 사용자 소유인지 검증한다.
    await this.assertCompanyExists(currentUser.id, companyId);

    // 2. 일반 메모 로그 유형과 본문을 정규화해 수정한다.
    const updated = await this.companyRepository.updateMemoLog({
      userId: currentUser.id,
      companyId,
      memoLogId,
      memoType: this.normalizeRequiredText(input.memoType, "memoType is required"),
      memo: this.normalizeRequiredText(input.memo, "memo is required"),
    });

    // 3. 수정 대상 메모 로그가 없으면 오류로 중단한다.
    if (!updated) {
      throw new CompanyMemoLogNotFoundError();
    }
  }

  // 기능 : 현재 사용자의 회사에 암호화된 개인 비밀 메모 로그를 생성합니다.
  async createPrivateMemoLog(
    currentUser: CurrentUserContext,
    companyId: string,
    memo: string
  ): Promise<void> {
    // 1. 비밀 메모 대상 회사가 현재 사용자 소유인지 검증한다.
    await this.assertCompanyExists(currentUser.id, companyId);

    // 2. 비밀 메모 본문을 정규화한 뒤 암호화한다.
    const encrypted = this.privateMemoEncryption.encrypt(
      this.normalizeRequiredText(memo, "memo is required")
    );

    // 3. 암호문과 key version만 저장소에 저장한다.
    await this.companyRepository.createPrivateMemoLog({
      companyId,
      userId: currentUser.id,
      memoCiphertext: encrypted.ciphertext,
      memoKeyVersion: encrypted.keyVersion,
    });
  }

  // 기능 : 현재 사용자가 작성한 회사 개인 비밀 메모 로그만 복호화해 조회합니다.
  async listPrivateMemoLogs(
    currentUser: CurrentUserContext,
    companyId: string,
    query: CursorQueryInput
  ): Promise<CompanyPrivateMemoLogConnectionResponse> {
    // 1. 조회 대상 회사가 현재 사용자 소유인지 검증한다.
    await this.assertCompanyExists(currentUser.id, companyId);

    // 2. 현재 사용자가 작성한 비밀 메모 로그를 cursor 조건으로 조회한다.
    const records = await this.companyRepository.listPrivateMemoLogs({
      userId: currentUser.id,
      companyId,
      cursor: this.parseCursor(query.cursor),
      take: MEMO_LOG_PAGE_SIZE + 1,
    });

    // 3. 암호화된 메모 목록을 복호화된 cursor connection 응답으로 변환한다.
    return this.toPrivateMemoLogConnection(records);
  }

  // 기능 : 현재 사용자의 회사 개인 비밀 메모 로그 본문만 다시 암호화해 수정합니다.
  async updatePrivateMemoLog(
    currentUser: CurrentUserContext,
    companyId: string,
    privateMemoLogId: string,
    memo: string
  ): Promise<void> {
    // 1. 비밀 메모 대상 회사가 현재 사용자 소유인지 검증한다.
    await this.assertCompanyExists(currentUser.id, companyId);

    // 2. 새 비밀 메모 본문을 정규화한 뒤 암호화한다.
    const encrypted = this.privateMemoEncryption.encrypt(
      this.normalizeRequiredText(memo, "memo is required")
    );

    // 3. 작성자와 회사 소유권 조건으로 비밀 메모 로그를 수정한다.
    const updated = await this.companyRepository.updatePrivateMemoLog({
      userId: currentUser.id,
      companyId,
      privateMemoLogId,
      memoCiphertext: encrypted.ciphertext,
      memoKeyVersion: encrypted.keyVersion,
    });

    // 4. 수정 대상 비밀 메모 로그가 없으면 오류로 중단한다.
    if (!updated) {
      throw new CompanyPrivateMemoLogNotFoundError();
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
    };
  }

  // 기능 : 서버가 발급한 cursor 문자열을 조회 조건으로 복원합니다.
  private parseCursor(cursor: string | undefined): MemoLogCursor | null {
    if (!cursor) {
      return null;
    }

    try {
      const raw = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));

      if (!this.isCursorPayload(raw)) {
        throw new Error("Invalid cursor payload");
      }

      const createdAt = new Date(raw.createdAt);

      if (Number.isNaN(createdAt.getTime())) {
        throw new Error("Invalid cursor date");
      }

      return {
        createdAt,
        id: raw.id,
      };
    } catch {
      throw new ValidationDomainError("Cursor is invalid");
    }
  }

  // 기능 : cursor payload가 필요한 필드를 가진 객체인지 확인합니다.
  private isCursorPayload(
    value: unknown
  ): value is { readonly createdAt: string; readonly id: string } {
    return (
      typeof value === "object" &&
      value !== null &&
      "createdAt" in value &&
      "id" in value &&
      typeof value.createdAt === "string" &&
      typeof value.id === "string"
    );
  }

  // 기능 : 응답용 다음 페이지 cursor 문자열을 생성합니다.
  private createCursor(record: { readonly createdAt: Date; readonly id: string }): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: record.createdAt.toISOString(),
        id: record.id,
      }),
      "utf8"
    ).toString("base64url");
  }

  // 기능 : 회사 레코드를 목록 응답 항목으로 변환합니다.
  private toCompanyListItem(company: CompanyRecord): CompanyListItemResponse {
    return {
      id: company.id,
      companyName: company.companyName,
      companyField: company.companyField,
      companyRegion: company.companyRegion,
      createdAt: company.createdAt.toISOString(),
    };
  }

  // 기능 : 회사 레코드를 단건 상세 응답으로 변환합니다.
  private toCompanyDetail(company: CompanyRecord): CompanyDetailResponse {
    return {
      ...this.toCompanyListItem(company),
      updatedAt: company.updatedAt.toISOString(),
    };
  }

  // 기능 : 일반 메모 로그 목록을 cursor connection 응답으로 변환합니다.
  private toMemoLogConnection(
    records: CompanyMemoLogRecord[]
  ): CompanyMemoLogConnectionResponse {
    const items = records.slice(0, MEMO_LOG_PAGE_SIZE);
    const hasNext = records.length > MEMO_LOG_PAGE_SIZE;
    const lastItem = items[items.length - 1] ?? null;

    return {
      items: items.map((record) => ({
        id: record.id,
        memoType: record.memoType,
        memo: record.memo,
        createdAt: record.createdAt.toISOString(),
      })),
      nextCursor: hasNext && lastItem ? this.createCursor(lastItem) : null,
      hasNext,
    };
  }

  // 기능 : 개인 비밀 메모 로그 목록을 복호화된 cursor connection 응답으로 변환합니다.
  private toPrivateMemoLogConnection(
    records: CompanyPrivateMemoLogRecord[]
  ): CompanyPrivateMemoLogConnectionResponse {
    const items = records.slice(0, MEMO_LOG_PAGE_SIZE);
    const hasNext = records.length > MEMO_LOG_PAGE_SIZE;
    const lastItem = items[items.length - 1] ?? null;

    return {
      items: items.map((record) => ({
        id: record.id,
        memo: this.privateMemoEncryption.decrypt(
          record.memoCiphertext,
          record.memoKeyVersion
        ),
        createdAt: record.createdAt.toISOString(),
      })),
      nextCursor: hasNext && lastItem ? this.createCursor(lastItem) : null,
      hasNext,
    };
  }
}
