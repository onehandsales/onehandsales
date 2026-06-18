# G02-FE-INTEGRATED-SEARCH 상세 명세

## 1. 목적

Frontend가 Backend 통합검색 API를 실제 사용자 흐름에 맞게 사용하고, 검색 결과 클릭 시 상세 화면으로 이동할 수 있게 한다.

## 2. 포함 범위

- 기존 `features/search` API client와 Backend 응답 계약 확인
- 검색 결과 label, loading, empty, error 상태 확인
- `targetPath` navigation 확인
- 일정 결과 이동을 위한 `/schedules/:scheduleId` route와 일정 상세 화면 추가

## 3. 제외 범위

- Backend 코드 수정
- Admin Web 검색
- 검색 전용 페이지
- 최근 검색어 저장

## 4. API 연결

- `GET /api/search`
- 일정 상세 이동 후 `GET /api/schedules/{scheduleId}`

## 5. 완료 기준

- User Web typecheck/build가 통과한다.
- 회사/담당자/제품/딜/일정/회의록 결과 선택 시 상세 화면으로 이동한다.
- 일정 단건 route가 `GET /api/schedules/{scheduleId}`를 사용한다.
- loading, empty, error 상태가 실제 검색 UI에서 깨지지 않는다.

## 6. 이번 작업 상태

in_progress

부분 완료:

- `/schedules/:scheduleId` route와 일정 상세 화면은 추가되어 있다.
- 일정 상세 화면은 `GET /api/schedules/{scheduleId}`를 사용한다.

남은 작업:

- 상단 통합검색 API 호출 end-to-end 검수
- 도메인별 결과 label/group 표시 검수
- 모든 `targetPath` 이동 검수
- loading, empty, error 상태 검수
- User Web build와 필요한 smoke/e2e 재검증
