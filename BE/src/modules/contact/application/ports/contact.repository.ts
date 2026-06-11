export const CONTACT_REPOSITORY = Symbol("CONTACT_REPOSITORY");

// 역할 : ContactLookupRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactLookupRecord {
  readonly id: string;
  readonly userId: string;
}

// 역할 : ContactCompanyOptionRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactCompanyOptionRecord {
  readonly id: string;
  readonly companyName: string;
}

// 역할 : ContactJobGradeRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactJobGradeRecord {
  readonly id: string;
  readonly jobGradeName: string;
}

// 역할 : ContactDepartmentRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactDepartmentRecord {
  readonly id: string;
  readonly departmentName: string;
}

// 역할 : ContactRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactRecord {
  readonly id: string;
  readonly company: ContactCompanyOptionRecord;
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly contactDepartment: ContactDepartmentRecord;
  readonly contactJobGrade: ContactJobGradeRecord;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : ContactPageRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactPageRecord {
  readonly items: ContactRecord[];
  readonly totalCount: number;
}

// 역할 : ListContactsInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ListContactsInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly username?: string;
  readonly companyId?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
}

// 역할 : CreateContactInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateContactInput {
  readonly userId: string;
  readonly companyId: string;
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly contactDepartmentId: string;
  readonly contactJobGradeId: string;
}

// 역할 : UpdateContactInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateContactInput {
  readonly companyId?: string;
  readonly username?: string;
  readonly mobile?: string;
  readonly email?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
}

// 역할 : CreateContactMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateContactMemoLogInput {
  readonly contactId: string;
  readonly userId: string;
  readonly memoType: string;
  readonly memo: string;
}

// 역할 : MemoLogCursor 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface MemoLogCursor {
  readonly createdAt: Date;
  readonly id: string;
}

// 역할 : ContactMemoLogRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactMemoLogRecord {
  readonly id: string;
  readonly memoType: string;
  readonly memo: string;
  readonly createdAt: Date;
}

// 역할 : UpdateContactMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateContactMemoLogInput {
  readonly userId: string;
  readonly contactId: string;
  readonly memoLogId: string;
  readonly memoType?: string;
  readonly memo?: string;
}

// 역할 : ContactPrivateMemoLogRecord 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactPrivateMemoLogRecord {
  readonly id: string;
  readonly memoCiphertext: string;
  readonly memoKeyVersion: string;
  readonly createdAt: Date;
}

// 역할 : CreateContactPrivateMemoLogInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateContactPrivateMemoLogInput {
  readonly contactId: string;
  readonly userId: string;
  readonly memoCiphertext: string;
  readonly memoKeyVersion: string;
}

