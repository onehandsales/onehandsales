// 역할 : 제품 확인이 필요한 날짜 정책을 실행 기본값과 분리합니다.
export const viewDataExecutionPolicy: {
  readonly dateEndInclusive: boolean | null;
} = {
  // null은 미확정 상태이며 날짜 종료일이 있는 View를 임의로 해석하지 않습니다.
  dateEndInclusive: null,
};
