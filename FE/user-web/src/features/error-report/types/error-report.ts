// 역할 : CreateErrorReportInput 에러 신고 생성 요청 값을 정의합니다.
export interface CreateErrorReportInput {
  readonly description: string;
  readonly pageUrl: string;
  readonly screenshot?: Blob | null;
}

// 역할 : CreateErrorReportResponse 에러 신고 생성 성공 응답을 정의합니다.
export interface CreateErrorReportResponse {
  readonly id: string;
  readonly message: string;
}
