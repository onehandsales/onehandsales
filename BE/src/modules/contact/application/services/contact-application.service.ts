import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import {
  CONTACT_PRIVATE_MEMO_ENCRYPTION_PORT,
  type ContactPrivateMemoEncryptionPort,
} from "@/modules/contact/application/ports/contact-private-memo-encryption.port";
import {
  CONTACT_REPOSITORY,
  ContactListSort,
  type ContactDealRecord,
  type ContactDepartmentRecord,
  type ContactJobGradeRecord,
  type ContactMemoLogRecord,
  type ContactPrivateMemoLogRecord,
  type ContactRecord,
  type ContactRepository,
  type MemoLogCursor,
  type UpdateContactInput,
} from "@/modules/contact/application/ports/contact.repository";
import {
  ContactDepartmentInUseError,
  ContactDepartmentNotFoundError,
  ContactExportFailedError,
  ContactJobGradeInUseError,
  ContactJobGradeNotFoundError,
  ContactMemoLogNotFoundError,
  ContactNotFoundError,
  ContactPrivateMemoLogNotFoundError,
  DuplicateContactDepartmentError,
  DuplicateContactJobGradeError,
} from "@/modules/contact/domain/contact.errors";
import { CompanyNotFoundError } from "@/modules/company/domain/company.errors";
import {
  createTimestampedXlsxFileName,
  type ExportedXlsxFileResponse,
  XLSX_CONTENT_TYPE,
} from "@/shared/application/export/xlsx-export-file";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  XLSX_WORKBOOK_WRITER,
  type XlsxRow,
  type XlsxWorkbookWriter,
} from "@/shared/application/ports/xlsx-workbook.writer";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const CONTACT_PAGE_SIZE = 10;
const MEMO_LOG_PAGE_SIZE = 10;
const INITIAL_CONTACT_MEMO_TYPE = "초기 메모";
const XLSX_DATE_NUM_FORMAT = "yyyy-mm-dd hh:mm:ss";
const MOBILE_PATTERN = /^010-\d{4}-\d{4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 역할 : ContactListQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactListQueryInput {
  readonly page?: number;
  readonly username?: string;
  readonly companyId?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
  readonly sort?: ContactListSort;
}

// 역할 : ContactExportQueryInput 담당자 export query 조건을 정의합니다.
export interface ContactExportQueryInput {
  readonly username?: string;
  readonly companyId?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
  readonly sort?: ContactListSort;
}

// 역할 : CreateContactCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CreateContactCommand {
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly companyId: string;
  readonly contactDepartmentId: string;
  readonly contactJobGradeId: string;
  readonly contactMemo?: string | null;
}

// 역할 : UpdateContactCommand 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface UpdateContactCommand {
  readonly username?: string;
  readonly mobile?: string;
  readonly email?: string;
  readonly companyId?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
}

// 역할 : CursorQueryInput 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface CursorQueryInput {
  readonly cursor?: string;
}

// 역할 : ContactPageResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactPageResponse {
  readonly items: ContactListItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

// 역할 : ContactListItemResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactListItemResponse {
  readonly id: string;
  readonly company: {
    readonly id: string;
    readonly companyName: string;
  };
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly contactDepartment: {
    readonly id: string;
    readonly departmentName: string;
  };
  readonly contactJobGrade: {
    readonly id: string;
    readonly jobGradeName: string;
  };
  readonly createdAt: string;
}

// 역할 : ContactDetailResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactDetailResponse extends ContactListItemResponse {
  readonly updatedAt: string;
}

// 역할 : ContactDealListResponse 담당자에 연결된 딜 목록 응답을 정의합니다.
export interface ContactDealListResponse {
  readonly items: ContactDealItemResponse[];
}

// 역할 : ContactDealItemResponse 담당자에 연결된 딜 응답 항목을 정의합니다.
export interface ContactDealItemResponse {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly createdAt: string;
}

// 역할 : ContactCompanyOptionListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactCompanyOptionListResponse {
  readonly items: Array<{
    readonly id: string;
    readonly companyName: string;
  }>;
}

// 역할 : ContactJobGradeListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactJobGradeListResponse {
  readonly items: ContactJobGradeRecord[];
}

// 역할 : ContactDepartmentListResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactDepartmentListResponse {
  readonly items: ContactDepartmentRecord[];
}

// 역할 : ContactMemoLogConnectionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactMemoLogConnectionResponse {
  readonly items: Array<{
    readonly id: string;
    readonly memoType: string;
    readonly memo: string;
    readonly createdAt: string;
  }>;
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

