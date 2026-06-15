# Meeting Note Goal Work Order

## 1. 목표 순서

| 순서 | Goal | 담당 | 상태 | 선행 조건 |
|---:|---|---|---|---|
| 1 | `G01-BE-MEETING-NOTE-DOMAIN` | Backend | completed | Auth/User, Company, Contact, Product, Deal, User.timeZone 구현 완료 |
| 2 | `G02-FE-MEETING-NOTE-PAGES` | Frontend | completed | G01 완료 |
| 3 | `G03-MEETING-NOTE-INTEGRATION` | Common | completed | G01, G02 완료 |

## 2. G01-BE-MEETING-NOTE-DOMAIN

목적:

- MeetingNote DB 모델과 User API를 구현한다.
- Frontend가 N:N 회의록 화면을 실제 API로 연결할 수 있게 한다.

읽을 문서:

- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/README.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/GOAL-SPECS/G01-BE-MEETING-NOTE-DOMAIN.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/BE-TODO/G01-BE-MEETING-NOTE-DOMAIN.goal.md`

완료 조건:

- Prisma schema와 migration에 MeetingNote 모델 6개가 추가된다.
- `meeting-note` Backend module이 기존 Clean Architecture 패턴으로 추가된다.
- API 6개가 계약대로 구현된다.
- 생성/수정 transaction과 연결 row snapshot 저장이 구현된다.
- 회사/담당자는 1개 이상 validation한다.
- 제품/딜은 선택 연결로 처리한다.
- Backend typecheck, lint, test, build가 통과한다.

## 3. G02-FE-MEETING-NOTE-PAGES

목적:

- User Web 회의록 화면을 새 Backend 계약과 연결한다.

읽을 문서:

- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/README.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/GOAL-SPECS/G02-FE-MEETING-NOTE-PAGES.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/FE-TODO/G02-FE-MEETING-NOTE-PAGES.goal.md`

완료 조건:

- 기존 meeting-note feature가 단일 `dealId`, `stageText`, `hasNext`, request `timeZone`, `rawText` 계약을 사용하지 않는다.
- 목록/필터/상세/생성/수정 화면이 API 계약과 맞는다.
- 생성/수정 form에서 회사와 담당자를 1개 이상 요구한다.
- 제품과 딜은 선택 연결로 표시한다.
- User Web typecheck, lint, build가 통과한다.

## 4. G03-MEETING-NOTE-INTEGRATION

목적:

- Backend와 Frontend가 같은 계약으로 동작하는지 통합 검증하고 작업 완료 기록을 남긴다.

읽을 문서:

- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/GOAL-SPECS/G03-MEETING-NOTE-INTEGRATION.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/G03-MEETING-NOTE-INTEGRATION.goal.md`

완료 조건:

- 수동 생성, 목록 조회, 상세 조회, 수정, 필터 조합이 실제 화면에서 확인된다.
- API 계약과 실제 DTO가 맞는다.
- `TODO_LOG`에 작업 결과와 검증 결과가 남는다.

## 5. 병렬 처리 기준

- G02는 타입 초안과 화면 구조 정리는 선행할 수 있지만, 완료 판정은 G01 API 구현 후 한다.
- API field가 바뀌면 `COMMON/API-SPEC/MEETING_NOTE_API.md`를 먼저 갱신한다.
- DB nullable 정책이 바뀌면 `BE-TODO/DB-SCHEMA.md`와 API response nullable 표를 함께 갱신한다.
