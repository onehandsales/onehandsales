export const COMPANY_REPOSITORY = Symbol("COMPANY_REPOSITORY");

// 역할 : CompanyLookupRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyLookupRecord {
  readonly id: string;
  readonly userId: string;
}

// 역할 : CompanyFieldRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyFieldRecord {
  readonly id: string;
  readonly field: string;
}

// 역할 : CompanyRegionRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyRegionRecord {
  readonly id: string;
  readonly region: string;
}

// 역할 : CompanyRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyRecord {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: CompanyFieldRecord;
  readonly companyRegion: CompanyRegionRecord;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : CompanyPageRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyPageRecord {
  readonly items: CompanyRecord[];
  readonly totalCount: number;
}

// 역할 : ListCompaniesInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ListCompaniesInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
}

// 역할 : CreateCompanyInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateCompanyInput {
  readonly userId: string;
  readonly companyName: string;
  readonly companyFieldId: string;
  readonly companyRegionId: string;
}

// 역할 : UpdateCompanyInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateCompanyInput {
  readonly companyName?: string;
  readonly companyFieldId?: string;
  readonly companyRegionId?: string;
}

// 역할 : CreateCompanyMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateCompanyMemoLogInput {
  readonly companyId: string;
  readonly userId: string;
  readonly memoType: string;
  readonly memo: string;
}

// 역할 : MemoLogCursor 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface MemoLogCursor {
  readonly createdAt: Date;
  readonly id: string;
}

// 역할 : CompanyMemoLogRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyMemoLogRecord {
  readonly id: string;
  readonly memoType: string;
  readonly memo: string;
  readonly createdAt: Date;
}

// 역할 : CompanyPrivateMemoLogRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CompanyPrivateMemoLogRecord {
  readonly id: string;
  readonly memoCiphertext: string;
  readonly memoKeyVersion: string;
  readonly createdAt: Date;
}

// 역할 : CreateCompanyPrivateMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateCompanyPrivateMemoLogInput {
  readonly companyId: string;
  readonly userId: string;
  readonly memoCiphertext: string;
  readonly memoKeyVersion: string;
}

// 역할 : CompanyRepository 저장소가 제공해야 하는 영속성 계약을 정의합니다.
export interface CompanyRepository {
  // 기능 : 회사 저장소 작업을 트랜잭션 경계 안에서 실행합니다.
  runInTransaction<T>(
    work: (repository: CompanyRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 현재 사용자의 회사 목록과 전체 개수를 조회합니다.
  listCompanies(input: ListCompaniesInput): Promise<CompanyPageRecord>;
  // 기능 : 현재 사용자의 회사 단건을 조회합니다.
  findCompany(userId: string, companyId: string): Promise<CompanyRecord | null>;
  // 기능 : 현재 사용자의 회사 존재 여부만 조회합니다.
  findCompanyLookup(
    userId: string,
    companyId: string
  ): Promise<CompanyLookupRecord | null>;
  // 기능 : 현재 사용자의 회사 단건을 생성합니다.
  createCompany(input: CreateCompanyInput): Promise<CompanyLookupRecord>;
  // 기능 : 현재 사용자의 회사 기본 정보를 수정합니다.
  updateCompany(
    userId: string,
    companyId: string,
    input: UpdateCompanyInput
  ): Promise<boolean>;
  // 기능 : 현재 사용자의 회사 분야 목록을 조회합니다.
  listFields(userId: string): Promise<CompanyFieldRecord[]>;
  // 기능 : 현재 사용자의 회사 분야 단건을 조회합니다.
  findField(userId: string, fieldId: string): Promise<CompanyFieldRecord | null>;
  // 기능 : 현재 사용자 안에서 같은 회사 분야 이름이 있는지 확인합니다.
  existsFieldByName(userId: string, field: string): Promise<boolean>;
  // 기능 : 현재 사용자의 회사 분야를 생성합니다.
  createField(userId: string, field: string): Promise<void>;
  // 기능 : 회사 분야를 사용하는 회사가 있는지 확인합니다.
  isFieldInUse(userId: string, fieldId: string): Promise<boolean>;
  // 기능 : 현재 사용자의 회사 분야를 삭제합니다.
  deleteField(userId: string, fieldId: string): Promise<void>;
  // 기능 : 현재 사용자의 회사 지역 목록을 조회합니다.
  listRegions(userId: string): Promise<CompanyRegionRecord[]>;
  // 기능 : 현재 사용자의 회사 지역 단건을 조회합니다.
  findRegion(
    userId: string,
    regionId: string
  ): Promise<CompanyRegionRecord | null>;
  // 기능 : 현재 사용자 안에서 같은 회사 지역 이름이 있는지 확인합니다.
  existsRegionByName(userId: string, region: string): Promise<boolean>;
  // 기능 : 현재 사용자의 회사 지역을 생성합니다.
  createRegion(userId: string, region: string): Promise<void>;
  // 기능 : 회사 지역을 사용하는 회사가 있는지 확인합니다.
  isRegionInUse(userId: string, regionId: string): Promise<boolean>;
  // 기능 : 현재 사용자의 회사 지역을 삭제합니다.
  deleteRegion(userId: string, regionId: string): Promise<void>;
  // 기능 : 회사 일반 메모 로그를 생성합니다.
  createMemoLog(input: CreateCompanyMemoLogInput): Promise<void>;
  // 기능 : 회사 일반 메모 로그를 cursor 기준으로 조회합니다.
  listMemoLogs(input: {
    readonly companyId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<CompanyMemoLogRecord[]>;
  // 기능 : 회사 일반 메모 로그의 memoType과 memo를 수정합니다.
  updateMemoLog(input: {
    readonly userId: string;
    readonly companyId: string;
    readonly memoLogId: string;
    readonly memoType: string;
    readonly memo: string;
  }): Promise<boolean>;
  // 기능 : 회사 개인 비밀 메모 로그를 생성합니다.
  createPrivateMemoLog(input: CreateCompanyPrivateMemoLogInput): Promise<void>;
  // 기능 : 회사 개인 비밀 메모 로그를 작성자 본인 기준으로 조회합니다.
  listPrivateMemoLogs(input: {
    readonly userId: string;
    readonly companyId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<CompanyPrivateMemoLogRecord[]>;
  // 기능 : 회사 개인 비밀 메모 로그의 암호문과 key version만 수정합니다.
  updatePrivateMemoLog(input: {
    readonly userId: string;
    readonly companyId: string;
    readonly privateMemoLogId: string;
    readonly memoCiphertext: string;
    readonly memoKeyVersion: string;
  }): Promise<boolean>;
}
