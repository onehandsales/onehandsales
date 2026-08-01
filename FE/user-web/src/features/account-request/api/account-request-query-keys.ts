// 기능 : 사용자 계정 데이터 요청 React Query key를 생성합니다.
export const accountRequestQueryKeys = {
  all: ["account-requests"] as const,
  dataExport: (requestId: string) =>
    [...accountRequestQueryKeys.all, "data-export", requestId] as const,
};