// 역할 : ContactRepository 저장소가 제공해야 하는 영속성 계약을 정의합니다.
export interface ContactRepository {
  // 기능 : 거래처 저장소 작업을 트랜잭션 경계 안에서 실행합니다.
  runInTransaction<T>(
    work: (repository: ContactRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 현재 사용자의 거래처 목록과 전체 개수를 조회합니다.
  listContacts(input: ListContactsInput): Promise<ContactPageRecord>;
  // 기능 : 현재 사용자의 거래처 단건을 조회합니다.
  findContact(userId: string, contactId: string): Promise<ContactRecord | null>;
  // 기능 : 현재 사용자의 거래처 존재 여부만 조회합니다.
  findContactLookup(
    userId: string,
    contactId: string
  ): Promise<ContactLookupRecord | null>;
  // 기능 : 현재 사용자의 거래처 단건을 생성합니다.
  createContact(input: CreateContactInput): Promise<ContactLookupRecord>;
  // 기능 : 현재 사용자의 거래처 기본 정보를 수정합니다.
  updateContact(
    userId: string,
    contactId: string,
    input: UpdateContactInput
  ): Promise<boolean>;
  // 기능 : 현재 사용자의 회사 옵션 목록을 조회합니다.
  listCompanyOptions(userId: string): Promise<ContactCompanyOptionRecord[]>;
  // 기능 : 현재 사용자의 회사 옵션 단건을 조회합니다.
  findCompanyOption(
    userId: string,
    companyId: string
  ): Promise<ContactCompanyOptionRecord | null>;
  // 기능 : 현재 사용자의 거래처 직급 목록을 조회합니다.
  listJobGrades(userId: string): Promise<ContactJobGradeRecord[]>;
  // 기능 : 현재 사용자의 거래처 직급 단건을 조회합니다.
  findJobGrade(
    userId: string,
    jobGradeId: string
  ): Promise<ContactJobGradeRecord | null>;
  // 기능 : 현재 사용자 안에서 같은 거래처 직급 이름이 있는지 확인합니다.
  existsJobGradeByName(userId: string, jobGradeName: string): Promise<boolean>;
  // 기능 : 현재 사용자의 거래처 직급을 생성합니다.
  createJobGrade(userId: string, jobGradeName: string): Promise<void>;
  // 기능 : 거래처 직급을 사용하는 거래처가 있는지 확인합니다.
  isJobGradeInUse(userId: string, jobGradeId: string): Promise<boolean>;
  // 기능 : 현재 사용자의 거래처 직급을 삭제합니다.
  deleteJobGrade(userId: string, jobGradeId: string): Promise<void>;
  // 기능 : 현재 사용자의 거래처 부서 목록을 조회합니다.
  listDepartments(userId: string): Promise<ContactDepartmentRecord[]>;
  // 기능 : 현재 사용자의 거래처 부서 단건을 조회합니다.
  findDepartment(
    userId: string,
    departmentId: string
  ): Promise<ContactDepartmentRecord | null>;
  // 기능 : 현재 사용자 안에서 같은 거래처 부서 이름이 있는지 확인합니다.
  existsDepartmentByName(
    userId: string,
    departmentName: string
  ): Promise<boolean>;
  // 기능 : 현재 사용자의 거래처 부서를 생성합니다.
  createDepartment(userId: string, departmentName: string): Promise<void>;
  // 기능 : 거래처 부서를 사용하는 거래처가 있는지 확인합니다.
  isDepartmentInUse(userId: string, departmentId: string): Promise<boolean>;
  // 기능 : 현재 사용자의 거래처 부서를 삭제합니다.
  deleteDepartment(userId: string, departmentId: string): Promise<void>;
  // 기능 : 거래처 일반 메모 로그를 생성합니다.
  createMemoLog(input: CreateContactMemoLogInput): Promise<void>;
  // 기능 : 거래처 일반 메모 로그를 cursor 기준으로 조회합니다.
  listMemoLogs(input: {
    readonly userId: string;
    readonly contactId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<ContactMemoLogRecord[]>;
  // 기능 : 거래처 일반 메모 로그의 memoType 또는 memo를 수정합니다.
  updateMemoLog(input: UpdateContactMemoLogInput): Promise<boolean>;
  // 기능 : 거래처 개인 비밀 메모 로그를 생성합니다.
  createPrivateMemoLog(input: CreateContactPrivateMemoLogInput): Promise<void>;
  // 기능 : 거래처 개인 비밀 메모 로그를 작성자 본인 기준으로 조회합니다.
  listPrivateMemoLogs(input: {
    readonly userId: string;
    readonly contactId: string;
    readonly cursor: MemoLogCursor | null;
    readonly take: number;
  }): Promise<ContactPrivateMemoLogRecord[]>;
  // 기능 : 거래처 개인 비밀 메모 로그의 암호문과 key version만 수정합니다.
  updatePrivateMemoLog(input: {
    readonly userId: string;
    readonly contactId: string;
    readonly privateMemoLogId: string;
    readonly memoCiphertext: string;
    readonly memoKeyVersion: string;
  }): Promise<boolean>;
}
