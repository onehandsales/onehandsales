export const MEETING_NOTE_REPOSITORY = Symbol("MEETING_NOTE_REPOSITORY");

// 역할 : MeetingNoteSourceTypeValue 회의록 생성 출처 값을 정의합니다.
export enum MeetingNoteSourceTypeValue {
  MANUAL = "MANUAL",
  TEXT_AI = "TEXT_AI",
  STT_AI = "STT_AI",
}

// 역할 : MeetingNoteSort 회의록 목록 정렬 값을 정의합니다.
export enum MeetingNoteSort {
  CREATED_AT_DESC = "createdAtDesc",
  MEETING_AT_DESC = "meetingAtDesc",
}

// 역할 : MeetingNoteCompanyRecord 저장소가 전달하는 회의록 회사 스냅샷 구조를 정의합니다.
export interface MeetingNoteCompanyRecord {
  readonly id: string;
  readonly companyId: string | null;
  readonly companyNameSnapshot: string;
  readonly companyFieldSnapshot: string | null;
  readonly companyRegionSnapshot: string | null;
  readonly createdAt: Date;
}

// 역할 : MeetingNoteContactRecord 저장소가 전달하는 회의록 연락처 스냅샷 구조를 정의합니다.
export interface MeetingNoteContactRecord {
  readonly id: string;
  readonly contactId: string | null;
  readonly companyId: string | null;
  readonly contactUsernameSnapshot: string;
  readonly contactEmailSnapshot: string | null;
  readonly contactMobileSnapshot: string | null;
  readonly contactCompanyNameSnapshot: string | null;
  readonly contactDepartmentSnapshot: string | null;
  readonly contactJobGradeSnapshot: string | null;
  readonly createdAt: Date;
}

// 역할 : MeetingNoteProductRecord 저장소가 전달하는 회의록 제품 스냅샷 구조를 정의합니다.
export interface MeetingNoteProductRecord {
  readonly id: string;
  readonly productId: string | null;
  readonly productNameSnapshot: string;
  readonly productPriceSnapshot: number | null;
  readonly productCategorySnapshot: string | null;
  readonly productStatusSnapshot: string | null;
  readonly createdAt: Date;
}

// 역할 : MeetingNoteDealRecord 저장소가 전달하는 회의록 딜 스냅샷 구조를 정의합니다.
export interface MeetingNoteDealRecord {
  readonly id: string;
  readonly dealId: string;
  readonly dealNameSnapshot: string;
  readonly dealStatusSnapshot: string;
  readonly dealCostSnapshot: number;
  readonly dealExpectedEndDateSnapshot: Date;
  readonly createdAt: Date;
}