// 역할 : ContactPrivateMemoLogConnectionResponse 데이터가 계층 사이에서 전달되는 구조를 정의합니다.
export interface ContactPrivateMemoLogConnectionResponse {
  readonly items: Array<{
    readonly id: string;
    readonly memo: string;
    readonly createdAt: string;
  }>;
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
}

// 역할 : ContactApplicationService 담당자 도메인 application 유스케이스를 제공합니다.
@Injectable()
export class ContactApplicationService {
  // 기능 : 담당자 저장소, 개인 비밀 메모 암호화 포트, 로그 서비스를 주입받습니다.
  constructor(
    @Inject(CONTACT_REPOSITORY)
    private readonly contactRepository: ContactRepository,
    @Inject(CONTACT_PRIVATE_MEMO_ENCRYPTION_PORT)
    private readonly privateMemoEncryption: ContactPrivateMemoEncryptionPort,
    @Inject(XLSX_WORKBOOK_WRITER)
    private readonly xlsxWriter: XlsxWorkbookWriter,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 현재 사용자의 담당자 목록을 10개 단위 페이지로 조회합니다.
  async listContacts(
    currentUser: CurrentUserContext,
    query: ContactListQueryInput
  ): Promise<ContactPageResponse> {
    // 1. 목록 조회 조건을 기본값과 검색 가능한 텍스트로 정규화한다.
    const page = query.page ?? 1;
    const username = this.normalizeOptionalText(query.username);

    // 2. 필터로 받은 회사, 담당자 부서, 담당자 직급이 현재 사용자 소유인지 검증한다.
    if (query.companyId) {
      await this.assertCompanyExists(currentUser.id, query.companyId);
    }

    if (query.contactDepartmentId) {
      await this.assertDepartmentExists(
        currentUser.id,
        query.contactDepartmentId
      );
    }

    if (query.contactJobGradeId) {
      await this.assertJobGradeExists(currentUser.id, query.contactJobGradeId);
    }

    // 3. 현재 사용자 ownership 기준으로 담당자 목록을 조회한다.
    const result = await this.contactRepository.listContacts({
      userId: currentUser.id,
      page,
      pageSize: CONTACT_PAGE_SIZE,
      ...(username ? { username } : {}),
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.contactDepartmentId
        ? { contactDepartmentId: query.contactDepartmentId }
        : {}),
      ...(query.contactJobGradeId
        ? { contactJobGradeId: query.contactJobGradeId }
        : {}),
      sort: query.sort ?? ContactListSort.CREATED_AT_DESC,
    });

    // 4. 민감한 검색어 없이 목록 조회 이벤트를 기록한다.
    this.logEvent("contact.listed", { userId: currentUser.id });

    // 5. repository 결과를 페이지 응답 DTO로 변환한다.
    return {
      items: result.items.map((contact) => this.toContactListItem(contact)),
      page,
      pageSize: CONTACT_PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages: Math.ceil(result.totalCount / CONTACT_PAGE_SIZE),
    };
  }

  // 기능 : 검색과 필터가 반영된 담당자 목록을 xlsx 파일로 생성합니다.
  async exportContactsXlsx(
    currentUser: CurrentUserContext,
    query: ContactExportQueryInput
  ): Promise<ExportedXlsxFileResponse> {
    // 1. export 조회 조건을 저장소 입력에 맞게 정규화한다.
    const username = this.normalizeOptionalText(query.username);

    // 2. 필터로 받은 회사, 담당자 부서, 담당자 직급이 현재 사용자 소유인지 검증한다.
    if (query.companyId) {
      await this.assertCompanyExists(currentUser.id, query.companyId);
    }

    if (query.contactDepartmentId) {
      await this.assertDepartmentExists(
        currentUser.id,
        query.contactDepartmentId
      );
    }

    if (query.contactJobGradeId) {
      await this.assertJobGradeExists(currentUser.id, query.contactJobGradeId);
    }

    // 3. 페이지네이션 없이 현재 검색과 필터에 맞는 담당자 전체 목록을 조회한다.
    const contacts = await this.contactRepository.listContactsForExport({
      userId: currentUser.id,
      ...(username ? { username } : {}),
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.contactDepartmentId
        ? { contactDepartmentId: query.contactDepartmentId }
        : {}),
      ...(query.contactJobGradeId
        ? { contactJobGradeId: query.contactJobGradeId }
        : {}),
      sort: query.sort ?? ContactListSort.CREATED_AT_DESC,
    });

