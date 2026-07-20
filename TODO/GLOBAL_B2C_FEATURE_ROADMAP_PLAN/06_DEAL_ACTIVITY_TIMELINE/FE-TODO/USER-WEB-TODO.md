# User Web TODO

상태: Draft

## 화면 후보

- `/app/deals/:dealId`
- Deal detail panel activity section
- `/app/deals`
- `/app/companies`
- `/app/contacts`
- `/app/products`
- GlobalSearch

## 작업 후보

- timeline UI
- activity type filter
- 수동 activity 생성
- 단계 변경 activity 표시
- 회의록/일정 linked activity 표시
- loading/empty/error state
- 딜 목록 products summary 표시 후보
- 담당자 목록 dealCount 표시 후보
- 최신 활동/다음 행동 summary 표시 후보
- 고급 필터/정렬 UI
- page size/pagination UI 계약 정리
- 딜 가능성/확률 표시/수정 UX
- 다음 행동 완료/미루기/일정 추가 UX

## 검증 후보

- 긴 activity 내용이 layout을 깨지 않는다.
- private memo와 일반 activity가 섞이지 않는다.
- mobile에서 timeline이 읽힌다.
- summary/count는 API 응답에 있는 값만 표시한다.
- page size와 pagination이 새로고침/필터 변경 후 일관된다.
- 고급 필터가 mobile에서 숨겨지거나 겹치지 않는다.
