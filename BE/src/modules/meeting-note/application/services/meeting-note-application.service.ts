import { Inject, Injectable } from "@nestjs/common";
import {
  MEETING_NOTE_REPOSITORY,
  MeetingNoteSort,
  MeetingNoteSourceTypeValue,
  type CompanySnapshotRecord,
  type ContactSnapshotRecord,
  type DealSnapshotRecord,
  type MeetingNoteRecord,
  type MeetingNoteRepository,
  type ProductSnapshotRecord,
  type ReplaceMeetingNoteRelationsInput,
  type SaveMeetingNoteCompanyInput,
  type SaveMeetingNoteContactInput,
  type SaveMeetingNoteDealInput,
  type SaveMeetingNoteProductInput,
  type UpdateMeetingNoteInput,
} from "@/modules/meeting-note/application/ports/meeting-note.repository";
import {
  MeetingNoteNotFoundError,
  RelatedCompanyNotFoundError,
  RelatedContactNotFoundError,
  RelatedDealNotFoundError,
  RelatedProductNotFoundError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import type { CurrentUserContext } from "@/shared/application/context/current-user.context";
import {
  DEFAULT_USER_TIME_ZONE,
  isValidIanaTimeZone,
} from "@/shared/application/time-zone/time-zone";
import { ValidationDomainError } from "@/shared/domain/errors/common.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const PAGE_SIZE = 10;
const MEETING_NOTE_TITLE_MAX_LENGTH = 100;
const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

// 역할 : MeetingNoteCompanyCommand 회의록 회사 입력 command 구조를 정의합니다.
export interface MeetingNoteCompanyCommand {
  readonly companyId?: string | null;
  readonly companyName?: string | null;
  readonly companyField?: string | null;
  readonly companyRegion?: string | null;
}

// 역할 : MeetingNoteContactCommand 회의록 연락처 입력 command 구조를 정의합니다.
export interface MeetingNoteContactCommand {
  readonly contactId?: string | null;
  readonly companyId?: string | null;
  readonly contactUsername?: string | null;
  readonly contactEmail?: string | null;
  readonly contactMobile?: string | null;
  readonly companyName?: string | null;
  readonly department?: string | null;
  readonly jobGrade?: string | null;
}

// 역할 : MeetingNoteProductCommand 회의록 제품 입력 command 구조를 정의합니다.
export interface MeetingNoteProductCommand {
  readonly productId?: string | null;
  readonly productName?: string | null;
  readonly productPrice?: number | null;
  readonly productCategory?: string | null;
  readonly productStatus?: string | null;
}

// 역할 : MeetingNoteDealCommand 회의록 딜 입력 command 구조를 정의합니다.
export interface MeetingNoteDealCommand {
  readonly dealId: string;
}

// 역할 : ListMeetingNotesQueryInput 회의록 목록 조회 query 구조를 정의합니다.
export interface ListMeetingNotesQueryInput {
  readonly page?: number;
  readonly companyIds?: string[];
  readonly contactIds?: string[];
  readonly sort?: MeetingNoteSort;
  readonly search?: string;
  readonly meetingDate?: string;
}

// 역할 : CreateMeetingNoteCommand 회의록 생성 command 구조를 정의합니다.
export interface CreateMeetingNoteCommand {
  readonly sourceType?: MeetingNoteSourceTypeValue;
  readonly title: string;
  readonly meetingLocalDateTime: string;
  readonly details: string;
  readonly nextPlan?: string | null;
  readonly requiredAction?: string | null;
  readonly companies: string[];
  readonly contacts: string[];
  readonly products?: string[];
  readonly deals?: string[];
}

// 역할 : UpdateMeetingNoteCommand 회의록 수정 command 구조를 정의합니다.
export interface UpdateMeetingNoteCommand {
  readonly sourceType?: MeetingNoteSourceTypeValue;
  readonly title?: string;
  readonly meetingLocalDateTime?: string | null;
  readonly details?: string;
  readonly nextPlan?: string | null;
  readonly requiredAction?: string | null;
  readonly companies?: MeetingNoteCompanyCommand[];
  readonly contacts?: MeetingNoteContactCommand[];
  readonly products?: MeetingNoteProductCommand[];
  readonly deals?: MeetingNoteDealCommand[];
}

// 역할 : LinkMeetingNoteDealsCommand 저장된 회의록에 추가 연결할 딜 ID 목록을 정의합니다.
export interface LinkMeetingNoteDealsCommand {
  readonly deals: string[];
}

// 역할 : MeetingNoteListResponse 회의록 목록 응답 구조를 정의합니다.
export interface MeetingNoteListResponse {
  readonly items: MeetingNoteListItemResponse[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
}

// 역할 : MeetingNoteListItemResponse 회의록 목록 item 응답 구조를 정의합니다.
export interface MeetingNoteListItemResponse {
  readonly id: string;
  readonly title: string;
  readonly meetingAt: string | null;
  readonly sourceType: MeetingNoteSourceTypeValue;
  readonly companies: MeetingNoteListSummaryResponse;
  readonly contacts: MeetingNoteListSummaryResponse;
  readonly products: MeetingNoteListSummaryResponse;
  readonly deals: MeetingNoteListSummaryResponse;
  readonly createdAt: string;
}

// 역할 : MeetingNoteListSummaryResponse 회의록 목록 관계 summary 응답 구조를 정의합니다.
export interface MeetingNoteListSummaryResponse {
  readonly label: string;
  readonly count: number;
}

// 역할 : MeetingNoteFilterCompanyListResponse 회사 필터 목록 응답 구조를 정의합니다.
export interface MeetingNoteFilterCompanyListResponse {
  readonly items: MeetingNoteFilterCompanyResponse[];
}

// 역할 : MeetingNoteFilterContactListResponse 연락처 필터 목록 응답 구조를 정의합니다.
export interface MeetingNoteFilterContactListResponse {
  readonly items: MeetingNoteFilterContactResponse[];
}

// 역할 : MeetingNoteFilterCompanyResponse 회사 필터 옵션 응답 구조를 정의합니다.
export interface MeetingNoteFilterCompanyResponse {
  readonly id: string;
  readonly companyName: string;
  readonly createdAt: string;
}

// 역할 : MeetingNoteFilterContactResponse 연락처 필터 옵션 응답 구조를 정의합니다.
export interface MeetingNoteFilterContactResponse {
  readonly id: string;
  readonly companyId: string | null;
  readonly contactUsername: string;
  readonly createdAt: string;
}

// 역할 : MeetingNoteResponse 회의록 단건 응답 구조를 정의합니다.
export interface MeetingNoteResponse {
  readonly id: string;
  readonly sourceType: MeetingNoteSourceTypeValue;
  readonly title: string;
  readonly meetingAt: string | null;
  readonly meetingLocalDateTime: string | null;
  readonly timeZone: string;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly companies: MeetingNoteCompanyResponse[];
  readonly contacts: MeetingNoteContactResponse[];
  readonly products: MeetingNoteProductResponse[];
  readonly deals: MeetingNoteDealResponse[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 역할 : MeetingNoteCompanyResponse 회의록 회사 응답 구조를 정의합니다.
export interface MeetingNoteCompanyResponse {
  readonly id: string;
  readonly companyId: string | null;
  readonly companyNameSnapshot: string;
  readonly companyFieldSnapshot: string | null;
  readonly companyRegionSnapshot: string | null;
  readonly createdAt: string;
}

// 역할 : MeetingNoteContactResponse 회의록 연락처 응답 구조를 정의합니다.
export interface MeetingNoteContactResponse {
  readonly id: string;
  readonly contactId: string | null;
  readonly companyId: string | null;
  readonly contactUsernameSnapshot: string;
  readonly contactEmailSnapshot: string | null;
  readonly contactMobileSnapshot: string | null;
  readonly companyNameSnapshot: string | null;
  readonly departmentSnapshot: string | null;
  readonly jobGradeSnapshot: string | null;
  readonly createdAt: string;
}

// 역할 : MeetingNoteProductResponse 회의록 제품 응답 구조를 정의합니다.
export interface MeetingNoteProductResponse {
  readonly id: string;
  readonly productId: string | null;
  readonly productNameSnapshot: string;
  readonly productPriceSnapshot: number | null;
  readonly productCategorySnapshot: string | null;
  readonly productStatusSnapshot: string | null;
  readonly createdAt: string;
}

// 역할 : MeetingNoteDealResponse 회의록 딜 응답 구조를 정의합니다.
export interface MeetingNoteDealResponse {
  readonly id: string;
  readonly dealId: string;
  readonly dealNameSnapshot: string;
  readonly dealStatusSnapshot: string;
  readonly dealCostSnapshot: number;
  readonly dealExpectedEndDateSnapshot: string;
  readonly createdAt: string;
}

// 역할 : DateTimeParts timezone 변환에 필요한 날짜/시간 구성요소를 정의합니다.
interface DateTimeParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly millisecond: number;
}

// 역할 : NormalizedCompanyInput 정규화된 회사 입력 구조를 정의합니다.
interface NormalizedCompanyInput {
  readonly companyId: string | null;
  readonly companyNameSnapshot: string | null;
  readonly companyFieldSnapshot: string | null;
  readonly companyRegionSnapshot: string | null;
}

// 역할 : NormalizedContactInput 정규화된 연락처 입력 구조를 정의합니다.
interface NormalizedContactInput {
  readonly contactId: string | null;
  readonly companyId: string | null;
  readonly contactUsernameSnapshot: string | null;
  readonly contactEmailSnapshot: string | null;
  readonly contactMobileSnapshot: string | null;
  readonly contactCompanyNameSnapshot: string | null;
  readonly contactDepartmentSnapshot: string | null;
  readonly contactJobGradeSnapshot: string | null;
}

// 역할 : NormalizedProductInput 정규화된 제품 입력 구조를 정의합니다.
interface NormalizedProductInput {
  readonly productId: string | null;
  readonly productNameSnapshot: string | null;
  readonly productPriceSnapshot: number | null;
  readonly productCategorySnapshot: string | null;
  readonly productStatusSnapshot: string | null;
}

// 역할 : NormalizedDealInput 정규화된 딜 입력 구조를 정의합니다.
interface NormalizedDealInput {
  readonly dealId: string;
}

// 역할 : NormalizedRelationInput 정규화된 관계 입력 구조를 정의합니다.
interface NormalizedRelationInput {
  readonly companies?: readonly NormalizedCompanyInput[];
  readonly contacts?: readonly NormalizedContactInput[];
  readonly products?: readonly NormalizedProductInput[];
  readonly deals?: readonly NormalizedDealInput[];
}

// 역할 : MeetingNoteApplicationService 회의록 use case orchestration을 담당합니다.
@Injectable()
export class MeetingNoteApplicationService {
  // 기능 : 회의록 저장소와 구조화 logger를 주입받습니다.
  constructor(
    @Inject(MEETING_NOTE_REPOSITORY)
    private readonly meetingNoteRepository: MeetingNoteRepository,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 현재 사용자의 회의록 목록을 필터와 페이지 조건으로 조회합니다.
  async listMeetingNotes(
    currentUser: CurrentUserContext,
    query: ListMeetingNotesQueryInput
  ): Promise<MeetingNoteListResponse> {
    // 1. page, 필터 ID, 정렬 값을 API 계약 기준으로 정규화합니다.
    const page = this.normalizePage(query.page);
    const companyIds = this.normalizeIdArray(query.companyIds ?? [], "companyIds");
    const contactIds = this.normalizeIdArray(query.contactIds ?? [], "contactIds");
    const sort = query.sort ?? MeetingNoteSort.CREATED_AT_DESC;
    const search = this.normalizeNullableText(
      query.search,
      MEETING_NOTE_TITLE_MAX_LENGTH,
      "search"
    );
    const timeZone = this.normalizeUserTimeZone(currentUser.timeZone);
    const meetingDateRange = this.parseOptionalMeetingDateRange(
      query.meetingDate,
      timeZone
    );

    // 2. 현재 사용자 소유 회의록만 저장소에서 조회합니다.
    const result = await this.meetingNoteRepository.listMeetingNotes({
      userId: currentUser.id,
      page,
      pageSize: PAGE_SIZE,
      companyIds,
      contactIds,
      sort,
      ...(search ? { search } : {}),
      ...(meetingDateRange
        ? {
            meetingAtFrom: meetingDateRange.from,
            meetingAtTo: meetingDateRange.to,
          }
        : {}),
    });
    const totalPages = Math.ceil(result.totalCount / PAGE_SIZE);

    // 3. 본문 없이 목록 조회 이벤트만 구조화 로그로 남깁니다.
    this.logEvent("meeting_note.listed", {
      userId: currentUser.id,
      page,
      count: result.items.length,
      totalCount: result.totalCount,
    });

    // 4. 저장소 record를 API 응답 구조로 변환합니다.
    return {
      items: result.items.map((item) => this.toMeetingNoteListItemResponse(item)),
      page,
      pageSize: PAGE_SIZE,
      totalCount: result.totalCount,
      totalPages,
    };
  }

  // 기능 : 현재 사용자의 회의록 회사 필터 옵션을 조회합니다.
  async listFilterCompanies(
    currentUser: CurrentUserContext
  ): Promise<MeetingNoteFilterCompanyListResponse> {
    // 1. 현재 사용자 소유 회의록에 연결된 회사 옵션만 조회합니다.
    const items = await this.meetingNoteRepository.listFilterCompanies(
      currentUser.id
    );

    // 2. 저장소 record를 API 응답 구조로 변환합니다.
    return {
      items: items.map((item) => ({
        id: item.id,
        companyName: item.companyName,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  // 기능 : 현재 사용자의 회의록 연락처 필터 옵션을 조회합니다.
  async listFilterContacts(
    currentUser: CurrentUserContext
  ): Promise<MeetingNoteFilterContactListResponse> {
    // 1. 현재 사용자 소유 회의록에 연결된 연락처 옵션만 조회합니다.
    const items = await this.meetingNoteRepository.listFilterContacts(
      currentUser.id
    );

    // 2. 저장소 record를 API 응답 구조로 변환합니다.
    return {
      items: items.map((item) => ({
        id: item.id,
        companyId: item.companyId,
        contactUsername: item.contactUsername,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  // 기능 : 현재 사용자의 회의록 단건 상세를 조회합니다.
  async getMeetingNote(
    currentUser: CurrentUserContext,
    meetingNoteId: string
  ): Promise<MeetingNoteResponse> {
    // 1. 현재 사용자 소유 회의록만 상세 조회합니다.
    const meetingNote = await this.meetingNoteRepository.findMeetingNote(
      currentUser.id,
      meetingNoteId
    );

    // 2. 회의록이 없거나 소유자가 다르면 NotFound로 차단합니다.
    if (!meetingNote) {
      throw new MeetingNoteNotFoundError();
    }

    // 3. 본문 없이 조회 이벤트만 구조화 로그로 남깁니다.
    this.logEvent("meeting_note.viewed", {
      userId: currentUser.id,
      meetingNoteId,
    });

    // 4. 저장소 record를 API 응답 구조로 변환합니다.
    return this.toMeetingNoteResponse(meetingNote);
  }

  // 기능 : 현재 사용자의 수동 회의록을 생성하고 스냅샷 관계를 저장합니다.
  async createMeetingNote(
    currentUser: CurrentUserContext,
    input: CreateMeetingNoteCommand
  ): Promise<MeetingNoteResponse> {
    // 1. 현재 사용자 timezone과 생성 입력 값을 정규화합니다.
    const timeZone = this.normalizeUserTimeZone(currentUser.timeZone);
    const normalized = this.normalizeCreateInput(input, timeZone);
    let createdMeetingNoteId: string | null = null;

    // 2. 회의록 기본 row와 모든 관계 스냅샷을 하나의 트랜잭션에서 저장합니다.
    await this.meetingNoteRepository.runInTransaction(async (repository) => {
      const relations = await this.resolveRelationInputs(
        currentUser.id,
        normalized.relations,
        repository
      );
      const created = await repository.createMeetingNote({
        userId: currentUser.id,
        sourceType: normalized.sourceType,
        title: normalized.title,
        meetingAt: normalized.meetingAt,
        timeZone,
        details: normalized.details,
        nextPlan: normalized.nextPlan,
        requiredAction: normalized.requiredAction,
        rawText: null,
      });
      createdMeetingNoteId = created.id;

      await repository.replaceMeetingNoteRelations({
        userId: currentUser.id,
        meetingNoteId: created.id,
        companies: relations.companies ?? [],
        contacts: relations.contacts ?? [],
        products: relations.products ?? [],
        deals: relations.deals ?? [],
      });
    });

    // 3. 생성 ID가 없으면 비정상 상태로 보고 NotFound 오류를 던집니다.
    if (!createdMeetingNoteId) {
      throw new MeetingNoteNotFoundError();
    }

    // 4. 생성 결과를 관계 스냅샷과 함께 다시 조회합니다.
    const meetingNote = await this.meetingNoteRepository.findMeetingNote(
      currentUser.id,
      createdMeetingNoteId
    );

    // 5. 생성 직후 조회가 실패하면 NotFound 오류를 던집니다.
    if (!meetingNote) {
      throw new MeetingNoteNotFoundError();
    }

    // 6. 본문 없이 생성 결과 메타데이터만 구조화 로그로 남깁니다.
    this.logEvent("meeting_note.created", {
      userId: currentUser.id,
      meetingNoteId: createdMeetingNoteId,
      companyCount: meetingNote.companies.length,
      contactCount: meetingNote.contacts.length,
      productCount: meetingNote.products.length,
      dealCount: meetingNote.deals.length,
    });

    // 7. 저장소 record를 API 응답 구조로 변환합니다.
    return this.toMeetingNoteResponse(meetingNote);
  }

  // 기능 : 현재 사용자의 회의록 기본 정보와 관계 스냅샷을 수정합니다.
  async updateMeetingNote(
    currentUser: CurrentUserContext,
    meetingNoteId: string,
    input: UpdateMeetingNoteCommand
  ): Promise<MeetingNoteResponse> {
    // 1. 수정 가능한 필드가 하나 이상 있는지 확인합니다.
    if (!this.hasUpdateFields(input)) {
      throw new ValidationDomainError("At least one meeting note field is required");
    }

    // 2. 현재 사용자 소유 회의록인지 먼저 조회합니다.
    const existing = await this.meetingNoteRepository.findMeetingNote(
      currentUser.id,
      meetingNoteId
    );

    // 3. 회의록이 없거나 소유자가 다르면 NotFound로 차단합니다.
    if (!existing) {
      throw new MeetingNoteNotFoundError();
    }

    // 4. 기존 회의록 기준으로 수정 입력 값을 정규화합니다.
    const timeZone = this.normalizeUserTimeZone(currentUser.timeZone);
    const normalized = this.normalizeUpdateInput(input, timeZone);

    // 5. 기본 row 수정과 요청된 관계 스냅샷 교체를 하나의 트랜잭션에서 처리합니다.
    await this.meetingNoteRepository.runInTransaction(async (repository) => {
      const relationInput = await this.resolveRelationInputs(
        currentUser.id,
        normalized.relations,
        repository
      );

      if (Object.keys(normalized.fields).length > 0) {
        const updated = await repository.updateMeetingNote(
          currentUser.id,
          meetingNoteId,
          normalized.fields
        );

        if (!updated) {
          throw new MeetingNoteNotFoundError();
        }
      }

      if (this.hasRelationReplacement(normalized.relations)) {
        await repository.replaceMeetingNoteRelations({
          userId: currentUser.id,
          meetingNoteId,
          ...relationInput,
        });
      }
    });

    // 6. 수정 결과를 관계 스냅샷과 함께 다시 조회합니다.
    const meetingNote = await this.meetingNoteRepository.findMeetingNote(
      currentUser.id,
      meetingNoteId
    );

    // 7. 수정 직후 조회가 실패하면 NotFound 오류를 던집니다.
    if (!meetingNote) {
      throw new MeetingNoteNotFoundError();
    }

    // 8. 본문 없이 수정 이벤트만 구조화 로그로 남깁니다.
    this.logEvent("meeting_note.updated", {
      userId: currentUser.id,
      meetingNoteId,
    });

    // 9. 저장소 record를 API 응답 구조로 변환합니다.
    return this.toMeetingNoteResponse(meetingNote);
  }

  // 기능 : 저장된 회의록에 딜을 추가 연결하고 딜 활동 로그를 자동 생성합니다.
  async linkMeetingNoteDeals(
    currentUser: CurrentUserContext,
    meetingNoteId: string,
    input: LinkMeetingNoteDealsCommand
  ): Promise<MeetingNoteResponse> {
    // 1. 현재 사용자 소유 회의록인지 먼저 조회합니다.
    const existing = await this.meetingNoteRepository.findMeetingNote(
      currentUser.id,
      meetingNoteId
    );

    if (!existing) {
      throw new MeetingNoteNotFoundError();
    }

    // 2. 요청 딜 ID를 정규화하고 이미 연결된 딜은 제외합니다.
    const requestedDeals = this.normalizeDealIds(input.deals, true);
    const existingDealIds = new Set(existing.deals.map((deal) => deal.dealId));
    const dealsToLink = requestedDeals.filter(
      (deal) => !existingDealIds.has(deal.dealId)
    );

    // 3. 새로 연결할 딜이 없으면 현재 회의록 상세를 그대로 반환합니다.
    if (dealsToLink.length === 0) {
      return this.toMeetingNoteResponse(existing);
    }

    // 4. 신규 딜 연결과 딜 활동 로그 생성을 하나의 transaction에서 처리합니다.
    await this.meetingNoteRepository.runInTransaction(async (repository) => {
      const relationInput = await this.resolveRelationInputs(
        currentUser.id,
        { deals: dealsToLink },
        repository
      );

      await repository.linkMeetingNoteDeals({
        userId: currentUser.id,
        meetingNoteId,
        deals: relationInput.deals ?? [],
        activityLogText: this.createDealLinkActivityLogText(existing),
      });
    });

    // 5. 연결 결과를 다시 조회합니다.
    const meetingNote = await this.meetingNoteRepository.findMeetingNote(
      currentUser.id,
      meetingNoteId
    );

    if (!meetingNote) {
      throw new MeetingNoteNotFoundError();
    }

    // 6. 본문 없이 연결 이벤트만 구조화 로그로 남깁니다.
    this.logEvent("meeting_note.deals_linked", {
      userId: currentUser.id,
      meetingNoteId,
      linkedDealCount: dealsToLink.length,
    });

    // 7. 저장소 record를 API 응답 구조로 변환합니다.
    return this.toMeetingNoteResponse(meetingNote);
  }

  // 기능 : 회의록 생성 입력을 저장 가능한 값과 관계 입력으로 정규화합니다.
  private normalizeCreateInput(
    input: CreateMeetingNoteCommand,
    timeZone: string
  ): {
    readonly sourceType: MeetingNoteSourceTypeValue;
    readonly title: string;
    readonly meetingAt: Date;
    readonly details: string;
    readonly nextPlan: string | null;
    readonly requiredAction: string | null;
    readonly relations: Required<NormalizedRelationInput>;
  } {
    return {
      sourceType: this.normalizeCreateSourceType(input.sourceType),
      title: this.normalizeRequiredText(
        input.title,
        MEETING_NOTE_TITLE_MAX_LENGTH,
        "title"
      ),
      meetingAt: this.parseRequiredMeetingLocalDateTime(
        input.meetingLocalDateTime,
        timeZone
      ),
      details: this.normalizeRequiredText(input.details, 10000, "details"),
      nextPlan: this.normalizeNullableText(input.nextPlan, 2000, "nextPlan"),
      requiredAction: this.normalizeNullableText(
        input.requiredAction,
        2000,
        "requiredAction"
      ),
      relations: {
        companies: this.normalizeCompanyIds(input.companies, true),
        contacts: this.normalizeContactIds(input.contacts, true),
        products: this.normalizeProductIds(input.products ?? [], false),
        deals: this.normalizeDealIds(input.deals ?? [], false),
      },
    };
  }

  // 기능 : 회의록 수정 입력을 저장 가능한 값과 관계 입력으로 정규화합니다.
  private normalizeUpdateInput(
    input: UpdateMeetingNoteCommand,
    timeZone: string
  ): {
    readonly fields: UpdateMeetingNoteInput;
    readonly relations: NormalizedRelationInput;
  } {
    const fields: {
      sourceType?: MeetingNoteSourceTypeValue;
      title?: string;
      meetingAt?: Date;
      timeZone?: string;
      details?: string;
      nextPlan?: string | null;
      requiredAction?: string | null;
    } = {};

    if (input.sourceType !== undefined) {
      this.assertManualSourceType(input.sourceType);
      fields.sourceType = MeetingNoteSourceTypeValue.MANUAL;
    }

    if (input.title !== undefined) {
      fields.title = this.normalizeRequiredText(
        input.title,
        MEETING_NOTE_TITLE_MAX_LENGTH,
        "title"
      );
    }

    if (input.meetingLocalDateTime !== undefined) {
      fields.meetingAt = this.parseRequiredMeetingLocalDateTime(
        input.meetingLocalDateTime,
        timeZone
      );
      fields.timeZone = timeZone;
    }

    if (input.details !== undefined) {
      fields.details = this.normalizeRequiredText(input.details, 10000, "details");
    }

    if (input.nextPlan !== undefined) {
      fields.nextPlan = this.normalizeNullableText(
        input.nextPlan,
        2000,
        "nextPlan"
      );
    }

    if (input.requiredAction !== undefined) {
      fields.requiredAction = this.normalizeNullableText(
        input.requiredAction,
        2000,
        "requiredAction"
      );
    }

    const relations: {
      companies?: readonly NormalizedCompanyInput[];
      contacts?: readonly NormalizedContactInput[];
      products?: readonly NormalizedProductInput[];
      deals?: readonly NormalizedDealInput[];
    } = {};

    if (input.companies !== undefined) {
      relations.companies = this.normalizeCompanies(input.companies, true);
    }

    if (input.contacts !== undefined) {
      relations.contacts = this.normalizeContacts(input.contacts, true);
    }

    if (input.products !== undefined) {
      relations.products = this.normalizeProducts(input.products, false);
    }

    if (input.deals !== undefined) {
      relations.deals = this.normalizeDeals(input.deals, false);
    }

    return { fields, relations };
  }

  // 기능 : 수정 요청에 처리할 필드가 하나 이상 있는지 확인합니다.
  private hasUpdateFields(input: UpdateMeetingNoteCommand): boolean {
    return (
      input.sourceType !== undefined ||
      input.title !== undefined ||
      input.meetingLocalDateTime !== undefined ||
      input.details !== undefined ||
      input.nextPlan !== undefined ||
      input.requiredAction !== undefined ||
      input.companies !== undefined ||
      input.contacts !== undefined ||
      input.products !== undefined ||
      input.deals !== undefined
    );
  }

  // 기능 : 관계 스냅샷 교체 요청이 포함되어 있는지 확인합니다.
  private hasRelationReplacement(input: NormalizedRelationInput): boolean {
    return (
      input.companies !== undefined ||
      input.contacts !== undefined ||
      input.products !== undefined ||
      input.deals !== undefined
    );
  }

  // 기능 : 회의록 생성 sourceType을 기본값 또는 요청 출처 값으로 정규화합니다.
  private normalizeCreateSourceType(
    sourceType: MeetingNoteSourceTypeValue | undefined
  ): MeetingNoteSourceTypeValue {
    return sourceType ?? MeetingNoteSourceTypeValue.MANUAL;
  }

  // 기능 : 수정 요청에서 sourceType 변경을 기존 수동 회의록 범위로 제한합니다.
  private assertManualSourceType(
    sourceType: MeetingNoteSourceTypeValue | undefined
  ): void {
    if (
      sourceType !== undefined &&
      sourceType !== MeetingNoteSourceTypeValue.MANUAL
    ) {
      throw new ValidationDomainError("sourceType must be MANUAL");
    }
  }

  // 기능 : 회사 입력 배열을 trim과 nullable 규칙에 맞게 정규화합니다.
  private normalizeCompanyIds(
    value: readonly string[],
    required: boolean
  ): NormalizedCompanyInput[] {
    return this.normalizeRelationIds(value, "companies", required).map(
      (companyId) => ({
        companyId,
        companyNameSnapshot: null,
        companyFieldSnapshot: null,
        companyRegionSnapshot: null,
      })
    );
  }

  private normalizeContactIds(
    value: readonly string[],
    required: boolean
  ): NormalizedContactInput[] {
    return this.normalizeRelationIds(value, "contacts", required).map(
      (contactId) => ({
        contactId,
        companyId: null,
        contactUsernameSnapshot: null,
        contactEmailSnapshot: null,
        contactMobileSnapshot: null,
        contactCompanyNameSnapshot: null,
        contactDepartmentSnapshot: null,
        contactJobGradeSnapshot: null,
      })
    );
  }

  private normalizeProductIds(
    value: readonly string[],
    required: boolean
  ): NormalizedProductInput[] {
    return this.normalizeRelationIds(value, "products", required).map(
      (productId) => ({
        productId,
        productNameSnapshot: null,
        productPriceSnapshot: null,
        productCategorySnapshot: null,
        productStatusSnapshot: null,
      })
    );
  }

  private normalizeDealIds(
    value: readonly string[],
    required: boolean
  ): NormalizedDealInput[] {
    return this.normalizeRelationIds(value, "deals", required).map((dealId) => ({
      dealId,
    }));
  }

  private normalizeRelationIds(
    value: readonly string[],
    fieldName: string,
    required: boolean
  ): string[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError(`${fieldName} must be an array`);
    }

    if (required && value.length === 0) {
      throw new ValidationDomainError(`${fieldName} must not be empty`);
    }

    const ids = value.map((item) =>
      this.normalizeRequiredText(item, 100, `${fieldName}Id`)
    );
    const uniqueIds = new Set(ids);

    if (uniqueIds.size !== ids.length) {
      throw new ValidationDomainError(
        `${fieldName} must not contain duplicate ids`
      );
    }

    return ids;
  }

  private normalizeCompanies(
    value: readonly MeetingNoteCompanyCommand[],
    required: boolean
  ): NormalizedCompanyInput[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError("companies must be an array");
    }

    if (required && value.length === 0) {
      throw new ValidationDomainError("companies must not be empty");
    }

    return value.map((item) => ({
      companyId: this.normalizeNullableId(item.companyId),
      companyNameSnapshot: this.normalizeNullableText(
        item.companyName,
        300,
        "companyName"
      ),
      companyFieldSnapshot: this.normalizeNullableText(
        item.companyField,
        200,
        "companyField"
      ),
      companyRegionSnapshot: this.normalizeNullableText(
        item.companyRegion,
        200,
        "companyRegion"
      ),
    }));
  }

  // 기능 : 연락처 입력 배열을 trim과 nullable 규칙에 맞게 정규화합니다.
  private normalizeContacts(
    value: readonly MeetingNoteContactCommand[],
    required: boolean
  ): NormalizedContactInput[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError("contacts must be an array");
    }

    if (required && value.length === 0) {
      throw new ValidationDomainError("contacts must not be empty");
    }

    return value.map((item) => ({
      contactId: this.normalizeNullableId(item.contactId),
      companyId: this.normalizeNullableId(item.companyId),
      contactUsernameSnapshot: this.normalizeNullableText(
        item.contactUsername,
        200,
        "contactUsername"
      ),
      contactEmailSnapshot: this.normalizeNullableText(
        item.contactEmail,
        300,
        "contactEmail"
      ),
      contactMobileSnapshot: this.normalizeNullableText(
        item.contactMobile,
        100,
        "contactMobile"
      ),
      contactCompanyNameSnapshot: this.normalizeNullableText(
        item.companyName,
        300,
        "companyName"
      ),
      contactDepartmentSnapshot: this.normalizeNullableText(
        item.department,
        200,
        "department"
      ),
      contactJobGradeSnapshot: this.normalizeNullableText(
        item.jobGrade,
        200,
        "jobGrade"
      ),
    }));
  }

  // 기능 : 제품 입력 배열을 trim, nullable, 가격 규칙에 맞게 정규화합니다.
  private normalizeProducts(
    value: readonly MeetingNoteProductCommand[],
    required: boolean
  ): NormalizedProductInput[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError("products must be an array");
    }

    if (required && value.length === 0) {
      throw new ValidationDomainError("products must not be empty");
    }

    return value.map((item) => {
      const price = item.productPrice ?? null;

      if (price !== null && (!Number.isInteger(price) || price < 0)) {
        throw new ValidationDomainError(
          "productPrice must be a non-negative integer"
        );
      }

      return {
        productId: this.normalizeNullableId(item.productId),
        productNameSnapshot: this.normalizeNullableText(
          item.productName,
          300,
          "productName"
        ),
        productPriceSnapshot: price,
        productCategorySnapshot: this.normalizeNullableText(
          item.productCategory,
          200,
          "productCategory"
        ),
        productStatusSnapshot: this.normalizeNullableText(
          item.productStatus,
          200,
          "productStatus"
        ),
      };
    });
  }

  // 기능 : 딜 입력 배열을 정규화하고 중복 dealId를 차단합니다.
  private normalizeDeals(
    value: readonly MeetingNoteDealCommand[],
    required: boolean
  ): NormalizedDealInput[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError("deals must be an array");
    }

    if (required && value.length === 0) {
      throw new ValidationDomainError("deals must not be empty");
    }

    const dealIds = value.map((item) =>
      this.normalizeRequiredText(item.dealId, 100, "dealId")
    );
    const uniqueDealIds = new Set(dealIds);

    if (uniqueDealIds.size !== dealIds.length) {
      throw new ValidationDomainError("deals must not contain duplicate dealIds");
    }

    return dealIds.map((dealId) => ({ dealId }));
  }

  // 기능 : 정규화된 관계 입력을 실제 저장할 스냅샷 값으로 해석합니다.
  private async resolveRelationInputs(
    userId: string,
    input: NormalizedRelationInput,
    repository: MeetingNoteRepository
  ): Promise<Omit<ReplaceMeetingNoteRelationsInput, "userId" | "meetingNoteId">> {
    const result: {
      companies?: SaveMeetingNoteCompanyInput[];
      contacts?: SaveMeetingNoteContactInput[];
      products?: SaveMeetingNoteProductInput[];
      deals?: SaveMeetingNoteDealInput[];
    } = {};

    if (input.companies !== undefined) {
      result.companies = await this.resolveCompanies(
        userId,
        input.companies,
        repository
      );
    }

    if (input.contacts !== undefined) {
      result.contacts = await this.resolveContacts(
        userId,
        input.contacts,
        repository
      );
    }

    if (input.products !== undefined) {
      result.products = await this.resolveProducts(
        userId,
        input.products,
        repository
      );
    }

    if (input.deals !== undefined) {
      result.deals = await this.resolveDeals(userId, input.deals, repository);
    }

    return result;
  }

  // 기능 : 회사 입력을 원본 회사 스냅샷 또는 직접 입력 스냅샷으로 변환합니다.
  private async resolveCompanies(
    userId: string,
    input: readonly NormalizedCompanyInput[],
    repository: MeetingNoteRepository
  ): Promise<SaveMeetingNoteCompanyInput[]> {
    const companyIds = this.unique(input.flatMap((item) => item.companyId ?? []));
    const companyMap = await this.findCompanyMap(userId, companyIds, repository);

    return input.map((item) => {
      if (item.companyId) {
        const company = companyMap.get(item.companyId);

        if (!company) {
          throw new RelatedCompanyNotFoundError();
        }

        return {
          companyId: company.id,
          companyNameSnapshot: company.companyName,
          companyFieldSnapshot: company.companyField,
          companyRegionSnapshot: company.companyRegion,
        };
      }

      if (!item.companyNameSnapshot) {
        throw new ValidationDomainError(
          "companyName is required when companyId is missing"
        );
      }

      return {
        companyId: null,
        companyNameSnapshot: item.companyNameSnapshot,
        companyFieldSnapshot: item.companyFieldSnapshot,
        companyRegionSnapshot: item.companyRegionSnapshot,
      };
    });
  }

  // 기능 : 연락처 입력을 원본 연락처 스냅샷 또는 직접 입력 스냅샷으로 변환합니다.
  private async resolveContacts(
    userId: string,
    input: readonly NormalizedContactInput[],
    repository: MeetingNoteRepository
  ): Promise<SaveMeetingNoteContactInput[]> {
    const contactIds = this.unique(input.flatMap((item) => item.contactId ?? []));
    const companyIds = this.unique(input.flatMap((item) => item.companyId ?? []));
    const contactMap = await this.findContactMap(userId, contactIds, repository);
    const companyMap = await this.findCompanyMap(userId, companyIds, repository);

    return input.map((item) => {
      if (item.contactId) {
        const contact = contactMap.get(item.contactId);

        if (!contact) {
          throw new RelatedContactNotFoundError();
        }

        return {
          contactId: contact.id,
          companyId: contact.companyId,
          contactUsernameSnapshot: contact.username,
          contactEmailSnapshot: contact.email,
          contactMobileSnapshot: contact.mobile,
          contactCompanyNameSnapshot: contact.companyName,
          contactDepartmentSnapshot: contact.departmentName,
          contactJobGradeSnapshot: contact.jobGradeName,
        };
      }

      if (item.companyId && !companyMap.has(item.companyId)) {
        throw new RelatedCompanyNotFoundError();
      }

      if (!item.contactUsernameSnapshot) {
        throw new ValidationDomainError(
          "contactUsername is required when contactId is missing"
        );
      }

      const company = item.companyId ? companyMap.get(item.companyId) : undefined;

      return {
        contactId: null,
        companyId: item.companyId,
        contactUsernameSnapshot: item.contactUsernameSnapshot,
        contactEmailSnapshot: item.contactEmailSnapshot,
        contactMobileSnapshot: item.contactMobileSnapshot,
        contactCompanyNameSnapshot:
          item.contactCompanyNameSnapshot ?? company?.companyName ?? null,
        contactDepartmentSnapshot: item.contactDepartmentSnapshot,
        contactJobGradeSnapshot: item.contactJobGradeSnapshot,
      };
    });
  }

  // 기능 : 제품 입력을 원본 제품 스냅샷 또는 직접 입력 스냅샷으로 변환합니다.
  private async resolveProducts(
    userId: string,
    input: readonly NormalizedProductInput[],
    repository: MeetingNoteRepository
  ): Promise<SaveMeetingNoteProductInput[]> {
    const productIds = this.unique(input.flatMap((item) => item.productId ?? []));
    const productMap = await this.findProductMap(userId, productIds, repository);

    return input.map((item) => {
      if (item.productId) {
        const product = productMap.get(item.productId);

        if (!product) {
          throw new RelatedProductNotFoundError();
        }

        return {
          productId: product.id,
          productNameSnapshot: product.productName,
          productPriceSnapshot: product.productPrice,
          productCategorySnapshot: product.categoryName,
          productStatusSnapshot: product.statusName,
        };
      }

      if (!item.productNameSnapshot) {
        throw new ValidationDomainError(
          "productName is required when productId is missing"
        );
      }

      return {
        productId: null,
        productNameSnapshot: item.productNameSnapshot,
        productPriceSnapshot: item.productPriceSnapshot,
        productCategorySnapshot: item.productCategorySnapshot,
        productStatusSnapshot: item.productStatusSnapshot,
      };
    });
  }

  // 기능 : 딜 입력을 원본 딜 스냅샷으로 변환합니다.
  private async resolveDeals(
    userId: string,
    input: readonly NormalizedDealInput[],
    repository: MeetingNoteRepository
  ): Promise<SaveMeetingNoteDealInput[]> {
    const dealIds = input.map((item) => item.dealId);
    const dealMap = await this.findDealMap(userId, dealIds, repository);

    return input.map((item) => {
      const deal = dealMap.get(item.dealId);

      if (!deal) {
        throw new RelatedDealNotFoundError();
      }

      return {
        dealId: deal.id,
        dealNameSnapshot: deal.dealName,
        dealStatusSnapshot: deal.dealStatus,
        dealCostSnapshot: deal.dealCost,
        dealExpectedEndDateSnapshot: deal.expectedEndDate,
      };
    });
  }

  // 기능 : 회사 ID 목록을 조회하고 빠른 참조용 Map으로 변환합니다.
  private async findCompanyMap(
    userId: string,
    companyIds: readonly string[],
    repository: MeetingNoteRepository
  ): Promise<Map<string, CompanySnapshotRecord>> {
    if (companyIds.length === 0) {
      return new Map();
    }

    const companies = await repository.findCompaniesByIds(userId, companyIds);

    if (companies.length !== companyIds.length) {
      throw new RelatedCompanyNotFoundError();
    }

    return new Map(companies.map((company) => [company.id, company]));
  }

  // 기능 : 연락처 ID 목록을 조회하고 빠른 참조용 Map으로 변환합니다.
  private async findContactMap(
    userId: string,
    contactIds: readonly string[],
    repository: MeetingNoteRepository
  ): Promise<Map<string, ContactSnapshotRecord>> {
    if (contactIds.length === 0) {
      return new Map();
    }

    const contacts = await repository.findContactsByIds(userId, contactIds);

    if (contacts.length !== contactIds.length) {
      throw new RelatedContactNotFoundError();
    }

    return new Map(contacts.map((contact) => [contact.id, contact]));
  }

  // 기능 : 제품 ID 목록을 조회하고 빠른 참조용 Map으로 변환합니다.
  private async findProductMap(
    userId: string,
    productIds: readonly string[],
    repository: MeetingNoteRepository
  ): Promise<Map<string, ProductSnapshotRecord>> {
    if (productIds.length === 0) {
      return new Map();
    }

    const products = await repository.findProductsByIds(userId, productIds);

    if (products.length !== productIds.length) {
      throw new RelatedProductNotFoundError();
    }

    return new Map(products.map((product) => [product.id, product]));
  }

  // 기능 : 딜 ID 목록을 조회하고 빠른 참조용 Map으로 변환합니다.
  private async findDealMap(
    userId: string,
    dealIds: readonly string[],
    repository: MeetingNoteRepository
  ): Promise<Map<string, DealSnapshotRecord>> {
    if (dealIds.length === 0) {
      return new Map();
    }

    const deals = await repository.findDealsByIds(userId, dealIds);

    if (deals.length !== dealIds.length) {
      throw new RelatedDealNotFoundError();
    }

    return new Map(deals.map((deal) => [deal.id, deal]));
  }

  // 기능 : 목록 page 값을 양의 정수로 정규화합니다.
  private normalizePage(page: number | undefined): number {
    if (page === undefined) {
      return 1;
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationDomainError("page must be a positive integer");
    }

    return page;
  }

  // 기능 : 필터 ID 배열을 trim하고 중복을 제거합니다.
  private normalizeIdArray(value: readonly string[], fieldName: string): string[] {
    if (!Array.isArray(value)) {
      throw new ValidationDomainError(`${fieldName} must be an array`);
    }

    return this.unique(
      value.map((item) => this.normalizeRequiredText(item, 100, fieldName))
    );
  }

  // 기능 : nullable ID 입력을 trim하고 빈 문자열을 null로 정규화합니다.
  private normalizeNullableId(value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length === 0 ? null : normalized;
  }

  // 기능 : 필수 문자열 입력을 trim하고 길이와 공백 여부를 검증합니다.
  private normalizeRequiredText(
    value: string,
    maxLength: number,
    fieldName: string
  ): string {
    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new ValidationDomainError(`${fieldName} is required`);
    }

    if (normalized.length > maxLength) {
      throw new ValidationDomainError(`${fieldName} is too long`);
    }

    return normalized;
  }

  // 기능 : nullable 문자열 입력을 trim하고 빈 문자열을 null로 정규화합니다.
  private normalizeNullableText(
    value: string | null | undefined,
    maxLength: number,
    fieldName: string
  ): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value !== "string") {
      throw new ValidationDomainError(`${fieldName} must be a string`);
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return null;
    }

    if (normalized.length > maxLength) {
      throw new ValidationDomainError(`${fieldName} is too long`);
    }

    return normalized;
  }

  // 기능 : 사용자 timezone을 IANA timezone 또는 기본 timezone으로 정규화합니다.
  private normalizeUserTimeZone(timeZone: string): string {
    return isValidIanaTimeZone(timeZone) ? timeZone : DEFAULT_USER_TIME_ZONE;
  }

  // 기능 : 사용자 local date-time 입력을 timezone 기준 UTC instant로 변환합니다.
  private parseRequiredMeetingLocalDateTime(
    value: string | null | undefined,
    timeZone: string
  ): Date {
    const parsed = this.parseOptionalMeetingLocalDateTime(value, timeZone);

    if (!parsed) {
      throw new ValidationDomainError("meetingLocalDateTime is required");
    }

    return parsed;
  }

  private parseOptionalMeetingLocalDateTime(
    value: string | null | undefined,
    timeZone: string
  ): Date | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return null;
    }

    const match = LOCAL_DATE_TIME_PATTERN.exec(normalized);

    if (!match) {
      throw new ValidationDomainError(
        "meetingLocalDateTime must be a valid local date-time"
      );
    }

    const parts = {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: Number(match[4]),
      minute: Number(match[5]),
      second: match[6] ? Number(match[6]) : 0,
      millisecond: match[7] ? Number(match[7].padEnd(3, "0")) : 0,
    };

    if (!this.isValidDateTimeParts(parts)) {
      throw new ValidationDomainError(
        "meetingLocalDateTime must be a valid local date-time"
      );
    }

    return this.zonedTimeToUtc(parts, timeZone);
  }

  // 기능 : 사용자 timezone 기준 local date 하루 범위를 UTC instant 범위로 변환합니다.
  private parseOptionalMeetingDateRange(
    value: string | undefined,
    timeZone: string
  ): { readonly from: Date; readonly to: Date } | undefined {
    if (value === undefined || value.trim().length === 0) {
      return undefined;
    }

    const normalized = value.trim();
    const match = LOCAL_DATE_PATTERN.exec(normalized);

    if (!match) {
      throw new ValidationDomainError("meetingDate must be a valid local date");
    }

    const startParts: DateTimeParts = {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    };

    if (!this.isValidDateTimeParts(startParts)) {
      throw new ValidationDomainError("meetingDate must be a valid local date");
    }

    const nextDay = new Date(
      Date.UTC(startParts.year, startParts.month - 1, startParts.day + 1)
    );
    const endParts: DateTimeParts = {
      year: nextDay.getUTCFullYear(),
      month: nextDay.getUTCMonth() + 1,
      day: nextDay.getUTCDate(),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    };

    return {
      from: this.zonedTimeToUtc(startParts, timeZone),
      to: this.zonedTimeToUtc(endParts, timeZone),
    };
  }

  // 기능 : timezone 기준 local date-time 구성요소를 UTC instant로 변환합니다.
  private zonedTimeToUtc(parts: DateTimeParts, timeZone: string): Date {
    const utcGuess = new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
      )
    );
    const timeZoneParts = this.getTimeZoneParts(utcGuess, timeZone);
    const asUtc = Date.UTC(
      timeZoneParts.year,
      timeZoneParts.month - 1,
      timeZoneParts.day,
      timeZoneParts.hour,
      timeZoneParts.minute,
      timeZoneParts.second,
      timeZoneParts.millisecond
    );
    const offset = asUtc - utcGuess.getTime();

    return new Date(utcGuess.getTime() - offset);
  }

  // 기능 : UTC instant를 timezone 기준 local date-time 구성요소로 분해합니다.
  private getTimeZoneParts(date: Date, timeZone: string): DateTimeParts {
    const formatter = new Intl.DateTimeFormat("en-US", {
      calendar: "iso8601",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      hourCycle: "h23",
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      timeZone,
      year: "numeric",
    });
    const values = new Map(
      formatter
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    );

    return {
      year: values.get("year") ?? 0,
      month: values.get("month") ?? 0,
      day: values.get("day") ?? 0,
      hour: values.get("hour") ?? 0,
      minute: values.get("minute") ?? 0,
      second: values.get("second") ?? 0,
      millisecond: 0,
    };
  }

  // 기능 : local date-time 구성요소가 실제 calendar 값인지 검증합니다.
  private isValidDateTimeParts(parts: DateTimeParts): boolean {
    const date = new Date(
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        parts.millisecond
      )
    );

    return (
      date.getUTCFullYear() === parts.year &&
      date.getUTCMonth() === parts.month - 1 &&
      date.getUTCDate() === parts.day &&
      date.getUTCHours() === parts.hour &&
      date.getUTCMinutes() === parts.minute &&
      date.getUTCSeconds() === parts.second
    );
  }

  // 기능 : UTC instant를 API 응답용 local date-time 문자열로 변환합니다.
  private formatLocalDateTime(date: Date | null, timeZone: string): string | null {
    if (!date) {
      return null;
    }

    const parts = this.getTimeZoneParts(date, timeZone);

    return `${String(parts.year).padStart(4, "0")}-${this.pad2(
      parts.month
    )}-${this.pad2(parts.day)}T${this.pad2(parts.hour)}:${this.pad2(
      parts.minute
    )}:${this.pad2(parts.second)}`;
  }

  // 기능 : 딜 활동 로그에 표시할 회의록 연결 문구를 생성합니다.
  private createDealLinkActivityLogText(meetingNote: MeetingNoteRecord): string {
    const meetingLocalDate =
      this.formatLocalDateTime(meetingNote.meetingAt, meetingNote.timeZone)?.slice(
        0,
        10
      ) ?? "날짜 없음";
    const details = this.toSingleLineSnippet(meetingNote.details, 140);

    return `[회의록 연결] ${meetingLocalDate} /meeting-notes/${meetingNote.id} - ${details}`;
  }

  // 기능 : 긴 본문을 활동 로그 한 줄 요약으로 축약합니다.
  private toSingleLineSnippet(value: string, maxLength: number): string {
    const normalized = value.replace(/\s+/g, " ").trim();

    if (normalized.length <= maxLength) {
      return normalized;
    }

    return `${normalized.slice(0, maxLength - 3)}...`;
  }

  // 기능 : 숫자를 두 자리 문자열로 채웁니다.
  private pad2(value: number): string {
    return String(value).padStart(2, "0");
  }

  // 기능 : 문자열 배열의 중복을 제거합니다.
  private unique(values: readonly string[]): string[] {
    return [...new Set(values)];
  }

  // 기능 : 저장소 회의록 record를 목록용 summary 응답 구조로 변환합니다.
  private toMeetingNoteListItemResponse(
    meetingNote: MeetingNoteRecord
  ): MeetingNoteListItemResponse {
    return {
      id: meetingNote.id,
      title: meetingNote.title,
      meetingAt: meetingNote.meetingAt?.toISOString() ?? null,
      sourceType: meetingNote.sourceType,
      companies: this.toSummary(
        meetingNote.companies.map((company) => company.companyNameSnapshot)
      ),
      contacts: this.toSummary(
        meetingNote.contacts.map((contact) => contact.contactUsernameSnapshot)
      ),
      products: this.toSummary(
        meetingNote.products.map((product) => product.productNameSnapshot)
      ),
      deals: this.toSummary(
        meetingNote.deals.map((deal) => deal.dealNameSnapshot)
      ),
      createdAt: meetingNote.createdAt.toISOString(),
    };
  }

  // 기능 : 관계 label 목록을 첫 항목과 count summary로 변환합니다.
  private toSummary(labels: readonly string[]): MeetingNoteListSummaryResponse {
    if (labels.length === 0) {
      return { label: "", count: 0 };
    }

    return {
      label: labels.length === 1 ? labels[0] ?? "" : `${labels[0] ?? ""} 외 ${labels.length - 1}개`,
      count: labels.length,
    };
  }

  // 기능 : 저장소 회의록 record를 API 응답 구조로 변환합니다.
  private toMeetingNoteResponse(
    meetingNote: MeetingNoteRecord
  ): MeetingNoteResponse {
    return {
      id: meetingNote.id,
      sourceType: meetingNote.sourceType,
      title: meetingNote.title,
      meetingAt: meetingNote.meetingAt?.toISOString() ?? null,
      meetingLocalDateTime: this.formatLocalDateTime(
        meetingNote.meetingAt,
        meetingNote.timeZone
      ),
      timeZone: meetingNote.timeZone,
      details: meetingNote.details,
      nextPlan: meetingNote.nextPlan,
      requiredAction: meetingNote.requiredAction,
      companies: meetingNote.companies.map((company) => ({
        id: company.id,
        companyId: company.companyId,
        companyNameSnapshot: company.companyNameSnapshot,
        companyFieldSnapshot: company.companyFieldSnapshot,
        companyRegionSnapshot: company.companyRegionSnapshot,
        createdAt: company.createdAt.toISOString(),
      })),
      contacts: meetingNote.contacts.map((contact) => ({
        id: contact.id,
        contactId: contact.contactId,
        companyId: contact.companyId,
        contactUsernameSnapshot: contact.contactUsernameSnapshot,
        contactEmailSnapshot: contact.contactEmailSnapshot,
        contactMobileSnapshot: contact.contactMobileSnapshot,
        companyNameSnapshot: contact.contactCompanyNameSnapshot,
        departmentSnapshot: contact.contactDepartmentSnapshot,
        jobGradeSnapshot: contact.contactJobGradeSnapshot,
        createdAt: contact.createdAt.toISOString(),
      })),
      products: meetingNote.products.map((product) => ({
        id: product.id,
        productId: product.productId,
        productNameSnapshot: product.productNameSnapshot,
        productPriceSnapshot: product.productPriceSnapshot,
        productCategorySnapshot: product.productCategorySnapshot,
        productStatusSnapshot: product.productStatusSnapshot,
        createdAt: product.createdAt.toISOString(),
      })),
      deals: meetingNote.deals.map((deal) => ({
        id: deal.id,
        dealId: deal.dealId,
        dealNameSnapshot: deal.dealNameSnapshot,
        dealStatusSnapshot: deal.dealStatusSnapshot,
        dealCostSnapshot: deal.dealCostSnapshot,
        dealExpectedEndDateSnapshot:
          deal.dealExpectedEndDateSnapshot.toISOString().slice(0, 10),
        createdAt: deal.createdAt.toISOString(),
      })),
      createdAt: meetingNote.createdAt.toISOString(),
      updatedAt: meetingNote.updatedAt.toISOString(),
    };
  }

  // 기능 : 민감 본문 없이 회의록 application 이벤트를 구조화 로그로 남깁니다.
  private logEvent(event: string, fields: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        event,
        ...fields,
      }),
      "MeetingNoteApplicationService"
    );
  }
}