    // 4. xlsx writer로 다운로드 파일 본문을 생성한다.
    const content = await this.writeContactExportXlsx(contacts);

    // 5. 검색어 없이 담당자 export 이벤트를 기록한다.
    this.logEvent("contact.exported", {
      userId: currentUser.id,
      rowCount: contacts.length,
    });

    // 6. controller가 다운로드 응답으로 변환할 파일 정보를 반환한다.
    return {
      fileName: createTimestampedXlsxFileName("contacts"),
      contentType: XLSX_CONTENT_TYPE,
      content,
    };
  }

  // 기능 : 현재 사용자의 담당자 필터용 회사 옵션 목록을 조회합니다.
  async listCompanyOptions(
    currentUser: CurrentUserContext
  ): Promise<ContactCompanyOptionListResponse> {
    // 1. 현재 사용자 소유의 회사 옵션 목록을 조회한다.
    const items = await this.contactRepository.listCompanyOptions(
      currentUser.id
    );

    // 2. 회사 옵션 조회 이벤트를 기록한다.
    this.logEvent("contact.companyOptionsListed", { userId: currentUser.id });

    // 3. 회사 옵션 응답 DTO로 반환한다.
    return { items };
  }

  // 기능 : 현재 사용자의 담당자 직급 목록을 조회합니다.
  async listJobGrades(
    currentUser: CurrentUserContext
  ): Promise<ContactJobGradeListResponse> {
    // 1. 현재 사용자 소유의 담당자 직급 목록을 조회한다.
    const items = await this.contactRepository.listJobGrades(currentUser.id);

    // 2. 담당자 직급 목록 조회 이벤트를 기록한다.
    this.logEvent("contactJobGrade.listed", { userId: currentUser.id });

    // 3. 담당자 직급 목록 응답 DTO로 반환한다.
    return { items };
  }

  // 기능 : 현재 사용자의 담당자 부서 목록을 조회합니다.
  async listDepartments(
    currentUser: CurrentUserContext
  ): Promise<ContactDepartmentListResponse> {
    // 1. 현재 사용자 소유의 담당자 부서 목록을 조회한다.
    const items = await this.contactRepository.listDepartments(currentUser.id);

    // 2. 담당자 부서 목록 조회 이벤트를 기록한다.
    this.logEvent("contactDepartment.listed", { userId: currentUser.id });

    // 3. 담당자 부서 목록 응답 DTO로 반환한다.
    return { items };
  }

  // 기능 : 현재 사용자의 담당자 단건 상세를 조회합니다.
  async getContact(
    currentUser: CurrentUserContext,
    contactId: string
  ): Promise<ContactDetailResponse> {
    // 1. 현재 사용자 ownership 기준으로 담당자 단건을 조회한다.
    const contact = await this.contactRepository.findContact(
      currentUser.id,
      contactId
    );

    // 2. 담당자가 없으면 domain 오류로 중단한다.
    if (!contact) {
      throw new ContactNotFoundError();
    }

    // 3. 민감한 필드 없이 담당자 조회 이벤트를 기록한다.
    this.logEvent("contact.viewed", {
      userId: currentUser.id,
      contactId,
    });

    // 4. 담당자 상세 응답 DTO로 변환한다.
    return this.toContactDetail(contact);
  }

  // 기능 : 현재 사용자의 담당자에 연결된 딜 전체 목록을 조회합니다.
  async listContactDeals(
    currentUser: CurrentUserContext,
    contactId: string
  ): Promise<ContactDealListResponse> {
    // 1. 조회 대상 담당자가 현재 사용자 소유인지 검증한다.
    await this.assertContactExists(currentUser.id, contactId);

    // 2. 현재 사용자 ownership 기준으로 담당자에 연결된 딜 목록을 조회한다.
    const deals = await this.contactRepository.listContactDeals({
      userId: currentUser.id,
      contactId,
    });

    // 3. 민감한 딜 본문 없이 담당자별 딜 목록 조회 이벤트를 기록한다.
    this.logEvent("contact.dealsListed", {
      userId: currentUser.id,
      contactId,
    });

    // 4. repository 결과를 응답 DTO로 변환한다.
    return {
      items: deals.map((deal) => this.toContactDealItem(deal)),
    };
  }

  // 기능 : 담당자를 생성하고 선택 메모가 있으면 같은 트랜잭션에서 첫 메모 로그를 생성합니다.
  async createContact(
    currentUser: CurrentUserContext,
    input: CreateContactCommand
  ): Promise<void> {
    // 1. 담당자 기본 입력값과 초기 메모를 저장 가능한 형태로 정규화한다.
    const username = this.normalizeRequiredText(
      input.username,
      "username is required"
    );
    const mobile = this.normalizeRequiredText(input.mobile, "mobile is required");
    const email = this.normalizeRequiredText(input.email, "email is required");
    const contactMemo = this.normalizeOptionalText(input.contactMemo);
    this.assertMobileFormat(mobile);
    this.assertEmailFormat(email);

    let createdContactId: string | null = null;

    // 2. 담당자 생성과 초기 메모 생성을 같은 transaction 안에서 실행한다.
    await this.contactRepository.runInTransaction(async (repository) => {
      // 3. 회사, 담당자 부서, 담당자 직급이 현재 사용자 소유인지 검증한다.
      await this.assertCompanyExists(currentUser.id, input.companyId, repository);
      await this.assertDepartmentExists(
        currentUser.id,
        input.contactDepartmentId,
        repository
      );
      await this.assertJobGradeExists(
        currentUser.id,
        input.contactJobGradeId,
        repository
      );

      // 4. 담당자 본문 데이터를 생성한다.
      const contact = await repository.createContact({
        userId: currentUser.id,
        companyId: input.companyId,
        username,
        mobile,
        email,
        contactDepartmentId: input.contactDepartmentId,
        contactJobGradeId: input.contactJobGradeId,
      });
      createdContactId = contact.id;

      // 5. 초기 메모가 있으면 일반 메모 로그 첫 데이터로 저장한다.
      if (contactMemo) {
        await repository.createMemoLog({
          contactId: contact.id,
          userId: currentUser.id,
          memoType: INITIAL_CONTACT_MEMO_TYPE,
          memo: contactMemo,
        });
      }
    });

    // 6. 민감한 입력값 없이 담당자 생성 이벤트를 기록한다.
    this.logEvent("contact.created", {
      userId: currentUser.id,
      contactId: createdContactId,
    });
  }

  // 기능 : 담당자명, 연락처, 이메일, 회사, 부서, 직급 중 요청에 포함된 값만 수정합니다.
  async updateContact(
    currentUser: CurrentUserContext,
    contactId: string,
    input: UpdateContactCommand
  ): Promise<void> {
    // 1. 수정 요청에서 포함된 필드만 저장 입력으로 정규화한다.
    const updateInput = this.normalizeContactUpdateInput(input);

    // 2. 수정할 필드가 하나 이상 있는지 검증한다.
    if (Object.keys(updateInput).length === 0) {
      throw new ValidationDomainError("At least one contact field is required");
    }

    // 3. 수정 대상 담당자가 현재 사용자 소유인지 검증한다.
    await this.assertContactExists(currentUser.id, contactId);

    // 4. 변경할 회사, 담당자 부서, 담당자 직급이 현재 사용자 소유인지 검증한다.
    if (updateInput.companyId) {
      await this.assertCompanyExists(currentUser.id, updateInput.companyId);
    }

    if (updateInput.contactDepartmentId) {
      await this.assertDepartmentExists(
        currentUser.id,
        updateInput.contactDepartmentId
      );
    }

    if (updateInput.contactJobGradeId) {
      await this.assertJobGradeExists(
        currentUser.id,
        updateInput.contactJobGradeId
      );
    }

    // 5. 담당자 기본 정보를 수정한다.
    const updated = await this.contactRepository.updateContact(
      currentUser.id,
      contactId,
      updateInput
    );

    // 6. 수정 결과가 없으면 담당자 없음 오류로 중단한다.
    if (!updated) {
      throw new ContactNotFoundError();
    }

    // 7. 민감한 입력값 없이 담당자 수정 이벤트를 기록한다.
    this.logEvent("contact.updated", { userId: currentUser.id, contactId });
  }

  // 기능 : 현재 사용자의 담당자 직급을 생성합니다.
  async createJobGrade(
    currentUser: CurrentUserContext,
    jobGradeName: string
  ): Promise<void> {
    // 1. 직급명을 저장 가능한 필수 텍스트로 정규화한다.
    const normalizedJobGradeName = this.normalizeRequiredText(
      jobGradeName,
      "jobGradeName is required"
    );

    // 2. 현재 사용자 안에서 같은 직급명이 이미 있는지 검증한다.
    if (
      await this.contactRepository.existsJobGradeByName(
        currentUser.id,
        normalizedJobGradeName
      )
    ) {
      throw new DuplicateContactJobGradeError();
    }

    // 3. 현재 사용자 소유의 담당자 직급을 생성한다.
    await this.contactRepository.createJobGrade(
      currentUser.id,
      normalizedJobGradeName
    );

    // 4. 담당자 직급 생성 이벤트를 기록한다.
    this.logEvent("contactJobGrade.created", { userId: currentUser.id });
  }

  // 기능 : 사용 중이 아닌 현재 사용자의 담당자 직급을 삭제합니다.
  async deleteJobGrade(
    currentUser: CurrentUserContext,
    jobGradeId: string
  ): Promise<void> {
    // 1. 삭제 대상 직급이 현재 사용자 소유인지 검증한다.
    await this.assertJobGradeExists(currentUser.id, jobGradeId);

    // 2. 담당자에서 사용 중인 직급인지 검증한다.
    if (await this.contactRepository.isJobGradeInUse(currentUser.id, jobGradeId)) {
      throw new ContactJobGradeInUseError();
    }

    // 3. 사용 중이 아닌 직급을 삭제한다.
    await this.contactRepository.deleteJobGrade(currentUser.id, jobGradeId);

    // 4. 담당자 직급 삭제 이벤트를 기록한다.
    this.logEvent("contactJobGrade.deleted", {
      userId: currentUser.id,
      jobGradeId,
    });
  }

  // 기능 : 현재 사용자의 담당자 부서를 생성합니다.
  async createDepartment(
    currentUser: CurrentUserContext,
    departmentName: string
  ): Promise<void> {
    // 1. 부서명을 저장 가능한 필수 텍스트로 정규화한다.
    const normalizedDepartmentName = this.normalizeRequiredText(
      departmentName,
      "departmentName is required"
    );

    // 2. 현재 사용자 안에서 같은 부서명이 이미 있는지 검증한다.
    if (
      await this.contactRepository.existsDepartmentByName(
        currentUser.id,
        normalizedDepartmentName
      )
    ) {
      throw new DuplicateContactDepartmentError();
    }

    // 3. 현재 사용자 소유의 담당자 부서를 생성한다.
    await this.contactRepository.createDepartment(
      currentUser.id,
      normalizedDepartmentName
    );

    // 4. 담당자 부서 생성 이벤트를 기록한다.
    this.logEvent("contactDepartment.created", { userId: currentUser.id });
  }

  // 기능 : 사용 중이 아닌 현재 사용자의 담당자 부서를 삭제합니다.
  async deleteDepartment(
    currentUser: CurrentUserContext,
    departmentId: string
  ): Promise<void> {
    // 1. 삭제 대상 부서가 현재 사용자 소유인지 검증한다.
    await this.assertDepartmentExists(currentUser.id, departmentId);

    // 2. 담당자에서 사용 중인 부서인지 검증한다.
    if (
      await this.contactRepository.isDepartmentInUse(
        currentUser.id,
        departmentId
      )
    ) {
      throw new ContactDepartmentInUseError();
    }

    // 3. 사용 중이 아닌 부서를 삭제한다.
    await this.contactRepository.deleteDepartment(currentUser.id, departmentId);

    // 4. 담당자 부서 삭제 이벤트를 기록한다.
    this.logEvent("contactDepartment.deleted", {
      userId: currentUser.id,
      departmentId,
    });
  }

  // 기능 : 현재 사용자의 담당자에 일반 메모 로그를 생성합니다.
  async createMemoLog(
    currentUser: CurrentUserContext,
    contactId: string,
    input: { readonly memoType: string; readonly memo: string }
  ): Promise<void> {
    // 1. 메모 대상 담당자가 현재 사용자 소유인지 검증한다.
    await this.assertContactExists(currentUser.id, contactId);

    // 2. 메모 유형과 본문을 정규화해 일반 메모 로그로 저장한다.
    await this.contactRepository.createMemoLog({
      contactId,
      userId: currentUser.id,
      memoType: this.normalizeRequiredText(input.memoType, "memoType is required"),
      memo: this.normalizeRequiredText(input.memo, "memo is required"),
    });

    // 3. 메모 원문 없이 일반 메모 로그 생성 이벤트를 기록한다.
    this.logEvent("contactMemoLog.created", {
      userId: currentUser.id,
      contactId,
    });
  }

  // 기능 : 현재 사용자의 담당자 일반 메모 로그를 10개 단위 cursor 방식으로 조회합니다.
  async listMemoLogs(
    currentUser: CurrentUserContext,
    contactId: string,
    query: CursorQueryInput
  ): Promise<ContactMemoLogConnectionResponse> {
    // 1. 조회 대상 담당자가 현재 사용자 소유인지 검증한다.
    await this.assertContactExists(currentUser.id, contactId);

    // 2. cursor 조건으로 일반 메모 로그를 페이지 크기보다 1개 더 조회한다.
    const records = await this.contactRepository.listMemoLogs({
      userId: currentUser.id,
      contactId,
      cursor: this.parseCursor(query.cursor),
      take: MEMO_LOG_PAGE_SIZE + 1,
    });

    // 3. 메모 원문 없이 일반 메모 로그 조회 이벤트를 기록한다.
    this.logEvent("contactMemoLog.listed", {
      userId: currentUser.id,
      contactId,
    });

    // 4. 조회 결과를 cursor connection 응답으로 변환한다.
    return this.toMemoLogConnection(records);
  }

  // 기능 : 현재 사용자의 담당자 일반 메모 로그 유형 또는 본문을 수정합니다.
  async updateMemoLog(
    currentUser: CurrentUserContext,
    contactId: string,
    memoLogId: string,
    input: { readonly memoType?: string; readonly memo?: string }
  ): Promise<void> {
    // 1. 메모 대상 담당자가 현재 사용자 소유인지 검증한다.
    await this.assertContactExists(currentUser.id, contactId);

    // 2. 일반 메모 로그 수정 입력을 포함된 필드만 정규화한다.
    const updateInput = this.normalizeMemoLogUpdateInput(input);

    // 3. 일반 메모 로그 유형 또는 본문을 수정한다.
    const updated = await this.contactRepository.updateMemoLog({
      userId: currentUser.id,
      contactId,
      memoLogId,
      ...(updateInput.memoType !== undefined
        ? { memoType: updateInput.memoType }
        : {}),
      ...(updateInput.memo !== undefined ? { memo: updateInput.memo } : {}),
    });

    // 4. 수정 대상 메모 로그가 없으면 오류로 중단한다.
    if (!updated) {
      throw new ContactMemoLogNotFoundError();
    }

    // 5. 메모 원문 없이 일반 메모 로그 수정 이벤트를 기록한다.
    this.logEvent("contactMemoLog.updated", {
      userId: currentUser.id,
      contactId,
      memoLogId,
    });
  }

  // 기능 : 현재 사용자의 담당자에 암호화된 개인 비밀 메모 로그를 생성합니다.
  async createPrivateMemoLog(
    currentUser: CurrentUserContext,
    contactId: string,
    memo: string
  ): Promise<void> {
    // 1. 비밀 메모 대상 담당자가 현재 사용자 소유인지 검증한다.
    await this.assertContactExists(currentUser.id, contactId);

    // 2. 비밀 메모 본문을 정규화한 뒤 암호화한다.
    const encrypted = this.privateMemoEncryption.encrypt(
      this.normalizeRequiredText(memo, "memo is required")
    );

    // 3. 암호문과 key version만 저장소에 저장한다.
    await this.contactRepository.createPrivateMemoLog({
      contactId,
      userId: currentUser.id,
      memoCiphertext: encrypted.ciphertext,
      memoKeyVersion: encrypted.keyVersion,
    });

    // 4. 비밀 메모 원문과 암호문 없이 생성 이벤트를 기록한다.
    this.logEvent("contactPrivateMemoLog.created", {
      userId: currentUser.id,
      contactId,
    });
  }

  // 기능 : 현재 사용자가 작성한 담당자 개인 비밀 메모 로그만 복호화해 조회합니다.
  async listPrivateMemoLogs(
    currentUser: CurrentUserContext,
    contactId: string,
    query: CursorQueryInput
  ): Promise<ContactPrivateMemoLogConnectionResponse> {
    // 1. 조회 대상 담당자가 현재 사용자 소유인지 검증한다.
    await this.assertContactExists(currentUser.id, contactId);

    // 2. 현재 사용자가 작성한 비밀 메모 로그를 cursor 조건으로 조회한다.
    const records = await this.contactRepository.listPrivateMemoLogs({
      userId: currentUser.id,
      contactId,
      cursor: this.parseCursor(query.cursor),
      take: MEMO_LOG_PAGE_SIZE + 1,
    });

    // 3. 비밀 메모 원문과 암호문 없이 조회 이벤트를 기록한다.
    this.logEvent("contactPrivateMemoLog.listed", {
      userId: currentUser.id,
      contactId,
    });

    // 4. 암호화된 메모 목록을 복호화된 cursor connection 응답으로 변환한다.
    return this.toPrivateMemoLogConnection(records);
  }

  // 기능 : 현재 사용자의 담당자 개인 비밀 메모 로그 본문만 다시 암호화해 수정합니다.
  async updatePrivateMemoLog(
    currentUser: CurrentUserContext,
    contactId: string,
    privateMemoLogId: string,
    memo: string
  ): Promise<void> {
    // 1. 비밀 메모 대상 담당자가 현재 사용자 소유인지 검증한다.
    await this.assertContactExists(currentUser.id, contactId);

    // 2. 새 비밀 메모 본문을 정규화한 뒤 암호화한다.
    const encrypted = this.privateMemoEncryption.encrypt(
      this.normalizeRequiredText(memo, "memo is required")
    );

    // 3. 작성자와 담당자 소유권 조건으로 비밀 메모 로그를 수정한다.
    const updated = await this.contactRepository.updatePrivateMemoLog({
      userId: currentUser.id,
      contactId,
      privateMemoLogId,
      memoCiphertext: encrypted.ciphertext,
      memoKeyVersion: encrypted.keyVersion,
    });

    // 4. 수정 대상 비밀 메모 로그가 없으면 오류로 중단한다.
    if (!updated) {
      throw new ContactPrivateMemoLogNotFoundError();
    }

    // 5. 비밀 메모 원문과 암호문 없이 수정 이벤트를 기록한다.
    this.logEvent("contactPrivateMemoLog.updated", {
      userId: currentUser.id,
      contactId,
      privateMemoLogId,
    });
  }

  // 기능 : 회사가 현재 사용자의 소유인지 확인합니다.
  private async assertCompanyExists(
    userId: string,
    companyId: string,
    repository: ContactRepository = this.contactRepository
  ): Promise<void> {
    if (!(await repository.findCompanyOption(userId, companyId))) {
      throw new CompanyNotFoundError();
    }
  }

  // 기능 : 담당자 부서가 현재 사용자의 소유인지 확인합니다.
  private async assertDepartmentExists(
    userId: string,
    departmentId: string,
    repository: ContactRepository = this.contactRepository
  ): Promise<void> {
    if (!(await repository.findDepartment(userId, departmentId))) {
      throw new ContactDepartmentNotFoundError();
    }
  }

  // 기능 : 담당자 직급이 현재 사용자의 소유인지 확인합니다.
  private async assertJobGradeExists(
    userId: string,
    jobGradeId: string,
    repository: ContactRepository = this.contactRepository
  ): Promise<void> {
    if (!(await repository.findJobGrade(userId, jobGradeId))) {
      throw new ContactJobGradeNotFoundError();
    }
  }

  // 기능 : 담당자가 현재 사용자의 소유인지 확인합니다.
  private async assertContactExists(
    userId: string,
    contactId: string
  ): Promise<void> {
    if (!(await this.contactRepository.findContactLookup(userId, contactId))) {
      throw new ContactNotFoundError();
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

  // 기능 : 담당자 핸드폰번호가 계약 형식인지 검증합니다.
  private assertMobileFormat(mobile: string): void {
    if (!MOBILE_PATTERN.test(mobile)) {
      throw new ValidationDomainError("mobile must match 010-1111-2222");
    }
  }

  // 기능 : 담당자 이메일이 기본 이메일 형식인지 검증합니다.
  private assertEmailFormat(email: string): void {
    if (!EMAIL_PATTERN.test(email)) {
      throw new ValidationDomainError("email is invalid");
    }
  }

  // 기능 : 담당자 수정 요청에서 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeContactUpdateInput(
    input: UpdateContactCommand
  ): UpdateContactInput {
    const normalized: UpdateContactInput = {
      ...(input.username !== undefined
        ? {
            username: this.normalizeRequiredText(
              input.username,
              "username is required"
            ),
          }
        : {}),
      ...(input.mobile !== undefined
        ? {
            mobile: this.normalizeRequiredText(
              input.mobile,
              "mobile is required"
            ),
          }
        : {}),
      ...(input.email !== undefined
        ? { email: this.normalizeRequiredText(input.email, "email is required") }
        : {}),
      ...(input.companyId !== undefined ? { companyId: input.companyId } : {}),
      ...(input.contactDepartmentId !== undefined
        ? { contactDepartmentId: input.contactDepartmentId }
        : {}),
      ...(input.contactJobGradeId !== undefined
        ? { contactJobGradeId: input.contactJobGradeId }
        : {}),
    };

    if (normalized.mobile !== undefined) {
      this.assertMobileFormat(normalized.mobile);
    }

    if (normalized.email !== undefined) {
      this.assertEmailFormat(normalized.email);
    }

    return normalized;
  }

  // 기능 : 담당자에 연결된 딜 레코드를 응답 항목으로 변환합니다.
  private toContactDealItem(deal: ContactDealRecord): ContactDealItemResponse {
    return {
      id: deal.id,
      dealName: deal.dealName,
      dealCost: deal.dealCost,
      createdAt: deal.createdAt.toISOString(),
    };
  }

  // 기능 : 담당자 일반 메모 수정 요청에서 포함된 필드만 저장 가능한 값으로 정규화합니다.
  private normalizeMemoLogUpdateInput(input: {
    readonly memoType?: string;
    readonly memo?: string;
  }): { readonly memoType?: string; readonly memo?: string } {
    const normalized = {
      ...(input.memoType !== undefined
        ? {
            memoType: this.normalizeRequiredText(
              input.memoType,
              "memoType is required"
            ),
          }
        : {}),
      ...(input.memo !== undefined
        ? { memo: this.normalizeRequiredText(input.memo, "memo is required") }
        : {}),
    };

    if (Object.keys(normalized).length === 0) {
      throw new ValidationDomainError("At least one memo field is required");
    }

    return normalized;
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

  // 기능 : 담당자 레코드를 목록 응답 항목으로 변환합니다.
  private toContactListItem(contact: ContactRecord): ContactListItemResponse {
    return {
      id: contact.id,
      company: contact.company,
      username: contact.username,
      mobile: contact.mobile,
      email: contact.email,
      contactDepartment: contact.contactDepartment,
      contactJobGrade: contact.contactJobGrade,
      createdAt: contact.createdAt.toISOString(),
    };
  }

  // 기능 : 담당자 레코드를 단건 상세 응답으로 변환합니다.
  private toContactDetail(contact: ContactRecord): ContactDetailResponse {
    return {
      ...this.toContactListItem(contact),
      updatedAt: contact.updatedAt.toISOString(),
    };
  }

  // 기능 : 담당자 export 레코드를 xlsx Buffer로 변환합니다.
  private async writeContactExportXlsx(
    contacts: ContactRecord[]
  ): Promise<Buffer> {
    try {
      return await this.xlsxWriter.writeWorksheet({
        sheetName: "Contacts",
        columns: [
          { header: "회사명", key: "companyName", width: 28 },
          { header: "담당자명", key: "username", width: 18 },
          { header: "핸드폰번호", key: "mobile", width: 18 },
          { header: "이메일", key: "email", width: 28 },
          { header: "부서", key: "departmentName", width: 18 },
          { header: "직급", key: "jobGradeName", width: 18 },
          {
            header: "등록일",
            key: "createdAt",
            width: 22,
            numFmt: XLSX_DATE_NUM_FORMAT,
          },
        ],
        rows: this.toContactExportRows(contacts),
      });
    } catch {
      throw new ContactExportFailedError();
    }
  }

  // 기능 : 담당자 export 레코드를 ID 없는 xlsx 행 데이터로 변환합니다.
  private toContactExportRows(contacts: ContactRecord[]): XlsxRow[] {
    return contacts.map((contact) => ({
      companyName: contact.company.companyName,
      username: contact.username,
      mobile: contact.mobile,
      email: contact.email,
      departmentName: contact.contactDepartment.departmentName,
      jobGradeName: contact.contactJobGrade.jobGradeName,
      createdAt: contact.createdAt,
    }));
  }

  // 기능 : 일반 메모 로그 목록을 cursor connection 응답으로 변환합니다.
  private toMemoLogConnection(
    records: ContactMemoLogRecord[]
  ): ContactMemoLogConnectionResponse {
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
    records: ContactPrivateMemoLogRecord[]
  ): ContactPrivateMemoLogConnectionResponse {
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

  // 기능 : 민감정보를 제외한 구조화 이벤트 로그를 기록합니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "ContactApplicationService"
    );
  }
}
