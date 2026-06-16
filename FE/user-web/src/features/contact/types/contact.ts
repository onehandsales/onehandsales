// 담당자 목록 아이템
export type ContactListItem = {
  readonly id: string;
  readonly company: { readonly id: string; readonly companyName: string };
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly contactDepartment: { readonly id: string; readonly departmentName: string };
  readonly contactJobGrade: { readonly id: string; readonly jobGradeName: string };
  readonly createdAt: string;
};

// 담당자 상세 (목록 + updatedAt)
export type ContactDetail = ContactListItem & { readonly updatedAt: string };

// 페이지네이션 응답
export type ContactPageResponse = {
  readonly items: ContactListItem[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
};

// 회사 옵션 (필터/선택용)
export type ContactCompanyOption = { readonly id: string; readonly companyName: string };
export type ContactCompanyOptionListResponse = { readonly items: ContactCompanyOption[] };

// 직급
export type ContactJobGrade = { readonly id: string; readonly jobGradeName: string };
export type ContactJobGradeListResponse = { readonly items: ContactJobGrade[] };

// 부서
export type ContactDepartment = { readonly id: string; readonly departmentName: string };
export type ContactDepartmentListResponse = { readonly items: ContactDepartment[] };

// 메모 로그 (cursor 무한스크롤)
export type ContactMemoLog = {
  readonly id: string;
  readonly memoType: string;
  readonly memo: string;
  readonly createdAt: string;
};
export type ContactMemoLogConnection = {
  readonly items: ContactMemoLog[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
};

// 개인 비밀 메모 로그
export type ContactPrivateMemoLog = {
  readonly id: string;
  readonly memo: string;
  readonly createdAt: string;
};
export type ContactPrivateMemoLogConnection = {
  readonly items: ContactPrivateMemoLog[];
  readonly nextCursor: string | null;
  readonly hasNext: boolean;
};

export type ContactDeal = {
  readonly id: string;
  readonly dealName: string;
  readonly dealCost: number;
  readonly createdAt: string;
};

export type ContactDealListResponse = {
  readonly items: ContactDeal[];
};

export type ContactSort = "createdAtDesc" | "usernameAsc";

// 목록 조회 파라미터
export type ContactListParams = {
  readonly page?: number;
  readonly username?: string;
  readonly companyId?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
  readonly sort?: ContactSort;
};

// 생성 입력
export type CreateContactInput = {
  readonly username: string;
  readonly mobile: string;
  readonly email: string;
  readonly companyId: string;
  readonly contactDepartmentId: string;
  readonly contactJobGradeId: string;
  readonly contactMemo?: string;
};

// 수정 입력
export type UpdateContactInput = {
  readonly contactId: string;
  readonly username?: string;
  readonly mobile?: string;
  readonly email?: string;
  readonly companyId?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
};

// 메모 로그 입력
export type CreateContactMemoLogInput = {
  readonly contactId: string;
  readonly memoType: string;
  readonly memo: string;
};
export type UpdateContactMemoLogInput = {
  readonly contactId: string;
  readonly memoLogId: string;
  readonly memoType?: string;
  readonly memo?: string;
};

// 개인 비밀 메모 로그 입력
export type CreateContactPrivateMemoLogInput = {
  readonly contactId: string;
  readonly memo: string;
};
export type UpdateContactPrivateMemoLogInput = {
  readonly contactId: string;
  readonly privateMemoLogId: string;
  readonly memo: string;
};

// export 파라미터
export type ContactExportParams = {
  readonly username?: string;
  readonly companyId?: string;
  readonly contactDepartmentId?: string;
  readonly contactJobGradeId?: string;
  readonly sort?: ContactSort;
};

// 직급/부서 생성 입력
export type CreateContactJobGradeInput = { readonly jobGradeName: string };
export type CreateContactDepartmentInput = { readonly departmentName: string };
