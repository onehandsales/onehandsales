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

export interface CompanyListQueryInput {
  readonly page?: number;
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
}

export interface CreateCompanyInput {
  readonly companyName: string;
  readonly companyFieldId: string;
  readonly companyRegionId: string;
  readonly companyMemo?: string | null;
}

export interface UpdateCompanyCommand {
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
}

export interface CursorQueryInput {
  readonly cursor?: string;
}

export interface CompanyPageResponse {
  readonly items: CompanyListItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

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

export interface CompanyDetailResponse extends CompanyListItemResponse {
  readonly updatedAt: string;
}

export interface CompanyFieldListResponse {
  readonly items: Array<{
    readonly id: string;
    readonly field: string;
  }>;
}

export interface CompanyRegionListResponse {
  readonly items: Array<{
    readonly id: string;
    readonly region: string;
  }>;
}

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

export interface CompanyPrivateMemoLogConnectionResponse {
  readonly items: Array<{
    readonly id: string;
    readonly memo: string;
    readonly createdAt: string;
  }>;
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

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
    const page = query.page ?? 1;
    const companyName = this.normalizeOptionalText(query.companyName);

    if (query.companyFieldId) {
      await this.assertFieldExists(currentUser.id, query.companyFieldId);
    }

    if (query.companyRegionId) {
      await this.assertRegionExists(currentUser.id, query.companyRegionId);
    }

    const result = await this.companyRepository.listCompanies({
      userId: currentUser.id,
      page,
      pageSize: COMPANY_PAGE_SIZE,
      ...(companyName ? { companyName } : {}),
      ...(query.companyFieldId ? { companyFieldId: query.companyFieldId } : {}),
      ...(query.companyRegionId ? { companyRegionId: query.companyRegionId } : {}),
    });

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
    return {
      items: await this.companyRepository.listFields(currentUser.id),
    };
  }

  // 기능 : 현재 사용자의 회사 지역 목록을 조회합니다.
  async listRegions(
    currentUser: CurrentUserContext
  ): Promise<CompanyRegionListResponse> {
    return {
      items: await this.companyRepository.listRegions(currentUser.id),
    };
  }

  // 기능 : 현재 사용자의 회사 단건 상세를 조회합니다.
  async getCompany(
    currentUser: CurrentUserContext,
    companyId: string
  ): Promise<CompanyDetailResponse> {
    const company = await this.companyRepository.findCompany(
      currentUser.id,
      companyId
    );

    if (!company) {
      throw new CompanyNotFoundError();
    }

    return this.toCompanyDetail(company);
  }