// 역할 : MeetingNoteRecord 저장소가 전달하는 회의록 상세 구조를 정의합니다.
export interface MeetingNoteRecord {
  readonly id: string;
  readonly sourceType: MeetingNoteSourceTypeValue;
  readonly meetingAt: Date | null;
  readonly timeZone: string;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly rawText: string | null;
  readonly companies: MeetingNoteCompanyRecord[];
  readonly contacts: MeetingNoteContactRecord[];
  readonly products: MeetingNoteProductRecord[];
  readonly deals: MeetingNoteDealRecord[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 역할 : MeetingNoteFilterCompanyOptionRecord 회사 필터 옵션 구조를 정의합니다.
export interface MeetingNoteFilterCompanyOptionRecord {
  readonly id: string;
  readonly companyName: string;
  readonly createdAt: Date;
}

// 역할 : MeetingNoteFilterContactOptionRecord 연락처 필터 옵션 구조를 정의합니다.
export interface MeetingNoteFilterContactOptionRecord {
  readonly id: string;
  readonly contactUsername: string;
  readonly createdAt: Date;
}

// 역할 : CompanySnapshotRecord 회사 원본 엔티티 스냅샷 구조를 정의합니다.
export interface CompanySnapshotRecord {
  readonly id: string;
  readonly companyName: string;
  readonly companyField: string;
  readonly companyRegion: string;
}

// 역할 : ContactSnapshotRecord 연락처 원본 엔티티 스냅샷 구조를 정의합니다.
export interface ContactSnapshotRecord {
  readonly id: string;
  readonly companyId: string;
  readonly username: string;
  readonly email: string;
  readonly mobile: string;
  readonly companyName: string;
  readonly departmentName: string;
  readonly jobGradeName: string;
}

// 역할 : ProductSnapshotRecord 제품 원본 엔티티 스냅샷 구조를 정의합니다.
export interface ProductSnapshotRecord {
  readonly id: string;
  readonly productName: string;
  readonly productPrice: number;
  readonly categoryName: string;
  readonly statusName: string;
}

// 역할 : DealSnapshotRecord 딜 원본 엔티티 스냅샷 구조를 정의합니다.
export interface DealSnapshotRecord {
  readonly id: string;
  readonly dealName: string;
  readonly dealStatus: string;
  readonly dealCost: number;
  readonly expectedEndDate: Date;
}

// 역할 : ListMeetingNotesInput 회의록 목록 조회 조건을 정의합니다.
export interface ListMeetingNotesInput {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly companyIds: readonly string[];
  readonly contactIds: readonly string[];
  readonly sort: MeetingNoteSort;
  readonly meetingAtFrom?: Date;
  readonly meetingAtTo?: Date;
}

// 역할 : MeetingNoteListRecord 회의록 목록 조회 결과 구조를 정의합니다.
export interface MeetingNoteListRecord {
  readonly items: MeetingNoteRecord[];
  readonly totalCount: number;
}

// 역할 : CreateMeetingNoteInput 회의록 기본 row 생성 값을 정의합니다.
export interface CreateMeetingNoteInput {
  readonly userId: string;
  readonly sourceType: MeetingNoteSourceTypeValue;
  readonly meetingAt: Date;
  readonly timeZone: string;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly rawText: string | null;
}

// 역할 : UpdateMeetingNoteInput 회의록 기본 row 수정 값을 정의합니다.
export interface UpdateMeetingNoteInput {
  readonly sourceType?: MeetingNoteSourceTypeValue;
  readonly meetingAt?: Date;
  readonly timeZone?: string;
  readonly details?: string;
  readonly nextPlan?: string | null;
  readonly requiredAction?: string | null;
  readonly rawText?: string | null;
}

// 역할 : SaveMeetingNoteCompanyInput 회의록 회사 관계 저장 값을 정의합니다.
export interface SaveMeetingNoteCompanyInput {
  readonly companyId: string | null;
  readonly companyNameSnapshot: string;
  readonly companyFieldSnapshot: string | null;
  readonly companyRegionSnapshot: string | null;
}

// 역할 : SaveMeetingNoteContactInput 회의록 연락처 관계 저장 값을 정의합니다.
export interface SaveMeetingNoteContactInput {
  readonly contactId: string | null;
  readonly companyId: string | null;
  readonly contactUsernameSnapshot: string;
  readonly contactEmailSnapshot: string | null;
  readonly contactMobileSnapshot: string | null;
  readonly contactCompanyNameSnapshot: string | null;
  readonly contactDepartmentSnapshot: string | null;
  readonly contactJobGradeSnapshot: string | null;
}

// 역할 : SaveMeetingNoteProductInput 회의록 제품 관계 저장 값을 정의합니다.
export interface SaveMeetingNoteProductInput {
  readonly productId: string | null;
  readonly productNameSnapshot: string;
  readonly productPriceSnapshot: number | null;
  readonly productCategorySnapshot: string | null;
  readonly productStatusSnapshot: string | null;
}

// 역할 : SaveMeetingNoteDealInput 회의록 딜 관계 저장 값을 정의합니다.
export interface SaveMeetingNoteDealInput {
  readonly dealId: string;
  readonly dealNameSnapshot: string;
  readonly dealStatusSnapshot: string;
  readonly dealCostSnapshot: number;
  readonly dealExpectedEndDateSnapshot: Date;
}

// 역할 : ReplaceMeetingNoteRelationsInput 회의록 관계 교체 저장 값을 정의합니다.
export interface ReplaceMeetingNoteRelationsInput {
  readonly userId: string;
  readonly meetingNoteId: string;
  readonly companies?: readonly SaveMeetingNoteCompanyInput[];
  readonly contacts?: readonly SaveMeetingNoteContactInput[];
  readonly products?: readonly SaveMeetingNoteProductInput[];
  readonly deals?: readonly SaveMeetingNoteDealInput[];
}

// 역할 : MeetingNoteRepository 회의록 저장소가 구현해야 하는 영속성 계약을 정의합니다.
export interface MeetingNoteRepository {
  // 기능 : 회의록 저장소 작업을 트랜잭션 경계 안에서 실행합니다.
  runInTransaction<T>(
    work: (repository: MeetingNoteRepository) => Promise<T>
  ): Promise<T>;
  // 기능 : 현재 사용자의 회의록 회사 필터 옵션을 조회합니다.
  listFilterCompanies(
    userId: string
  ): Promise<MeetingNoteFilterCompanyOptionRecord[]>;
  // 기능 : 현재 사용자의 회의록 연락처 필터 옵션을 조회합니다.
  listFilterContacts(
    userId: string
  ): Promise<MeetingNoteFilterContactOptionRecord[]>;
  // 기능 : 현재 사용자의 회사 ID 목록을 원본 스냅샷으로 조회합니다.
  findCompaniesByIds(
    userId: string,
    companyIds: readonly string[]
  ): Promise<CompanySnapshotRecord[]>;
  // 기능 : 현재 사용자의 연락처 ID 목록을 원본 스냅샷으로 조회합니다.
  findContactsByIds(
    userId: string,
    contactIds: readonly string[]
  ): Promise<ContactSnapshotRecord[]>;
  // 기능 : 현재 사용자의 제품 ID 목록을 원본 스냅샷으로 조회합니다.
  findProductsByIds(
    userId: string,
    productIds: readonly string[]
  ): Promise<ProductSnapshotRecord[]>;
  // 기능 : 현재 사용자의 딜 ID 목록을 원본 스냅샷으로 조회합니다.
  findDealsByIds(
    userId: string,
    dealIds: readonly string[]
  ): Promise<DealSnapshotRecord[]>;
  // 기능 : 현재 사용자의 회의록 목록을 필터와 페이지 조건으로 조회합니다.
  listMeetingNotes(input: ListMeetingNotesInput): Promise<MeetingNoteListRecord>;
  // 기능 : 현재 사용자의 회의록 단건 상세를 조회합니다.
  findMeetingNote(
    userId: string,
    meetingNoteId: string
  ): Promise<MeetingNoteRecord | null>;
  // 기능 : 현재 사용자의 회의록 기본 row를 생성합니다.
  createMeetingNote(
    input: CreateMeetingNoteInput
  ): Promise<{ readonly id: string }>;
  // 기능 : 현재 사용자의 회의록 기본 row를 수정합니다.
  updateMeetingNote(
    userId: string,
    meetingNoteId: string,
    input: UpdateMeetingNoteInput
  ): Promise<boolean>;
  // 기능 : 현재 사용자의 회의록 관계 스냅샷 목록을 요청 값으로 교체합니다.
  replaceMeetingNoteRelations(
    input: ReplaceMeetingNoteRelationsInput
  ): Promise<void>;
}
