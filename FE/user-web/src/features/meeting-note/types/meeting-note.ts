export type MeetingNoteSourceType = "MANUAL" | "TEXT_AI" | "STT_AI";

export type MeetingNoteSort = "createdAtDesc" | "meetingAtDesc";

export type MeetingNoteListSummary = {
  readonly label: string;
  readonly count: number;
};

export type MeetingNoteListItem = {
  readonly id: string;
  readonly title: string;
  readonly meetingAt: string | null;
  readonly sourceType: MeetingNoteSourceType;
  readonly companies: MeetingNoteListSummary;
  readonly contacts: MeetingNoteListSummary;
  readonly products: MeetingNoteListSummary;
  readonly deals: MeetingNoteListSummary;
  readonly createdAt: string;
};

export type MeetingNoteListResponse = {
  readonly items: MeetingNoteListItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};

export type MeetingNoteListParams = {
  readonly page?: number;
  readonly companyIds?: readonly string[];
  readonly contactIds?: readonly string[];
  readonly sort?: MeetingNoteSort;
  readonly search?: string;
  readonly meetingDate?: string;
};

export type MeetingNoteFilterCompanyOption = {
  readonly id: string;
  readonly companyName: string;
  readonly createdAt: string;
};

export type MeetingNoteFilterCompanyListResponse = {
  readonly items: MeetingNoteFilterCompanyOption[];
};

export type MeetingNoteFilterContactOption = {
  readonly id: string;
  readonly companyId: string | null;
  readonly contactUsername: string;
  readonly createdAt: string;
};

export type MeetingNoteFilterContactListResponse = {
  readonly items: MeetingNoteFilterContactOption[];
};

export type MeetingNoteCompany = {
  readonly id: string;
  readonly companyId: string | null;
  readonly companyNameSnapshot: string;
  readonly companyFieldSnapshot: string | null;
  readonly companyRegionSnapshot: string | null;
  readonly createdAt: string;
};

export type MeetingNoteContact = {
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
};

export type MeetingNoteProduct = {
  readonly id: string;
  readonly productId: string | null;
  readonly productNameSnapshot: string;
  readonly productPriceSnapshot: number | null;
  readonly productCategorySnapshot: string | null;
  readonly productStatusSnapshot: string | null;
  readonly createdAt: string;
};

export type MeetingNoteDeal = {
  readonly id: string;
  readonly dealId: string;
  readonly dealNameSnapshot: string;
  readonly dealStatusSnapshot: string;
  readonly dealCostSnapshot: number;
  readonly dealExpectedEndDateSnapshot: string;
  readonly createdAt: string;
};

export type MeetingNote = {
  readonly id: string;
  readonly sourceType: MeetingNoteSourceType;
  readonly title: string;
  readonly meetingAt: string | null;
  readonly meetingLocalDateTime: string | null;
  readonly timeZone: string;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
  readonly companies: MeetingNoteCompany[];
  readonly contacts: MeetingNoteContact[];
  readonly products: MeetingNoteProduct[];
  readonly deals: MeetingNoteDeal[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MeetingNoteCompanyInput = {
  readonly companyId?: string;
  readonly companyName?: string;
  readonly companyField?: string;
  readonly companyRegion?: string;
};

export type MeetingNoteContactInput = {
  readonly contactId?: string;
  readonly companyId?: string;
  readonly contactUsername?: string;
  readonly contactEmail?: string;
  readonly contactMobile?: string;
  readonly companyName?: string;
  readonly department?: string;
  readonly jobGrade?: string;
};

export type MeetingNoteProductInput = {
  readonly productId?: string;
  readonly productName?: string;
  readonly productPrice?: number;
  readonly productCategory?: string;
  readonly productStatus?: string;
};

export type MeetingNoteDealInput = {
  readonly dealId: string;
};

export type CreateMeetingNoteInput = {
  readonly sourceType?: MeetingNoteSourceType;
  readonly title: string;
  readonly meetingLocalDateTime: string;
  readonly details: string;
  readonly nextPlan?: string | null;
  readonly requiredAction?: string | null;
  readonly companies: readonly string[];
  readonly contacts: readonly string[];
  readonly products?: readonly string[];
  readonly deals?: readonly string[];
};

export type MeetingNoteAiDraftContextInput = {
  readonly meetingLocalDateTime: string;
  readonly companies: readonly string[];
  readonly contacts: readonly string[];
  readonly products?: readonly string[];
  readonly deals?: readonly string[];
};

export type CreateMeetingNoteTextAiDraftInput =
  MeetingNoteAiDraftContextInput & {
    readonly text: string;
  };

export type CreateMeetingNoteSttAiDraftInput =
  MeetingNoteAiDraftContextInput & {
    readonly audioFile: File;
  };

export type MeetingNoteAiDraftResponse = {
  readonly sourceType: Extract<MeetingNoteSourceType, "TEXT_AI" | "STT_AI">;
  readonly transcript: string | null;
  readonly details: string;
  readonly nextPlan: string | null;
  readonly requiredAction: string | null;
};

export type UpdateMeetingNoteInput = {
  readonly meetingNoteId: string;
  readonly sourceType?: "MANUAL";
  readonly title?: string;
  readonly meetingLocalDateTime?: string | null;
  readonly details?: string;
  readonly nextPlan?: string | null;
  readonly requiredAction?: string | null;
  readonly companies?: readonly MeetingNoteCompanyInput[];
  readonly contacts?: readonly MeetingNoteContactInput[];
  readonly products?: readonly MeetingNoteProductInput[];
  readonly deals?: readonly MeetingNoteDealInput[];
};

export type LinkMeetingNoteDealsInput = {
  readonly meetingNoteId: string;
  readonly deals: readonly string[];
};