  // 기능 : 회사를 생성하고 선택 메모가 있으면 같은 트랜잭션에서 첫 메모 로그를 생성합니다.
  async createCompany(
    currentUser: CurrentUserContext,
    input: CreateCompanyInput
  ): Promise<void> {
    const companyName = this.normalizeRequiredText(
      input.companyName,
      "companyName is required"
    );
    const companyMemo = this.normalizeOptionalText(input.companyMemo);

    await this.companyRepository.runInTransaction(async (repository) => {
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

      const company = await repository.createCompany({
        userId: currentUser.id,
        companyName,
        companyFieldId: input.companyFieldId,
        companyRegionId: input.companyRegionId,
      });

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
    const updateInput = this.normalizeCompanyUpdateInput(input);

    if (Object.keys(updateInput).length === 0) {
      throw new ValidationDomainError("At least one company field is required");
    }

    await this.assertCompanyExists(currentUser.id, companyId);

    if (updateInput.companyFieldId) {
      await this.assertFieldExists(currentUser.id, updateInput.companyFieldId);
    }

    if (updateInput.companyRegionId) {
      await this.assertRegionExists(currentUser.id, updateInput.companyRegionId);
    }

    const updated = await this.companyRepository.updateCompany(
      currentUser.id,
      companyId,
      updateInput
    );

    if (!updated) {
      throw new CompanyNotFoundError();
    }
  }

  // 기능 : 현재 사용자의 회사 분야를 생성합니다.
  async createField(
    currentUser: CurrentUserContext,
    field: string
  ): Promise<void> {
    const normalizedField = this.normalizeRequiredText(
      field,
      "field is required"
    );

    if (
      await this.companyRepository.existsFieldByName(
        currentUser.id,
        normalizedField
      )
    ) {
      throw new DuplicateCompanyFieldError();
    }

    await this.companyRepository.createField(currentUser.id, normalizedField);
  }

  // 기능 : 사용 중이 아닌 현재 사용자의 회사 분야를 삭제합니다.
  async deleteField(
    currentUser: CurrentUserContext,
    fieldId: string
  ): Promise<void> {
    await this.assertFieldExists(currentUser.id, fieldId);

    if (await this.companyRepository.isFieldInUse(currentUser.id, fieldId)) {
      throw new CompanyFieldInUseError();
    }

    await this.companyRepository.deleteField(currentUser.id, fieldId);
  }

  // 기능 : 현재 사용자의 회사 지역을 생성합니다.
  async createRegion(
    currentUser: CurrentUserContext,
    region: string
  ): Promise<void> {
    const normalizedRegion = this.normalizeRequiredText(
      region,
      "region is required"
    );

    if (
      await this.companyRepository.existsRegionByName(
        currentUser.id,
        normalizedRegion
      )
    ) {
      throw new DuplicateCompanyRegionError();
    }

    await this.companyRepository.createRegion(currentUser.id, normalizedRegion);
  }

  // 기능 : 사용 중이 아닌 현재 사용자의 회사 지역을 삭제합니다.
  async deleteRegion(
    currentUser: CurrentUserContext,
    regionId: string
  ): Promise<void> {
    await this.assertRegionExists(currentUser.id, regionId);

    if (await this.companyRepository.isRegionInUse(currentUser.id, regionId)) {
      throw new CompanyRegionInUseError();
    }

    await this.companyRepository.deleteRegion(currentUser.id, regionId);
  }

  // 기능 : 현재 사용자의 회사에 일반 메모 로그를 생성합니다.
  async createMemoLog(
    currentUser: CurrentUserContext,
    companyId: string,
    input: { readonly memoType: string; readonly memo: string }
  ): Promise<void> {
    await this.assertCompanyExists(currentUser.id, companyId);
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
    await this.assertCompanyExists(currentUser.id, companyId);
    const records = await this.companyRepository.listMemoLogs({
      companyId,
      cursor: this.parseCursor(query.cursor),
      take: MEMO_LOG_PAGE_SIZE + 1,
    });

    return this.toMemoLogConnection(records);
  }

  // 기능 : 현재 사용자의 회사 일반 메모 로그 본문만 수정합니다.
  async updateMemoLog(
    currentUser: CurrentUserContext,
    companyId: string,
    memoLogId: string,
    memo: string
  ): Promise<void> {
    await this.assertCompanyExists(currentUser.id, companyId);
    const updated = await this.companyRepository.updateMemoLog({
      userId: currentUser.id,
      companyId,
      memoLogId,
      memo: this.normalizeRequiredText(memo, "memo is required"),
    });

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
    await this.assertCompanyExists(currentUser.id, companyId);
    const encrypted = this.privateMemoEncryption.encrypt(
      this.normalizeRequiredText(memo, "memo is required")
    );

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
    await this.assertCompanyExists(currentUser.id, companyId);
    const records = await this.companyRepository.listPrivateMemoLogs({
      userId: currentUser.id,
      companyId,
      cursor: this.parseCursor(query.cursor),
      take: MEMO_LOG_PAGE_SIZE + 1,
    });

    return this.toPrivateMemoLogConnection(records);
  }

  // 기능 : 현재 사용자의 회사 개인 비밀 메모 로그 본문만 다시 암호화해 수정합니다.
  async updatePrivateMemoLog(
    currentUser: CurrentUserContext,
    companyId: string,
    privateMemoLogId: string,
    memo: string
  ): Promise<void> {
    await this.assertCompanyExists(currentUser.id, companyId);
    const encrypted = this.privateMemoEncryption.encrypt(
      this.normalizeRequiredText(memo, "memo is required")
    );
    const updated = await this.companyRepository.updatePrivateMemoLog({
      userId: currentUser.id,
      companyId,
      privateMemoLogId,
      memoCiphertext: encrypted.ciphertext,
      memoKeyVersion: encrypted.keyVersion,
    });

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
