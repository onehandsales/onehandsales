# Integrated Search Goal Work Order

## 1. 목표 순서

| 순서 | Goal | 담당 | 상태 | 선행 조건 |
|---:|---|---|---|---|
| 1 | `G01-BE-INTEGRATED-SEARCH` | Backend | completed | 기존 Company, Contact, Product, Deal, Schedule, MeetingNote API/DB 구현 |
| 2 | `G02-FE-INTEGRATED-SEARCH` | Frontend | in_progress | `G01-BE-INTEGRATED-SEARCH` 완료 |

## 2. G01-BE-INTEGRATED-SEARCH

목적:

- `GET /api/search`를 구현한다.
- Frontend가 도메인별 검색 결과와 상세 이동 경로를 받을 수 있게 한다.

완료 조건:

- `BE/src/modules/search`가 네 계층 구조로 추가된다.
- `AppModule`에 `SearchModule`이 등록된다.
- 모든 검색 query가 `userId` ownership 필터를 가진다.
- API 응답이 `SearchAllResponse` 계약과 일치한다.
- Backend typecheck, lint, search 관련 test가 통과한다.

## 3. G02-FE-INTEGRATED-SEARCH

목적:

- 기존 User Web search feature를 실제 Backend API와 최종 연결한다.
- 일정 검색 결과 이동을 위해 `/schedules/:scheduleId` 상세 route를 추가한다.

완료 조건:

- 검색 입력은 `q` 두 글자 이상에서만 API를 호출한다.
- 결과 선택 시 `targetPath`로 이동한다.
- 일정 단건 상세 화면이 존재한다.
- User Web typecheck/build가 통과한다.
- 회사/담당자/제품/딜/일정/회의록 결과 선택이 실제 화면에서 모두 검수된다.
- loading, empty, error 상태가 실제 UI에서 깨지지 않는다.

## 4. 이번 작업 상태

Backend goal은 completed다. Frontend goal은 일정 상세 route 추가까지 일부 진행되었지만, 상단 통합검색 최종 연결과 end-to-end UX 검수가 남아 있어 계획 전체는 아직 active 상태다.
