# /goal G03-MEETING-NOTE-INTEGRATION

## 1. Goal

MeetingNote Backend와 User Web 연동을 통합 검증하고 완료 기록을 남긴다.

## 2. 선행 조건

- `G01-BE-MEETING-NOTE-DOMAIN` 완료
- `G02-FE-MEETING-NOTE-PAGES` 완료

## 3. 먼저 읽을 문서

- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/README.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/GOAL-SPECS/G03-MEETING-NOTE-INTEGRATION.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/PLANNING-REVIEW.md`

## 4. 작업 체크리스트

- [x] Backend와 Frontend가 동일한 MeetingNote API 계약을 사용하도록 타입과 DTO를 대조한다.
- [x] 수동 회의록 생성/수정에서 회사/담당자 필수와 제품/딜 선택 연결을 BE service test와 FE form 변환으로 확인한다.
- [x] 목록 query가 `page`, `companyIds`, `contactIds`, `meetingDate`, `sort`를 사용하는지 확인한다.
- [x] 목록 pagination이 `totalPages` 기준이고 `hasNext` 의존성이 남지 않았는지 확인한다.
- [x] 회사 필터가 `GET /api/meeting-notes/filter-companies`를 사용하도록 확인한다.
- [x] 담당자 필터가 `GET /api/meeting-notes/filter-contacts`를 사용하도록 확인한다.
- [x] 상세 화면 타입이 snapshot 배열과 현재 연결 정보를 받을 수 있는지 확인한다.
- [x] 수정에서 제품/딜 빈 배열 제거 동작이 request 변환에 반영됐는지 확인한다.
- [x] request body에 `timeZone`, `rawText`, `stageText`, 단일 `dealId`가 없는지 확인한다.
- [x] BE 검증 명령을 재실행한다.
- [x] FE 검증 명령을 재실행한다.
- [x] `TODO_LOG` 완료 기록을 작성한다.

## 5. Acceptance Criteria

- 생성, 목록, 상세, 수정, 필터 계약이 BE 테스트, FE 타입/폼 변환, typecheck/lint/build에서 통과한다.
- API 계약과 FE type이 일치한다.
- AI/STT, 삭제/복구, Admin, DealActivity는 후속 범위로 남아 있다.
- 완료 로그에 검증 명령과 결과가 남아 있다.

## 6. 완료 기록

완료 후 아래 경로에 작업 로그를 작성한다.

```text
TODO_LOG/YYYY-MM-DD/G03_MEETING_NOTE_INTEGRATION/WORK_LOG.md
```
